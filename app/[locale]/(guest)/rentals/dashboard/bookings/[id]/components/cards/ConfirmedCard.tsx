// ConfirmedCard — CONFIRMED status, onboarding complete, pre-trip inspection
// Follows BookedCard/VerifiedCard pattern: CarPhotoOverlay + status + TripDetailsBar + ActionButtons

import React from 'react'
import { useTranslations } from 'next-intl'
import { Booking } from '../../types'
import { CarPhotoOverlay } from './CarPhotoOverlay'
import { TripDetailsBar } from './TripDetailsBar'
import { ActionButtons } from './ActionButtons'

interface ConfirmedCardProps {
  booking: Booking
  onCancel: () => void
  onModify: () => void
  onAgreement: () => void
}

export const ConfirmedCard: React.FC<ConfirmedCardProps> = ({
  booking,
  onCancel,
  onModify,
  onAgreement,
}) => {
  const t = useTranslations('BookingDetail')

  // Build full address: street, city, state zip
  const fullAddress = [
    booking.exactAddress || booking.car.address,
    [booking.car.city, booking.car.state].filter(Boolean).join(', '),
    booking.car.zipCode,
  ].filter(Boolean).join(', ')

  const dropoffFullAddress = fullAddress

  // Late pickup detection: current time past scheduled pickup
  const now = new Date()
  const [hours, minutes] = (booking.startTime || '10:00').split(':').map(Number)
  const scheduled = new Date(booking.startDate)
  scheduled.setHours(hours, minutes, 0, 0)
  const isLatePickup = now.getTime() > scheduled.getTime()

  return (
    <div className="mt-3">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <CarPhotoOverlay car={booking.car} />

        {/* Status message — confirmed green */}
        <div className="p-4 bg-green-50 dark:bg-green-950/20">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-200">
                {t('bookingConfirmed')}
              </p>
              <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                {t('bookingConfirmedDesc')}
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
            label: t('confirmedBadge'),
            color: 'text-green-600 dark:text-green-400',
          }}
          pickupAddress={fullAddress}
          dropoffAddress={dropoffFullAddress}
          showLocationNote={false}
          latePickup={isLatePickup}
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
