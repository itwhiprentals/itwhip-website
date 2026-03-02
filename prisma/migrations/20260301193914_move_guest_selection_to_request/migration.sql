-- AlterTable
ALTER TABLE "reservation_requests" ADD COLUMN     "existingBookingId" TEXT,
ADD COLUMN     "existingGuestId" TEXT,
ADD COLUMN     "guestSelectionType" TEXT NOT NULL DEFAULT 'NEW';

-- CreateIndex
CREATE INDEX "reservation_requests_existingGuestId_idx" ON "reservation_requests"("existingGuestId");

-- CreateIndex
CREATE INDEX "reservation_requests_existingBookingId_idx" ON "reservation_requests"("existingBookingId");
