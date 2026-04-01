/*
  Warnings:

  - The values [SEED] on the enum `ReviewSource` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReviewSource_new" AS ENUM ('GUEST', 'MANAGED', 'ADMIN');
ALTER TABLE "public"."RentalReview" ALTER COLUMN "source" DROP DEFAULT;
ALTER TABLE "RentalReview" ALTER COLUMN "source" TYPE "ReviewSource_new" USING ("source"::text::"ReviewSource_new");
ALTER TYPE "ReviewSource" RENAME TO "ReviewSource_old";
ALTER TYPE "ReviewSource_new" RENAME TO "ReviewSource";
DROP TYPE "public"."ReviewSource_old";
ALTER TABLE "RentalReview" ALTER COLUMN "source" SET DEFAULT 'GUEST';
COMMIT;
