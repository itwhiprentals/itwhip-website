-- AlterTable
ALTER TABLE "PageView" ADD COLUMN     "asn" TEXT,
ADD COLUMN     "ip" TEXT,
ADD COLUMN     "isHosting" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isProxy" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVpn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isp" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "org" TEXT,
ADD COLUMN     "riskScore" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "PageView_ip_idx" ON "PageView"("ip");

-- CreateIndex
CREATE INDEX "PageView_city_timestamp_idx" ON "PageView"("city", "timestamp");

-- CreateIndex
CREATE INDEX "PageView_riskScore_idx" ON "PageView"("riskScore");
