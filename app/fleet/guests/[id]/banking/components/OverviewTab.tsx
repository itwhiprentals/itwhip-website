// app/fleet/guests/[id]/banking/components/OverviewTab.tsx
'use client'

import {
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoGiftOutline
} from 'react-icons/io5'
import { BankingData, formatCurrency, formatDate } from '../types'

interface OverviewTabProps {
  data: BankingData
}

export function OverviewTab({ data }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(data.summary.totalSpent)}</p>
        </div>
        <div className={`rounded-lg p-3 sm:p-4 ${data.summary.pendingChargesCount > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-900/50'}`}>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Pending Charges</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(data.summary.pendingChargesAmount)}</p>
        </div>
        <div className={`rounded-lg p-3 sm:p-4 ${data.summary.disputedChargesCount > 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-gray-50 dark:bg-gray-900/50'}`}>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Disputed</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(data.summary.disputedChargesAmount)}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Wallet Balance</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(data.wallet.totalBalance)}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {data.recentActivity.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No recent activity</p>
          ) : (
            data.recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'charge_pending' ? 'bg-red-100 dark:bg-red-900/30' :
                    activity.type === 'charge_completed' ? 'bg-green-100 dark:bg-green-900/30' :
                    'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    {activity.type === 'charge_pending' ? <IoWarningOutline className="w-4 h-4 text-red-600" /> :
                     activity.type === 'charge_completed' ? <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600" /> :
                     <IoGiftOutline className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(activity.date)}
                      {activity.bookingCode && ` • ${activity.bookingCode}`}
                    </p>
                  </div>
                </div>
                <span className={`font-semibold ${
                  activity.type.includes('bonus') || activity.type.includes('credit') ? 'text-green-600' : 'text-gray-900 dark:text-white'
                }`}>
                  {activity.type.includes('bonus') || activity.type.includes('credit') ? '+' : ''}{formatCurrency(activity.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
