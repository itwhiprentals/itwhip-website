-- AlterTable
ALTER TABLE "RentalHost" ADD COLUMN     "businessApprovalStatus" TEXT NOT NULL DEFAULT 'NONE',
ADD COLUMN     "businessApprovedAt" TIMESTAMP(3),
ADD COLUMN     "businessApprovedBy" TEXT,
ADD COLUMN     "businessRejectedReason" TEXT,
ADD COLUMN     "businessSubmittedAt" TIMESTAMP(3),
ADD COLUMN     "isBusinessHost" BOOLEAN NOT NULL DEFAULT false;
