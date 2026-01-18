-- AlterTable
ALTER TABLE "RentalHost" ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "previousLoginAt" TIMESTAMP(3);
