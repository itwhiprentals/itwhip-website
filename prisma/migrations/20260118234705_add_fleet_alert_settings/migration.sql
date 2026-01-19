-- CreateTable
CREATE TABLE "fleet_alert_settings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "alertEmailsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "alertEmailRecipients" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "emailDigestEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailDigestFrequency" TEXT NOT NULL DEFAULT 'daily',
    "partnerPendingDaysWarning" INTEGER NOT NULL DEFAULT 3,
    "suspendedPartnersAlert" BOOLEAN NOT NULL DEFAULT true,
    "pendingVehiclesAlert" BOOLEAN NOT NULL DEFAULT true,
    "changesRequestedAlert" BOOLEAN NOT NULL DEFAULT true,
    "highCancellationThreshold" INTEGER NOT NULL DEFAULT 5,
    "bookingsStartingTodayAlert" BOOLEAN NOT NULL DEFAULT true,
    "documentExpiryWarningDays" INTEGER NOT NULL DEFAULT 30,
    "documentExpiryUrgentDays" INTEGER NOT NULL DEFAULT 7,
    "expiredDocumentsAlert" BOOLEAN NOT NULL DEFAULT true,
    "pendingDocumentsAlert" BOOLEAN NOT NULL DEFAULT true,
    "negativeBalanceAlert" BOOLEAN NOT NULL DEFAULT true,
    "failedPayoutsAlert" BOOLEAN NOT NULL DEFAULT true,
    "pendingRefundThreshold" DOUBLE PRECISION NOT NULL DEFAULT 250,
    "pendingRefundsAlert" BOOLEAN NOT NULL DEFAULT true,
    "openClaimsAlert" BOOLEAN NOT NULL DEFAULT true,
    "lowRatingThreshold" INTEGER NOT NULL DEFAULT 2,
    "lowRatingsAlert" BOOLEAN NOT NULL DEFAULT true,
    "securityEventsAlert" BOOLEAN NOT NULL DEFAULT true,
    "criticalSecurityThreshold" INTEGER NOT NULL DEFAULT 1,
    "slowResponseThreshold" INTEGER NOT NULL DEFAULT 1000,
    "criticalResponseThreshold" INTEGER NOT NULL DEFAULT 3000,
    "lastEmailSentAt" TIMESTAMP(3),
    "lastDigestSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fleet_alert_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fleet_alert_history" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "recipients" TEXT[],
    "subject" TEXT NOT NULL,
    "alertCount" INTEGER NOT NULL DEFAULT 0,
    "highCount" INTEGER NOT NULL DEFAULT 0,
    "mediumCount" INTEGER NOT NULL DEFAULT 0,
    "lowCount" INTEGER NOT NULL DEFAULT 0,
    "categories" TEXT[],
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "error" TEXT,

    CONSTRAINT "fleet_alert_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fleet_alert_history_sentAt_idx" ON "fleet_alert_history"("sentAt");

-- CreateIndex
CREATE INDEX "fleet_alert_history_type_idx" ON "fleet_alert_history"("type");
