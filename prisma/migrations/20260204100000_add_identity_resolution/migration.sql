-- Migration: Add Identity Resolution System
-- This migration adds tables and constraints that were previously added via db push
-- and adds BANNED value to UserStatus enum

-- Add BANNED to UserStatus enum
ALTER TYPE "UserStatus" ADD VALUE IF NOT EXISTS 'BANNED';

-- CreateTable IdentityLink (skip if exists)
CREATE TABLE IF NOT EXISTS "IdentityLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "identifierType" TEXT NOT NULL,
    "identifierValue" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdentityLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable SuspendedIdentifier (skip if exists)
CREATE TABLE IF NOT EXISTS "SuspendedIdentifier" (
    "id" TEXT NOT NULL,
    "identifierType" TEXT NOT NULL,
    "identifierValue" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "suspendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "suspendedBy" TEXT,
    "expiresAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "SuspendedIdentifier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for IdentityLink (skip if exists)
CREATE UNIQUE INDEX IF NOT EXISTS "IdentityLink_identifierType_identifierValue_key" ON "IdentityLink"("identifierType", "identifierValue");
CREATE INDEX IF NOT EXISTS "IdentityLink_userId_idx" ON "IdentityLink"("userId");
CREATE INDEX IF NOT EXISTS "IdentityLink_identifierValue_idx" ON "IdentityLink"("identifierValue");
CREATE INDEX IF NOT EXISTS "IdentityLink_identifierType_verified_idx" ON "IdentityLink"("identifierType", "verified");

-- CreateIndex for SuspendedIdentifier (skip if exists)
CREATE UNIQUE INDEX IF NOT EXISTS "SuspendedIdentifier_identifierType_identifierValue_key" ON "SuspendedIdentifier"("identifierType", "identifierValue");
CREATE INDEX IF NOT EXISTS "SuspendedIdentifier_identifierValue_idx" ON "SuspendedIdentifier"("identifierValue");
CREATE INDEX IF NOT EXISTS "SuspendedIdentifier_identifierType_idx" ON "SuspendedIdentifier"("identifierType");
CREATE INDEX IF NOT EXISTS "SuspendedIdentifier_expiresAt_idx" ON "SuspendedIdentifier"("expiresAt");

-- AddForeignKey for IdentityLink (skip if exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'IdentityLink_userId_fkey'
    ) THEN
        ALTER TABLE "IdentityLink" ADD CONSTRAINT "IdentityLink_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Drop old regular index on RentalCar.vin if exists, then add unique constraint
DROP INDEX IF EXISTS "RentalCar_vin_idx";
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'RentalCar_vin_key'
    ) THEN
        CREATE UNIQUE INDEX "RentalCar_vin_key" ON "RentalCar"("vin");
    END IF;
END $$;

-- Add unique constraint on ReviewerProfile (driverLicenseState, driverLicenseNumber) (skip if exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'ReviewerProfile_driverLicenseState_driverLicenseNumber_key'
    ) THEN
        CREATE UNIQUE INDEX "ReviewerProfile_driverLicenseState_driverLicenseNumber_key"
        ON "ReviewerProfile"("driverLicenseState", "driverLicenseNumber");
    END IF;
END $$;
