-- CreateTable
CREATE TABLE "email_preferences" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "unsubscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_preferences_email_key" ON "email_preferences"("email");
