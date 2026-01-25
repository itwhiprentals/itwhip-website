-- AlterTable
ALTER TABLE "guest_prospects" ADD COLUMN     "creditPurpose" TEXT NOT NULL DEFAULT 'guest_invite',
ADD COLUMN     "referenceBooking" JSONB;
