-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "adminId" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "guestId" TEXT,
ADD COLUMN     "hostId" TEXT,
ADD COLUMN     "newValue" TEXT,
ADD COLUMN     "oldValue" TEXT,
ADD COLUMN     "severity" TEXT DEFAULT 'INFO',
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "RentalCar" ADD COLUMN     "insuranceExpiryDate" TIMESTAMP(3),
ADD COLUMN     "insuranceVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "insuranceVerifiedBy" TEXT,
ADD COLUMN     "registrationExpiryDate" TIMESTAMP(3),
ADD COLUMN     "registrationVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "registrationVerifiedBy" TEXT,
ADD COLUMN     "titleVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "titleVerifiedBy" TEXT,
ADD COLUMN     "vinVerificationMethod" TEXT,
ADD COLUMN     "vinVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "vinVerifiedBy" TEXT;

-- AlterTable
ALTER TABLE "RentalCarPhoto" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "deviceMake" TEXT,
ADD COLUMN     "deviceModel" TEXT,
ADD COLUMN     "gpsLatitude" DOUBLE PRECISION,
ADD COLUMN     "gpsLongitude" DOUBLE PRECISION,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "photoContext" TEXT,
ADD COLUMN     "photoHash" TEXT,
ADD COLUMN     "photoTimestamp" TIMESTAMP(3),
ADD COLUMN     "relatedClaimId" TEXT,
ADD COLUMN     "uploadedBy" TEXT,
ADD COLUMN     "uploadedByType" TEXT,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedBy" TEXT;

-- AlterTable
ALTER TABLE "VehicleServiceRecord" ADD COLUMN     "addedBy" TEXT DEFAULT 'SYSTEM',
ADD COLUMN     "addedByType" TEXT DEFAULT 'HOST';

-- CreateIndex
CREATE INDEX "ActivityLog_adminId_idx" ON "ActivityLog"("adminId");

-- CreateIndex
CREATE INDEX "ActivityLog_hostId_idx" ON "ActivityLog"("hostId");

-- CreateIndex
CREATE INDEX "ActivityLog_severity_idx" ON "ActivityLog"("severity");

-- CreateIndex
CREATE INDEX "ActivityLog_category_idx" ON "ActivityLog"("category");

-- CreateIndex
CREATE INDEX "RentalCar_vinVerifiedBy_idx" ON "RentalCar"("vinVerifiedBy");

-- CreateIndex
CREATE INDEX "RentalCar_registrationVerifiedBy_idx" ON "RentalCar"("registrationVerifiedBy");

-- CreateIndex
CREATE INDEX "RentalCar_insuranceVerifiedBy_idx" ON "RentalCar"("insuranceVerifiedBy");

-- CreateIndex
CREATE INDEX "RentalCarPhoto_uploadedBy_idx" ON "RentalCarPhoto"("uploadedBy");

-- CreateIndex
CREATE INDEX "RentalCarPhoto_verified_idx" ON "RentalCarPhoto"("verified");

-- CreateIndex
CREATE INDEX "RentalCarPhoto_photoHash_idx" ON "RentalCarPhoto"("photoHash");

-- CreateIndex
CREATE INDEX "RentalCarPhoto_deletedAt_idx" ON "RentalCarPhoto"("deletedAt");

-- CreateIndex
CREATE INDEX "RentalCarPhoto_relatedClaimId_idx" ON "RentalCarPhoto"("relatedClaimId");

-- CreateIndex
CREATE INDEX "RentalCarPhoto_photoContext_idx" ON "RentalCarPhoto"("photoContext");

-- CreateIndex
CREATE INDEX "VehicleServiceRecord_addedBy_idx" ON "VehicleServiceRecord"("addedBy");

-- CreateIndex
CREATE INDEX "VehicleServiceRecord_addedByType_idx" ON "VehicleServiceRecord"("addedByType");
