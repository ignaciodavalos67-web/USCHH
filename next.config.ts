import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BANK_TRANSFER_ENABLED: process.env.BANK_TRANSFER_ENABLED || "true",
    BANK_NAME: process.env.BANK_NAME || "Produbanco",
    BANK_ACCOUNT_HOLDER: process.env.BANK_ACCOUNT_HOLDER || "USCHH",
    BANK_ACCOUNT_TYPE: process.env.BANK_ACCOUNT_TYPE || "Cuenta corriente",
    BANK_ACCOUNT_NUMBER: process.env.BANK_ACCOUNT_NUMBER || "27059145124",
    BANK_ID_NUMBER: process.env.BANK_ID_NUMBER || "1793231533001",
    BANK_CURRENCY: process.env.BANK_CURRENCY || "USD",
  },
  images: {
    qualities: [75, 85],
  },
};

export default nextConfig;
