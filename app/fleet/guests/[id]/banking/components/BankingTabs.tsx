// app/fleet/guests/[id]/banking/components/BankingTabs.tsx
'use client'

import {
  IoWalletOutline,
  IoCardOutline,
  IoReceiptOutline,
  IoRefreshOutline,
  IoGiftOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'
import { BankingData, TabType } from '../types'

interface BankingTabsProps {
  data: BankingData
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function BankingTabs({ data, activeTab, onTabChange }: BankingTabsProps) {
  const tabs: { key: TabType; label: string; icon: any; badge?: number }[] = [
    { key: 'overview', label: 'Overview', icon: IoWalletOutline },
    { key: 'payment-methods', label: 'Payment Methods', icon: IoCardOutline, badge: data.paymentMethods.length },
    { key: 'charges', label: 'Charges', icon: IoReceiptOutline, badge: data.summary.pendingChargesCount },
    { key: 'refunds', label: 'Refunds', icon: IoRefreshOutline, badge: data.summary.pendingRefundsCount },
    { key: 'wallet', label: 'Wallet', icon: IoGiftOutline },
    { key: 'disputes', label: 'Disputes', icon: IoAlertCircleOutline, badge: data.summary.disputedChargesCount }
  ]

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="flex -mb-px overflow-x-auto scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`py-3 px-4 sm:px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.key
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                tab.key === 'charges' || tab.key === 'disputes'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}
