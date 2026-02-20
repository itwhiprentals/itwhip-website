// app/partner/fleet/[id]/components/PickupLocationCard.tsx

'use client'

import Link from 'next/link'
import {
  IoCreateOutline,
  IoLocationOutline,
  IoInformationCircleOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline
} from 'react-icons/io5'

interface PickupLocationCardProps {
  vehicleId: string
  city: string
  state: string
  zipCode: string
  address: string
  advanceNotice: number   // hours
  minTripDuration: number  // days
  maxTripDuration: number  // days
  instantBook: boolean
}

export default function PickupLocationCard({
  vehicleId,
  city,
  state,
  zipCode,
  address,
  advanceNotice,
  minTripDuration,
  maxTripDuration,
  instantBook
}: PickupLocationCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <IoLocationOutline className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
          Pickup &amp; Availability
        </h2>
        <Link
          href={`/partner/fleet/${vehicleId}/edit?tab=availability`}
          className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-xs sm:text-sm flex items-center gap-1 transition-colors"
        >
          <IoCreateOutline className="w-4 h-4" />
          Edit
        </Link>
      </div>

      {/* Location */}
      <div className="mb-3 sm:mb-4">
        <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
          {city}, {state} ({zipCode})
        </p>
        {address && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            {address}
          </p>
        )}
      </div>

      {/* Info Note */}
      <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
          <IoInformationCircleOutline className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Exact pickup address will be provided after booking confirmation.</span>
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700 mb-3 sm:mb-4" />

      {/* Availability Details - 2 Column Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">Advance notice</p>
          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
            {advanceNotice} hours
          </p>
        </div>
        <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">Min rental</p>
          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
            {minTripDuration} day{minTripDuration !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">Max rental</p>
          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
            {maxTripDuration} day{maxTripDuration !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">Instant Book</p>
          <div className="mt-0.5">
            {instantBook ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400">
                <IoCheckmarkCircleOutline className="w-3 h-3" />
                Enabled
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400">
                <IoCloseCircleOutline className="w-3 h-3" />
                Disabled
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Helper Text */}
      <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
        This is the pickup location guests will see after their booking is confirmed.
      </p>
    </div>
  )
}
