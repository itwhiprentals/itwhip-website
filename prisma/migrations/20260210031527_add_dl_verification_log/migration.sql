-- CreateTable
CREATE TABLE "dl_verification_logs" (
    "id" TEXT NOT NULL,
    "guestEmail" TEXT,
    "guestName" TEXT,
    "frontImageUrl" TEXT NOT NULL,
    "backImageUrl" TEXT,
    "selfieUrl" TEXT,
    "passed" BOOLEAN NOT NULL,
    "score" DOUBLE PRECISION,
    "recommendation" TEXT,
    "result" JSONB,
    "criticalFlags" JSONB,
    "infoFlags" JSONB,
    "extractedName" TEXT,
    "extractedState" TEXT,
    "model" TEXT,
    "bookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dl_verification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dl_verification_logs_guestEmail_idx" ON "dl_verification_logs"("guestEmail");

-- CreateIndex
CREATE INDEX "dl_verification_logs_createdAt_idx" ON "dl_verification_logs"("createdAt");

-- CreateIndex
CREATE INDEX "dl_verification_logs_bookingId_idx" ON "dl_verification_logs"("bookingId");

-- AddForeignKey
ALTER TABLE "dl_verification_logs" ADD CONSTRAINT "dl_verification_logs_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
