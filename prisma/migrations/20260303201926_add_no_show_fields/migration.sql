-- AlterTable
ALTER TABLE "RentalBooking" ADD COLUMN     "noShowDeadline" TIMESTAMP(3),
ADD COLUMN     "noShowFeeCharged" DECIMAL(65,30),
ADD COLUMN     "noShowFeeStatus" TEXT,
ADD COLUMN     "noShowMarkedAt" TIMESTAMP(3),
ADD COLUMN     "noShowMarkedBy" TEXT,
ADD COLUMN     "pickupExtendedTo" TIMESTAMP(3),
ADD COLUMN     "pickupExtensionCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ReviewerProfile" ADD COLUMN     "noShowCount" INTEGER NOT NULL DEFAULT 0;
