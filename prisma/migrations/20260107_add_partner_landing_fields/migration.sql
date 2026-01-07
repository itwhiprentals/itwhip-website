-- Add Partner Landing Page Customization fields
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerHeroTitle" TEXT;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerHeroSubtitle" TEXT;
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "partnerPrimaryColor" TEXT;
