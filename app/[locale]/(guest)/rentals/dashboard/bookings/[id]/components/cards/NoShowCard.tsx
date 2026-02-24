// NoShowCard — booking was marked as NO_SHOW (identity verification failed, trip period passed)
// No refund issued per cancellation policy. Single-column layout matching CancelledCard pattern.

import React from 'react'
import { useTranslations } from 'next-intl'
import { Booking, Message } from '../../types'
import { CarPhotoOverlay } from './CarPhotoOverlay'
import { HostMessagesCard, CollapsiblePaymentSummary, RentalAgreementButton } from './SharedCardSections'
import { Copy, CheckCircle, XCircle } from '../Icons'
import { formatDate } from '../../utils/helpers'

interface NoShowCardProps {
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

export const NoShowCard: React.FC<NoShowCardProps> = ({
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

  return (
    <div className="max-w-3xl mx-auto mt-3 space-y-3">
      {/* Main Card with Car Photo */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <CarPhotoOverlay car={booking.car} />
        <div className="p-4">
          {/* No-Show badge */}
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-1">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                {t('noShowBadge')}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                {t('noShowBadgeDesc')}
              </p>
            </div>
          </div>

          {/* Cancellation reason (system-generated) */}
          {booking.cancellationReason && (
            <div className="mb-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{t('cancelledReasonLabel')}</p>
              <p className="text-xs text-gray-700 dark:text-gray-300">{booking.cancellationReason}</p>
            </div>
          )}

          {/* Booking Info Grid */}
          <NoShowInfoGrid
            booking={booking}
            bookingCode={booking.bookingCode}
            onCopyCode={copyBookingCode}
            copiedCode={copiedCode}
          />
        </div>
      </div>

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
  if (/[ap]m/i.test(time)) return time
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

// ─── No-Show Info Grid ────────────────────────────────────────────────────

function NoShowInfoGrid({
  booking,
  bookingCode,
  onCopyCode,
  copiedCode,
}: {
  booking: Booking
  bookingCode: string
  onCopyCode: () => void
  copiedCode: boolean
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
            {t('noShow')}
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

      {/* Row 3: No refund tier */}
      <div className="border-t border-gray-200 dark:border-gray-700" />
      <div>
        <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('cancelledTierLabel')}</p>
        <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase">
          {t('tierNoRefundLabel')}
        </p>
      </div>
    </div>
  )
}
