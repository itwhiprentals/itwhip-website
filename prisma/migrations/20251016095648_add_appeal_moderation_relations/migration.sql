-- CreateIndex
CREATE INDEX "AppealNotification_appealId_idx" ON "AppealNotification"("appealId");

-- AddForeignKey
ALTER TABLE "AppealNotification" ADD CONSTRAINT "AppealNotification_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "ReviewerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppealNotification" ADD CONSTRAINT "AppealNotification_appealId_fkey" FOREIGN KEY ("appealId") REFERENCES "GuestAppeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
