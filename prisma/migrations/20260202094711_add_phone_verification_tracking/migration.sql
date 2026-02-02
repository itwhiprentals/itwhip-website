-- AlterTable
ALTER TABLE "ReviewerProfile" ADD COLUMN     "phoneVerificationAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "phoneVerificationSkipped" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneVerificationAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "phoneVerificationSkipped" BOOLEAN NOT NULL DEFAULT false;
