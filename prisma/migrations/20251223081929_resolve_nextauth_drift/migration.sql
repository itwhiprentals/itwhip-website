-- AlterTable
-- NextAuth added these fields outside of Prisma migrations
-- This migration acknowledges their existence to resolve drift

-- Account table already exists (created by NextAuth)
-- This migration just documents it in Prisma's migration history

-- ALTER TABLE "User" ADD COLUMN "image" TEXT;
-- (Already exists - added by NextAuth)

-- No actual changes needed - this migration resolves drift only
