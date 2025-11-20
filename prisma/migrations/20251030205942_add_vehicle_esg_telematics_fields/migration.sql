-- AlterTable
ALTER TABLE "RentalCar" ADD COLUMN     "avgMilesPerTrip" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "avgResponseTime" INTEGER DEFAULT 0,
ADD COLUMN     "esgEnvironmentalScore" INTEGER,
ADD COLUMN     "esgLastCalculated" TIMESTAMP(3),
ADD COLUMN     "esgMaintenanceScore" INTEGER,
ADD COLUMN     "esgSafetyScore" INTEGER,
ADD COLUMN     "esgScore" INTEGER DEFAULT 50,
ADD COLUMN     "guestRatingAvg" DOUBLE PRECISION DEFAULT 5.0,
ADD COLUMN     "lastOdometerCheck" TIMESTAMP(3),
ADD COLUMN     "maintenanceCadence" INTEGER DEFAULT 90,
ADD COLUMN     "mileageVariance" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "suspiciousMileageFlag" BOOLEAN NOT NULL DEFAULT false;
