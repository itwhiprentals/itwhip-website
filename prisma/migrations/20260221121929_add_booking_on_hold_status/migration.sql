-- AlterEnum
ALTER TYPE "RentalBookingStatus" ADD VALUE 'ON_HOLD';

-- AlterTable
ALTER TABLE "RentalBooking" ADD COLUMN     "heldAt" TIMESTAMP(3),
ADD COLUMN     "heldBy" TEXT,
ADD COLUMN     "holdDeadline" TIMESTAMP(3),
ADD COLUMN     "holdDocumentTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "holdMessage" TEXT,
ADD COLUMN     "holdReason" TEXT,
ADD COLUMN     "previousStatus" TEXT;
