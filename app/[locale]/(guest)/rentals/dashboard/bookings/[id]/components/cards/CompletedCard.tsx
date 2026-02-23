// CompletedCard — trip ended, single-column layout with review + charges + shared sections

import React from 'react'
import { useTranslations } from 'next-intl'
import { Booking, Message } from '../../types'
import { CarPhotoOverlay } from './CarPhotoOverlay'
import { HostMessagesCard, CollapsiblePaymentSummary, RentalAgreementButton } from './SharedCardSections'
import { CheckCircle, XCircle, Copy, Clock } from '../Icons'
import { formatDate, formatCurrency } from '../../utils/helpers'
import GuestReviewModal from '../../../../../components/review/GuestReviewModal'

interface CompletedCardProps {
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

export const CompletedCard: React.FC<CompletedCardProps> = ({
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
      {/* Trip Card with Car Photo */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <CarPhotoOverlay car={booking.car} />
        <div className="p-4">
          {/* Trip Completed / No Show badge */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`${!booking.tripStartedAt ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'} rounded-full p-1`}>
              {!booking.tripStartedAt
                ? <XCircle className="w-5 h-5 text-red-600" />
                : <CheckCircle className="w-5 h-5 text-green-600" />
              }
            </div>
            <div>
              <p className={`text-sm font-semibold ${!booking.tripStartedAt ? 'text-red-900 dark:text-red-200' : 'text-gray-900 dark:text-gray-100'}`}>
                {!booking.tripStartedAt ? t('noShowBadge') : t('tripCompletedTitle')}
              </p>
              <p className={`text-xs ${!booking.tripStartedAt ? 'text-red-600 dark:text-red-400' : 'text-gray-500'}`}>
                {!booking.tripStartedAt ? t('noShowBadgeDesc') : t('thankYouForChoosing')}
              </p>
            </div>
          </div>

          {/* Trip Stats Grid */}
          <TripStatsGrid booking={booking} bookingCode={booking.bookingCode} onCopyCode={copyBookingCode} copiedCode={copiedCode} />

          {/* Rate Your Experience — only for trips that were actually taken */}
          {booking.tripStartedAt && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <GuestReviewModal
                booking={{
                  id: booking.id,
                  car: { make: booking.car.make, model: booking.car.model, year: booking.car.year },
                  host: { name: booking.host?.name || 'Host' },
                  tripStartedAt: booking.tripStartedAt as string,
                  tripEndedAt: booking.tripEndedAt as string,
                  tripStatus: booking.tripStatus,
                  fraudulent: (booking as any).fraudulent,
                  guestName: booking.guestName,
                  guestEmail: booking.guestEmail,
                }}
                guestToken={booking.guestToken || ''}
              />
            </div>
          )}
        </div>
      </div>

      {/* Host + Messages combined card (read-only) */}
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

      {/* Charges Status */}
      <ChargesStatus booking={booking} />

      {/* Payment Summary — collapsible */}
      <CollapsiblePaymentSummary booking={booking} />

      {/* Rental Agreement */}
      {onViewAgreement && (
        <RentalAgreementButton onViewAgreement={onViewAgreement} />
      )}
    </div>
  )
}

// ─── Trip Stats Grid ────────────────────────────────────────────────────────

function TripStatsGrid({ booking, bookingCode, onCopyCode, copiedCode }: { booking: Booking; bookingCode: string; onCopyCode: () => void; copiedCode: boolean }) {
  const t = useTranslations('BookingDetail')

  const tripDuration =
    booking.tripStartedAt && booking.tripEndedAt
      ? (() => {
          const start = new Date(booking.tripStartedAt)
          const end = new Date(booking.tripEndedAt)
          const diff = end.getTime() - start.getTime()
          const days = Math.floor(diff / (1000 * 60 * 60 * 24))
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          if (days > 0) return `${days}d ${hours}h`
          return `${hours}h`
        })()
      : null

  const totalMiles =
    (booking as any).startMileage && (booking as any).endMileage
      ? (booking as any).endMileage - (booking as any).startMileage
      : null

  const isNoShow = !booking.tripStartedAt

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
          <p className={`text-xs font-semibold ${isNoShow ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {isNoShow ? t('noShow') : t('tripFinished')}
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

      {/* Row 3: Trip stats (duration, miles, fuel) — only if trip was taken */}
      {(tripDuration || totalMiles !== null || ((booking as any).fuelLevelStart && (booking as any).fuelLevelEnd)) && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-700" />
          <div className="flex items-start gap-4">
            {tripDuration && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('durationLabel')}</p>
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{tripDuration}</p>
              </div>
            )}
            {totalMiles !== null && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('milesDriven')}</p>
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{totalMiles} mi</p>
              </div>
            )}
            {(booking as any).fuelLevelStart && (booking as any).fuelLevelEnd && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{t('fuelLabel')}</p>
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {(booking as any).fuelLevelStart} → {(booking as any).fuelLevelEnd}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Charges Status ─────────────────────────────────────────────────────────

function ChargesStatus({ booking }: { booking: Booking }) {
  const t = useTranslations('BookingDetail')

  let extraCharges: any = null
  if ((booking as any).extras) {
    try {
      extraCharges = JSON.parse((booking as any).extras)
    } catch {}
  }

  if (extraCharges && extraCharges.total > 0) {
    return (
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-3">{t('additionalChargesTitle')}</h4>
        <div className="space-y-2">
          {extraCharges.breakdown?.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-amber-800 dark:text-amber-300">{item.label}</span>
              <span className="font-medium text-amber-900 dark:text-amber-200">{formatCurrency(item.amount)}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-amber-200 dark:border-amber-700">
            <div className="flex justify-between font-medium">
              <span className="text-amber-900 dark:text-amber-200">{t('tripTotal')}</span>
              <span className="text-amber-900 dark:text-amber-200">{formatCurrency(extraCharges.total)}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const reviewStatus = booking.hostFinalReviewStatus
  if (reviewStatus === 'PENDING_REVIEW') {
    return (
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center">
          <Clock className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200">{t('hostReviewingTrip')}</p>
            <p className="text-xs text-blue-800 dark:text-blue-300 mt-1">{t('depositReleaseWithin24h')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (reviewStatus === 'CLAIM_FILED') {
    return (
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-center">
          <XCircle className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{t('hostReportedIssue')}</p>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">{t('depositOnHoldPendingReview')}</p>
          </div>
        </div>
      </div>
    )
  }

  // APPROVED, AUTO_APPROVED, or null (legacy)
  return (
    <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
      <div className="flex items-center">
        <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-green-900 dark:text-green-200">{t('noAdditionalChargesTitle')}</p>
          <p className="text-xs text-green-800 dark:text-green-300 mt-1">{t('depositReleaseMessage')}</p>
        </div>
      </div>
    </div>
  )
}
