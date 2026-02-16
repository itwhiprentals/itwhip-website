-- AlterTable
ALTER TABLE "RentalBooking" ADD COLUMN     "guestArrivalSummary" TEXT,
ADD COLUMN     "guestEtaMessage" TEXT,
ADD COLUMN     "guestLiveDistance" DOUBLE PRECISION,
ADD COLUMN     "guestLiveLatitude" DOUBLE PRECISION,
ADD COLUMN     "guestLiveLongitude" DOUBLE PRECISION,
ADD COLUMN     "guestLiveUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "guestLocationTrust" DOUBLE PRECISION;
