-- CreateTable
CREATE TABLE "sms_logs" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "type" TEXT NOT NULL,
    "twilioSid" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "bookingId" TEXT,
    "hostId" TEXT,
    "guestId" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "segments" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "sms_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_logs" (
    "id" TEXT NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'INBOUND',
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "callSid" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'initiated',
    "duration" INTEGER,
    "recordingUrl" TEXT,
    "recordingSid" TEXT,
    "transcription" TEXT,
    "callerType" TEXT,
    "callerId" TEXT,
    "bookingId" TEXT,
    "menuPath" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "call_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sms_logs_twilioSid_key" ON "sms_logs"("twilioSid");

-- CreateIndex
CREATE INDEX "sms_logs_bookingId_idx" ON "sms_logs"("bookingId");

-- CreateIndex
CREATE INDEX "sms_logs_type_idx" ON "sms_logs"("type");

-- CreateIndex
CREATE INDEX "sms_logs_createdAt_idx" ON "sms_logs"("createdAt");

-- CreateIndex
CREATE INDEX "sms_logs_twilioSid_idx" ON "sms_logs"("twilioSid");

-- CreateIndex
CREATE INDEX "sms_logs_to_idx" ON "sms_logs"("to");

-- CreateIndex
CREATE UNIQUE INDEX "call_logs_callSid_key" ON "call_logs"("callSid");

-- CreateIndex
CREATE INDEX "call_logs_callSid_idx" ON "call_logs"("callSid");

-- CreateIndex
CREATE INDEX "call_logs_from_idx" ON "call_logs"("from");

-- CreateIndex
CREATE INDEX "call_logs_bookingId_idx" ON "call_logs"("bookingId");

-- CreateIndex
CREATE INDEX "call_logs_createdAt_idx" ON "call_logs"("createdAt");

-- CreateIndex
CREATE INDEX "call_logs_callerType_callerId_idx" ON "call_logs"("callerType", "callerId");

-- AddForeignKey
ALTER TABLE "sms_logs" ADD CONSTRAINT "sms_logs_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
