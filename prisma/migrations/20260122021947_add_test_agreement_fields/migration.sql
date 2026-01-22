/*
  Warnings:

  - A unique constraint covering the columns `[testAgreementToken]` on the table `host_prospects` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "host_prospects" ADD COLUMN     "testAgreementExpiresAt" TIMESTAMP(3),
ADD COLUMN     "testAgreementSentAt" TIMESTAMP(3),
ADD COLUMN     "testAgreementSignedAt" TIMESTAMP(3),
ADD COLUMN     "testAgreementToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "host_prospects_testAgreementToken_key" ON "host_prospects"("testAgreementToken");
