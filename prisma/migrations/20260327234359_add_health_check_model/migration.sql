-- CreateTable
CREATE TABLE "HealthCheck" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "responseMs" INTEGER NOT NULL,
    "dbStatus" TEXT NOT NULL,
    "dbLatencyMs" INTEGER NOT NULL,
    "details" JSONB,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HealthCheck_checkedAt_idx" ON "HealthCheck"("checkedAt");

-- CreateIndex
CREATE INDEX "HealthCheck_status_idx" ON "HealthCheck"("status");
