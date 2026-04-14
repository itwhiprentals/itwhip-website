-- AlterTable
ALTER TABLE "presence" ADD COLUMN     "funnelStage" TEXT;

-- CreateIndex
CREATE INDEX "presence_funnelStage_idx" ON "presence"("funnelStage");
