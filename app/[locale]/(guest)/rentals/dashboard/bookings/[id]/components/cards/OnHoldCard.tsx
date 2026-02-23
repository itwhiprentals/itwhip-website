// OnHoldCard — identity verification required

import React from 'react'
import { useTranslations } from 'next-intl'
import { Booking } from '../../types'
import { CarPhotoOverlay } from './CarPhotoOverlay'
import { TripDetailsBar } from './TripDetailsBar'
import { ActionButtons } from './ActionButtons'

interface OnHoldCardProps {
  booking: Booking
  onCancel: () => void
  onModify: () => void
  onAgreement: () => void
}

export const OnHoldCard: React.FC<OnHoldCardProps> = ({
  booking,
  onCancel,
  onModify,
  onAgreement,
}) => {
  const t = useTranslations('BookingDetail')

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
    <div className="mt-3">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <CarPhotoOverlay car={booking.car} />

        {/* Verify identity content */}
        <div className="p-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
            {t('verificationHoldDesc')}
          </p>
          <button
            onClick={handleVerifyIdentity}
            className="mt-3 w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {t('verifyIdentity')}
          </button>
        </div>

        <TripDetailsBar
          bookingCode={booking.bookingCode}
          startDate={booking.startDate}
          endDate={booking.endDate}
          startTime={booking.startTime}
          endTime={booking.endTime}
          statusBadge={{
            label: t('onHoldBadge'),
            color: 'text-red-600 dark:text-red-400',
          }}
          locationNoteKey="completeVerificationForLocation"
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
