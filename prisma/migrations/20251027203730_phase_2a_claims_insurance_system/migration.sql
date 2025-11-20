/*
  Warnings:

  - A unique constraint covering the columns `[bookingId,hostId]` on the table `Claim` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."RentalBooking" ADD COLUMN     "guestInsuranceApplied" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "guestInsuranceVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hostRevenueSplit" INTEGER;

-- AlterTable
ALTER TABLE "public"."RentalCar" ADD COLUMN     "repairVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."RentalHost" ADD COLUMN     "insuranceType" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN     "revenueSplit" INTEGER NOT NULL DEFAULT 40;

-- CreateTable
CREATE TABLE "public"."UserNotificationSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "claimFiled" BOOLEAN NOT NULL DEFAULT true,
    "claimApproved" BOOLEAN NOT NULL DEFAULT true,
    "claimDenied" BOOLEAN NOT NULL DEFAULT true,
    "fnolSubmitted" BOOLEAN NOT NULL DEFAULT true,
    "guestHoldNotice" BOOLEAN NOT NULL DEFAULT true,
    "responseReminder" BOOLEAN NOT NULL DEFAULT true,
    "claimResolved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNotificationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProviderMessage" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "sentBy" TEXT NOT NULL,
    "sentByName" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "attachments" JSONB,
    "relatedClaimId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "readAt" TIMESTAMP(3),
    "replyToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProviderDocument" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "previousVersionId" TEXT,
    "description" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GuestInsurance" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestInsurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AccountHold" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "claimId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountHold_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserNotificationSettings_userId_key" ON "public"."UserNotificationSettings"("userId");

-- CreateIndex
CREATE INDEX "UserNotificationSettings_userId_idx" ON "public"."UserNotificationSettings"("userId");

-- CreateIndex
CREATE INDEX "ProviderMessage_providerId_idx" ON "public"."ProviderMessage"("providerId");

-- CreateIndex
CREATE INDEX "ProviderMessage_category_idx" ON "public"."ProviderMessage"("category");

-- CreateIndex
CREATE INDEX "ProviderMessage_status_idx" ON "public"."ProviderMessage"("status");

-- CreateIndex
CREATE INDEX "ProviderMessage_relatedClaimId_idx" ON "public"."ProviderMessage"("relatedClaimId");

-- CreateIndex
CREATE INDEX "ProviderDocument_providerId_idx" ON "public"."ProviderDocument"("providerId");

-- CreateIndex
CREATE INDEX "ProviderDocument_category_idx" ON "public"."ProviderDocument"("category");

-- CreateIndex
CREATE INDEX "ProviderDocument_status_idx" ON "public"."ProviderDocument"("status");

-- CreateIndex
CREATE INDEX "ProviderDocument_expiresAt_idx" ON "public"."ProviderDocument"("expiresAt");

-- CreateIndex
CREATE INDEX "GuestInsurance_guestId_idx" ON "public"."GuestInsurance"("guestId");

-- CreateIndex
CREATE INDEX "GuestInsurance_verified_idx" ON "public"."GuestInsurance"("verified");

-- CreateIndex
CREATE INDEX "GuestInsurance_expiresAt_idx" ON "public"."GuestInsurance"("expiresAt");

-- CreateIndex
CREATE INDEX "AccountHold_guestId_idx" ON "public"."AccountHold"("guestId");

-- CreateIndex
CREATE INDEX "AccountHold_active_idx" ON "public"."AccountHold"("active");

-- CreateIndex
CREATE INDEX "AccountHold_claimId_idx" ON "public"."AccountHold"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_bookingId_hostId_key" ON "public"."Claim"("bookingId", "hostId");

-- AddForeignKey
ALTER TABLE "public"."UserNotificationSettings" ADD CONSTRAINT "UserNotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProviderMessage" ADD CONSTRAINT "ProviderMessage_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."InsuranceProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProviderDocument" ADD CONSTRAINT "ProviderDocument_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."InsuranceProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuestInsurance" ADD CONSTRAINT "GuestInsurance_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "public"."ReviewerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AccountHold" ADD CONSTRAINT "AccountHold_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "public"."ReviewerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
