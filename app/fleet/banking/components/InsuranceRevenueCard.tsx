// app/fleet/banking/components/InsuranceRevenueCard.tsx
// Shows insurance revenue as SHARED revenue (30% platform, 70% provider)

import { formatCurrency, InsuranceData } from '../types'

interface InsuranceRevenueCardProps {
  data: InsuranceData
}

export function InsuranceRevenueCard({ data }: InsuranceRevenueCardProps) {
  const platformPercent = Math.round(data.platformShareRate * 100)
  const providerPercent = 100 - platformPercent

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Warning Banner */}
      <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Shared Revenue
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              {providerPercent}% goes to insurance provider — only {platformPercent}% is platform revenue
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Insurance Revenue
      </h2>

      {/* Total Collected */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Insurance Collected</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(data.totalInsuranceCollected)}
        </p>
      </div>

      {/* Revenue Split Bar */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Revenue Split</p>
        <div className="h-6 rounded-lg overflow-hidden flex">
          <div
            className="bg-green-500 dark:bg-green-600 flex items-center justify-center"
            style={{ width: `${platformPercent}%` }}
          >
            <span className="text-xs font-medium text-white">{platformPercent}%</span>
          </div>
          <div
            className="bg-gray-300 dark:bg-gray-600 flex items-center justify-center"
            style={{ width: `${providerPercent}%` }}
          >
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{providerPercent}%</span>
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-500 dark:bg-green-600"></div>
            <span className="text-gray-600 dark:text-gray-400">Platform</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gray-300 dark:bg-gray-600"></div>
            <span className="text-gray-600 dark:text-gray-400">Provider</span>
          </div>
        </div>
      </div>

      {/* Split Amounts */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-xs text-green-700 dark:text-green-400 mb-1">Platform Share</p>
          <p className="text-lg font-bold text-green-700 dark:text-green-400">
            {formatCurrency(data.platformShare)}
          </p>
          <p className="text-xs text-green-600 dark:text-green-500 mt-1">
            Our Revenue
          </p>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Provider Share</p>
          <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
            {formatCurrency(data.providerShare)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Owed to Provider
          </p>
        </div>
      </div>

      {/* Breakdown by Type */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">By Insurance Type</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                BASIC
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({data.byType.basic.count} bookings)
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {formatCurrency(data.byType.basic.collected)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                PREMIUM
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({data.byType.premium.count} bookings)
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {formatCurrency(data.byType.premium.collected)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
