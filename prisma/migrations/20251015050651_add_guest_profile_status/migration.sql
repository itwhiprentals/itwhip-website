-- CreateTable
CREATE TABLE "GuestProfileStatus" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "accountStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "activeWarningCount" INTEGER NOT NULL DEFAULT 0,
    "activeSuspensions" INTEGER NOT NULL DEFAULT 0,
    "activeRestrictions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "statusHistory" JSONB NOT NULL DEFAULT '[]',
    "restrictionHistory" JSONB NOT NULL DEFAULT '[]',
    "notificationHistory" JSONB NOT NULL DEFAULT '[]',
    "lastWarningAt" TIMESTAMP(3),
    "lastSuspensionAt" TIMESTAMP(3),
    "lastNotificationAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestProfileStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuestProfileStatus_guestId_key" ON "GuestProfileStatus"("guestId");

-- CreateIndex
CREATE INDEX "GuestProfileStatus_guestId_idx" ON "GuestProfileStatus"("guestId");

-- CreateIndex
CREATE INDEX "GuestProfileStatus_accountStatus_idx" ON "GuestProfileStatus"("accountStatus");

-- CreateIndex
CREATE INDEX "GuestProfileStatus_activeWarningCount_idx" ON "GuestProfileStatus"("activeWarningCount");

-- CreateIndex
CREATE INDEX "GuestProfileStatus_activeSuspensions_idx" ON "GuestProfileStatus"("activeSuspensions");

-- CreateIndex
CREATE INDEX "GuestProfileStatus_lastWarningAt_idx" ON "GuestProfileStatus"("lastWarningAt");

-- CreateIndex
CREATE INDEX "GuestProfileStatus_lastSuspensionAt_idx" ON "GuestProfileStatus"("lastSuspensionAt");

-- AddForeignKey
ALTER TABLE "GuestProfileStatus" ADD CONSTRAINT "GuestProfileStatus_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "ReviewerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
