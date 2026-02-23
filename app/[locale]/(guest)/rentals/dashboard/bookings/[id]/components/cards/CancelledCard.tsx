// CancelledCard — booking was cancelled, single-column layout with refund breakdown
// Pattern matches CompletedCard (NoShow), OnHoldCard, IssuesCard

import React from 'react'
import { useTranslations } from 'next-intl'
import { Booking, Message } from '../../types'
import { CarPhotoOverlay } from './CarPhotoOverlay'
import { HostMessagesCard, CollapsiblePaymentSummary, RentalAgreementButton } from './SharedCardSections'
import { Copy, CheckCircle, XCircle } from '../Icons'
import { formatDate, formatCurrency, calculateRefund } from '../../utils/helpers'

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

  // Calculate refund using cancelledAt time (so tier matches original cancellation)
  const cancelledAt = booking.cancelledAt ? new Date(booking.cancelledAt) : undefined
  const refund = calculateRefund(booking, cancelledAt)

  return (
    <div className="max-w-3xl mx-auto mt-3 space-y-3">
      {/* Main Card with Car Photo */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <CarPhotoOverlay car={booking.car} />
        <div className="p-4">
          {/* Cancelled badge */}
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

          {/* Cancellation reason (if provided) */}
          {booking.cancellationReason && (
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
      <RefundSummaryCard booking={booking} refund={refund} />

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

      {/* Original Payment Summary — collapsible */}
      <CollapsiblePaymentSummary booking={booking} />

      {/* Rental Agreement */}
      {onViewAgreement && (
        <RentalAgreementButton onViewAgreement={onViewAgreement} />
      )}
    </div>
  )
}

// Format "HH:MM" or "H:MM AM/PM" → always "H:MM AM/PM"
function formatTime12(time: string): string {
  if (!time) return ''
  // Already has AM/PM
  if (/[ap]m/i.test(time)) return time
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
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
          <p className="text-[11px] text-gray-500">{formatTime12(booking.startTime)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('dropoff')}</p>
          <p className="text-xs font-medium text-gray-900 dark:text-gray-100 uppercase">{formatDate(booking.endDate)}</p>
          <p className="text-[11px] text-gray-500">{formatTime12(booking.endTime)}</p>
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

function RefundSummaryCard({ booking, refund }: { booking: Booking; refund: ReturnType<typeof calculateRefund> }) {
  const t = useTranslations('BookingDetail')

  const hasCredits = refund.creditsRestored > 0
  const hasBonus = refund.bonusRestored > 0
  const hasCardRefund = refund.totalCardRefund > 0

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        {t('refundSummaryTitle')}
      </h4>

      <div className="space-y-2">
        {/* Refund amount (what guest gets back from subtotal) */}
        {refund.refundAmount > 0 && (
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-600 dark:text-gray-400">{t('refundedAmount')}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatCurrency(refund.refundAmount)}
            </span>
          </div>
        )}

        {/* Penalty amount — red */}
        {refund.penaltyAmount > 0 && (
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-red-600 dark:text-red-400">{t('cancellationPenalty')}</span>
            <span className="font-medium text-red-600 dark:text-red-400">
              -{formatCurrency(refund.penaltyAmount)}
            </span>
          </div>
        )}

        {/* Non-refundable fees */}
        {refund.nonRefundableFees > 0 && (
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-600 dark:text-gray-400">{t('nonRefundableFees')}</span>
            <span className="font-medium text-gray-600 dark:text-gray-400">
              {formatCurrency(refund.nonRefundableFees)}
            </span>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2" />

        {/* How refund is distributed */}
        <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">{t('refundBreakdownLabel')}</p>

        {/* Card refund */}
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

        {/* Credits restored */}
        {hasCredits && (
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-600 dark:text-gray-400">{t('creditsRestoredLabel')}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatCurrency(refund.creditsRestored)}
            </span>
          </div>
        )}

        {/* Bonus restored */}
        {hasBonus && (
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-600 dark:text-gray-400">{t('bonusRestoredLabel')}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatCurrency(refund.bonusRestored)}
            </span>
          </div>
        )}

        {/* Security deposit */}
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-600 dark:text-gray-400">{t('depositReleasedLabel')}</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {formatCurrency(booking.depositAmount)}
          </span>
        </div>

        {/* Deposit source details */}
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

      {/* Processing note */}
      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-3">
        {t('refundProcessingNote')}
      </p>
    </div>
  )
}
