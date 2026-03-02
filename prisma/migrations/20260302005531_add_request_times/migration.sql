-- AlterTable
ALTER TABLE "reservation_requests" ADD COLUMN     "endTime" TEXT DEFAULT '10:00',
ADD COLUMN     "startTime" TEXT DEFAULT '10:00';
