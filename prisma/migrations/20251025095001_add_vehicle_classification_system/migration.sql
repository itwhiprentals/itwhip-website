-- CreateEnum
CREATE TYPE "public"."VehicleCategory" AS ENUM ('ECONOMY', 'STANDARD', 'PREMIUM', 'LUXURY', 'EXOTIC', 'SUPERCAR');

-- CreateEnum
CREATE TYPE "public"."RiskCategory" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'EXTREME');

-- CreateEnum
CREATE TYPE "public"."CoverageOverrideType" AS ENUM ('FULL_APPROVAL', 'PARTIAL_APPROVAL', 'CUSTOM_PRICING', 'TIER_RESTRICTION', 'TEMPORARY_APPROVAL', 'MANUAL_REVIEW');

-- AlterTable
ALTER TABLE "public"."InsuranceProvider" ADD COLUMN     "vehicleRules" JSONB;

-- AlterTable
ALTER TABLE "public"."RentalCar" ADD COLUMN     "classificationId" TEXT,
ADD COLUMN     "estimatedValue" DECIMAL(12,2),
ADD COLUMN     "insuranceCategory" TEXT,
ADD COLUMN     "insuranceEligible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "insuranceNotes" TEXT,
ADD COLUMN     "insuranceRiskLevel" TEXT,
ADD COLUMN     "requiresManualUnderwriting" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."VehicleClassification" (
    "id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "category" "public"."VehicleCategory" NOT NULL,
    "riskLevel" "public"."RiskCategory" NOT NULL,
    "baseValue" DECIMAL(12,2) NOT NULL,
    "currentValue" DECIMAL(12,2) NOT NULL,
    "valueSource" TEXT,
    "lastValueCheck" TIMESTAMP(3),
    "features" JSONB,
    "isInsurable" BOOLEAN NOT NULL DEFAULT true,
    "insurabilityReason" TEXT,
    "requiresManualReview" BOOLEAN NOT NULL DEFAULT false,
    "baseRateMultiplier" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "riskMultiplier" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "providerId" TEXT,
    "providerSpecificRules" JSONB,
    "notes" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleClassification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VehicleCoverageOverride" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "vin" TEXT,
    "providerId" TEXT NOT NULL,
    "overrideType" "public"."CoverageOverrideType" NOT NULL,
    "customRules" JSONB NOT NULL,
    "reason" TEXT NOT NULL,
    "approvedBy" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleCoverageOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VehicleClassification_make_model_idx" ON "public"."VehicleClassification"("make", "model");

-- CreateIndex
CREATE INDEX "VehicleClassification_category_idx" ON "public"."VehicleClassification"("category");

-- CreateIndex
CREATE INDEX "VehicleClassification_riskLevel_idx" ON "public"."VehicleClassification"("riskLevel");

-- CreateIndex
CREATE INDEX "VehicleClassification_baseValue_idx" ON "public"."VehicleClassification"("baseValue");

-- CreateIndex
CREATE INDEX "VehicleClassification_isInsurable_idx" ON "public"."VehicleClassification"("isInsurable");

-- CreateIndex
CREATE INDEX "VehicleClassification_providerId_idx" ON "public"."VehicleClassification"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleClassification_make_model_year_providerId_key" ON "public"."VehicleClassification"("make", "model", "year", "providerId");

-- CreateIndex
CREATE INDEX "VehicleCoverageOverride_carId_idx" ON "public"."VehicleCoverageOverride"("carId");

-- CreateIndex
CREATE INDEX "VehicleCoverageOverride_providerId_idx" ON "public"."VehicleCoverageOverride"("providerId");

-- CreateIndex
CREATE INDEX "VehicleCoverageOverride_vin_idx" ON "public"."VehicleCoverageOverride"("vin");

-- CreateIndex
CREATE INDEX "VehicleCoverageOverride_expiresAt_idx" ON "public"."VehicleCoverageOverride"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleCoverageOverride_carId_providerId_key" ON "public"."VehicleCoverageOverride"("carId", "providerId");

-- CreateIndex
CREATE INDEX "RentalCar_classificationId_idx" ON "public"."RentalCar"("classificationId");

-- CreateIndex
CREATE INDEX "RentalCar_make_model_year_idx" ON "public"."RentalCar"("make", "model", "year");

-- CreateIndex
CREATE INDEX "RentalCar_vin_idx" ON "public"."RentalCar"("vin");

-- CreateIndex
CREATE INDEX "RentalCar_insuranceEligible_idx" ON "public"."RentalCar"("insuranceEligible");

-- AddForeignKey
ALTER TABLE "public"."VehicleClassification" ADD CONSTRAINT "VehicleClassification_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."InsuranceProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VehicleCoverageOverride" ADD CONSTRAINT "VehicleCoverageOverride_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."InsuranceProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VehicleCoverageOverride" ADD CONSTRAINT "VehicleCoverageOverride_carId_fkey" FOREIGN KEY ("carId") REFERENCES "public"."RentalCar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RentalCar" ADD CONSTRAINT "RentalCar_classificationId_fkey" FOREIGN KEY ("classificationId") REFERENCES "public"."VehicleClassification"("id") ON DELETE SET NULL ON UPDATE CASCADE;
