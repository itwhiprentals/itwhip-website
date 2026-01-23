-- CreateEnum
CREATE TYPE "GuestProspectStatus" AS ENUM ('DRAFT', 'INVITED', 'CLICKED', 'CONVERTED', 'EXPIRED');

-- AlterTable
ALTER TABLE "ReviewerProfile" ADD COLUMN     "recruitedAt" TIMESTAMP(3),
ADD COLUMN     "recruitedVia" TEXT;

-- CreateTable
CREATE TABLE "guest_prospects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "notes" TEXT,
    "source" TEXT DEFAULT 'admin_invite',
    "creditAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditType" TEXT NOT NULL DEFAULT 'credit',
    "creditNote" TEXT,
    "creditExpirationDays" INTEGER,
    "inviteToken" TEXT,
    "inviteTokenExp" TIMESTAMP(3),
    "inviteSentAt" TIMESTAMP(3),
    "inviteResendCount" INTEGER NOT NULL DEFAULT 0,
    "lastResendAt" TIMESTAMP(3),
    "emailOpenedAt" TIMESTAMP(3),
    "emailOpenCount" INTEGER NOT NULL DEFAULT 0,
    "linkClickedAt" TIMESTAMP(3),
    "linkClickCount" INTEGER NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3),
    "expiredAccessCount" INTEGER NOT NULL DEFAULT 0,
    "lastExpiredAccessAt" TIMESTAMP(3),
    "status" "GuestProspectStatus" NOT NULL DEFAULT 'DRAFT',
    "convertedAt" TIMESTAMP(3),
    "convertedProfileId" TEXT,
    "creditAppliedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "guest_prospects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_prospect_activities" (
    "id" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guest_prospect_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guest_prospects_inviteToken_key" ON "guest_prospects"("inviteToken");

-- CreateIndex
CREATE UNIQUE INDEX "guest_prospects_convertedProfileId_key" ON "guest_prospects"("convertedProfileId");

-- CreateIndex
CREATE INDEX "guest_prospects_email_idx" ON "guest_prospects"("email");

-- CreateIndex
CREATE INDEX "guest_prospects_status_idx" ON "guest_prospects"("status");

-- CreateIndex
CREATE INDEX "guest_prospects_inviteToken_idx" ON "guest_prospects"("inviteToken");

-- CreateIndex
CREATE INDEX "guest_prospects_convertedProfileId_idx" ON "guest_prospects"("convertedProfileId");

-- CreateIndex
CREATE INDEX "guest_prospect_activities_prospectId_idx" ON "guest_prospect_activities"("prospectId");

-- CreateIndex
CREATE INDEX "guest_prospect_activities_activityType_idx" ON "guest_prospect_activities"("activityType");

-- CreateIndex
CREATE INDEX "guest_prospect_activities_createdAt_idx" ON "guest_prospect_activities"("createdAt");

-- AddForeignKey
ALTER TABLE "guest_prospects" ADD CONSTRAINT "guest_prospects_convertedProfileId_fkey" FOREIGN KEY ("convertedProfileId") REFERENCES "ReviewerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_prospect_activities" ADD CONSTRAINT "guest_prospect_activities_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "guest_prospects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
