// app/fleet/banking/components/PayoutHistoryTable.tsx
// Shows recent payout history with breakdown

import { formatCurrency, formatDate } from '../types'

interface Payout {
  id: string
  hostName: string
  hostEmail: string
  amount: number
  status: string
  createdAt: string
}

interface PayoutHistoryProps {
  payouts: Payout[]
  title?: string
}

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  PROCESSING: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  FAILED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
}

export function PayoutHistoryTable({ payouts, title = 'Recent Payouts' }: PayoutHistoryProps) {
  if (payouts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No recent payouts
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Host</th>
              <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Amount</th>
              <th className="text-center py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Status</th>
              <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((payout) => (
              <tr key={payout.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="py-3 px-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {payout.hostName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {payout.hostEmail}
                    </p>
                  </div>
                </td>
                <td className="py-3 px-2 text-right">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(payout.amount)}
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    STATUS_STYLES[payout.status] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                    {payout.status}
                  </span>
                </td>
                <td className="py-3 px-2 text-right text-gray-600 dark:text-gray-400">
                  {formatDate(payout.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {payouts.length >= 20 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            View All Payouts
          </button>
        </div>
      )}
    </div>
  )
}
