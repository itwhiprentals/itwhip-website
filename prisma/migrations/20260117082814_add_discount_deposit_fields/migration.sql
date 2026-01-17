-- AlterTable
ALTER TABLE "RentalCar" ADD COLUMN     "customDepositAmount" DOUBLE PRECISION,
ADD COLUMN     "discountPercent" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "RentalHost" ADD COLUMN     "globalDiscountPercent" DOUBLE PRECISION DEFAULT 0;
