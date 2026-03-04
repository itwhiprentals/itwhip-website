-- AlterTable
ALTER TABLE "RentalBooking" ADD COLUMN     "expirationReason" TEXT;

-- AlterTable
ALTER TABLE "reservation_requests" ADD COLUMN     "expirationReason" TEXT,
ADD COLUMN     "expiredAt" TIMESTAMP(3);
