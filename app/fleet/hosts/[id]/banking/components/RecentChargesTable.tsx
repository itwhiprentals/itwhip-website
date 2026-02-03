// app/fleet/hosts/[id]/banking/components/RecentChargesTable.tsx
'use client'

import { HostCharge, formatCurrency, formatDate } from '../types'

interface RecentChargesTableProps {
  recentCharges: HostCharge[]
}

export function RecentChargesTable({ recentCharges }: RecentChargesTableProps) {
  if (recentCharges.length === 0) {
    return null
  }

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Charges ({recentCharges.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentCharges.map((charge) => (
              <tr key={charge.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {formatDate(charge.createdAt)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded capitalize">
                    {charge.chargeType.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                  {charge.reason}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(charge.amount)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    charge.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : charge.status === 'failed'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {charge.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                  {charge.chargedBy}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
