-- AlterTable
ALTER TABLE "RentalHost" ADD COLUMN     "agreementValidationScore" INTEGER,
ADD COLUMN     "agreementValidationSummary" TEXT,
ADD COLUMN     "hostAgreementName" TEXT,
ADD COLUMN     "hostAgreementSections" JSONB,
ADD COLUMN     "hostAgreementUrl" TEXT;
