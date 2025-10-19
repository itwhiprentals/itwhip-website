-- CreateEnum
CREATE TYPE "WarningCategory" AS ENUM ('LATE_RETURNS', 'VEHICLE_DAMAGE', 'CLEANLINESS_ISSUES', 'MILEAGE_VIOLATIONS', 'POLICY_VIOLATIONS', 'FRAUDULENT_ACTIVITY', 'PAYMENT_ISSUES', 'COMMUNICATION_ISSUES', 'INAPPROPRIATE_BEHAVIOR', 'UNAUTHORIZED_DRIVER', 'SMOKING_VIOLATION', 'PET_VIOLATION', 'FUEL_VIOLATIONS', 'DOCUMENTATION_ISSUES', 'OTHER');

-- AlterTable
ALTER TABLE "GuestModeration" ADD COLUMN     "restrictionsApplied" JSONB,
ADD COLUMN     "warningCategory" "WarningCategory";

-- AlterTable
ALTER TABLE "ReviewerProfile" ADD COLUMN     "activeWarningCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "canBookLuxury" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "canBookPremium" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "requiresManualApproval" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "GuestModeration_warningCategory_idx" ON "GuestModeration"("warningCategory");

-- CreateIndex
CREATE INDEX "ReviewerProfile_activeWarningCount_idx" ON "ReviewerProfile"("activeWarningCount");

-- CreateIndex
CREATE INDEX "ReviewerProfile_canBookLuxury_idx" ON "ReviewerProfile"("canBookLuxury");

-- CreateIndex
CREATE INDEX "ReviewerProfile_canBookPremium_idx" ON "ReviewerProfile"("canBookPremium");

-- CreateIndex
CREATE INDEX "ReviewerProfile_requiresManualApproval_idx" ON "ReviewerProfile"("requiresManualApproval");
