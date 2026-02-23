// Trip details bar — shared across Booked/Verified/Issues/OnHold/Confirmed cards

import React from 'react'
import { useTranslations } from 'next-intl'
import { formatDate } from '../../utils/helpers'

interface TripDetailsBarProps {
  bookingCode: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  statusBadge: { label: string; color: string }
  pickupAddress?: string
  dropoffAddress?: string
  showLocationNote?: boolean
  locationNoteKey?: string
  latePickup?: boolean
}

export const TripDetailsBar: React.FC<TripDetailsBarProps> = ({
  bookingCode,
  startDate,
  endDate,
  startTime,
  endTime,
  statusBadge,
  pickupAddress,
  dropoffAddress,
  showLocationNote = true,
  locationNoteKey = 'locationAfterConfirmation',
  latePickup = false,
}) => {
  const t = useTranslations('BookingDetail')

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {t('confirmationNumber')}
          </p>
          <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
            {bookingCode}
          </p>
          <div className="flex items-center gap-1.5 mt-3">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {t('pickup')}
            </p>
            {latePickup && (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 leading-none animate-pulse">
                {t('latePickup')}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(startDate)} at {startTime}
          </p>
          {pickupAddress && (
            <>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-3">
                {t('location')}
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                {pickupAddress}
              </p>
            </>
          )}
          {locationNoteKey === 'completeVerificationForLocation' && (
            <p className="text-xs text-gray-500 italic mt-3">
              {t('completeVerificationForLocation')}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0 pl-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {t('statusLabel')}
          </p>
          <p className={`text-xs font-semibold uppercase ${statusBadge.color}`}>
            {statusBadge.label}
          </p>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-3">
            {t('dropoff')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(endDate)} at {endTime}
          </p>
          {dropoffAddress && (
            <>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-3">
                {t('location')}
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                {dropoffAddress}
              </p>
            </>
          )}
          {locationNoteKey === 'completeVerificationForLocation' && (
            <p className="text-xs text-gray-500 italic mt-3">
              {t('completeVerificationForLocation')}
            </p>
          )}
        </div>
      </div>
      {showLocationNote && locationNoteKey !== 'completeVerificationForLocation' && (
        <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-2">
          {t(locationNoteKey as any)}
        </p>
      )}
    </div>
  )
}
