-- CreateEnum
CREATE TYPE "GovernmentIdType" AS ENUM ('PASSPORT', 'STATE_ID', 'NATIONAL_ID', 'DRIVERS_LICENSE');

-- CreateEnum
CREATE TYPE "MemberTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');

-- AlterTable
ALTER TABLE "ReviewerProfile" ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "canInstantBook" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "documentVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "documentVerifiedBy" TEXT,
ADD COLUMN     "documentsVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "driversLicenseUrl" TEXT,
ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "emergencyContactRelation" TEXT,
ADD COLUMN     "fullyVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "governmentIdType" "GovernmentIdType",
ADD COLUMN     "governmentIdUrl" TEXT,
ADD COLUMN     "insuranceCardUrl" TEXT,
ADD COLUMN     "insuranceExpires" TIMESTAMP(3),
ADD COLUMN     "insurancePolicyNumber" TEXT,
ADD COLUMN     "insuranceProvider" TEXT,
ADD COLUMN     "insuranceVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "insuranceVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "memberTier" "MemberTier" NOT NULL DEFAULT 'BRONZE',
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "preferredCurrency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "selfieUrl" TEXT,
ADD COLUMN     "smsNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "totalTrips" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "zipCode" TEXT;

-- CreateIndex
CREATE INDEX "ReviewerProfile_documentsVerified_idx" ON "ReviewerProfile"("documentsVerified");

-- CreateIndex
CREATE INDEX "ReviewerProfile_fullyVerified_idx" ON "ReviewerProfile"("fullyVerified");

-- CreateIndex
CREATE INDEX "ReviewerProfile_canInstantBook_idx" ON "ReviewerProfile"("canInstantBook");

-- CreateIndex
CREATE INDEX "ReviewerProfile_memberTier_idx" ON "ReviewerProfile"("memberTier");
