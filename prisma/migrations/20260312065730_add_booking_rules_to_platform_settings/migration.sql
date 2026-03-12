-- AlterTable
ALTER TABLE "platform_settings" ADD COLUMN     "defaultAdvanceNotice" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "defaultTripBuffer" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "platformMinAdvanceNotice" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "platformMinTripBuffer" INTEGER NOT NULL DEFAULT 2;
