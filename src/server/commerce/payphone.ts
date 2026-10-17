import "server-only";
import { randomBytes } from "node:crypto";
import { Prisma, type PrismaClient, type FulfillmentStatus } from "@/generated/prisma/client";
import { CheckoutError } from "@/lib/checkout/validation";
import { CONSENT_TEXT, CONSENT_VERSION, DELIVERY_AREAS } from "@/lib/checkout/config";
import { assertFlavorQuantities, calculateShipping, formatOrderNumber } from "./policies";
import { sendOrderConfirmationEmail } from "./email";
import type { PayphoneConfig } from "./payphone-config";
import {
  calculatePayphoneTaxBreakdown,
  calculatePayphoneCommission,
} from "./payphone-financials";

export function validatePayphoneOrderInput(value: unknown) {
  if (!value || typeof value !== "object") throw new CheckoutError("INVALID", "Revisa los datos del pedido.");
  const body = value as Record<string, unknown>;
  const source = body.customer;
  if (!source || typeof source !== "object") throw new CheckoutError("CUSTOMER", "Completa tus datos de entrega.");
  const customer = source as Record<string, unknown>;
  const labels: Record<string, string> = {
    firstName: "el nombre",
    lastName: "el apellido",
    idNumber: "la cédula, RUC o pasaporte",
    email: "el email",
    phone: "el teléfono",
    address: "la dirección",
    deliveryInstructions: "las instrucciones de entrega",
  };
  const text = (field: string, max: number, required = true) => {
    const val = customer[field];
    const controls = field === "deliveryInstructions" ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/ : /[\u0000-\u001f]/;
    if (typeof val !== "string" || val.trim().length > max || (required && !val.trim()) || controls.test(val)) {
      throw new CheckoutError("CUSTOMER", `Revisa ${labels[field] ?? "los datos de entrega"}.`);
    }
    return val.trim();
  };
  const rawIdNumber = customer.idNumber === undefined || customer.idNumber === null ? "" : text("idNumber", 30, false);
  if (rawIdNumber && (!/^[A-Za-z0-9 .-]{5,30}$/.test(rawIdNumber) || rawIdNumber.replace(/[^A-Za-z0-9]/g, "").length < 5)) {
    throw new CheckoutError("ID_NUMBER", "Introduce un número de cédula, RUC o pasaporte válido.");
  }
  const email = text("email", 254).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new CheckoutError("EMAIL", "Introduce un email válido.");
  const phone = text("phone", 30);
  if (!/^[0-9+() -]{7,30}$/.test(phone)) throw new CheckoutError("PHONE", "Introduce un teléfono válido.");
  const areaId = typeof customer.area === "string" ? customer.area.trim() : "";
  const area = DELIVERY_AREAS.find((a) => a.id === areaId);
  if (!area) throw new CheckoutError("AREA", "Selecciona una zona de entrega válida.");

  if (body.paymentMethod !== "CARD") {
    throw new CheckoutError("PAYMENT", "El método de pago seleccionado debe ser tarjeta.");
  }

  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 5) {
    throw new CheckoutError("ITEMS", "Revisa los productos del carrito.");
  }
  const ids = new Set<string>();
  const items = body.items
    .map((val) => {
      if (!val || typeof val !== "object") throw new CheckoutError("ITEMS", "Producto no válido.");
      const item = val as Record<string, unknown>;
      if (
        typeof item.id !== "string" ||
        !/^[a-zA-Z0-9_-]{1,128}$/.test(item.id) ||
        typeof item.slug !== "string" ||
        !/^[a-z0-9-]{1,100}$/.test(item.slug) ||
        typeof item.quantity !== "number" ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 5 ||
        ids.has(item.id)
      ) {
        throw new CheckoutError("QUANTITY", "Máximo 5 unidades por sabor; revisa las cantidades.");
      }
      ids.add(item.id);
      return { id: item.id, slug: item.slug, quantity: item.quantity };
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  return {
    customer: {
      firstName: text("firstName", 80),
      lastName: text("lastName", 80),
      idNumber: rawIdNumber || null,
      email,
      phone,
      province: area.province,
      city: area.label,
      area: area.id,
      address: text("address", 500),
      deliveryInstructions: customer.deliveryInstructions === undefined ? "" : text("deliveryInstructions", 500, false),
    },
    items,
    paymentMethod: "CARD" as const,
    marketingConsent: body.marketingConsent === true,
  };
}

export type PayphoneConfirmApiResponse = {
  statusCode: number;
  transactionStatus: string;
  clientTransactionId: string;
  authorizationCode?: string;
  transactionId?: number | string;
  email?: string;
  phoneNumber?: string;
  amount: number;
  currency?: string;
  cardBrand?: string;
  lastDigits?: string;
  message?: string;
  [key: string]: unknown;
};

export function createPayphoneService(
  db: PrismaClient,
  getConfig: () => PayphoneConfig | null,
  fetchFn: typeof fetch = fetch
) {
  async function prepare(value: unknown, guestHash?: string) {
    const config = getConfig();
    if (!config) throw new CheckoutError("PAYPHONE", "El pago con tarjeta no está disponible actualmente.", 503);

    const input = validatePayphoneOrderInput(value);
    const ids = input.items.map((i) => i.id);

    const products = await db.product.findMany({ where: { id: { in: ids } } });
    const lines = input.items.map((item) => {
      const product = products.find((p) => p.id === item.id && p.slug === item.slug);
      if (!product || !product.active || product.currency !== "USD") {
        throw new CheckoutError("STOCK", "Uno de los productos ya no está disponible.", 409);
      }
      return { product, quantity: item.quantity, lineTotal: product.price.mul(item.quantity) };
    });

    try {
      assertFlavorQuantities(lines.map((l) => ({ flavor: l.product.flavor, quantity: l.quantity })));
    } catch {
      throw new CheckoutError("QUANTITY", "Máximo 5 unidades por sabor.");
    }

    if (new Set(lines.map((l) => l.product.flavor)).size !== lines.length) {
      throw new CheckoutError("ITEMS", "Revisa los productos del carrito.");
    }

    const subtotal = lines.reduce((total, l) => total.plus(l.lineTotal), new Prisma.Decimal(0));
    const shipping = calculateShipping(subtotal);

    // Calculate official Ecuadorian tax breakdown
    const taxBreakdown = calculatePayphoneTaxBreakdown({
      items: lines.map((l) => ({
        price: l.product.price,
        quantity: l.quantity,
      })),
      shippingAmount: shipping.shippingAmount ?? undefined,
      productVatRate: config.productVatRate,
      shippingVatRate: config.shippingVatRate,
    });

    // Calculate PayPhone transaction commission snapshot (for internal accounting)
    const commissionBreakdown = calculatePayphoneCommission({
      totalAmountInCents: taxBreakdown.amount,
      commissionRate: config.commissionRate,
      commissionVatRate: config.commissionVatRate,
    });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + config.reservationTimeoutMinutes * 60 * 1000);
    const clientTransactionId = `USCHH-${Date.now().toString(36)}-${randomBytes(4).toString("hex")}`.slice(0, 50);

    // Concurrency-safe atomic reservation within a single transaction
    await db.$transaction(
      async (tx) => {
        // Lock product rows in deterministic order to prevent race conditions & deadlocks
        await tx.$queryRaw(
          Prisma.sql`SELECT "id" FROM "Product" WHERE "id" IN (${Prisma.join(ids)}) ORDER BY "id" FOR UPDATE`
        );
        const lockedProducts = await tx.product.findMany({ where: { id: { in: ids } } });

        // Calculate available stock excluding active reservations
        for (const line of lines) {
          const prod = lockedProducts.find((p) => p.id === line.product.id);
          if (!prod || !prod.active) {
            throw new CheckoutError("STOCK", "Uno de los productos ya no está disponible.", 409);
          }
          const activeRes = await tx.stockReservation.aggregate({
            where: {
              productId: line.product.id,
              status: "ACTIVE",
              expiresAt: { gt: now },
            },
            _sum: { quantity: true },
          });
          const reservedQty = activeRes._sum.quantity ?? 0;
          const availableStock = prod.stock - reservedQty;
          if (availableStock < line.quantity) {
            throw new CheckoutError("STOCK", "Uno de los productos ya no está disponible en la cantidad solicitada.", 409);
          }
        }

        const attempt = await tx.payphonePaymentAttempt.create({
          data: {
            clientTransactionId,
            status: "PENDING",
            amountInCents: taxBreakdown.amount,
            subtotal,
            shippingMode: shipping.shippingMode,
            shippingAmount: shipping.shippingAmount,
            total: shipping.total,
            currency: "USD",
            customer: input.customer,
            items: lines.map((line) => ({
              productId: line.product.id,
              productName: line.product.name,
              flavor: line.product.flavor,
              unitPrice: line.product.price.toFixed(2),
              quantity: line.quantity,
              lineTotal: line.lineTotal.toFixed(2),
            })),
            marketingConsent: input.marketingConsent,
            guestAccessHash: guestHash ?? null,
            expiresAt,
            reservedAt: now,
            taxableBase: taxBreakdown.taxableBaseDecimal,
            productVat: taxBreakdown.productVatDecimal,
            estimatedCommission: commissionBreakdown.estimatedCommissionDecimal,
            estimatedCommissionVat: commissionBreakdown.estimatedCommissionVatDecimal,
            estimatedSettlement: commissionBreakdown.estimatedSettlementDecimal,
          },
        });

        // Create atomic stock reservations without permanently deducting physical inventory
        for (const line of lines) {
          await tx.stockReservation.create({
            data: {
              productId: line.product.id,
              quantity: line.quantity,
              payphoneAttemptId: attempt.id,
              clientTransactionId,
              status: "ACTIVE",
              expiresAt,
            },
          });
        }
      },
      { timeout: 15000 }
    );

    const phoneDigits = input.customer.phone.replace(/\D/g, "");
    const formattedPhone = input.customer.phone.startsWith("+")
      ? input.customer.phone
      : phoneDigits.startsWith("593")
      ? `+${phoneDigits}`
      : `+593${phoneDigits.replace(/^0+/, "")}`;

    return {
      token: config.token,
      clientTransactionId,
      amount: taxBreakdown.amount,
      amountWithoutTax: taxBreakdown.amountWithoutTax,
      amountWithTax: taxBreakdown.amountWithTax,
      tax: taxBreakdown.tax,
      service: taxBreakdown.service,
      tip: taxBreakdown.tip,
      currency: "USD",
      storeId: config.storeId,
      reference: `USCHH - ${clientTransactionId}`,
      lang: "es",
      defaultMethod: "card",
      email: input.customer.email,
      phoneNumber: formattedPhone,
    };
  }

  async function confirm(params: { id: number | string; clientTransactionId: string }) {
    const config = getConfig();
    if (!config) throw new CheckoutError("PAYPHONE", "El servicio de confirmación no está configurado.", 503);

    if (!params.id || !params.clientTransactionId) {
      throw new CheckoutError("PARAMS", "Faltan parámetros requeridos de confirmación (id / clientTransactionId).", 400);
    }

    const clientTxId = String(params.clientTransactionId).trim();
    const id = Number(params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new CheckoutError("PARAMS", "ID de transacción de PayPhone inválido.", 400);
    }

    const existingAttempt = await db.payphonePaymentAttempt.findUnique({
      where: { clientTransactionId: clientTxId },
      include: { order: true },
    });

    if (!existingAttempt) {
      throw new CheckoutError("ATTEMPT_NOT_FOUND", "No se encontró el intento de pago para esta transacción.", 404);
    }

    // Idempotency: If already confirmed and linked to an existing order, return it immediately
    if (existingAttempt.status === "APPROVED" && existingAttempt.order) {
      return {
        success: true,
        alreadyProcessed: true,
        orderId: existingAttempt.order.id,
        orderNumber: formatOrderNumber(existingAttempt.order.number),
        accessId: existingAttempt.order.accessId ?? undefined,
        url: `/pedido/${encodeURIComponent(existingAttempt.order.accessId ?? "")}`,
      };
    }

    // Call official PayPhone Payment Box confirmation API
    let confirmResponse: Response;
    try {
      confirmResponse = await fetchFn(config.confirmUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}`,
        },
        body: JSON.stringify({
          id,
          clientTxId,
        }),
      });
    } catch (fetchErr) {
      throw new CheckoutError(
        "NETWORK",
        fetchErr instanceof Error ? fetchErr.message : "Error comunicándose con PayPhone.",
        502
      );
    }

    if (!confirmResponse.ok) {
      const errText = await confirmResponse.text();
      // On failure to confirm, release active stock reservations
      await releaseReservationsForAttempt(db, clientTxId);
      await db.payphonePaymentAttempt.update({
        where: { clientTransactionId: clientTxId },
        data: { status: "FAILED" },
      });
      throw new CheckoutError("CONFIRM_API", `Error devuelto por la API de PayPhone (${confirmResponse.status}): ${errText}`, 502);
    }

    const data = (await confirmResponse.json()) as PayphoneConfirmApiResponse;

    if (data.statusCode !== 3 || data.transactionStatus !== "Approved") {
      const status = data.transactionStatus === "Canceled" ? "CANCELED" : "FAILED";
      await releaseReservationsForAttempt(db, clientTxId);
      await db.payphonePaymentAttempt.update({
        where: { clientTransactionId: clientTxId },
        data: {
          status,
          payphoneTransactionId: data.transactionId ? Number(data.transactionId) : id,
          authorizationCode: data.authorizationCode ? String(data.authorizationCode) : null,
        },
      });
      throw new CheckoutError(
        "PAYMENT_DECLINED",
        data.message || `El pago no fue aprobado por el emisor (Estado: ${data.transactionStatus}).`,
        400
      );
    }

    if (data.currency && data.currency !== "USD") {
      throw new CheckoutError("CURRENCY", "Moneda de cobro no válida.", 400);
    }

    if (data.amount !== existingAttempt.amountInCents) {
      throw new CheckoutError(
        "AMOUNT_MISMATCH",
        `El monto pagado (${data.amount} centavos) no coincide con el total esperado (${existingAttempt.amountInCents} centavos).`,
        400
      );
    }

    // Process Approved Payment inside a PostgreSQL transaction with concurrency lock
    const confirmedOrder = await db.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${clientTxId}, 0))::text AS "lock"`;

        const attempt = await tx.payphonePaymentAttempt.findUniqueOrThrow({
          where: { clientTransactionId: clientTxId },
          include: {
            order: { include: { items: true, payments: true } },
            stockReservations: true,
          },
        });

        if (attempt.status === "APPROVED" && attempt.order) {
          return attempt.order;
        }

        const items = attempt.items as Array<{
          productId: string;
          productName: string;
          flavor: string;
          unitPrice: string;
          quantity: number;
          lineTotal: string;
        }>;
        const customer = attempt.customer as Record<string, string>;

        const now = new Date();
        const activeReservations = attempt.stockReservations.filter((r) => r.status === "ACTIVE");

        // Verify if active reservation is complete for all required lines
        const hasCompleteReservation = items.every((item) =>
          activeReservations.some((r) => r.productId === item.productId && r.quantity >= item.quantity)
        );

        let fulfillmentStatus: FulfillmentStatus = "UNFULFILLED";
        let hasInventoryException = false;

        // Check if physical stock is available to satisfy order
        const productIds = items.map((i) => i.productId);
        await tx.$queryRaw(
          Prisma.sql`SELECT "id" FROM "Product" WHERE "id" IN (${Prisma.join(productIds)}) ORDER BY "id" FOR UPDATE`
        );
        const lockedProducts = await tx.product.findMany({ where: { id: { in: productIds } } });

        const canDeductPhysicalStock = items.every((item) => {
          const p = lockedProducts.find((cp) => cp.id === item.productId);
          return p && p.active && p.stock >= item.quantity;
        });

        if (hasCompleteReservation && canDeductPhysicalStock) {
          // Confirm reservations
          for (const res of activeReservations) {
            await tx.stockReservation.update({
              where: { id: res.id },
              data: { status: "CONFIRMED", confirmedAt: now },
            });
          }
        } else if (canDeductPhysicalStock) {
          // Reservation might have expired, but stock is still physically available
          fulfillmentStatus = "UNFULFILLED";
        } else {
          // Edge case (Requirement 4): Payment is APPROVED by PayPhone, but stock was exhausted.
          // NEVER reject the transaction or drop the payment!
          fulfillmentStatus = "EXCEPTION_INSUFFICIENT_STOCK";
          hasInventoryException = true;
        }

        const order = await tx.order.create({
          data: {
            firstName: customer.firstName,
            lastName: customer.lastName,
            idNumber: customer.idNumber || null,
            email: customer.email,
            phone: customer.phone,
            province: customer.province,
            city: customer.city,
            area: customer.area || null,
            address: customer.address,
            deliveryInstructions: customer.deliveryInstructions || null,
            subtotal: attempt.subtotal,
            shippingMode: attempt.shippingMode,
            shippingAmount: attempt.shippingAmount,
            total: attempt.total,
            currency: "USD",
            status: "PAID",
            fulfillmentStatus,
            reservationStatus: "NONE",
            paidAt: now,
            guestAccessHash: attempt.guestAccessHash,
            items: {
              create: items.map((line) => ({
                productId: line.productId,
                productName: line.productName,
                flavor: line.flavor,
                unitPrice: new Prisma.Decimal(line.unitPrice),
                quantity: line.quantity,
                lineTotal: new Prisma.Decimal(line.lineTotal),
                inventoryDeductedAt: !hasInventoryException ? now : null,
              })),
            },
            payments: {
              create: {
                method: "CARD",
                status: "PAID",
                provider: "PAYPHONE",
                providerReference: String(data.transactionId || id),
                idempotencyKey: clientTxId,
                amount: attempt.total,
                currency: "USD",
                paidAt: now,
              },
            },
          },
          include: { items: true, payments: true },
        });

        // Deduct physical inventory exactly once if stock is available
        if (!hasInventoryException) {
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            });
            const updatedProd = await tx.product.findUniqueOrThrow({
              where: { id: item.productId },
              select: { stock: true },
            });
            await tx.inventoryMovement.create({
              data: {
                productId: item.productId,
                orderItemId: item.id,
                type: "SALE",
                delta: -item.quantity,
                stockAfter: updatedProd.stock,
                reason: `Venta confirmada PayPhone (${clientTxId})`,
              },
            });
          }
        }

        // If inventory exception occurred, attach internal alert note
        if (hasInventoryException) {
          await tx.orderNote.create({
            data: {
              orderId: order.id,
              content: `⚠️ ALERTA ADMINISTRATIVA: El pago fue APROBADO por PayPhone ($${attempt.total}, Transacción #${data.transactionId || id}, Auth: ${data.authorizationCode || "N/A"}), pero el stock disponible era insuficiente al momento de la confirmación. El pedido NO debe ser marcado como enviado hasta resolver la reposición de stock o procesar el reembolso manual en PayPhone.`,
            },
          });
        }

        if (attempt.marketingConsent) {
          const contact = await tx.marketingContact.upsert({
            where: { email: customer.email },
            create: {
              email: customer.email,
              status: "GRANTED",
              consentAt: now,
              consentSource: "GUEST_CHECKOUT",
              consentText: CONSENT_TEXT,
              consentVersion: CONSENT_VERSION,
            },
            update: {
              status: "GRANTED",
              consentAt: now,
              consentSource: "GUEST_CHECKOUT",
              consentText: CONSENT_TEXT,
              consentVersion: CONSENT_VERSION,
              withdrawnAt: null,
            },
          });
          await tx.marketingConsentEvent.create({
            data: {
              contactId: contact.id,
              status: "GRANTED",
              source: "GUEST_CHECKOUT",
              consentText: CONSENT_TEXT,
              consentVersion: CONSENT_VERSION,
              occurredAt: now,
            },
          });
        }

        // Update attempt to APPROVED
        await tx.payphonePaymentAttempt.update({
          where: { id: attempt.id },
          data: {
            status: "APPROVED",
            payphoneTransactionId: data.transactionId ? Number(data.transactionId) : id,
            authorizationCode: data.authorizationCode ? String(data.authorizationCode) : null,
            cardBrand: data.cardBrand || null,
            lastDigits: data.lastDigits || null,
            orderId: order.id,
          },
        });

        return order;
      },
      { timeout: 20000 }
    );

    // Send confirmation email asynchronously
    try {
      await sendOrderConfirmationEmail(confirmedOrder);
    } catch (e) {
      console.error("[EMAIL ERROR] Could not send confirmation email for PayPhone order:", e);
    }

    return {
      success: true,
      alreadyProcessed: false,
      orderId: confirmedOrder.id,
      orderNumber: formatOrderNumber(confirmedOrder.number),
      accessId: confirmedOrder.accessId ?? undefined,
      url: `/pedido/${encodeURIComponent(confirmedOrder.accessId ?? "")}`,
    };
  }

  return { prepare, confirm };
}

/**
 * Release active reservations for an attempt
 */
export async function releaseReservationsForAttempt(db: PrismaClient, clientTransactionId: string) {
  const now = new Date();
  await db.$transaction(async (tx) => {
    await tx.stockReservation.updateMany({
      where: { clientTransactionId, status: "ACTIVE" },
      data: { status: "RELEASED", releasedAt: now },
    });
    await tx.payphonePaymentAttempt.updateMany({
      where: { clientTransactionId, status: "PENDING" },
      data: { releasedAt: now },
    });
  });
}

/**
 * Server-side reconciliation job to release expired, unconfirmed PayPhone reservations
 */
export async function reconcileExpiredPayphoneReservations(db: PrismaClient) {
  const now = new Date();
  const expired = await db.stockReservation.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lte: now },
    },
    select: { id: true, clientTransactionId: true },
  });

  if (expired.length === 0) return 0;

  await db.$transaction(async (tx) => {
    await tx.stockReservation.updateMany({
      where: { id: { in: expired.map((e) => e.id) } },
      data: { status: "RELEASED", releasedAt: now },
    });
    const clientTxIds = Array.from(new Set(expired.map((e) => e.clientTransactionId)));
    await tx.payphonePaymentAttempt.updateMany({
      where: { clientTransactionId: { in: clientTxIds }, status: "PENDING" },
      data: { releasedAt: now },
    });
  });

  return expired.length;
}
