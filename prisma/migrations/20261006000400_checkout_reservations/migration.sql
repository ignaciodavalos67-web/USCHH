ALTER TABLE "Order"
  ADD COLUMN "checkoutKey" TEXT,
  ADD COLUMN "checkoutRequestHash" VARCHAR(64),
  ADD COLUMN "guestAccessHash" VARCHAR(64),
  ADD COLUMN "accessId" TEXT,
  ADD COLUMN "bankDetails" JSONB,
  ADD COLUMN "reservationStatus" "ReservationStatus" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "reservationExpiresAt" TIMESTAMPTZ(3),
  ADD COLUMN "reservedAt" TIMESTAMPTZ(3),
  ADD COLUMN "reservationConfirmedAt" TIMESTAMPTZ(3),
  ADD COLUMN "reservationReleasedAt" TIMESTAMPTZ(3);
CREATE UNIQUE INDEX "Order_checkoutKey_key" ON "Order"("checkoutKey");
CREATE UNIQUE INDEX "Order_accessId_key" ON "Order"("accessId");
CREATE INDEX "Order_reservationStatus_reservationExpiresAt_idx" ON "Order"("reservationStatus", "reservationExpiresAt");
ALTER TABLE "Order" ADD CONSTRAINT "Order_reservation_lifecycle" CHECK (
  "reservationStatus" = 'NONE' OR (
    "reservedAt" IS NOT NULL AND "reservationExpiresAt" > "reservedAt" AND
    "checkoutKey" IS NOT NULL AND "checkoutRequestHash" IS NOT NULL AND "guestAccessHash" IS NOT NULL AND "accessId" IS NOT NULL AND
    (("reservationStatus" = 'RESERVED' AND "reservationConfirmedAt" IS NULL AND "reservationReleasedAt" IS NULL) OR
     ("reservationStatus" = 'CONFIRMED' AND "reservationConfirmedAt" IS NOT NULL AND "reservationReleasedAt" IS NULL) OR
     ("reservationStatus" = 'RELEASED' AND "reservationReleasedAt" IS NOT NULL AND "reservationConfirmedAt" IS NULL))
  )
);
ALTER TABLE "OrderItem" ADD COLUMN "inventoryReservedAt" TIMESTAMPTZ(3), ADD COLUMN "inventoryReleasedAt" TIMESTAMPTZ(3);
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_release_requires_reservation" CHECK (
  "inventoryReleasedAt" IS NULL OR ("inventoryReservedAt" IS NOT NULL AND "inventoryReleasedAt" >= "inventoryReservedAt")
);
ALTER TABLE "Payment" ADD COLUMN "customerMarkedTransferredAt" TIMESTAMPTZ(3);
ALTER TABLE "InventoryMovement" DROP CONSTRAINT "InventoryMovement_type_delta";
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_type_delta" CHECK (
  ("type" = 'SALE' AND "orderItemId" IS NOT NULL AND "delta" < 0) OR
  ("type" = 'CANCELLATION' AND "orderItemId" IS NOT NULL AND "delta" > 0) OR
  ("type" = 'RESERVATION' AND "orderItemId" IS NOT NULL AND "delta" < 0) OR
  ("type" = 'RESERVATION_CONFIRMED' AND "orderItemId" IS NOT NULL AND "delta" = 0) OR
  ("type" = 'RESERVATION_RELEASED' AND "orderItemId" IS NOT NULL AND "delta" > 0) OR
  ("type" = 'ADMIN_ADJUSTMENT' AND "orderItemId" IS NULL AND "adminId" IS NOT NULL AND "delta" <> 0 AND "reason" IS NOT NULL AND LENGTH(TRIM("reason")) > 0)
);
