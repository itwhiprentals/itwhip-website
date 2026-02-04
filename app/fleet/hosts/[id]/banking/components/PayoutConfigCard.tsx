// app/fleet/hosts/[id]/banking/components/PayoutConfigCard.tsx
'use client'

import {
  IoWalletOutline,
  IoCheckmarkCircleOutline,
  IoLockClosedOutline,
  IoTimeOutline,
  IoTrendingUpOutline
} from 'react-icons/io5'
import { BankingData, formatCurrency } from '../types'

interface PayoutConfigCardProps {
  payout: BankingData['payout']
  earnings?: BankingData['earnings']
}

// Format tier name for display
function formatTierName(tier: string): string {
  const tierNames: Record<string, string> = {
    'BASIC': 'Basic',
    'STANDARD': 'Standard',
    'PREMIUM': 'Premium'
  }
  return tierNames[tier] || tier
}

// Get tier description
function getTierDescription(tier: string): string {
  switch (tier) {
    case 'PREMIUM':
      return 'Commercial insurance verified'
    case 'STANDARD':
      return 'P2P insurance verified'
    case 'BASIC':
    default:
      return 'Platform provides coverage'
  }
}

export function PayoutConfigCard({ payout, earnings }: PayoutConfigCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <IoWalletOutline className="text-purple-600" />
          Earnings & Payouts
        </h3>
      </div>
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Earnings Tier & Commission */}
          {earnings && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Earnings Tier</span>
                <span className={`text-sm font-medium px-2 py-1 rounded ${
                  earnings.tier === 'PREMIUM'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                    : earnings.tier === 'STANDARD'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {formatTierName(earnings.tier)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Host Commission</span>
                <div className="flex items-center gap-2">
                  <IoTrendingUpOutline className="text-green-500" />
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {earnings.hostCommissionPercent}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 pb-2 border-b border-gray-100 dark:border-gray-700">
                {getTierDescription(earnings.tier)} • Platform takes {earnings.platformCommissionPercent}%
              </p>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Payout Hold</span>
                <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                  <IoTimeOutline className="text-gray-400" />
                  {earnings.payoutHoldDays} days after trip
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Processing</span>
            <span className="text-sm text-gray-900 dark:text-white">
              Daily (2 AM UTC)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Minimum Payout</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {formatCurrency(payout.minimumAmount)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Payout Status</span>
            {payout.enabled ? (
              <span className="flex items-center gap-1 text-green-600 text-sm">
                <IoCheckmarkCircleOutline />
                Active
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600 text-sm">
                <IoLockClosedOutline />
                Suspended
              </span>
            )}
          </div>

          {!payout.enabled && payout.disabledReason && (
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600 dark:text-red-400">
              {payout.disabledReason}
            </div>
          )}

          {/* Stats */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Paid Out</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(payout.totalPayouts)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Payout Count</p>
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
