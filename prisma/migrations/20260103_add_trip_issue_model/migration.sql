-- Add TripIssue model for pre-claim damage/issue tracking
-- Captures issues detected at trip end before formal claim escalation

-- ============================================================================
-- TRIP ISSUE TABLE
-- ============================================================================

CREATE TABLE "TripIssue" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,

    -- Host report
    "hostReportedAt" TIMESTAMP(3),
    "hostDescription" TEXT,
    "hostPhotos" JSONB,
    "hostEstimatedCost" DOUBLE PRECISION,

    -- Guest report
    "guestReportedAt" TIMESTAMP(3),
    "guestDescription" TEXT,
    "guestPhotos" JSONB,

    -- Combined analysis
    "issueType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,

    -- Trip capture evidence
    "tripStartMileage" INTEGER,
    "tripEndMileage" INTEGER,
    "tripStartFuel" TEXT,
    "tripEndFuel" TEXT,
    "startPhotosRef" JSONB,
    "endPhotosRef" JSONB,

    -- Resolution workflow
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "guestAcknowledgedAt" TIMESTAMP(3),
    "guestAckNotes" TEXT,
    "hostReviewedAt" TIMESTAMP(3),
    "hostReviewNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolution" TEXT,

    -- Link to claim if escalated
    "claimId" TEXT,

    -- Auto-escalation tracking
    "escalationDeadline" TIMESTAMP(3),
    "autoEscalated" BOOLEAN NOT NULL DEFAULT false,

    -- Notifications
    "hostNotifiedAt" TIMESTAMP(3),
    "guestNotifiedAt" TIMESTAMP(3),
    "reminderSentAt" TIMESTAMP(3),

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripIssue_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
CREATE UNIQUE INDEX "TripIssue_bookingId_key" ON "TripIssue"("bookingId");
CREATE UNIQUE INDEX "TripIssue_claimId_key" ON "TripIssue"("claimId");

-- Create indexes
CREATE INDEX "TripIssue_status_idx" ON "TripIssue"("status");
CREATE INDEX "TripIssue_issueType_idx" ON "TripIssue"("issueType");
CREATE INDEX "TripIssue_escalationDeadline_idx" ON "TripIssue"("escalationDeadline");

-- Add foreign key constraints
ALTER TABLE "TripIssue" ADD CONSTRAINT "TripIssue_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TripIssue" ADD CONSTRAINT "TripIssue_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================================
-- RENTAL BOOKING - TRIP END REQUEST FIELDS
-- ============================================================================

ALTER TABLE "RentalBooking" ADD COLUMN IF NOT EXISTS "tripEndRequestedAt" TIMESTAMP(3);
ALTER TABLE "RentalBooking" ADD COLUMN IF NOT EXISTS "tripEndRequestedBy" TEXT;
ALTER TABLE "RentalBooking" ADD COLUMN IF NOT EXISTS "tripEndRequestReason" TEXT;
ALTER TABLE "RentalBooking" ADD COLUMN IF NOT EXISTS "tripEndRequestStatus" TEXT;
ALTER TABLE "RentalBooking" ADD COLUMN IF NOT EXISTS "tripEndApprovedBy" TEXT;
ALTER TABLE "RentalBooking" ADD COLUMN IF NOT EXISTS "tripEndApprovedAt" TIMESTAMP(3);
ALTER TABLE "RentalBooking" ADD COLUMN IF NOT EXISTS "tripEndDeniedReason" TEXT;

-- Create index for trip end request status
CREATE INDEX IF NOT EXISTS "RentalBooking_tripEndRequestStatus_idx" ON "RentalBooking"("tripEndRequestStatus");
