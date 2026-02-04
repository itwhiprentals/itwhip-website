// app/fleet/banking/components/PayoutSummaryCard.tsx
// Shows host payouts summary: total paid, pending, processing fees

import { formatCurrency } from '../types'

interface PayoutSummaryProps {
  data: {
    totalHostPayouts: number
    pendingPayouts: number
    pendingCount: number
    processingFeesCollected: number
    recentPayoutsCount: number
  }
}

export function PayoutSummaryCard({ data }: PayoutSummaryProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Host Payouts
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Paid Out</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(data.totalHostPayouts)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending Payouts</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {formatCurrency(data.pendingPayouts)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {data.pendingCount} pending
          </p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Processing Fees Collected</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(data.processingFeesCollected)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Recent Payouts (30 days)</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {data.recentPayoutsCount}
          </span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <strong>Payout Schedule:</strong> Standard hosts receive payouts 3 days after trip completion.
          New hosts have a 7-day delay for the first 3 months.
        </p>
      </div>
    </div>
  )
}
