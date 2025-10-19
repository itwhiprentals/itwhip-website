-- CreateTable
CREATE TABLE "AppealNotification" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "appealId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "dismissedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppealNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AppealNotification_guestId_seen_idx" ON "AppealNotification"("guestId", "seen");
