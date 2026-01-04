-- Fleet Manager & Vehicle Owner System Migration
-- This migration adds support for Host Managers to manage other owners' vehicles

-- ============================================================================
-- NEW ENUMS
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE "VehicleManagementStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAUSED', 'TERMINATED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ManagementInvitationType" AS ENUM ('OWNER_INVITES_MANAGER', 'MANAGER_INVITES_OWNER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ManagementInvitationStatus" AS ENUM ('PENDING', 'COUNTER_OFFERED', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- RENTAL HOST - FLEET MANAGER FIELDS
-- ============================================================================

ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "isHostManager" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "isVehicleOwner" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "hostManagerSlug" TEXT;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "hostManagerName" TEXT;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "hostManagerBio" TEXT;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "hostManagerLogo" TEXT;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "managesOwnCars" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "managesOthersCars" BOOLEAN NOT NULL DEFAULT false;

-- Unique index on hostManagerSlug
CREATE UNIQUE INDEX IF NOT EXISTS "RentalHost_hostManagerSlug_key" ON "RentalHost"("hostManagerSlug");
CREATE INDEX IF NOT EXISTS "RentalHost_hostManagerSlug_idx" ON "RentalHost"("hostManagerSlug");
CREATE INDEX IF NOT EXISTS "RentalHost_isHostManager_idx" ON "RentalHost"("isHostManager");
CREATE INDEX IF NOT EXISTS "RentalHost_isVehicleOwner_idx" ON "RentalHost"("isVehicleOwner");

-- ============================================================================
-- VEHICLE MANAGEMENT TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "vehicle_management" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "ownerCommissionPercent" DECIMAL(5,2) NOT NULL DEFAULT 70,
    "managerCommissionPercent" DECIMAL(5,2) NOT NULL DEFAULT 30,
    "canEditListing" BOOLEAN NOT NULL DEFAULT true,
    "canAdjustPricing" BOOLEAN NOT NULL DEFAULT true,
    "canCommunicateGuests" BOOLEAN NOT NULL DEFAULT true,
    "canApproveBookings" BOOLEAN NOT NULL DEFAULT true,
    "canHandleIssues" BOOLEAN NOT NULL DEFAULT true,
    "status" "VehicleManagementStatus" NOT NULL DEFAULT 'ACTIVE',
    "agreementNotes" TEXT,
    "agreementSignedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vehicle_management_pkey" PRIMARY KEY ("id")
);

-- Unique constraint: one manager per vehicle
CREATE UNIQUE INDEX IF NOT EXISTS "vehicle_management_vehicleId_key" ON "vehicle_management"("vehicleId");
CREATE INDEX IF NOT EXISTS "vehicle_management_ownerId_idx" ON "vehicle_management"("ownerId");
CREATE INDEX IF NOT EXISTS "vehicle_management_managerId_idx" ON "vehicle_management"("managerId");
CREATE INDEX IF NOT EXISTS "vehicle_management_status_idx" ON "vehicle_management"("status");

-- Foreign keys
ALTER TABLE "vehicle_management" DROP CONSTRAINT IF EXISTS "vehicle_management_vehicleId_fkey";
ALTER TABLE "vehicle_management" ADD CONSTRAINT "vehicle_management_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "RentalCar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "vehicle_management" DROP CONSTRAINT IF EXISTS "vehicle_management_ownerId_fkey";
ALTER TABLE "vehicle_management" ADD CONSTRAINT "vehicle_management_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "vehicle_management" DROP CONSTRAINT IF EXISTS "vehicle_management_managerId_fkey";
ALTER TABLE "vehicle_management" ADD CONSTRAINT "vehicle_management_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================================
-- MANAGEMENT INVITATION TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "management_invitations" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" "ManagementInvitationType" NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT,
    "recipientEmail" TEXT NOT NULL,
    "vehicleIds" TEXT[],
    "proposedOwnerPercent" DECIMAL(5,2) NOT NULL DEFAULT 70,
    "proposedManagerPercent" DECIMAL(5,2) NOT NULL DEFAULT 30,
    "counterOfferOwnerPercent" DECIMAL(5,2),
    "counterOfferManagerPercent" DECIMAL(5,2),
    "negotiationRounds" INTEGER NOT NULL DEFAULT 0,
    "negotiationNotes" TEXT,
    "negotiationHistory" JSONB DEFAULT '[]',
    "proposedCanEditListing" BOOLEAN NOT NULL DEFAULT true,
    "proposedCanAdjustPricing" BOOLEAN NOT NULL DEFAULT true,
    "proposedCanCommunicateGuests" BOOLEAN NOT NULL DEFAULT true,
    "proposedCanApproveBookings" BOOLEAN NOT NULL DEFAULT true,
    "proposedCanHandleIssues" BOOLEAN NOT NULL DEFAULT true,
    "status" "ManagementInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "management_invitations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "management_invitations_token_key" ON "management_invitations"("token");
CREATE INDEX IF NOT EXISTS "management_invitations_token_idx" ON "management_invitations"("token");
CREATE INDEX IF NOT EXISTS "management_invitations_senderId_idx" ON "management_invitations"("senderId");
CREATE INDEX IF NOT EXISTS "management_invitations_recipientId_idx" ON "management_invitations"("recipientId");
CREATE INDEX IF NOT EXISTS "management_invitations_recipientEmail_idx" ON "management_invitations"("recipientEmail");
CREATE INDEX IF NOT EXISTS "management_invitations_status_idx" ON "management_invitations"("status");

-- Foreign keys
ALTER TABLE "management_invitations" DROP CONSTRAINT IF EXISTS "management_invitations_senderId_fkey";
ALTER TABLE "management_invitations" ADD CONSTRAINT "management_invitations_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "management_invitations" DROP CONSTRAINT IF EXISTS "management_invitations_recipientId_fkey";
ALTER TABLE "management_invitations" ADD CONSTRAINT "management_invitations_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "RentalHost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
