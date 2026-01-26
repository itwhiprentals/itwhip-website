-- CreateTable
CREATE TABLE "smartcar_vehicles" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "carId" TEXT,
    "smartcarVehicleId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "vin" TEXT,
    "make" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "lastLocation" JSONB,
    "lastOdometer" DOUBLE PRECISION,
    "lastFuel" DOUBLE PRECISION,
    "lastBattery" DOUBLE PRECISION,
    "lastLockStatus" TEXT,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disconnectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "smartcar_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "smartcar_webhooks" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "smartcarWebhookId" TEXT NOT NULL,
    "webhookType" TEXT NOT NULL,
    "frequency" TEXT,
    "dataPoints" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastReceivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "smartcar_webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "smartcar_vehicles_carId_key" ON "smartcar_vehicles"("carId");

-- CreateIndex
CREATE UNIQUE INDEX "smartcar_vehicles_smartcarVehicleId_key" ON "smartcar_vehicles"("smartcarVehicleId");

-- CreateIndex
CREATE INDEX "smartcar_vehicles_hostId_idx" ON "smartcar_vehicles"("hostId");

-- CreateIndex
CREATE INDEX "smartcar_vehicles_carId_idx" ON "smartcar_vehicles"("carId");

-- CreateIndex
CREATE INDEX "smartcar_vehicles_vin_idx" ON "smartcar_vehicles"("vin");

-- CreateIndex
CREATE INDEX "smartcar_vehicles_isActive_idx" ON "smartcar_vehicles"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "smartcar_webhooks_smartcarWebhookId_key" ON "smartcar_webhooks"("smartcarWebhookId");

-- CreateIndex
CREATE INDEX "smartcar_webhooks_vehicleId_idx" ON "smartcar_webhooks"("vehicleId");

-- CreateIndex
CREATE INDEX "smartcar_webhooks_isActive_idx" ON "smartcar_webhooks"("isActive");

-- AddForeignKey
ALTER TABLE "smartcar_vehicles" ADD CONSTRAINT "smartcar_vehicles_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "smartcar_vehicles" ADD CONSTRAINT "smartcar_vehicles_carId_fkey" FOREIGN KEY ("carId") REFERENCES "RentalCar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "smartcar_webhooks" ADD CONSTRAINT "smartcar_webhooks_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "smartcar_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
