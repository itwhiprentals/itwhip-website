/*
  Warnings:

  - A unique constraint covering the columns `[fnolNumber]` on the table `Claim` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Claim" ADD COLUMN     "adjusterAssigned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "adjusterAssignedAt" TIMESTAMP(3),
ADD COLUMN     "adjusterEmail" TEXT,
ADD COLUMN     "adjusterName" TEXT,
ADD COLUMN     "adjusterPhone" TEXT,
ADD COLUMN     "claimClosedAt" TIMESTAMP(3),
ADD COLUMN     "claimOpenedAt" TIMESTAMP(3),
ADD COLUMN     "claimSubmittedToInsurer" TIMESTAMP(3),
ADD COLUMN     "fnolNumber" TEXT,
ADD COLUMN     "fnolStatus" TEXT DEFAULT 'NOT_STARTED',
ADD COLUMN     "fnolSubmittedAt" TIMESTAMP(3),
ADD COLUMN     "fnolSubmittedBy" TEXT;

-- CreateTable
CREATE TABLE "TripInspectionPhoto" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "photoType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "uploadedByType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gpsLatitude" DOUBLE PRECISION,
    "gpsLongitude" DOUBLE PRECISION,
    "photoTimestamp" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripInspectionPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TripInspectionPhoto_bookingId_idx" ON "TripInspectionPhoto"("bookingId");

-- CreateIndex
CREATE INDEX "TripInspectionPhoto_photoType_idx" ON "TripInspectionPhoto"("photoType");

-- CreateIndex
CREATE INDEX "TripInspectionPhoto_uploadedAt_idx" ON "TripInspectionPhoto"("uploadedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_fnolNumber_key" ON "Claim"("fnolNumber");

-- CreateIndex
CREATE INDEX "Claim_fnolStatus_idx" ON "Claim"("fnolStatus");

-- CreateIndex
CREATE INDEX "Claim_fnolNumber_idx" ON "Claim"("fnolNumber");

-- AddForeignKey
ALTER TABLE "TripInspectionPhoto" ADD CONSTRAINT "TripInspectionPhoto_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
