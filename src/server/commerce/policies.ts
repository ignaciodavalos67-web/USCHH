import { Prisma } from "../../generated/prisma/client";
import { ShippingMode } from "../../generated/prisma/enums";

export const MAX_QUANTITY_PER_FLAVOR = 5;
export const FREE_SHIPPING_SUBTOTAL_USD = new Prisma.Decimal("30.00");

export function isPurchasable(product: { active: boolean; stock: number }) {
  return product.active && product.stock > 0;
}

// Run on server-resolved flavors, never on client-provided product metadata.
export function assertFlavorQuantities(items: readonly { flavor: string; quantity: number }[]) {
  const quantities = new Map<string, number>();
  for (const item of items) {
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) {
      throw new Error("Quantity must be a positive integer.");
    }
    const total = (quantities.get(item.flavor) ?? 0) + item.quantity;
    if (total > MAX_QUANTITY_PER_FLAVOR) throw new Error("Maximum quantity per flavor is 5.");
    quantities.set(item.flavor, total);
  }
}

// Exact decimal inputs must originate from database prices/snapshots, never browser totals.
export function calculateShipping(subtotal: Prisma.Decimal, currency: string = "USD") {
  if (currency !== "USD") throw new Error("Shipping policy is currently defined only for USD.");
  if (!subtotal.isFinite() || subtotal.isNegative() || subtotal.decimalPlaces() > 2) {
    throw new Error("Subtotal must be a nonnegative amount with at most two decimal places.");
  }
  const free = subtotal.greaterThanOrEqualTo(FREE_SHIPPING_SUBTOTAL_USD);
  return {
    shippingMode: free ? ShippingMode.FREE : ShippingMode.PAY_ON_DELIVERY,
    shippingAmount: free ? new Prisma.Decimal("0.00") : null,
    // The unknown courier fee is paid separately on delivery, not collected by USCHH.
    total: subtotal,
    currency,
  };
}

export function formatOrderNumber(number: number) {
  if (!Number.isSafeInteger(number) || number < 1) throw new Error("Invalid database order number.");
  return `USCHH-${String(number).padStart(6, "0")}`;
}

export function formatMoney(amount: Prisma.Decimal, currency: string) {
  return currency === "USD" ? `$${amount.toFixed(2)}` : `${currency} ${amount.toFixed(2)}`;
}
