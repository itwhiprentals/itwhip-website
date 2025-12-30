-- AddColumn
ALTER TABLE "HostNotification" ADD COLUMN IF NOT EXISTS "metadata" JSONB;
