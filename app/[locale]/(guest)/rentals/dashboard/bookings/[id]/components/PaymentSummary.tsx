// app/(guest)/rentals/dashboard/bookings/[id]/components/PaymentSummary.tsx
// Extracted from BookingSidebar — displays payment breakdown, credits, bonus, deposit

import React from 'react'
import { useTranslations } from 'next-intl'
import { Booking } from '../types'
import { ShieldCheck, CheckCircle, AlertCircle } from './Icons'
import { calculateTripDays, formatCurrency } from '../utils/helpers'

interface PaymentSummaryProps {
  booking: Booking
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({ booking }) => {
  const t = useTranslations('BookingDetail')
  const tripDays = calculateTripDays(booking.startDate, booking.endDate)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 sm:p-5 lg:p-6">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
        {t('paymentSummary')}
      </h2>

      <PaymentStatusBanner booking={booking} t={t} />

      <div className="space-y-2.5 sm:space-y-3">
        {/* Line items */}
        <LineItem
          label={t('perDayTimeDays', { rate: formatCurrency(booking.dailyRate), days: tripDays })}
          amount={formatCurrency(booking.dailyRate * tripDays)}
        />

        {booking.deliveryFee > 0 && (
          <LineItem label={t('deliveryFee')} amount={formatCurrency(booking.deliveryFee)} />
        )}

        {booking.insuranceFee > 0 && (
          <LineItem label={t('insuranceProtection')} amount={formatCurrency(booking.insuranceFee)} />
        )}

        <LineItem label={t('itwhipServiceFee')} amount={formatCurrency(booking.serviceFee)} />
        <LineItem label={t('azTaxesFees')} amount={formatCurrency(booking.taxes)} />

        {/* Trip Total + credits/bonus/card */}
        <div className="border-t dark:border-gray-700 pt-2.5 sm:pt-3">
          <TripTotalSection booking={booking} t={t} />
          <AppliedBalancesSection booking={booking} t={t} />
          <DepositSection booking={booking} t={t} />
        </div>
      </div>
    </div>
  )
}

// ─── Line Item ───────────────────────────────────────────────────────────────

function LineItem({ label, amount }: { label: string; amount: string }) {
  return (
    <div className="flex justify-between text-xs sm:text-sm">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-gray-900 dark:text-gray-100">{amount}</span>
    </div>
  )
}

// ─── Payment Status Banner ───────────────────────────────────────────────────

function PaymentStatusBanner({
  booking,
  t,
}: {
  booking: Booking
  t: ReturnType<typeof useTranslations>
}) {
  const ps = booking.paymentStatus?.toUpperCase()
  const vs = booking.verificationStatus?.toLowerCase()

  // Payment Failed
  if (vs === 'approved' && (ps === 'FAILED' || ps === 'failed')) {
    return (
      <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-red-800 dark:text-red-200">
            <p className="font-medium mb-1">{t('paymentFailedTitle')}</p>
            <p className="text-xs mb-2">{t('paymentFailedDesc')}</p>
            <button
              onClick={() => {
                window.location.href = `/support?booking=${booking.bookingCode}&action=update-payment`
              }}
              className="text-xs font-semibold text-red-600 hover:text-red-700 underline"
            >
              {t('updatePaymentMethod')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Payment Successful
  if (ps === 'PAID' || ps === 'paid' || ps === 'CAPTURED' || ps === 'captured') {
    return (
      <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-start">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-green-800 dark:text-green-200">
            <p className="font-medium mb-1">{t('paymentConfirmed')}</p>
            <p className="text-xs text-green-700 dark:text-green-300">
              {t('paymentConfirmedDesc', {
                amount: formatCurrency(booking.totalAmount),
                email: booking.guestEmail || '',
              })}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Payment Authorized (hold)
  if (ps === 'AUTHORIZED' || ps === 'authorized') {
    return (
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">{t('paymentAuthorized')}</p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {t('paymentAuthorizedSidebarDesc')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}

// ─── Trip Total ──────────────────────────────────────────────────────────────

function TripTotalSection({
  booking,
  t,
}: {
  booking: Booking
  t: ReturnType<typeof useTranslations>
}) {
  const isPaid = booking.paymentStatus === 'paid' || booking.paymentStatus === 'PAID'

  return (
    <div className="flex justify-between items-baseline">
      <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
        {t('tripTotal')}
      </span>
      <div className="text-right">
        <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
          {formatCurrency(booking.totalAmount)}
        </span>
        {booking.status === 'PENDING' && !isPaid && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {booking.verificationStatus === 'approved'
              ? t('processingNow')
              : t('dueAtConfirmation')}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Applied Balances (credits, bonus, card) ─────────────────────────────────
// Matches color conventions from PriceSummary in /rentals/[id]/book:
//   Credits → purple    Bonus → amber    Combined → purple

function AppliedBalancesSection({
  booking,
  t,
}: {
  booking: Booking
  t: ReturnType<typeof useTranslations>
}) {
  const hasCredits = (booking.creditsApplied ?? 0) > 0
  const hasBonus = (booking.bonusApplied ?? 0) > 0
  const hasWallet = (booking.walletApplied ?? 0) > 0
  const hasCard = !!(booking.cardBrand && booking.cardLast4)

  if (!hasCredits && !hasBonus && !hasWallet && !hasCard) return null

  return (
    <div className="mt-2 space-y-1.5">
      {/* Individual credits line */}
      {hasCredits && (
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-purple-600 dark:text-purple-400">{t('creditsApplied')}</span>
          <span className="text-purple-600 dark:text-purple-400 font-medium">
            -{formatCurrency(booking.creditsApplied!)}
          </span>
        </div>
      )}

      {/* Individual bonus line */}
      {hasBonus && (
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-amber-600 dark:text-amber-400">{t('bonusApplied')}</span>
          <span className="text-amber-600 dark:text-amber-400 font-medium">
            -{formatCurrency(booking.bonusApplied!)}
          </span>
        </div>
      )}

      {/* Combined credits & bonus (when no individual breakdown available) */}
      {hasWallet && (
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-purple-600 dark:text-purple-400">
            {!hasCredits && !hasBonus
              ? t('creditsBonusApplied')
              : t('walletBalanceApplied')}
          </span>
          <span className="text-purple-600 dark:text-purple-400 font-medium">
            -{formatCurrency(booking.walletApplied!)}
          </span>
        </div>
      )}

      {/* Card charge / minimum hold */}
      {hasCard && (
        <CardChargeLine booking={booking} t={t} />
      )}
    </div>
  )
}

// ─── Card Charge Line ────────────────────────────────────────────────────────

function CardChargeLine({
  booking,
  t,
}: {
  booking: Booking
  t: ReturnType<typeof useTranslations>
}) {
  const isHold = booking.isMinimumHold === true

  return (
    <div className="flex justify-between text-xs sm:text-sm font-medium">
      <span
        className={
          isHold
            ? 'text-gray-500 dark:text-gray-400'
            : 'text-gray-900 dark:text-gray-100'
        }
      >
        {isHold
          ? t('minimumCardHold', { brand: booking.cardBrand!, last4: booking.cardLast4! })
          : t('paidWithCard', { brand: booking.cardBrand!, last4: booking.cardLast4! })}
      </span>
      <span
        className={
          isHold
            ? 'text-gray-500 dark:text-gray-400'
            : 'text-gray-900 dark:text-gray-100'
        }
      >
        {formatCurrency(booking.chargeAmount ?? booking.totalAmount)}
      </span>
    </div>
  )
}

// ─── Security Deposit ────────────────────────────────────────────────────────

function DepositSection({
  booking,
  t,
}: {
  booking: Booking
  t: ReturnType<typeof useTranslations>
}) {
  if (booking.depositAmount <= 0) return null

  return (
    <div className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700 space-y-1.5">
      <div className="flex justify-between text-xs sm:text-sm">
        <span className="text-gray-600 dark:text-gray-400">{t('securityDepositHold')}</span>
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {formatCurrency(booking.depositAmount)}
        </span>
      </div>

      {(booking.depositFromWallet ?? 0) > 0 && (
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-blue-600 dark:text-blue-400">{t('depositFromWalletLabel')}</span>
          <span className="text-blue-600 dark:text-blue-400 font-medium">
            -{formatCurrency(booking.depositFromWallet!)}
          </span>
        </div>
      )}

      {(booking.depositFromCard ?? 0) > 0 && (
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-600 dark:text-gray-400">{t('depositFromCardLabel')}</span>
          <span className="text-gray-600 dark:text-gray-400 font-medium">
            {formatCurrency(booking.depositFromCard!)}
          </span>
        </div>
      )}

      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
        {t('depositRefundNote')}
      </p>
    </div>
  )
}
