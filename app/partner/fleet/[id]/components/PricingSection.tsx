// app/partner/fleet/[id]/components/PricingSection.tsx

'use client'

import Link from 'next/link'
import { IoCreateOutline, IoCashOutline } from 'react-icons/io5'

interface PricingSectionProps {
  vehicleId: string
  vehicleType: string  // 'RENTAL' or 'RIDESHARE'
  dailyRate: number
  weeklyRate: number | null
  monthlyRate: number | null
  includedMilesPerDay: number | null
  overageMileRate: number | null
}

export default function PricingSection({
  vehicleId,
  vehicleType,
  dailyRate,
  weeklyRate,
  monthlyRate,
  includedMilesPerDay,
  overageMileRate
}: PricingSectionProps) {
  const isRideshare = vehicleType === 'RIDESHARE'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <IoCashOutline className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
          Pricing
        </h2>
        <Link
          href={`/partner/fleet/${vehicleId}/edit?tab=pricing`}
          className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-xs sm:text-sm flex items-center gap-1 transition-colors"
        >
          <IoCreateOutline className="w-4 h-4" />
          Edit
        </Link>
      </div>

      {/* Vehicle Type Badge */}
      <div className="mb-3 sm:mb-4">
        {isRideshare ? (
          <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400">
            RIDESHARE
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400">
            RENTAL
          </span>
        )}
      </div>

      {/* Pricing Display */}
      {isRideshare ? (
        <div>
          {/* Daily Rate - Prominent */}
          <div className="mb-3 sm:mb-4">
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">Daily Rate</p>
            <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              ${dailyRate.toFixed(2)}
              <span className="text-xs sm:text-sm font-normal text-gray-500 dark:text-gray-400">/day</span>
            </p>
          </div>

          {/* Unlimited Mileage Badge */}
          <div className="mb-3 sm:mb-4">
            <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400">
              Unlimited Mileage
            </span>
          </div>

          {/* Weekly/Monthly if set */}
          {(weeklyRate || monthlyRate) && (
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {weeklyRate && (
                <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">Weekly</p>
                  <p className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">
                    ${weeklyRate.toFixed(2)}
                  </p>
                </div>
              )}
              {monthlyRate && (
                <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">Monthly</p>
                  <p className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">
                    ${monthlyRate.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* 3-Column Rate Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">Daily</p>
              <p className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">
                ${dailyRate.toFixed(2)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">Weekly</p>
              <p className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">
                {weeklyRate ? `$${weeklyRate.toFixed(2)}` : '--'}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">Monthly</p>
              <p className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">
                {monthlyRate ? `$${monthlyRate.toFixed(2)}` : '--'}
              </p>
            </div>
          </div>

          {/* Mileage Info */}
          <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1">
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              Included: <span className="font-medium">{includedMilesPerDay || 200} miles/day</span>
            </p>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              Overage: <span className="font-medium">${(overageMileRate || 0.35).toFixed(2)}/mile</span>
            </p>
          </div>
        </div>
      )}

      {/* Footer Helper Text */}
      <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
        Set your rates based on your vehicle type. Rideshare vehicles have unlimited mileage. Rental vehicles use per-day pricing with mileage limits.
      </p>
    </div>
  )
}
