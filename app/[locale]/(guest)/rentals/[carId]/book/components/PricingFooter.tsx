'use client'

import { useTranslations } from 'next-intl'
import {
  calculateBookingPricing,
  formatPrice,
  calculateAppliedBalances,
  type GuestBalances
} from '@/app/[locale]/(guest)/rentals/lib/booking-pricing'
import { getCityFromAddress } from '@/app/[locale]/(guest)/rentals/lib/arizona-taxes'

interface PricingFooterProps {
  savedBookingDetails: {
    pricing: {
      dailyRate: number
      days: number
      insurancePrice: number
      deliveryFee: number
      breakdown: {
        refuelService: number
        additionalDriver: number
        extraMiles: number
        vipConcierge: number
      }
    }
  }
  car: any
  adjustedDeposit: number
  rateBasedDeposit: number
  guestBalances: GuestBalances
  userProfile: { insuranceVerified?: boolean } | null
  isProcessing: boolean
  isUploading: boolean
  eligibility: { allowed: boolean }
  isIdentityVerified: boolean
  onCheckout: () => void
  promoDiscount?: number
}

export function PricingFooter({
  savedBookingDetails,
  car,
  adjustedDeposit,
  rateBasedDeposit,
  guestBalances,
  userProfile,
  isProcessing,
  isUploading,
  eligibility,
  isIdentityVerified,
  onCheckout,
  promoDiscount = 0
}: PricingFooterProps) {
  const t = useTranslations('BookingPage')

  const carCity = (car as any)?.city || getCityFromAddress(car?.address || 'Phoenix, AZ')
  const pricing = calculateBookingPricing({
    dailyRate: savedBookingDetails.pricing.dailyRate,
    days: savedBookingDetails.pricing.days,
    insurancePrice: savedBookingDetails.pricing.insurancePrice,
    deliveryFee: savedBookingDetails.pricing.deliveryFee,
    enhancements: {
      refuelService: savedBookingDetails.pricing.breakdown.refuelService,
      additionalDriver: savedBookingDetails.pricing.breakdown.additionalDriver,
      extraMiles: savedBookingDetails.pricing.breakdown.extraMiles,
      vipConcierge: savedBookingDetails.pricing.breakdown.vipConcierge
    },
    city: carCity
  })

  // Apply promo discount to total before calculating credits/bonus
  const pricingForBalances = promoDiscount > 0
    ? { ...pricing, total: Math.round((pricing.total - promoDiscount) * 100) / 100 }
    : pricing

  const stickyAppliedBalances = calculateAppliedBalances(
    pricingForBalances,
    adjustedDeposit,
    guestBalances,
    0.25
  )

  const grandTotal = stickyAppliedBalances.amountToPay + stickyAppliedBalances.depositFromCard

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-2xl z-40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Pricing Info - Compact on mobile */}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                ${formatPrice(grandTotal)}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('total')}</span>
            </div>
            {/* Show deposit info based on wallet coverage */}
            {adjustedDeposit > 0 && stickyAppliedBalances.depositFromCard > 0 ? (
              <>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                  <span className="hidden sm:inline">${formatPrice(stickyAppliedBalances.amountToPay)} + </span>
                  <span className="text-red-600 dark:text-red-400">${formatPrice(stickyAppliedBalances.depositFromCard)} {t('depositLabel')}</span>
                  <span className="text-gray-400 dark:text-gray-500 ml-1">{t('depositRefundable')}</span>
                </p>
                {userProfile?.insuranceVerified && (
                  <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 font-medium">
                    {t('fiftyPercentDepositDiscountApplied')}
                  </p>
                )}
              </>
            ) : adjustedDeposit > 0 && stickyAppliedBalances.depositFromCard === 0 ? (
              <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 font-medium">
                {t('depositCoveredByWallet')}
              </p>
            ) : rateBasedDeposit > 0 ? (
              <p className="text-[10px] sm:text-xs flex items-center gap-1">
                <span className="hidden sm:inline text-gray-500 dark:text-gray-400">${formatPrice(stickyAppliedBalances.amountToPay)} + </span>
                <span className="line-through text-gray-400 dark:text-gray-500">${formatPrice(rateBasedDeposit)}</span>
                <span className="text-green-600 dark:text-green-400 font-medium">{t('depositWaivedStatus')}</span>
              </p>
            ) : null}
          </div>

          {/* Book Button */}
          <button
            onClick={onCheckout}
            disabled={isProcessing || isUploading || !eligibility.allowed || !isIdentityVerified}
            className={`flex-shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold shadow-lg rounded-lg transition-all ${
              !isProcessing && !isUploading && eligibility.allowed && isIdentityVerified
                ? 'bg-black text-white hover:bg-gray-800 active:scale-[0.98]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="hidden sm:inline">{t('processing')}</span>
              </span>
            ) : !isIdentityVerified ? (
              t('verifyIdentityToBook')
            ) : (
              t('completeBooking')
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
