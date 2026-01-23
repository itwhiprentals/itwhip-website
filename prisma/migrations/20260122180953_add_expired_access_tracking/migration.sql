-- AlterTable
ALTER TABLE "host_prospects" ADD COLUMN     "expiredAccessCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastExpiredAccessAt" TIMESTAMP(3);
