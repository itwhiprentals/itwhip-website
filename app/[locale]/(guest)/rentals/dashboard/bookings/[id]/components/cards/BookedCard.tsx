// BookedCard — PENDING status, not yet verified, no issues

import React from 'react'
import { useTranslations } from 'next-intl'
import { Booking } from '../../types'
import { CarPhotoOverlay } from './CarPhotoOverlay'
import { TripDetailsBar } from './TripDetailsBar'
import { ActionButtons } from './ActionButtons'

interface BookedCardProps {
  booking: Booking
  onCancel: () => void
  onModify: () => void
  onAgreement: () => void
}

export const BookedCard: React.FC<BookedCardProps> = ({
  booking,
  onCancel,
  onModify,
  onAgreement,
}) => {
  const t = useTranslations('BookingDetail')

  return (
    <div className="mt-3">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <CarPhotoOverlay car={booking.car} />

        {/* Status message */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t('bookingReceived')}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {booking.paymentStatus?.toUpperCase() === 'AUTHORIZED'
                  ? t('paymentAuthorizedDesc')
                  : t('paymentOnHoldShort')}
              </p>
            </div>
          </div>
        </div>

        <TripDetailsBar
          bookingCode={booking.bookingCode}
          startDate={booking.startDate}
          endDate={booking.endDate}
          startTime={booking.startTime}
          endTime={booking.endTime}
          statusBadge={{
            label: t('pendingBadge'),
            color: 'text-blue-600 dark:text-blue-400',
          }}
        />

        <ActionButtons
          onCancel={onCancel}
          onModify={onModify}
          onAgreement={onAgreement}
        />
      </div>
    </div>
  )
}
