-- CreateTable
CREATE TABLE "cron_logs" (
    "id" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "processed" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "details" JSONB,
    "error" TEXT,
    "triggeredBy" TEXT NOT NULL DEFAULT 'cron',

    CONSTRAINT "cron_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cron_logs_jobName_idx" ON "cron_logs"("jobName");

-- CreateIndex
CREATE INDEX "cron_logs_startedAt_idx" ON "cron_logs"("startedAt");

-- CreateIndex
CREATE INDEX "cron_logs_jobName_startedAt_idx" ON "cron_logs"("jobName", "startedAt");

-- CreateIndex
CREATE INDEX "cron_logs_status_idx" ON "cron_logs"("status");
