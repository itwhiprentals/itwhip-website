-- CreateEnum
CREATE TYPE "SuspensionLevel" AS ENUM ('SOFT', 'HARD', 'BANNED');

-- CreateEnum
CREATE TYPE "ModerationType" AS ENUM ('WARNING', 'SUSPEND', 'UNSUSPEND', 'BAN', 'UNBAN', 'RESTRICTION_ADDED', 'RESTRICTION_REMOVED', 'NOTE_ADDED');

-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'DENIED', 'WITHDRAWN');

-- AlterTable
ALTER TABLE "ReviewerProfile" ADD COLUMN     "autoReactivate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "bannedAt" TIMESTAMP(3),
ADD COLUMN     "bannedBy" TEXT,
ADD COLUMN     "lastWarningAt" TIMESTAMP(3),
ADD COLUMN     "notificationSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifiedAt" TIMESTAMP(3),
ADD COLUMN     "suspendedAt" TIMESTAMP(3),
ADD COLUMN     "suspendedBy" TEXT,
ADD COLUMN     "suspendedReason" TEXT,
ADD COLUMN     "suspensionExpiresAt" TIMESTAMP(3),
ADD COLUMN     "suspensionLevel" "SuspensionLevel",
ADD COLUMN     "warningCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "GuestModeration" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "actionType" "ModerationType" NOT NULL,
    "suspensionLevel" "SuspensionLevel",
    "publicReason" TEXT NOT NULL,
    "internalNotes" TEXT,
    "internalNotesOnly" BOOLEAN NOT NULL DEFAULT false,
    "takenBy" TEXT NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "relatedBookingId" TEXT,
    "relatedClaimId" TEXT,

    CONSTRAINT "GuestModeration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestAppeal" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "moderationId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "evidence" JSONB,
    "status" "AppealStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestAppeal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GuestModeration_guestId_takenAt_idx" ON "GuestModeration"("guestId", "takenAt");

-- CreateIndex
CREATE INDEX "GuestModeration_actionType_idx" ON "GuestModeration"("actionType");

-- CreateIndex
CREATE INDEX "GuestModeration_takenBy_idx" ON "GuestModeration"("takenBy");

-- CreateIndex
CREATE INDEX "GuestModeration_expiresAt_idx" ON "GuestModeration"("expiresAt");

-- CreateIndex
CREATE INDEX "GuestAppeal_guestId_idx" ON "GuestAppeal"("guestId");

-- CreateIndex
CREATE INDEX "GuestAppeal_status_idx" ON "GuestAppeal"("status");

-- CreateIndex
CREATE INDEX "GuestAppeal_moderationId_idx" ON "GuestAppeal"("moderationId");

-- CreateIndex
CREATE INDEX "ReviewerProfile_suspensionLevel_idx" ON "ReviewerProfile"("suspensionLevel");

-- CreateIndex
CREATE INDEX "ReviewerProfile_suspendedAt_idx" ON "ReviewerProfile"("suspendedAt");

-- CreateIndex
CREATE INDEX "ReviewerProfile_bannedAt_idx" ON "ReviewerProfile"("bannedAt");

-- CreateIndex
CREATE INDEX "ReviewerProfile_suspensionExpiresAt_idx" ON "ReviewerProfile"("suspensionExpiresAt");

-- CreateIndex
CREATE INDEX "ReviewerProfile_userId_suspensionLevel_idx" ON "ReviewerProfile"("userId", "suspensionLevel");

-- CreateIndex
CREATE INDEX "ReviewerProfile_warningCount_idx" ON "ReviewerProfile"("warningCount");

-- AddForeignKey
ALTER TABLE "GuestModeration" ADD CONSTRAINT "GuestModeration_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "ReviewerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestAppeal" ADD CONSTRAINT "GuestAppeal_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "ReviewerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestAppeal" ADD CONSTRAINT "GuestAppeal_moderationId_fkey" FOREIGN KEY ("moderationId") REFERENCES "GuestModeration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
