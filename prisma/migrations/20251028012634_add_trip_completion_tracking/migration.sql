-- AlterEnum
ALTER TYPE "public"."ClaimStatus" ADD VALUE 'GUEST_RESPONDED';

-- AlterTable
ALTER TABLE "public"."RentalBooking" ADD COLUMN     "adminCompletedById" TEXT,
ADD COLUMN     "adminCompletionNotes" TEXT,
ADD COLUMN     "tripCompletedBy" TEXT;
