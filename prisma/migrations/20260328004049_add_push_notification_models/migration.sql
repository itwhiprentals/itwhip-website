-- CreateTable
CREATE TABLE "DevicePushToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hostId" TEXT,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DevicePushToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DevicePushToken_token_key" ON "DevicePushToken"("token");

-- CreateIndex
CREATE INDEX "DevicePushToken_userId_idx" ON "DevicePushToken"("userId");

-- CreateIndex
CREATE INDEX "DevicePushToken_hostId_idx" ON "DevicePushToken"("hostId");

-- CreateIndex
CREATE INDEX "PushNotification_userId_read_idx" ON "PushNotification"("userId", "read");

-- CreateIndex
CREATE INDEX "PushNotification_userId_createdAt_idx" ON "PushNotification"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "DevicePushToken" ADD CONSTRAINT "DevicePushToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushNotification" ADD CONSTRAINT "PushNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
