// app/fleet/hosts/[id]/banking/components/BalanceCards.tsx
'use client'

import { IoCashOutline, IoTimeOutline, IoLockClosedOutline, IoWalletOutline } from 'react-icons/io5'
import { BankingData, formatCurrency } from '../types'

interface BalanceCardsProps {
  balances: BankingData['balances']
}

export function BalanceCards({ balances }: BalanceCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Current Balance</span>
          <IoCashOutline className="text-green-500" />
        </div>
        <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(balances.current)}
        </div>
        <p className="text-xs text-gray-500 mt-1">Available earnings</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
          <IoTimeOutline className="text-yellow-500" />
        </div>
        <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(balances.pending)}
        </div>
        <p className="text-xs text-gray-500 mt-1">From active trips</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">On Hold</span>
          <IoLockClosedOutline className="text-red-500" />
        </div>
        <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(balances.hold)}
        </div>
        <p className="text-xs text-gray-500 mt-1">Frozen for claims</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Available Payout</span>
          <IoWalletOutline className="text-purple-500" />
        </div>
        <div className="text-xl sm:text-2xl font-bold text-purple-600">
          {formatCurrency(balances.availableForPayout)}
        </div>
        <p className="text-xs text-gray-500 mt-1">Can be paid out</p>
      </div>
    </div>
  )
}
