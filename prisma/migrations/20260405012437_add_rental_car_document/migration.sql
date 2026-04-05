-- CreateTable
CREATE TABLE "RentalCarDocument" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "fileName" TEXT,
    "mimeType" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "uploadedByType" TEXT NOT NULL DEFAULT 'HOST',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RentalCarDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RentalCarDocument_carId_idx" ON "RentalCarDocument"("carId");

-- CreateIndex
CREATE INDEX "RentalCarDocument_type_idx" ON "RentalCarDocument"("type");

-- CreateIndex
CREATE INDEX "RentalCarDocument_uploadedBy_idx" ON "RentalCarDocument"("uploadedBy");

-- AddForeignKey
ALTER TABLE "RentalCarDocument" ADD CONSTRAINT "RentalCarDocument_carId_fkey" FOREIGN KEY ("carId") REFERENCES "RentalCar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
