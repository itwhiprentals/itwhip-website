// TripStartCard — CONFIRMED + onboarding complete, trip not started
// Layout matches CompletedCard (NoShow) template with timer/status content

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { CarPhotoOverlay } from '../cards/CarPhotoOverlay'
import { HostMessagesCard, CollapsiblePaymentSummary, RentalAgreementButton } from '../cards/SharedCardSections'
import { Copy, CheckCircle } from '../Icons'
import { formatDate } from '../../utils/helpers'

interface TripStartCardProps {
  booking: any
  messages?: any[]
  messagesLoading?: boolean
  messageSending?: boolean
  messageError?: string | null
  messageUploading?: boolean
  onSendMessage?: (text: string) => void
  onFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onTripStarted?: () => void
  onCancel?: () => void
  onModify?: () => void
  onViewAgreement?: () => void
}

export function TripStartCard({
  booking,
  messages = [],
  messagesLoading = false,
  messageSending = false,
  messageError = null,
  messageUploading = false,
  onSendMessage = () => {},
  onFileUpload = () => {},
  onTripStarted,
  onCancel,
  onModify,
  onViewAgreement,
}: TripStartCardProps) {
  const router = useRouter()
  const t = useTranslations('TripStartCard')
  const tBooking = useTranslations('BookingDetail')
  const [isStarting, setIsStarting] = useState(false)
  const [timeDisplay, setTimeDisplay] = useState('')
  const [tripStatus, setTripStatus] = useState<'upcoming' | 'ready' | 'grace' | 'late' | 'expired'>('upcoming')
  const [remainingTripTime, setRemainingTripTime] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)

  const BYPASS_RESTRICTIONS = process.env.NEXT_PUBLIC_BYPASS_TRIP_RESTRICTIONS === 'true'

  const copyBookingCode = () => {
    navigator.clipboard.writeText(booking.bookingCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  // Helper function to properly combine date and time
  const combineDateTime = (dateString: string, timeString: string): Date => {
    const date = new Date(dateString)
    let hours = 0
    let minutes = 0

    if (timeString) {
      if (timeString.includes(':')) {
        const timeParts = timeString.split(':')
        let hourPart = parseInt(timeParts[0])
        const minutePart = parseInt(timeParts[1]?.replace(/\D/g, '') || '0')
        const isPM = timeString.toLowerCase().includes('pm')
        const isAM = timeString.toLowerCase().includes('am')
        if (isPM && hourPart !== 12) hourPart += 12
        else if (isAM && hourPart === 12) hourPart = 0
        hours = hourPart
        minutes = minutePart
      }
    }

    const combinedDate = new Date(date)
    combinedDate.setHours(hours, minutes, 0, 0)
    return combinedDate
  }

  useEffect(() => {
    const updateTimers = () => {
      const now = new Date()
      const pickupTime = combineDateTime(booking.startDate, booking.startTime || '10:00')
      const endTime = combineDateTime(booking.endDate, booking.endTime || '10:00')
      const graceEndTime = new Date(pickupTime.getTime() + (2 * 60 * 60 * 1000))

      const timeUntilPickup = pickupTime.getTime() - now.getTime()
      const timeUntilGraceEnd = graceEndTime.getTime() - now.getTime()
      const timeUntilTripEnd = endTime.getTime() - now.getTime()

      if (timeUntilTripEnd <= 0) {
        setTripStatus('expired')
        setTimeDisplay(t('expired'))
      } else if (timeUntilPickup > 0) {
        setTripStatus('upcoming')
        const hours = Math.floor(timeUntilPickup / (1000 * 60 * 60))
        const minutes = Math.floor((timeUntilPickup % (1000 * 60 * 60)) / (1000 * 60))
        if (hours > 24) {
          const days = Math.floor(hours / 24)
          const remainingHours = hours % 24
          setTimeDisplay(t('startsInDays', { days, hours: remainingHours }))
        } else if (hours > 0) {
          setTimeDisplay(t('startsInHours', { hours, minutes }))
        } else {
          setTimeDisplay(t('startsInMinutes', { minutes }))
        }
      } else if (Math.abs(timeUntilPickup) < 5 * 60 * 1000) {
        setTripStatus('ready')
        setTimeDisplay(t('readyForPickup'))
      } else if (timeUntilGraceEnd > 0) {
        setTripStatus('grace')
        const hoursLeft = Math.floor(timeUntilGraceEnd / (1000 * 60 * 60))
        const minutesLeft = Math.floor((timeUntilGraceEnd % (1000 * 60 * 60)) / (1000 * 60))
        if (hoursLeft > 0) {
          setTimeDisplay(t('startWithinHoursMinutes', { hours: hoursLeft, minutes: minutesLeft }))
        } else {
          setTimeDisplay(t('startWithinMinutes', { minutes: minutesLeft }))
        }
        const tripDays = Math.floor(timeUntilTripEnd / (1000 * 60 * 60 * 24))
        const tripHours = Math.floor((timeUntilTripEnd % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        setRemainingTripTime(tripDays > 0
          ? t('remainingDaysHours', { days: tripDays, hours: tripHours })
          : t('remainingHours', { hours: tripHours })
        )
      } else if (timeUntilTripEnd > 0) {
        setTripStatus('late')
        const tripDays = Math.floor(timeUntilTripEnd / (1000 * 60 * 60 * 24))
        const tripHours = Math.floor((timeUntilTripEnd % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        if (tripDays > 0) {
          setTimeDisplay(t('lateStartDaysHours', { days: tripDays, hours: tripHours }))
        } else if (tripHours > 0) {
          setTimeDisplay(t('lateStartHours', { hours: tripHours }))
        } else {
          const tripMinutes = Math.floor(timeUntilTripEnd / (1000 * 60))
          setTimeDisplay(t('lateStartMinutes', { minutes: tripMinutes }))
        }
      }
    }

    updateTimers()
    const interval = setInterval(updateTimers, 30000)
    return () => clearInterval(interval)
  }, [booking])

  if (booking.tripStartedAt && !BYPASS_RESTRICTIONS) return null

  const handleStartInspection = () => {
    if (tripStatus === 'expired' && !BYPASS_RESTRICTIONS) return
    setIsStarting(true)
    router.push(`/rentals/trip/start/${booking.id}`)
  }

  // Build full address
  const fullAddress = [
    booking.exactAddress || booking.car.address,
    [booking.car.city, booking.car.state].filter(Boolean).join(', '),
    booking.car.zipCode,
  ].filter(Boolean).join(', ')

  // Status color/text lookup
  const statusStyles: Record<string, { badge: string; icon: string; title: string; desc: string; grid: string }> = {
    upcoming: { badge: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600', title: 'text-blue-900 dark:text-blue-200', desc: 'text-blue-700 dark:text-blue-400', grid: 'text-blue-600 dark:text-blue-400' },
    ready:    { badge: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600', title: 'text-green-900 dark:text-green-200', desc: 'text-green-700 dark:text-green-400', grid: 'text-green-600 dark:text-green-400' },
    grace:    { badge: 'bg-amber-100 dark:bg-amber-900/30', icon: 'text-amber-600', title: 'text-amber-900 dark:text-amber-200', desc: 'text-amber-700 dark:text-amber-400', grid: 'text-amber-600 dark:text-amber-400' },
    late:     { badge: 'bg-red-100 dark:bg-red-900/30', icon: 'text-red-600', title: 'text-red-900 dark:text-red-200', desc: 'text-red-700 dark:text-red-400', grid: 'text-red-600 dark:text-red-400' },
    expired:  { badge: 'bg-gray-100 dark:bg-gray-800', icon: 'text-gray-600', title: 'text-gray-900 dark:text-gray-200', desc: 'text-gray-700 dark:text-gray-400', grid: 'text-gray-600 dark:text-gray-400' },
  }
  const colors = statusStyles[tripStatus] || statusStyles.upcoming

  const statusMessages: Record<string, string> = {
    upcoming: t('statusUpcoming'), ready: t('statusReady'), grace: t('statusGrace'),
    late: t('statusLate'), expired: t('statusExpired'),
  }
  const statusBadges: Record<string, string> = {
    upcoming: t('badgeReady'), ready: t('badgeActive'), grace: t('badgeAction'),
    late: t('badgeLate'), expired: t('badgeExpired'),
  }

  return (
    <div className="max-w-3xl mx-auto mt-3 space-y-3">
      {/* Hidden trigger for the car photo circle button */}
      <button data-trip-start className="hidden" onClick={handleStartInspection} />

      {/* Main Card with Car Photo */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <CarPhotoOverlay car={booking.car} />
        <div className="p-4">
          {/* Status badge */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`${colors.badge} rounded-full p-1`}>
              <svg className={`w-5 h-5 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className={`text-sm font-semibold ${colors.title}`}>
                {statusMessages[tripStatus] || t('statusUpcoming')} — {timeDisplay}
              </p>
            </div>
          </div>

          {/* Status-specific messaging */}
          {tripStatus === 'upcoming' && (
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-4">
              <h4 className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-2">{t('checklistTitle')}</h4>
              <ul className="space-y-1">
                {[t('checklistLicense'), t('checklistAgreement'), t('checklistRoute')].map((item, i) => (
                  <li key={i} className="flex items-center text-xs text-gray-700 dark:text-gray-300">
                    <svg className="w-3.5 h-3.5 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tripStatus === 'grace' && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
              <h4 className="text-xs font-medium text-amber-900 dark:text-amber-200 mb-1">{t('graceTitle')}</h4>
              <p className="text-xs text-amber-700 dark:text-amber-300">{t('graceDesc')}</p>
              {remainingTripTime && (
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 mt-1">{t('tripDuration', { time: remainingTripTime })}</p>
              )}
            </div>
          )}

          {tripStatus === 'late' && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
              <p className="text-xs font-medium text-red-900 dark:text-red-200">{t('lateStart')}</p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">{t('lateDesc')}</p>
            </div>
          )}

          {tripStatus === 'expired' && (
            <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 mb-4">
              <h4 className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">{t('expiredTitle')}</h4>
              <p className="text-xs text-gray-700 dark:text-gray-300">{t('expiredDesc')}</p>
            </div>
          )}

          {/* Booking Info Grid */}
          <BookingInfoGrid
            booking={booking}
            bookingCode={booking.bookingCode}
            onCopyCode={copyBookingCode}
            copiedCode={copiedCode}
            pickupAddress={fullAddress}
            dropoffAddress={fullAddress}
            statusBadge={statusBadges[tripStatus] || t('badgeReady')}
            statusColor={colors.grid}
          />
        </div>
      </div>

      {/* Host + Messages combined card (ACTIVE) */}
      <HostMessagesCard
        booking={booking}
        messages={messages}
        messagesLoading={messagesLoading}
        messageSending={messageSending}
        messageError={messageError}
        messageUploading={messageUploading}
        onSendMessage={onSendMessage}
        onFileUpload={onFileUpload}
      />

      {/* Payment Summary — collapsible */}
      <CollapsiblePaymentSummary booking={booking} />

      {/* Rental Agreement */}
      {onViewAgreement && (
        <RentalAgreementButton onViewAgreement={onViewAgreement} />
      )}

      {/* Cancel / Modify Actions */}
      <div className="grid grid-cols-2 gap-2">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t('cancel')}
          </button>
        )}
        {onModify && (
          <button
            onClick={onModify}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {t('modify')}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Booking Info Grid (pre-trip with real addresses) ───────────────────────

function BookingInfoGrid({ booking, bookingCode, onCopyCode, copiedCode, pickupAddress, dropoffAddress, statusBadge, statusColor }: {
  booking: any; bookingCode: string; onCopyCode: () => void; copiedCode: boolean;
  pickupAddress: string; dropoffAddress: string; statusBadge: string; statusColor: string
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
          <p className={`text-xs font-semibold ${statusColor}`}>
            {statusBadge}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* Row 2: Pickup + Dropoff with addresses */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('pickup')}</p>
          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{formatDate(booking.startDate)}</p>
          <p className="text-[11px] text-gray-500">{booking.startTime}</p>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-1.5 mb-0.5">{t('location')}</p>
          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{pickupAddress}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('dropoff')}</p>
          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{formatDate(booking.endDate)}</p>
          <p className="text-[11px] text-gray-500">{booking.endTime}</p>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-1.5 mb-0.5">{t('location')}</p>
          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{dropoffAddress}</p>
        </div>
      </div>
    </div>
  )
}
