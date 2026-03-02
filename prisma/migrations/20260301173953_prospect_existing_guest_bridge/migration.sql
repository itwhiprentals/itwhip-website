-- AlterTable
ALTER TABLE "RentalBooking" ADD COLUMN     "replacedByBookingId" TEXT,
ADD COLUMN     "vehicleAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vehicleAcceptedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "host_prospects" ADD COLUMN     "existingBookingId" TEXT,
ADD COLUMN     "existingGuestId" TEXT,
ADD COLUMN     "guestSelectionType" TEXT NOT NULL DEFAULT 'NEW';

-- CreateIndex
CREATE INDEX "RentalBooking_replacedByBookingId_idx" ON "RentalBooking"("replacedByBookingId");

-- CreateIndex
CREATE INDEX "host_prospects_existingGuestId_idx" ON "host_prospects"("existingGuestId");

-- CreateIndex
CREATE INDEX "host_prospects_existingBookingId_idx" ON "host_prospects"("existingBookingId");
