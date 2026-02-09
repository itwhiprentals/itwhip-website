/*
  Warnings:

  - A unique constraint covering the columns `[vehicleChangeToken]` on the table `RentalBooking` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "RentalBooking" ADD COLUMN     "hostNotes" TEXT,
ADD COLUMN     "hostReviewedAt" TIMESTAMP(3),
ADD COLUMN     "hostReviewedBy" TEXT,
ADD COLUMN     "hostStatus" TEXT,
ADD COLUMN     "originalBookingId" TEXT,
ADD COLUMN     "originalCarId" TEXT,
ADD COLUMN     "vehicleChangeExpiresAt" TIMESTAMP(3),
ADD COLUMN     "vehicleChangeReason" TEXT,
ADD COLUMN     "vehicleChangeToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "RentalBooking_vehicleChangeToken_key" ON "RentalBooking"("vehicleChangeToken");

-- CreateIndex
CREATE INDEX "RentalBooking_hostStatus_idx" ON "RentalBooking"("hostStatus");

-- CreateIndex
CREATE INDEX "RentalBooking_vehicleChangeToken_idx" ON "RentalBooking"("vehicleChangeToken");
