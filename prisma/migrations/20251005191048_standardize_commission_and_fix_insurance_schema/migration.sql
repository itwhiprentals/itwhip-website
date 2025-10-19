/*
  Warnings:

  - Added the required column `depositHeld` to the `RentalBooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `securityDeposit` to the `RentalBooking` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InsuranceProviderType" AS ENUM ('EMBEDDED', 'TRADITIONAL');

-- CreateEnum
CREATE TYPE "InsuranceTier" AS ENUM ('MINIMUM', 'BASIC', 'PREMIUM', 'LUXURY');

-- CreateEnum
CREATE TYPE "ClaimType" AS ENUM ('ACCIDENT', 'THEFT', 'VANDALISM', 'CLEANING', 'MECHANICAL', 'WEATHER', 'OTHER');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'DENIED', 'PAID', 'DISPUTED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "HostInsuranceStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'DEACTIVATED', 'SUSPENDED', 'PENDING');

-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'CLAIMED');

-- CreateEnum
CREATE TYPE "RecoveryStatus" AS ENUM ('PENDING', 'PARTIAL', 'FULL', 'FAILED', 'WAIVED');

-- AlterTable
ALTER TABLE "RentalBooking" ADD COLUMN     "depositHeld" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "depositRefunded" DOUBLE PRECISION,
ADD COLUMN     "depositRefundedAt" TIMESTAMP(3),
ADD COLUMN     "depositUsedForClaim" DOUBLE PRECISION,
ADD COLUMN     "securityDeposit" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "RentalHost" ADD COLUMN     "deactivationReason" TEXT,
ADD COLUMN     "hostInsuranceDeactivatedAt" TIMESTAMP(3),
ADD COLUMN     "hostInsuranceExpires" TIMESTAMP(3),
ADD COLUMN     "hostInsuranceProvider" TEXT,
ADD COLUMN     "hostInsuranceStatus" "HostInsuranceStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "hostPolicyNumber" TEXT,
ADD COLUMN     "insuranceHistory" JSONB,
ADD COLUMN     "platformInsuranceActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "platformInsuranceProvider" TEXT NOT NULL DEFAULT 'Tint',
ADD COLUMN     "platformPolicyNumber" TEXT,
ALTER COLUMN "commissionRate" SET DEFAULT 0.25,
ALTER COLUMN "platformFeeRate" SET DEFAULT 0.25;

-- CreateTable
CREATE TABLE "InsuranceProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InsuranceProviderType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "coverageTiers" JSONB NOT NULL,
    "pricingRules" JSONB NOT NULL,
    "apiKey" TEXT,
    "apiEndpoint" TEXT,
    "webhookUrl" TEXT,
    "revenueShare" DOUBLE PRECISION NOT NULL DEFAULT 0.30,
    "contractStart" TIMESTAMP(3),
    "contractEnd" TIMESTAMP(3),
    "contractTerms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsuranceProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsurancePolicy" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "tier" "InsuranceTier" NOT NULL,
    "liabilityCoverage" DOUBLE PRECISION NOT NULL DEFAULT 750000,
    "collisionCoverage" DOUBLE PRECISION NOT NULL,
    "deductible" DOUBLE PRECISION NOT NULL,
    "dailyPremium" DOUBLE PRECISION NOT NULL,
    "totalPremium" DOUBLE PRECISION NOT NULL,
    "platformRevenue" DOUBLE PRECISION NOT NULL,
    "increasedDeposit" DOUBLE PRECISION,
    "status" "PolicyStatus" NOT NULL,
    "policyNumber" TEXT,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsurancePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "type" "ClaimType" NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "incidentDate" TIMESTAMP(3) NOT NULL,
    "damagePhotos" JSONB NOT NULL,
    "estimatedCost" DOUBLE PRECISION NOT NULL,
    "status" "ClaimStatus" NOT NULL,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "approvedAmount" DOUBLE PRECISION,
    "deductible" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "payoutId" TEXT,
    "paidToHost" TIMESTAMP(3),
    "paidAmount" DOUBLE PRECISION,
    "platformAdvanceAmount" DOUBLE PRECISION,
    "recoveredFromGuest" DOUBLE PRECISION,
    "recoveryStatus" "RecoveryStatus",
    "overrideHistory" JSONB,
    "guestAtFault" BOOLEAN NOT NULL DEFAULT false,
    "faultPercentage" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InsuranceProvider_isActive_idx" ON "InsuranceProvider"("isActive");

-- CreateIndex
CREATE INDEX "InsuranceProvider_isPrimary_idx" ON "InsuranceProvider"("isPrimary");

-- CreateIndex
CREATE UNIQUE INDEX "InsurancePolicy_bookingId_key" ON "InsurancePolicy"("bookingId");

-- CreateIndex
CREATE INDEX "InsurancePolicy_bookingId_idx" ON "InsurancePolicy"("bookingId");

-- CreateIndex
CREATE INDEX "InsurancePolicy_providerId_idx" ON "InsurancePolicy"("providerId");

-- CreateIndex
CREATE INDEX "InsurancePolicy_status_idx" ON "InsurancePolicy"("status");

-- CreateIndex
CREATE INDEX "Claim_hostId_idx" ON "Claim"("hostId");

-- CreateIndex
CREATE INDEX "Claim_bookingId_idx" ON "Claim"("bookingId");

-- CreateIndex
CREATE INDEX "Claim_policyId_idx" ON "Claim"("policyId");

-- CreateIndex
CREATE INDEX "Claim_status_idx" ON "Claim"("status");

-- CreateIndex
CREATE INDEX "Claim_type_idx" ON "Claim"("type");

-- CreateIndex
CREATE INDEX "Claim_payoutId_idx" ON "Claim"("payoutId");

-- CreateIndex
CREATE INDEX "RentalHost_hostInsuranceStatus_idx" ON "RentalHost"("hostInsuranceStatus");

-- AddForeignKey
ALTER TABLE "InsurancePolicy" ADD CONSTRAINT "InsurancePolicy_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "InsuranceProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsurancePolicy" ADD CONSTRAINT "InsurancePolicy_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "InsurancePolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
