-- AlterTable
ALTER TABLE "choe_ai_settings" ADD COLUMN     "batchAnalyticsEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "extendedThinkingEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "preferNoDeposit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "preferRideshare" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showVehicleTypeBadges" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "streamingEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "toolUseEnabled" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "modelId" SET DEFAULT 'claude-haiku-4-5-20251001';
