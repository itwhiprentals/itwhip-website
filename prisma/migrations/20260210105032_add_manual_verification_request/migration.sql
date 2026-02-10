-- CreateTable
CREATE TABLE "ManualVerificationRequest" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "selfieUrl" TEXT NOT NULL,
    "dlFrontUrl" TEXT,
    "dlBackUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "bookingCarId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManualVerificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ManualVerificationRequest_email_idx" ON "ManualVerificationRequest"("email");

-- CreateIndex
CREATE INDEX "ManualVerificationRequest_status_idx" ON "ManualVerificationRequest"("status");
