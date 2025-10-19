-- CreateEnum
CREATE TYPE "EarningsTier" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');

-- CreateEnum
CREATE TYPE "InsuranceStatus" AS ENUM ('NONE', 'PENDING', 'ACTIVE', 'DEACTIVATED', 'EXPIRED', 'SUSPENDED');

-- AlterTable
ALTER TABLE "RentalHost" ADD COLUMN     "commercialInsuranceActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "commercialInsuranceExpires" TIMESTAMP(3),
ADD COLUMN     "commercialInsuranceProvider" TEXT,
ADD COLUMN     "commercialInsuranceStatus" "InsuranceStatus",
ADD COLUMN     "commercialPolicyNumber" TEXT,
ADD COLUMN     "earningsTier" "EarningsTier" NOT NULL DEFAULT 'BASIC',
ADD COLUMN     "lastTierChange" TIMESTAMP(3),
ADD COLUMN     "p2pInsuranceActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "p2pInsuranceExpires" TIMESTAMP(3),
ADD COLUMN     "p2pInsuranceProvider" TEXT,
ADD COLUMN     "p2pInsuranceStatus" "InsuranceStatus",
ADD COLUMN     "p2pPolicyNumber" TEXT,
ADD COLUMN     "tierChangeBy" TEXT,
ADD COLUMN     "tierChangeReason" TEXT,
ADD COLUMN     "usingLegacyInsurance" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "RentalHost_earningsTier_idx" ON "RentalHost"("earningsTier");

-- CreateIndex
CREATE INDEX "RentalHost_p2pInsuranceStatus_idx" ON "RentalHost"("p2pInsuranceStatus");

-- CreateIndex
CREATE INDEX "RentalHost_commercialInsuranceStatus_idx" ON "RentalHost"("commercialInsuranceStatus");

-- CreateIndex
CREATE INDEX "RentalHost_usingLegacyInsurance_idx" ON "RentalHost"("usingLegacyInsurance");
