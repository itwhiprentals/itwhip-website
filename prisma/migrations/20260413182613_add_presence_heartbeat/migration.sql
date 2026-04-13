-- CreateTable
CREATE TABLE "presence" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "userId" TEXT,
    "role" TEXT NOT NULL DEFAULT 'anonymous',
    "ip" TEXT,
    "path" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "presence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "presence_lastSeen_idx" ON "presence"("lastSeen");

-- CreateIndex
CREATE INDEX "presence_role_idx" ON "presence"("role");
