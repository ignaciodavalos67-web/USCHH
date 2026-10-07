import "server-only";
export type BankDetails = { name: string; holder: string; type: string; number: string; idNumber?: string };
export function getBankDetails(): BankDetails | null {
  const name=process.env.BANK_NAME?.trim(), holder=process.env.BANK_ACCOUNT_HOLDER?.trim(), type=process.env.BANK_ACCOUNT_TYPE?.trim(), number=process.env.BANK_ACCOUNT_NUMBER?.trim();
  if(process.env.BANK_TRANSFER_ENABLED!=="true" || !name || !holder || !type || !number) return null;
  return {name,holder,type,number,...(process.env.BANK_ID_NUMBER?.trim() ? {idNumber:process.env.BANK_ID_NUMBER.trim()} : {})};
}
