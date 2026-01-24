-- CreateIndex
CREATE INDEX "PageView_visitorId_timestamp_idx" ON "PageView"("visitorId", "timestamp");

-- CreateIndex
CREATE INDEX "PageView_sessionId_visitorId_idx" ON "PageView"("sessionId", "visitorId");

-- CreateIndex
CREATE INDEX "PageView_visitorId_eventType_timestamp_idx" ON "PageView"("visitorId", "eventType", "timestamp");

-- CreateIndex
CREATE INDEX "SecurityEvent_type_severity_timestamp_idx" ON "SecurityEvent"("type", "severity", "timestamp");

-- CreateIndex
CREATE INDEX "SecurityEvent_blocked_timestamp_idx" ON "SecurityEvent"("blocked", "timestamp");
