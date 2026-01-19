-- CreateTable
CREATE TABLE "MonitoringAlert" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" "ThreatSeverity" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "source" TEXT,
    "metadata" JSONB,
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonitoringAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonitoringAlert_status_idx" ON "MonitoringAlert"("status");

-- CreateIndex
CREATE INDEX "MonitoringAlert_severity_idx" ON "MonitoringAlert"("severity");

-- CreateIndex
CREATE INDEX "MonitoringAlert_type_idx" ON "MonitoringAlert"("type");

-- CreateIndex
CREATE INDEX "MonitoringAlert_createdAt_idx" ON "MonitoringAlert"("createdAt");
