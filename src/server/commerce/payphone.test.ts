import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import {
  createPayphoneService,
  reconcileExpiredPayphoneReservations,
  releaseReservationsForAttempt,
  validatePayphoneOrderInput,
} from "./payphone";
import {
  calculatePayphoneTaxBreakdown,
  calculatePayphoneCommission,
} from "./payphone-financials";
import { hash } from "./order-access";
import { isolatedCommerceDatabase } from "./test-database";
import { getPayphoneConfig, type PayphoneConfig } from "./payphone-config";
import { Prisma } from "@/generated/prisma/client";

let database: Awaited<ReturnType<typeof isolatedCommerceDatabase>>;
const guest = hash("isolated-payphone-guest");
const customer = {
  firstName: "María",
  lastName: "Pérez",
  email: "maria@example.test",
  phone: "0991234567",
  province: "Pichincha",
  area: "quito",
  address: "Av. República y Amazonas",
  deliveryInstructions: "Piso 4",
};

const dummyConfig: PayphoneConfig = {
  token: "test_payphone_bearer_token",
  storeId: "store_123",
  confirmUrl: "https://mock.payphone.local/api/confirm",
  commissionRate: 5.75,
  commissionVatRate: 15,
  productVatRate: 15,
  shippingVatRate: 0,
  reservationTimeoutMinutes: 15,
};

const input = (quantity = 1, extra = {}) => ({
  customer,
  items: [{ id: "lemon", slug: "limon", quantity }],
  paymentMethod: "CARD",
  marketingConsent: false,
  ...extra,
});

before(async () => {
  database = await isolatedCommerceDatabase();
});

after(async () => {
  if (database) await database.close();
});

beforeEach(async () => {
  await database.memory.exec(
    'TRUNCATE "StockReservation","PayphonePaymentAttempt","MarketingConsentEvent","MarketingContact","InventoryMovement","OrderNote","Payment","OrderItem","Order","AdminUser","Product" RESTART IDENTITY CASCADE'
  );
  await database.client.product.createMany({
    data: [
      { id: "lemon", slug: "limon", name: "USCHH Limón", flavor: "LIMÓN", price: "15.00", stock: 5 },
      { id: "orange", slug: "mandarina", name: "USCHH Mandarina", flavor: "MANDARINA", price: "15.00", stock: 5 },
    ],
  });
});

test("PAYPHONE_ENABLED feature flag: disabled by default unless explicitly set to 'true'", () => {
  const originalEnabled = process.env.PAYPHONE_ENABLED;
  const originalToken = process.env.PAYPHONE_TOKEN;
  try {
    process.env.PAYPHONE_TOKEN = "test_token";

    delete process.env.PAYPHONE_ENABLED;
    assert.equal(getPayphoneConfig(), null);

    process.env.PAYPHONE_ENABLED = "false";
    assert.equal(getPayphoneConfig(), null);

    process.env.PAYPHONE_ENABLED = "true";
    const config = getPayphoneConfig();
    assert.ok(config);
    assert.equal(config.token, "test_token");
  } finally {
    if (originalEnabled !== undefined) process.env.PAYPHONE_ENABLED = originalEnabled;
    else delete process.env.PAYPHONE_ENABLED;
    if (originalToken !== undefined) process.env.PAYPHONE_TOKEN = originalToken;
    else delete process.env.PAYPHONE_TOKEN;
  }
});

test("Ecuadorian VAT calculations: 15% VAT included in $15.00 product price matches exactly", () => {
  const breakdown = calculatePayphoneTaxBreakdown({
    items: [{ price: new Prisma.Decimal("15.00"), quantity: 1 }],
    shippingAmount: new Prisma.Decimal("0.00"),
    productVatRate: 15,
    shippingVatRate: 0,
  });

  // Exactly as verified:
  // Total: 1500 cents
  // Taxable base: 1304 cents
  // VAT: 196 cents
  // amountWithoutTax: 0, amountWithTax: 1304, tax: 196
  assert.equal(breakdown.amount, 1500);
  assert.equal(breakdown.amountWithTax, 1304);
  assert.equal(breakdown.tax, 196);
  assert.equal(breakdown.amountWithoutTax, 0);
  assert.equal(breakdown.service, 0);
  assert.equal(breakdown.tip, 0);
  assert.equal(
    breakdown.amount,
    breakdown.amountWithoutTax + breakdown.amountWithTax + breakdown.tax + breakdown.service + breakdown.tip
  );
  assert.equal(breakdown.taxableBaseDecimal.toFixed(2), "13.04");
  assert.equal(breakdown.productVatDecimal.toFixed(2), "1.96");
});

test("Ecuadorian VAT calculations: multiple products and shipping handle rounding with zero cent loss", () => {
  const breakdown = calculatePayphoneTaxBreakdown({
    items: [
      { price: new Prisma.Decimal("15.00"), quantity: 2 },
      { price: new Prisma.Decimal("15.00"), quantity: 1 },
    ],
    shippingAmount: new Prisma.Decimal("5.00"),
    productVatRate: 15,
    shippingVatRate: 0, // Tax-exempt shipping
  });

  // Products: 3 * $15 = $45 = 4500 cents. Base: round(4500/1.15) = 3913. Tax: 587.
  // Shipping: 500 cents exempt -> amountWithoutTax: 500.
  // Total: 5000 cents.
  assert.equal(breakdown.amount, 5000);
  assert.equal(breakdown.amountWithTax, 3913);
  assert.equal(breakdown.tax, 587);
  assert.equal(breakdown.amountWithoutTax, 500);
  assert.equal(
    breakdown.amount,
    breakdown.amountWithoutTax + breakdown.amountWithTax + breakdown.tax + breakdown.service + breakdown.tip
  );
});

test("PayPhone commission calculation: 5.75% commission + 15% VAT on commission", () => {
  const comm = calculatePayphoneCommission({
    totalAmountInCents: 1500, // $15.00
    commissionRate: 5.75,
    commissionVatRate: 15,
  });

  // Base: 1500 * 5.75% = 86.25 -> 86 cents ($0.86)
  // VAT on comm: 86 * 15% = 12.9 -> 13 cents ($0.13)
  // Total commission: 86 + 13 = 99 cents (~$0.99)
  // Net settlement: 1500 - 99 = 1401 cents ($14.01)
  assert.equal(comm.commissionCents, 86);
  assert.equal(comm.commissionVatCents, 13);
  assert.equal(comm.totalCommissionCents, 99);
  assert.equal(comm.netSettlementCents, 1401);
  assert.equal(comm.estimatedCommissionDecimal.toFixed(2), "0.86");
  assert.equal(comm.estimatedCommissionVatDecimal.toFixed(2), "0.13");
  assert.equal(comm.estimatedSettlementDecimal.toFixed(2), "14.01");
});

test("validatePayphoneOrderInput validates fields, methods and items", () => {
  assert.doesNotThrow(() => validatePayphoneOrderInput(input(1)));
  assert.throws(() => validatePayphoneOrderInput(input(1, { paymentMethod: "BANK_TRANSFER" })));
  assert.throws(() => validatePayphoneOrderInput(input(1, { customer: { ...customer, email: "invalid" } })));
  assert.throws(() => validatePayphoneOrderInput(input(1, { customer: { ...customer, phone: "123" } })));
  assert.throws(() => validatePayphoneOrderInput(input(1, { customer: { ...customer, area: "guayaquil" } })));
  assert.throws(() => validatePayphoneOrderInput(input(6)));
});

test("prepare creates pending attempt, reserves stock without permanent deduction, and returns 15% VAT breakdown", async () => {
  const service = createPayphoneService(database.client, () => dummyConfig);
  const result = await service.prepare(input(1), guest);

  assert.equal(result.token, "test_payphone_bearer_token");
  assert.equal(result.amount, 1500); // $15.00 = 1500 cents
  assert.equal(result.amountWithTax, 1304);
  assert.equal(result.tax, 196);
  assert.equal(result.amountWithoutTax, 0);
  assert.equal(result.currency, "USD");
  assert.equal(result.defaultMethod, "card");
  assert.ok(result.clientTransactionId.length <= 50);

  // Requirement: No Order is created and physical inventory is NOT permanently deducted yet
  assert.equal(await database.client.order.count(), 0);
  const prod = await database.client.product.findUniqueOrThrow({ where: { id: "lemon" } });
  assert.equal(prod.stock, 5); // Physical stock remains 5

  // Requirement: StockReservation is created with ACTIVE status
  const reservation = await database.client.stockReservation.findFirstOrThrow({
    where: { clientTransactionId: result.clientTransactionId },
  });
  assert.equal(reservation.status, "ACTIVE");
  assert.equal(reservation.quantity, 1);
  assert.equal(reservation.productId, "lemon");

  // Payment attempt created with financial snapshots
  const attempt = await database.client.payphonePaymentAttempt.findUniqueOrThrow({
    where: { clientTransactionId: result.clientTransactionId },
  });
  assert.equal(attempt.status, "PENDING");
  assert.equal(attempt.amountInCents, 1500);
  assert.equal(attempt.taxableBase?.toFixed(2), "13.04");
  assert.equal(attempt.productVat?.toFixed(2), "1.96");
  assert.equal(attempt.estimatedCommission?.toFixed(2), "0.86");
  assert.equal(attempt.estimatedCommissionVat?.toFixed(2), "0.13");
  assert.equal(attempt.estimatedSettlement?.toFixed(2), "14.01");
  assert.equal(attempt.orderId, null);
});

test("prepare rejects when concurrent reservations exhaust available stock", async () => {
  const service = createPayphoneService(database.client, () => dummyConfig);

  // Initial stock is 5. Customer 1 reserves 3 units.
  await service.prepare(input(3), guest);

  // Customer 2 attempts to reserve 3 units (5 available - 3 reserved = 2 left < 3).
  await assert.rejects(
    () => service.prepare(input(3), guest),
    /Uno de los productos ya no está disponible en la cantidad solicitada/
  );

  // Customer 2 can still reserve 2 units.
  const prep2 = await service.prepare(input(2), guest);
  assert.ok(prep2.clientTransactionId);
});

test("confirm handles declined or canceled transactions by releasing reservations without creating orders", async () => {
  const mockFetch: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        statusCode: 2,
        transactionStatus: "Canceled",
        clientTransactionId: "dummy",
        message: "El usuario canceló la transacción.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  const service = createPayphoneService(database.client, () => dummyConfig, mockFetch);
  const prep = await service.prepare(input(1), guest);

  await assert.rejects(
    () => service.confirm({ id: 99999, clientTransactionId: prep.clientTransactionId }),
    /canceló|no fue aprobado/
  );

  assert.equal(await database.client.order.count(), 0);
  const attempt = await database.client.payphonePaymentAttempt.findUniqueOrThrow({
    where: { clientTransactionId: prep.clientTransactionId },
  });
  assert.equal(attempt.status, "CANCELED");

  // Reservation is marked RELEASED
  const reservation = await database.client.stockReservation.findFirstOrThrow({
    where: { clientTransactionId: prep.clientTransactionId },
  });
  assert.equal(reservation.status, "RELEASED");
  assert.ok(reservation.releasedAt);

  // Stock remained intact
  const prod = await database.client.product.findUniqueOrThrow({ where: { id: "lemon" } });
  assert.equal(prod.stock, 5);
});

test("reconciliation releases expired reservations and restores available stock", async () => {
  const service = createPayphoneService(database.client, () => dummyConfig);
  const prep = await service.prepare(input(5), guest);

  // All 5 units are reserved. Another customer cannot prepare.
  await assert.rejects(() => service.prepare(input(1), guest), /no está disponible/);

  // Simulate reservation expiration (past expiresAt)
  const past = new Date(Date.now() - 30 * 60 * 1000);
  await database.client.stockReservation.updateMany({
    where: { clientTransactionId: prep.clientTransactionId },
    data: { expiresAt: past },
  });

  const reconciledCount = await reconcileExpiredPayphoneReservations(database.client);
  assert.equal(reconciledCount, 1);

  // Stock is now available for new customers
  const newPrep = await service.prepare(input(5), guest);
  assert.ok(newPrep.clientTransactionId);
});

test("confirm approved payment deducts physical stock exactly once, creates paid order, and records SALE audit", async () => {
  const mockFetch: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        statusCode: 3,
        transactionStatus: "Approved",
        clientTransactionId: "dummy",
        transactionId: 123456,
        authorizationCode: "AUTH-789",
        amount: 3000, // 2 * $15.00 = $30.00
        currency: "USD",
        cardBrand: "Visa",
        lastDigits: "4242",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  const service = createPayphoneService(database.client, () => dummyConfig, mockFetch);
  const prep = await service.prepare(input(2), guest);

  const confirmation = await service.confirm({
    id: 123456,
    clientTransactionId: prep.clientTransactionId,
  });

  assert.equal(confirmation.success, true);
  assert.equal(confirmation.alreadyProcessed, false);
  assert.equal(confirmation.orderNumber, "USCHH-000001");

  // Stock deducted exactly once on approved payment: 5 - 2 = 3
  const prod = await database.client.product.findUniqueOrThrow({ where: { id: "lemon" } });
  assert.equal(prod.stock, 3);

  // Reservation marked CONFIRMED
  const reservation = await database.client.stockReservation.findFirstOrThrow({
    where: { clientTransactionId: prep.clientTransactionId },
  });
  assert.equal(reservation.status, "CONFIRMED");
  assert.ok(reservation.confirmedAt);

  // Order created with PAID and UNFULFILLED fulfillment status
  const order = await database.client.order.findUniqueOrThrow({
    where: { accessId: confirmation.accessId! },
    include: { items: true, payments: true },
  });
  assert.equal(order.status, "PAID");
  assert.equal(order.fulfillmentStatus, "UNFULFILLED");
  assert.equal(order.total.toFixed(2), "30.00");
  assert.ok(order.paidAt);

  // Payment created with CARD and PAYPHONE provider
  assert.equal(order.payments.length, 1);
  const payment = order.payments[0];
  assert.equal(payment.method, "CARD");
  assert.equal(payment.status, "PAID");
  assert.equal(payment.provider, "PAYPHONE");
  assert.equal(payment.providerReference, "123456");
  assert.equal(payment.idempotencyKey, prep.clientTransactionId);

  // Inventory movement SALE recorded with order item linkage
  const movement = await database.client.inventoryMovement.findFirstOrThrow({
    where: { productId: "lemon" },
  });
  assert.equal(movement.type, "SALE");
  assert.equal(movement.delta, -2);
  assert.equal(movement.stockAfter, 3);
  assert.ok(movement.orderItemId);

  // Attempt updated to APPROVED
  const attempt = await database.client.payphonePaymentAttempt.findUniqueOrThrow({
    where: { clientTransactionId: prep.clientTransactionId },
  });
  assert.equal(attempt.status, "APPROVED");
  assert.equal(attempt.authorizationCode, "AUTH-789");
  assert.equal(attempt.cardBrand, "Visa");
  assert.equal(attempt.lastDigits, "4242");
  assert.equal(attempt.orderId, order.id);

  // Idempotency: Repeating confirmation returns existing order without duplicate deduction
  const repeat = await service.confirm({
    id: 123456,
    clientTransactionId: prep.clientTransactionId,
  });
  assert.equal(repeat.success, true);
  assert.equal(repeat.alreadyProcessed, true);
  assert.equal(repeat.accessId, confirmation.accessId);
  assert.equal((await database.client.product.findUniqueOrThrow({ where: { id: "lemon" } })).stock, 3);
  assert.equal(await database.client.order.count(), 1);
});

test("Requirement 4: Approved payment when inventory becomes unavailable creates order with EXCEPTION_INSUFFICIENT_STOCK", async () => {
  const mockFetch: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        statusCode: 3,
        transactionStatus: "Approved",
        clientTransactionId: "dummy",
        transactionId: 777888,
        authorizationCode: "AUTH-STOCK-DEPLETED",
        amount: 1500,
        currency: "USD",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  const service = createPayphoneService(database.client, () => dummyConfig, mockFetch);
  const prep = await service.prepare(input(1), guest);

  // Simulate extreme edge case: Reservation expired and another channel bought all remaining stock
  await releaseReservationsForAttempt(database.client, prep.clientTransactionId);
  await database.client.product.update({
    where: { id: "lemon" },
    data: { stock: 0 },
  });

  // Customer returns with approved payment from PayPhone
  const confirmation = await service.confirm({
    id: 777888,
    clientTransactionId: prep.clientTransactionId,
  });

  assert.equal(confirmation.success, true);

  // Order created with EXCEPTION_INSUFFICIENT_STOCK and PAID status (payment is preserved!)
  const order = await database.client.order.findUniqueOrThrow({
    where: { accessId: confirmation.accessId! },
    include: { notes: true, payments: true },
  });
  assert.equal(order.status, "PAID");
  assert.equal(order.fulfillmentStatus, "EXCEPTION_INSUFFICIENT_STOCK");
  assert.equal(order.payments[0].status, "PAID");

  // Stock was not made negative
  const prod = await database.client.product.findUniqueOrThrow({ where: { id: "lemon" } });
  assert.equal(prod.stock, 0);

  // Admin alert note created
  assert.ok(order.notes.some((n: { content: string }) => n.content.includes("ALERTA ADMINISTRATIVA")));
});

