-- AlterTable
ALTER TABLE "RentalBooking" ADD COLUMN     "guestGpsDistance" DOUBLE PRECISION,
ADD COLUMN     "guestGpsLatitude" DOUBLE PRECISION,
ADD COLUMN     "guestGpsLongitude" DOUBLE PRECISION,
ADD COLUMN     "guestGpsVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "handoffAutoFallbackAt" TIMESTAMP(3),
ADD COLUMN     "handoffStatus" TEXT,
ADD COLUMN     "hostHandoffDistance" DOUBLE PRECISION,
ADD COLUMN     "hostHandoffLatitude" DOUBLE PRECISION,
ADD COLUMN     "hostHandoffLongitude" DOUBLE PRECISION,
ADD COLUMN     "hostHandoffVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "keyInstructionsDeliveredAt" TIMESTAMP(3),
ADD COLUMN     "vehicleMatchCheckedAt" TIMESTAMP(3),
ADD COLUMN     "vehicleMatchResult" JSONB;

-- AlterTable
ALTER TABLE "RentalCar" ADD COLUMN     "keyInstructions" TEXT;
