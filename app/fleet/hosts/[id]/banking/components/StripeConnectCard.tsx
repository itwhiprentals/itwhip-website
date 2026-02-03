// app/fleet/hosts/[id]/banking/components/StripeConnectCard.tsx
'use client'

import {
  IoCardOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'
import { BankingData } from '../types'

interface StripeConnectCardProps {
  stripeConnect: BankingData['stripeConnect']
}

export function StripeConnectCard({ stripeConnect }: StripeConnectCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <IoCardOutline className="text-purple-600" />
          Stripe Connect (Receiving Payouts)
        </h3>
      </div>
      <div className="p-4 sm:p-6">
        {stripeConnect.accountId ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Account ID</span>
              <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {stripeConnect.accountId}
              </code>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                stripeConnect.payoutsEnabled
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {stripeConnect.status || 'Unknown'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Payouts</span>
              {stripeConnect.payoutsEnabled ? (
                <span className="flex items-center gap-1 text-green-600 text-sm">
                  <IoCheckmarkCircleOutline />
                  Enabled
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-600 text-sm">
                  <IoCloseCircleOutline />
                  Disabled
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Details Submitted</span>
              {stripeConnect.detailsSubmitted ? (
                <span className="flex items-center gap-1 text-green-600 text-sm">
                  <IoCheckmarkCircleOutline />
                  Complete
                </span>
              ) : (
                <span className="flex items-center gap-1 text-yellow-600 text-sm">
                  <IoAlertCircleOutline />
                  Incomplete
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <IoAlertCircleOutline className="mx-auto text-4xl text-gray-400 mb-2" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              No Stripe Connect account
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
