-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'DENIED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('NEW', 'REVIEWING', 'PHONE_SCREEN', 'TECHNICAL_TEST', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'REFERENCE_CHECK', 'OFFER_EXTENDED', 'OFFER_ACCEPTED', 'REJECTED', 'WITHDRAWN', 'HIRED');

-- CreateEnum
CREATE TYPE "AttackType" AS ENUM ('BRUTE_FORCE', 'DICTIONARY', 'SQL_INJECTION', 'XSS', 'CSRF', 'DDOS', 'MAN_IN_MIDDLE', 'SESSION_HIJACK', 'CREDENTIAL_STUFFING', 'BOT');

-- CreateEnum
CREATE TYPE "AuditCategory" AS ENUM ('AUTHENTICATION', 'AUTHORIZATION', 'DATA_ACCESS', 'DATA_MODIFICATION', 'CONFIGURATION', 'SECURITY', 'COMPLIANCE', 'FINANCIAL', 'CHARGE_MANAGEMENT', 'HOST_MANAGEMENT');

-- CreateEnum
CREATE TYPE "AuditSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "BackgroundCheckStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'PASSED', 'FAILED', 'EXPIRED', 'ERROR');

-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('DIRECT', 'EXPEDIA', 'BOOKING_COM', 'AIRBNB', 'AMADEUS', 'SABRE', 'WEBSITE', 'PHONE', 'WALK_IN');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "CancelledBy" AS ENUM ('GUEST', 'ADMIN', 'HOST', 'SYSTEM');

-- CreateEnum
CREATE TYPE "CertificationTier" AS ENUM ('NONE', 'TU_3_C', 'TU_2_B', 'TU_1_A');

-- CreateEnum
CREATE TYPE "ChargeStatus" AS ENUM ('PENDING', 'PROCESSING', 'CHARGED', 'FAILED', 'WAIVED', 'DISPUTED', 'ADJUSTED', 'REFUNDED', 'PARTIALLY_WAIVED', 'PARTIAL_CHARGED', 'ADJUSTED_CHARGED', 'FULLY_WAIVED', 'ADJUSTED_PENDING', 'ADJUSTMENT_FAILED', 'UNDER_REVIEW', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'DENIED', 'PAID', 'DISPUTED', 'RESOLVED', 'GUEST_RESPONSE_PENDING', 'GUEST_NO_RESPONSE', 'VEHICLE_REPAIR_PENDING', 'INSURANCE_PROCESSING', 'CLOSED', 'GUEST_RESPONDED');

-- CreateEnum
CREATE TYPE "ClaimType" AS ENUM ('ACCIDENT', 'THEFT', 'VANDALISM', 'CLEANING', 'MECHANICAL', 'WEATHER', 'OTHER');

-- CreateEnum
CREATE TYPE "CoverageOverrideType" AS ENUM ('FULL_APPROVAL', 'PARTIAL_APPROVAL', 'CUSTOM_PRICING', 'TIER_RESTRICTION', 'TEMPORARY_APPROVAL', 'MANUAL_REVIEW');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'INVESTIGATING', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "DisputeType" AS ENUM ('DAMAGE', 'REFUND', 'SERVICE', 'MILEAGE', 'FUEL', 'LATE_RETURN', 'CLEANING', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentReviewStatus" AS ENUM ('PENDING', 'REVIEWING', 'APPROVED', 'REJECTED', 'NEEDS_CLARIFICATION');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('NOT_UPLOADED', 'UPLOADED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED', 'RESUBMISSION_REQUIRED');

-- CreateEnum
CREATE TYPE "EarningsTier" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');

-- CreateEnum
CREATE TYPE "FraudSeverity" AS ENUM ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "GovernmentIdType" AS ENUM ('PASSPORT', 'STATE_ID', 'NATIONAL_ID', 'DRIVERS_LICENSE');

-- CreateEnum
CREATE TYPE "HostInsuranceStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'DEACTIVATED', 'SUSPENDED', 'PENDING', 'INACTIVE');

-- CreateEnum
CREATE TYPE "HotelSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "InsuranceProviderType" AS ENUM ('EMBEDDED', 'TRADITIONAL');

-- CreateEnum
CREATE TYPE "InsuranceStatus" AS ENUM ('NONE', 'PENDING', 'ACTIVE', 'DEACTIVATED', 'EXPIRED', 'SUSPENDED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "InsuranceTier" AS ENUM ('MINIMUM', 'BASIC', 'PREMIUM', 'LUXURY');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "ManagementInvitationStatus" AS ENUM ('PENDING', 'COUNTER_OFFERED', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ManagementInvitationType" AS ENUM ('OWNER_INVITES_MANAGER', 'MANAGER_INVITES_OWNER');

-- CreateEnum
CREATE TYPE "MemberTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');

-- CreateEnum
CREATE TYPE "MergeStatus" AS ENUM ('PENDING', 'VERIFIED', 'COMPLETED', 'REJECTED', 'EXPIRED', 'GUEST_CONFIRMED');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('UNREAD', 'READ', 'REPLIED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MetricPeriod" AS ENUM ('DAY', 'WEEK', 'MONTH', 'YEAR');

-- CreateEnum
CREATE TYPE "ModerationType" AS ENUM ('WARNING', 'SUSPEND', 'UNSUSPEND', 'BAN', 'UNBAN', 'RESTRICTION_ADDED', 'RESTRICTION_REMOVED', 'NOTE_ADDED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'RESPONDED', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PartnerApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PartnerDocumentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PartnerDocumentType" AS ENUM ('BUSINESS_LICENSE', 'INSURANCE_CERTIFICATE', 'COMMERCIAL_AUTO_POLICY', 'BACKGROUND_CHECK', 'W9_FORM', 'ARTICLES_OF_INCORPORATION');

-- CreateEnum
CREATE TYPE "PartnerPayoutSchedule" AS ENUM ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "PartnerPayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'CAPTURED', 'PAID', 'FAILED', 'REFUNDED', 'PENDING_CHARGES', 'CHARGES_PAID', 'CHARGES_WAIVED', 'PARTIAL_REFUND', 'PARTIAL_PAID', 'ADJUSTED_PAID');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'CLAIMED');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('HOTEL', 'RESORT', 'MOTEL', 'BNB', 'BOUTIQUE', 'CHAIN', 'INDEPENDENT');

-- CreateEnum
CREATE TYPE "RecoveryStatus" AS ENUM ('PENDING', 'PARTIAL', 'FULL', 'FAILED', 'WAIVED');

-- CreateEnum
CREATE TYPE "RefundRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RentalBookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'DISPUTE_REVIEW');

-- CreateEnum
CREATE TYPE "RevenuePeriod" AS ENUM ('DAY', 'WEEK', 'MONTH', 'TOTAL');

-- CreateEnum
CREATE TYPE "RevenueStatus" AS ENUM ('PENDING', 'AVAILABLE', 'PROCESSING', 'WITHDRAWN', 'HELD');

-- CreateEnum
CREATE TYPE "ReviewSource" AS ENUM ('GUEST', 'SEED', 'MANAGED', 'ADMIN');

-- CreateEnum
CREATE TYPE "RideStatus" AS ENUM ('REQUESTED', 'SEARCHING', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'GHOST');

-- CreateEnum
CREATE TYPE "RiskCategory" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'EXTREME');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('OIL_CHANGE', 'STATE_INSPECTION', 'TIRE_ROTATION', 'BRAKE_CHECK', 'FLUID_CHECK', 'BATTERY_CHECK', 'AIR_FILTER', 'MAJOR_SERVICE_30K', 'MAJOR_SERVICE_60K', 'MAJOR_SERVICE_90K', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SuspensionLevel" AS ENUM ('SOFT', 'HARD', 'BANNED');

-- CreateEnum
CREATE TYPE "ThreatSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ThreatStatus" AS ENUM ('DETECTED', 'INVESTIGATING', 'MITIGATED', 'BLOCKED', 'RESOLVED', 'FALSE_POSITIVE');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('RIDE_COMMISSION', 'BOOKING', 'WITHDRAWAL', 'FEE', 'REFUND');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('NOT_STARTED', 'ACTIVE', 'COMPLETED', 'ENDED_PENDING_REVIEW');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ANONYMOUS', 'CLAIMED', 'STARTER', 'BUSINESS', 'ENTERPRISE', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'PENDING_DELETION', 'DELETED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "VehicleCategory" AS ENUM ('ECONOMY', 'STANDARD', 'PREMIUM', 'LUXURY', 'EXOTIC', 'SUPERCAR');

-- CreateEnum
CREATE TYPE "VehicleManagementStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAUSED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('RENTAL', 'RIDESHARE');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PENDING_CHARGES', 'DISPUTE_REVIEW', 'COMPLETED');

-- CreateEnum
CREATE TYPE "WarningCategory" AS ENUM ('LATE_RETURNS', 'VEHICLE_DAMAGE', 'CLEANLINESS_ISSUES', 'MILEAGE_VIOLATIONS', 'POLICY_VIOLATIONS', 'FRAUDULENT_ACTIVITY', 'PAYMENT_ISSUES', 'COMMUNICATION_ISSUES', 'INAPPROPRIATE_BEHAVIOR', 'UNAUTHORIZED_DRIVER', 'SMOKING_VIOLATION', 'PET_VIOLATION', 'FUEL_VIOLATIONS', 'DOCUMENTATION_ISSUES', 'OTHER');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountHold" (
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

-- CreateTable
CREATE TABLE "AccountLinkRequest" (
    "id" TEXT NOT NULL,
    "initiatingUserId" TEXT NOT NULL,
    "targetEmail" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "codeExpiresAt" TIMESTAMP(3) NOT NULL,
    "status" "MergeStatus" NOT NULL DEFAULT 'PENDING',
    "legacyDualId" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "guestLinkToken" TEXT,
    "hostLinkToken" TEXT,
    "guestConfirmedAt" TIMESTAMP(3),

    CONSTRAINT "AccountLinkRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminId" TEXT,
    "category" TEXT,
    "guestId" TEXT,
    "hostId" TEXT,
    "newValue" TEXT,
    "oldValue" TEXT,
    "severity" TEXT DEFAULT 'INFO',
    "userAgent" TEXT,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminNotification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'UNREAD',
    "relatedId" TEXT,
    "relatedType" TEXT,
    "actionRequired" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmadeusCarCache" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "searchDate" TIMESTAMP(3) NOT NULL,
    "carData" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AmadeusCarCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hotelId" TEXT,
    "permissions" TEXT NOT NULL,
    "tier" "CertificationTier",
    "rateLimit" INTEGER NOT NULL DEFAULT 1000,
    "rateWindow" TEXT NOT NULL DEFAULT 'hour',
    "lastUsed" TIMESTAMP(3),
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppealNotification" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "appealId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "dismissedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppealNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationActivity" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "category" "AuditCategory" NOT NULL,
    "eventType" TEXT NOT NULL,
    "severity" "AuditSeverity" NOT NULL,
    "userId" TEXT,
    "adminId" TEXT,
    "adminEmail" TEXT,
    "hotelId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "sessionId" TEXT,
    "requestId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "amount" DECIMAL(10,2),
    "currency" TEXT DEFAULT 'USD',
    "stripeId" TEXT,
    "details" JSONB,
    "changes" JSONB,
    "metadata" JSONB,
    "gdpr" BOOLEAN NOT NULL DEFAULT false,
    "ccpa" BOOLEAN NOT NULL DEFAULT false,
    "pci" BOOLEAN NOT NULL DEFAULT false,
    "sox" BOOLEAN NOT NULL DEFAULT false,
    "hash" TEXT NOT NULL,
    "previousHash" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "backedUp" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackgroundCheck" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "checkType" TEXT NOT NULL,
    "status" "BackgroundCheckStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "passed" BOOLEAN,
    "score" INTEGER,
    "details" JSONB,
    "reportUrl" TEXT,
    "failureReason" TEXT,
    "issues" JSONB,
    "manuallyReviewed" BOOLEAN NOT NULL DEFAULT false,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "overrideReason" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "nextRetryAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BackgroundCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "confirmationNumber" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "nights" INTEGER NOT NULL,
    "roomType" TEXT NOT NULL,
    "roomNumber" TEXT,
    "roomRate" DOUBLE PRECISION NOT NULL,
    "source" "BookingSource" NOT NULL,
    "status" "BookingStatus" NOT NULL,
    "roomCharges" DOUBLE PRECISION NOT NULL,
    "taxes" DOUBLE PRECISION NOT NULL,
    "fees" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "airportPickup" BOOLEAN NOT NULL DEFAULT false,
    "airportDropoff" BOOLEAN NOT NULL DEFAULT false,
    "ridesIncluded" INTEGER NOT NULL DEFAULT 0,
    "ridesUsed" INTEGER NOT NULL DEFAULT 0,
    "canModify" BOOLEAN NOT NULL DEFAULT true,
    "canCancel" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingSession" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "sessionId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "abandoned" BOOLEAN NOT NULL DEFAULT false,
    "pageViews" TEXT,
    "lastPage" TEXT,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "scrollDepth" DOUBLE PRECISION,
    "timeOnPage" TEXT,
    "fieldTimings" TEXT,
    "fieldFocusCount" TEXT,
    "validationErrors" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChargeAdjustment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "chargeId" TEXT,
    "adjustmentType" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "originalAmount" DECIMAL(10,2) NOT NULL,
    "adjustedAmount" DECIMAL(10,2) NOT NULL,
    "reductionAmount" DECIMAL(10,2) NOT NULL,
    "reductionPercent" INTEGER,
    "adjustmentDetails" TEXT,
    "adminId" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "adminNotes" TEXT,
    "processedAt" TIMESTAMP(3),
    "stripeChargeId" TEXT,
    "stripeRefundId" TEXT,
    "processingStatus" TEXT NOT NULL DEFAULT 'pending',
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChargeAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "type" "ClaimType" NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "incidentDate" TIMESTAMP(3) NOT NULL,
    "estimatedCost" DOUBLE PRECISION NOT NULL,
    "status" "ClaimStatus" NOT NULL,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "approvedAmount" DOUBLE PRECISION,
    "deductible" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "payoutId" TEXT,
    "paidToHost" TIMESTAMP(3),
    "paidAmount" DOUBLE PRECISION,
    "platformAdvanceAmount" DOUBLE PRECISION,
    "recoveredFromGuest" DOUBLE PRECISION,
    "recoveryStatus" "RecoveryStatus",
    "overrideHistory" JSONB,
    "guestAtFault" BOOLEAN NOT NULL DEFAULT false,
    "faultPercentage" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "accountHoldApplied" BOOLEAN NOT NULL DEFAULT false,
    "activityLog" JSONB,
    "escalationSentAt" TIMESTAMP(3),
    "guestNotifiedAt" TIMESTAMP(3),
    "guestResponseDate" TIMESTAMP(3),
    "guestResponseDeadline" TIMESTAMP(3),
    "guestResponsePhotos" JSONB,
    "guestResponseText" TEXT,
    "hostNotifiedAt" TIMESTAMP(3),
    "lastMessageAt" TIMESTAMP(3),
    "reactivationNotes" TEXT,
    "reminderSentAt" TIMESTAMP(3),
    "repairDocumentUrls" JSONB,
    "safetyChecklistData" JSONB,
    "statusHistory" JSONB,
    "unreadMessagesCount" INTEGER NOT NULL DEFAULT 0,
    "vehicleDeactivated" BOOLEAN NOT NULL DEFAULT false,
    "vehicleReactivatedAt" TIMESTAMP(3),
    "vehicleReactivatedBy" TEXT,
    "guestRespondedAt" TIMESTAMP(3),
    "insurerClaimId" TEXT,
    "insurerDenialReason" TEXT,
    "insurerPaidAmount" DOUBLE PRECISION,
    "insurerPaidAt" TIMESTAMP(3),
    "insurerStatus" TEXT,
    "lockedCarState" TEXT,
    "primaryParty" TEXT,
    "severity" TEXT,
    "submittedToInsurerAt" TIMESTAMP(3),
    "damagePhotosLegacy" JSONB,
    "incidentAddress" TEXT,
    "incidentCity" TEXT,
    "incidentLatitude" DOUBLE PRECISION,
    "incidentLongitude" DOUBLE PRECISION,
    "incidentState" TEXT,
    "incidentZip" TEXT,
    "policeReportNumber" TEXT,
    "roadConditions" TEXT,
    "weatherConditions" TEXT,
    "witnesses" JSONB,
    "estimatedSpeed" INTEGER,
    "incidentDescription" TEXT,
    "injuries" JSONB,
    "odometerAtIncident" INTEGER,
    "officerBadge" TEXT,
    "officerName" TEXT,
    "otherParty" JSONB,
    "otherPartyInvolved" BOOLEAN NOT NULL DEFAULT false,
    "policeDepartment" TEXT,
    "policeReportDate" TIMESTAMP(3),
    "policeReportFiled" BOOLEAN NOT NULL DEFAULT false,
    "roadDescription" TEXT,
    "trafficConditions" TEXT,
    "vehicleDrivable" BOOLEAN NOT NULL DEFAULT true,
    "vehicleLocation" TEXT,
    "wasPoliceContacted" BOOLEAN NOT NULL DEFAULT false,
    "weatherDescription" TEXT,
    "wereInjuries" BOOLEAN NOT NULL DEFAULT false,
    "adjusterAssigned" BOOLEAN NOT NULL DEFAULT false,
    "adjusterAssignedAt" TIMESTAMP(3),
    "adjusterEmail" TEXT,
    "adjusterName" TEXT,
    "adjusterPhone" TEXT,
    "claimClosedAt" TIMESTAMP(3),
    "claimOpenedAt" TIMESTAMP(3),
    "claimSubmittedToInsurer" TIMESTAMP(3),
    "fnolNumber" TEXT,
    "fnolStatus" TEXT DEFAULT 'NOT_STARTED',
    "fnolSubmittedAt" TIMESTAMP(3),
    "fnolSubmittedBy" TEXT,
    "filedByGuestId" TEXT,
    "filedByRole" TEXT,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimDamagePhoto" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimDamagePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimEdit" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "fieldChanged" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "editedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedBy" TEXT NOT NULL,
    "editedByType" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimEdit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimMessage" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "senderName" TEXT,
    "message" TEXT NOT NULL,
    "attachments" JSONB,
    "readBy" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClaimMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'UNREAD',
    "repliedAt" TIMESTAMP(3),
    "repliedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "replies" JSONB DEFAULT '[]',
    "replyCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditBonusTransaction" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "bookingId" TEXT,
    "reason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "adjustedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditBonusTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataExportLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "downloadUrl" TEXT,
    "expiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "fileSize" INTEGER,

    CONSTRAINT "DataExportLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepositTransaction" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "bookingId" TEXT,
    "stripePaymentIntentId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DepositTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "photo" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "totalTrips" INTEGER NOT NULL DEFAULT 0,
    "vehicleMake" TEXT NOT NULL,
    "vehicleModel" TEXT NOT NULL,
    "vehicleYear" INTEGER NOT NULL,
    "vehicleColor" TEXT NOT NULL,
    "vehiclePlate" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLat" DOUBLE PRECISION,
    "lastLng" DOUBLE PRECISION,
    "lastUpdate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ESGBadge" (
    "id" TEXT NOT NULL,
    "badgeCode" TEXT NOT NULL,
    "badgeName" TEXT NOT NULL,
    "badgeDescription" TEXT NOT NULL,
    "badgeIcon" TEXT NOT NULL,
    "badgeCategory" TEXT NOT NULL,
    "requiredScore" INTEGER,
    "requiredTrips" INTEGER,
    "requiredStreak" INTEGER,
    "requiredMetric" TEXT,
    "requiredValue" DOUBLE PRECISION,
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ESGBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ESGEvent" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventCategory" TEXT NOT NULL,
    "scoreBefore" INTEGER,
    "scoreAfter" INTEGER,
    "scoreChange" INTEGER,
    "description" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "relatedTripId" TEXT,
    "relatedClaimId" TEXT,
    "relatedBookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ESGEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ESGSnapshot" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "compositeScore" INTEGER NOT NULL,
    "drivingImpactScore" INTEGER NOT NULL,
    "emissionsScore" INTEGER NOT NULL,
    "maintenanceScore" INTEGER NOT NULL,
    "safetyScore" INTEGER NOT NULL,
    "complianceScore" INTEGER NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "snapshotReason" TEXT NOT NULL,
    "triggerEventId" TEXT,

    CONSTRAINT "ESGSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FraudIndicator" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "indicator" TEXT NOT NULL,
    "severity" "FraudSeverity" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "details" TEXT,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FraudIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "country" TEXT,
    "preferences" TEXT,
    "totalStays" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastStay" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestAccessToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestAccessToken_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "GuestInsurance" (
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
    "restrictionsApplied" JSONB,
    "warningCategory" "WarningCategory",

    CONSTRAINT "GuestModeration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestProfileStatus" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "accountStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "activeWarningCount" INTEGER NOT NULL DEFAULT 0,
    "activeSuspensions" INTEGER NOT NULL DEFAULT 0,
    "activeRestrictions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "statusHistory" JSONB NOT NULL DEFAULT '[]',
    "restrictionHistory" JSONB NOT NULL DEFAULT '[]',
    "notificationHistory" JSONB NOT NULL DEFAULT '[]',
    "lastWarningAt" TIMESTAMP(3),
    "lastSuspensionAt" TIMESTAMP(3),
    "lastNotificationAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestProfileStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostBadgeEarned" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "badgeCode" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HostBadgeEarned_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostDocumentStatus" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "documentUrl" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'NOT_UPLOADED',
    "uploadedAt" TIMESTAMP(3),
    "reviewStatus" "DocumentReviewStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "isReadable" BOOLEAN,
    "isExpired" BOOLEAN,
    "expiryDate" TIMESTAMP(3),
    "verificationMethod" TEXT,
    "verificationScore" INTEGER,
    "issues" JSONB,
    "feedback" TEXT,
    "rejectionReason" TEXT,
    "requestedAt" TIMESTAMP(3),
    "remindersSent" INTEGER NOT NULL DEFAULT 0,
    "lastReminderAt" TIMESTAMP(3),
    "resubmissionCount" INTEGER NOT NULL DEFAULT 0,
    "lastResubmittedAt" TIMESTAMP(3),
    "expiryWarningAt" TIMESTAMP(3),
    "autoSuspendAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostDocumentStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostESGProfile" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "compositeScore" INTEGER NOT NULL DEFAULT 50,
    "drivingImpactScore" INTEGER NOT NULL DEFAULT 50,
    "emissionsScore" INTEGER NOT NULL DEFAULT 50,
    "maintenanceScore" INTEGER NOT NULL DEFAULT 50,
    "safetyScore" INTEGER NOT NULL DEFAULT 50,
    "complianceScore" INTEGER NOT NULL DEFAULT 50,
    "totalTrips" INTEGER NOT NULL DEFAULT 0,
    "incidentFreeTrips" INTEGER NOT NULL DEFAULT 0,
    "totalClaimsFiled" INTEGER NOT NULL DEFAULT 0,
    "currentIncidentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestIncidentStreak" INTEGER NOT NULL DEFAULT 0,
    "lastIncidentDate" TIMESTAMP(3),
    "totalEVTrips" INTEGER NOT NULL DEFAULT 0,
    "evTripPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedCO2Saved" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fuelEfficiencyRating" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "maintenanceOnTime" BOOLEAN NOT NULL DEFAULT true,
    "lastMaintenanceDate" TIMESTAMP(3),
    "overdueMaintenanceCount" INTEGER NOT NULL DEFAULT 0,
    "fnolCompletionRate" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "avgResponseTimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unauthorizedMileage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "suspiciousActivityCount" INTEGER NOT NULL DEFAULT 0,
    "verificationFailures" INTEGER NOT NULL DEFAULT 0,
    "fraudRiskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "totalMilesDriven" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgMilesPerTrip" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tripCompletionRate" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "idleTimeEfficiency" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "tripCancellationRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lateReturnCount" INTEGER NOT NULL DEFAULT 0,
    "earlyReturnCount" INTEGER NOT NULL DEFAULT 0,
    "guestRatingAverage" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "totalVehicles" INTEGER NOT NULL DEFAULT 0,
    "activeVehicles" INTEGER NOT NULL DEFAULT 0,
    "evVehicleCount" INTEGER NOT NULL DEFAULT 0,
    "avgVehicleAge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hasCommercialInsurance" BOOLEAN NOT NULL DEFAULT false,
    "hasP2PInsurance" BOOLEAN NOT NULL DEFAULT false,
    "insuranceTier" TEXT NOT NULL DEFAULT 'PLATFORM',
    "claimApprovalRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgClaimProcessingDays" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "achievedBadges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "milestoneReached" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "nextMilestone" TEXT,
    "scoreHistory" JSONB NOT NULL DEFAULT '[]',
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL,
    "calculationVersion" TEXT NOT NULL DEFAULT '1.0',
    "dataConfidence" TEXT NOT NULL DEFAULT 'HIGH',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "avgCO2PerMile" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCO2Impact" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "HostESGProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostInquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "vehicleMake" TEXT NOT NULL,
    "vehicleModel" TEXT NOT NULL,
    "vehicleYear" INTEGER NOT NULL,
    "location" TEXT NOT NULL DEFAULT 'Phoenix',
    "message" TEXT,
    "mileage" INTEGER,
    "condition" TEXT NOT NULL DEFAULT 'EXCELLENT',
    "features" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "source" TEXT NOT NULL DEFAULT 'WEBSITE',
    "contactedAt" TIMESTAMP(3),
    "contactedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectionReason" TEXT,
    "convertedToHostId" TEXT,
    "convertedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "replies" JSONB DEFAULT '[]',
    "replyCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HostInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostNotification" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "smsSent" BOOLEAN NOT NULL DEFAULT false,
    "pushSent" BOOLEAN NOT NULL DEFAULT false,
    "inAppShown" BOOLEAN NOT NULL DEFAULT false,
    "responseRequired" BOOLEAN NOT NULL DEFAULT false,
    "responseDeadline" TIMESTAMP(3),
    "responseReceived" TEXT,
    "actionRequired" TEXT,
    "actionUrl" TEXT,
    "actionCompleted" BOOLEAN NOT NULL DEFAULT false,
    "relatedDocumentType" TEXT,
    "relatedCheckType" TEXT,
    "reminderCount" INTEGER NOT NULL DEFAULT 0,
    "lastReminderAt" TIMESTAMP(3),
    "nextReminderAt" TIMESTAMP(3),
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "actionLabel" TEXT,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "HostNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostPayout" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "processedAt" TIMESTAMP(3),
    "stripeTransferId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HostPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hotel" (
    "id" TEXT NOT NULL,
    "gdsCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PropertyType" NOT NULL,
    "size" "HotelSize" NOT NULL,
    "rooms" INTEGER NOT NULL,
    "stars" INTEGER,
    "chain" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "claimedBy" TEXT,
    "claimedAt" TIMESTAMP(3),
    "certified" BOOLEAN NOT NULL DEFAULT false,
    "certificationTier" "CertificationTier",
    "certifiedAt" TIMESTAMP(3),
    "certificationExpiry" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "pmsType" TEXT,
    "pmsConnected" BOOLEAN NOT NULL DEFAULT false,
    "channelManager" TEXT,
    "amenities" TEXT,
    "images" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotelMetrics" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "period" "MetricPeriod" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "occupancyRate" DOUBLE PRECISION NOT NULL,
    "roomsOccupied" INTEGER NOT NULL,
    "roomsAvailable" INTEGER NOT NULL,
    "roomRevenue" DOUBLE PRECISION NOT NULL,
    "rideRevenue" DOUBLE PRECISION NOT NULL,
    "totalRevenue" DOUBLE PRECISION NOT NULL,
    "totalRides" INTEGER NOT NULL,
    "completedRides" INTEGER NOT NULL,
    "cancelledRides" INTEGER NOT NULL,
    "averageRideValue" DOUBLE PRECISION NOT NULL,
    "totalBookings" INTEGER NOT NULL,
    "directBookings" INTEGER NOT NULL,
    "otaBookings" INTEGER NOT NULL,
    "averageStayDays" DOUBLE PRECISION NOT NULL,
    "cancellationRate" DOUBLE PRECISION NOT NULL,
    "guestRating" DOUBLE PRECISION,
    "rideRating" DOUBLE PRECISION,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HotelMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionPhoto" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "metadata" JSONB,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InspectionPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceNotification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sentTo" TEXT[],
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sentBy" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InsuranceNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsurancePolicy" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "tier" "InsuranceTier" NOT NULL,
    "liabilityCoverage" DOUBLE PRECISION NOT NULL DEFAULT 750000,
    "collisionCoverage" DOUBLE PRECISION NOT NULL,
    "deductible" DOUBLE PRECISION NOT NULL,
    "dailyPremium" DOUBLE PRECISION NOT NULL,
    "totalPremium" DOUBLE PRECISION NOT NULL,
    "platformRevenue" DOUBLE PRECISION NOT NULL,
    "increasedDeposit" DOUBLE PRECISION,
    "status" "PolicyStatus" NOT NULL,
    "policyNumber" TEXT,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "boundViaApi" BOOLEAN NOT NULL DEFAULT false,
    "externalPolicyId" TEXT,
    "hostTier" TEXT,
    "policySnapshot" JSONB,
    "policySource" TEXT,
    "primaryParty" TEXT,

    CONSTRAINT "InsurancePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InsuranceProviderType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "coverageTiers" JSONB NOT NULL,
    "pricingRules" JSONB NOT NULL,
    "apiKey" TEXT,
    "apiEndpoint" TEXT,
    "webhookUrl" TEXT,
    "revenueShare" DOUBLE PRECISION NOT NULL DEFAULT 0.30,
    "contractStart" TIMESTAMP(3),
    "contractEnd" TIMESTAMP(3),
    "contractTerms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "apiEndpointPlaceholder" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "contractEndDate" TIMESTAMP(3),
    "contractStartDate" TIMESTAMP(3),
    "coverageNotes" TEXT,
    "excludedMakes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excludedModels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "vehicleValueMax" DOUBLE PRECISION,
    "vehicleValueMin" DOUBLE PRECISION,
    "vehicleRules" JSONB,

    CONSTRAINT "InsuranceProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceRateHistory" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "vehicleClass" TEXT NOT NULL,
    "oldRate" DOUBLE PRECISION NOT NULL,
    "newRate" DOUBLE PRECISION NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "changedBy" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "change" DOUBLE PRECISION NOT NULL,
    "changePercent" DOUBLE PRECISION,
    "changeType" TEXT NOT NULL,

    CONSTRAINT "InsuranceRateHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "linkedin" TEXT,
    "github" TEXT,
    "portfolio" TEXT,
    "website" TEXT,
    "resumeUrl" TEXT NOT NULL,
    "coverLetter" TEXT,
    "coverLetterUrl" TEXT,
    "additionalDocsUrl" TEXT,
    "yearsExperience" INTEGER,
    "currentCompany" TEXT,
    "currentTitle" TEXT,
    "expectedSalary" INTEGER,
    "availableDate" TIMESTAMP(3),
    "screeningAnswers" JSONB,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'NEW',
    "stage" TEXT,
    "rating" INTEGER,
    "notes" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "lastContactedAt" TIMESTAMP(3),
    "interviewDate" TIMESTAMP(3),
    "offerDate" TIMESTAMP(3),
    "offerAmount" INTEGER,
    "source" TEXT,
    "referredBy" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "rejectionReason" TEXT,
    "withdrawnReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" "JobType" NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "responsibilities" TEXT NOT NULL,
    "qualifications" TEXT,
    "benefits" TEXT,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "salaryPeriod" TEXT DEFAULT 'yearly',
    "showSalary" BOOLEAN NOT NULL DEFAULT true,
    "equity" TEXT,
    "experienceMin" INTEGER,
    "experienceMax" INTEGER,
    "experienceRequired" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "openPositions" INTEGER NOT NULL DEFAULT 1,
    "applyUrl" TEXT,
    "applyEmail" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "applicationCount" INTEGER NOT NULL DEFAULT 0,
    "postedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closingDate" TIMESTAMP(3),
    "filledDate" TIMESTAMP(3),
    "keywords" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "reason" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MileageAnomaly" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastKnownMileage" INTEGER NOT NULL,
    "currentMileage" INTEGER NOT NULL,
    "gapMiles" INTEGER NOT NULL,
    "severity" TEXT NOT NULL,
    "explanation" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MileageAnomaly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationDismissal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationType" TEXT NOT NULL,
    "dismissedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dismissCount" INTEGER NOT NULL DEFAULT 1,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "NotificationDismissal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerVerificationRequest" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "purpose" TEXT NOT NULL DEFAULT 'rental',
    "bookingId" TEXT,
    "stripeSessionId" TEXT NOT NULL,
    "verificationUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerVerificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "hostId" TEXT,
    "type" TEXT NOT NULL,
    "stripeMethodId" TEXT NOT NULL,
    "last4" TEXT NOT NULL,
    "brand" TEXT,
    "accountType" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "nickname" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiryMonth" INTEGER,
    "expiryYear" INTEGER,
    "holderName" TEXT,
    "status" TEXT DEFAULT 'active',
    "userId" TEXT,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderDocument" (
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
CREATE TABLE "ProviderMessage" (
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
CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "requests" INTEGER NOT NULL,
    "window" INTEGER NOT NULL,
    "currentRequests" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "exceeded" BOOLEAN NOT NULL DEFAULT false,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "bannedUntil" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundRequest" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "requestedByType" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "processedAt" TIMESTAMP(3),
    "stripeRefundId" TEXT,
    "stripeTransferId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "autoApproved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RefundRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalAvailability" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "customPrice" DOUBLE PRECISION,
    "note" TEXT,

    CONSTRAINT "RentalAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalBooking" (
    "id" TEXT NOT NULL,
    "bookingCode" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "renterId" TEXT,
    "guestEmail" TEXT,
    "guestPhone" TEXT,
    "guestName" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verificationDeadline" TIMESTAMP(3),
    "verificationNotes" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "documentsSubmittedAt" TIMESTAMP(3),
    "hotelBookingId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "pickupLocation" TEXT NOT NULL,
    "pickupType" TEXT NOT NULL,
    "deliveryAddress" TEXT,
    "returnLocation" TEXT,
    "dailyRate" DOUBLE PRECISION NOT NULL,
    "numberOfDays" INTEGER NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "deliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "insuranceFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "serviceFee" DOUBLE PRECISION NOT NULL,
    "taxes" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "depositAmount" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "pendingChargesAmount" DECIMAL(10,2),
    "chargesProcessedAt" TIMESTAMP(3),
    "finalReceiptSentAt" TIMESTAMP(3),
    "chargesNotes" TEXT,
    "chargesWaivedAmount" DECIMAL(10,2),
    "chargesWaivedReason" TEXT,
    "chargesAdjustedAmount" DECIMAL(10,2),
    "status" "RentalBookingStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentIntentId" TEXT,
    "stripeCustomerId" TEXT,
    "stripePaymentMethodId" TEXT,
    "stripeChargeId" TEXT,
    "stripeSetupIntentId" TEXT,
    "paymentFailureReason" TEXT,
    "paymentProcessedAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "cancelledBy" "CancelledBy",
    "cancelledAt" TIMESTAMP(3),
    "licenseVerified" BOOLEAN NOT NULL DEFAULT false,
    "licenseNumber" TEXT,
    "licenseState" TEXT,
    "licenseExpiry" TIMESTAMP(3),
    "licensePhotoUrl" TEXT,
    "insurancePhotoUrl" TEXT,
    "selfieVerified" BOOLEAN NOT NULL DEFAULT false,
    "selfiePhotoUrl" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "bookingIpAddress" TEXT,
    "bookingUserAgent" TEXT,
    "bookingCountry" TEXT,
    "bookingCity" TEXT,
    "deviceFingerprint" TEXT,
    "sessionId" TEXT,
    "sessionStartedAt" TIMESTAMP(3),
    "sessionDuration" INTEGER,
    "riskScore" INTEGER DEFAULT 0,
    "riskFlags" TEXT,
    "riskNotes" TEXT,
    "fraudulent" BOOLEAN NOT NULL DEFAULT false,
    "flaggedForReview" BOOLEAN NOT NULL DEFAULT false,
    "formCompletionTime" INTEGER,
    "fieldChangeCount" INTEGER,
    "copyPasteUsed" BOOLEAN NOT NULL DEFAULT false,
    "mouseEventsRecorded" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailDomain" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneCarrier" TEXT,
    "phoneType" TEXT,
    "tripStatus" "TripStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "pickupWindowStart" TIMESTAMP(3),
    "pickupWindowEnd" TIMESTAMP(3),
    "pickupLatitude" DOUBLE PRECISION,
    "pickupLongitude" DOUBLE PRECISION,
    "returnLatitude" DOUBLE PRECISION,
    "returnLongitude" DOUBLE PRECISION,
    "pickupLocationVerified" BOOLEAN NOT NULL DEFAULT false,
    "partnerLocationId" TEXT,
    "tripStartedAt" TIMESTAMP(3),
    "tripEndedAt" TIMESTAMP(3),
    "actualStartTime" TIMESTAMP(3),
    "actualEndTime" TIMESTAMP(3),
    "startMileage" INTEGER,
    "endMileage" INTEGER,
    "fuelLevelStart" TEXT,
    "fuelLevelEnd" TEXT,
    "inspectionPhotosStart" TEXT,
    "inspectionPhotosEnd" TEXT,
    "damageReported" BOOLEAN NOT NULL DEFAULT false,
    "damageDescription" TEXT,
    "damagePhotos" TEXT,
    "extras" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "depositHeld" DOUBLE PRECISION NOT NULL,
    "depositRefunded" DOUBLE PRECISION,
    "depositRefundedAt" TIMESTAMP(3),
    "depositUsedForClaim" DOUBLE PRECISION,
    "securityDeposit" DOUBLE PRECISION NOT NULL,
    "reviewerProfileId" TEXT,
    "guestInsuranceActive" BOOLEAN NOT NULL DEFAULT false,
    "guestInsurancePolicyNumber" TEXT,
    "guestInsuranceProvider" TEXT,
    "insuranceHierarchy" JSONB,
    "depositDiscountApplied" BOOLEAN NOT NULL DEFAULT false,
    "insuranceBoundAt" TIMESTAMP(3),
    "insurancePolicyId" TEXT,
    "insuranceProvider" TEXT,
    "insuranceSelection" TEXT,
    "insuranceStatus" TEXT,
    "insuranceTier" TEXT,
    "platformPolicyActive" BOOLEAN NOT NULL DEFAULT false,
    "policySnapshot" JSONB,
    "guestInsuranceApplied" BOOLEAN NOT NULL DEFAULT false,
    "guestInsuranceVerified" BOOLEAN NOT NULL DEFAULT false,
    "hostRevenueSplit" INTEGER,
    "adminCompletedById" TEXT,
    "adminCompletionNotes" TEXT,
    "tripCompletedBy" TEXT,
    "tripEndRequestedAt" TIMESTAMP(3),
    "tripEndRequestedBy" TEXT,
    "tripEndRequestReason" TEXT,
    "tripEndRequestStatus" TEXT,
    "tripEndApprovedBy" TEXT,
    "tripEndApprovedAt" TIMESTAMP(3),
    "tripEndDeniedReason" TEXT,
    "effectiveTaxRate" DOUBLE PRECISION,
    "pricingSnapshot" JSONB,
    "serviceFeeRate" DOUBLE PRECISION,
    "settingsVersion" TIMESTAMP(3),
    "creditsApplied" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bonusApplied" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "depositFromWallet" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "depositFromCard" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "chargeAmount" DOUBLE PRECISION,
    "agreementExpiresAt" TIMESTAMP(3),
    "agreementSentAt" TIMESTAMP(3),
    "agreementSignedAt" TIMESTAMP(3),
    "agreementSignedPdfUrl" TEXT,
    "agreementStatus" TEXT DEFAULT 'not_sent',
    "agreementToken" TEXT,
    "agreementViewedAt" TIMESTAMP(3),
    "signatureImageUrl" TEXT,
    "signerEmail" TEXT,
    "signerIpAddress" TEXT,
    "signerName" TEXT,
    "signerUserAgent" TEXT,

    CONSTRAINT "RentalBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalCar" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'p2p',
    "externalId" TEXT,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "trim" TEXT,
    "color" TEXT NOT NULL,
    "licensePlate" TEXT,
    "vin" TEXT,
    "carType" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "doors" INTEGER NOT NULL,
    "transmission" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "mpgCity" INTEGER,
    "mpgHighway" INTEGER,
    "currentMileage" INTEGER,
    "dailyRate" DOUBLE PRECISION NOT NULL,
    "weeklyRate" DOUBLE PRECISION,
    "monthlyRate" DOUBLE PRECISION,
    "deliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 35,
    "airportFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hotelFee" DOUBLE PRECISION NOT NULL DEFAULT 35,
    "homeFee" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "weeklyDiscount" DOUBLE PRECISION DEFAULT 0.15,
    "monthlyDiscount" DOUBLE PRECISION DEFAULT 0.30,
    "features" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "airportPickup" BOOLEAN NOT NULL DEFAULT false,
    "hotelDelivery" BOOLEAN NOT NULL DEFAULT true,
    "homeDelivery" BOOLEAN NOT NULL DEFAULT false,
    "deliveryRadius" INTEGER NOT NULL DEFAULT 10,
    "freeDeliveryRadius" INTEGER NOT NULL DEFAULT 0,
    "deliveryInstructions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "instantBook" BOOLEAN NOT NULL DEFAULT true,
    "advanceNotice" INTEGER NOT NULL DEFAULT 2,
    "minTripDuration" INTEGER NOT NULL DEFAULT 1,
    "maxTripDuration" INTEGER NOT NULL DEFAULT 30,
    "bufferTime" INTEGER NOT NULL DEFAULT 2,
    "cancellationPolicy" TEXT NOT NULL DEFAULT 'moderate',
    "checkInTime" TEXT NOT NULL DEFAULT '10:00',
    "checkOutTime" TEXT NOT NULL DEFAULT '10:00',
    "mileageDaily" INTEGER NOT NULL DEFAULT 200,
    "mileageWeekly" INTEGER NOT NULL DEFAULT 1000,
    "mileageMonthly" INTEGER NOT NULL DEFAULT 3000,
    "mileageOverageFee" DOUBLE PRECISION NOT NULL DEFAULT 3.0,
    "rules" TEXT,
    "insuranceIncluded" BOOLEAN NOT NULL DEFAULT false,
    "insuranceDaily" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "totalTrips" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "classificationId" TEXT,
    "estimatedValue" DECIMAL(12,2),
    "insuranceCategory" TEXT,
    "insuranceEligible" BOOLEAN NOT NULL DEFAULT true,
    "insuranceNotes" TEXT,
    "insuranceRiskLevel" TEXT,
    "requiresManualUnderwriting" BOOLEAN NOT NULL DEFAULT false,
    "activeClaimId" TEXT,
    "claimDeactivatedAt" TIMESTAMP(3),
    "claimFreeMonths" INTEGER NOT NULL DEFAULT 0,
    "hasActiveClaim" BOOLEAN NOT NULL DEFAULT false,
    "lastClaimDate" TIMESTAMP(3),
    "totalClaimsCount" INTEGER NOT NULL DEFAULT 0,
    "claimLockUntil" TIMESTAMP(3),
    "requiresInspection" BOOLEAN NOT NULL DEFAULT false,
    "safetyHold" BOOLEAN NOT NULL DEFAULT false,
    "safetyHoldReason" TEXT,
    "repairVerified" BOOLEAN NOT NULL DEFAULT false,
    "annualMileage" INTEGER DEFAULT 12000,
    "garageAddress" TEXT,
    "garageCity" TEXT,
    "garageState" TEXT,
    "garageZip" TEXT,
    "hasAlarm" BOOLEAN NOT NULL DEFAULT false,
    "hasImmobilizer" BOOLEAN NOT NULL DEFAULT false,
    "hasLien" BOOLEAN NOT NULL DEFAULT false,
    "hasTracking" BOOLEAN NOT NULL DEFAULT false,
    "isModified" BOOLEAN NOT NULL DEFAULT false,
    "lienholderName" TEXT,
    "modifications" TEXT,
    "primaryUse" TEXT NOT NULL DEFAULT 'Rental',
    "registeredOwner" TEXT,
    "titleStatus" TEXT NOT NULL DEFAULT 'Clean',
    "lienholderAddress" TEXT,
    "avgMilesPerTrip" DOUBLE PRECISION DEFAULT 0,
    "avgResponseTime" INTEGER DEFAULT 0,
    "esgEnvironmentalScore" INTEGER,
    "esgLastCalculated" TIMESTAMP(3),
    "esgMaintenanceScore" INTEGER,
    "esgSafetyScore" INTEGER,
    "esgScore" INTEGER DEFAULT 50,
    "guestRatingAvg" DOUBLE PRECISION DEFAULT 5.0,
    "lastOdometerCheck" TIMESTAMP(3),
    "maintenanceCadence" INTEGER DEFAULT 90,
    "mileageVariance" DOUBLE PRECISION DEFAULT 0,
    "suspiciousMileageFlag" BOOLEAN NOT NULL DEFAULT false,
    "highUsageInspectionNeeded" BOOLEAN NOT NULL DEFAULT false,
    "inspectionExpired" BOOLEAN NOT NULL DEFAULT false,
    "inspectionExpiresAt" TIMESTAMP(3),
    "lastInspection" TIMESTAMP(3),
    "lastOilChange" TIMESTAMP(3),
    "nextInspectionDue" TIMESTAMP(3),
    "nextOilChangeDue" TIMESTAMP(3),
    "serviceOverdue" BOOLEAN NOT NULL DEFAULT false,
    "lastRentalEndDate" TIMESTAMP(3),
    "lastRentalEndMileage" INTEGER,
    "insuranceExpiryDate" TIMESTAMP(3),
    "insuranceVerifiedAt" TIMESTAMP(3),
    "insuranceVerifiedBy" TEXT,
    "registrationExpiryDate" TIMESTAMP(3),
    "registrationVerifiedAt" TIMESTAMP(3),
    "registrationVerifiedBy" TEXT,
    "titleVerifiedAt" TIMESTAMP(3),
    "titleVerifiedBy" TEXT,
    "vinVerificationMethod" TEXT,
    "vinVerifiedAt" TIMESTAMP(3),
    "vinVerifiedBy" TEXT,
    "registrationState" TEXT,
    "declarationType" TEXT NOT NULL DEFAULT 'Rental',
    "description" TEXT,
    "vehicleType" "VehicleType" NOT NULL DEFAULT 'RENTAL',
    "driveType" TEXT,

    CONSTRAINT "RentalCar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalCarPhoto" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "isHero" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "deviceMake" TEXT,
    "deviceModel" TEXT,
    "gpsLatitude" DOUBLE PRECISION,
    "gpsLongitude" DOUBLE PRECISION,
    "metadata" JSONB,
    "photoContext" TEXT,
    "photoHash" TEXT,
    "photoTimestamp" TIMESTAMP(3),
    "relatedClaimId" TEXT,
    "uploadedBy" TEXT,
    "uploadedByType" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,

    CONSTRAINT "RentalCarPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalDispute" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "type" "DisputeType" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "reviewStartedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,

    CONSTRAINT "RentalDispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalHost" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "bio" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verificationLevel" TEXT,
    "responseTime" INTEGER,
    "responseRate" DOUBLE PRECISION,
    "acceptanceRate" DOUBLE PRECISION,
    "totalTrips" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "autoApproveBookings" BOOLEAN NOT NULL DEFAULT true,
    "bankAccountInfo" TEXT,
    "bankVerified" BOOLEAN NOT NULL DEFAULT false,
    "canEditCalendar" BOOLEAN NOT NULL DEFAULT false,
    "canMessageGuests" BOOLEAN NOT NULL DEFAULT false,
    "canSetPricing" BOOLEAN NOT NULL DEFAULT false,
    "canViewBookings" BOOLEAN NOT NULL DEFAULT false,
    "canWithdrawFunds" BOOLEAN NOT NULL DEFAULT false,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
    "dashboardAccess" BOOLEAN NOT NULL DEFAULT false,
    "depositAmount" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "documentsVerified" BOOLEAN NOT NULL DEFAULT false,
    "driversLicenseUrl" TEXT,
    "governmentIdUrl" TEXT,
    "hostType" TEXT NOT NULL DEFAULT 'PENDING',
    "insuranceDocUrl" TEXT,
    "maxDailyRate" DOUBLE PRECISION,
    "minDailyRate" DOUBLE PRECISION,
    "rejectedReason" TEXT,
    "requireDeposit" BOOLEAN NOT NULL DEFAULT true,
    "suspendedAt" TIMESTAMP(3),
    "suspendedReason" TEXT,
    "bankAccountLast4" TEXT,
    "bankAccountName" TEXT,
    "bankAccountType" TEXT DEFAULT 'checking',
    "bankName" TEXT,
    "businessName" TEXT,
    "businessType" TEXT,
    "debitCardExpMonth" INTEGER,
    "debitCardExpYear" INTEGER,
    "debitCardLast4" TEXT,
    "defaultPayoutMethod" TEXT,
    "instantPayoutEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastPayoutAmount" DOUBLE PRECISION,
    "lastPayoutDate" TIMESTAMP(3),
    "nextScheduledPayout" TIMESTAMP(3),
    "payoutFrequency" TEXT DEFAULT 'weekly',
    "payoutScheduleDay" TEXT DEFAULT 'Friday',
    "protectionPlan" TEXT DEFAULT 'BASIC',
    "protectionPlanFee" DOUBLE PRECISION,
    "stripeAccountId" TEXT,
    "stripeAccountStatus" TEXT DEFAULT 'pending',
    "stripeChargesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "stripeDetailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "stripePayoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "stripeTosAcceptanceDate" TIMESTAMP(3),
    "stripeTosAcceptanceIp" TEXT,
    "taxIdType" TEXT,
    "totalPayoutAmount" DOUBLE PRECISION DEFAULT 0,
    "totalPayoutCount" INTEGER DEFAULT 0,
    "backgroundCheckStatus" TEXT,
    "documentStatuses" JSONB,
    "documentsRequestedAt" TIMESTAMP(3),
    "documentsResubmittedAt" TIMESTAMP(3),
    "lastNotificationSent" TIMESTAMP(3),
    "pendingActions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "restrictionReasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bankAccountToken" TEXT,
    "bankVerifiedDate" TIMESTAMP(3),
    "currentBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "debitCardBrand" TEXT,
    "debitCardToken" TEXT,
    "debitCardVerified" BOOLEAN NOT NULL DEFAULT false,
    "defaultPayoutMethodId" TEXT,
    "holdFundsUntil" TIMESTAMP(3),
    "holdReason" TEXT,
    "instantPayoutFeeRate" DOUBLE PRECISION NOT NULL DEFAULT 0.015,
    "minimumPayoutAmount" DOUBLE PRECISION NOT NULL DEFAULT 50.00,
    "payoutMethods" JSONB,
    "payoutSchedule" TEXT NOT NULL DEFAULT 'weekly',
    "payoutsDisabledReason" TEXT,
    "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pendingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "platformFeeRate" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
    "stripeConnectAccountId" TEXT,
    "stripeOnboardingLink" TEXT,
    "taxIdProvided" BOOLEAN NOT NULL DEFAULT false,
    "totalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPayoutsAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPayoutsCount" INTEGER NOT NULL DEFAULT 0,
    "w9Submitted" BOOLEAN NOT NULL DEFAULT false,
    "w9SubmittedDate" TIMESTAMP(3),
    "defaultPaymentMethodOnFile" TEXT,
    "holdBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastChargeReason" TEXT,
    "lastChargedDate" TIMESTAMP(3),
    "lastSubscriptionChargeDate" TIMESTAMP(3),
    "monthlySubscriptionFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "negativeBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nextSubscriptionChargeDate" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "subscriptionEndDate" TIMESTAMP(3),
    "subscriptionStartDate" TIMESTAMP(3),
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "subscriptionTier" TEXT NOT NULL DEFAULT 'FREE',
    "totalChargedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deactivationReason" TEXT,
    "hostInsuranceDeactivatedAt" TIMESTAMP(3),
    "hostInsuranceExpires" TIMESTAMP(3),
    "hostInsuranceProvider" TEXT,
    "hostInsuranceStatus" "HostInsuranceStatus" NOT NULL DEFAULT 'ACTIVE',
    "hostPolicyNumber" TEXT,
    "insuranceHistory" JSONB,
    "insuranceActive" BOOLEAN NOT NULL DEFAULT false,
    "insuranceAssignedAt" TIMESTAMP(3),
    "insuranceAssignedBy" TEXT,
    "insurancePolicyNumber" TEXT,
    "insuranceProviderId" TEXT,
    "commercialInsuranceActive" BOOLEAN NOT NULL DEFAULT false,
    "commercialInsuranceExpires" TIMESTAMP(3),
    "commercialInsuranceProvider" TEXT,
    "commercialInsuranceStatus" "InsuranceStatus",
    "commercialPolicyNumber" TEXT,
    "earningsTier" "EarningsTier" NOT NULL DEFAULT 'BASIC',
    "lastTierChange" TIMESTAMP(3),
    "p2pInsuranceActive" BOOLEAN NOT NULL DEFAULT false,
    "p2pInsuranceExpires" TIMESTAMP(3),
    "p2pInsuranceProvider" TEXT,
    "p2pInsuranceStatus" "InsuranceStatus",
    "p2pPolicyNumber" TEXT,
    "tierChangeBy" TEXT,
    "tierChangeReason" TEXT,
    "usingLegacyInsurance" BOOLEAN NOT NULL DEFAULT true,
    "insuranceType" TEXT NOT NULL DEFAULT 'none',
    "revenueSplit" INTEGER NOT NULL DEFAULT 40,
    "suspensionExpiresAt" TIMESTAMP(3),
    "legacyDualId" TEXT,
    "autoApproveListings" BOOLEAN NOT NULL DEFAULT true,
    "currentCommissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
    "partnerAvgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "partnerBio" TEXT,
    "partnerCompanyName" TEXT,
    "partnerFleetSize" INTEGER NOT NULL DEFAULT 0,
    "partnerLogo" TEXT,
    "partnerPayoutSchedule" "PartnerPayoutSchedule",
    "partnerSlug" TEXT,
    "partnerSupportEmail" TEXT,
    "partnerSupportPhone" TEXT,
    "partnerTotalBookings" INTEGER NOT NULL DEFAULT 0,
    "partnerTotalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tier1CommissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "tier1VehicleCount" INTEGER NOT NULL DEFAULT 10,
    "tier2CommissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "tier2VehicleCount" INTEGER NOT NULL DEFAULT 50,
    "tier3CommissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "tier3VehicleCount" INTEGER NOT NULL DEFAULT 100,
    "businessHours" TEXT,
    "partnerBadges" JSONB,
    "partnerBenefits" JSONB,
    "partnerHeroImage" TEXT,
    "partnerPolicies" JSONB,
    "yearEstablished" INTEGER,
    "photoIdType" TEXT,
    "photoIdUrls" JSONB,
    "photoIdVerified" BOOLEAN NOT NULL DEFAULT false,
    "photoIdSubmittedAt" TIMESTAMP(3),
    "hostManagerBio" TEXT,
    "hostManagerLogo" TEXT,
    "hostManagerName" TEXT,
    "hostManagerSlug" TEXT,
    "isHostManager" BOOLEAN NOT NULL DEFAULT false,
    "isVehicleOwner" BOOLEAN NOT NULL DEFAULT false,
    "managesOthersCars" BOOLEAN NOT NULL DEFAULT false,
    "managesOwnCars" BOOLEAN NOT NULL DEFAULT true,
    "stripeDisabledReason" TEXT,
    "stripeRequirements" JSONB,
    "partnerWebsite" TEXT,
    "partnerInstagram" TEXT,
    "partnerFacebook" TEXT,
    "partnerTwitter" TEXT,
    "partnerLinkedIn" TEXT,
    "partnerTikTok" TEXT,
    "partnerYouTube" TEXT,
    "partnerShowEmail" BOOLEAN NOT NULL DEFAULT true,
    "partnerShowPhone" BOOLEAN NOT NULL DEFAULT true,
    "partnerShowWebsite" BOOLEAN NOT NULL DEFAULT true,
    "partnerHeroTitle" TEXT,
    "partnerHeroSubtitle" TEXT,
    "partnerPrimaryColor" TEXT,
    "referralBonusEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "referralCode" TEXT,
    "referralCount" INTEGER NOT NULL DEFAULT 0,
    "referredByHostId" TEXT,
    "enableLeasing" BOOLEAN NOT NULL DEFAULT false,
    "enableRentToOwn" BOOLEAN NOT NULL DEFAULT false,
    "enableRentals" BOOLEAN NOT NULL DEFAULT false,
    "enableRideshare" BOOLEAN NOT NULL DEFAULT true,
    "enableSales" BOOLEAN NOT NULL DEFAULT false,
    "partnerServices" JSONB,
    "vehicleApprovalMode" TEXT NOT NULL DEFAULT 'DYNAMIC',
    "vehicleApprovalThreshold" INTEGER NOT NULL DEFAULT 25,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "identityVerificationSessionId" TEXT,
    "identityVerified" BOOLEAN NOT NULL DEFAULT false,
    "identityVerifiedAt" TIMESTAMP(3),
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerifiedAt" TIMESTAMP(3),
    "agreementTemplateCustom" JSONB,

    CONSTRAINT "RentalHost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalMessage" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "senderName" TEXT,
    "senderEmail" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "hasAttachment" BOOLEAN NOT NULL DEFAULT false,
    "attachmentUrl" TEXT,
    "attachmentName" TEXT,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "readByAdmin" BOOLEAN NOT NULL DEFAULT false,
    "adminNotes" TEXT,
    "readAt" TIMESTAMP(3),
    "metadata" JSONB,
    "replyToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalPayout" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "bookingCount" INTEGER NOT NULL,
    "grossEarnings" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL,
    "processingFee" DOUBLE PRECISION NOT NULL,
    "netPayout" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT,
    "paymentDetails" TEXT,
    "transactionId" TEXT,
    "stripeTransferId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "bookingId" TEXT,
    "eligibleAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalReview" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "carId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "renterId" TEXT,
    "reviewerProfileId" TEXT,
    "source" "ReviewSource" NOT NULL DEFAULT 'GUEST',
    "rating" INTEGER NOT NULL,
    "cleanliness" INTEGER,
    "accuracy" INTEGER,
    "communication" INTEGER,
    "convenience" INTEGER,
    "value" INTEGER,
    "title" TEXT,
    "comment" TEXT,
    "hostResponse" TEXT,
    "hostRespondedAt" TIMESTAMP(3),
    "supportResponse" TEXT,
    "supportRespondedAt" TIMESTAMP(3),
    "supportRespondedBy" TEXT,
    "tripStartDate" TIMESTAMP(3),
    "tripEndDate" TIMESTAMP(3),
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Revenue" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "period" "RevenuePeriod" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "rideCount" INTEGER NOT NULL,
    "rideGross" DOUBLE PRECISION NOT NULL,
    "rideCommission" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL,
    "rideNet" DOUBLE PRECISION NOT NULL,
    "bookingCount" INTEGER NOT NULL,
    "bookingValue" DOUBLE PRECISION NOT NULL,
    "savedCommission" DOUBLE PRECISION NOT NULL,
    "totalRevenue" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "RevenueStatus" NOT NULL,
    "availableBalance" DOUBLE PRECISION NOT NULL,
    "pendingBalance" DOUBLE PRECISION NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Revenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewTemplate" (
    "id" TEXT NOT NULL,
    "carType" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "titleTemplate" TEXT NOT NULL,
    "commentTemplate" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewerProfile" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT NOT NULL,
    "profilePhotoUrl" TEXT,
    "memberSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'AZ',
    "tripCount" INTEGER NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bio" TEXT,
    "canInstantBook" BOOLEAN NOT NULL DEFAULT false,
    "dateOfBirth" TIMESTAMP(3),
    "documentVerifiedAt" TIMESTAMP(3),
    "documentVerifiedBy" TEXT,
    "documentsVerified" BOOLEAN NOT NULL DEFAULT false,
    "driversLicenseUrl" TEXT,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "emergencyContactRelation" TEXT,
    "fullyVerified" BOOLEAN NOT NULL DEFAULT false,
    "governmentIdType" "GovernmentIdType",
    "governmentIdUrl" TEXT,
    "insuranceCardUrl" TEXT,
    "insuranceProvider" TEXT,
    "insuranceVerified" BOOLEAN NOT NULL DEFAULT false,
    "insuranceVerifiedAt" TIMESTAMP(3),
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "memberTier" "MemberTier" NOT NULL DEFAULT 'BRONZE',
    "phoneNumber" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "preferredCurrency" TEXT NOT NULL DEFAULT 'USD',
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "selfieUrl" TEXT,
    "smsNotifications" BOOLEAN NOT NULL DEFAULT true,
    "totalTrips" INTEGER NOT NULL DEFAULT 0,
    "zipCode" TEXT,
    "address" TEXT,
    "profileCompletion" INTEGER NOT NULL DEFAULT 0,
    "autoReactivate" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,
    "bannedAt" TIMESTAMP(3),
    "bannedBy" TEXT,
    "lastWarningAt" TIMESTAMP(3),
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "notifiedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "suspendedBy" TEXT,
    "suspendedReason" TEXT,
    "suspensionExpiresAt" TIMESTAMP(3),
    "suspensionLevel" "SuspensionLevel",
    "warningCount" INTEGER NOT NULL DEFAULT 0,
    "activeWarningCount" INTEGER NOT NULL DEFAULT 0,
    "canBookLuxury" BOOLEAN NOT NULL DEFAULT true,
    "canBookPremium" BOOLEAN NOT NULL DEFAULT true,
    "requiresManualApproval" BOOLEAN NOT NULL DEFAULT false,
    "coverageType" TEXT,
    "customCoverage" TEXT,
    "expiryDate" TIMESTAMP(3),
    "hasRideshare" BOOLEAN NOT NULL DEFAULT false,
    "insuranceAddedAt" TIMESTAMP(3),
    "insuranceCardBackUrl" TEXT,
    "insuranceCardFrontUrl" TEXT,
    "insuranceNotes" TEXT,
    "insuranceUpdatedAt" TIMESTAMP(3),
    "insuranceVerifiedBy" TEXT,
    "policyNumber" TEXT,
    "lastPasswordReset" TIMESTAMP(3),
    "passwordResetAttempts" INTEGER NOT NULL DEFAULT 0,
    "passwordResetLastAttempt" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "resetTokenUsed" BOOLEAN NOT NULL DEFAULT false,
    "accountHoldAppliedAt" TIMESTAMP(3),
    "accountHoldClaimId" TEXT,
    "accountHoldReason" TEXT,
    "accountOnHold" BOOLEAN NOT NULL DEFAULT false,
    "driverLicenseExpiry" TIMESTAMP(3),
    "driverLicenseNumber" TEXT,
    "driverLicenseState" TEXT,
    "legacyDualId" TEXT,
    "referralBonusEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "referralCode" TEXT,
    "referralCount" INTEGER NOT NULL DEFAULT 0,
    "referredByGuestId" TEXT,
    "bonusBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "depositWalletBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stripeCustomerId" TEXT,
    "stripeIdentityReportId" TEXT,
    "stripeIdentitySessionId" TEXT,
    "stripeIdentityStatus" TEXT,
    "stripeIdentityVerifiedAt" TIMESTAMP(3),
    "stripeVerifiedAddress" TEXT,
    "stripeVerifiedDob" TIMESTAMP(3),
    "stripeVerifiedFirstName" TEXT,
    "stripeVerifiedIdExpiry" TIMESTAMP(3),
    "stripeVerifiedIdNumber" TEXT,
    "stripeVerifiedLastName" TEXT,

    CONSTRAINT "ReviewerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ride" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "bookingId" TEXT,
    "guestId" TEXT,
    "driverId" TEXT,
    "pickupAddress" TEXT NOT NULL,
    "pickupLat" DOUBLE PRECISION,
    "pickupLng" DOUBLE PRECISION,
    "pickupTime" TIMESTAMP(3) NOT NULL,
    "pickupType" TEXT NOT NULL,
    "dropoffAddress" TEXT NOT NULL,
    "dropoffLat" DOUBLE PRECISION,
    "dropoffLng" DOUBLE PRECISION,
    "dropoffTime" TIMESTAMP(3),
    "dropoffType" TEXT NOT NULL,
    "status" "RideStatus" NOT NULL,
    "isGhost" BOOLEAN NOT NULL DEFAULT false,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "distancePrice" DOUBLE PRECISION NOT NULL,
    "timePrice" DOUBLE PRECISION NOT NULL,
    "surgeMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "hotelCommission" DOUBLE PRECISION NOT NULL,
    "driverEarnings" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "trackingUrl" TEXT,
    "distance" DOUBLE PRECISION,
    "duration" INTEGER,
    "ghostData" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Ride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" "ThreatSeverity" NOT NULL,
    "sourceIp" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "targetResource" TEXT,
    "targetId" TEXT,
    "message" TEXT NOT NULL,
    "details" TEXT,
    "stackTrace" TEXT,
    "action" TEXT NOT NULL,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "token" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenFamily" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "deviceId" TEXT,
    "fingerprint" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Threat" (
    "id" TEXT NOT NULL,
    "type" "AttackType" NOT NULL,
    "severity" "ThreatSeverity" NOT NULL,
    "status" "ThreatStatus" NOT NULL,
    "sourceIp" TEXT NOT NULL,
    "sourceIps" TEXT,
    "country" TEXT,
    "asn" TEXT,
    "reputation" INTEGER,
    "method" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "payload" TEXT,
    "attempts" INTEGER NOT NULL,
    "detectionMethod" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "rules" TEXT,
    "automated" BOOLEAN NOT NULL,
    "actions" TEXT,
    "blockedUntil" TIMESTAMP(3),
    "firstSeen" TIMESTAMP(3) NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Threat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "rideId" TEXT,
    "bookingId" TEXT,
    "status" "TransactionStatus" NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripCharge" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "mileageCharge" DECIMAL(10,2) NOT NULL,
    "fuelCharge" DECIMAL(10,2) NOT NULL,
    "lateCharge" DECIMAL(10,2) NOT NULL,
    "damageCharge" DECIMAL(10,2) NOT NULL,
    "cleaningCharge" DECIMAL(10,2) NOT NULL,
    "otherCharges" DECIMAL(10,2) NOT NULL,
    "totalCharges" DECIMAL(10,2) NOT NULL,
    "chargeDetails" TEXT,
    "chargeStatus" "ChargeStatus" NOT NULL DEFAULT 'PENDING',
    "chargeAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "nextRetryAt" TIMESTAMP(3),
    "disputes" TEXT,
    "disputeNotes" TEXT,
    "disputedAt" TIMESTAMP(3),
    "disputeResolvedAt" TIMESTAMP(3),
    "disputeResolution" TEXT,
    "stripeChargeId" TEXT,
    "chargedAt" TIMESTAMP(3),
    "chargedAmount" DECIMAL(10,2),
    "failureReason" TEXT,
    "failureCode" TEXT,
    "originalAmount" DECIMAL(10,2),
    "adjustedAmount" DECIMAL(10,2),
    "waivedAt" TIMESTAMP(3),
    "waivedBy" TEXT,
    "waivedByAdminId" TEXT,
    "processedByAdminId" TEXT,
    "waiveReason" TEXT,
    "waivePercentage" INTEGER,
    "adjustmentNotes" TEXT,
    "adjustmentRecord" JSONB,
    "refundAmount" DECIMAL(10,2),
    "refundedAt" TIMESTAMP(3),
    "refundReason" TEXT,
    "stripeRefundId" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "holdUntil" TIMESTAMP(3),
    "guestNotifiedAt" TIMESTAMP(3),
    "reminderSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripCharge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripInspectionPhoto" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "photoType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "uploadedByType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gpsLatitude" DOUBLE PRECISION,
    "gpsLongitude" DOUBLE PRECISION,
    "photoTimestamp" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripInspectionPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripIssue" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "hostReportedAt" TIMESTAMP(3),
    "hostDescription" TEXT,
    "hostPhotos" JSONB,
    "hostEstimatedCost" DOUBLE PRECISION,
    "guestReportedAt" TIMESTAMP(3),
    "guestDescription" TEXT,
    "guestPhotos" JSONB,
    "issueType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "tripStartMileage" INTEGER,
    "tripEndMileage" INTEGER,
    "tripStartFuel" TEXT,
    "tripEndFuel" TEXT,
    "startPhotosRef" JSONB,
    "endPhotosRef" JSONB,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "guestAcknowledgedAt" TIMESTAMP(3),
    "guestAckNotes" TEXT,
    "hostReviewedAt" TIMESTAMP(3),
    "hostReviewNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolution" TEXT,
    "claimId" TEXT,
    "escalationDeadline" TIMESTAMP(3),
    "autoEscalated" BOOLEAN NOT NULL DEFAULT false,
    "hostNotifiedAt" TIMESTAMP(3),
    "guestNotifiedAt" TIMESTAMP(3),
    "reminderSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'ANONYMOUS',
    "passwordHash" TEXT,
    "emailVerified" BOOLEAN DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "jobTitle" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "hotelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastActive" TIMESTAMP(3),
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastPasswordReset" TIMESTAMP(3),
    "passwordResetAttempts" INTEGER NOT NULL DEFAULT 0,
    "passwordResetLastAttempt" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "resetTokenUsed" BOOLEAN NOT NULL DEFAULT false,
    "deletionReason" TEXT,
    "deletionRequestedAt" TIMESTAMP(3),
    "deletionScheduledFor" TIMESTAMP(3),
    "emailVerificationCode" TEXT,
    "emailVerificationExpiry" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastFailedLoginAt" TIMESTAMP(3),
    "lockedUntil" TIMESTAMP(3),
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "image" TEXT,
    "legacyDualId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNotificationSettings" (
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
CREATE TABLE "VehicleClassification" (
    "id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "category" "VehicleCategory" NOT NULL,
    "riskLevel" "RiskCategory" NOT NULL,
    "baseValue" DECIMAL(12,2) NOT NULL,
    "currentValue" DECIMAL(12,2) NOT NULL,
    "valueSource" TEXT,
    "lastValueCheck" TIMESTAMP(3),
    "features" JSONB,
    "isInsurable" BOOLEAN NOT NULL DEFAULT true,
    "insurabilityReason" TEXT,
    "requiresManualReview" BOOLEAN NOT NULL DEFAULT false,
    "baseRateMultiplier" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "riskMultiplier" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "providerId" TEXT,
    "providerSpecificRules" JSONB,
    "notes" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleClassification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleCoverageOverride" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "vin" TEXT,
    "providerId" TEXT NOT NULL,
    "overrideType" "CoverageOverrideType" NOT NULL,
    "customRules" JSONB NOT NULL,
    "reason" TEXT NOT NULL,
    "approvedBy" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleCoverageOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleInsuranceOverride" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "overriddenBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleInsuranceOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleServiceRecord" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "mileageAtService" INTEGER NOT NULL,
    "nextServiceDue" TIMESTAMP(3),
    "nextServiceMileage" INTEGER,
    "shopName" TEXT NOT NULL,
    "shopAddress" TEXT NOT NULL,
    "technicianName" TEXT,
    "invoiceNumber" TEXT,
    "receiptUrl" TEXT NOT NULL,
    "inspectionReportUrl" TEXT,
    "itemsServiced" TEXT[],
    "costTotal" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "verifiedByFleet" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "addedBy" TEXT DEFAULT 'SYSTEM',
    "addedByType" TEXT DEFAULT 'HOST',

    CONSTRAINT "VehicleServiceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_impersonation_logs" (
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

-- CreateTable
CREATE TABLE "host_charges" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "chargeType" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "chargedBy" TEXT NOT NULL,
    "stripeChargeId" TEXT,
    "stripeCustomerId" TEXT,
    "status" TEXT NOT NULL,
    "failureReason" TEXT,
    "paymentMethodUsed" TEXT,
    "metadata" JSONB,
    "notes" TEXT,
    "relatedBookingId" TEXT,
    "relatedClaimId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),

    CONSTRAINT "host_charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_history" (
    "id" TEXT NOT NULL,
    "reviewerProfileId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "insuranceProvider" TEXT,
    "policyNumber" TEXT,
    "expiryDate" TIMESTAMP(3),
    "hasRideshare" BOOLEAN NOT NULL DEFAULT false,
    "coverageType" TEXT,
    "customCoverage" TEXT,
    "insuranceCardFrontUrl" TEXT,
    "insuranceCardBackUrl" TEXT,
    "insuranceNotes" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changeReason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "management_invitations" (
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

-- CreateTable
CREATE TABLE "partner_applications" (
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

-- CreateTable
CREATE TABLE "partner_commission_history" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "oldRate" DOUBLE PRECISION NOT NULL,
    "newRate" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "changedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_commission_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_discounts" (
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

-- CreateTable
CREATE TABLE "partner_documents" (
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

-- CreateTable
CREATE TABLE "partner_faqs" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_payouts" (
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

-- CreateTable
CREATE TABLE "platform_settings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "defaultTaxRate" DOUBLE PRECISION NOT NULL DEFAULT 0.056,
    "taxByState" JSONB,
    "taxByCityOverride" JSONB,
    "platformCommission" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "partnerMinCommission" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "partnerMaxCommission" DOUBLE PRECISION NOT NULL DEFAULT 0.50,
    "fullRefundHours" INTEGER NOT NULL DEFAULT 72,
    "partialRefund75Hours" INTEGER NOT NULL DEFAULT 24,
    "partialRefund50Hours" INTEGER NOT NULL DEFAULT 12,
    "noRefundHours" INTEGER NOT NULL DEFAULT 12,
    "lateReturnGraceMinutes" INTEGER NOT NULL DEFAULT 30,
    "pickupGraceMinutes" INTEGER NOT NULL DEFAULT 15,
    "mileageOverageRate" DOUBLE PRECISION NOT NULL DEFAULT 0.45,
    "dailyIncludedMiles" INTEGER NOT NULL DEFAULT 200,
    "fuelRefillRateQuarter" DOUBLE PRECISION NOT NULL DEFAULT 75,
    "fuelRefillRateFull" DOUBLE PRECISION NOT NULL DEFAULT 300,
    "lateReturnHourlyRate" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "lateReturnDailyMax" DOUBLE PRECISION NOT NULL DEFAULT 300,
    "cleaningFeeStandard" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "cleaningFeeDeep" DOUBLE PRECISION NOT NULL DEFAULT 150,
    "cleaningFeeBiohazard" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "noShowFee" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "smokingFee" DOUBLE PRECISION NOT NULL DEFAULT 250,
    "petHairFee" DOUBLE PRECISION NOT NULL DEFAULT 75,
    "lostKeyFee" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "defaultDepositPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
    "minDeposit" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "maxDeposit" DOUBLE PRECISION NOT NULL DEFAULT 2500,
    "insuranceDiscountPct" DOUBLE PRECISION NOT NULL DEFAULT 0.50,
    "standardPayoutDelay" INTEGER NOT NULL DEFAULT 3,
    "newHostPayoutDelay" INTEGER NOT NULL DEFAULT 7,
    "minimumPayout" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "instantPayoutFee" DOUBLE PRECISION NOT NULL DEFAULT 0.015,
    "guestSignupBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hostSignupBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "referralBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bonusExpirationDays" INTEGER NOT NULL DEFAULT 90,
    "minorDamageMax" DOUBLE PRECISION NOT NULL DEFAULT 250,
    "moderateDamageMax" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "majorDamageMin" DOUBLE PRECISION NOT NULL DEFAULT 1000,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "basicInsuranceDaily" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "exoticDeposit" DOUBLE PRECISION NOT NULL DEFAULT 2500,
    "guestReferralBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hostReferralBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "insuranceRequiredUnder25" BOOLEAN NOT NULL DEFAULT true,
    "luxuryDeposit" DOUBLE PRECISION NOT NULL DEFAULT 1000,
    "premiumInsuranceDaily" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "serviceFeeRate" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "maxBonusPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
    "partnerDirectRefundLimit" DOUBLE PRECISION NOT NULL DEFAULT 250,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_management" (
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

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "AccountHold_active_idx" ON "AccountHold"("active");

-- CreateIndex
CREATE INDEX "AccountHold_claimId_idx" ON "AccountHold"("claimId");

-- CreateIndex
CREATE INDEX "AccountHold_guestId_idx" ON "AccountHold"("guestId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountLinkRequest_guestLinkToken_key" ON "AccountLinkRequest"("guestLinkToken");

-- CreateIndex
CREATE UNIQUE INDEX "AccountLinkRequest_hostLinkToken_key" ON "AccountLinkRequest"("hostLinkToken");

-- CreateIndex
CREATE INDEX "AccountLinkRequest_guestLinkToken_idx" ON "AccountLinkRequest"("guestLinkToken");

-- CreateIndex
CREATE INDEX "AccountLinkRequest_hostLinkToken_idx" ON "AccountLinkRequest"("hostLinkToken");

-- CreateIndex
CREATE INDEX "AccountLinkRequest_initiatingUserId_idx" ON "AccountLinkRequest"("initiatingUserId");

-- CreateIndex
CREATE INDEX "AccountLinkRequest_status_idx" ON "AccountLinkRequest"("status");

-- CreateIndex
CREATE INDEX "AccountLinkRequest_targetEmail_idx" ON "AccountLinkRequest"("targetEmail");

-- CreateIndex
CREATE INDEX "ActivityLog_adminId_idx" ON "ActivityLog"("adminId");

-- CreateIndex
CREATE INDEX "ActivityLog_category_idx" ON "ActivityLog"("category");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_entityType_idx" ON "ActivityLog"("entityType");

-- CreateIndex
CREATE INDEX "ActivityLog_hostId_idx" ON "ActivityLog"("hostId");

-- CreateIndex
CREATE INDEX "ActivityLog_severity_idx" ON "ActivityLog"("severity");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "AdminNotification_createdAt_idx" ON "AdminNotification"("createdAt");

-- CreateIndex
CREATE INDEX "AdminNotification_priority_idx" ON "AdminNotification"("priority");

-- CreateIndex
CREATE INDEX "AdminNotification_status_idx" ON "AdminNotification"("status");

-- CreateIndex
CREATE INDEX "AdminNotification_type_idx" ON "AdminNotification"("type");

-- CreateIndex
CREATE INDEX "AmadeusCarCache_expiresAt_idx" ON "AmadeusCarCache"("expiresAt");

-- CreateIndex
CREATE INDEX "AmadeusCarCache_location_searchDate_idx" ON "AmadeusCarCache"("location", "searchDate");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "ApiKey_hotelId_idx" ON "ApiKey"("hotelId");

-- CreateIndex
CREATE INDEX "ApiKey_key_idx" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "AppealNotification_appealId_idx" ON "AppealNotification"("appealId");

-- CreateIndex
CREATE INDEX "AppealNotification_guestId_seen_idx" ON "AppealNotification"("guestId", "seen");

-- CreateIndex
CREATE INDEX "ApplicationActivity_applicationId_idx" ON "ApplicationActivity"("applicationId");

-- CreateIndex
CREATE INDEX "ApplicationActivity_createdAt_idx" ON "ApplicationActivity"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_adminEmail_idx" ON "AuditLog"("adminEmail");

-- CreateIndex
CREATE INDEX "AuditLog_adminId_idx" ON "AuditLog"("adminId");

-- CreateIndex
CREATE INDEX "AuditLog_category_idx" ON "AuditLog"("category");

-- CreateIndex
CREATE INDEX "AuditLog_eventType_idx" ON "AuditLog"("eventType");

-- CreateIndex
CREATE INDEX "AuditLog_hotelId_idx" ON "AuditLog"("hotelId");

-- CreateIndex
CREATE INDEX "AuditLog_resourceId_idx" ON "AuditLog"("resourceId");

-- CreateIndex
CREATE INDEX "AuditLog_severity_idx" ON "AuditLog"("severity");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "BackgroundCheck_checkType_idx" ON "BackgroundCheck"("checkType");

-- CreateIndex
CREATE INDEX "BackgroundCheck_expiresAt_idx" ON "BackgroundCheck"("expiresAt");

-- CreateIndex
CREATE INDEX "BackgroundCheck_hostId_idx" ON "BackgroundCheck"("hostId");

-- CreateIndex
CREATE INDEX "BackgroundCheck_status_idx" ON "BackgroundCheck"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BackgroundCheck_hostId_checkType_key" ON "BackgroundCheck"("hostId", "checkType");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_confirmationNumber_key" ON "Booking"("confirmationNumber");

-- CreateIndex
CREATE INDEX "Booking_confirmationNumber_idx" ON "Booking"("confirmationNumber");

-- CreateIndex
CREATE INDEX "Booking_guestId_idx" ON "Booking"("guestId");

-- CreateIndex
CREATE INDEX "Booking_hotelId_idx" ON "Booking"("hotelId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BookingSession_bookingId_key" ON "BookingSession"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "BookingSession_sessionId_key" ON "BookingSession"("sessionId");

-- CreateIndex
CREATE INDEX "BookingSession_abandoned_idx" ON "BookingSession"("abandoned");

-- CreateIndex
CREATE INDEX "BookingSession_sessionId_idx" ON "BookingSession"("sessionId");

-- CreateIndex
CREATE INDEX "ChargeAdjustment_adminId_idx" ON "ChargeAdjustment"("adminId");

-- CreateIndex
CREATE INDEX "ChargeAdjustment_bookingId_idx" ON "ChargeAdjustment"("bookingId");

-- CreateIndex
CREATE INDEX "ChargeAdjustment_chargeId_idx" ON "ChargeAdjustment"("chargeId");

-- CreateIndex
CREATE INDEX "ChargeAdjustment_processingStatus_idx" ON "ChargeAdjustment"("processingStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_fnolNumber_key" ON "Claim"("fnolNumber");

-- CreateIndex
CREATE INDEX "Claim_bookingId_idx" ON "Claim"("bookingId");

-- CreateIndex
CREATE INDEX "Claim_filedByGuestId_idx" ON "Claim"("filedByGuestId");

-- CreateIndex
CREATE INDEX "Claim_filedByRole_idx" ON "Claim"("filedByRole");

-- CreateIndex
CREATE INDEX "Claim_fnolNumber_idx" ON "Claim"("fnolNumber");

-- CreateIndex
CREATE INDEX "Claim_fnolStatus_idx" ON "Claim"("fnolStatus");

-- CreateIndex
CREATE INDEX "Claim_guestResponseDeadline_idx" ON "Claim"("guestResponseDeadline");

-- CreateIndex
CREATE INDEX "Claim_hostId_idx" ON "Claim"("hostId");

-- CreateIndex
CREATE INDEX "Claim_incidentCity_idx" ON "Claim"("incidentCity");

-- CreateIndex
CREATE INDEX "Claim_incidentState_idx" ON "Claim"("incidentState");

-- CreateIndex
CREATE INDEX "Claim_lastMessageAt_idx" ON "Claim"("lastMessageAt");

-- CreateIndex
CREATE INDEX "Claim_otherPartyInvolved_idx" ON "Claim"("otherPartyInvolved");

-- CreateIndex
CREATE INDEX "Claim_payoutId_idx" ON "Claim"("payoutId");

-- CreateIndex
CREATE INDEX "Claim_policeReportNumber_idx" ON "Claim"("policeReportNumber");

-- CreateIndex
CREATE INDEX "Claim_policyId_idx" ON "Claim"("policyId");

-- CreateIndex
CREATE INDEX "Claim_status_idx" ON "Claim"("status");

-- CreateIndex
CREATE INDEX "Claim_type_idx" ON "Claim"("type");

-- CreateIndex
CREATE INDEX "Claim_vehicleDeactivated_idx" ON "Claim"("vehicleDeactivated");

-- CreateIndex
CREATE INDEX "Claim_vehicleDrivable_idx" ON "Claim"("vehicleDrivable");

-- CreateIndex
CREATE INDEX "Claim_wasPoliceContacted_idx" ON "Claim"("wasPoliceContacted");

-- CreateIndex
CREATE INDEX "Claim_wereInjuries_idx" ON "Claim"("wereInjuries");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_bookingId_hostId_key" ON "Claim"("bookingId", "hostId");

-- CreateIndex
CREATE INDEX "ClaimDamagePhoto_claimId_idx" ON "ClaimDamagePhoto"("claimId");

-- CreateIndex
CREATE INDEX "ClaimDamagePhoto_deletedAt_idx" ON "ClaimDamagePhoto"("deletedAt");

-- CreateIndex
CREATE INDEX "ClaimDamagePhoto_uploadedAt_idx" ON "ClaimDamagePhoto"("uploadedAt");

-- CreateIndex
CREATE INDEX "ClaimDamagePhoto_uploadedBy_idx" ON "ClaimDamagePhoto"("uploadedBy");

-- CreateIndex
CREATE INDEX "ClaimEdit_claimId_idx" ON "ClaimEdit"("claimId");

-- CreateIndex
CREATE INDEX "ClaimEdit_editedAt_idx" ON "ClaimEdit"("editedAt");

-- CreateIndex
CREATE INDEX "ClaimEdit_editedBy_idx" ON "ClaimEdit"("editedBy");

-- CreateIndex
CREATE INDEX "ClaimEdit_fieldChanged_idx" ON "ClaimEdit"("fieldChanged");

-- CreateIndex
CREATE INDEX "ClaimMessage_claimId_idx" ON "ClaimMessage"("claimId");

-- CreateIndex
CREATE INDEX "ClaimMessage_createdAt_idx" ON "ClaimMessage"("createdAt");

-- CreateIndex
CREATE INDEX "ClaimMessage_senderType_idx" ON "ClaimMessage"("senderType");

-- CreateIndex
CREATE INDEX "ContactMessage_email_idx" ON "ContactMessage"("email");

-- CreateIndex
CREATE INDEX "ContactMessage_status_idx" ON "ContactMessage"("status");

-- CreateIndex
CREATE INDEX "CreditBonusTransaction_action_idx" ON "CreditBonusTransaction"("action");

-- CreateIndex
CREATE INDEX "CreditBonusTransaction_bookingId_idx" ON "CreditBonusTransaction"("bookingId");

-- CreateIndex
CREATE INDEX "CreditBonusTransaction_createdAt_idx" ON "CreditBonusTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "CreditBonusTransaction_expiresAt_idx" ON "CreditBonusTransaction"("expiresAt");

-- CreateIndex
CREATE INDEX "CreditBonusTransaction_guestId_idx" ON "CreditBonusTransaction"("guestId");

-- CreateIndex
CREATE INDEX "CreditBonusTransaction_type_idx" ON "CreditBonusTransaction"("type");

-- CreateIndex
CREATE INDEX "DataExportLog_status_idx" ON "DataExportLog"("status");

-- CreateIndex
CREATE INDEX "DataExportLog_userId_idx" ON "DataExportLog"("userId");

-- CreateIndex
CREATE INDEX "DepositTransaction_bookingId_idx" ON "DepositTransaction"("bookingId");

-- CreateIndex
CREATE INDEX "DepositTransaction_createdAt_idx" ON "DepositTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "DepositTransaction_guestId_idx" ON "DepositTransaction"("guestId");

-- CreateIndex
CREATE INDEX "DepositTransaction_type_idx" ON "DepositTransaction"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_email_key" ON "Driver"("email");

-- CreateIndex
CREATE INDEX "Driver_available_idx" ON "Driver"("available");

-- CreateIndex
CREATE INDEX "Driver_email_idx" ON "Driver"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ESGBadge_badgeCode_key" ON "ESGBadge"("badgeCode");

-- CreateIndex
CREATE INDEX "ESGBadge_badgeCode_idx" ON "ESGBadge"("badgeCode");

-- CreateIndex
CREATE INDEX "ESGEvent_createdAt_idx" ON "ESGEvent"("createdAt");

-- CreateIndex
CREATE INDEX "ESGEvent_eventCategory_idx" ON "ESGEvent"("eventCategory");

-- CreateIndex
CREATE INDEX "ESGEvent_eventType_idx" ON "ESGEvent"("eventType");

-- CreateIndex
CREATE INDEX "ESGEvent_hostId_idx" ON "ESGEvent"("hostId");

-- CreateIndex
CREATE INDEX "ESGSnapshot_profileId_idx" ON "ESGSnapshot"("profileId");

-- CreateIndex
CREATE INDEX "ESGSnapshot_snapshotDate_idx" ON "ESGSnapshot"("snapshotDate");

-- CreateIndex
CREATE INDEX "FraudIndicator_bookingId_idx" ON "FraudIndicator"("bookingId");

-- CreateIndex
CREATE INDEX "FraudIndicator_indicator_idx" ON "FraudIndicator"("indicator");

-- CreateIndex
CREATE INDEX "FraudIndicator_severity_idx" ON "FraudIndicator"("severity");

-- CreateIndex
CREATE INDEX "Guest_email_idx" ON "Guest"("email");

-- CreateIndex
CREATE UNIQUE INDEX "GuestAccessToken_token_key" ON "GuestAccessToken"("token");

-- CreateIndex
CREATE INDEX "GuestAccessToken_email_idx" ON "GuestAccessToken"("email");

-- CreateIndex
CREATE INDEX "GuestAccessToken_token_idx" ON "GuestAccessToken"("token");

-- CreateIndex
CREATE INDEX "GuestAppeal_guestId_idx" ON "GuestAppeal"("guestId");

-- CreateIndex
CREATE INDEX "GuestAppeal_moderationId_idx" ON "GuestAppeal"("moderationId");

-- CreateIndex
CREATE INDEX "GuestAppeal_status_idx" ON "GuestAppeal"("status");

-- CreateIndex
CREATE INDEX "GuestInsurance_expiresAt_idx" ON "GuestInsurance"("expiresAt");

-- CreateIndex
CREATE INDEX "GuestInsurance_guestId_idx" ON "GuestInsurance"("guestId");

-- CreateIndex
CREATE INDEX "GuestInsurance_verified_idx" ON "GuestInsurance"("verified");

-- CreateIndex
CREATE INDEX "GuestModeration_actionType_idx" ON "GuestModeration"("actionType");

-- CreateIndex
CREATE INDEX "GuestModeration_expiresAt_idx" ON "GuestModeration"("expiresAt");

-- CreateIndex
CREATE INDEX "GuestModeration_guestId_takenAt_idx" ON "GuestModeration"("guestId", "takenAt");

-- CreateIndex
CREATE INDEX "GuestModeration_takenBy_idx" ON "GuestModeration"("takenBy");

-- CreateIndex
CREATE INDEX "GuestModeration_warningCategory_idx" ON "GuestModeration"("warningCategory");

-- CreateIndex
CREATE UNIQUE INDEX "GuestProfileStatus_guestId_key" ON "GuestProfileStatus"("guestId");

-- CreateIndex
CREATE INDEX "GuestProfileStatus_accountStatus_idx" ON "GuestProfileStatus"("accountStatus");

-- CreateIndex
CREATE INDEX "GuestProfileStatus_activeSuspensions_idx" ON "GuestProfileStatus"("activeSuspensions");

-- CreateIndex
CREATE INDEX "GuestProfileStatus_activeWarningCount_idx" ON "GuestProfileStatus"("activeWarningCount");

-- CreateIndex
CREATE INDEX "GuestProfileStatus_guestId_idx" ON "GuestProfileStatus"("guestId");

-- CreateIndex
CREATE INDEX "GuestProfileStatus_lastSuspensionAt_idx" ON "GuestProfileStatus"("lastSuspensionAt");

-- CreateIndex
CREATE INDEX "GuestProfileStatus_lastWarningAt_idx" ON "GuestProfileStatus"("lastWarningAt");

-- CreateIndex
CREATE INDEX "HostBadgeEarned_badgeCode_idx" ON "HostBadgeEarned"("badgeCode");

-- CreateIndex
CREATE INDEX "HostBadgeEarned_hostId_idx" ON "HostBadgeEarned"("hostId");

-- CreateIndex
CREATE UNIQUE INDEX "HostBadgeEarned_hostId_badgeCode_key" ON "HostBadgeEarned"("hostId", "badgeCode");

-- CreateIndex
CREATE INDEX "HostDocumentStatus_expiryDate_idx" ON "HostDocumentStatus"("expiryDate");

-- CreateIndex
CREATE INDEX "HostDocumentStatus_hostId_idx" ON "HostDocumentStatus"("hostId");

-- CreateIndex
CREATE INDEX "HostDocumentStatus_reviewStatus_idx" ON "HostDocumentStatus"("reviewStatus");

-- CreateIndex
CREATE INDEX "HostDocumentStatus_status_idx" ON "HostDocumentStatus"("status");

-- CreateIndex
CREATE UNIQUE INDEX "HostDocumentStatus_hostId_documentType_key" ON "HostDocumentStatus"("hostId", "documentType");

-- CreateIndex
CREATE UNIQUE INDEX "HostESGProfile_hostId_key" ON "HostESGProfile"("hostId");

-- CreateIndex
CREATE INDEX "HostESGProfile_compositeScore_idx" ON "HostESGProfile"("compositeScore");

-- CreateIndex
CREATE INDEX "HostESGProfile_fraudRiskLevel_idx" ON "HostESGProfile"("fraudRiskLevel");

-- CreateIndex
CREATE INDEX "HostESGProfile_hostId_idx" ON "HostESGProfile"("hostId");

-- CreateIndex
CREATE INDEX "HostESGProfile_safetyScore_idx" ON "HostESGProfile"("safetyScore");

-- CreateIndex
CREATE INDEX "HostInquiry_createdAt_idx" ON "HostInquiry"("createdAt");

-- CreateIndex
CREATE INDEX "HostInquiry_email_idx" ON "HostInquiry"("email");

-- CreateIndex
CREATE INDEX "HostInquiry_status_idx" ON "HostInquiry"("status");

-- CreateIndex
CREATE INDEX "HostNotification_hostId_idx" ON "HostNotification"("hostId");

-- CreateIndex
CREATE INDEX "HostNotification_priority_idx" ON "HostNotification"("priority");

-- CreateIndex
CREATE INDEX "HostNotification_responseDeadline_idx" ON "HostNotification"("responseDeadline");

-- CreateIndex
CREATE INDEX "HostNotification_status_idx" ON "HostNotification"("status");

-- CreateIndex
CREATE INDEX "HostNotification_type_idx" ON "HostNotification"("type");

-- CreateIndex
CREATE INDEX "HostPayout_hostId_idx" ON "HostPayout"("hostId");

-- CreateIndex
CREATE INDEX "HostPayout_status_idx" ON "HostPayout"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Hotel_gdsCode_key" ON "Hotel"("gdsCode");

-- CreateIndex
CREATE INDEX "Hotel_certified_idx" ON "Hotel"("certified");

-- CreateIndex
CREATE INDEX "Hotel_city_state_idx" ON "Hotel"("city", "state");

-- CreateIndex
CREATE INDEX "Hotel_gdsCode_idx" ON "Hotel"("gdsCode");

-- CreateIndex
CREATE INDEX "HotelMetrics_hotelId_idx" ON "HotelMetrics"("hotelId");

-- CreateIndex
CREATE UNIQUE INDEX "HotelMetrics_hotelId_period_startDate_key" ON "HotelMetrics"("hotelId", "period", "startDate");

-- CreateIndex
CREATE INDEX "InspectionPhoto_bookingId_idx" ON "InspectionPhoto"("bookingId");

-- CreateIndex
CREATE INDEX "InspectionPhoto_type_idx" ON "InspectionPhoto"("type");

-- CreateIndex
CREATE INDEX "InsuranceNotification_sentAt_idx" ON "InsuranceNotification"("sentAt");

-- CreateIndex
CREATE INDEX "InsuranceNotification_type_idx" ON "InsuranceNotification"("type");

-- CreateIndex
CREATE UNIQUE INDEX "InsurancePolicy_bookingId_key" ON "InsurancePolicy"("bookingId");

-- CreateIndex
CREATE INDEX "InsurancePolicy_bookingId_idx" ON "InsurancePolicy"("bookingId");

-- CreateIndex
CREATE INDEX "InsurancePolicy_providerId_idx" ON "InsurancePolicy"("providerId");

-- CreateIndex
CREATE INDEX "InsurancePolicy_status_idx" ON "InsurancePolicy"("status");

-- CreateIndex
CREATE INDEX "InsuranceProvider_isActive_idx" ON "InsuranceProvider"("isActive");

-- CreateIndex
CREATE INDEX "InsuranceProvider_isPrimary_idx" ON "InsuranceProvider"("isPrimary");

-- CreateIndex
CREATE INDEX "InsuranceRateHistory_effectiveDate_idx" ON "InsuranceRateHistory"("effectiveDate");

-- CreateIndex
CREATE INDEX "InsuranceRateHistory_providerId_idx" ON "InsuranceRateHistory"("providerId");

-- CreateIndex
CREATE INDEX "InsuranceRateHistory_tier_idx" ON "InsuranceRateHistory"("tier");

-- CreateIndex
CREATE INDEX "InsuranceRateHistory_vehicleClass_idx" ON "InsuranceRateHistory"("vehicleClass");

-- CreateIndex
CREATE INDEX "JobApplication_createdAt_idx" ON "JobApplication"("createdAt");

-- CreateIndex
CREATE INDEX "JobApplication_email_idx" ON "JobApplication"("email");

-- CreateIndex
CREATE INDEX "JobApplication_jobId_idx" ON "JobApplication"("jobId");

-- CreateIndex
CREATE INDEX "JobApplication_status_idx" ON "JobApplication"("status");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_jobId_email_key" ON "JobApplication"("jobId", "email");

-- CreateIndex
CREATE INDEX "JobPosting_department_idx" ON "JobPosting"("department");

-- CreateIndex
CREATE INDEX "JobPosting_isActive_idx" ON "JobPosting"("isActive");

-- CreateIndex
CREATE INDEX "JobPosting_location_idx" ON "JobPosting"("location");

-- CreateIndex
CREATE INDEX "JobPosting_postedDate_idx" ON "JobPosting"("postedDate");

-- CreateIndex
CREATE INDEX "JobPosting_type_idx" ON "JobPosting"("type");

-- CreateIndex
CREATE INDEX "LoginAttempt_identifier_idx" ON "LoginAttempt"("identifier");

-- CreateIndex
CREATE INDEX "LoginAttempt_ipAddress_idx" ON "LoginAttempt"("ipAddress");

-- CreateIndex
CREATE INDEX "LoginAttempt_success_idx" ON "LoginAttempt"("success");

-- CreateIndex
CREATE INDEX "MileageAnomaly_carId_idx" ON "MileageAnomaly"("carId");

-- CreateIndex
CREATE INDEX "MileageAnomaly_detectedAt_idx" ON "MileageAnomaly"("detectedAt");

-- CreateIndex
CREATE INDEX "MileageAnomaly_resolved_idx" ON "MileageAnomaly"("resolved");

-- CreateIndex
CREATE INDEX "MileageAnomaly_severity_idx" ON "MileageAnomaly"("severity");

-- CreateIndex
CREATE INDEX "NotificationDismissal_dismissedAt_idx" ON "NotificationDismissal"("dismissedAt");

-- CreateIndex
CREATE INDEX "NotificationDismissal_userId_idx" ON "NotificationDismissal"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationDismissal_userId_notificationType_key" ON "NotificationDismissal"("userId", "notificationType");

-- CreateIndex
CREATE INDEX "PartnerVerificationRequest_createdAt_idx" ON "PartnerVerificationRequest"("createdAt");

-- CreateIndex
CREATE INDEX "PartnerVerificationRequest_guestId_idx" ON "PartnerVerificationRequest"("guestId");

-- CreateIndex
CREATE INDEX "PartnerVerificationRequest_partnerId_idx" ON "PartnerVerificationRequest"("partnerId");

-- CreateIndex
CREATE INDEX "PartnerVerificationRequest_status_idx" ON "PartnerVerificationRequest"("status");

-- CreateIndex
CREATE INDEX "PartnerVerificationRequest_stripeSessionId_idx" ON "PartnerVerificationRequest"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_stripeMethodId_key" ON "PaymentMethod"("stripeMethodId");

-- CreateIndex
CREATE INDEX "PaymentMethod_hostId_idx" ON "PaymentMethod"("hostId");

-- CreateIndex
CREATE INDEX "PaymentMethod_isDefault_idx" ON "PaymentMethod"("isDefault");

-- CreateIndex
CREATE INDEX "PaymentMethod_stripeMethodId_idx" ON "PaymentMethod"("stripeMethodId");

-- CreateIndex
CREATE INDEX "PaymentMethod_userId_idx" ON "PaymentMethod"("userId");

-- CreateIndex
CREATE INDEX "ProviderDocument_category_idx" ON "ProviderDocument"("category");

-- CreateIndex
CREATE INDEX "ProviderDocument_expiresAt_idx" ON "ProviderDocument"("expiresAt");

-- CreateIndex
CREATE INDEX "ProviderDocument_providerId_idx" ON "ProviderDocument"("providerId");

-- CreateIndex
CREATE INDEX "ProviderDocument_status_idx" ON "ProviderDocument"("status");

-- CreateIndex
CREATE INDEX "ProviderMessage_category_idx" ON "ProviderMessage"("category");

-- CreateIndex
CREATE INDEX "ProviderMessage_providerId_idx" ON "ProviderMessage"("providerId");

-- CreateIndex
CREATE INDEX "ProviderMessage_relatedClaimId_idx" ON "ProviderMessage"("relatedClaimId");

-- CreateIndex
CREATE INDEX "ProviderMessage_status_idx" ON "ProviderMessage"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_identifier_key" ON "RateLimit"("identifier");

-- CreateIndex
CREATE INDEX "RateLimit_exceeded_idx" ON "RateLimit"("exceeded");

-- CreateIndex
CREATE INDEX "RateLimit_identifier_idx" ON "RateLimit"("identifier");

-- CreateIndex
CREATE INDEX "RefundRequest_bookingId_idx" ON "RefundRequest"("bookingId");

-- CreateIndex
CREATE INDEX "RefundRequest_createdAt_idx" ON "RefundRequest"("createdAt");

-- CreateIndex
CREATE INDEX "RefundRequest_requestedBy_idx" ON "RefundRequest"("requestedBy");

-- CreateIndex
CREATE INDEX "RefundRequest_status_idx" ON "RefundRequest"("status");

-- CreateIndex
CREATE INDEX "RentalAvailability_carId_date_isAvailable_idx" ON "RentalAvailability"("carId", "date", "isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "RentalAvailability_carId_date_key" ON "RentalAvailability"("carId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "RentalBooking_bookingCode_key" ON "RentalBooking"("bookingCode");

-- CreateIndex
CREATE UNIQUE INDEX "RentalBooking_agreementToken_key" ON "RentalBooking"("agreementToken");

-- CreateIndex
CREATE INDEX "RentalBooking_adminCompletedById_idx" ON "RentalBooking"("adminCompletedById");

-- CreateIndex
CREATE INDEX "RentalBooking_agreementStatus_idx" ON "RentalBooking"("agreementStatus");

-- CreateIndex
CREATE INDEX "RentalBooking_agreementToken_idx" ON "RentalBooking"("agreementToken");

-- CreateIndex
CREATE INDEX "RentalBooking_bookingIpAddress_idx" ON "RentalBooking"("bookingIpAddress");

-- CreateIndex
CREATE INDEX "RentalBooking_carId_idx" ON "RentalBooking"("carId");

-- CreateIndex
CREATE INDEX "RentalBooking_deviceFingerprint_idx" ON "RentalBooking"("deviceFingerprint");

-- CreateIndex
CREATE INDEX "RentalBooking_fraudulent_idx" ON "RentalBooking"("fraudulent");

-- CreateIndex
CREATE INDEX "RentalBooking_guestEmail_idx" ON "RentalBooking"("guestEmail");

-- CreateIndex
CREATE INDEX "RentalBooking_hostId_idx" ON "RentalBooking"("hostId");

-- CreateIndex
CREATE INDEX "RentalBooking_paymentStatus_idx" ON "RentalBooking"("paymentStatus");

-- CreateIndex
CREATE INDEX "RentalBooking_renterId_idx" ON "RentalBooking"("renterId");

-- CreateIndex
CREATE INDEX "RentalBooking_reviewerProfileId_idx" ON "RentalBooking"("reviewerProfileId");

-- CreateIndex
CREATE INDEX "RentalBooking_riskScore_idx" ON "RentalBooking"("riskScore");

-- CreateIndex
CREATE INDEX "RentalBooking_startDate_endDate_idx" ON "RentalBooking"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "RentalBooking_status_idx" ON "RentalBooking"("status");

-- CreateIndex
CREATE INDEX "RentalBooking_stripeCustomerId_idx" ON "RentalBooking"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "RentalBooking_tripCompletedBy_idx" ON "RentalBooking"("tripCompletedBy");

-- CreateIndex
CREATE INDEX "RentalBooking_tripEndRequestStatus_idx" ON "RentalBooking"("tripEndRequestStatus");

-- CreateIndex
CREATE INDEX "RentalBooking_tripStatus_idx" ON "RentalBooking"("tripStatus");

-- CreateIndex
CREATE INDEX "RentalBooking_verificationStatus_idx" ON "RentalBooking"("verificationStatus");

-- CreateIndex
CREATE INDEX "RentalCar_activeClaimId_idx" ON "RentalCar"("activeClaimId");

-- CreateIndex
CREATE INDEX "RentalCar_carType_idx" ON "RentalCar"("carType");

-- CreateIndex
CREATE INDEX "RentalCar_city_state_idx" ON "RentalCar"("city", "state");

-- CreateIndex
CREATE INDEX "RentalCar_classificationId_idx" ON "RentalCar"("classificationId");

-- CreateIndex
CREATE INDEX "RentalCar_hasActiveClaim_idx" ON "RentalCar"("hasActiveClaim");

-- CreateIndex
CREATE INDEX "RentalCar_hasAlarm_idx" ON "RentalCar"("hasAlarm");

-- CreateIndex
CREATE INDEX "RentalCar_hasLien_idx" ON "RentalCar"("hasLien");

-- CreateIndex
CREATE INDEX "RentalCar_hasTracking_idx" ON "RentalCar"("hasTracking");

-- CreateIndex
CREATE INDEX "RentalCar_hostId_idx" ON "RentalCar"("hostId");

-- CreateIndex
CREATE INDEX "RentalCar_insuranceEligible_idx" ON "RentalCar"("insuranceEligible");

-- CreateIndex
CREATE INDEX "RentalCar_insuranceVerifiedBy_idx" ON "RentalCar"("insuranceVerifiedBy");

-- CreateIndex
CREATE INDEX "RentalCar_isActive_instantBook_idx" ON "RentalCar"("isActive", "instantBook");

-- CreateIndex
CREATE INDEX "RentalCar_isModified_idx" ON "RentalCar"("isModified");

-- CreateIndex
CREATE INDEX "RentalCar_lastClaimDate_idx" ON "RentalCar"("lastClaimDate");

-- CreateIndex
CREATE INDEX "RentalCar_make_model_year_idx" ON "RentalCar"("make", "model", "year");

-- CreateIndex
CREATE INDEX "RentalCar_registeredOwner_idx" ON "RentalCar"("registeredOwner");

-- CreateIndex
CREATE INDEX "RentalCar_registrationVerifiedBy_idx" ON "RentalCar"("registrationVerifiedBy");

-- CreateIndex
CREATE INDEX "RentalCar_titleStatus_idx" ON "RentalCar"("titleStatus");

-- CreateIndex
CREATE INDEX "RentalCar_totalClaimsCount_idx" ON "RentalCar"("totalClaimsCount");

-- CreateIndex
CREATE INDEX "RentalCar_vinVerifiedBy_idx" ON "RentalCar"("vinVerifiedBy");

-- CreateIndex
CREATE INDEX "RentalCar_vin_idx" ON "RentalCar"("vin");

-- CreateIndex
CREATE INDEX "RentalCarPhoto_carId_idx" ON "RentalCarPhoto"("carId");

-- CreateIndex
CREATE INDEX "RentalCarPhoto_deletedAt_idx" ON "RentalCarPhoto"("deletedAt");

-- CreateIndex
CREATE INDEX "RentalCarPhoto_photoContext_idx" ON "RentalCarPhoto"("photoContext");

-- CreateIndex
CREATE INDEX "RentalCarPhoto_photoHash_idx" ON "RentalCarPhoto"("photoHash");

-- CreateIndex
CREATE INDEX "RentalCarPhoto_relatedClaimId_idx" ON "RentalCarPhoto"("relatedClaimId");

-- CreateIndex
CREATE INDEX "RentalCarPhoto_uploadedBy_idx" ON "RentalCarPhoto"("uploadedBy");

-- CreateIndex
CREATE INDEX "RentalCarPhoto_verified_idx" ON "RentalCarPhoto"("verified");

-- CreateIndex
CREATE INDEX "RentalDispute_bookingId_idx" ON "RentalDispute"("bookingId");

-- CreateIndex
CREATE INDEX "RentalDispute_status_idx" ON "RentalDispute"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RentalHost_userId_key" ON "RentalHost"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RentalHost_email_key" ON "RentalHost"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RentalHost_stripeConnectAccountId_key" ON "RentalHost"("stripeConnectAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "RentalHost_stripeCustomerId_key" ON "RentalHost"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "RentalHost_partnerSlug_key" ON "RentalHost"("partnerSlug");

-- CreateIndex
CREATE UNIQUE INDEX "RentalHost_hostManagerSlug_key" ON "RentalHost"("hostManagerSlug");

-- CreateIndex
CREATE UNIQUE INDEX "RentalHost_referralCode_key" ON "RentalHost"("referralCode");

-- CreateIndex
CREATE INDEX "RentalHost_approvalStatus_idx" ON "RentalHost"("approvalStatus");

-- CreateIndex
CREATE INDEX "RentalHost_city_state_idx" ON "RentalHost"("city", "state");

-- CreateIndex
CREATE INDEX "RentalHost_commercialInsuranceStatus_idx" ON "RentalHost"("commercialInsuranceStatus");

-- CreateIndex
CREATE INDEX "RentalHost_earningsTier_idx" ON "RentalHost"("earningsTier");

-- CreateIndex
CREATE INDEX "RentalHost_email_idx" ON "RentalHost"("email");

-- CreateIndex
CREATE INDEX "RentalHost_hostInsuranceStatus_idx" ON "RentalHost"("hostInsuranceStatus");

-- CreateIndex
CREATE INDEX "RentalHost_hostManagerSlug_idx" ON "RentalHost"("hostManagerSlug");

-- CreateIndex
CREATE INDEX "RentalHost_hostType_idx" ON "RentalHost"("hostType");

-- CreateIndex
CREATE INDEX "RentalHost_insuranceProviderId_idx" ON "RentalHost"("insuranceProviderId");

-- CreateIndex
CREATE INDEX "RentalHost_isHostManager_idx" ON "RentalHost"("isHostManager");

-- CreateIndex
CREATE INDEX "RentalHost_isVehicleOwner_idx" ON "RentalHost"("isVehicleOwner");

-- CreateIndex
CREATE INDEX "RentalHost_legacyDualId_idx" ON "RentalHost"("legacyDualId");

-- CreateIndex
CREATE INDEX "RentalHost_p2pInsuranceStatus_idx" ON "RentalHost"("p2pInsuranceStatus");

-- CreateIndex
CREATE INDEX "RentalHost_partnerSlug_idx" ON "RentalHost"("partnerSlug");

-- CreateIndex
CREATE INDEX "RentalHost_payoutsEnabled_idx" ON "RentalHost"("payoutsEnabled");

-- CreateIndex
CREATE INDEX "RentalHost_stripeAccountId_idx" ON "RentalHost"("stripeAccountId");

-- CreateIndex
CREATE INDEX "RentalHost_stripeConnectAccountId_idx" ON "RentalHost"("stripeConnectAccountId");

-- CreateIndex
CREATE INDEX "RentalHost_stripeCustomerId_idx" ON "RentalHost"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "RentalHost_usingLegacyInsurance_idx" ON "RentalHost"("usingLegacyInsurance");

-- CreateIndex
CREATE INDEX "RentalMessage_bookingId_idx" ON "RentalMessage"("bookingId");

-- CreateIndex
CREATE INDEX "RentalMessage_category_idx" ON "RentalMessage"("category");

-- CreateIndex
CREATE INDEX "RentalMessage_createdAt_idx" ON "RentalMessage"("createdAt");

-- CreateIndex
CREATE INDEX "RentalMessage_isRead_readByAdmin_idx" ON "RentalMessage"("isRead", "readByAdmin");

-- CreateIndex
CREATE INDEX "RentalMessage_senderType_idx" ON "RentalMessage"("senderType");

-- CreateIndex
CREATE INDEX "RentalPayout_eligibleAt_status_idx" ON "RentalPayout"("eligibleAt", "status");

-- CreateIndex
CREATE INDEX "RentalPayout_hostId_idx" ON "RentalPayout"("hostId");

-- CreateIndex
CREATE INDEX "RentalPayout_hostId_status_processedAt_idx" ON "RentalPayout"("hostId", "status", "processedAt");

-- CreateIndex
CREATE INDEX "RentalPayout_status_idx" ON "RentalPayout"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RentalReview_bookingId_key" ON "RentalReview"("bookingId");

-- CreateIndex
CREATE INDEX "RentalReview_carId_idx" ON "RentalReview"("carId");

-- CreateIndex
CREATE INDEX "RentalReview_hostId_idx" ON "RentalReview"("hostId");

-- CreateIndex
CREATE INDEX "RentalReview_isPinned_idx" ON "RentalReview"("isPinned");

-- CreateIndex
CREATE INDEX "RentalReview_isVisible_idx" ON "RentalReview"("isVisible");

-- CreateIndex
CREATE INDEX "RentalReview_source_idx" ON "RentalReview"("source");

-- CreateIndex
CREATE INDEX "RentalReview_tripStartDate_idx" ON "RentalReview"("tripStartDate");

-- CreateIndex
CREATE INDEX "Revenue_hotelId_idx" ON "Revenue"("hotelId");

-- CreateIndex
CREATE INDEX "Revenue_status_idx" ON "Revenue"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Revenue_hotelId_period_startDate_key" ON "Revenue"("hotelId", "period", "startDate");

-- CreateIndex
CREATE INDEX "ReviewTemplate_carType_idx" ON "ReviewTemplate"("carType");

-- CreateIndex
CREATE INDEX "ReviewTemplate_isActive_idx" ON "ReviewTemplate"("isActive");

-- CreateIndex
CREATE INDEX "ReviewTemplate_scenario_idx" ON "ReviewTemplate"("scenario");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewerProfile_email_key" ON "ReviewerProfile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewerProfile_userId_key" ON "ReviewerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewerProfile_resetToken_key" ON "ReviewerProfile"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewerProfile_referralCode_key" ON "ReviewerProfile"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewerProfile_stripeCustomerId_key" ON "ReviewerProfile"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "ReviewerProfile_accountHoldClaimId_idx" ON "ReviewerProfile"("accountHoldClaimId");

-- CreateIndex
CREATE INDEX "ReviewerProfile_accountOnHold_idx" ON "ReviewerProfile"("accountOnHold");

-- CreateIndex
CREATE INDEX "ReviewerProfile_activeWarningCount_idx" ON "ReviewerProfile"("activeWarningCount");

-- CreateIndex
CREATE INDEX "ReviewerProfile_bannedAt_idx" ON "ReviewerProfile"("bannedAt");

-- CreateIndex
CREATE INDEX "ReviewerProfile_canBookLuxury_idx" ON "ReviewerProfile"("canBookLuxury");

-- CreateIndex
CREATE INDEX "ReviewerProfile_canBookPremium_idx" ON "ReviewerProfile"("canBookPremium");

-- CreateIndex
CREATE INDEX "ReviewerProfile_canInstantBook_idx" ON "ReviewerProfile"("canInstantBook");

-- CreateIndex
CREATE INDEX "ReviewerProfile_city_state_idx" ON "ReviewerProfile"("city", "state");

-- CreateIndex
CREATE INDEX "ReviewerProfile_documentsVerified_idx" ON "ReviewerProfile"("documentsVerified");

-- CreateIndex
CREATE INDEX "ReviewerProfile_driverLicenseExpiry_idx" ON "ReviewerProfile"("driverLicenseExpiry");

-- CreateIndex
CREATE INDEX "ReviewerProfile_driverLicenseNumber_idx" ON "ReviewerProfile"("driverLicenseNumber");

-- CreateIndex
CREATE INDEX "ReviewerProfile_email_idx" ON "ReviewerProfile"("email");

-- CreateIndex
CREATE INDEX "ReviewerProfile_expiryDate_idx" ON "ReviewerProfile"("expiryDate");

-- CreateIndex
CREATE INDEX "ReviewerProfile_fullyVerified_idx" ON "ReviewerProfile"("fullyVerified");

-- CreateIndex
CREATE INDEX "ReviewerProfile_insuranceVerified_idx" ON "ReviewerProfile"("insuranceVerified");

-- CreateIndex
CREATE INDEX "ReviewerProfile_legacyDualId_idx" ON "ReviewerProfile"("legacyDualId");

-- CreateIndex
CREATE INDEX "ReviewerProfile_memberTier_idx" ON "ReviewerProfile"("memberTier");

-- CreateIndex
CREATE INDEX "ReviewerProfile_requiresManualApproval_idx" ON "ReviewerProfile"("requiresManualApproval");

-- CreateIndex
CREATE INDEX "ReviewerProfile_resetToken_idx" ON "ReviewerProfile"("resetToken");

-- CreateIndex
CREATE INDEX "ReviewerProfile_stripeCustomerId_idx" ON "ReviewerProfile"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "ReviewerProfile_suspendedAt_idx" ON "ReviewerProfile"("suspendedAt");

-- CreateIndex
CREATE INDEX "ReviewerProfile_suspensionExpiresAt_idx" ON "ReviewerProfile"("suspensionExpiresAt");

-- CreateIndex
CREATE INDEX "ReviewerProfile_suspensionLevel_idx" ON "ReviewerProfile"("suspensionLevel");

-- CreateIndex
CREATE INDEX "ReviewerProfile_userId_idx" ON "ReviewerProfile"("userId");

-- CreateIndex
CREATE INDEX "ReviewerProfile_userId_suspensionLevel_idx" ON "ReviewerProfile"("userId", "suspensionLevel");

-- CreateIndex
CREATE INDEX "ReviewerProfile_warningCount_idx" ON "ReviewerProfile"("warningCount");

-- CreateIndex
CREATE INDEX "Ride_hotelId_idx" ON "Ride"("hotelId");

-- CreateIndex
CREATE INDEX "Ride_isGhost_idx" ON "Ride"("isGhost");

-- CreateIndex
CREATE INDEX "Ride_status_idx" ON "Ride"("status");

-- CreateIndex
CREATE INDEX "SecurityEvent_severity_idx" ON "SecurityEvent"("severity");

-- CreateIndex
CREATE INDEX "SecurityEvent_sourceIp_idx" ON "SecurityEvent"("sourceIp");

-- CreateIndex
CREATE INDEX "SecurityEvent_timestamp_idx" ON "SecurityEvent"("timestamp");

-- CreateIndex
CREATE INDEX "SecurityEvent_type_idx" ON "SecurityEvent"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshToken_key" ON "Session"("refreshToken");

-- CreateIndex
CREATE INDEX "Session_refreshToken_idx" ON "Session"("refreshToken");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Threat_severity_idx" ON "Threat"("severity");

-- CreateIndex
CREATE INDEX "Threat_sourceIp_idx" ON "Threat"("sourceIp");

-- CreateIndex
CREATE INDEX "Threat_status_idx" ON "Threat"("status");

-- CreateIndex
CREATE INDEX "Threat_type_idx" ON "Threat"("type");

-- CreateIndex
CREATE INDEX "Transaction_hotelId_idx" ON "Transaction"("hotelId");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "TripCharge_bookingId_idx" ON "TripCharge"("bookingId");

-- CreateIndex
CREATE INDEX "TripCharge_chargeStatus_idx" ON "TripCharge"("chargeStatus");

-- CreateIndex
CREATE INDEX "TripCharge_holdUntil_idx" ON "TripCharge"("holdUntil");

-- CreateIndex
CREATE INDEX "TripCharge_requiresApproval_idx" ON "TripCharge"("requiresApproval");

-- CreateIndex
CREATE INDEX "TripInspectionPhoto_bookingId_idx" ON "TripInspectionPhoto"("bookingId");

-- CreateIndex
CREATE INDEX "TripInspectionPhoto_photoType_idx" ON "TripInspectionPhoto"("photoType");

-- CreateIndex
CREATE INDEX "TripInspectionPhoto_uploadedAt_idx" ON "TripInspectionPhoto"("uploadedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TripIssue_bookingId_key" ON "TripIssue"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "TripIssue_claimId_key" ON "TripIssue"("claimId");

-- CreateIndex
CREATE INDEX "TripIssue_escalationDeadline_idx" ON "TripIssue"("escalationDeadline");

-- CreateIndex
CREATE INDEX "TripIssue_issueType_idx" ON "TripIssue"("issueType");

-- CreateIndex
CREATE INDEX "TripIssue_status_idx" ON "TripIssue"("status");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_hotelId_idx" ON "User"("hotelId");

-- CreateIndex
CREATE INDEX "User_legacyDualId_idx" ON "User"("legacyDualId");

-- CreateIndex
CREATE INDEX "User_resetToken_idx" ON "User"("resetToken");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UserNotificationSettings_userId_key" ON "UserNotificationSettings"("userId");

-- CreateIndex
CREATE INDEX "UserNotificationSettings_userId_idx" ON "UserNotificationSettings"("userId");

-- CreateIndex
CREATE INDEX "VehicleClassification_baseValue_idx" ON "VehicleClassification"("baseValue");

-- CreateIndex
CREATE INDEX "VehicleClassification_category_idx" ON "VehicleClassification"("category");

-- CreateIndex
CREATE INDEX "VehicleClassification_isInsurable_idx" ON "VehicleClassification"("isInsurable");

-- CreateIndex
CREATE INDEX "VehicleClassification_make_model_idx" ON "VehicleClassification"("make", "model");

-- CreateIndex
CREATE INDEX "VehicleClassification_providerId_idx" ON "VehicleClassification"("providerId");

-- CreateIndex
CREATE INDEX "VehicleClassification_riskLevel_idx" ON "VehicleClassification"("riskLevel");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleClassification_make_model_year_providerId_key" ON "VehicleClassification"("make", "model", "year", "providerId");

-- CreateIndex
CREATE INDEX "VehicleCoverageOverride_carId_idx" ON "VehicleCoverageOverride"("carId");

-- CreateIndex
CREATE INDEX "VehicleCoverageOverride_expiresAt_idx" ON "VehicleCoverageOverride"("expiresAt");

-- CreateIndex
CREATE INDEX "VehicleCoverageOverride_providerId_idx" ON "VehicleCoverageOverride"("providerId");

-- CreateIndex
CREATE INDEX "VehicleCoverageOverride_vin_idx" ON "VehicleCoverageOverride"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleCoverageOverride_carId_providerId_key" ON "VehicleCoverageOverride"("carId", "providerId");

-- CreateIndex
CREATE INDEX "VehicleInsuranceOverride_carId_idx" ON "VehicleInsuranceOverride"("carId");

-- CreateIndex
CREATE INDEX "VehicleInsuranceOverride_providerId_idx" ON "VehicleInsuranceOverride"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleInsuranceOverride_carId_providerId_key" ON "VehicleInsuranceOverride"("carId", "providerId");

-- CreateIndex
CREATE INDEX "VehicleServiceRecord_addedByType_idx" ON "VehicleServiceRecord"("addedByType");

-- CreateIndex
CREATE INDEX "VehicleServiceRecord_addedBy_idx" ON "VehicleServiceRecord"("addedBy");

-- CreateIndex
CREATE INDEX "VehicleServiceRecord_carId_serviceDate_idx" ON "VehicleServiceRecord"("carId", "serviceDate");

-- CreateIndex
CREATE INDEX "VehicleServiceRecord_carId_serviceType_idx" ON "VehicleServiceRecord"("carId", "serviceType");

-- CreateIndex
CREATE INDEX "admin_impersonation_logs_adminId_idx" ON "admin_impersonation_logs"("adminId");

-- CreateIndex
CREATE INDEX "admin_impersonation_logs_createdAt_idx" ON "admin_impersonation_logs"("createdAt");

-- CreateIndex
CREATE INDEX "admin_impersonation_logs_partnerId_idx" ON "admin_impersonation_logs"("partnerId");

-- CreateIndex
CREATE INDEX "host_charges_chargeType_idx" ON "host_charges"("chargeType");

-- CreateIndex
CREATE INDEX "host_charges_createdAt_idx" ON "host_charges"("createdAt");

-- CreateIndex
CREATE INDEX "host_charges_hostId_idx" ON "host_charges"("hostId");

-- CreateIndex
CREATE INDEX "host_charges_status_idx" ON "host_charges"("status");

-- CreateIndex
CREATE INDEX "insurance_history_expiryDate_idx" ON "insurance_history"("expiryDate");

-- CreateIndex
CREATE INDEX "insurance_history_reviewerProfileId_idx" ON "insurance_history"("reviewerProfileId");

-- CreateIndex
CREATE INDEX "insurance_history_reviewerProfileId_status_idx" ON "insurance_history"("reviewerProfileId", "status");

-- CreateIndex
CREATE INDEX "insurance_history_verificationStatus_idx" ON "insurance_history"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "management_invitations_token_key" ON "management_invitations"("token");

-- CreateIndex
CREATE INDEX "management_invitations_recipientEmail_idx" ON "management_invitations"("recipientEmail");

-- CreateIndex
CREATE INDEX "management_invitations_recipientId_idx" ON "management_invitations"("recipientId");

-- CreateIndex
CREATE INDEX "management_invitations_senderId_idx" ON "management_invitations"("senderId");

-- CreateIndex
CREATE INDEX "management_invitations_status_idx" ON "management_invitations"("status");

-- CreateIndex
CREATE INDEX "management_invitations_token_idx" ON "management_invitations"("token");

-- CreateIndex
CREATE UNIQUE INDEX "partner_applications_hostId_key" ON "partner_applications"("hostId");

-- CreateIndex
CREATE INDEX "partner_applications_status_idx" ON "partner_applications"("status");

-- CreateIndex
CREATE INDEX "partner_applications_submittedAt_idx" ON "partner_applications"("submittedAt");

-- CreateIndex
CREATE INDEX "partner_commission_history_createdAt_idx" ON "partner_commission_history"("createdAt");

-- CreateIndex
CREATE INDEX "partner_commission_history_hostId_idx" ON "partner_commission_history"("hostId");

-- CreateIndex
CREATE UNIQUE INDEX "partner_discounts_code_key" ON "partner_discounts"("code");

-- CreateIndex
CREATE INDEX "partner_discounts_code_idx" ON "partner_discounts"("code");

-- CreateIndex
CREATE INDEX "partner_discounts_hostId_idx" ON "partner_discounts"("hostId");

-- CreateIndex
CREATE INDEX "partner_discounts_isActive_idx" ON "partner_discounts"("isActive");

-- CreateIndex
CREATE INDEX "partner_documents_expiresAt_idx" ON "partner_documents"("expiresAt");

-- CreateIndex
CREATE INDEX "partner_documents_gracePeriodEndsAt_idx" ON "partner_documents"("gracePeriodEndsAt");

-- CreateIndex
CREATE INDEX "partner_documents_hostId_type_idx" ON "partner_documents"("hostId", "type");

-- CreateIndex
CREATE INDEX "partner_documents_isExpired_idx" ON "partner_documents"("isExpired");

-- CreateIndex
CREATE INDEX "partner_faqs_hostId_idx" ON "partner_faqs"("hostId");

-- CreateIndex
CREATE INDEX "partner_payouts_hostId_idx" ON "partner_payouts"("hostId");

-- CreateIndex
CREATE INDEX "partner_payouts_period_idx" ON "partner_payouts"("period");

-- CreateIndex
CREATE INDEX "partner_payouts_status_idx" ON "partner_payouts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_management_vehicleId_key" ON "vehicle_management"("vehicleId");

-- CreateIndex
CREATE INDEX "vehicle_management_managerId_idx" ON "vehicle_management"("managerId");

-- CreateIndex
CREATE INDEX "vehicle_management_ownerId_idx" ON "vehicle_management"("ownerId");

-- CreateIndex
CREATE INDEX "vehicle_management_status_idx" ON "vehicle_management"("status");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountHold" ADD CONSTRAINT "AccountHold_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "ReviewerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppealNotification" ADD CONSTRAINT "AppealNotification_appealId_fkey" FOREIGN KEY ("appealId") REFERENCES "GuestAppeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppealNotification" ADD CONSTRAINT "AppealNotification_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "ReviewerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BackgroundCheck" ADD CONSTRAINT "BackgroundCheck_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingSession" ADD CONSTRAINT "BookingSession_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChargeAdjustment" ADD CONSTRAINT "ChargeAdjustment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChargeAdjustment" ADD CONSTRAINT "ChargeAdjustment_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "TripCharge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "InsurancePolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimDamagePhoto" ADD CONSTRAINT "ClaimDamagePhoto_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimEdit" ADD CONSTRAINT "ClaimEdit_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimMessage" ADD CONSTRAINT "ClaimMessage_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditBonusTransaction" ADD CONSTRAINT "CreditBonusTransaction_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "ReviewerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataExportLog" ADD CONSTRAINT "DataExportLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositTransaction" ADD CONSTRAINT "DepositTransaction_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "ReviewerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ESGSnapshot" ADD CONSTRAINT "ESGSnapshot_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "HostESGProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FraudIndicator" ADD CONSTRAINT "FraudIndicator_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestAccessToken" ADD CONSTRAINT "GuestAccessToken_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestAppeal" ADD CONSTRAINT "GuestAppeal_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "ReviewerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestAppeal" ADD CONSTRAINT "GuestAppeal_moderationId_fkey" FOREIGN KEY ("moderationId") REFERENCES "GuestModeration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestInsurance" ADD CONSTRAINT "GuestInsurance_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "ReviewerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestModeration" ADD CONSTRAINT "GuestModeration_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "ReviewerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestProfileStatus" ADD CONSTRAINT "GuestProfileStatus_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "ReviewerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostDocumentStatus" ADD CONSTRAINT "HostDocumentStatus_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostESGProfile" ADD CONSTRAINT "HostESGProfile_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostNotification" ADD CONSTRAINT "HostNotification_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostPayout" ADD CONSTRAINT "HostPayout_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostPayout" ADD CONSTRAINT "HostPayout_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelMetrics" ADD CONSTRAINT "HotelMetrics_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionPhoto" ADD CONSTRAINT "InspectionPhoto_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsurancePolicy" ADD CONSTRAINT "InsurancePolicy_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsurancePolicy" ADD CONSTRAINT "InsurancePolicy_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "InsuranceProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceRateHistory" ADD CONSTRAINT "InsuranceRateHistory_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "InsuranceProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginAttempt" ADD CONSTRAINT "LoginAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MileageAnomaly" ADD CONSTRAINT "MileageAnomaly_carId_fkey" FOREIGN KEY ("carId") REFERENCES "RentalCar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationDismissal" ADD CONSTRAINT "NotificationDismissal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderDocument" ADD CONSTRAINT "ProviderDocument_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "InsuranceProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderMessage" ADD CONSTRAINT "ProviderMessage_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "InsuranceProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalAvailability" ADD CONSTRAINT "RentalAvailability_carId_fkey" FOREIGN KEY ("carId") REFERENCES "RentalCar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalBooking" ADD CONSTRAINT "RentalBooking_carId_fkey" FOREIGN KEY ("carId") REFERENCES "RentalCar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalBooking" ADD CONSTRAINT "RentalBooking_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalBooking" ADD CONSTRAINT "RentalBooking_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalBooking" ADD CONSTRAINT "RentalBooking_reviewerProfileId_fkey" FOREIGN KEY ("reviewerProfileId") REFERENCES "ReviewerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalCar" ADD CONSTRAINT "RentalCar_classificationId_fkey" FOREIGN KEY ("classificationId") REFERENCES "VehicleClassification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalCar" ADD CONSTRAINT "RentalCar_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalCarPhoto" ADD CONSTRAINT "RentalCarPhoto_carId_fkey" FOREIGN KEY ("carId") REFERENCES "RentalCar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalDispute" ADD CONSTRAINT "RentalDispute_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalHost" ADD CONSTRAINT "RentalHost_insuranceProviderId_fkey" FOREIGN KEY ("insuranceProviderId") REFERENCES "InsuranceProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalHost" ADD CONSTRAINT "RentalHost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalMessage" ADD CONSTRAINT "RentalMessage_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalPayout" ADD CONSTRAINT "RentalPayout_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalPayout" ADD CONSTRAINT "RentalPayout_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalReview" ADD CONSTRAINT "RentalReview_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalReview" ADD CONSTRAINT "RentalReview_carId_fkey" FOREIGN KEY ("carId") REFERENCES "RentalCar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalReview" ADD CONSTRAINT "RentalReview_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalReview" ADD CONSTRAINT "RentalReview_reviewerProfileId_fkey" FOREIGN KEY ("reviewerProfileId") REFERENCES "ReviewerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewerProfile" ADD CONSTRAINT "ReviewerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripCharge" ADD CONSTRAINT "TripCharge_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripInspectionPhoto" ADD CONSTRAINT "TripInspectionPhoto_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripIssue" ADD CONSTRAINT "TripIssue_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripIssue" ADD CONSTRAINT "TripIssue_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotificationSettings" ADD CONSTRAINT "UserNotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleClassification" ADD CONSTRAINT "VehicleClassification_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "InsuranceProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleCoverageOverride" ADD CONSTRAINT "VehicleCoverageOverride_carId_fkey" FOREIGN KEY ("carId") REFERENCES "RentalCar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleCoverageOverride" ADD CONSTRAINT "VehicleCoverageOverride_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "InsuranceProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleInsuranceOverride" ADD CONSTRAINT "VehicleInsuranceOverride_carId_fkey" FOREIGN KEY ("carId") REFERENCES "RentalCar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleInsuranceOverride" ADD CONSTRAINT "VehicleInsuranceOverride_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "InsuranceProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleServiceRecord" ADD CONSTRAINT "VehicleServiceRecord_carId_fkey" FOREIGN KEY ("carId") REFERENCES "RentalCar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_charges" ADD CONSTRAINT "host_charges_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_history" ADD CONSTRAINT "insurance_history_reviewerProfileId_fkey" FOREIGN KEY ("reviewerProfileId") REFERENCES "ReviewerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_invitations" ADD CONSTRAINT "management_invitations_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "RentalHost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_invitations" ADD CONSTRAINT "management_invitations_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_applications" ADD CONSTRAINT "partner_applications_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_commission_history" ADD CONSTRAINT "partner_commission_history_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_discounts" ADD CONSTRAINT "partner_discounts_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_documents" ADD CONSTRAINT "partner_documents_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_faqs" ADD CONSTRAINT "partner_faqs_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_payouts" ADD CONSTRAINT "partner_payouts_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_management" ADD CONSTRAINT "vehicle_management_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_management" ADD CONSTRAINT "vehicle_management_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_management" ADD CONSTRAINT "vehicle_management_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "RentalCar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

