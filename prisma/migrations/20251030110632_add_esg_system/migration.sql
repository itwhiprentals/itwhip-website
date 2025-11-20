-- CreateTable
CREATE TABLE "public"."HostESGProfile" (
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

    CONSTRAINT "HostESGProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ESGSnapshot" (
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
CREATE TABLE "public"."ESGEvent" (
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
CREATE TABLE "public"."ESGBadge" (
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
CREATE TABLE "public"."HostBadgeEarned" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "badgeCode" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HostBadgeEarned_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HostESGProfile_hostId_key" ON "public"."HostESGProfile"("hostId");

-- CreateIndex
CREATE INDEX "HostESGProfile_hostId_idx" ON "public"."HostESGProfile"("hostId");

-- CreateIndex
CREATE INDEX "HostESGProfile_compositeScore_idx" ON "public"."HostESGProfile"("compositeScore");

-- CreateIndex
CREATE INDEX "HostESGProfile_safetyScore_idx" ON "public"."HostESGProfile"("safetyScore");

-- CreateIndex
CREATE INDEX "HostESGProfile_fraudRiskLevel_idx" ON "public"."HostESGProfile"("fraudRiskLevel");

-- CreateIndex
CREATE INDEX "ESGSnapshot_profileId_idx" ON "public"."ESGSnapshot"("profileId");

-- CreateIndex
CREATE INDEX "ESGSnapshot_snapshotDate_idx" ON "public"."ESGSnapshot"("snapshotDate");

-- CreateIndex
CREATE INDEX "ESGEvent_hostId_idx" ON "public"."ESGEvent"("hostId");

-- CreateIndex
CREATE INDEX "ESGEvent_eventType_idx" ON "public"."ESGEvent"("eventType");

-- CreateIndex
CREATE INDEX "ESGEvent_eventCategory_idx" ON "public"."ESGEvent"("eventCategory");

-- CreateIndex
CREATE INDEX "ESGEvent_createdAt_idx" ON "public"."ESGEvent"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ESGBadge_badgeCode_key" ON "public"."ESGBadge"("badgeCode");

-- CreateIndex
CREATE INDEX "ESGBadge_badgeCode_idx" ON "public"."ESGBadge"("badgeCode");

-- CreateIndex
CREATE INDEX "HostBadgeEarned_hostId_idx" ON "public"."HostBadgeEarned"("hostId");

-- CreateIndex
CREATE INDEX "HostBadgeEarned_badgeCode_idx" ON "public"."HostBadgeEarned"("badgeCode");

-- CreateIndex
CREATE UNIQUE INDEX "HostBadgeEarned_hostId_badgeCode_key" ON "public"."HostBadgeEarned"("hostId", "badgeCode");

-- AddForeignKey
ALTER TABLE "public"."HostESGProfile" ADD CONSTRAINT "HostESGProfile_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ESGSnapshot" ADD CONSTRAINT "ESGSnapshot_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."HostESGProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
