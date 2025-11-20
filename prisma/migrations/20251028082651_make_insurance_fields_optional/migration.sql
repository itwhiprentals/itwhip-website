/*
  Warnings:

  - You are about to drop the column `damagePhotos` on the `Claim` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Claim" DROP COLUMN "damagePhotos",
ADD COLUMN     "damagePhotosLegacy" JSONB;

-- AlterTable
ALTER TABLE "public"."RentalCar" ADD COLUMN     "annualMileage" INTEGER DEFAULT 12000,
ADD COLUMN     "garageAddress" TEXT,
ADD COLUMN     "garageCity" TEXT,
ADD COLUMN     "garageState" TEXT,
ADD COLUMN     "garageZip" TEXT,
ADD COLUMN     "hasAlarm" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasImmobilizer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasLien" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasTracking" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isModified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lienholderName" TEXT,
ADD COLUMN     "modifications" TEXT,
ADD COLUMN     "primaryUse" TEXT NOT NULL DEFAULT 'Rental',
ADD COLUMN     "registeredOwner" TEXT,
ADD COLUMN     "titleStatus" TEXT NOT NULL DEFAULT 'Clean';

-- CreateTable
CREATE TABLE "public"."ClaimEdit" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "fieldChanged" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "editedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedBy" TEXT NOT NULL,
    "editedByType" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimEdit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClaimDamagePhoto" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimDamagePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClaimEdit_claimId_idx" ON "public"."ClaimEdit"("claimId");

-- CreateIndex
CREATE INDEX "ClaimEdit_editedBy_idx" ON "public"."ClaimEdit"("editedBy");

-- CreateIndex
CREATE INDEX "ClaimEdit_editedAt_idx" ON "public"."ClaimEdit"("editedAt");

-- CreateIndex
CREATE INDEX "ClaimEdit_fieldChanged_idx" ON "public"."ClaimEdit"("fieldChanged");

-- CreateIndex
CREATE INDEX "ClaimDamagePhoto_claimId_idx" ON "public"."ClaimDamagePhoto"("claimId");

-- CreateIndex
CREATE INDEX "ClaimDamagePhoto_uploadedBy_idx" ON "public"."ClaimDamagePhoto"("uploadedBy");

-- CreateIndex
CREATE INDEX "ClaimDamagePhoto_uploadedAt_idx" ON "public"."ClaimDamagePhoto"("uploadedAt");

-- CreateIndex
CREATE INDEX "ClaimDamagePhoto_deletedAt_idx" ON "public"."ClaimDamagePhoto"("deletedAt");

-- CreateIndex
CREATE INDEX "RentalBooking_tripCompletedBy_idx" ON "public"."RentalBooking"("tripCompletedBy");

-- CreateIndex
CREATE INDEX "RentalBooking_adminCompletedById_idx" ON "public"."RentalBooking"("adminCompletedById");

-- CreateIndex
CREATE INDEX "RentalCar_titleStatus_idx" ON "public"."RentalCar"("titleStatus");

-- CreateIndex
CREATE INDEX "RentalCar_hasAlarm_idx" ON "public"."RentalCar"("hasAlarm");

-- CreateIndex
CREATE INDEX "RentalCar_hasTracking_idx" ON "public"."RentalCar"("hasTracking");

-- CreateIndex
CREATE INDEX "RentalCar_isModified_idx" ON "public"."RentalCar"("isModified");

-- CreateIndex
CREATE INDEX "RentalCar_hasLien_idx" ON "public"."RentalCar"("hasLien");

-- CreateIndex
CREATE INDEX "RentalCar_registeredOwner_idx" ON "public"."RentalCar"("registeredOwner");

-- AddForeignKey
ALTER TABLE "public"."ClaimEdit" ADD CONSTRAINT "ClaimEdit_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "public"."Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClaimDamagePhoto" ADD CONSTRAINT "ClaimDamagePhoto_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "public"."Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;
