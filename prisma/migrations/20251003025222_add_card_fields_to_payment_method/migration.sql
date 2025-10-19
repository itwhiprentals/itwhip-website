-- AlterTable
ALTER TABLE "PaymentMethod" ADD COLUMN     "expiryMonth" INTEGER,
ADD COLUMN     "expiryYear" INTEGER,
ADD COLUMN     "holderName" TEXT,
ADD COLUMN     "status" TEXT DEFAULT 'active';
