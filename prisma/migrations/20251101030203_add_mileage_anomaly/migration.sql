-- AlterTable
ALTER TABLE "RentalCar" ADD COLUMN     "lastRentalEndDate" TIMESTAMP(3),
ADD COLUMN     "lastRentalEndMileage" INTEGER;

-- CreateTable
CREATE TABLE "MileageAnomaly" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastKnownMileage" INTEGER NOT NULL,
    "currentMileage" INTEGER NOT NULL,
    "gapMiles" INTEGER NOT NULL,
    "severity" TEXT NOT NULL,
    "explanation" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MileageAnomaly_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MileageAnomaly_carId_idx" ON "MileageAnomaly"("carId");

-- CreateIndex
CREATE INDEX "MileageAnomaly_severity_idx" ON "MileageAnomaly"("severity");

-- CreateIndex
CREATE INDEX "MileageAnomaly_resolved_idx" ON "MileageAnomaly"("resolved");

-- CreateIndex
CREATE INDEX "MileageAnomaly_detectedAt_idx" ON "MileageAnomaly"("detectedAt");

-- AddForeignKey
ALTER TABLE "MileageAnomaly" ADD CONSTRAINT "MileageAnomaly_carId_fkey" FOREIGN KEY ("carId") REFERENCES "RentalCar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
