-- AlterTable
ALTER TABLE "public"."Claim" ADD COLUMN     "estimatedSpeed" INTEGER,
ADD COLUMN     "incidentDescription" TEXT,
ADD COLUMN     "injuries" JSONB,
ADD COLUMN     "odometerAtIncident" INTEGER,
ADD COLUMN     "officerBadge" TEXT,
ADD COLUMN     "officerName" TEXT,
ADD COLUMN     "otherParty" JSONB,
ADD COLUMN     "otherPartyInvolved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "policeDepartment" TEXT,
ADD COLUMN     "policeReportDate" TIMESTAMP(3),
ADD COLUMN     "policeReportFiled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "roadDescription" TEXT,
ADD COLUMN     "trafficConditions" TEXT,
ADD COLUMN     "vehicleDrivable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "vehicleLocation" TEXT,
ADD COLUMN     "wasPoliceContacted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "weatherDescription" TEXT,
ADD COLUMN     "wereInjuries" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Claim_wasPoliceContacted_idx" ON "public"."Claim"("wasPoliceContacted");

-- CreateIndex
CREATE INDEX "Claim_otherPartyInvolved_idx" ON "public"."Claim"("otherPartyInvolved");

-- CreateIndex
CREATE INDEX "Claim_wereInjuries_idx" ON "public"."Claim"("wereInjuries");

-- CreateIndex
CREATE INDEX "Claim_vehicleDrivable_idx" ON "public"."Claim"("vehicleDrivable");
