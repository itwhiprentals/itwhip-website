// CancelledCard — booking was cancelled, single-column layout with refund breakdown
// Pattern matches CompletedCard (NoShow), OnHoldCard, IssuesCard

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Booking, Message } from '../../types'
import { CarPhotoOverlay } from './CarPhotoOverlay'
import { HostMessagesCard, CollapsiblePaymentSummary, RentalAgreementButton } from './SharedCardSections'
import { Copy, CheckCircle, XCircle } from '../Icons'
import { formatDate, formatCurrency, calculateRefund, formatTimeDisplay } from '../../utils/helpers'

interface CancelledCardProps {
  booking: Booking
  messages: Message[]
  messagesLoading: boolean
  messageSending: boolean
  messageError: string | null
  messageUploading: boolean
  onSendMessage: (text: string) => void
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onViewAgreement?: () => void
}

export const CancelledCard: React.FC<CancelledCardProps> = ({
  booking,
  messages,
  messagesLoading,
  messageSending,
  messageError,
  messageUploading,
  onSendMessage,
  onFileUpload,
  onViewAgreement,
}) => {
  const t = useTranslations('BookingDetail')
  const [copiedCode, setCopiedCode] = React.useState(false)

  const copyBookingCode = () => {
    navigator.clipboard.writeText(booking.bookingCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  // Host cancellations = full refund (no penalty to guest)
  // Guest cancellations = time-based tier
  const isHostCancel = booking.cancelledBy?.toUpperCase() === 'HOST'
  const isSystemCancel = booking.cancelledBy?.toUpperCase() === 'SYSTEM' || booking.cancelledBy?.toUpperCase() === 'FLEET'
  const cancelledAt = booking.cancelledAt ? new Date(booking.cancelledAt) : undefined
  const refund = calculateRefund(booking, cancelledAt)
  // Override tier for host/system cancellations — guest is never penalized
  if (isHostCancel || isSystemCancel) {
    refund.tier = 'free'
    refund.penaltyAmount = 0
    refund.refundPercentage = 1
    refund.label = 'Full refund — cancelled by host'
  }

  return (
    <div className="max-w-3xl mx-auto mt-3 space-y-3">
      {/* Main Card with Car Photo */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <CarPhotoOverlay car={booking.car} />
        <div className="p-4">
          {/* Reassignment banner — blue, shown when booking was replaced by a new one */}
          {booking.cancellationReason === 'REASSIGNED' && booking.replacedByBookingId && (
            <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                {t('bookingReassigned')}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                {t('bookingReassignedDesc')}
              </p>
              <Link
                href={`/rentals/dashboard/bookings/${booking.replacedByBookingId}`}
                className="inline-block mt-2 text-xs font-medium text-blue-700 dark:text-blue-300 underline hover:text-blue-900 dark:hover:text-blue-100"
              >
                {t('viewNewBooking')}
              </Link>
            </div>
          )}

          {/* Cancellation banner — differentiate by who cancelled */}
          {booking.cancelledBy?.toUpperCase() === 'HOST' ? (
            <div className="mb-4 p-4 text-center">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Looking for another ride?</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Browse similar vehicles in your area</p>
              <Link
                href="/rentals/search?filter=impact"
                className="inline-flex items-center gap-1.5 mt-3 px-5 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium rounded-lg transition-colors"
              >
                Search Available Cars
              </Link>
            </div>
          ) : booking.cancelledBy?.toUpperCase() === 'SYSTEM' || booking.cancelledBy?.toUpperCase() === 'FLEET' ? (
            <div className="flex items-center gap-2 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-1 flex-shrink-0">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                  Booking Not Approved
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  This booking could not be verified or was not approved in time. Any hold on your card will be released.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-1">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                  {t('cancelledBadge')}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  {booking.cancelledAt
                    ? t('cancelledOnDate', { date: formatDate(booking.cancelledAt) })
                    : t('cancelledBadgeDesc')}
                </p>
              </div>
            </div>
          )}

          {/* Cancellation reason (if provided and not host-cancel) */}
          {booking.cancellationReason && booking.cancelledBy?.toUpperCase() !== 'HOST' && booking.cancellationReason !== 'REASSIGNED' && (
            <div className="mb-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{t('cancelledReasonLabel')}</p>
              <p className="text-xs text-gray-700 dark:text-gray-300">{booking.cancellationReason}</p>
            </div>
          )}

          {/* Booking Info Grid */}
          <CancelledInfoGrid
            booking={booking}
            bookingCode={booking.bookingCode}
            onCopyCode={copyBookingCode}
            copiedCode={copiedCode}
            tier={refund.tier}
          />
        </div>
      </div>

      {/* Refund Summary Card */}
      <RefundSummaryCard booking={booking} refund={refund} isHostCancel={isHostCancel || isSystemCancel} />

      {/* Host + Messages — read-only / locked */}
      <HostMessagesCard
        booking={booking}
        messages={messages}
        messagesLoading={messagesLoading}
        messageSending={messageSending}
        messageError={messageError}
        messageUploading={messageUploading}
        onSendMessage={onSendMessage}
        onFileUpload={onFileUpload}
        readOnly
        readOnlyLabel={t('messagesLockedCancelled')}
        readOnlyVariant="red"
      />

      {/* Original Payment Summary — hidden for host cancellations (refund card covers it) */}
      {!isHostCancel && !isSystemCancel && (
        <CollapsiblePaymentSummary booking={booking} />
      )}

      {/* Rental Agreement */}
      {onViewAgreement && (
        <RentalAgreementButton onViewAgreement={onViewAgreement} />
      )}
    </div>
  )
}


// ─── Cancelled Info Grid ────────────────────────────────────────────────────

function CancelledInfoGrid({
  booking,
  bookingCode,
  onCopyCode,
  copiedCode,
  tier,
}: {
  booking: Booking
  bookingCode: string
  onCopyCode: () => void
  copiedCode: boolean
  tier: string
}) {
  const t = useTranslations('BookingDetail')

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-3">
      {/* Row 1: Booking # + Status */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('confirmationNumber')}</p>
          <div className="flex items-center gap-1.5">
            <code className="text-xs font-mono font-medium text-gray-900 dark:text-gray-100">{bookingCode}</code>
            <button onClick={onCopyCode} className="text-gray-400 hover:text-gray-600 transition-colors p-0.5" title={t('copyBookingCode')}>
              {copiedCode ? <CheckCircle className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('statusLabel')}</p>
          <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase">
            {t('cancelled')}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* Row 2: Original Pickup + Dropoff */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('pickup')}</p>
          <p className="text-xs font-medium text-gray-900 dark:text-gray-100 uppercase">{formatDate(booking.startDate)}</p>
          <p className="text-[11px] text-gray-500">{formatTimeDisplay(booking.startTime)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('dropoff')}</p>
          <p className="text-xs font-medium text-gray-900 dark:text-gray-100 uppercase">{formatDate(booking.endDate)}</p>
          <p className="text-[11px] text-gray-500">{formatTimeDisplay(booking.endTime)}</p>
        </div>
      </div>

      {/* Row 3: Cancellation tier */}
      <div className="border-t border-gray-200 dark:border-gray-700" />
      <div>
        <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('cancelledTierLabel')}</p>
        <p className={`text-xs font-semibold uppercase ${
          tier === 'free' ? 'text-green-600 dark:text-green-400' :
          tier === 'moderate' ? 'text-amber-600 dark:text-amber-400' :
          'text-red-600 dark:text-red-400'
        }`}>
          {tier === 'free' ? t('tierFreeLabel') :
           tier === 'moderate' ? t('tierModerateLabel') :
           tier === 'late' ? t('tierLateLabel') :
           t('tierNoRefundLabel')}
        </p>
      </div>
    </div>
  )
}

// ─── Refund Summary Card ────────────────────────────────────────────────────

function RefundSummaryCard({ booking, refund, isHostCancel = false }: { booking: Booking; refund: ReturnType<typeof calculateRefund>; isHostCancel?: boolean }) {
  const t = useTranslations('BookingDetail')

  // Host/system cancelled — full refund, no penalties
  if (isHostCancel) {
    const creditsApplied = booking.creditsApplied || 0
    const bonusApplied = booking.bonusApplied || 0
    const chargeAmount = booking.chargeAmount || 0

    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h4 className="text-sm font-semibold text-green-900 dark:text-green-100">Full Refund — No Charges Applied</h4>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-green-800 dark:text-green-300">
            The host cancelled this booking. All holds and charges have been reversed.
          </p>

          <div className="border-t border-green-200 dark:border-green-700 pt-2 mt-2" />

          {chargeAmount > 0 && (
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-green-700 dark:text-green-300">
                {booking.cardBrand && booking.cardLast4
                  ? `Hold released on ${booking.cardBrand} ···${booking.cardLast4}`
                  : 'Card hold released'}
              </span>
              <span className="font-medium text-green-700 dark:text-green-200">
                {formatCurrency(chargeAmount)}
              </span>
            </div>
          )}

          {creditsApplied > 0 && (
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-green-700 dark:text-green-300">Credits restored</span>
              <span className="font-medium text-green-700 dark:text-green-200">
                {formatCurrency(creditsApplied)}
              </span>
            </div>
          )}

          {bonusApplied > 0 && (
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-green-700 dark:text-green-300">Bonus restored</span>
              <span className="font-medium text-green-700 dark:text-green-200">
                {formatCurrency(bonusApplied)}
              </span>
            </div>
          )}

          {booking.depositAmount > 0 && (
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-green-700 dark:text-green-300">Security deposit released</span>
              <span className="font-medium text-green-700 dark:text-green-200">
                {formatCurrency(booking.depositAmount)}
              </span>
            </div>
          )}
        </div>

        <p className="text-[10px] text-green-600 dark:text-green-400 mt-3">
          Card holds are typically released within 1–3 business days. Credits and bonus are restored instantly.
        </p>
      </div>
    )
  }

  // Guest-cancelled — standard refund with penalties
  const hasCredits = refund.creditsRestored > 0
  const hasBonus = refund.bonusRestored > 0
  const hasCardRefund = refund.totalCardRefund > 0

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        {t('refundSummaryTitle')}
      </h4>

      <div className="space-y-2">
        {refund.refundAmount > 0 && (
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-600 dark:text-gray-400">{t('refundedAmount')}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatCurrency(refund.refundAmount)}
            </span>
          </div>
        )}

        {refund.penaltyAmount > 0 && (
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-red-600 dark:text-red-400">{t('cancellationPenalty')}</span>
            <span className="font-medium text-red-600 dark:text-red-400">
              -{formatCurrency(refund.penaltyAmount)}
            </span>
          </div>
        )}

        {refund.nonRefundableFees > 0 && (
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-600 dark:text-gray-400">{t('nonRefundableFees')}</span>
            <span className="font-medium text-gray-600 dark:text-gray-400">
              {formatCurrency(refund.nonRefundableFees)}
            </span>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2" />

        <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">{t('refundBreakdownLabel')}</p>

        {hasCardRefund && (
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {booking.cardBrand && booking.cardLast4
                ? t('refundToCard', { brand: booking.cardBrand, last4: booking.cardLast4 })
                : t('refundToCardGeneric')}
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatCurrency(refund.totalCardRefund)}
            </span>
          </div>
        )}

        {hasCredits && (
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-600 dark:text-gray-400">{t('creditsRestoredLabel')}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatCurrency(refund.creditsRestored)}
            </span>
          </div>
        )}

        {hasBonus && (
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-600 dark:text-gray-400">{t('bonusRestoredLabel')}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatCurrency(refund.bonusRestored)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-600 dark:text-gray-400">{t('depositReleasedLabel')}</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {formatCurrency(booking.depositAmount)}
          </span>
        </div>

        {(booking.depositFromWallet ?? 0) > 0 && (
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-3">
            <span>{t('depositFromWalletLabel')}</span>
            <span>{formatCurrency(booking.depositFromWallet!)}</span>
          </div>
        )}
        {(booking.depositFromCard ?? 0) > 0 && (
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-3">
            <span>{t('depositFromCardLabel')}</span>
            <span>{formatCurrency(booking.depositFromCard!)}</span>
          </div>
        )}
      </div>

      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-3">
        {t('refundProcessingNote')}
      </p>
    </div>
  )
}
