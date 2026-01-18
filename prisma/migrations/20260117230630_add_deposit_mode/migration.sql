-- AlterTable
ALTER TABLE "RentalCar" ADD COLUMN     "noDeposit" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "RentalHost" ADD COLUMN     "depositMode" TEXT NOT NULL DEFAULT 'global',
ADD COLUMN     "makeDeposits" JSONB;
