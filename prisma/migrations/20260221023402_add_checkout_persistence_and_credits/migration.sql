-- AlterTable
ALTER TABLE "choe_ai_settings" ALTER COLUMN "maxTokens" SET DEFAULT 2048;

-- AlterTable
ALTER TABLE "pending_checkouts" ADD COLUMN     "addOnOptions" JSONB,
ADD COLUMN     "appliedBonus" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "appliedCredits" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "appliedDepositWallet" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "checkoutStep" TEXT,
ADD COLUMN     "dailyRateAtCheckout" DOUBLE PRECISION,
ADD COLUMN     "deliveryOptions" JSONB,
ADD COLUMN     "insuranceOptions" JSONB,
ADD COLUMN     "paymentIntentId" TEXT,
ADD COLUMN     "promoCode" TEXT,
ADD COLUMN     "promoDiscount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "selectedPaymentMethod" TEXT;
