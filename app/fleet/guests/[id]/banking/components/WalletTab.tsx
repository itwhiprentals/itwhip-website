// app/fleet/guests/[id]/banking/components/WalletTab.tsx
'use client'

import { IoAddOutline } from 'react-icons/io5'
import { BankingData, formatCurrency } from '../types'

interface WalletTabProps {
  data: BankingData
  onAddBonus: () => void
}

export function WalletTab({ data, onAddBonus }: WalletTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Wallet Balances</h3>
        <button
          onClick={onAddBonus}
          className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
        >
          <IoAddOutline className="w-4 h-4" />
          Add Bonus
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Credits</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(data.wallet.creditBalance)}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Bonus</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(data.wallet.bonusBalance)}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Deposit Wallet</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(data.wallet.depositWalletBalance)}</p>
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Fleet admin can only add bonus credits (promotional). Credits and deposits are guest-controlled.
      </p>
    </div>
  )
}
