// app/fleet/hosts/[id]/banking/components/NoPayoutMethodAlert.tsx
'use client'

import { IoAlertCircleOutline, IoWalletOutline } from 'react-icons/io5'

interface NoPayoutMethodAlertProps {
  hostName?: string
  hasPendingBalance?: boolean
  pendingAmount?: number
}

export function NoPayoutMethodAlert({
  hostName,
  hasPendingBalance = false,
  pendingAmount = 0
}: NoPayoutMethodAlertProps) {
  return (
    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
      <div className="flex items-start gap-3">
        <IoAlertCircleOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-yellow-800 dark:text-yellow-200">
            No payout method configured
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            {hostName ? `${hostName} cannot` : 'Host cannot'} receive payouts until they add a bank account or debit card to their Stripe Connect account.
          </p>

          {hasPendingBalance && pendingAmount > 0 && (
            <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-800/30 rounded flex items-center gap-2">
              <IoWalletOutline className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-yellow-800 dark:text-yellow-200">
                ${pendingAmount.toFixed(2)} in pending earnings waiting for payout setup
              </span>
            </div>
          )}

          <div className="mt-3 text-xs text-yellow-600 dark:text-yellow-400">
            <p className="font-medium">Host needs to:</p>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>Complete Stripe Connect onboarding</li>
              <li>Add a bank account or debit card</li>
              <li>Verify their identity (if not done)</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
