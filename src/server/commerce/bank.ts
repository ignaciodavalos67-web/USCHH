import "server-only";

export type BankDetails = {
  name: string;
  holder: string;
  type: string;
  number: string;
  idNumber?: string;
  currency?: string;
};

export function getBankDetails(): BankDetails | null {
  const enabled = process.env.BANK_TRANSFER_ENABLED?.trim();
  if (enabled !== "true") return null;

  const name = process.env.BANK_NAME?.trim();
  const holder = process.env.BANK_ACCOUNT_HOLDER?.trim();
  const type = process.env.BANK_ACCOUNT_TYPE?.trim();
  const number = process.env.BANK_ACCOUNT_NUMBER?.trim();
  if (!name || !holder || !type || !number) return null;

  return {
    name,
    holder,
    type,
    number,
    ...(process.env.BANK_ID_NUMBER?.trim() ? { idNumber: process.env.BANK_ID_NUMBER.trim() } : {}),
    currency: process.env.BANK_CURRENCY?.trim() || "USD",
  };
}
