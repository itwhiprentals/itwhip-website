// app/fleet/guests/[id]/banking/components/BankingHeader.tsx
'use client'

import { IoArrowBackOutline } from 'react-icons/io5'
import { BankingData, formatCurrency } from '../types'

interface BankingHeaderProps {
  data: BankingData
  guestId: string
  onBack: () => void
}

export function BankingHeader({ data, guestId, onBack }: BankingHeaderProps) {
  return (
    <div className="mb-6">
      <button
        onClick={onBack}
        className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
      >
        <IoArrowBackOutline className="w-4 h-4 mr-2" />
        Back to Guest Details
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
            <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {data.guest.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {data.guest.name} - Banking
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">{data.guest.email}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">Total Spent</p>
            <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(data.summary.totalSpent)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">Wallet</p>
            <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(data.wallet.totalBalance)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
