-- CreateTable
CREATE TABLE "choe_ai_settings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "modelId" TEXT NOT NULL DEFAULT 'claude-3-5-haiku-20241022',
    "maxTokens" INTEGER NOT NULL DEFAULT 1024,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "serviceFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "taxRateDefault" DOUBLE PRECISION NOT NULL DEFAULT 0.084,
    "messagesPerWindow" INTEGER NOT NULL DEFAULT 30,
    "rateLimitWindowMins" INTEGER NOT NULL DEFAULT 5,
    "dailyApiLimit" INTEGER NOT NULL DEFAULT 100,
    "sessionMessageLimit" INTEGER NOT NULL DEFAULT 30,
    "maxMessageLength" INTEGER NOT NULL DEFAULT 200,
    "anonymousTimeSeconds" INTEGER NOT NULL DEFAULT 900,
    "anonymousMaxMessages" INTEGER NOT NULL DEFAULT 30,
    "highRiskThreshold" INTEGER NOT NULL DEFAULT 61,
    "verificationThreshold" INTEGER NOT NULL DEFAULT 31,
    "anonymousUserPoints" INTEGER NOT NULL DEFAULT 30,
    "unverifiedUserPoints" INTEGER NOT NULL DEFAULT 20,
    "highValuePoints" INTEGER NOT NULL DEFAULT 20,
    "exoticVehiclePoints" INTEGER NOT NULL DEFAULT 25,
    "brandName" TEXT NOT NULL DEFAULT 'Choé',
    "enableEmojis" BOOLEAN NOT NULL DEFAULT true,
    "serviceRegions" JSONB NOT NULL DEFAULT '["Phoenix","Scottsdale","Tempe","Mesa","Chandler","Sedona","Tucson","Flagstaff"]',
    "suggestionChips" JSONB,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "weatherEnabled" BOOLEAN NOT NULL DEFAULT true,
    "riskAssessmentEnabled" BOOLEAN NOT NULL DEFAULT true,
    "anonymousAccessEnabled" BOOLEAN NOT NULL DEFAULT true,
    "experimentId" TEXT,
    "experimentConfig" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "choe_ai_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "choe_ai_conversations" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "visitorId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "isAuthenticated" BOOLEAN NOT NULL DEFAULT false,
    "state" TEXT NOT NULL DEFAULT 'INIT',
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT,
    "vehicleType" TEXT,
    "outcome" TEXT,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "estimatedCost" DECIMAL(10,6) NOT NULL,
    "authPromptedAt" TIMESTAMP(3),
    "convertedAt" TIMESTAMP(3),
    "bookingId" TEXT,
    "bookingValue" DECIMAL(10,2),
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "choe_ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "choe_ai_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "responseTimeMs" INTEGER,
    "searchPerformed" BOOLEAN NOT NULL DEFAULT false,
    "vehiclesReturned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "choe_ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "choe_ai_security_events" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "ipAddress" TEXT NOT NULL,
    "visitorId" TEXT,
    "sessionId" TEXT,
    "details" JSONB,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "choe_ai_security_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "choe_ai_daily_stats" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalConversations" INTEGER NOT NULL DEFAULT 0,
    "completedCount" INTEGER NOT NULL DEFAULT 0,
    "abandonedCount" INTEGER NOT NULL DEFAULT 0,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "estimatedCostUsd" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "rateLimitHits" INTEGER NOT NULL DEFAULT 0,
    "botsBlocked" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTimeMs" INTEGER NOT NULL DEFAULT 0,
    "anonymousSessions" INTEGER NOT NULL DEFAULT 0,
    "authPromptsShown" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "bookingsFromChoe" INTEGER NOT NULL DEFAULT 0,
    "revenueFromChoe" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "choe_ai_daily_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "choe_ai_conversations_sessionId_key" ON "choe_ai_conversations"("sessionId");

-- CreateIndex
CREATE INDEX "choe_ai_conversations_visitorId_startedAt_idx" ON "choe_ai_conversations"("visitorId", "startedAt");

-- CreateIndex
CREATE INDEX "choe_ai_conversations_userId_startedAt_idx" ON "choe_ai_conversations"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "choe_ai_conversations_outcome_startedAt_idx" ON "choe_ai_conversations"("outcome", "startedAt");

-- CreateIndex
CREATE INDEX "choe_ai_conversations_sessionId_idx" ON "choe_ai_conversations"("sessionId");

-- CreateIndex
CREATE INDEX "choe_ai_messages_conversationId_idx" ON "choe_ai_messages"("conversationId");

-- CreateIndex
CREATE INDEX "choe_ai_messages_createdAt_idx" ON "choe_ai_messages"("createdAt");

-- CreateIndex
CREATE INDEX "choe_ai_security_events_eventType_createdAt_idx" ON "choe_ai_security_events"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "choe_ai_security_events_ipAddress_createdAt_idx" ON "choe_ai_security_events"("ipAddress", "createdAt");

-- CreateIndex
CREATE INDEX "choe_ai_security_events_visitorId_createdAt_idx" ON "choe_ai_security_events"("visitorId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "choe_ai_daily_stats_date_key" ON "choe_ai_daily_stats"("date");

-- CreateIndex
CREATE INDEX "choe_ai_daily_stats_date_idx" ON "choe_ai_daily_stats"("date");

-- AddForeignKey
ALTER TABLE "choe_ai_messages" ADD CONSTRAINT "choe_ai_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "choe_ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
