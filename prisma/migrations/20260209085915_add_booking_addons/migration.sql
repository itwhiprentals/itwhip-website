-- AlterTable
ALTER TABLE "RentalBooking" ADD COLUMN     "additionalDriver" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enhancementsTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "extraMilesPackage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "refuelService" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vipConcierge" BOOLEAN NOT NULL DEFAULT false;
