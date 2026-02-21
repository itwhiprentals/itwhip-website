-- AlterTable
ALTER TABLE "choe_ai_conversations" ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedEmail" TEXT;

-- CreateTable
CREATE TABLE "choe_ai_otp_verifications" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "choe_ai_otp_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "choe_ai_otp_verifications_sessionId_idx" ON "choe_ai_otp_verifications"("sessionId");

-- CreateIndex
CREATE INDEX "choe_ai_otp_verifications_email_expiresAt_idx" ON "choe_ai_otp_verifications"("email", "expiresAt");
