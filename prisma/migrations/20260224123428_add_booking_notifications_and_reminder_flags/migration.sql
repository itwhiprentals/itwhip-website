-- AlterTable
ALTER TABLE "RentalBooking" ADD COLUMN     "pickupReminderSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "returnReminder24hSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "returnReminder3hSent" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "BookingNotification" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "recipientType" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "readAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingNotification_recipientId_recipientType_readAt_idx" ON "BookingNotification"("recipientId", "recipientType", "readAt");

-- CreateIndex
CREATE INDEX "BookingNotification_userId_readAt_idx" ON "BookingNotification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "BookingNotification_bookingId_idx" ON "BookingNotification"("bookingId");

-- AddForeignKey
ALTER TABLE "BookingNotification" ADD CONSTRAINT "BookingNotification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
