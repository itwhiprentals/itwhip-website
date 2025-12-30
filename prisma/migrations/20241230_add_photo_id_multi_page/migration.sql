-- AddColumns for multi-page Photo ID support
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "photoIdType" TEXT;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "photoIdUrls" JSONB;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "photoIdVerified" BOOLEAN DEFAULT false;
