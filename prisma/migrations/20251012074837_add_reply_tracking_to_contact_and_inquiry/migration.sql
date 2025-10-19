-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN     "replies" JSONB DEFAULT '[]',
ADD COLUMN     "replyCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "HostInquiry" ADD COLUMN     "replies" JSONB DEFAULT '[]',
ADD COLUMN     "replyCount" INTEGER NOT NULL DEFAULT 0;
