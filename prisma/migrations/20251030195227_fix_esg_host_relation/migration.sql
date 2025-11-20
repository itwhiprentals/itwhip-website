-- DropForeignKey
ALTER TABLE "public"."HostESGProfile" DROP CONSTRAINT "HostESGProfile_hostId_fkey";

-- AddForeignKey
ALTER TABLE "HostESGProfile" ADD CONSTRAINT "HostESGProfile_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "RentalHost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
