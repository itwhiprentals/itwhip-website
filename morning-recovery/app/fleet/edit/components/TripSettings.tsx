// app/sys-2847/fleet/edit/components/TripSettings.tsx
'use client'

import { useState } from 'react'

interface TripSettingsProps {
  minTripDuration?: number
  maxTripDuration?: number
  advanceNotice?: number
  instantBook?: boolean
  mileageDaily?: number
  mileageWeekly?: number
  mileageMonthly?: number
  bufferTime?: number
  cancellationPolicy?: string
  checkInTime?: string
  checkOutTime?: string
  onChange: (field: string, value: any) => void
}

const CANCELLATION_POLICIES = [
  { 
    value: 'flexible', 
    label: 'Flexible',
    description: 'Free cancellation up to 24 hours before trip'
  },
  { 
    value: 'moderate', 
    label: 'Moderate',
    description: 'Free cancellation up to 48 hours before trip'
  },
  { 
    value: 'strict', 
    label: 'Strict',
    description: 'Free cancellation up to 7 days before trip'
  },
  { 
    value: 'super_strict', 
    label: 'Super Strict',
    description: 'No refund after booking confirmation'
  }
]

export function TripSettings({
  minTripDuration = 1,
  maxTripDuration = 30,
  advanceNotice = 2,
  instantBook = true,
  mileageDaily = 200,
  mileageWeekly = 1000,
  mileageMonthly = 3000,
  bufferTime = 2,
  cancellationPolicy = 'moderate',
  checkInTime = '10:00',
  checkOutTime = '10:00',
  onChange
}: TripSettingsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Calculate mileage overage preview
  const calculateMileageOverage = (duration: number) => {
    if (duration <= 1) return mileageDaily
    if (duration <= 7) return Math.round(mileageDaily * duration)
    if (duration <= 30) return mileageWeekly
    return mileageMonthly
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Trip Settings & Policies
      </h3>

      <div className="space-y-6">
        {/* Trip Duration */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Trip Duration Limits
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Minimum Trip (days)
              </label>
              <input
                type="number"
                value={minTripDuration}
                onChange={(e) => onChange('minTripDuration', parseInt(e.target.value))}
                min="1"
                max="30"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Shortest rental period allowed
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Maximum Trip (days)
              </label>
              <input
                type="number"
                value={maxTripDuration}
                onChange={(e) => onChange('maxTripDuration', parseInt(e.target.value))}
                min="1"
                max="365"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Longest rental period allowed
              </p>
            </div>
          </div>
        </div>

        {/* Booking Settings */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Booking Settings
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Advance Notice (hours)
                </label>
                <select
                  value={advanceNotice}
                  onChange={(e) => onChange('advanceNotice', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">No notice needed</option>
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="6">6 hours</option>
                  <option value="12">12 hours</option>
                  <option value="24">1 day</option>
                  <option value="48">2 days</option>
                  <option value="72">3 days</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  How far in advance bookings must be made
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Buffer Time Between Trips (hours)
                </label>
                <select
                  value={bufferTime}
                  onChange={(e) => onChange('bufferTime', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">No buffer</option>
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours</option>
                  <option value="6">6 hours</option>
                  <option value="12">12 hours</option>
                  <option value="24">1 day</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Time needed between trips for cleaning/prep
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="instantBook"
                checked={instantBook}
                onChange={(e) => onChange('instantBook', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="instantBook" className="text-sm text-gray-700 dark:text-gray-300">
                Enable Instant Book
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                (Guests can book without host approval)
              </span>
            </div>
          </div>
        </div>

        {/* Mileage Limits */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Mileage Allowance
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Daily (miles)
              </label>
              <input
                type="number"
                value={mileageDaily}
                onChange={(e) => onChange('mileageDaily', parseInt(e.target.value))}
                min="0"
                max="500"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Weekly (miles)
              </label>
              <input
                type="number"
                value={mileageWeekly}
                onChange={(e) => onChange('mileageWeekly', parseInt(e.target.value))}
                min="0"
                max="3000"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Monthly (miles)
              </label>
              <input
                type="number"
                value={mileageMonthly}
                onChange={(e) => onChange('mileageMonthly', parseInt(e.target.value))}
                min="0"
                max="10000"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Mileage Preview */}
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Mileage allowance examples:</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-gray-500 dark:text-gray-400">1 day:</span>
                <span className="ml-1 text-gray-900 dark:text-white">{calculateMileageOverage(1)} mi</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">3 days:</span>
                <span className="ml-1 text-gray-900 dark:text-white">{calculateMileageOverage(3)} mi</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">7 days:</span>
                <span className="ml-1 text-gray-900 dark:text-white">{calculateMileageOverage(7)} mi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Cancellation Policy
          </h4>
          <div className="space-y-2">
            {CANCELLATION_POLICIES.map(policy => (
              <label
                key={policy.value}
                className="flex items-start gap-3 p-3 rounded border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <input
                  type="radio"
                  name="cancellationPolicy"
                  value={policy.value}
                  checked={cancellationPolicy === policy.value}
                  onChange={(e) => onChange('cancellationPolicy', e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                    {policy.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {policy.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Advanced Settings */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Check-in/Check-out Times
          </button>

          {showAdvanced && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Default Check-in Time
                </label>
                <input
                  type="time"
                  value={checkInTime}
                  onChange={(e) => onChange('checkInTime', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Default Check-out Time
                </label>
                <input
                  type="time"
                  value={checkOutTime}
                  onChange={(e) => onChange('checkOutTime', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Summary Box */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
            Trip Policy Summary
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-blue-700 dark:text-blue-400">
              <span className="font-medium">Booking:</span> {instantBook ? 'Instant' : 'Request to book'}
            </div>
            <div className="text-blue-700 dark:text-blue-400">
              <span className="font-medium">Notice:</span> {advanceNotice === 0 ? 'None' : `${advanceNotice} hour${advanceNotice > 1 ? 's' : ''}`}
            </div>
            <div className="text-blue-700 dark:text-blue-400">
              <span className="font-medium">Duration:</span> {minTripDuration}-{maxTripDuration} days
            </div>
            <div className="text-blue-700 dark:text-blue-400">
              <span className="font-medium">Cancellation:</span> {CANCELLATION_POLICIES.find(p => p.value === cancellationPolicy)?.label}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}