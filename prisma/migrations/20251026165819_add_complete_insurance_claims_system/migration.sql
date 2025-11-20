-- DropIndex
DROP INDEX "public"."RentalHost_stripeAccountId_idx";

-- AlterTable
ALTER TABLE "public"."RentalBooking" ADD COLUMN     "depositDiscountApplied" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "insuranceBoundAt" TIMESTAMP(3),
ADD COLUMN     "insurancePolicyId" TEXT,
ADD COLUMN     "insuranceProvider" TEXT,
ADD COLUMN     "insuranceSelection" TEXT,
ADD COLUMN     "insuranceStatus" TEXT,
ADD COLUMN     "insuranceTier" TEXT,
ADD COLUMN     "platformPolicyActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "policySnapshot" JSONB;

-- AlterTable
ALTER TABLE "public"."RentalHost" ALTER COLUMN "autoApproveBookings" SET DEFAULT true;

-- DropEnum
DROP TYPE "public"."AccountHoldReason";

-- DropEnum
DROP TYPE "public"."VehicleDeactivationReason";
