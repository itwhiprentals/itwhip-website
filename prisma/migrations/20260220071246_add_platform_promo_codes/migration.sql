-- AlterTable
ALTER TABLE "RentalBooking" ADD COLUMN     "promoCode" TEXT,
ADD COLUMN     "promoDiscountAmount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "promoSource" TEXT;

-- CreateTable
CREATE TABLE "platform_promo_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "discountType" TEXT NOT NULL DEFAULT 'percentage',
    "discountValue" DOUBLE PRECISION NOT NULL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "minBookingAmount" DOUBLE PRECISION DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_promo_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "platform_promo_codes_code_key" ON "platform_promo_codes"("code");

-- CreateIndex
CREATE INDEX "platform_promo_codes_code_idx" ON "platform_promo_codes"("code");

-- CreateIndex
CREATE INDEX "platform_promo_codes_isActive_idx" ON "platform_promo_codes"("isActive");
