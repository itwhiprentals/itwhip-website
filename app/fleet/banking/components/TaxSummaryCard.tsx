// app/fleet/banking/components/TaxSummaryCard.tsx
// Shows total taxes collected - PASSTHROUGH money that must be remitted

'use client'

import { useState } from 'react'
import { formatCurrency } from '../types'

interface TaxSummaryProps {
  data: {
    totalTaxesCollected: number
    taxesByState?: Record<string, number>
    taxesByCity?: Record<string, number>
  }
}

export function TaxSummaryCard({ data }: TaxSummaryProps) {
  const [showAllCities, setShowAllCities] = useState(false)

  const stateEntries = Object.entries(data.taxesByState || {})
    .sort((a, b) => b[1] - a[1])
  const cityEntries = Object.entries(data.taxesByCity || {})
    .sort((a, b) => b[1] - a[1])
  const displayedCities = showAllCities ? cityEntries : cityEntries.slice(0, 5)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Warning Banner - NOT our money */}
      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              Passthrough Money
            </p>
            <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
              This is NOT platform revenue — must be remitted to government
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Tax Summary
      </h2>

      <div className="mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">Total Taxes Collected</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(data.totalTaxesCollected)}
        </p>
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
          Owed to government
        </p>
      </div>

      {/* Remittance Status */}
      <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Remittance Status</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Status</p>
            <p className="font-medium text-yellow-600 dark:text-yellow-400">Pending</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Last Remitted</p>
            <p className="font-medium text-gray-900 dark:text-white">-</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Next Due</p>
            <p className="font-medium text-gray-900 dark:text-white">Monthly</p>
          </div>
        </div>
      </div>

      {stateEntries.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            By State
          </h3>
          <div className="space-y-2">
            {stateEntries.map(([state, amount]) => (
              <div key={state} className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{state}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {cityEntries.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              By City
            </h3>
            {cityEntries.length > 5 && (
              <button
                onClick={() => setShowAllCities(!showAllCities)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {showAllCities ? 'Show less' : `Show all (${cityEntries.length})`}
              </button>
            )}
          </div>
          <div className={`space-y-2 ${showAllCities ? 'max-h-60 overflow-y-auto' : ''}`}>
            {displayedCities.map(([city, amount]) => (
              <div key={city} className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{city}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Taxes are collected and remitted per Arizona TPT requirements.
          State rate: 5.6% + City privilege tax varies by location.
        </p>
      </div>
    </div>
  )
}
