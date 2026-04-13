-- AlterTable
ALTER TABLE "PageView" ADD COLUMN     "gpsAccuracy" DOUBLE PRECISION,
ADD COLUMN     "gpsAddress" TEXT,
ADD COLUMN     "gpsLatitude" DOUBLE PRECISION,
ADD COLUMN     "gpsLongitude" DOUBLE PRECISION;
