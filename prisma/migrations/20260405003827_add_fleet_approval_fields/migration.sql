-- AlterTable
ALTER TABLE "RentalCar" ADD COLUMN     "fleetApprovalDate" TIMESTAMP(3),
ADD COLUMN     "fleetApprovalNotes" TEXT,
ADD COLUMN     "fleetApprovalStatus" TEXT DEFAULT 'PENDING',
ADD COLUMN     "fleetApprovedBy" TEXT;

-- CreateIndex
CREATE INDEX "RentalCar_fleetApprovalStatus_idx" ON "RentalCar"("fleetApprovalStatus");
