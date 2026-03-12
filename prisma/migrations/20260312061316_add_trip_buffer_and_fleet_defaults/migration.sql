-- AlterTable
ALTER TABLE "RentalBooking" ADD COLUMN     "markedReadyAt" TIMESTAMP(3),
ADD COLUMN     "markedReadyBy" TEXT;

-- AlterTable
ALTER TABLE "RentalCar" ADD COLUMN     "allow24HourPickup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tripBuffer" INTEGER NOT NULL DEFAULT 3;

-- AlterTable
ALTER TABLE "RentalHost" ADD COLUMN     "defaultAdvanceNotice" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "defaultAllow24HourPickup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "defaultInstantBook" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "defaultTripBuffer" INTEGER NOT NULL DEFAULT 3;
