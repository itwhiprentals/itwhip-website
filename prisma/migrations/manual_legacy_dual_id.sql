-- Manual Migration: Add Legacy Dual ID System
-- NO DATA WILL BE LOST - Only adding new nullable fields

-- Add legacyDualId to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "legacyDualId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "User_legacyDualId_key" ON "User"("legacyDualId");
CREATE INDEX IF NOT EXISTS "User_legacyDualId_idx" ON "User"("legacyDualId");

-- Add legacyDualId to RentalHost table
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "legacyDualId" TEXT;
CREATE INDEX IF NOT EXISTS "RentalHost_legacyDualId_idx" ON "RentalHost"("legacyDualId");

-- Add legacyDualId to ReviewerProfile table
ALTER TABLE "ReviewerProfile" ADD COLUMN IF NOT EXISTS "legacyDualId" TEXT;
CREATE INDEX IF NOT EXISTS "ReviewerProfile_legacyDualId_idx" ON "ReviewerProfile"("legacyDualId");

-- Create MergeStatus enum
DO $$ BEGIN
    CREATE TYPE "MergeStatus" AS ENUM ('PENDING', 'VERIFIED', 'COMPLETED', 'REJECTED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create AccountLinkRequest table
CREATE TABLE IF NOT EXISTS "AccountLinkRequest" (
    "id" TEXT NOT NULL,
    "initiatingUserId" TEXT NOT NULL,
    "targetEmail" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "codeExpiresAt" TIMESTAMP(3) NOT NULL,
    "status" "MergeStatus" NOT NULL DEFAULT 'PENDING',
    "legacyDualId" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "AccountLinkRequest_pkey" PRIMARY KEY ("id")
);

-- Create indexes for AccountLinkRequest
CREATE INDEX IF NOT EXISTS "AccountLinkRequest_initiatingUserId_idx" ON "AccountLinkRequest"("initiatingUserId");
CREATE INDEX IF NOT EXISTS "AccountLinkRequest_targetEmail_idx" ON "AccountLinkRequest"("targetEmail");
CREATE INDEX IF NOT EXISTS "AccountLinkRequest_status_idx" ON "AccountLinkRequest"("status");
