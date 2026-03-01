-- AlterTable
ALTER TABLE "RentalBooking" ADD COLUMN     "isWelcomeDiscount" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "platformFeeRate" DECIMAL(4,3);

-- AlterTable
ALTER TABLE "RentalHost" ADD COLUMN     "commissionTier" TEXT NOT NULL DEFAULT 'STANDARD',
ADD COLUMN     "deductibleBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "outstandingBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "paymentMethodOnFile" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "welcomeDiscountAppliedAt" TIMESTAMP(3),
ADD COLUMN     "welcomeDiscountBookingId" TEXT,
ADD COLUMN     "welcomeDiscountUsed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ReviewerProfile" ADD COLUMN     "manualVerificationDate" TIMESTAMP(3),
ADD COLUMN     "manualVerificationHostId" TEXT,
ADD COLUMN     "manuallyVerifiedByHost" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "HostDeductible" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "bookingId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "deductedFromPayoutId" TEXT,
    "deductedAt" TIMESTAMP(3),
    "waivedAt" TIMESTAMP(3),
    "waivedBy" TEXT,
    "waivedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostDeductible_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HostDeductible_hostId_idx" ON "HostDeductible"("hostId");

-- CreateIndex
CREATE INDEX "HostDeductible_status_idx" ON "HostDeductible"("status");

-- CreateIndex
CREATE INDEX "HostDeductible_bookingId_idx" ON "HostDeductible"("bookingId");

-- AddForeignKey
ALTER TABLE "HostDeductible" ADD CONSTRAINT "HostDeductible_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostDeductible" ADD CONSTRAINT "HostDeductible_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
