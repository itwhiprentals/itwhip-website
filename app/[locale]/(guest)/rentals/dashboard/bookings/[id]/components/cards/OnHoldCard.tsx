// OnHoldCard — identity verification required, layout matches CompletedCard (NoShow) template

import React from 'react'
import { useTranslations } from 'next-intl'
import { Booking, Message } from '../../types'
import { CarPhotoOverlay } from './CarPhotoOverlay'
import { HostMessagesCard, CollapsiblePaymentSummary, RentalAgreementButton } from './SharedCardSections'
import { Copy, CheckCircle } from '../Icons'
import { formatDate } from '../../utils/helpers'

interface OnHoldCardProps {
  booking: Booking
  messages: Message[]
  messagesLoading: boolean
  messageSending: boolean
  messageError: string | null
  messageUploading: boolean
  onSendMessage: (text: string) => void
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onCancel: () => void
  onModify: () => void
  onAgreement: () => void
}

export const OnHoldCard: React.FC<OnHoldCardProps> = ({
  booking,
  messages,
  messagesLoading,
  messageSending,
  messageError,
  messageUploading,
  onSendMessage,
  onFileUpload,
  onCancel,
  onModify,
  onAgreement,
}) => {
  const t = useTranslations('BookingDetail')
  const tTrip = useTranslations('TripActiveCard')
  const [copiedCode, setCopiedCode] = React.useState(false)
  const [timeRemaining, setTimeRemaining] = React.useState('')
  const [isOverdue, setIsOverdue] = React.useState(false)

  // Timer: calculate time remaining until trip endDate
  React.useEffect(() => {
    const combineDateTime = (dateString: string, timeString: string): Date => {
      const date = new Date(dateString)
      let hours = 0, minutes = 0
      if (timeString?.includes(':')) {
        const timeParts = timeString.split(':')
        let hourPart = parseInt(timeParts[0])
        const minutePart = parseInt(timeParts[1]?.replace(/\D/g, '') || '0')
        if (timeString.toLowerCase().includes('pm') && hourPart !== 12) hourPart += 12
        if (timeString.toLowerCase().includes('am') && hourPart === 12) hourPart = 0
        hours = hourPart
        minutes = minutePart
      }
      const combined = new Date(date)
      combined.setHours(hours, minutes, 0, 0)
      return combined
    }

    const updateTimer = () => {
      const returnDate = combineDateTime(booking.endDate, booking.endTime || '10:00')
      const remaining = returnDate.getTime() - Date.now()

      if (remaining <= 0) {
        setTimeRemaining(tTrip('overdue'))
        setIsOverdue(true)
      } else {
        setIsOverdue(false)
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
        const hrs = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
        if (days > 0) {
          setTimeRemaining(tTrip('timeRemainingDaysHours', { days, hours: hrs }))
        } else if (hrs > 0) {
          setTimeRemaining(tTrip('timeRemainingHoursMinutes', { hours: hrs, minutes: mins }))
        } else {
          setTimeRemaining(tTrip('timeRemainingMinutes', { minutes: mins }))
        }
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000)
    return () => clearInterval(interval)
  }, [booking.endDate, booking.endTime, tTrip])

  const copyBookingCode = () => {
    navigator.clipboard.writeText(booking.bookingCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleVerifyIdentity = async () => {
    try {
      const response = await fetch('/api/identity/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/rentals/dashboard/bookings/${booking.id}?verified=true`,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to start verification')
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error('Stripe Identity error:', err)
    }
  }

  return (
    <div className="max-w-3xl mx-auto mt-3 space-y-3">
      {/* Main Card with Car Photo */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <CarPhotoOverlay car={booking.car} />
        <div className="p-4">
          {/* ON HOLD badge + time remaining */}
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-1">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                  {t('onHoldBadge')}
                </p>
                {timeRemaining && (
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    isOverdue
                      ? 'bg-red-600 text-white'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                  }`}>
                    {timeRemaining}
                  </span>
                )}
              </div>
              <p className="text-xs text-red-600 dark:text-red-400">
                {t('verificationHoldDesc')}
              </p>
            </div>
          </div>

          {/* Verify Identity CTA */}
          <button
            onClick={handleVerifyIdentity}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {t('verifyIdentity')}
          </button>

          {/* Booking Info Grid */}
          <BookingInfoGrid
            booking={booking}
            bookingCode={booking.bookingCode}
            onCopyCode={copyBookingCode}
            copiedCode={copiedCode}
          />
        </div>
      </div>

      {/* Host + Messages combined card (read-only / locked) */}
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
      />

      {/* Payment Summary — collapsible */}
      <CollapsiblePaymentSummary booking={booking} />

      {/* Rental Agreement */}
      <RentalAgreementButton onViewAgreement={onAgreement} />

      {/* Cancel / Modify Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onCancel}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {t('cancel')}
        </button>
        <button
          onClick={onModify}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          {t('modify')}
        </button>
      </div>
    </div>
  )
}

// ─── Booking Info Grid (simplified TripStatsGrid for pre-trip statuses) ──────

function BookingInfoGrid({ booking, bookingCode, onCopyCode, copiedCode }: { booking: Booking; bookingCode: string; onCopyCode: () => void; copiedCode: boolean }) {
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
          <p className="text-xs font-semibold text-red-600 dark:text-red-400">
            {t('onHoldBadge')}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* Row 2: Pickup + Dropoff */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('pickup')}</p>
          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{formatDate(booking.startDate)}</p>
          <p className="text-[11px] text-gray-500">{booking.startTime}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('dropoff')}</p>
          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{formatDate(booking.endDate)}</p>
          <p className="text-[11px] text-gray-500">{booking.endTime}</p>
        </div>
      </div>

      {/* Location note */}
      {(booking as any).locationNote === 'completeVerificationForLocation' && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-700" />
          <p className="text-xs text-gray-500 italic">
            {t('completeVerificationForLocation')}
          </p>
        </>
      )}
    </div>
  )
}
