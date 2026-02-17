-- CreateEnum
CREATE TYPE "HostFinalReviewStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'CLAIM_FILED', 'AUTO_APPROVED');

-- AlterTable
ALTER TABLE "RentalBooking" ADD COLUMN     "hostFinalReviewAt" TIMESTAMP(3),
ADD COLUMN     "hostFinalReviewDeadline" TIMESTAMP(3),
ADD COLUMN     "hostFinalReviewStatus" "HostFinalReviewStatus";
