// app/fleet/banking/components/HostPayoutCard.tsx
// Shows pending payouts with timeline and fee breakdown

import { formatCurrency, formatDate, PendingPayoutDetail } from '../types'

interface HostPayoutCardProps {
  pendingPayouts: PendingPayoutDetail[]
  totalPendingAmount: number
  totalPendingCount: number
  settings: {
    standardPayoutDelay: number  // 3 days
    newHostPayoutDelay: number   // 7 days
  }
}

export function HostPayoutCard({
  pendingPayouts,
  totalPendingAmount,
  totalPendingCount,
  settings
}: HostPayoutCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Pending Host Payouts
      </h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-1">Pending Count</p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
            {totalPendingCount}
          </p>
        </div>
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
            {formatCurrency(totalPendingAmount)}
          </p>
        </div>
      </div>

      {/* Payout Timeline Visual */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Payout Timeline
        </p>
        <div className="flex items-center justify-between">
          {/* Trip End */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Trip End</p>
          </div>

          {/* Arrow */}
          <div className="flex-1 h-0.5 bg-gray-300 dark:bg-gray-600 mx-2 relative">
            <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {settings.standardPayoutDelay} days
            </span>
          </div>

          {/* Eligible */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Eligible</p>
          </div>

          {/* Arrow */}
          <div className="flex-1 h-0.5 bg-gray-300 dark:bg-gray-600 mx-2"></div>

          {/* Payout */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Payout</p>
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          New hosts (&lt;3 trips): {settings.newHostPayoutDelay} day delay
        </p>
      </div>

      {/* Pending Payouts List */}
      {pendingPayouts.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">No pending payouts</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Host</th>
                <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Booking</th>
                <th className="text-center py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Days Left</th>
                <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Gross</th>
                <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Fees</th>
                <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Net</th>
              </tr>
            </thead>
            <tbody>
              {pendingPayouts.map((payout) => (
                <tr key={payout.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-2 px-2">
                    <p className="font-medium text-gray-900 dark:text-white text-xs">
                      {payout.hostName}
                    </p>
                  </td>
                  <td className="py-2 px-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {payout.bookingCode}
                    </p>
                  </td>
                  <td className="py-2 px-2 text-center">
                    {payout.daysUntilEligible === 0 ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        Ready
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                        {payout.daysUntilEligible}d
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-right text-xs text-gray-900 dark:text-white">
                    {formatCurrency(payout.grossEarnings)}
                  </td>
                  <td className="py-2 px-2 text-right text-xs text-red-600 dark:text-red-400">
                    -{formatCurrency(payout.platformFee + payout.processingFee)}
                  </td>
                  <td className="py-2 px-2 text-right">
                    <span className="font-medium text-green-600 dark:text-green-400 text-xs">
                      {formatCurrency(payout.netPayout)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Fee Breakdown Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Fee Breakdown</p>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-gray-600 dark:text-gray-400">Platform Fee:</span>
            <span className="font-medium text-gray-900 dark:text-white">25%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-600 dark:text-gray-400">Processing:</span>
            <span className="font-medium text-gray-900 dark:text-white">$1.50</span>
          </div>
        </div>
      </div>
    </div>
  )
}
