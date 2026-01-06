// app/host/claims/components/ChargeBreakdown.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  IoCarOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoCashOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoChevronDownOutline,
  IoChevronUpOutline
} from 'react-icons/io5'

interface Booking {
  id: string
  bookingCode: string
  startDate: string
  endDate: string
  tripEndedAt: string | null
  car: {
    make: string
    model: string
    year: number
    photos: Array<{ url: string }>
  }
  guest: {
    name: string
  } | null
  guestName: string | null
  tripCharges?: {
    id: string
    mileageCharge: number
    fuelCharge: number
    lateCharge: number
    damageCharge: number
    cleaningCharge: number
    otherCharges: number
    totalCharges: number
    chargeStatus: string
    disputes: string | null
  }
}

interface ChargeBreakdownProps {
  booking: Booking
  existingCharges?: Booking['tripCharges']
}

export default function ChargeBreakdown({ booking, existingCharges }: ChargeBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [imageError, setImageError] = useState(false)

  const carPhoto = booking.car.photos?.[0]?.url
  const guestName = booking.guest?.name || booking.guestName || 'Guest'

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Get charge status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30'
      case 'CHARGED':
      case 'ADJUSTED_CHARGED':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
      case 'DISPUTED':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30'
      case 'WAIVED':
      case 'FULLY_WAIVED':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
      default:
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
    }
  }

  // Format charge label
  const formatChargeLabel = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header - Always visible */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Car photo */}
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
            {carPhoto && !imageError ? (
              <Image
                src={carPhoto}
                alt={`${booking.car.year} ${booking.car.make} ${booking.car.model}`}
                width={64}
                height={64}
                className="object-cover w-full h-full"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <IoCarOutline className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
            )}
          </div>

          {/* Booking info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {booking.car.year} {booking.car.make} {booking.car.model}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              {booking.bookingCode}
            </p>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <IoCalendarOutline className="w-3 h-3" />
                {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
              </span>
              <span className="flex items-center gap-1">
                <IoPersonOutline className="w-3 h-3" />
                {guestName}
              </span>
            </div>
          </div>

          {/* Expand/Collapse button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <IoChevronUpOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <IoChevronDownOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          {existingCharges ? (
            <>
              {/* Existing charges header */}
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <IoCashOutline className="w-4 h-4" />
                  Existing Trip Charges
                </h5>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(existingCharges.chargeStatus)}`}>
                  {formatChargeLabel(existingCharges.chargeStatus)}
                </span>
              </div>

              {/* Charge breakdown */}
              <div className="space-y-2 mb-3">
                {existingCharges.mileageCharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Excess Mileage</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${existingCharges.mileageCharge.toFixed(2)}
                    </span>
                  </div>
                )}
                {existingCharges.fuelCharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Fuel Charges</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${existingCharges.fuelCharge.toFixed(2)}
                    </span>
                  </div>
                )}
                {existingCharges.lateCharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Late Return</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${existingCharges.lateCharge.toFixed(2)}
                    </span>
                  </div>
                )}
                {existingCharges.damageCharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Damage</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${existingCharges.damageCharge.toFixed(2)}
                    </span>
                  </div>
                )}
                {existingCharges.cleaningCharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Cleaning</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${existingCharges.cleaningCharge.toFixed(2)}
                    </span>
                  </div>
                )}
                {existingCharges.otherCharges > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Other Charges</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${existingCharges.otherCharges.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Total Existing Charges
                  </span>
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    ${existingCharges.totalCharges.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Dispute warning */}
              {existingCharges.disputes && (
                <div className="mt-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <IoWarningOutline className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-medium text-orange-900 dark:text-orange-200 mb-1">
                        Guest Disputed Charges
                      </p>
                      <p className="text-orange-800 dark:text-orange-300">
                        The guest has disputed some or all of these charges. Additional charges will also require review.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Info note */}
              <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <IoAlertCircleOutline className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    These charges were generated from the trip end inspection. You can add additional charges below that were discovered later.
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* No existing charges */
            <div className="text-center py-4">
              <IoCheckmarkCircleOutline className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                No Automatic Charges
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This trip had no charges from the end inspection. You can add any charges discovered after the trip.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}