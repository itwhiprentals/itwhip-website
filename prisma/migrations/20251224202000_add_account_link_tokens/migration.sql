-- AlterEnum: Add GUEST_CONFIRMED to MergeStatus
ALTER TYPE "MergeStatus" ADD VALUE 'GUEST_CONFIRMED';

-- AlterTable: Add link tokens and guestConfirmedAt to AccountLinkRequest
ALTER TABLE "AccountLinkRequest" ADD COLUMN "guestLinkToken" TEXT;
ALTER TABLE "AccountLinkRequest" ADD COLUMN "hostLinkToken" TEXT;
ALTER TABLE "AccountLinkRequest" ADD COLUMN "guestConfirmedAt" TIMESTAMP(3);

-- CreateIndex: Unique constraint on guestLinkToken
CREATE UNIQUE INDEX "AccountLinkRequest_guestLinkToken_key" ON "AccountLinkRequest"("guestLinkToken");

-- CreateIndex: Unique constraint on hostLinkToken
CREATE UNIQUE INDEX "AccountLinkRequest_hostLinkToken_key" ON "AccountLinkRequest"("hostLinkToken");

-- CreateIndex: Index on guestLinkToken for faster lookups
CREATE INDEX "AccountLinkRequest_guestLinkToken_idx" ON "AccountLinkRequest"("guestLinkToken");

-- CreateIndex: Index on hostLinkToken for faster lookups
CREATE INDEX "AccountLinkRequest_hostLinkToken_idx" ON "AccountLinkRequest"("hostLinkToken");
