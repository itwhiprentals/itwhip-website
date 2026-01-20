-- AlterTable
ALTER TABLE "RentalHost" ADD COLUMN     "isExternalRecruit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recruitedAt" TIMESTAMP(3),
ADD COLUMN     "recruitedVia" TEXT;

-- AlterTable
ALTER TABLE "host_prospects" ADD COLUMN     "emailOpenCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastActivityAt" TIMESTAMP(3),
ADD COLUMN     "pageViewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pageViewedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "RentalHost_isExternalRecruit_idx" ON "RentalHost"("isExternalRecruit");
