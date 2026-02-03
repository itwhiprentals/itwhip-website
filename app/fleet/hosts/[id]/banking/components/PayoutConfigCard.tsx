// app/fleet/hosts/[id]/banking/components/PayoutConfigCard.tsx
'use client'

import {
  IoWalletOutline,
  IoFlashOutline,
  IoCheckmarkCircleOutline,
  IoLockClosedOutline
} from 'react-icons/io5'
import { BankingData, formatCurrency } from '../types'

interface PayoutConfigCardProps {
  payout: BankingData['payout']
}

export function PayoutConfigCard({ payout }: PayoutConfigCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <IoWalletOutline className="text-purple-600" />
          Payout Configuration
        </h3>
      </div>
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Schedule</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
              {payout.schedule}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Minimum Amount</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {formatCurrency(payout.minimumAmount)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Instant Payouts</span>
            {payout.instantEnabled ? (
              <span className="flex items-center gap-1 text-green-600 text-sm">
                <IoFlashOutline />
                Enabled
              </span>
            ) : (
              <span className="text-sm text-gray-500">Disabled</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Payouts Status</span>
            {payout.enabled ? (
              <span className="flex items-center gap-1 text-green-600 text-sm">
                <IoCheckmarkCircleOutline />
                Enabled
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600 text-sm">
                <IoLockClosedOutline />
                Suspended
              </span>
            )}
          </div>

          {!payout.enabled && payout.disabledReason && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-red-600">
                Reason: {payout.disabledReason}
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Total Paid Out</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(payout.totalPayouts)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Payout Count</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {payout.payoutCount}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
