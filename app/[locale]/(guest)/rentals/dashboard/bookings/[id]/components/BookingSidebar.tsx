// app/(guest)/rentals/dashboard/bookings/[id]/components/BookingSidebar.tsx

import React, { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Booking } from '../types'
import { User, Phone } from './Icons'
import { PaymentSummary } from './PaymentSummary'

interface BookingSidebarProps {
  booking: Booking
  onCancelClick: () => void
  onUploadClick: () => void
  onAddToCalendar: () => void
  uploadingFile: boolean
}

export const BookingSidebar: React.FC<BookingSidebarProps> = ({
  booking,
}) => {
  const t = useTranslations('BookingDetail')

  return (
    <div className="space-y-4 lg:space-y-6">
      <PaymentSummary booking={booking} />
      {booking.status !== 'PENDING' && booking.status !== 'CONFIRMED' && booking.status !== 'CANCELLED' && booking.status !== 'NO_SHOW' && <HostCard booking={booking} t={t} />}
    </div>
  )
}

// ─── Host Card ───────────────────────────────────────────────────────────────

function HostCard({
  booking,
  t,
}: {
  booking: Booking
  t: ReturnType<typeof useTranslations>
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 sm:p-5 lg:p-6">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
        {t('host')}
      </h2>

      <div className="flex items-start gap-2.5 sm:gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
            {booking.host.name}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
            <div className="flex items-center">
              <span className="text-yellow-500 text-xs sm:text-sm">★</span>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 ml-0.5">
                {booking.host.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-300 dark:text-gray-600 text-xs">•</span>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              ~{booking.host.responseTime}min
            </span>
          </div>
        </div>
      </div>

      {(booking.status === 'ACTIVE' || booking.status === 'CONFIRMED') &&
        booking.tripStatus !== 'COMPLETED' && (
          <CallHostButton bookingId={booking.id} t={t} />
        )}
    </div>
  )
}

// ─── Call Host Button ────────────────────────────────────────────────────────

function CallHostButton({
  bookingId,
  t,
}: {
  bookingId: string
  t: ReturnType<typeof useTranslations>
}) {
  const [calling, setCalling] = useState(false)
  const [callStatus, setCallStatus] = useState<
    'idle' | 'calling' | 'connected' | 'error'
  >('idle')

  const handleCallHost = useCallback(async () => {
    if (calling) return
    setCalling(true)
    setCallStatus('calling')

    try {
      const res = await fetch('/api/twilio/masked-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bookingId }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Call failed')
      }

      setCallStatus('connected')
      setTimeout(() => setCallStatus('idle'), 5000)
    } catch (err: any) {
      console.error('[Call Host]', err)
      setCallStatus('error')
      setTimeout(() => setCallStatus('idle'), 3000)
    } finally {
      setCalling(false)
    }
  }, [bookingId, calling])

  return (
    <div className="mt-3 sm:mt-4">
      <button
        onClick={handleCallHost}
        disabled={calling}
        className={`w-full px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 sm:gap-2 ${
          callStatus === 'connected'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : callStatus === 'error'
              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
        }`}
      >
        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        {callStatus === 'calling'
          ? t('callingHost')
          : callStatus === 'connected'
            ? t('callConnecting')
            : callStatus === 'error'
              ? t('callFailed')
              : t('callHost')}
      </button>
      {callStatus === 'connected' && (
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 text-center">
          {t('callHostHint')}
        </p>
      )}
    </div>
  )
}
