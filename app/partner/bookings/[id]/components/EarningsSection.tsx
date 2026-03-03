// app/partner/bookings/[id]/components/EarningsSection.tsx
// Pricing (manual) or Earnings (guest-driven) sidebar card + Insurance status

'use client'

import { useTranslations } from 'next-intl'
import {
  IoWalletOutline,
  IoChevronUpOutline,
  IoChevronDownOutline
} from 'react-icons/io5'

interface EarningsSectionProps {
  booking: {
    dailyRate: number
    numberOfDays: number
    subtotal: number
    deliveryFee: number
    serviceFee: number
    taxes: number
    totalAmount: number
    securityDeposit: number
    paymentStatus: string
    paymentType: string | null
    handoffStatus: string | null
    status: string
  }
  isGuestDriven: boolean
  isManualBooking: boolean
  expanded: boolean
  onToggle: () => void
  commissionRate: number
  platformCommissionRate: number
  processingFee: number
  formatCurrency: (amount: number) => string
  insurance: {
    hasVehicleInsurance: boolean
    hasPartnerInsurance: boolean
    vehicleProvider: string | null
    partnerProvider: string | null
    requiresGuestInsurance: boolean
  } | null
  onLearnMoreTax?: () => void
}

export default function EarningsSection({
  booking,
  isGuestDriven,
  isManualBooking,
  expanded,
  onToggle,
  commissionRate,
  platformCommissionRate,
  processingFee,
  formatCurrency,
  insurance,
  onLearnMoreTax,
}: EarningsSectionProps) {
  const t = useTranslations('PartnerBookings')

  return (
    <>
      {/* Pricing (manual) or Earnings (guest-driven) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={onToggle}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <IoWalletOutline className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {isGuestDriven ? t('bdEarnings') : t('bdPricing')}
            </h3>
            {/* #14 — Cash badge: PAID ✓ (green) or AWAITING PAYMENT (amber) */}
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap uppercase ${
              isManualBooking && booking.paymentType === 'CASH'
                ? (booking.handoffStatus === 'HANDOFF_COMPLETE' || booking.handoffStatus === 'BYPASSED' || booking.status === 'ACTIVE' || booking.status === 'COMPLETED')
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                : booking.paymentStatus === 'AUTHORIZED' || booking.paymentStatus === 'PAID'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}>
              {isManualBooking && booking.paymentType === 'CASH'
                ? (booking.handoffStatus === 'HANDOFF_COMPLETE' || booking.handoffStatus === 'BYPASSED' || booking.status === 'ACTIVE' || booking.status === 'COMPLETED')
                  ? t('bdCashPaid')
                  : t('bdCashAwaiting')
                : `${booking.paymentStatus}`}
            </span>
          </div>
          {expanded ? (
            <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
          ) : (
            <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expanded && (
          <div className="px-4 pb-4 space-y-3">
            {isGuestDriven ? (
              <>
                {/* Guest-Driven: What the guest paid (full breakdown) */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('bdRentalRate', { rate: formatCurrency(booking.dailyRate), days: booking.numberOfDays })}
                  </span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(booking.subtotal)}</span>
                </div>
                {booking.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('bdDelivery')}</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(booking.deliveryFee)}</span>
                  </div>
                )}

                {/* Your earnings */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('bdYourEarnings')}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('bdRental')}</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(booking.subtotal)}</span>
                  </div>
                  {booking.deliveryFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{t('bdDelivery')}</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(booking.deliveryFee)}</span>
                    </div>
                  )}

                  {/* Welcome discount — only show when host rate differs from standard */}
                  {commissionRate < platformCommissionRate ? (
                    <>
                      {/* Standard fee strikethrough */}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400 dark:text-gray-500 line-through">{t('bdStandardPlatformFee')}</span>
                        <span className="text-gray-400 dark:text-gray-500 line-through">
                          -{formatCurrency(booking.subtotal * platformCommissionRate)}
                        </span>
                      </div>

                      {/* Welcome discount highlight */}
                      <div className="flex justify-between text-sm bg-green-50 dark:bg-green-900/20 rounded-lg px-2 py-1.5 -mx-2">
                        <span className="text-green-700 dark:text-green-400 font-medium">{t('bdWelcomeDiscount')}</span>
                        <span className="text-green-700 dark:text-green-400 font-medium">
                          +{formatCurrency(booking.subtotal * platformCommissionRate - booking.subtotal * commissionRate)}
                        </span>
                      </div>

                      {/* Actual fee at host's rate */}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Platform fee ({Math.round(commissionRate * 100)}%)
                        </span>
                        <span className="text-red-600 dark:text-red-400">
                          -{formatCurrency(booking.subtotal * commissionRate)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t('bdStandardPlatformFee')}
                      </span>
                      <span className="text-red-600 dark:text-red-400">
                        -{formatCurrency(booking.subtotal * commissionRate)}
                      </span>
                    </div>
                  )}

                  {/* Processing fee — card only, not for cash */}
                  {booking.paymentType !== 'CASH' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{t('bdProcessingFee')}</span>
                      <span className="text-red-600 dark:text-red-400">
                        -{formatCurrency(processingFee)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-semibold">
                    <span className="text-gray-900 dark:text-white">{t('bdYouReceive')}</span>
                    <span className="text-lg text-green-600 dark:text-green-400">
                      {formatCurrency(booking.subtotal + booking.deliveryFee - (booking.subtotal * commissionRate) - (booking.paymentType !== 'CASH' ? processingFee : 0))}
                    </span>
                  </div>

                  {commissionRate < platformCommissionRate && (
                    <p className="text-xs text-gray-400 mt-1">
                      {t('bdWelcomeDiscountNote')}
                    </p>
                  )}

                  {/* #14 — Cash platform fee note */}
                  {booking.paymentType === 'CASH' && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      {t('bdCashPlatformFeeNote', { amount: formatCurrency(booking.subtotal * commissionRate) })}
                    </p>
                  )}
                </div>

                {booking.securityDeposit > 0 && (
                  <div className="flex items-start gap-2 pt-2 text-xs text-gray-500 dark:text-gray-400">
                    <IoShieldCheckmarkOutline className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{t('bdDepositHeldOnCard', { amount: formatCurrency(booking.securityDeposit) })}</span>
                  </div>
                )}

              </>
            ) : isManualBooking ? (
              <>
                {/* Manual Booking pricing */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('bdRateTimesDays', { rate: formatCurrency(booking.dailyRate), days: booking.numberOfDays })}
                  </span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(booking.subtotal)}</span>
                </div>

                {booking.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('bdDeliveryFee')}</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(booking.deliveryFee)}</span>
                  </div>
                )}

                {/* Earnings breakdown */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('bdYourEarnings')}</p>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('bdRental')}</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(booking.subtotal)}</span>
                  </div>

                  {booking.deliveryFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{t('bdDelivery')}</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(booking.deliveryFee)}</span>
                    </div>
                  )}

                  {/* Welcome discount — only show when host rate differs from standard */}
                  {commissionRate < platformCommissionRate ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400 dark:text-gray-500 line-through">{t('bdStandardPlatformFee')}</span>
                        <span className="text-gray-400 dark:text-gray-500 line-through">
                          -{formatCurrency(booking.subtotal * platformCommissionRate)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm bg-green-50 dark:bg-green-900/20 rounded-lg px-2 py-1.5 -mx-2">
                        <span className="text-green-700 dark:text-green-400 font-medium">{t('bdWelcomeDiscount')}</span>
                        <span className="text-green-700 dark:text-green-400 font-medium">
                          +{formatCurrency(booking.subtotal * platformCommissionRate - booking.subtotal * commissionRate)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Platform fee ({Math.round(commissionRate * 100)}%)
                        </span>
                        <span className="text-red-600 dark:text-red-400">
                          -{formatCurrency(booking.subtotal * commissionRate)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t('bdStandardPlatformFee')}
                      </span>
                      <span className="text-red-600 dark:text-red-400">
                        -{formatCurrency(booking.subtotal * commissionRate)}
                      </span>
                    </div>
                  )}

                  {/* Processing fee — card only, not for cash */}
                  {booking.paymentType !== 'CASH' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{t('bdProcessingFee')}</span>
                      <span className="text-red-600 dark:text-red-400">
                        -{formatCurrency(processingFee)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-semibold">
                    <span className="text-gray-900 dark:text-white">{t('bdYouReceive')}</span>
                    <span className="text-lg text-green-600 dark:text-green-400">
                      {formatCurrency(booking.subtotal + booking.deliveryFee - (booking.subtotal * commissionRate) - (booking.paymentType !== 'CASH' ? processingFee : 0))}
                    </span>
                  </div>

                  {commissionRate < platformCommissionRate && (
                    <p className="text-xs text-gray-400 mt-1">
                      {t('bdWelcomeDiscountNote')}
                    </p>
                  )}

                  {/* #14 — Cash platform fee note */}
                  {booking.paymentType === 'CASH' && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      {t('bdCashPlatformFeeNote', { amount: formatCurrency(booking.subtotal * commissionRate) })}
                    </p>
                  )}
                </div>

              </>
            ) : (
              <>
                {/* Standard: Show full pricing */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('bdRateTimesDays', { rate: formatCurrency(booking.dailyRate), days: booking.numberOfDays })}
                  </span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(booking.subtotal)}</span>
                </div>

                {booking.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('bdDeliveryFee')}</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(booking.deliveryFee)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('bdServiceFee')}</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(booking.serviceFee)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('bdTaxes')}</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(booking.taxes)}</span>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-semibold">
                  <span className="text-gray-900 dark:text-white">{t('bdTotal')}</span>
                  <span className="text-lg text-orange-600 dark:text-orange-400">
                    {formatCurrency(booking.totalAmount)}
                  </span>
                </div>

                {booking.securityDeposit > 0 && (
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{t('bdSecurityDeposit')}</span>
                    <span>{formatCurrency(booking.securityDeposit)}</span>
                  </div>
                )}
              </>
            )}
            {/* Learn more about tax responsibility */}
            {onLearnMoreTax && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onLearnMoreTax() }}
                  className="text-xs text-orange-600 dark:text-orange-400 font-medium hover:underline"
                >
                  {t('bdTaxLearnMore')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </>
  )
}
