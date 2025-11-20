-- AlterTable
ALTER TABLE "public"."Claim" ADD COLUMN     "incidentAddress" TEXT,
ADD COLUMN     "incidentCity" TEXT,
ADD COLUMN     "incidentLatitude" DOUBLE PRECISION,
ADD COLUMN     "incidentLongitude" DOUBLE PRECISION,
ADD COLUMN     "incidentState" TEXT,
ADD COLUMN     "incidentZip" TEXT,
ADD COLUMN     "policeReportNumber" TEXT,
ADD COLUMN     "roadConditions" TEXT,
ADD COLUMN     "weatherConditions" TEXT,
ADD COLUMN     "witnesses" JSONB;

-- AlterTable
ALTER TABLE "public"."RentalCar" ADD COLUMN     "lienholderAddress" TEXT;

-- AlterTable
ALTER TABLE "public"."ReviewerProfile" ADD COLUMN     "driverLicenseExpiry" TIMESTAMP(3),
ADD COLUMN     "driverLicenseNumber" TEXT,
ADD COLUMN     "driverLicenseState" TEXT;

-- CreateIndex
CREATE INDEX "Claim_incidentCity_idx" ON "public"."Claim"("incidentCity");

-- CreateIndex
CREATE INDEX "Claim_incidentState_idx" ON "public"."Claim"("incidentState");

-- CreateIndex
CREATE INDEX "Claim_policeReportNumber_idx" ON "public"."Claim"("policeReportNumber");

-- CreateIndex
CREATE INDEX "ReviewerProfile_driverLicenseNumber_idx" ON "public"."ReviewerProfile"("driverLicenseNumber");

-- CreateIndex
CREATE INDEX "ReviewerProfile_driverLicenseExpiry_idx" ON "public"."ReviewerProfile"("driverLicenseExpiry");
