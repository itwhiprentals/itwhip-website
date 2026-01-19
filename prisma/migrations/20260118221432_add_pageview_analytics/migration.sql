-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "queryParams" TEXT,
    "userId" TEXT,
    "sessionId" TEXT,
    "visitorId" TEXT,
    "userAgent" TEXT NOT NULL,
    "device" TEXT,
    "browser" TEXT,
    "browserVer" TEXT,
    "os" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "loadTime" INTEGER,
    "eventType" TEXT NOT NULL DEFAULT 'pageview',
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageView_path_idx" ON "PageView"("path");

-- CreateIndex
CREATE INDEX "PageView_timestamp_idx" ON "PageView"("timestamp");

-- CreateIndex
CREATE INDEX "PageView_userId_idx" ON "PageView"("userId");

-- CreateIndex
CREATE INDEX "PageView_country_idx" ON "PageView"("country");

-- CreateIndex
CREATE INDEX "PageView_visitorId_idx" ON "PageView"("visitorId");

-- CreateIndex
CREATE INDEX "PageView_eventType_idx" ON "PageView"("eventType");

-- CreateIndex
CREATE INDEX "PageView_path_timestamp_idx" ON "PageView"("path", "timestamp");

-- CreateIndex
CREATE INDEX "PageView_country_timestamp_idx" ON "PageView"("country", "timestamp");

-- CreateIndex
CREATE INDEX "PageView_device_timestamp_idx" ON "PageView"("device", "timestamp");
