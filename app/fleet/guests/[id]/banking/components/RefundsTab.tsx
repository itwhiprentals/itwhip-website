// app/fleet/guests/[id]/banking/components/RefundsTab.tsx
'use client'

import { IoAddOutline } from 'react-icons/io5'
import { BankingData, formatCurrency, formatDate } from '../types'

interface RefundsTabProps {
  data: BankingData
  onProcessRefund: () => void
}

export function RefundsTab({ data, onProcessRefund }: RefundsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Refunds</h3>
        <button
          onClick={onProcessRefund}
          className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
        >
          <IoAddOutline className="w-4 h-4" />
          Process Refund
        </button>
      </div>

      {/* Pending Refunds */}
      {data.refunds.pending.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Pending Requests</h4>
          <div className="space-y-2">
            {data.refunds.pending.map(refund => (
              <div key={refund.id} className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(refund.amount)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{refund.bookingCode} - {refund.reason}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Requested {formatDate(refund.createdAt)}</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
                    PENDING
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Refunds */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Completed Refunds</h4>
        {data.refunds.completed.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No completed refunds</p>
        ) : (
          <div className="space-y-2">
            {data.refunds.completed.map(refund => (
              <div key={refund.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(refund.amount)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {refund.bookingCode} • {refund.reason}
                  </p>
                </div>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                  PROCESSED
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
