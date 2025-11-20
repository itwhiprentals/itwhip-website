-- AlterTable
ALTER TABLE "public"."Claim" ADD COLUMN     "guestRespondedAt" TIMESTAMP(3),
ADD COLUMN     "insurerClaimId" TEXT,
ADD COLUMN     "insurerDenialReason" TEXT,
ADD COLUMN     "insurerPaidAmount" DOUBLE PRECISION,
ADD COLUMN     "insurerPaidAt" TIMESTAMP(3),
ADD COLUMN     "insurerStatus" TEXT,
ADD COLUMN     "lockedCarState" TEXT,
ADD COLUMN     "primaryParty" TEXT,
ADD COLUMN     "severity" TEXT,
ADD COLUMN     "submittedToInsurerAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."InsurancePolicy" ADD COLUMN     "boundViaApi" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "externalPolicyId" TEXT,
ADD COLUMN     "hostTier" TEXT,
ADD COLUMN     "policySnapshot" JSONB,
ADD COLUMN     "policySource" TEXT,
ADD COLUMN     "primaryParty" TEXT;

-- AlterTable
ALTER TABLE "public"."RentalCar" ADD COLUMN     "claimLockUntil" TIMESTAMP(3),
ADD COLUMN     "requiresInspection" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "safetyHold" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "safetyHoldReason" TEXT;

-- CreateIndex
CREATE INDEX "RentalHost_stripeAccountId_idx" ON "public"."RentalHost"("stripeAccountId");
