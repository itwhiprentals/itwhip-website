-- Add Partner Social Media & Website fields
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerWebsite" TEXT;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerInstagram" TEXT;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerFacebook" TEXT;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerTwitter" TEXT;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerLinkedIn" TEXT;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerTikTok" TEXT;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerYouTube" TEXT;

-- Add Partner Contact Visibility Settings
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerShowEmail" BOOLEAN DEFAULT true;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerShowPhone" BOOLEAN DEFAULT true;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerShowWebsite" BOOLEAN DEFAULT true;
