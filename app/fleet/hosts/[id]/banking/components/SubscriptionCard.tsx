// app/fleet/hosts/[id]/banking/components/SubscriptionCard.tsx
'use client'

import { IoShieldCheckmarkOutline } from 'react-icons/io5'
import { BankingData, formatCurrency, formatDate } from '../types'

interface SubscriptionCardProps {
  subscription: BankingData['subscription']
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <IoShieldCheckmarkOutline className="text-purple-600" />
          Subscription
        </h3>
      </div>
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Tier</span>
            <span className={`text-sm font-medium px-2 py-1 rounded ${
              subscription.tier === 'FLEET_MANAGER'
                ? 'bg-purple-100 text-purple-700'
                : subscription.tier === 'ENTERPRISE'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {subscription.tier}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              subscription.status === 'ACTIVE'
                ? 'bg-green-100 text-green-700'
                : subscription.status === 'PAST_DUE'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {subscription.status}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Fee</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {formatCurrency(subscription.monthlyFee)}
            </span>
          </div>

          {subscription.nextChargeDate && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Next Charge</span>
              <span className="text-xs text-gray-900 dark:text-white">
                {formatDate(subscription.nextChargeDate)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
