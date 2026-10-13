import "server-only";

export type PayphoneConfig = {
  token: string;
  storeId?: string;
  confirmUrl: string;
  commissionRate: number;
  commissionVatRate: number;
  productVatRate: number;
  shippingVatRate: number;
  reservationTimeoutMinutes: number;
};

export function getPayphoneConfig(): PayphoneConfig | null {
  // Server-side feature flag: must be explicitly "true" to enable PayPhone
  if (process.env.PAYPHONE_ENABLED !== "true") return null;

  const token = process.env.PAYPHONE_TOKEN?.trim();
  if (!token) return null;

  const storeId = process.env.PAYPHONE_STORE_ID?.trim() || undefined;
  const confirmUrl =
    process.env.PAYPHONE_CONFIRM_URL?.trim() ||
    "https://paymentbox.payphonetodoesposible.com/api/confirm";

  const commissionRate = Number(process.env.PAYPHONE_COMMISSION_RATE || "5.75");
  const commissionVatRate = Number(process.env.PAYPHONE_COMMISSION_VAT_RATE || "15");
  const productVatRate = Number(process.env.PAYPHONE_PRODUCT_VAT_RATE || "15");
  const shippingVatRate = Number(process.env.PAYPHONE_SHIPPING_VAT_RATE || "0");
  const reservationTimeoutMinutes = Math.max(
    5,
    Number(process.env.PAYPHONE_RESERVATION_TIMEOUT_MINUTES || "15")
  );

  return {
    token,
    storeId,
    confirmUrl,
    commissionRate,
    commissionVatRate,
    productVatRate,
    shippingVatRate,
    reservationTimeoutMinutes,
  };
}
