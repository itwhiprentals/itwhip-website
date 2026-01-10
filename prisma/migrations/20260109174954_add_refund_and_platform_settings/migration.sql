-- CreateTable
CREATE TABLE IF NOT EXISTS "RefundRequest" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "requestedByType" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "processedAt" TIMESTAMP(3),
    "stripeRefundId" TEXT,
    "stripeTransferId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefundRequest_pkey" PRIMARY KEY ("id")
);

-- Drop existing platform_settings if exists with wrong schema
DROP TABLE IF EXISTS "platform_settings";

-- CreateTable platform_settings with correct schema
CREATE TABLE "platform_settings" (
    "id" TEXT NOT NULL DEFAULT 'global',

    -- Tax Settings
    "defaultTaxRate" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "taxByState" JSONB,
    "taxByCityOverride" JSONB,

    -- Commission/Fee Settings
    "platformCommission" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "partnerMinCommission" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "partnerMaxCommission" DOUBLE PRECISION NOT NULL DEFAULT 0.50,

    -- Cancellation Policy
    "fullRefundHours" INTEGER NOT NULL DEFAULT 72,
    "partialRefund75Hours" INTEGER NOT NULL DEFAULT 24,
    "partialRefund50Hours" INTEGER NOT NULL DEFAULT 12,
    "noRefundHours" INTEGER NOT NULL DEFAULT 12,

    -- Grace Periods
    "lateReturnGraceMinutes" INTEGER NOT NULL DEFAULT 30,
    "pickupGraceMinutes" INTEGER NOT NULL DEFAULT 15,

    -- Charge Rates
    "mileageOverageRate" DOUBLE PRECISION NOT NULL DEFAULT 0.45,
    "dailyIncludedMiles" INTEGER NOT NULL DEFAULT 200,
    "fuelRefillRateQuarter" DOUBLE PRECISION NOT NULL DEFAULT 75,
    "fuelRefillRateFull" DOUBLE PRECISION NOT NULL DEFAULT 300,
    "lateReturnHourlyRate" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "lateReturnDailyMax" DOUBLE PRECISION NOT NULL DEFAULT 300,
    "cleaningFeeStandard" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "cleaningFeeDeep" DOUBLE PRECISION NOT NULL DEFAULT 150,
    "cleaningFeeBiohazard" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "noShowFee" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "smokingFee" DOUBLE PRECISION NOT NULL DEFAULT 250,
    "petHairFee" DOUBLE PRECISION NOT NULL DEFAULT 75,
    "lostKeyFee" DOUBLE PRECISION NOT NULL DEFAULT 200,

    -- Deposit Settings
    "defaultDepositPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
    "minDeposit" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "maxDeposit" DOUBLE PRECISION NOT NULL DEFAULT 2500,
    "insuranceDiscountPct" DOUBLE PRECISION NOT NULL DEFAULT 0.50,

    -- Payout Settings
    "standardPayoutDelay" INTEGER NOT NULL DEFAULT 3,
    "newHostPayoutDelay" INTEGER NOT NULL DEFAULT 7,
    "minimumPayout" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "instantPayoutFee" DOUBLE PRECISION NOT NULL DEFAULT 0.015,

    -- Signup Bonuses
    "guestSignupBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hostSignupBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "referralBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bonusExpirationDays" INTEGER NOT NULL DEFAULT 90,

    -- Damage Thresholds
    "minorDamageMax" DOUBLE PRECISION NOT NULL DEFAULT 250,
    "moderateDamageMax" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "majorDamageMin" DOUBLE PRECISION NOT NULL DEFAULT 1000,

    -- Audit
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RefundRequest_bookingId_idx" ON "RefundRequest"("bookingId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RefundRequest_requestedBy_idx" ON "RefundRequest"("requestedBy");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RefundRequest_status_idx" ON "RefundRequest"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RefundRequest_createdAt_idx" ON "RefundRequest"("createdAt");

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Insert default global settings
INSERT INTO "platform_settings" ("id", "updatedAt")
VALUES ('global', NOW())
ON CONFLICT ("id") DO NOTHING;
