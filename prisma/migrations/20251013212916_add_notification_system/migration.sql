-- AlterTable
ALTER TABLE "PaymentMethod" ADD COLUMN     "userId" TEXT,
ALTER COLUMN "hostId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ReviewerProfile" ADD COLUMN     "address" TEXT,
ADD COLUMN     "profileCompletion" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "NotificationDismissal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationType" TEXT NOT NULL,
    "dismissedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dismissCount" INTEGER NOT NULL DEFAULT 1,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "NotificationDismissal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificationDismissal_userId_idx" ON "NotificationDismissal"("userId");

-- CreateIndex
CREATE INDEX "NotificationDismissal_dismissedAt_idx" ON "NotificationDismissal"("dismissedAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationDismissal_userId_notificationType_key" ON "NotificationDismissal"("userId", "notificationType");

-- CreateIndex
CREATE INDEX "PaymentMethod_userId_idx" ON "PaymentMethod"("userId");

-- AddForeignKey
ALTER TABLE "NotificationDismissal" ADD CONSTRAINT "NotificationDismissal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
