-- CreateTable
CREATE TABLE "claude_batch_jobs" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "totalRequests" INTEGER NOT NULL,
    "completedCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "resultsUrl" TEXT,
    "errorMessage" TEXT,
    "estimatedCost" DECIMAL(10,4),
    "actualCost" DECIMAL(10,4),
    "costSavings" DECIMAL(10,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "claude_batch_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "claude_batch_jobs_batchId_key" ON "claude_batch_jobs"("batchId");

-- CreateIndex
CREATE INDEX "claude_batch_jobs_type_status_idx" ON "claude_batch_jobs"("type", "status");

-- CreateIndex
CREATE INDEX "claude_batch_jobs_status_createdAt_idx" ON "claude_batch_jobs"("status", "createdAt");
