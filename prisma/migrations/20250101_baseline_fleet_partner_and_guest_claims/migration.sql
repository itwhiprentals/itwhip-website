-- Baseline migration for Fleet Partner features and Guest Claims
-- These changes already exist in the database, this migration documents them

-- ============================================================================
-- ENUMS (if not already exist)
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE "PartnerApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PartnerDocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PartnerDocumentType" AS ENUM ('BUSINESS_LICENSE', 'INSURANCE_CERTIFICATE', 'FLEET_INSURANCE', 'W9', 'BANK_INFO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PartnerPayoutSchedule" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PartnerPayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "VehicleType" AS ENUM ('SEDAN', 'SUV', 'TRUCK', 'VAN', 'SPORTS', 'LUXURY', 'ECONOMY', 'CONVERTIBLE', 'MINIVAN', 'HYBRID', 'ELECTRIC', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- RENTAL HOST PARTNER COLUMNS
-- ============================================================================

ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerCompanyName" TEXT;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerSlug" TEXT;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerLogo" TEXT;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerBio" TEXT;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerSupportEmail" TEXT;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerSupportPhone" TEXT;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "tier1VehicleCount" INTEGER DEFAULT 10;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "tier1CommissionRate" DOUBLE PRECISION DEFAULT 0.20;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "tier2VehicleCount" INTEGER DEFAULT 50;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "tier2CommissionRate" DOUBLE PRECISION DEFAULT 0.15;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "tier3VehicleCount" INTEGER DEFAULT 100;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "tier3CommissionRate" DOUBLE PRECISION DEFAULT 0.10;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "currentCommissionRate" DOUBLE PRECISION DEFAULT 0.25;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "autoApproveListings" BOOLEAN DEFAULT true;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerFleetSize" INTEGER DEFAULT 0;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerTotalBookings" INTEGER DEFAULT 0;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerTotalRevenue" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerAvgRating" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerPayoutSchedule" "PartnerPayoutSchedule";
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerHeroImage" TEXT;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerBadges" JSONB;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerBenefits" JSONB;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerPolicies" JSONB;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "businessHours" TEXT;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "yearEstablished" INTEGER;

-- Create unique index on partnerSlug (if not exists)
CREATE UNIQUE INDEX IF NOT EXISTS "RentalHost_partnerSlug_key" ON "RentalHost"("partnerSlug");
CREATE INDEX IF NOT EXISTS "RentalHost_partnerSlug_idx" ON "RentalHost"("partnerSlug");

-- ============================================================================
-- RENTAL CAR COLUMNS
-- ============================================================================

ALTER TABLE "RentalCar" ADD COLUMN IF NOT EXISTS "driveType" TEXT;
ALTER TABLE "RentalCar" ADD COLUMN IF NOT EXISTS "vehicleType" "VehicleType";

-- ============================================================================
-- PARTNER TABLES
-- ============================================================================

-- Partner Applications
CREATE TABLE IF NOT EXISTS "partner_applications" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "yearsInBusiness" INTEGER NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "fleetSize" INTEGER NOT NULL,
    "vehicleTypes" TEXT[],
    "operatingCities" TEXT[],
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "status" "PartnerApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "partner_applications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "partner_applications_hostId_key" ON "partner_applications"("hostId");
CREATE INDEX IF NOT EXISTS "partner_applications_status_idx" ON "partner_applications"("status");
CREATE INDEX IF NOT EXISTS "partner_applications_submittedAt_idx" ON "partner_applications"("submittedAt");

ALTER TABLE "partner_applications" DROP CONSTRAINT IF EXISTS "partner_applications_hostId_fkey";
ALTER TABLE "partner_applications" ADD CONSTRAINT "partner_applications_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Partner Documents
CREATE TABLE IF NOT EXISTS "partner_documents" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "type" "PartnerDocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "gracePeriodEndsAt" TIMESTAMP(3),
    "status" "PartnerDocumentStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectNote" TEXT,
    "reminderSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "partner_documents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "partner_documents_hostId_type_idx" ON "partner_documents"("hostId", "type");
CREATE INDEX IF NOT EXISTS "partner_documents_expiresAt_idx" ON "partner_documents"("expiresAt");
CREATE INDEX IF NOT EXISTS "partner_documents_isExpired_idx" ON "partner_documents"("isExpired");
CREATE INDEX IF NOT EXISTS "partner_documents_gracePeriodEndsAt_idx" ON "partner_documents"("gracePeriodEndsAt");

ALTER TABLE "partner_documents" DROP CONSTRAINT IF EXISTS "partner_documents_hostId_fkey";
ALTER TABLE "partner_documents" ADD CONSTRAINT "partner_documents_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Partner Discounts
CREATE TABLE IF NOT EXISTS "partner_discounts" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "percentage" DOUBLE PRECISION NOT NULL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "partner_discounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "partner_discounts_code_key" ON "partner_discounts"("code");
CREATE INDEX IF NOT EXISTS "partner_discounts_hostId_idx" ON "partner_discounts"("hostId");
CREATE INDEX IF NOT EXISTS "partner_discounts_code_idx" ON "partner_discounts"("code");
CREATE INDEX IF NOT EXISTS "partner_discounts_isActive_idx" ON "partner_discounts"("isActive");

ALTER TABLE "partner_discounts" DROP CONSTRAINT IF EXISTS "partner_discounts_hostId_fkey";
ALTER TABLE "partner_discounts" ADD CONSTRAINT "partner_discounts_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Partner Payouts
CREATE TABLE IF NOT EXISTS "partner_payouts" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "bookingCount" INTEGER NOT NULL,
    "grossRevenue" DOUBLE PRECISION NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL,
    "netAmount" DOUBLE PRECISION NOT NULL,
    "stripePayoutId" TEXT,
    "stripeTransferId" TEXT,
    "status" "PartnerPayoutStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "partner_payouts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "partner_payouts_hostId_idx" ON "partner_payouts"("hostId");
CREATE INDEX IF NOT EXISTS "partner_payouts_period_idx" ON "partner_payouts"("period");
CREATE INDEX IF NOT EXISTS "partner_payouts_status_idx" ON "partner_payouts"("status");

ALTER TABLE "partner_payouts" DROP CONSTRAINT IF EXISTS "partner_payouts_hostId_fkey";
ALTER TABLE "partner_payouts" ADD CONSTRAINT "partner_payouts_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Partner Commission History
CREATE TABLE IF NOT EXISTS "partner_commission_history" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "oldRate" DOUBLE PRECISION NOT NULL,
    "newRate" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "changedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "partner_commission_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "partner_commission_history_hostId_idx" ON "partner_commission_history"("hostId");
CREATE INDEX IF NOT EXISTS "partner_commission_history_createdAt_idx" ON "partner_commission_history"("createdAt");

ALTER TABLE "partner_commission_history" DROP CONSTRAINT IF EXISTS "partner_commission_history_hostId_fkey";
ALTER TABLE "partner_commission_history" ADD CONSTRAINT "partner_commission_history_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Partner FAQs
CREATE TABLE IF NOT EXISTS "partner_faqs" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "partner_faqs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "partner_faqs_hostId_idx" ON "partner_faqs"("hostId");

ALTER TABLE "partner_faqs" DROP CONSTRAINT IF EXISTS "partner_faqs_hostId_fkey";
ALTER TABLE "partner_faqs" ADD CONSTRAINT "partner_faqs_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Admin Impersonation Logs
CREATE TABLE IF NOT EXISTS "admin_impersonation_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "duration" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    CONSTRAINT "admin_impersonation_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "admin_impersonation_logs_adminId_idx" ON "admin_impersonation_logs"("adminId");
CREATE INDEX IF NOT EXISTS "admin_impersonation_logs_partnerId_idx" ON "admin_impersonation_logs"("partnerId");
CREATE INDEX IF NOT EXISTS "admin_impersonation_logs_createdAt_idx" ON "admin_impersonation_logs"("createdAt");

-- ============================================================================
-- CLAIM TABLE - GUEST CLAIM FIELDS
-- ============================================================================

ALTER TABLE "Claim" ADD COLUMN IF NOT EXISTS "filedByGuestId" TEXT;
ALTER TABLE "Claim" ADD COLUMN IF NOT EXISTS "filedByRole" TEXT;

CREATE INDEX IF NOT EXISTS "Claim_filedByGuestId_idx" ON "Claim"("filedByGuestId");
CREATE INDEX IF NOT EXISTS "Claim_filedByRole_idx" ON "Claim"("filedByRole");
