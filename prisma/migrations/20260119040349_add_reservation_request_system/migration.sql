-- CreateEnum
CREATE TYPE "ReservationRequestType" AS ENUM ('STANDARD', 'CORPORATE', 'BULK', 'EVENT', 'LONG_TERM');

-- CreateEnum
CREATE TYPE "ReservationRequestStatus" AS ENUM ('OPEN', 'CLAIMED', 'CAR_ASSIGNED', 'FULFILLED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RequestPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ProspectSource" AS ENUM ('FACEBOOK_MARKETPLACE', 'CRAIGSLIST', 'TURO', 'GETAROUND', 'REFERRAL', 'DIRECT_CONTACT', 'WEBSITE_CONTACT', 'PHONE', 'EMAIL', 'OTHER');

-- CreateEnum
CREATE TYPE "ProspectStatus" AS ENUM ('DRAFT', 'EMAIL_SENT', 'EMAIL_OPENED', 'LINK_CLICKED', 'CONVERTED', 'CLAIMED_REQUEST', 'FULFILLED', 'ARCHIVED', 'BOUNCED', 'UNSUBSCRIBED');

-- CreateEnum
CREATE TYPE "RequestClaimStatus" AS ENUM ('PENDING_CAR', 'CAR_SELECTED', 'COMPLETED', 'EXPIRED', 'WITHDRAWN', 'REJECTED');

-- CreateTable
CREATE TABLE "reservation_requests" (
    "id" TEXT NOT NULL,
    "requestCode" TEXT NOT NULL,
    "requestType" "ReservationRequestType" NOT NULL DEFAULT 'STANDARD',
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT,
    "guestPhone" TEXT,
    "companyName" TEXT,
    "vehicleType" TEXT,
    "vehicleClass" TEXT,
    "vehicleMake" TEXT,
    "vehicleModel" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "durationDays" INTEGER,
    "pickupCity" TEXT,
    "pickupState" TEXT,
    "pickupAddress" TEXT,
    "dropoffCity" TEXT,
    "dropoffState" TEXT,
    "dropoffAddress" TEXT,
    "offeredRate" DOUBLE PRECISION,
    "totalBudget" DOUBLE PRECISION,
    "isNegotiable" BOOLEAN NOT NULL DEFAULT true,
    "status" "ReservationRequestStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "RequestPriority" NOT NULL DEFAULT 'NORMAL',
    "guestNotes" TEXT,
    "adminNotes" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "claimAttempts" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT,
    "sourceDetails" TEXT,
    "fulfilledBookingId" TEXT,
    "createdBy" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "host_prospects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "vehicleMake" TEXT,
    "vehicleModel" TEXT,
    "vehicleYear" INTEGER,
    "vehicleDescription" TEXT,
    "source" "ProspectSource" NOT NULL DEFAULT 'FACEBOOK_MARKETPLACE',
    "sourceUrl" TEXT,
    "conversationNotes" TEXT,
    "inviteToken" TEXT,
    "inviteTokenExp" TIMESTAMP(3),
    "inviteSentAt" TIMESTAMP(3),
    "inviteEmailId" TEXT,
    "inviteResendCount" INTEGER NOT NULL DEFAULT 0,
    "lastResendAt" TIMESTAMP(3),
    "status" "ProspectStatus" NOT NULL DEFAULT 'DRAFT',
    "emailOpenedAt" TIMESTAMP(3),
    "linkClickedAt" TIMESTAMP(3),
    "convertedAt" TIMESTAMP(3),
    "requestId" TEXT,
    "convertedHostId" TEXT,
    "addedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "host_prospects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_claims" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "carId" TEXT,
    "status" "RequestClaimStatus" NOT NULL DEFAULT 'PENDING_CAR',
    "claimExpiresAt" TIMESTAMP(3) NOT NULL,
    "offeredRate" DOUBLE PRECISION,
    "hostNotes" TEXT,
    "bookingId" TEXT,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "carAssignedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),

    CONSTRAINT "request_claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reservation_requests_requestCode_key" ON "reservation_requests"("requestCode");

-- CreateIndex
CREATE UNIQUE INDEX "reservation_requests_fulfilledBookingId_key" ON "reservation_requests"("fulfilledBookingId");

-- CreateIndex
CREATE INDEX "reservation_requests_status_idx" ON "reservation_requests"("status");

-- CreateIndex
CREATE INDEX "reservation_requests_pickupCity_pickupState_idx" ON "reservation_requests"("pickupCity", "pickupState");

-- CreateIndex
CREATE INDEX "reservation_requests_vehicleType_idx" ON "reservation_requests"("vehicleType");

-- CreateIndex
CREATE INDEX "reservation_requests_startDate_idx" ON "reservation_requests"("startDate");

-- CreateIndex
CREATE INDEX "reservation_requests_createdAt_idx" ON "reservation_requests"("createdAt");

-- CreateIndex
CREATE INDEX "reservation_requests_expiresAt_idx" ON "reservation_requests"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "host_prospects_inviteToken_key" ON "host_prospects"("inviteToken");

-- CreateIndex
CREATE UNIQUE INDEX "host_prospects_convertedHostId_key" ON "host_prospects"("convertedHostId");

-- CreateIndex
CREATE INDEX "host_prospects_email_idx" ON "host_prospects"("email");

-- CreateIndex
CREATE INDEX "host_prospects_status_idx" ON "host_prospects"("status");

-- CreateIndex
CREATE INDEX "host_prospects_inviteToken_idx" ON "host_prospects"("inviteToken");

-- CreateIndex
CREATE INDEX "host_prospects_requestId_idx" ON "host_prospects"("requestId");

-- CreateIndex
CREATE INDEX "host_prospects_convertedHostId_idx" ON "host_prospects"("convertedHostId");

-- CreateIndex
CREATE INDEX "host_prospects_source_idx" ON "host_prospects"("source");

-- CreateIndex
CREATE UNIQUE INDEX "request_claims_bookingId_key" ON "request_claims"("bookingId");

-- CreateIndex
CREATE INDEX "request_claims_requestId_idx" ON "request_claims"("requestId");

-- CreateIndex
CREATE INDEX "request_claims_hostId_idx" ON "request_claims"("hostId");

-- CreateIndex
CREATE INDEX "request_claims_status_idx" ON "request_claims"("status");

-- CreateIndex
CREATE INDEX "request_claims_claimExpiresAt_idx" ON "request_claims"("claimExpiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "request_claims_requestId_hostId_key" ON "request_claims"("requestId", "hostId");

-- AddForeignKey
ALTER TABLE "reservation_requests" ADD CONSTRAINT "reservation_requests_fulfilledBookingId_fkey" FOREIGN KEY ("fulfilledBookingId") REFERENCES "RentalBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_prospects" ADD CONSTRAINT "host_prospects_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "reservation_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_prospects" ADD CONSTRAINT "host_prospects_convertedHostId_fkey" FOREIGN KEY ("convertedHostId") REFERENCES "RentalHost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_claims" ADD CONSTRAINT "request_claims_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "reservation_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_claims" ADD CONSTRAINT "request_claims_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_claims" ADD CONSTRAINT "request_claims_carId_fkey" FOREIGN KEY ("carId") REFERENCES "RentalCar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_claims" ADD CONSTRAINT "request_claims_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
