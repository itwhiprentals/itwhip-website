/*
  Warnings:

  - A unique constraint covering the columns `[hostAccessToken]` on the table `RentalHost` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[convertedBookingId]` on the table `host_prospects` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CounterOfferStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- AlterTable
ALTER TABLE "RentalHost" ADD COLUMN     "declineReason" TEXT,
ADD COLUMN     "declinedRequestAt" TIMESTAMP(3),
ADD COLUMN     "hasPassword" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "hostAccessToken" TEXT,
ADD COLUMN     "hostAccessTokenExp" TIMESTAMP(3),
ADD COLUMN     "hostTokenLastUsedAt" TIMESTAMP(3),
ADD COLUMN     "hostTokenUsedFromIp" TEXT,
ADD COLUMN     "isRecruitedRequest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "linkedProspectId" TEXT,
ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "onboardingStartedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "host_prospects" ADD COLUMN     "agreementUploaded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "carPhotosUploaded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "convertedBookingId" TEXT,
ADD COLUMN     "counterOfferAmount" DOUBLE PRECISION,
ADD COLUMN     "counterOfferAt" TIMESTAMP(3),
ADD COLUMN     "counterOfferNote" TEXT,
ADD COLUMN     "counterOfferReviewedAt" TIMESTAMP(3),
ADD COLUMN     "counterOfferReviewedBy" TEXT,
ADD COLUMN     "counterOfferStatus" "CounterOfferStatus",
ADD COLUMN     "dashboardViewedAt" TIMESTAMP(3),
ADD COLUMN     "hostAgreementName" TEXT,
ADD COLUMN     "hostAgreementUrl" TEXT,
ADD COLUMN     "itwhipAgreementAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "linkClickCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "onboardingStartedAt" TIMESTAMP(3),
ADD COLUMN     "pageViewDuration" INTEGER,
ADD COLUMN     "payoutConnected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ratesConfigured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requestPageViewedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "prospect_activities" (
    "id" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prospect_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prospect_activities_prospectId_idx" ON "prospect_activities"("prospectId");

-- CreateIndex
CREATE INDEX "prospect_activities_activityType_idx" ON "prospect_activities"("activityType");

-- CreateIndex
CREATE INDEX "prospect_activities_createdAt_idx" ON "prospect_activities"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RentalHost_hostAccessToken_key" ON "RentalHost"("hostAccessToken");

-- CreateIndex
CREATE INDEX "RentalHost_isRecruitedRequest_idx" ON "RentalHost"("isRecruitedRequest");

-- CreateIndex
CREATE INDEX "RentalHost_hostAccessToken_idx" ON "RentalHost"("hostAccessToken");

-- CreateIndex
CREATE INDEX "RentalHost_linkedProspectId_idx" ON "RentalHost"("linkedProspectId");

-- CreateIndex
CREATE UNIQUE INDEX "host_prospects_convertedBookingId_key" ON "host_prospects"("convertedBookingId");

-- CreateIndex
CREATE INDEX "host_prospects_convertedBookingId_idx" ON "host_prospects"("convertedBookingId");

-- CreateIndex
CREATE INDEX "host_prospects_counterOfferStatus_idx" ON "host_prospects"("counterOfferStatus");

-- CreateIndex
CREATE INDEX "host_prospects_onboardingCompletedAt_idx" ON "host_prospects"("onboardingCompletedAt");

-- AddForeignKey
ALTER TABLE "host_prospects" ADD CONSTRAINT "host_prospects_convertedBookingId_fkey" FOREIGN KEY ("convertedBookingId") REFERENCES "RentalBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prospect_activities" ADD CONSTRAINT "prospect_activities_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "host_prospects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
