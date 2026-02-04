// app/fleet/banking/components/Host1099SummaryCard.tsx
// Shows 1099 tax information summary for hosts

import { formatCurrency } from '../types'

interface Host1099Props {
  data: {
    taxYear: number
    totalHosts: number
    hostsAboveThreshold: number // Hosts that need 1099 (>$600)
    totalGrossReceipts: number
    totalPlatformFees: number
    totalProcessingFees: number
    totalNetPayouts: number
  }
}

export function Host1099SummaryCard({ data }: Host1099Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          1099-K Summary ({data.taxYear})
        </h2>
        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
          Tax Info
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Hosts</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.totalHosts.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Hosts Requiring 1099</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {data.hostsAboveThreshold.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">Earnings &gt; $600</p>
        </div>
      </div>

      <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Gross Receipts (Box 1a)</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(data.totalGrossReceipts)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Platform Fees Deducted</span>
          <span className="font-medium text-red-600 dark:text-red-400">
            -{formatCurrency(data.totalPlatformFees)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Processing Fees</span>
          <span className="font-medium text-red-600 dark:text-red-400">
            -{formatCurrency(data.totalProcessingFees)}
          </span>
        </div>
        <div className="flex justify-between text-sm pt-2 border-t border-gray-100 dark:border-gray-700">
          <span className="font-medium text-gray-900 dark:text-white">Net Payouts</span>
          <span className="font-bold text-green-600 dark:text-green-400">
            {formatCurrency(data.totalNetPayouts)}
          </span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-xs text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> 1099-K forms are issued to hosts with gross receipts exceeding $600.
          The gross amount (before platform fees) is reported on Box 1a.
        </p>
      </div>

      <button className="mt-4 w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium">
        Export 1099 Data
      </button>
    </div>
  )
}
