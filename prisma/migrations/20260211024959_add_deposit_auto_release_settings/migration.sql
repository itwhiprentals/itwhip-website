-- AlterTable
ALTER TABLE "platform_settings" ADD COLUMN     "depositAutoReleaseDays" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "depositAutoReleaseEnabled" BOOLEAN NOT NULL DEFAULT true;
