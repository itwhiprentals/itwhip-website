// CompletedCard — trip ended, single-column layout with review + charges + collapsible sidebar/messages

import React from 'react'
import { useTranslations } from 'next-intl'
import { Booking, Message } from '../../types'
import { CarPhotoOverlay } from './CarPhotoOverlay'
import { CheckCircle, XCircle, Copy, Clock, User } from '../Icons'
import { formatDate, formatCurrency } from '../../utils/helpers'
import { BookingSidebar } from '../BookingSidebar'
import { MessagesPanel } from '../MessagesPanel'
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

      {/* Host + Messages combined card */}
      {booking.status !== 'CANCELLED' && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Host section */}
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 border-[3px] border-gray-300 dark:border-gray-600">
                {booking.host.profilePhoto ? (
                  <img src={booking.host.profilePhoto} alt={booking.host.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{booking.host.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-yellow-500 text-xs">★</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{booking.host.rating.toFixed(1)}</span>
                  <span className="text-gray-300 dark:text-gray-600 text-xs">•</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">~{booking.host.responseTime}min</span>
                </div>
              </div>
              <a
                href="/messages"
                className="flex-shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                {t('messageHost')}
              </a>
            </div>
          </div>
          {/* Collapsible messages section (read-only) */}
          <details className="group border-t border-gray-200 dark:border-gray-700">
            <summary className="flex items-center justify-between cursor-pointer px-4 py-3 select-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('messages')}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{t('messagesLocked')}</span>
              </div>
              <svg className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <MessagesPanel
                bookingId={booking.id}
                messages={messages}
                loading={messagesLoading}
                sending={messageSending}
                error={messageError}
                onSendMessage={onSendMessage}
                onFileUpload={onFileUpload}
                uploadingFile={messageUploading}
                noWrapper
                readOnly
              />
            </div>
          </details>
        </div>
      )}

      {/* Charges Status */}
      <ChargesStatus booking={booking} />

      {/* Payment Summary — collapsible */}
      <details className="group bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <summary className="flex items-center justify-between cursor-pointer px-4 py-3 select-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('paymentSummary')}</span>
          </div>
          <svg className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <BookingSidebar
            booking={booking}
            onCancelClick={() => {}}
            onUploadClick={() => {}}
            onAddToCalendar={() => {}}
            uploadingFile={false}
          />
        </div>
      </details>

      {/* Rental Agreement */}
      {onViewAgreement && (
        <button
          onClick={onViewAgreement}
          className="w-full flex items-center justify-between bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('rentalAgreement')}</span>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
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
