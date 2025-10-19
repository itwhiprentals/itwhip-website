/*
  Warnings:

  - You are about to drop the column `insuranceExpires` on the `ReviewerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `insurancePolicyNumber` on the `ReviewerProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ReviewerProfile" DROP COLUMN "insuranceExpires",
DROP COLUMN "insurancePolicyNumber",
ADD COLUMN     "coverageType" TEXT,
ADD COLUMN     "customCoverage" TEXT,
ADD COLUMN     "expiryDate" TIMESTAMP(3),
ADD COLUMN     "hasRideshare" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "insuranceAddedAt" TIMESTAMP(3),
ADD COLUMN     "insuranceCardBackUrl" TEXT,
ADD COLUMN     "insuranceCardFrontUrl" TEXT,
ADD COLUMN     "insuranceNotes" TEXT,
ADD COLUMN     "insuranceUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "insuranceVerifiedBy" TEXT,
ADD COLUMN     "policyNumber" TEXT;

-- CreateTable
CREATE TABLE "insurance_history" (
    "id" TEXT NOT NULL,
    "reviewerProfileId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "insuranceProvider" TEXT,
    "policyNumber" TEXT,
    "expiryDate" TIMESTAMP(3),
    "hasRideshare" BOOLEAN NOT NULL DEFAULT false,
    "coverageType" TEXT,
    "customCoverage" TEXT,
    "insuranceCardFrontUrl" TEXT,
    "insuranceCardBackUrl" TEXT,
    "insuranceNotes" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changeReason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "insurance_history_reviewerProfileId_idx" ON "insurance_history"("reviewerProfileId");

-- CreateIndex
CREATE INDEX "insurance_history_reviewerProfileId_status_idx" ON "insurance_history"("reviewerProfileId", "status");

-- CreateIndex
CREATE INDEX "insurance_history_expiryDate_idx" ON "insurance_history"("expiryDate");

-- CreateIndex
CREATE INDEX "insurance_history_verificationStatus_idx" ON "insurance_history"("verificationStatus");

-- CreateIndex
CREATE INDEX "ReviewerProfile_insuranceVerified_idx" ON "ReviewerProfile"("insuranceVerified");

-- CreateIndex
CREATE INDEX "ReviewerProfile_expiryDate_idx" ON "ReviewerProfile"("expiryDate");

-- AddForeignKey
ALTER TABLE "insurance_history" ADD CONSTRAINT "insurance_history_reviewerProfileId_fkey" FOREIGN KEY ("reviewerProfileId") REFERENCES "ReviewerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
