-- CHECK constraints accept NULL expressions; explicitly require an expiry.
ALTER TABLE "Order" DROP CONSTRAINT "Order_reservation_lifecycle";
ALTER TABLE "Order" ADD CONSTRAINT "Order_reservation_lifecycle" CHECK (
  "reservationStatus" = 'NONE' OR (
    "reservedAt" IS NOT NULL AND "reservationExpiresAt" IS NOT NULL AND "reservationExpiresAt" > "reservedAt" AND
    "checkoutKey" IS NOT NULL AND "checkoutRequestHash" IS NOT NULL AND "guestAccessHash" IS NOT NULL AND "accessId" IS NOT NULL AND "bankDetails" IS NOT NULL AND
    (("reservationStatus" = 'RESERVED' AND "reservationConfirmedAt" IS NULL AND "reservationReleasedAt" IS NULL) OR
     ("reservationStatus" = 'CONFIRMED' AND "reservationConfirmedAt" IS NOT NULL AND "reservationReleasedAt" IS NULL) OR
     ("reservationStatus" = 'RELEASED' AND "reservationReleasedAt" IS NOT NULL AND "reservationConfirmedAt" IS NULL))
  )
);