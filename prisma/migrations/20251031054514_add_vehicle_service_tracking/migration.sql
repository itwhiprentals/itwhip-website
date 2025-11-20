-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('OIL_CHANGE', 'STATE_INSPECTION', 'TIRE_ROTATION', 'BRAKE_CHECK', 'FLUID_CHECK', 'BATTERY_CHECK', 'AIR_FILTER', 'MAJOR_SERVICE_30K', 'MAJOR_SERVICE_60K', 'MAJOR_SERVICE_90K', 'CUSTOM');

-- AlterTable
ALTER TABLE "RentalCar" ADD COLUMN     "highUsageInspectionNeeded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "inspectionExpired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "inspectionExpiresAt" TIMESTAMP(3),
ADD COLUMN     "lastInspection" TIMESTAMP(3),
ADD COLUMN     "lastOilChange" TIMESTAMP(3),
ADD COLUMN     "nextInspectionDue" TIMESTAMP(3),
ADD COLUMN     "nextOilChangeDue" TIMESTAMP(3),
ADD COLUMN     "serviceOverdue" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "VehicleServiceRecord" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "mileageAtService" INTEGER NOT NULL,
    "nextServiceDue" TIMESTAMP(3),
    "nextServiceMileage" INTEGER,
    "shopName" TEXT NOT NULL,
    "shopAddress" TEXT NOT NULL,
    "technicianName" TEXT,
    "invoiceNumber" TEXT,
    "receiptUrl" TEXT NOT NULL,
    "inspectionReportUrl" TEXT,
    "itemsServiced" TEXT[],
    "costTotal" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "verifiedByFleet" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleServiceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VehicleServiceRecord_carId_serviceDate_idx" ON "VehicleServiceRecord"("carId", "serviceDate");

-- CreateIndex
CREATE INDEX "VehicleServiceRecord_carId_serviceType_idx" ON "VehicleServiceRecord"("carId", "serviceType");

-- AddForeignKey
ALTER TABLE "VehicleServiceRecord" ADD CONSTRAINT "VehicleServiceRecord_carId_fkey" FOREIGN KEY ("carId") REFERENCES "RentalCar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
