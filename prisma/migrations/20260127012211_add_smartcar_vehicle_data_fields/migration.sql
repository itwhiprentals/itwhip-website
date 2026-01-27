-- AlterTable
ALTER TABLE "smartcar_vehicles" ADD COLUMN     "lastChargeState" JSONB,
ADD COLUMN     "lastOilLife" DOUBLE PRECISION,
ADD COLUMN     "lastTirePressure" JSONB;
