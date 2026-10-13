-- CreateEnum
CREATE TYPE "FulfillmentStatus" AS ENUM ('UNFULFILLED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'EXCEPTION_INSUFFICIENT_STOCK', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StockReservationStatus" AS ENUM ('ACTIVE', 'CONFIRMED', 'RELEASED');

-- AlterTable Order
ALTER TABLE "Order" ADD COLUMN "fulfillmentStatus" "FulfillmentStatus" NOT NULL DEFAULT 'UNFULFILLED';
CREATE INDEX "Order_fulfillmentStatus_idx" ON "Order"("fulfillmentStatus");

-- AlterTable PayphonePaymentAttempt
ALTER TABLE "PayphonePaymentAttempt"
  ADD COLUMN "expiresAt" TIMESTAMPTZ(3),
  ADD COLUMN "reservedAt" TIMESTAMPTZ(3),
  ADD COLUMN "releasedAt" TIMESTAMPTZ(3),
  ADD COLUMN "taxableBase" DECIMAL(12, 2),
  ADD COLUMN "productVat" DECIMAL(12, 2),
  ADD COLUMN "estimatedCommission" DECIMAL(12, 2),
  ADD COLUMN "estimatedCommissionVat" DECIMAL(12, 2),
  ADD COLUMN "estimatedSettlement" DECIMAL(12, 2);

CREATE INDEX "PayphonePaymentAttempt_status_expiresAt_idx" ON "PayphonePaymentAttempt"("status", "expiresAt");

-- CreateTable StockReservation
CREATE TABLE "StockReservation" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "payphoneAttemptId" TEXT NOT NULL,
  "clientTransactionId" VARCHAR(50) NOT NULL,
  "status" "StockReservationStatus" NOT NULL DEFAULT 'ACTIVE',
  "expiresAt" TIMESTAMPTZ(3) NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "releasedAt" TIMESTAMPTZ(3),
  "confirmedAt" TIMESTAMPTZ(3),

  CONSTRAINT "StockReservation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StockReservation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "StockReservation_payphoneAttemptId_fkey" FOREIGN KEY ("payphoneAttemptId") REFERENCES "PayphonePaymentAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndexes for StockReservation
CREATE INDEX "StockReservation_productId_status_expiresAt_idx" ON "StockReservation"("productId", "status", "expiresAt");
CREATE INDEX "StockReservation_clientTransactionId_idx" ON "StockReservation"("clientTransactionId");
CREATE INDEX "StockReservation_status_expiresAt_idx" ON "StockReservation"("status", "expiresAt");

-- Row Level Security for StockReservation
DO $$
DECLARE private_table TEXT; browser_role TEXT;
BEGIN
  FOREACH private_table IN ARRAY ARRAY['StockReservation'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', private_table);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', private_table);
    FOREACH browser_role IN ARRAY ARRAY['anon','authenticated'] LOOP
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname=browser_role) THEN
        EXECUTE format('REVOKE ALL ON TABLE public.%I FROM %I',private_table,browser_role);
      END IF;
    END LOOP;
  END LOOP;
END $$;
