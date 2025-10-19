/*
  Warnings:

  - Added the required column `updatedAt` to the `RentalPayout` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RentalPayout" ADD COLUMN     "bookingId" TEXT,
ADD COLUMN     "eligibleAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "RentalPayout_eligibleAt_status_idx" ON "RentalPayout"("eligibleAt", "status");

-- CreateIndex
CREATE INDEX "RentalPayout_hostId_status_processedAt_idx" ON "RentalPayout"("hostId", "status", "processedAt");

-- AddForeignKey
ALTER TABLE "RentalPayout" ADD CONSTRAINT "RentalPayout_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
