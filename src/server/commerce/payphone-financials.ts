import { Prisma } from "@/generated/prisma/client";

export type TaxBreakdown = {
  amount: number; // Total amount in integer cents
  amountWithoutTax: number; // 0% VAT base in integer cents
  amountWithTax: number; // 15% VAT base in integer cents
  tax: number; // 15% VAT in integer cents
  service: number; // 0
  tip: number; // 0
  taxableBaseDecimal: Prisma.Decimal;
  productVatDecimal: Prisma.Decimal;
};

export type CommissionBreakdown = {
  commissionRate: number; // e.g. 5.75
  commissionVatRate: number; // e.g. 15.0
  effectiveCommissionRate: number; // 6.6125
  estimatedCommissionCents: number; // e.g. 86
  commissionCents: number; // alias e.g. 86
  estimatedCommissionVatCents: number; // e.g. 13
  commissionVatCents: number; // alias e.g. 13
  totalCommissionCents: number; // e.g. 99
  estimatedSettlementCents: number; // e.g. 1401
  netSettlementCents: number; // alias e.g. 1401
  estimatedCommissionDecimal: Prisma.Decimal;
  estimatedCommissionVatDecimal: Prisma.Decimal;
  estimatedSettlementDecimal: Prisma.Decimal;
};

export type TaxCalculationInput = {
  productSubtotalCents?: number;
  shippingCents?: number;
  items?: Array<{ price: Prisma.Decimal | number | string; quantity: number }>;
  shippingAmount?: Prisma.Decimal | number | string;
  productVatRate?: number; // default 15
  shippingVatRate?: number; // default 0
};

/**
 * Calculates the PayPhone tax breakdown according to Ecuadorian tax laws:
 * - Product prices in USCHH store ALREADY include VAT (15%).
 * - Taxable base = round(taxableAmount / (1 + vatRate / 100))
 * - VAT = taxableAmount - taxableBase
 * - Ensures amount = amountWithoutTax + amountWithTax + tax + service + tip EXACTLY to the cent.
 */
export function calculatePayphoneTaxBreakdown(params: TaxCalculationInput): TaxBreakdown {
  const productVatRate = params.productVatRate ?? 15;
  const shippingVatRate = params.shippingVatRate ?? 0;

  let productSubtotalCents = 0;
  if (typeof params.productSubtotalCents === "number") {
    productSubtotalCents = Math.max(0, Math.round(params.productSubtotalCents));
  } else if (Array.isArray(params.items)) {
    for (const item of params.items) {
      const p = new Prisma.Decimal(item.price);
      const lineCents = Math.round(p.mul(item.quantity).mul(100).toNumber());
      productSubtotalCents += lineCents;
    }
  }

  let shippingCents = 0;
  if (typeof params.shippingCents === "number") {
    shippingCents = Math.max(0, Math.round(params.shippingCents));
  } else if (params.shippingAmount !== undefined) {
    shippingCents = Math.max(0, Math.round(new Prisma.Decimal(params.shippingAmount).mul(100).toNumber()));
  }

  let amountWithTax = 0;
  let tax = 0;
  let amountWithoutTax = 0;

  if (productSubtotalCents > 0) {
    if (productVatRate > 0) {
      const base = Math.round(productSubtotalCents / (1 + productVatRate / 100));
      const productTax = productSubtotalCents - base;
      amountWithTax += base;
      tax += productTax;
    } else {
      amountWithoutTax += productSubtotalCents;
    }
  }

  if (shippingCents > 0) {
    if (shippingVatRate > 0) {
      const shippingBase = Math.round(shippingCents / (1 + shippingVatRate / 100));
      const shippingTax = shippingCents - shippingBase;
      amountWithTax += shippingBase;
      tax += shippingTax;
    } else {
      amountWithoutTax += shippingCents;
    }
  }

  const totalAmount = amountWithoutTax + amountWithTax + tax;

  return {
    amount: totalAmount,
    amountWithoutTax,
    amountWithTax,
    tax,
    service: 0,
    tip: 0,
    taxableBaseDecimal: new Prisma.Decimal((amountWithTax / 100).toFixed(2)),
    productVatDecimal: new Prisma.Decimal((tax / 100).toFixed(2)),
  };
}

/**
 * Calculates internal PayPhone financial commissions:
 * - Base commission: default 5.75%
 * - VAT on commission: default 15%
 * - Effective rate: 5.75% * 1.15 = 6.6125%
 * - NOTE: Commission is a business expense and NOT added to the customer total.
 * - Commission VAT may be tax-recoverable as credit against corporate tax.
 */
export function calculatePayphoneCommission(
  amountInCentsOrParams:
    | number
    | {
        totalAmountInCents?: number;
        amountInCents?: number;
        commissionRate?: number;
        commissionVatRate?: number;
      },
  options?: {
    commissionRate?: number;
    commissionVatRate?: number;
  }
): CommissionBreakdown {
  let amountInCents = 0;
  let commissionRate = 5.75;
  let commissionVatRate = 15.0;

  if (typeof amountInCentsOrParams === "number") {
    amountInCents = amountInCentsOrParams;
    commissionRate = options?.commissionRate ?? 5.75;
    commissionVatRate = options?.commissionVatRate ?? 15.0;
  } else if (typeof amountInCentsOrParams === "object" && amountInCentsOrParams !== null) {
    amountInCents = amountInCentsOrParams.totalAmountInCents ?? amountInCentsOrParams.amountInCents ?? 0;
    commissionRate = amountInCentsOrParams.commissionRate ?? options?.commissionRate ?? 5.75;
    commissionVatRate = amountInCentsOrParams.commissionVatRate ?? options?.commissionVatRate ?? 15.0;
  }

  const effectiveCommissionRate = Number(
    (commissionRate * (1 + commissionVatRate / 100)).toFixed(4)
  );

  // Base commission on transaction total
  const estimatedCommissionCents = Math.round(
    amountInCents * (commissionRate / 100)
  );

  // VAT (15%) on the PayPhone commission fee
  const estimatedCommissionVatCents = Math.round(
    estimatedCommissionCents * (commissionVatRate / 100)
  );

  const totalCommissionCents =
    estimatedCommissionCents + estimatedCommissionVatCents;
  const estimatedSettlementCents = Math.max(
    0,
    amountInCents - totalCommissionCents
  );

  return {
    commissionRate,
    commissionVatRate,
    effectiveCommissionRate,
    estimatedCommissionCents,
    commissionCents: estimatedCommissionCents,
    estimatedCommissionVatCents,
    commissionVatCents: estimatedCommissionVatCents,
    totalCommissionCents,
    estimatedSettlementCents,
    netSettlementCents: estimatedSettlementCents,
    estimatedCommissionDecimal: new Prisma.Decimal(
      (estimatedCommissionCents / 100).toFixed(2)
    ),
    estimatedCommissionVatDecimal: new Prisma.Decimal(
      (estimatedCommissionVatCents / 100).toFixed(2)
    ),
    estimatedSettlementDecimal: new Prisma.Decimal(
      (estimatedSettlementCents / 100).toFixed(2)
    ),
  };
}
