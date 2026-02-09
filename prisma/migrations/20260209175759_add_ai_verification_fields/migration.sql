-- AlterTable
ALTER TABLE "RentalBooking" ADD COLUMN     "aiVerificationAt" TIMESTAMP(3),
ADD COLUMN     "aiVerificationModel" TEXT,
ADD COLUMN     "aiVerificationResult" JSONB,
ADD COLUMN     "aiVerificationScore" DOUBLE PRECISION;
