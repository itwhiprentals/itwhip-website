-- AlterTable
ALTER TABLE "RentalHost" ADD COLUMN     "pendingBankAccountId" TEXT,
ADD COLUMN     "pendingBankActivatesAt" TIMESTAMP(3),
ADD COLUMN     "pendingBankLast4" TEXT,
ADD COLUMN     "pendingBankName" TEXT,
ADD COLUMN     "pendingBankType" TEXT;
