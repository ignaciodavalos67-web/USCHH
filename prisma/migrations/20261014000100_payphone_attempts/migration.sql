-- CreateEnum
CREATE TYPE "PayphoneAttemptStatus" AS ENUM ('PENDING', 'APPROVED', 'FAILED', 'CANCELED');

-- CreateTable
CREATE TABLE "PayphonePaymentAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientTransactionId" VARCHAR(50) NOT NULL,
    "status" "PayphoneAttemptStatus" NOT NULL DEFAULT 'PENDING',
    "amountInCents" INTEGER NOT NULL,
    "subtotal" DECIMAL(12, 2) NOT NULL,
    "shippingMode" "ShippingMode" NOT NULL,
    "shippingAmount" DECIMAL(12, 2),
    "total" DECIMAL(12, 2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "customer" JSONB NOT NULL,
    "items" JSONB NOT NULL,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "guestAccessHash" VARCHAR(64),
    "payphoneTransactionId" INTEGER,
    "authorizationCode" TEXT,
    "cardBrand" TEXT,
    "lastDigits" TEXT,
    "orderId" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "confirmedAt" TIMESTAMPTZ(3),
    CONSTRAINT "PayphonePaymentAttempt_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PayphonePaymentAttempt_clientTransactionId_key" ON "PayphonePaymentAttempt"("clientTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "PayphonePaymentAttempt_orderId_key" ON "PayphonePaymentAttempt"("orderId");

-- CreateIndex
CREATE INDEX "PayphonePaymentAttempt_status_createdAt_idx" ON "PayphonePaymentAttempt"("status", "createdAt");

-- Row Level Security
DO $$
DECLARE private_table TEXT; browser_role TEXT;
BEGIN
  FOREACH private_table IN ARRAY ARRAY['PayphonePaymentAttempt'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', private_table);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', private_table);
    FOREACH browser_role IN ARRAY ARRAY['anon','authenticated'] LOOP
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname=browser_role) THEN
        EXECUTE format('REVOKE ALL ON TABLE public.%I FROM %I',private_table,browser_role);
      END IF;
    END LOOP;
  END LOOP;
END $$;
