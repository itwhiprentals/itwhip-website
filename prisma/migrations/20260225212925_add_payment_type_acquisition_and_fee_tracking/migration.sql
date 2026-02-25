-- AlterTable
ALTER TABLE "RentalBooking" ADD COLUMN     "paymentType" TEXT;

-- AlterTable
ALTER TABLE "RentalHost" ADD COLUMN     "acquisitionChannel" TEXT,
ADD COLUMN     "acquisitionDate" TIMESTAMP(3),
ADD COLUMN     "acquisitionSource" TEXT,
ADD COLUMN     "firstBookingDate" TIMESTAMP(3),
ADD COLUMN     "firstBookingEarnings" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "PlatformFeeOwed" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "deductedFromPayoutId" TEXT,
    "deductedAt" TIMESTAMP(3),
    "waivedAt" TIMESTAMP(3),
    "waivedBy" TEXT,
    "waivedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformFeeOwed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlatformFeeOwed_hostId_idx" ON "PlatformFeeOwed"("hostId");

-- CreateIndex
CREATE INDEX "PlatformFeeOwed_bookingId_idx" ON "PlatformFeeOwed"("bookingId");

-- CreateIndex
CREATE INDEX "PlatformFeeOwed_status_idx" ON "PlatformFeeOwed"("status");

-- CreateIndex
CREATE INDEX "RentalBooking_paymentType_idx" ON "RentalBooking"("paymentType");

-- AddForeignKey
ALTER TABLE "PlatformFeeOwed" ADD CONSTRAINT "PlatformFeeOwed_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformFeeOwed" ADD CONSTRAINT "PlatformFeeOwed_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
