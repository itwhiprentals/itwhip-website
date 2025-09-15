// app/sys-2847/fleet/edit/components/PricingSection.tsx
'use client'

import { useState, useEffect } from 'react'

interface PricingSectionProps {
  dailyRate?: number
  weeklyRate?: number
  monthlyRate?: number
  weeklyDiscount?: number
  monthlyDiscount?: number
  deliveryFee?: number
  insuranceDaily?: number
  cleaningFee?: number
  lateFeePerHour?: number
  additionalMileageFee?: number
  onChange: (field: string, value: number) => void
}

export function PricingSection({
  dailyRate = 0,
  weeklyRate = 0,
  monthlyRate = 0,
  weeklyDiscount = 10,
  monthlyDiscount = 20,
  deliveryFee = 150,
  insuranceDaily = 99,
  cleaningFee = 50,
  lateFeePerHour = 25,
  additionalMileageFee = 3,
  onChange
}: PricingSectionProps) {
  const [autoCalculate, setAutoCalculate] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Auto-calculate weekly and monthly rates based on daily rate and discounts
  useEffect(() => {
    if (autoCalculate && dailyRate > 0) {
      const calculatedWeekly = Math.round(dailyRate * 7 * (1 - weeklyDiscount / 100))
      const calculatedMonthly = Math.round(dailyRate * 30 * (1 - monthlyDiscount / 100))
      
      if (calculatedWeekly !== weeklyRate) {
        onChange('weeklyRate', calculatedWeekly)
      }
      if (calculatedMonthly !== monthlyRate) {
        onChange('monthlyRate', calculatedMonthly)
      }
    }
  }, [dailyRate, weeklyDiscount, monthlyDiscount, autoCalculate])

  const handleDailyRateChange = (value: number) => {
    onChange('dailyRate', value)
  }

  const handleDiscountChange = (field: string, value: number) => {
    onChange(field, value)
  }

  const toggleAutoCalculate = () => {
    setAutoCalculate(!autoCalculate)
  }

  // Calculate potential earnings
  const calculateEarnings = () => {
    const weeklyEarnings = weeklyRate || dailyRate * 7
    const monthlyEarnings = monthlyRate || dailyRate * 30
    const yearlyPotential = monthlyEarnings * 12 * 0.7 // Assuming 70% occupancy
    
    return {
      weekly: weeklyEarnings,
      monthly: monthlyEarnings,
      yearly: Math.round(yearlyPotential)
    }
  }

  const earnings = calculateEarnings()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Pricing & Fees
      </h3>

      {/* Base Pricing */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Daily Rate ($)
            </label>
            <input
              type="number"
              step="1"
              value={dailyRate || ''}
              onChange={(e) => handleDailyRateChange(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Weekly Rate ($)
            </label>
            <div className="relative">
              <input
                type="number"
                step="1"
                value={weeklyRate || ''}
                onChange={(e) => onChange('weeklyRate', parseFloat(e.target.value) || 0)}
                disabled={autoCalculate}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="Auto-calculated"
              />
              {autoCalculate && weeklyDiscount > 0 && (
                <span className="absolute right-2 top-2 text-xs text-green-600 dark:text-green-400">
                  -{weeklyDiscount}%
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monthly Rate ($)
            </label>
            <div className="relative">
              <input
                type="number"
                step="1"
                value={monthlyRate || ''}
                onChange={(e) => onChange('monthlyRate', parseFloat(e.target.value) || 0)}
                disabled={autoCalculate}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="Auto-calculated"
              />
              {autoCalculate && monthlyDiscount > 0 && (
                <span className="absolute right-2 top-2 text-xs text-green-600 dark:text-green-400">
                  -{monthlyDiscount}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Auto-calculate Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="autoCalculate"
            checked={autoCalculate}
            onChange={toggleAutoCalculate}
            className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="autoCalculate" className="text-sm text-gray-700 dark:text-gray-300">
            Auto-calculate weekly/monthly rates with discounts
          </label>
        </div>

        {/* Discounts */}
        {autoCalculate && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weekly Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={weeklyDiscount}
                onChange={(e) => handleDiscountChange('weeklyDiscount', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Monthly Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={monthlyDiscount}
                onChange={(e) => handleDiscountChange('monthlyDiscount', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Earnings Preview */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-3">
            Potential Earnings (70% occupancy estimate)
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-blue-700 dark:text-blue-400">Weekly</p>
              <p className="text-lg font-semibold text-blue-900 dark:text-blue-200">
                ${earnings.weekly.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-700 dark:text-blue-400">Monthly</p>
              <p className="text-lg font-semibold text-blue-900 dark:text-blue-200">
                ${earnings.monthly.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-700 dark:text-blue-400">Yearly</p>
              <p className="text-lg font-semibold text-blue-900 dark:text-blue-200">
                ${earnings.yearly.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Fees */}
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
            Additional Fees & Charges
          </button>

          {showAdvanced && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Delivery Fee ($)
                </label>
                <input
                  type="number"
                  step="10"
                  value={deliveryFee}
                  onChange={(e) => onChange('deliveryFee', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Daily Insurance ($)
                </label>
                <input
                  type="number"
                  step="10"
                  value={insuranceDaily}
                  onChange={(e) => onChange('insuranceDaily', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cleaning Fee ($)
                </label>
                <input
                  type="number"
                  step="10"
                  value={cleaningFee}
                  onChange={(e) => onChange('cleaningFee', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Late Fee per Hour ($)
                </label>
                <input
                  type="number"
                  step="5"
                  value={lateFeePerHour}
                  onChange={(e) => onChange('lateFeePerHour', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Extra Mileage Fee ($/mile)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={additionalMileageFee}
                  onChange={(e) => onChange('additionalMileageFee', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Pricing Tips */}
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-xs text-yellow-800 dark:text-yellow-300">
            <strong>Pricing Tips:</strong> Research similar vehicles in your area. 
            Consider offering competitive weekly/monthly discounts to encourage longer bookings. 
            Price 10-15% below market initially to build reviews.
          </p>
        </div>
      </div>
    </div>
  )
}