/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `ReviewerProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "RentalBooking" ADD COLUMN     "reviewerProfileId" TEXT;

-- AlterTable
ALTER TABLE "ReviewerProfile" ADD COLUMN     "userId" TEXT,
ALTER COLUMN "tripCount" SET DEFAULT 0,
ALTER COLUMN "reviewCount" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "RentalBooking_reviewerProfileId_idx" ON "RentalBooking"("reviewerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewerProfile_userId_key" ON "ReviewerProfile"("userId");

-- CreateIndex
CREATE INDEX "ReviewerProfile_userId_idx" ON "ReviewerProfile"("userId");

-- AddForeignKey
ALTER TABLE "RentalBooking" ADD CONSTRAINT "RentalBooking_reviewerProfileId_fkey" FOREIGN KEY ("reviewerProfileId") REFERENCES "ReviewerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewerProfile" ADD CONSTRAINT "ReviewerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
