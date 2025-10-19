-- AlterTable
ALTER TABLE "InsuranceProvider" ADD COLUMN     "apiEndpointPlaceholder" TEXT,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "contractEndDate" TIMESTAMP(3),
ADD COLUMN     "contractStartDate" TIMESTAMP(3),
ADD COLUMN     "coverageNotes" TEXT,
ADD COLUMN     "excludedMakes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "excludedModels" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "vehicleValueMax" DOUBLE PRECISION,
ADD COLUMN     "vehicleValueMin" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "InsuranceRateHistory" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "vehicleClass" TEXT NOT NULL,
    "oldRate" DOUBLE PRECISION NOT NULL,
    "newRate" DOUBLE PRECISION NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "changedBy" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InsuranceRateHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleInsuranceOverride" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "overriddenBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleInsuranceOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceNotification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sentTo" TEXT[],
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sentBy" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InsuranceNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InsuranceRateHistory_providerId_idx" ON "InsuranceRateHistory"("providerId");

-- CreateIndex
CREATE INDEX "InsuranceRateHistory_effectiveDate_idx" ON "InsuranceRateHistory"("effectiveDate");

-- CreateIndex
CREATE INDEX "VehicleInsuranceOverride_carId_idx" ON "VehicleInsuranceOverride"("carId");

-- CreateIndex
CREATE INDEX "VehicleInsuranceOverride_providerId_idx" ON "VehicleInsuranceOverride"("providerId");

-- CreateIndex
CREATE INDEX "InsuranceNotification_type_idx" ON "InsuranceNotification"("type");

-- CreateIndex
CREATE INDEX "InsuranceNotification_sentAt_idx" ON "InsuranceNotification"("sentAt");

-- AddForeignKey
ALTER TABLE "InsuranceRateHistory" ADD CONSTRAINT "InsuranceRateHistory_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "InsuranceProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleInsuranceOverride" ADD CONSTRAINT "VehicleInsuranceOverride_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "InsuranceProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
