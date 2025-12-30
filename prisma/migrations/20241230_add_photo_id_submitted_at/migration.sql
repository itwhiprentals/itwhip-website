-- Add photoIdSubmittedAt field to track when user clicked Submit
ALTER TABLE "RentalHost" ADD COLUMN IF NOT EXISTS "photoIdSubmittedAt" TIMESTAMP(3);
