-- CreateTable
CREATE TABLE "bouncie_devices" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "carId" TEXT,
    "deviceImei" TEXT NOT NULL,
    "authorizationCode" TEXT NOT NULL,
    "apiKey" TEXT,
    "nickname" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "vin" TEXT,
    "make" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "lastSyncAt" TIMESTAMP(3),
    "lastLocation" JSONB,
    "lastOdometer" DOUBLE PRECISION,
    "lastFuel" DOUBLE PRECISION,
    "lastBatteryVoltage" DOUBLE PRECISION,
    "lastSpeed" DOUBLE PRECISION,
    "lastEngineStatus" TEXT,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disconnectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bouncie_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bouncie_geofences" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "bouncieGeofenceId" TEXT,
    "name" TEXT NOT NULL,
    "geoType" TEXT NOT NULL DEFAULT 'circle',
    "centerLat" DOUBLE PRECISION,
    "centerLng" DOUBLE PRECISION,
    "radiusMeters" INTEGER,
    "polygonPoints" JSONB,
    "alertOnEnter" BOOLEAN NOT NULL DEFAULT true,
    "alertOnExit" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bouncie_geofences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bouncie_trips" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "bouncieTripId" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "startLat" DOUBLE PRECISION NOT NULL,
    "startLng" DOUBLE PRECISION NOT NULL,
    "endLat" DOUBLE PRECISION,
    "endLng" DOUBLE PRECISION,
    "startAddress" TEXT,
    "endAddress" TEXT,
    "distanceMiles" DOUBLE PRECISION,
    "durationMinutes" INTEGER,
    "maxSpeedMph" INTEGER,
    "avgSpeedMph" INTEGER,
    "hardBrakes" INTEGER NOT NULL DEFAULT 0,
    "rapidAccelerations" INTEGER NOT NULL DEFAULT 0,
    "idleMinutes" INTEGER NOT NULL DEFAULT 0,
    "fuelUsedGallons" DOUBLE PRECISION,
    "fuelEconomyMpg" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bouncie_trips_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bouncie_devices_carId_key" ON "bouncie_devices"("carId");

-- CreateIndex
CREATE UNIQUE INDEX "bouncie_devices_deviceImei_key" ON "bouncie_devices"("deviceImei");

-- CreateIndex
CREATE INDEX "bouncie_devices_hostId_idx" ON "bouncie_devices"("hostId");

-- CreateIndex
CREATE INDEX "bouncie_devices_carId_idx" ON "bouncie_devices"("carId");

-- CreateIndex
CREATE INDEX "bouncie_devices_deviceImei_idx" ON "bouncie_devices"("deviceImei");

-- CreateIndex
CREATE INDEX "bouncie_devices_isActive_idx" ON "bouncie_devices"("isActive");

-- CreateIndex
CREATE INDEX "bouncie_geofences_deviceId_idx" ON "bouncie_geofences"("deviceId");

-- CreateIndex
CREATE INDEX "bouncie_geofences_isActive_idx" ON "bouncie_geofences"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "bouncie_trips_bouncieTripId_key" ON "bouncie_trips"("bouncieTripId");

-- CreateIndex
CREATE INDEX "bouncie_trips_deviceId_idx" ON "bouncie_trips"("deviceId");

-- CreateIndex
CREATE INDEX "bouncie_trips_startTime_idx" ON "bouncie_trips"("startTime");

-- CreateIndex
CREATE INDEX "bouncie_trips_bouncieTripId_idx" ON "bouncie_trips"("bouncieTripId");

-- AddForeignKey
ALTER TABLE "bouncie_devices" ADD CONSTRAINT "bouncie_devices_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bouncie_devices" ADD CONSTRAINT "bouncie_devices_carId_fkey" FOREIGN KEY ("carId") REFERENCES "RentalCar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bouncie_geofences" ADD CONSTRAINT "bouncie_geofences_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "bouncie_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bouncie_trips" ADD CONSTRAINT "bouncie_trips_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "bouncie_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
