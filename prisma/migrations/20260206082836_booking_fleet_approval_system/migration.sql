/*
  Warnings:

  - A unique constraint covering the columns `[autoLoginToken]` on the table `RentalBooking` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "RentalBooking" ADD COLUMN     "aiFraudFlags" JSONB,
ADD COLUMN     "aiFraudScore" INTEGER,
ADD COLUMN     "aiLicenseConfidence" DOUBLE PRECISION,
ADD COLUMN     "aiLicenseData" JSONB,
ADD COLUMN     "aiLicenseVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "aiVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "autoLoginExpiresAt" TIMESTAMP(3),
ADD COLUMN     "autoLoginToken" TEXT,
ADD COLUMN     "fleetNotes" TEXT,
ADD COLUMN     "fleetReviewedAt" TIMESTAMP(3),
ADD COLUMN     "fleetReviewedBy" TEXT,
ADD COLUMN     "fleetStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "hostNotifiedAt" TIMESTAMP(3),
ADD COLUMN     "verificationSource" TEXT;

-- CreateTable
CREATE TABLE "booking_documents" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "aiAnalysis" JSONB,

    CONSTRAINT "booking_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_photos" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aiAnalysis" JSONB,
    "gpsLatitude" DOUBLE PRECISION,
    "gpsLongitude" DOUBLE PRECISION,
    "gpsVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "trip_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_documents_bookingId_idx" ON "booking_documents"("bookingId");

-- CreateIndex
CREATE INDEX "booking_documents_type_idx" ON "booking_documents"("type");

-- CreateIndex
CREATE INDEX "trip_photos_bookingId_phase_idx" ON "trip_photos"("bookingId", "phase");

-- CreateIndex
CREATE INDEX "trip_photos_uploadedBy_idx" ON "trip_photos"("uploadedBy");

-- CreateIndex
CREATE UNIQUE INDEX "RentalBooking_autoLoginToken_key" ON "RentalBooking"("autoLoginToken");

-- CreateIndex
CREATE INDEX "RentalBooking_fleetStatus_idx" ON "RentalBooking"("fleetStatus");

-- CreateIndex
CREATE INDEX "RentalBooking_autoLoginToken_idx" ON "RentalBooking"("autoLoginToken");

-- CreateIndex
CREATE INDEX "RentalBooking_fleetReviewedBy_idx" ON "RentalBooking"("fleetReviewedBy");

-- AddForeignKey
ALTER TABLE "booking_documents" ADD CONSTRAINT "booking_documents_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_photos" ADD CONSTRAINT "trip_photos_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
