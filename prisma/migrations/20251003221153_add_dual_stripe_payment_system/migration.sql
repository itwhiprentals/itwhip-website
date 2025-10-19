/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerId]` on the table `RentalHost` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "RentalHost" ADD COLUMN     "defaultPaymentMethodOnFile" TEXT,
ADD COLUMN     "holdBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "lastChargeReason" TEXT,
ADD COLUMN     "lastChargedDate" TIMESTAMP(3),
ADD COLUMN     "lastSubscriptionChargeDate" TIMESTAMP(3),
ADD COLUMN     "monthlySubscriptionFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "negativeBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "nextSubscriptionChargeDate" TIMESTAMP(3),
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "subscriptionEndDate" TIMESTAMP(3),
ADD COLUMN     "subscriptionStartDate" TIMESTAMP(3),
ADD COLUMN     "subscriptionStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "subscriptionTier" TEXT NOT NULL DEFAULT 'FREE',
ADD COLUMN     "totalChargedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "host_charges" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "chargeType" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "chargedBy" TEXT NOT NULL,
    "stripeChargeId" TEXT,
    "stripeCustomerId" TEXT,
    "status" TEXT NOT NULL,
    "failureReason" TEXT,
    "paymentMethodUsed" TEXT,
    "metadata" JSONB,
    "notes" TEXT,
    "relatedBookingId" TEXT,
    "relatedClaimId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),

    CONSTRAINT "host_charges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "host_charges_hostId_idx" ON "host_charges"("hostId");

-- CreateIndex
CREATE INDEX "host_charges_status_idx" ON "host_charges"("status");

-- CreateIndex
CREATE INDEX "host_charges_chargeType_idx" ON "host_charges"("chargeType");

-- CreateIndex
CREATE INDEX "host_charges_createdAt_idx" ON "host_charges"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RentalHost_stripeCustomerId_key" ON "RentalHost"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "RentalHost_stripeCustomerId_idx" ON "RentalHost"("stripeCustomerId");

-- AddForeignKey
ALTER TABLE "host_charges" ADD CONSTRAINT "host_charges_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
