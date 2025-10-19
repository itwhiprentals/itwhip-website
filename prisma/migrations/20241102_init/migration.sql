-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ANONYMOUS', 'CLAIMED', 'STARTER', 'BUSINESS', 'ENTERPRISE', 'ADMIN');

-- CreateEnum
CREATE TYPE "CertificationTier" AS ENUM ('NONE', 'TU_3_C', 'TU_2_B', 'TU_1_A');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('HOTEL', 'RESORT', 'MOTEL', 'BNB', 'BOUTIQUE', 'CHAIN', 'INDEPENDENT');

-- CreateEnum
CREATE TYPE "HotelSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('DIRECT', 'EXPEDIA', 'BOOKING_COM', 'AIRBNB', 'AMADEUS', 'SABRE', 'WEBSITE', 'PHONE', 'WALK_IN');

-- CreateEnum
CREATE TYPE "RideStatus" AS ENUM ('REQUESTED', 'SEARCHING', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'GHOST');

-- CreateEnum
CREATE TYPE "RentalBookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'DISPUTE_REVIEW');

-- CreateEnum
CREATE TYPE "BackgroundCheckStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'PASSED', 'FAILED', 'EXPIRED', 'ERROR');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'RESPONDED', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('NOT_UPLOADED', 'UPLOADED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED', 'RESUBMISSION_REQUIRED');

-- CreateEnum
CREATE TYPE "DocumentReviewStatus" AS ENUM ('PENDING', 'REVIEWING', 'APPROVED', 'REJECTED', 'NEEDS_CLARIFICATION');

-- CreateEnum
CREATE TYPE "RevenueStatus" AS ENUM ('PENDING', 'AVAILABLE', 'PROCESSING', 'WITHDRAWN', 'HELD');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('RIDE_COMMISSION', 'BOOKING', 'WITHDRAWAL', 'FEE', 'REFUND');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ThreatSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ThreatStatus" AS ENUM ('DETECTED', 'INVESTIGATING', 'MITIGATED', 'BLOCKED', 'RESOLVED', 'FALSE_POSITIVE');

-- CreateEnum
CREATE TYPE "AuditCategory" AS ENUM ('AUTHENTICATION', 'AUTHORIZATION', 'DATA_ACCESS', 'DATA_MODIFICATION', 'CONFIGURATION', 'SECURITY', 'COMPLIANCE', 'FINANCIAL', 'CHARGE_MANAGEMENT', 'HOST_MANAGEMENT');

-- CreateEnum
CREATE TYPE "AuditSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AttackType" AS ENUM ('BRUTE_FORCE', 'DICTIONARY', 'SQL_INJECTION', 'XSS', 'CSRF', 'DDOS', 'MAN_IN_MIDDLE', 'SESSION_HIJACK', 'CREDENTIAL_STUFFING', 'BOT');

-- CreateEnum
CREATE TYPE "MetricPeriod" AS ENUM ('DAY', 'WEEK', 'MONTH', 'YEAR');

-- CreateEnum
CREATE TYPE "RevenuePeriod" AS ENUM ('DAY', 'WEEK', 'MONTH', 'TOTAL');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('UNREAD', 'READ', 'REPLIED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "DisputeType" AS ENUM ('DAMAGE', 'REFUND', 'SERVICE', 'MILEAGE', 'FUEL', 'LATE_RETURN', 'CLEANING', 'OTHER');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'INVESTIGATING', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CancelledBy" AS ENUM ('GUEST', 'ADMIN', 'HOST', 'SYSTEM');

-- CreateEnum
CREATE TYPE "FraudSeverity" AS ENUM ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PENDING_CHARGES', 'DISPUTE_REVIEW', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ReviewSource" AS ENUM ('GUEST', 'SEED', 'MANAGED', 'ADMIN');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'CAPTURED', 'PAID', 'FAILED', 'REFUNDED', 'PENDING_CHARGES', 'CHARGES_PAID', 'CHARGES_WAIVED', 'PARTIAL_REFUND', 'PARTIAL_PAID', 'ADJUSTED_PAID');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('NOT_STARTED', 'ACTIVE', 'COMPLETED', 'ENDED_PENDING_REVIEW');

-- CreateEnum
CREATE TYPE "ChargeStatus" AS ENUM ('PENDING', 'PROCESSING', 'CHARGED', 'FAILED', 'WAIVED', 'DISPUTED', 'ADJUSTED', 'REFUNDED', 'PARTIALLY_WAIVED', 'PARTIAL_CHARGED', 'ADJUSTED_CHARGED', 'FULLY_WAIVED', 'ADJUSTED_PENDING', 'ADJUSTMENT_FAILED', 'UNDER_REVIEW', 'EXPIRED');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('NEW', 'REVIEWING', 'PHONE_SCREEN', 'TECHNICAL_TEST', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'REFERENCE_CHECK', 'OFFER_EXTENDED', 'OFFER_ACCEPTED', 'REJECTED', 'WITHDRAWN', 'HIRED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'ANONYMOUS',
    "passwordHash" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "jobTitle" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "hotelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastActive" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
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
    "hostType" TEXT NOT NULL DEFAULT 'PENDING',
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "dashboardAccess" BOOLEAN NOT NULL DEFAULT false,
    "canViewBookings" BOOLEAN NOT NULL DEFAULT false,
    "canEditCalendar" BOOLEAN NOT NULL DEFAULT false,
    "canSetPricing" BOOLEAN NOT NULL DEFAULT false,
    "canMessageGuests" BOOLEAN NOT NULL DEFAULT false,
    "canWithdrawFunds" BOOLEAN NOT NULL DEFAULT false,
    "minDailyRate" DOUBLE PRECISION,
    "maxDailyRate" DOUBLE PRECISION,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedReason" TEXT,
    "suspendedAt" TIMESTAMP(3),
    "suspendedReason" TEXT,
    "governmentIdUrl" TEXT,
    "driversLicenseUrl" TEXT,
    "insuranceDocUrl" TEXT,
    "documentsVerified" BOOLEAN NOT NULL DEFAULT false,
    "autoApproveBookings" BOOLEAN NOT NULL DEFAULT false,
    "requireDeposit" BOOLEAN NOT NULL DEFAULT true,
    "depositAmount" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "documentStatuses" JSONB,
    "pendingActions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "backgroundCheckStatus" TEXT,
    "restrictionReasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastNotificationSent" TIMESTAMP(3),
    "documentsRequestedAt" TIMESTAMP(3),
    "documentsResubmittedAt" TIMESTAMP(3),
    "bankAccountInfo" TEXT,
    "defaultPayoutMethod" TEXT,
    "payoutFrequency" TEXT DEFAULT 'weekly',
    "protectionPlan" TEXT DEFAULT 'BASIC',
    "protectionPlanFee" DOUBLE PRECISION,
    "stripeAccountId" TEXT,
    "totalPayoutAmount" DOUBLE PRECISION DEFAULT 0,
    "totalPayoutCount" INTEGER DEFAULT 0,
    "stripeConnectAccountId" TEXT,
    "stripeAccountStatus" TEXT DEFAULT 'pending',
    "stripePayoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "stripeChargesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "stripeDetailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "stripeOnboardingLink" TEXT,
    "stripeTosAcceptanceDate" TIMESTAMP(3),
    "stripeTosAcceptanceIp" TEXT,
    "bankAccountLast4" TEXT,
    "bankAccountName" TEXT,
    "bankName" TEXT,
    "bankAccountType" TEXT DEFAULT 'checking',
    "bankAccountToken" TEXT,
    "bankVerified" BOOLEAN NOT NULL DEFAULT false,
    "bankVerifiedDate" TIMESTAMP(3),
    "debitCardLast4" TEXT,
    "debitCardBrand" TEXT,
    "debitCardExpMonth" INTEGER,
    "debitCardExpYear" INTEGER,
    "debitCardToken" TEXT,
    "debitCardVerified" BOOLEAN NOT NULL DEFAULT false,
    "payoutMethods" JSONB,
    "defaultPayoutMethodId" TEXT,
    "payoutSchedule" TEXT NOT NULL DEFAULT 'weekly',
    "payoutScheduleDay" TEXT DEFAULT 'Friday',
    "minimumPayoutAmount" DOUBLE PRECISION NOT NULL DEFAULT 50.00,
    "instantPayoutEnabled" BOOLEAN NOT NULL DEFAULT false,
    "taxIdProvided" BOOLEAN NOT NULL DEFAULT false,
    "taxIdType" TEXT,
    "businessName" TEXT,
    "businessType" TEXT,
    "w9Submitted" BOOLEAN NOT NULL DEFAULT false,
    "w9SubmittedDate" TIMESTAMP(3),
    "currentBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pendingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastPayoutDate" TIMESTAMP(3),
    "lastPayoutAmount" DOUBLE PRECISION,
    "nextScheduledPayout" TIMESTAMP(3),
    "totalPayoutsCount" INTEGER NOT NULL DEFAULT 0,
    "totalPayoutsAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "payoutsDisabledReason" TEXT,
    "holdFundsUntil" TIMESTAMP(3),
    "holdReason" TEXT,
    "platformFeeRate" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "instantPayoutFeeRate" DOUBLE PRECISION NOT NULL DEFAULT 0.015,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalHost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
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

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
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
    "actionLabel" TEXT,
    "actionCompleted" BOOLEAN NOT NULL DEFAULT false,
    "relatedDocumentType" TEXT,
    "relatedCheckType" TEXT,
    "reminderCount" INTEGER NOT NULL DEFAULT 0,
    "lastReminderAt" TIMESTAMP(3),
    "nextReminderAt" TIMESTAMP(3),
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostNotification_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "RentalCarPhoto_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "RentalBooking_pkey" PRIMARY KEY ("id")
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
    "tripCount" INTEGER NOT NULL DEFAULT 1,
    "reviewCount" INTEGER NOT NULL DEFAULT 1,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewerProfile_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "RentalPayout_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "HostInquiry_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_hotelId_idx" ON "User"("hotelId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshToken_key" ON "Session"("refreshToken");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_refreshToken_idx" ON "Session"("refreshToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "ApiKey_key_idx" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "ApiKey_hotelId_idx" ON "ApiKey"("hotelId");

-- CreateIndex
CREATE UNIQUE INDEX "Hotel_gdsCode_key" ON "Hotel"("gdsCode");

-- CreateIndex
CREATE INDEX "Hotel_gdsCode_idx" ON "Hotel"("gdsCode");

-- CreateIndex
CREATE INDEX "Hotel_city_state_idx" ON "Hotel"("city", "state");

-- CreateIndex
CREATE INDEX "Hotel_certified_idx" ON "Hotel"("certified");

-- CreateIndex
CREATE INDEX "HotelMetrics_hotelId_idx" ON "HotelMetrics"("hotelId");

-- CreateIndex
CREATE UNIQUE INDEX "HotelMetrics_hotelId_period_startDate_key" ON "HotelMetrics"("hotelId", "period", "startDate");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_confirmationNumber_key" ON "Booking"("confirmationNumber");

-- CreateIndex
CREATE INDEX "Booking_hotelId_idx" ON "Booking"("hotelId");

-- CreateIndex
CREATE INDEX "Booking_guestId_idx" ON "Booking"("guestId");

-- CreateIndex
CREATE INDEX "Booking_confirmationNumber_idx" ON "Booking"("confirmationNumber");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Guest_email_idx" ON "Guest"("email");

-- CreateIndex
CREATE INDEX "Ride_hotelId_idx" ON "Ride"("hotelId");

-- CreateIndex
CREATE INDEX "Ride_status_idx" ON "Ride"("status");

-- CreateIndex
CREATE INDEX "Ride_isGhost_idx" ON "Ride"("isGhost");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_email_key" ON "Driver"("email");

-- CreateIndex
CREATE INDEX "Driver_email_idx" ON "Driver"("email");

-- CreateIndex
CREATE INDEX "Driver_available_idx" ON "Driver"("available");

-- CreateIndex
CREATE UNIQUE INDEX "RentalHost_userId_key" ON "RentalHost"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RentalHost_email_key" ON "RentalHost"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RentalHost_stripeConnectAccountId_key" ON "RentalHost"("stripeConnectAccountId");

-- CreateIndex
CREATE INDEX "RentalHost_email_idx" ON "RentalHost"("email");

-- CreateIndex
CREATE INDEX "RentalHost_city_state_idx" ON "RentalHost"("city", "state");

-- CreateIndex
CREATE INDEX "RentalHost_hostType_idx" ON "RentalHost"("hostType");

-- CreateIndex
CREATE INDEX "RentalHost_approvalStatus_idx" ON "RentalHost"("approvalStatus");

-- CreateIndex
CREATE INDEX "RentalHost_stripeConnectAccountId_idx" ON "RentalHost"("stripeConnectAccountId");

-- CreateIndex
CREATE INDEX "RentalHost_payoutsEnabled_idx" ON "RentalHost"("payoutsEnabled");

-- CreateIndex
CREATE INDEX "RentalHost_stripeAccountId_idx" ON "RentalHost"("stripeAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_stripeMethodId_key" ON "PaymentMethod"("stripeMethodId");

-- CreateIndex
CREATE INDEX "PaymentMethod_hostId_idx" ON "PaymentMethod"("hostId");

-- CreateIndex
CREATE INDEX "PaymentMethod_stripeMethodId_idx" ON "PaymentMethod"("stripeMethodId");

-- CreateIndex
CREATE INDEX "PaymentMethod_isDefault_idx" ON "PaymentMethod"("isDefault");

-- CreateIndex
CREATE INDEX "BackgroundCheck_hostId_idx" ON "BackgroundCheck"("hostId");

-- CreateIndex
CREATE INDEX "BackgroundCheck_status_idx" ON "BackgroundCheck"("status");

-- CreateIndex
CREATE INDEX "BackgroundCheck_checkType_idx" ON "BackgroundCheck"("checkType");

-- CreateIndex
CREATE INDEX "BackgroundCheck_expiresAt_idx" ON "BackgroundCheck"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "BackgroundCheck_hostId_checkType_key" ON "BackgroundCheck"("hostId", "checkType");

-- CreateIndex
CREATE INDEX "HostNotification_hostId_idx" ON "HostNotification"("hostId");

-- CreateIndex
CREATE INDEX "HostNotification_type_idx" ON "HostNotification"("type");

-- CreateIndex
CREATE INDEX "HostNotification_status_idx" ON "HostNotification"("status");

-- CreateIndex
CREATE INDEX "HostNotification_priority_idx" ON "HostNotification"("priority");

-- CreateIndex
CREATE INDEX "HostNotification_responseDeadline_idx" ON "HostNotification"("responseDeadline");

-- CreateIndex
CREATE INDEX "HostDocumentStatus_hostId_idx" ON "HostDocumentStatus"("hostId");

-- CreateIndex
CREATE INDEX "HostDocumentStatus_status_idx" ON "HostDocumentStatus"("status");

-- CreateIndex
CREATE INDEX "HostDocumentStatus_reviewStatus_idx" ON "HostDocumentStatus"("reviewStatus");

-- CreateIndex
CREATE INDEX "HostDocumentStatus_expiryDate_idx" ON "HostDocumentStatus"("expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "HostDocumentStatus_hostId_documentType_key" ON "HostDocumentStatus"("hostId", "documentType");

-- CreateIndex
CREATE INDEX "RentalCar_hostId_idx" ON "RentalCar"("hostId");

-- CreateIndex
CREATE INDEX "RentalCar_city_state_idx" ON "RentalCar"("city", "state");

-- CreateIndex
CREATE INDEX "RentalCar_carType_idx" ON "RentalCar"("carType");

-- CreateIndex
CREATE INDEX "RentalCar_isActive_instantBook_idx" ON "RentalCar"("isActive", "instantBook");

-- CreateIndex
CREATE INDEX "RentalCarPhoto_carId_idx" ON "RentalCarPhoto"("carId");

-- CreateIndex
CREATE INDEX "RentalAvailability_carId_date_isAvailable_idx" ON "RentalAvailability"("carId", "date", "isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "RentalAvailability_carId_date_key" ON "RentalAvailability"("carId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "RentalBooking_bookingCode_key" ON "RentalBooking"("bookingCode");

-- CreateIndex
CREATE INDEX "RentalBooking_renterId_idx" ON "RentalBooking"("renterId");

-- CreateIndex
CREATE INDEX "RentalBooking_carId_idx" ON "RentalBooking"("carId");

-- CreateIndex
CREATE INDEX "RentalBooking_hostId_idx" ON "RentalBooking"("hostId");

-- CreateIndex
CREATE INDEX "RentalBooking_status_idx" ON "RentalBooking"("status");

-- CreateIndex
CREATE INDEX "RentalBooking_startDate_endDate_idx" ON "RentalBooking"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "RentalBooking_guestEmail_idx" ON "RentalBooking"("guestEmail");

-- CreateIndex
CREATE INDEX "RentalBooking_riskScore_idx" ON "RentalBooking"("riskScore");

-- CreateIndex
CREATE INDEX "RentalBooking_fraudulent_idx" ON "RentalBooking"("fraudulent");

-- CreateIndex
CREATE INDEX "RentalBooking_bookingIpAddress_idx" ON "RentalBooking"("bookingIpAddress");

-- CreateIndex
CREATE INDEX "RentalBooking_deviceFingerprint_idx" ON "RentalBooking"("deviceFingerprint");

-- CreateIndex
CREATE INDEX "RentalBooking_stripeCustomerId_idx" ON "RentalBooking"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "RentalBooking_paymentStatus_idx" ON "RentalBooking"("paymentStatus");

-- CreateIndex
CREATE INDEX "RentalBooking_tripStatus_idx" ON "RentalBooking"("tripStatus");

-- CreateIndex
CREATE INDEX "RentalBooking_verificationStatus_idx" ON "RentalBooking"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewerProfile_email_key" ON "ReviewerProfile"("email");

-- CreateIndex
CREATE INDEX "ReviewerProfile_email_idx" ON "ReviewerProfile"("email");

-- CreateIndex
CREATE INDEX "ReviewerProfile_city_state_idx" ON "ReviewerProfile"("city", "state");

-- CreateIndex
CREATE UNIQUE INDEX "RentalReview_bookingId_key" ON "RentalReview"("bookingId");

-- CreateIndex
CREATE INDEX "RentalReview_carId_idx" ON "RentalReview"("carId");

-- CreateIndex
CREATE INDEX "RentalReview_hostId_idx" ON "RentalReview"("hostId");

-- CreateIndex
CREATE INDEX "RentalReview_source_idx" ON "RentalReview"("source");

-- CreateIndex
CREATE INDEX "RentalReview_isVisible_idx" ON "RentalReview"("isVisible");

-- CreateIndex
CREATE INDEX "RentalReview_isPinned_idx" ON "RentalReview"("isPinned");

-- CreateIndex
CREATE INDEX "RentalReview_tripStartDate_idx" ON "RentalReview"("tripStartDate");

-- CreateIndex
CREATE INDEX "ReviewTemplate_carType_idx" ON "ReviewTemplate"("carType");

-- CreateIndex
CREATE INDEX "ReviewTemplate_scenario_idx" ON "ReviewTemplate"("scenario");

-- CreateIndex
CREATE INDEX "ReviewTemplate_isActive_idx" ON "ReviewTemplate"("isActive");

-- CreateIndex
CREATE INDEX "TripCharge_bookingId_idx" ON "TripCharge"("bookingId");

-- CreateIndex
CREATE INDEX "TripCharge_chargeStatus_idx" ON "TripCharge"("chargeStatus");

-- CreateIndex
CREATE INDEX "TripCharge_holdUntil_idx" ON "TripCharge"("holdUntil");

-- CreateIndex
CREATE INDEX "TripCharge_requiresApproval_idx" ON "TripCharge"("requiresApproval");

-- CreateIndex
CREATE INDEX "ChargeAdjustment_bookingId_idx" ON "ChargeAdjustment"("bookingId");

-- CreateIndex
CREATE INDEX "ChargeAdjustment_chargeId_idx" ON "ChargeAdjustment"("chargeId");

-- CreateIndex
CREATE INDEX "ChargeAdjustment_adminId_idx" ON "ChargeAdjustment"("adminId");

-- CreateIndex
CREATE INDEX "ChargeAdjustment_processingStatus_idx" ON "ChargeAdjustment"("processingStatus");

-- CreateIndex
CREATE INDEX "InspectionPhoto_bookingId_idx" ON "InspectionPhoto"("bookingId");

-- CreateIndex
CREATE INDEX "InspectionPhoto_type_idx" ON "InspectionPhoto"("type");

-- CreateIndex
CREATE UNIQUE INDEX "BookingSession_bookingId_key" ON "BookingSession"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "BookingSession_sessionId_key" ON "BookingSession"("sessionId");

-- CreateIndex
CREATE INDEX "BookingSession_sessionId_idx" ON "BookingSession"("sessionId");

-- CreateIndex
CREATE INDEX "BookingSession_abandoned_idx" ON "BookingSession"("abandoned");

-- CreateIndex
CREATE INDEX "FraudIndicator_bookingId_idx" ON "FraudIndicator"("bookingId");

-- CreateIndex
CREATE INDEX "FraudIndicator_severity_idx" ON "FraudIndicator"("severity");

-- CreateIndex
CREATE INDEX "FraudIndicator_indicator_idx" ON "FraudIndicator"("indicator");

-- CreateIndex
CREATE UNIQUE INDEX "GuestAccessToken_token_key" ON "GuestAccessToken"("token");

-- CreateIndex
CREATE INDEX "GuestAccessToken_token_idx" ON "GuestAccessToken"("token");

-- CreateIndex
CREATE INDEX "GuestAccessToken_email_idx" ON "GuestAccessToken"("email");

-- CreateIndex
CREATE INDEX "RentalMessage_bookingId_idx" ON "RentalMessage"("bookingId");

-- CreateIndex
CREATE INDEX "RentalMessage_createdAt_idx" ON "RentalMessage"("createdAt");

-- CreateIndex
CREATE INDEX "RentalMessage_isRead_readByAdmin_idx" ON "RentalMessage"("isRead", "readByAdmin");

-- CreateIndex
CREATE INDEX "RentalMessage_category_idx" ON "RentalMessage"("category");

-- CreateIndex
CREATE INDEX "RentalMessage_senderType_idx" ON "RentalMessage"("senderType");

-- CreateIndex
CREATE INDEX "RentalPayout_hostId_idx" ON "RentalPayout"("hostId");

-- CreateIndex
CREATE INDEX "RentalPayout_status_idx" ON "RentalPayout"("status");

-- CreateIndex
CREATE INDEX "HostPayout_hostId_idx" ON "HostPayout"("hostId");

-- CreateIndex
CREATE INDEX "HostPayout_status_idx" ON "HostPayout"("status");

-- CreateIndex
CREATE INDEX "HostInquiry_status_idx" ON "HostInquiry"("status");

-- CreateIndex
CREATE INDEX "HostInquiry_email_idx" ON "HostInquiry"("email");

-- CreateIndex
CREATE INDEX "HostInquiry_createdAt_idx" ON "HostInquiry"("createdAt");

-- CreateIndex
CREATE INDEX "AdminNotification_type_idx" ON "AdminNotification"("type");

-- CreateIndex
CREATE INDEX "AdminNotification_status_idx" ON "AdminNotification"("status");

-- CreateIndex
CREATE INDEX "AdminNotification_priority_idx" ON "AdminNotification"("priority");

-- CreateIndex
CREATE INDEX "AdminNotification_createdAt_idx" ON "AdminNotification"("createdAt");

-- CreateIndex
CREATE INDEX "ContactMessage_status_idx" ON "ContactMessage"("status");

-- CreateIndex
CREATE INDEX "ContactMessage_email_idx" ON "ContactMessage"("email");

-- CreateIndex
CREATE INDEX "RentalDispute_bookingId_idx" ON "RentalDispute"("bookingId");

-- CreateIndex
CREATE INDEX "RentalDispute_status_idx" ON "RentalDispute"("status");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_entityType_idx" ON "ActivityLog"("entityType");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "AmadeusCarCache_location_searchDate_idx" ON "AmadeusCarCache"("location", "searchDate");

-- CreateIndex
CREATE INDEX "AmadeusCarCache_expiresAt_idx" ON "AmadeusCarCache"("expiresAt");

-- CreateIndex
CREATE INDEX "JobPosting_isActive_idx" ON "JobPosting"("isActive");

-- CreateIndex
CREATE INDEX "JobPosting_department_idx" ON "JobPosting"("department");

-- CreateIndex
CREATE INDEX "JobPosting_location_idx" ON "JobPosting"("location");

-- CreateIndex
CREATE INDEX "JobPosting_type_idx" ON "JobPosting"("type");

-- CreateIndex
CREATE INDEX "JobPosting_postedDate_idx" ON "JobPosting"("postedDate");

-- CreateIndex
CREATE INDEX "JobApplication_jobId_idx" ON "JobApplication"("jobId");

-- CreateIndex
CREATE INDEX "JobApplication_status_idx" ON "JobApplication"("status");

-- CreateIndex
CREATE INDEX "JobApplication_email_idx" ON "JobApplication"("email");

-- CreateIndex
CREATE INDEX "JobApplication_createdAt_idx" ON "JobApplication"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_jobId_email_key" ON "JobApplication"("jobId", "email");

-- CreateIndex
CREATE INDEX "ApplicationActivity_applicationId_idx" ON "ApplicationActivity"("applicationId");

-- CreateIndex
CREATE INDEX "ApplicationActivity_createdAt_idx" ON "ApplicationActivity"("createdAt");

-- CreateIndex
CREATE INDEX "Revenue_hotelId_idx" ON "Revenue"("hotelId");

-- CreateIndex
CREATE INDEX "Revenue_status_idx" ON "Revenue"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Revenue_hotelId_period_startDate_key" ON "Revenue"("hotelId", "period", "startDate");

-- CreateIndex
CREATE INDEX "Transaction_hotelId_idx" ON "Transaction"("hotelId");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_adminId_idx" ON "AuditLog"("adminId");

-- CreateIndex
CREATE INDEX "AuditLog_adminEmail_idx" ON "AuditLog"("adminEmail");

-- CreateIndex
CREATE INDEX "AuditLog_hotelId_idx" ON "AuditLog"("hotelId");

-- CreateIndex
CREATE INDEX "AuditLog_category_idx" ON "AuditLog"("category");

-- CreateIndex
CREATE INDEX "AuditLog_eventType_idx" ON "AuditLog"("eventType");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_resourceId_idx" ON "AuditLog"("resourceId");

-- CreateIndex
CREATE INDEX "AuditLog_severity_idx" ON "AuditLog"("severity");

-- CreateIndex
CREATE INDEX "SecurityEvent_type_idx" ON "SecurityEvent"("type");

-- CreateIndex
CREATE INDEX "SecurityEvent_severity_idx" ON "SecurityEvent"("severity");

-- CreateIndex
CREATE INDEX "SecurityEvent_sourceIp_idx" ON "SecurityEvent"("sourceIp");

-- CreateIndex
CREATE INDEX "SecurityEvent_timestamp_idx" ON "SecurityEvent"("timestamp");

-- CreateIndex
CREATE INDEX "Threat_type_idx" ON "Threat"("type");

-- CreateIndex
CREATE INDEX "Threat_severity_idx" ON "Threat"("severity");

-- CreateIndex
CREATE INDEX "Threat_status_idx" ON "Threat"("status");

-- CreateIndex
CREATE INDEX "Threat_sourceIp_idx" ON "Threat"("sourceIp");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_identifier_key" ON "RateLimit"("identifier");

-- CreateIndex
CREATE INDEX "RateLimit_identifier_idx" ON "RateLimit"("identifier");

-- CreateIndex
CREATE INDEX "RateLimit_exceeded_idx" ON "RateLimit"("exceeded");

-- CreateIndex
CREATE INDEX "LoginAttempt_identifier_idx" ON "LoginAttempt"("identifier");

-- CreateIndex
CREATE INDEX "LoginAttempt_ipAddress_idx" ON "LoginAttempt"("ipAddress");

-- CreateIndex
CREATE INDEX "LoginAttempt_success_idx" ON "LoginAttempt"("success");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelMetrics" ADD CONSTRAINT "HotelMetrics_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalHost" ADD CONSTRAINT "RentalHost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BackgroundCheck" ADD CONSTRAINT "BackgroundCheck_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostNotification" ADD CONSTRAINT "HostNotification_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostDocumentStatus" ADD CONSTRAINT "HostDocumentStatus_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalCar" ADD CONSTRAINT "RentalCar_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalCarPhoto" ADD CONSTRAINT "RentalCarPhoto_carId_fkey" FOREIGN KEY ("carId") REFERENCES "RentalCar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalAvailability" ADD CONSTRAINT "RentalAvailability_carId_fkey" FOREIGN KEY ("carId") REFERENCES "RentalCar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalBooking" ADD CONSTRAINT "RentalBooking_carId_fkey" FOREIGN KEY ("carId") REFERENCES "RentalCar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalBooking" ADD CONSTRAINT "RentalBooking_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalBooking" ADD CONSTRAINT "RentalBooking_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalReview" ADD CONSTRAINT "RentalReview_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalReview" ADD CONSTRAINT "RentalReview_carId_fkey" FOREIGN KEY ("carId") REFERENCES "RentalCar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalReview" ADD CONSTRAINT "RentalReview_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalReview" ADD CONSTRAINT "RentalReview_reviewerProfileId_fkey" FOREIGN KEY ("reviewerProfileId") REFERENCES "ReviewerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripCharge" ADD CONSTRAINT "TripCharge_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChargeAdjustment" ADD CONSTRAINT "ChargeAdjustment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChargeAdjustment" ADD CONSTRAINT "ChargeAdjustment_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "TripCharge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionPhoto" ADD CONSTRAINT "InspectionPhoto_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingSession" ADD CONSTRAINT "BookingSession_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FraudIndicator" ADD CONSTRAINT "FraudIndicator_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestAccessToken" ADD CONSTRAINT "GuestAccessToken_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalMessage" ADD CONSTRAINT "RentalMessage_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalPayout" ADD CONSTRAINT "RentalPayout_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostPayout" ADD CONSTRAINT "HostPayout_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostPayout" ADD CONSTRAINT "HostPayout_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalDispute" ADD CONSTRAINT "RentalDispute_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginAttempt" ADD CONSTRAINT "LoginAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

