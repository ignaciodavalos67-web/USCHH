import assert from "node:assert/strict";
import { test } from "node:test";
import { Prisma } from "../../generated/prisma/client";
import { calculateShipping, assertFlavorQuantities, formatOrderNumber, formatMoney, isPurchasable } from "./policies";

test("shipping threshold is exact; unknown courier fee stays null", () => {
  for (const value of ["0.00", "15.00", "29.99"]) {
    const result = calculateShipping(new Prisma.Decimal(value));
    assert.equal(result.shippingMode, "PAY_ON_DELIVERY");
    assert.equal(result.shippingAmount, null);
    assert.equal(result.total.toFixed(2), value);
  }
  for (const value of ["30.00", "30.01", "150.00"]) {
    const result = calculateShipping(new Prisma.Decimal(value));
    assert.equal(result.shippingMode, "FREE");
    assert.equal(result.shippingAmount?.toFixed(2), "0.00");
    assert.equal(result.total.toFixed(2), value);
  }
  for (const value of ["-1.00", "0.001", "NaN", "Infinity"]) assert.throws(() => calculateShipping(new Prisma.Decimal(value)));
  assert.throws(() => calculateShipping(new Prisma.Decimal("30"), "EUR"));
});

test("quantity limit aggregates duplicate lines per flavor, not entire order", () => {
  assert.doesNotThrow(() => assertFlavorQuantities([{ flavor: "LIMÓN", quantity: 5 }, { flavor: "MANDARINA", quantity: 5 }]));
  assert.doesNotThrow(() => assertFlavorQuantities([{ flavor: "LIMÓN", quantity: 2 }, { flavor: "LIMÓN", quantity: 3 }]));
  assert.throws(() => assertFlavorQuantities([{ flavor: "LIMÓN", quantity: 3 }, { flavor: "LIMÓN", quantity: 3 }]));
  for (const quantity of [0, -1, 1.5, 6, NaN, Infinity]) assert.throws(() => assertFlavorQuantities([{ flavor: "LIMÓN", quantity }]));
});

test("inactive and empty-stock products cannot be purchased", () => {
  assert.equal(isPurchasable({ active: true, stock: 1 }), true);
  assert.equal(isPurchasable({ active: false, stock: 10 }), false);
  assert.equal(isPurchasable({ active: true, stock: 0 }), false);
  assert.equal(isPurchasable({ active: true, stock: -1 }), false);
});

test("database sequence numbers format without truncation", () => {
  assert.equal(formatOrderNumber(124), "USCHH-000124");
  assert.equal(formatOrderNumber(1000000), "USCHH-1000000");
  for (const number of [0, -1, 1.5, NaN]) assert.throws(() => formatOrderNumber(number));
});

test("money is formatted from exact decimals, never floating-point prices", () => {
  assert.equal(formatMoney(new Prisma.Decimal("15.00"), "USD"), "$15.00");
  assert.equal(formatMoney(new Prisma.Decimal("0.1").plus("0.2"), "USD"), "$0.30");
});
