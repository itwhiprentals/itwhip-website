-- CreateTable
CREATE TABLE "pending_checkouts" (
    "id" TEXT NOT NULL,
    "checkoutSessionId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "userId" TEXT,
    "visitorId" TEXT,
    "selectedInsurance" TEXT,
    "selectedDelivery" TEXT,
    "selectedAddOns" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pending_checkouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pending_checkouts_checkoutSessionId_key" ON "pending_checkouts"("checkoutSessionId");

-- CreateIndex
CREATE INDEX "pending_checkouts_vehicleId_startDate_endDate_status_idx" ON "pending_checkouts"("vehicleId", "startDate", "endDate", "status");

-- CreateIndex
CREATE INDEX "pending_checkouts_expiresAt_status_idx" ON "pending_checkouts"("expiresAt", "status");

-- CreateIndex
CREATE INDEX "pending_checkouts_userId_idx" ON "pending_checkouts"("userId");
