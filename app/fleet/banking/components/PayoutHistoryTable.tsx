// app/fleet/banking/components/PayoutHistoryTable.tsx
// Shows recent payout history with date filter and breakdown

'use client'

import { useState, useMemo } from 'react'
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

const DATE_FILTERS = [
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
  { label: '6 months', value: 180 },
  { label: '1 year', value: 365 }
]

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  PAID: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  PROCESSING: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  FAILED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
}

export function PayoutHistoryTable({ payouts, title = 'Recent Payouts' }: PayoutHistoryProps) {
  const [dateFilter, setDateFilter] = useState(30)

  // Filter payouts by selected date range
  const filteredPayouts = useMemo(() => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - dateFilter)

    return payouts.filter(payout => {
      const payoutDate = new Date(payout.createdAt)
      return payoutDate >= cutoffDate
    })
  }, [payouts, dateFilter])

  // Calculate totals for filtered payouts
  const totalAmount = useMemo(() => {
    return filteredPayouts.reduce((sum, p) => sum + p.amount, 0)
  }, [filteredPayouts])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header with title and filter tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredPayouts.length} payouts · {formatCurrency(totalAmount)} total
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {DATE_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setDateFilter(filter.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                dateFilter === filter.value
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {filteredPayouts.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No payouts in the last {dateFilter} days
        </p>
      ) : (
        <>
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
                {filteredPayouts.map((payout) => (
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

          {filteredPayouts.length >= 20 && (
            <div className="mt-4 text-center">
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                View All Payouts
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
