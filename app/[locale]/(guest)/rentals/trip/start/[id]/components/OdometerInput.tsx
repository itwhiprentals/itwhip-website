// app/(guest)/rentals/trip/start/[id]/components/OdometerInput.tsx

'use client'

import { useState, useEffect } from 'react'
import { validateOdometer } from '@/app/lib/trip/validation'
import {
  IoSpeedometer,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoInformationCircle,
} from 'react-icons/io5'

interface OdometerInputProps {
  booking: any
  data: any
  onOdometerChange: (value: number) => void
}

export function OdometerInput({ booking, data, onOdometerChange }: OdometerInputProps) {
  const [odometerValue, setOdometerValue] = useState(data.odometer?.toString() || '')
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    if (odometerValue) {
      const validation = validateOdometer(odometerValue)
      setIsValid(validation.valid)
      setError(validation.valid ? null : validation.error || null)
    } else {
      setIsValid(false)
      setError(null)
    }
  }, [odometerValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 6) {
      setOdometerValue(value)
      if (value) {
        onOdometerChange(parseInt(value, 10))
      }
    }
  }

  const formatOdometer = (value: string) => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  // Pad to 6 digits for display
  const displayDigits = odometerValue.padStart(6, '0').split('')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
          <IoSpeedometer className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Odometer Reading</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Record the exact mileage shown on the dashboard</p>
        </div>
      </div>

      {/* Digital odometer display */}
      <div className="bg-gray-900 dark:bg-black rounded-xl p-6 shadow-inner">
        <div className="flex justify-center gap-1.5">
          {displayDigits.map((digit, i) => (
            <div
              key={i}
              className={`w-10 h-14 sm:w-12 sm:h-16 rounded-lg flex items-center justify-center text-2xl sm:text-3xl font-mono font-bold transition-all ${
                i < 6 - odometerValue.length
                  ? 'bg-gray-800 dark:bg-gray-900 text-gray-600 dark:text-gray-700'
                  : 'bg-gray-700 dark:bg-gray-800 text-green-400'
              }`}
            >
              {digit}
            </div>
          ))}
          <div className="flex items-end pb-2 ml-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">mi</span>
          </div>
        </div>

        {/* Formatted number below */}
        {odometerValue && (
          <p className="text-center mt-3 text-sm font-medium text-gray-400">
            {formatOdometer(odometerValue)} miles
          </p>
        )}
      </div>

      {/* Input field */}
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
          Enter mileage
        </label>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={odometerValue}
            onChange={handleChange}
            placeholder="Enter odometer reading"
            className={`w-full text-lg font-semibold py-3 px-4 pr-20 border-2 rounded-xl bg-white dark:bg-gray-900 transition-colors focus:outline-none ${
              error
                ? 'border-red-400 dark:border-red-500 focus:border-red-500'
                : isValid
                ? 'border-green-400 dark:border-green-500 focus:border-green-500'
                : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400'
            } text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600`}
            maxLength={6}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 dark:text-gray-500">
            miles
          </span>
        </div>

        {/* Validation feedback */}
        {error && (
          <div className="flex items-center gap-1.5 mt-2">
            <IoAlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        {isValid && !error && (
          <div className="flex items-center gap-1.5 mt-2">
            <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <p className="text-xs text-green-600 dark:text-green-400">Valid reading</p>
          </div>
        )}
      </div>

      {/* Mileage allowance card */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <IoInformationCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mileage Allowance</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Daily included</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">200 miles/day</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total for {booking.numberOfDays || 1} day{(booking.numberOfDays || 1) > 1 ? 's' : ''}</span>
          <span className="text-sm font-bold text-green-600 dark:text-green-400">{(booking.numberOfDays || 1) * 200} miles</span>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
          <span className="text-xs text-gray-500 dark:text-gray-500">
            Overage rate: $0.45/mile beyond included allowance
          </span>
        </div>
      </div>
    </div>
  )
}
