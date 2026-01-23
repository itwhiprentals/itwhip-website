-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('GUEST_INVITE', 'HOST_INVITE', 'PASSWORD_RESET', 'EMAIL_VERIFICATION', 'BOOKING_CONFIRMATION', 'BOOKING_REMINDER', 'PAYMENT_RECEIPT', 'REFUND_NOTIFICATION', 'IDENTITY_VERIFICATION', 'WELCOME', 'NEWSLETTER', 'SUPPORT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED');

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "recipientName" TEXT,
    "subject" TEXT NOT NULL,
    "emailType" "EmailType" NOT NULL,
    "relatedType" TEXT,
    "relatedId" TEXT,
    "verificationToken" TEXT,
    "verificationExp" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "status" "EmailStatus" NOT NULL DEFAULT 'QUEUED',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "bounceReason" TEXT,
    "messageId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_logs_referenceId_key" ON "email_logs"("referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "email_logs_verificationToken_key" ON "email_logs"("verificationToken");

-- CreateIndex
CREATE INDEX "email_logs_recipientEmail_idx" ON "email_logs"("recipientEmail");

-- CreateIndex
CREATE INDEX "email_logs_emailType_idx" ON "email_logs"("emailType");

-- CreateIndex
CREATE INDEX "email_logs_status_idx" ON "email_logs"("status");

-- CreateIndex
CREATE INDEX "email_logs_relatedType_relatedId_idx" ON "email_logs"("relatedType", "relatedId");

-- CreateIndex
CREATE INDEX "email_logs_verificationToken_idx" ON "email_logs"("verificationToken");

-- CreateIndex
CREATE INDEX "email_logs_createdAt_idx" ON "email_logs"("createdAt");
