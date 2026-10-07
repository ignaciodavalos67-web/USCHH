-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ShippingMode" AS ENUM ('FREE', 'PAY_ON_DELIVERY', 'CALCULATED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "InventoryMovementType" AS ENUM ('SALE', 'CANCELLATION', 'ADMIN_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "MarketingConsentStatus" AS ENUM ('NOT_GRANTED', 'GRANTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "MarketingConsentSource" AS ENUM ('GUEST_CHECKOUT', 'NEWSLETTER', 'ADMIN_IMPORT');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "flavor" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "area" TEXT,
    "address" TEXT NOT NULL,
    "deliveryInstructions" TEXT,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "shippingMode" "ShippingMode" NOT NULL,
    "shippingAmount" DECIMAL(12,2),
    "total" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "carrier" TEXT,
    "trackingNumber" TEXT,
    "paidAt" TIMESTAMPTZ(3),
    "shippedAt" TIMESTAMPTZ(3),
    "deliveredAt" TIMESTAMPTZ(3),
    "cancelledAt" TIMESTAMPTZ(3),
    "refundedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "flavor" TEXT NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "lineTotal" DECIMAL(12,2) NOT NULL,
    "inventoryDeductedAt" TIMESTAMPTZ(3),
    "inventoryRestoredAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT,
    "providerReference" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "paidAt" TIMESTAMPTZ(3),
    "refundedAt" TIMESTAMPTZ(3),
    "verifiedAt" TIMESTAMPTZ(3),
    "verifiedById" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryMovement" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "orderItemId" TEXT,
    "type" "InventoryMovementType" NOT NULL,
    "delta" INTEGER NOT NULL,
    "stockAfter" INTEGER NOT NULL,
    "reason" TEXT,
    "adminId" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderNote" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingContact" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "MarketingConsentStatus" NOT NULL DEFAULT 'NOT_GRANTED',
    "consentAt" TIMESTAMPTZ(3),
    "consentSource" "MarketingConsentSource",
    "consentText" TEXT,
    "consentVersion" TEXT,
    "withdrawnAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "MarketingContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingConsentEvent" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "status" "MarketingConsentStatus" NOT NULL,
    "source" "MarketingConsentSource" NOT NULL,
    "consentText" TEXT,
    "consentVersion" TEXT,
    "occurredAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketingConsentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Order_number_key" ON "Order"("number");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Order_paidAt_idx" ON "Order"("paidAt");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_orderId_productId_key" ON "OrderItem"("orderId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_orderId_flavor_key" ON "OrderItem"("orderId", "flavor");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_status_paidAt_idx" ON "Payment"("status", "paidAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_provider_providerReference_key" ON "Payment"("provider", "providerReference");

-- CreateIndex
CREATE INDEX "InventoryMovement_productId_createdAt_idx" ON "InventoryMovement"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "InventoryMovement_adminId_idx" ON "InventoryMovement"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryMovement_orderItemId_type_key" ON "InventoryMovement"("orderItemId", "type");

-- CreateIndex
CREATE INDEX "OrderNote_orderId_createdAt_idx" ON "OrderNote"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "OrderNote_authorId_idx" ON "OrderNote"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MarketingContact_email_key" ON "MarketingContact"("email");

-- CreateIndex
CREATE INDEX "MarketingContact_status_idx" ON "MarketingContact"("status");

-- CreateIndex
CREATE INDEX "MarketingConsentEvent_contactId_occurredAt_idx" ON "MarketingConsentEvent"("contactId", "occurredAt");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderNote" ADD CONSTRAINT "OrderNote_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderNote" ADD CONSTRAINT "OrderNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingConsentEvent" ADD CONSTRAINT "MarketingConsentEvent_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "MarketingContact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Database invariants not expressible as Prisma schema attributes.
ALTER TABLE "Product"
  ADD CONSTRAINT "Product_stock_nonnegative" CHECK ("stock" >= 0),
  ADD CONSTRAINT "Product_price_nonnegative" CHECK ("price" >= 0),
  ADD CONSTRAINT "Product_currency_format" CHECK ("currency" ~ '^[A-Z]{3}$');

ALTER TABLE "Order"
  ADD CONSTRAINT "Order_number_positive" CHECK ("number" > 0),
  ADD CONSTRAINT "Order_money_nonnegative" CHECK ("subtotal" >= 0 AND "total" >= 0 AND ("shippingAmount" IS NULL OR "shippingAmount" >= 0)),
  ADD CONSTRAINT "Order_shipping_mode_amount" CHECK (
    ("shippingMode" = 'FREE' AND "shippingAmount" IS NOT NULL AND "shippingAmount" = 0) OR
    ("shippingMode" = 'PAY_ON_DELIVERY' AND "shippingAmount" IS NULL) OR
    ("shippingMode" = 'CALCULATED' AND "shippingAmount" IS NOT NULL)
  ),
  ADD CONSTRAINT "Order_total_consistency" CHECK ("total" = "subtotal" + COALESCE("shippingAmount", 0)),
  ADD CONSTRAINT "Order_currency_format" CHECK ("currency" ~ '^[A-Z]{3}$');

ALTER TABLE "OrderItem"
  ADD CONSTRAINT "OrderItem_quantity_range" CHECK ("quantity" BETWEEN 1 AND 5),
  ADD CONSTRAINT "OrderItem_money_consistency" CHECK ("unitPrice" >= 0 AND "lineTotal" = "unitPrice" * "quantity"),
  ADD CONSTRAINT "OrderItem_restoration_requires_deduction" CHECK (
    "inventoryRestoredAt" IS NULL OR
    ("inventoryDeductedAt" IS NOT NULL AND "inventoryRestoredAt" >= "inventoryDeductedAt")
  );

ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_amount_nonnegative" CHECK ("amount" >= 0),
  ADD CONSTRAINT "Payment_currency_format" CHECK ("currency" ~ '^[A-Z]{3}$'),
  ADD CONSTRAINT "Payment_reference_requires_provider" CHECK ("providerReference" IS NULL OR "provider" IS NOT NULL),
  ADD CONSTRAINT "Payment_paid_timestamp" CHECK ("status" NOT IN ('PAID', 'REFUNDED') OR "paidAt" IS NOT NULL),
  ADD CONSTRAINT "Payment_refunded_timestamp" CHECK ("status" <> 'REFUNDED' OR "refundedAt" IS NOT NULL);

ALTER TABLE "InventoryMovement"
  ADD CONSTRAINT "InventoryMovement_stock_nonnegative" CHECK ("stockAfter" >= 0),
  ADD CONSTRAINT "InventoryMovement_type_delta" CHECK (
    ("type" = 'SALE' AND "orderItemId" IS NOT NULL AND "delta" < 0) OR
    ("type" = 'CANCELLATION' AND "orderItemId" IS NOT NULL AND "delta" > 0) OR
    ("type" = 'ADMIN_ADJUSTMENT' AND "orderItemId" IS NULL AND "adminId" IS NOT NULL AND "delta" <> 0 AND "reason" IS NOT NULL AND LENGTH(TRIM("reason")) > 0)
  );

ALTER TABLE "MarketingContact"
  ADD CONSTRAINT "MarketingContact_consent_traceability" CHECK (
    ("status" = 'NOT_GRANTED' AND "consentAt" IS NULL AND "withdrawnAt" IS NULL) OR
    ("status" = 'GRANTED' AND "consentAt" IS NOT NULL AND "consentSource" IS NOT NULL AND "consentText" IS NOT NULL AND LENGTH(TRIM("consentText")) > 0 AND "consentVersion" IS NOT NULL AND LENGTH(TRIM("consentVersion")) > 0 AND "withdrawnAt" IS NULL) OR
    ("status" = 'WITHDRAWN' AND "consentAt" IS NOT NULL AND "withdrawnAt" IS NOT NULL AND "withdrawnAt" >= "consentAt")
  );

ALTER TABLE "MarketingConsentEvent"
  ADD CONSTRAINT "MarketingConsentEvent_grant_traceability" CHECK (
    "status" <> 'GRANTED' OR ("consentText" IS NOT NULL AND LENGTH(TRIM("consentText")) > 0 AND "consentVersion" IS NOT NULL AND LENGTH(TRIM("consentVersion")) > 0)
  );
