'use client'

import { useTranslations } from 'next-intl'
import { IoHelpCircleOutline, IoRibbonOutline } from 'react-icons/io5'
import {
  calculateBookingPricing,
  formatPrice,
  calculateAppliedBalances,
  type GuestBalances
} from '@/app/[locale]/(guest)/rentals/lib/booking-pricing'
import { getCityFromAddress } from '@/app/[locale]/(guest)/rentals/lib/arizona-taxes'

interface PriceSummaryProps {
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
  numberOfDays: number
  agreedToTerms: boolean
  onAgreedToTermsChange: (checked: boolean) => void
  showDepositTooltip: boolean
  onShowDepositTooltipChange: (show: boolean) => void
  onShowRentalAgreement: () => void
  onShowInsuranceModal: () => void
  onShowTrustSafetyModal: () => void
}

export function PriceSummary({
  savedBookingDetails,
  car,
  adjustedDeposit,
  rateBasedDeposit,
  guestBalances,
  userProfile,
  numberOfDays,
  agreedToTerms,
  onAgreedToTermsChange,
  showDepositTooltip,
  onShowDepositTooltipChange,
  onShowRentalAgreement,
  onShowInsuranceModal,
  onShowTrustSafetyModal
}: PriceSummaryProps) {
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

  const appliedBalances = calculateAppliedBalances(
    pricing,
    adjustedDeposit,
    guestBalances,
    0.25
  )

  return (
    <>
      {/* Price Summary - Credits/Bonus/Deposit Wallet applied inline below */}
      <div className="border-t dark:border-gray-700 pt-6">
        <div className="space-y-2 text-sm">
          {/* Rental */}
          <div className="flex justify-between">
            <span className="font-semibold text-gray-900 dark:text-white">{t('rentalDays', { days: numberOfDays })}</span>
            <span className="font-medium text-gray-900 dark:text-white">${formatPrice(pricing.basePrice)}</span>
          </div>

          {/* Insurance */}
          <div className="flex justify-between">
            <span className="font-semibold text-gray-900 dark:text-white">{t('insurance')}</span>
            <span className="font-medium text-gray-900 dark:text-white">${formatPrice(pricing.insurancePrice)}</span>
          </div>

          {/* Delivery (conditional) */}
          {pricing.deliveryFee > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('delivery')}</span>
              <span className="font-medium text-gray-900 dark:text-white">${formatPrice(pricing.deliveryFee)}</span>
            </div>
          )}

          {/* Enhancements (conditional) */}
          {pricing.enhancementsTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('enhancements')}</span>
              <span className="font-medium text-gray-900 dark:text-white">${formatPrice(pricing.enhancementsTotal)}</span>
            </div>
          )}

          {/* Service fee */}
          <div className="flex justify-between">
            <span className="font-semibold text-gray-900 dark:text-white">{t('serviceFee')}</span>
            <span className="font-medium text-gray-900 dark:text-white">${formatPrice(pricing.serviceFee)}</span>
          </div>

          {/* Taxes with dynamic percentage */}
          <div className="flex justify-between">
            <span className="font-semibold text-gray-900 dark:text-white">{t('taxes', { rate: pricing.taxRateDisplay })}</span>
            <span className="font-medium text-gray-900 dark:text-white">${formatPrice(pricing.taxes)}</span>
          </div>

          {/* Applied Credits (if any) */}
          {appliedBalances.creditsApplied > 0 && (
            <div className="flex justify-between text-purple-600 dark:text-purple-400">
              <span className="font-medium">{t('creditsApplied')}</span>
              <span className="font-medium">-${formatPrice(appliedBalances.creditsApplied)}</span>
            </div>
          )}

          {/* Applied Bonus (if any) */}
          {appliedBalances.bonusApplied > 0 && (
            <div className="flex justify-between text-amber-600 dark:text-amber-400">
              <span className="font-medium">{t('bonusAppliedMax25')}</span>
              <span className="font-medium">-${formatPrice(appliedBalances.bonusApplied)}</span>
            </div>
          )}

          {/* Deposit from wallet (if any) */}
          {appliedBalances.depositFromWallet > 0 && (
            <div className="flex justify-between text-blue-600 dark:text-blue-400">
              <span className="font-medium">{t('depositFromWallet')}</span>
              <span className="font-medium">-${formatPrice(appliedBalances.depositFromWallet)}</span>
            </div>
          )}

          {/* Totals Section */}
          <div className="pt-4 mt-4 border-t dark:border-gray-700">
            {/* Trip Total - strikethrough if savings applied */}
            {appliedBalances.totalSavings > 0 ? (
              <>
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-500 dark:text-gray-400">{t('originalTotal')}</span>
                  <span className="text-gray-500 dark:text-gray-400 line-through">${formatPrice(pricing.total)}</span>
                </div>
                <div className="flex justify-between items-baseline mt-1">
                  <span className="font-bold text-gray-900 dark:text-white">{t('amountToPay')}</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">${formatPrice(appliedBalances.amountToPay)}</span>
                </div>
                <div className="flex justify-end mt-1">
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                    {t('youSave', { amount: formatPrice(appliedBalances.totalSavings) })}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-gray-900 dark:text-white">{t('tripTotal')}</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">${formatPrice(pricing.total)}</span>
              </div>
            )}

            {/* Security Deposit - Show wallet coverage, card hold, or waived */}
            <div className="flex justify-end mt-2 mb-3">
              {adjustedDeposit > 0 ? (
                appliedBalances.depositFromCard > 0 ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-lg">
                    <span className="text-sm font-medium text-white">
                      {t('depositFromCard', { amount: formatPrice(appliedBalances.depositFromCard) })}
                    </span>
                    {userProfile?.insuranceVerified && (
                      <span className="text-xs text-green-200 font-medium">
                        {t('fiftyPercentOff')}
                      </span>
                    )}
                    {appliedBalances.depositFromWallet > 0 && (
                      <span className="text-xs text-green-200 font-medium">
                        {t('walletCoverage', { amount: formatPrice(appliedBalances.depositFromWallet) })}
                      </span>
                    )}
                    {/* (Hold) with tooltip inline */}
                    <div className="relative inline-flex items-center gap-0.5">
                      <span className="text-xs text-white/80 font-medium">{t('hold')}</span>
                      <button
                        type="button"
                        onMouseEnter={() => onShowDepositTooltipChange(true)}
                        onMouseLeave={() => onShowDepositTooltipChange(false)}
                        onClick={() => onShowDepositTooltipChange(!showDepositTooltip)}
                        className="text-white/70 hover:text-white -mt-0.5"
                        aria-label="Learn about security deposit"
                      >
                        <IoHelpCircleOutline className="w-3.5 h-3.5" />
                      </button>

                      {showDepositTooltip && (
                        <div className="absolute z-50 right-0 bottom-full mb-1 whitespace-nowrap px-2 py-1 bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-600">
                          <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{t('temporaryHoldNotACharge')}</p>
                          <div className="absolute right-2 top-full w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-gray-200 dark:border-t-gray-600"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Deposit fully covered by wallet */
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
                    {userProfile?.insuranceVerified && (
                      <span className="text-sm font-medium line-through text-gray-400 dark:text-gray-500">
                        ${formatPrice(adjustedDeposit * 2)}
                      </span>
                    )}
                    <span className="text-sm font-medium line-through text-gray-400 dark:text-gray-500">
                      ${formatPrice(adjustedDeposit)}
                    </span>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {t('depositCoveredByWallet')}
                    </span>
                  </div>
                )
              ) : rateBasedDeposit > 0 ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <span className="text-sm font-medium line-through text-gray-400 dark:text-gray-500">
                    ${rateBasedDeposit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {t('depositWaived')}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Grand Total (Trip + Deposit from card only) */}
            <div className="flex justify-between items-baseline pt-3 border-t dark:border-gray-700">
              <span className="text-base font-semibold text-gray-900 dark:text-white">{t('totalDueToday')}</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${formatPrice(appliedBalances.amountToPay + appliedBalances.depositFromCard)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions Agreement */}
      <div className="mt-6 p-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
        <label className="flex items-start space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => onAgreedToTermsChange(e.target.checked)}
            className="mt-0.5 w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
          />
          <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            {t('iAgreePrefix')}{' '}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                onShowRentalAgreement()
              }}
              className="text-amber-600 hover:text-amber-700 underline font-medium text-xs"
            >
              {t('rentalAgreement')}
            </button>
            ,{' '}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                onShowInsuranceModal()
              }}
              className="text-amber-600 hover:text-amber-700 underline font-medium text-xs"
            >
              {t('insuranceRequirements')}
            </button>
            {t('andSeparator')}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                onShowTrustSafetyModal()
              }}
              className="text-amber-600 hover:text-amber-700 underline font-medium text-xs"
            >
              {t('trustSafety')}
            </button>
            {' '}{t('policies')}.
          </div>
        </label>
      </div>
    </>
  )
}
