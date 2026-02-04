// app/fleet/banking/components/CancellationRevenueCard.tsx
// Displays cancellation revenue breakdown with bank-grade accuracy
// Uses centralized financial calculator for all calculations

'use client'

import { formatCurrency } from '../types'

/**
 * Cancellation details from the API
 * Matches CancellationRevenueSummary from financialCalculator
 */
export interface CancellationDetails {
  totalCancelled: number          // Original total value of cancelled bookings
  cancelledCount: number          // Number of cancelled bookings
  serviceFeeRetained: number      // Total service fees retained (always kept)
  nonRefundedSubtotal: number     // Total non-refunded subtotals (policy-based)
  totalRetained: number           // Total platform retained (serviceFee + nonRefundedSubtotal)
  totalRefunded: number           // Total refunded to guests
  byPolicy?: {
    flexible: number
    moderate: number
    strict: number
    super_strict: number
  }
}

interface CancellationRevenueCardProps {
  data: CancellationDetails
  compact?: boolean  // Show compact version for Revenue Breakdown
}

export function CancellationRevenueCard({ data, compact = false }: CancellationRevenueCardProps) {
  // No cancellations to show
  if (data.cancelledCount === 0) {
    return null
  }

  // Compact version for inline in Revenue Breakdown
  if (compact) {
    return (
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">
            Cancellation Revenue
            <span className="ml-1 text-xs text-orange-500">●</span>
          </span>
          <span className="font-medium text-orange-600 dark:text-orange-400">
            {formatCurrency(data.totalRetained)}
          </span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500 pl-2">
          From {data.cancelledCount} cancelled booking{data.cancelledCount !== 1 ? 's' : ''}
        </div>
      </div>
    )
  }

  // Full card version
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-orange-400"></div>
        <h2 className="text-lg font-semibold text-orange-700 dark:text-orange-400">
          Cancellation Revenue
        </h2>
        <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full">
          {data.cancelledCount} cancelled
        </span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Original Value</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(data.totalCancelled)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Refunded</p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">
            -{formatCurrency(data.totalRefunded)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Retained</p>
          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(data.totalRetained)}
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Revenue Breakdown
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Service Fees Retained</span>
            <span className="font-medium text-orange-600 dark:text-orange-400">
              {formatCurrency(data.serviceFeeRetained)}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 pl-2">
            Always retained (15% guest fee)
          </p>

          <div className="flex justify-between pt-2">
            <span className="text-gray-600 dark:text-gray-400">Non-Refunded Subtotals</span>
            <span className="font-medium text-orange-600 dark:text-orange-400">
              {formatCurrency(data.nonRefundedSubtotal)}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 pl-2">
            Based on cancellation policy timing
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-orange-200 dark:border-orange-800 pt-3">
          <div className="flex justify-between">
            <span className="font-semibold text-orange-800 dark:text-orange-300">
              Total Platform Retained
            </span>
            <span className="font-bold text-xl text-orange-600 dark:text-orange-400">
              {formatCurrency(data.totalRetained)}
            </span>
          </div>
        </div>

        {/* Refunded note */}
        <div className="flex justify-between text-sm text-gray-400 dark:text-gray-500">
          <span>Refunded to Guests</span>
          <span>-{formatCurrency(data.totalRefunded)}</span>
        </div>
      </div>

      {/* Policy Breakdown */}
      {data.byPolicy && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            By Cancellation Policy
          </h3>
          <div className="flex gap-3 text-xs">
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
              F: {data.byPolicy.flexible}
            </span>
            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
              M: {data.byPolicy.moderate}
            </span>
            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded">
              S: {data.byPolicy.strict}
            </span>
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
              SS: {data.byPolicy.super_strict}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            F=Flexible (24h), M=Moderate (48h), S=Strict (7d), SS=Super Strict (no refund)
          </p>
        </div>
      )}
    </div>
  )
}
