// VerifiedCard — PENDING status + docs approved, awaiting fleet confirmation

import React from 'react'
import { useTranslations } from 'next-intl'
import { Booking } from '../../types'
import { CarPhotoOverlay } from './CarPhotoOverlay'
import { TripDetailsBar } from './TripDetailsBar'
import { ActionButtons } from './ActionButtons'

interface VerifiedCardProps {
  booking: Booking
  onCancel: () => void
  onModify: () => void
  onAgreement: () => void
}

export const VerifiedCard: React.FC<VerifiedCardProps> = ({
  booking,
  onCancel,
  onModify,
  onAgreement,
}) => {
  const t = useTranslations('BookingDetail')

  return (
    <div className="mt-3">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-green-200 dark:border-green-800 overflow-hidden">
        <CarPhotoOverlay car={booking.car} />

        {/* Status message — green tinted */}
        <div className="p-4 bg-green-50 dark:bg-green-950/20">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-200">
                {t('docsVerifiedTitle')}
              </p>
              <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                {t('docsVerifiedAwaitingConfirmation')}
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
            label: t('verifiedBadge'),
            color: 'text-green-600 dark:text-green-400',
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
