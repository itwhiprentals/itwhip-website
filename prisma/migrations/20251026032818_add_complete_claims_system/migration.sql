-- CreateEnum
CREATE TYPE "public"."AccountHoldReason" AS ENUM ('ACTIVE_CLAIM', 'PAYMENT_DISPUTE', 'FRAUD_INVESTIGATION', 'GUEST_NO_RESPONSE', 'PENDING_INSURANCE_REVIEW', 'MULTIPLE_VIOLATIONS', 'ADMIN_HOLD');

-- CreateEnum
CREATE TYPE "public"."VehicleDeactivationReason" AS ENUM ('ACTIVE_CLAIM', 'PENDING_REPAIRS', 'INSURANCE_REVIEW', 'SAFETY_CONCERN', 'HOST_REQUEST', 'ADMIN_HOLD');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."ClaimStatus" ADD VALUE 'GUEST_RESPONSE_PENDING';
ALTER TYPE "public"."ClaimStatus" ADD VALUE 'GUEST_NO_RESPONSE';
ALTER TYPE "public"."ClaimStatus" ADD VALUE 'VEHICLE_REPAIR_PENDING';
ALTER TYPE "public"."ClaimStatus" ADD VALUE 'INSURANCE_PROCESSING';
ALTER TYPE "public"."ClaimStatus" ADD VALUE 'CLOSED';

-- AlterTable
ALTER TABLE "public"."Claim" ADD COLUMN     "accountHoldApplied" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "activityLog" JSONB,
ADD COLUMN     "escalationSentAt" TIMESTAMP(3),
ADD COLUMN     "guestNotifiedAt" TIMESTAMP(3),
ADD COLUMN     "guestResponseDate" TIMESTAMP(3),
ADD COLUMN     "guestResponseDeadline" TIMESTAMP(3),
ADD COLUMN     "guestResponsePhotos" JSONB,
ADD COLUMN     "guestResponseText" TEXT,
ADD COLUMN     "hostNotifiedAt" TIMESTAMP(3),
ADD COLUMN     "lastMessageAt" TIMESTAMP(3),
ADD COLUMN     "reactivationNotes" TEXT,
ADD COLUMN     "reminderSentAt" TIMESTAMP(3),
ADD COLUMN     "repairDocumentUrls" JSONB,
ADD COLUMN     "safetyChecklistData" JSONB,
ADD COLUMN     "statusHistory" JSONB,
ADD COLUMN     "unreadMessagesCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vehicleDeactivated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vehicleReactivatedAt" TIMESTAMP(3),
ADD COLUMN     "vehicleReactivatedBy" TEXT;

-- AlterTable
ALTER TABLE "public"."RentalBooking" ADD COLUMN     "guestInsuranceActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "guestInsurancePolicyNumber" TEXT,
ADD COLUMN     "guestInsuranceProvider" TEXT,
ADD COLUMN     "insuranceHierarchy" JSONB;

-- AlterTable
ALTER TABLE "public"."RentalCar" ADD COLUMN     "activeClaimId" TEXT,
ADD COLUMN     "claimDeactivatedAt" TIMESTAMP(3),
ADD COLUMN     "claimFreeMonths" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "hasActiveClaim" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastClaimDate" TIMESTAMP(3),
ADD COLUMN     "totalClaimsCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."ReviewerProfile" ADD COLUMN     "accountHoldAppliedAt" TIMESTAMP(3),
ADD COLUMN     "accountHoldClaimId" TEXT,
ADD COLUMN     "accountHoldReason" TEXT,
ADD COLUMN     "accountOnHold" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."ClaimMessage" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "senderName" TEXT,
    "message" TEXT NOT NULL,
    "attachments" JSONB,
    "readBy" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClaimMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClaimMessage_claimId_idx" ON "public"."ClaimMessage"("claimId");

-- CreateIndex
CREATE INDEX "ClaimMessage_createdAt_idx" ON "public"."ClaimMessage"("createdAt");

-- CreateIndex
CREATE INDEX "ClaimMessage_senderType_idx" ON "public"."ClaimMessage"("senderType");

-- CreateIndex
CREATE INDEX "Claim_guestResponseDeadline_idx" ON "public"."Claim"("guestResponseDeadline");

-- CreateIndex
CREATE INDEX "Claim_vehicleDeactivated_idx" ON "public"."Claim"("vehicleDeactivated");

-- CreateIndex
CREATE INDEX "Claim_lastMessageAt_idx" ON "public"."Claim"("lastMessageAt");

-- CreateIndex
CREATE INDEX "RentalCar_hasActiveClaim_idx" ON "public"."RentalCar"("hasActiveClaim");

-- CreateIndex
CREATE INDEX "RentalCar_activeClaimId_idx" ON "public"."RentalCar"("activeClaimId");

-- CreateIndex
CREATE INDEX "RentalCar_totalClaimsCount_idx" ON "public"."RentalCar"("totalClaimsCount");

-- CreateIndex
CREATE INDEX "RentalCar_lastClaimDate_idx" ON "public"."RentalCar"("lastClaimDate");

-- CreateIndex
CREATE INDEX "ReviewerProfile_accountOnHold_idx" ON "public"."ReviewerProfile"("accountOnHold");

-- CreateIndex
CREATE INDEX "ReviewerProfile_accountHoldClaimId_idx" ON "public"."ReviewerProfile"("accountHoldClaimId");

-- AddForeignKey
ALTER TABLE "public"."ClaimMessage" ADD CONSTRAINT "ClaimMessage_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "public"."Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;
