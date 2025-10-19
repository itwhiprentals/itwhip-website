/*
  Warnings:

  - You are about to drop the column `platformInsuranceActive` on the `RentalHost` table. All the data in the column will be lost.
  - You are about to drop the column `platformInsuranceProvider` on the `RentalHost` table. All the data in the column will be lost.
  - You are about to drop the column `platformPolicyNumber` on the `RentalHost` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[carId,providerId]` on the table `VehicleInsuranceOverride` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `change` to the `InsuranceRateHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `changeType` to the `InsuranceRateHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InsuranceRateHistory" ADD COLUMN     "change" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "changePercent" DOUBLE PRECISION,
ADD COLUMN     "changeType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RentalHost" DROP COLUMN "platformInsuranceActive",
DROP COLUMN "platformInsuranceProvider",
DROP COLUMN "platformPolicyNumber",
ADD COLUMN     "insuranceActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "insuranceAssignedAt" TIMESTAMP(3),
ADD COLUMN     "insuranceAssignedBy" TEXT,
ADD COLUMN     "insurancePolicyNumber" TEXT,
ADD COLUMN     "insuranceProviderId" TEXT;

-- CreateIndex
CREATE INDEX "InsuranceRateHistory_tier_idx" ON "InsuranceRateHistory"("tier");

-- CreateIndex
CREATE INDEX "InsuranceRateHistory_vehicleClass_idx" ON "InsuranceRateHistory"("vehicleClass");

-- CreateIndex
CREATE INDEX "RentalHost_insuranceProviderId_idx" ON "RentalHost"("insuranceProviderId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleInsuranceOverride_carId_providerId_key" ON "VehicleInsuranceOverride"("carId", "providerId");

-- AddForeignKey
ALTER TABLE "RentalHost" ADD CONSTRAINT "RentalHost_insuranceProviderId_fkey" FOREIGN KEY ("insuranceProviderId") REFERENCES "InsuranceProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleInsuranceOverride" ADD CONSTRAINT "VehicleInsuranceOverride_carId_fkey" FOREIGN KEY ("carId") REFERENCES "RentalCar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
