// app/fleet/guests/[id]/banking/components/BankingAlerts.tsx
'use client'

import {
  IoWarningOutline,
  IoAlertCircleOutline,
  IoLockClosedOutline
} from 'react-icons/io5'
import { BankingData, TabType, formatCurrency } from '../types'

interface BankingAlertsProps {
  data: BankingData
  onTabChange: (tab: TabType) => void
}

export function BankingAlerts({ data, onTabChange }: BankingAlertsProps) {
  const { alerts, summary } = data

  if (!alerts.hasPendingCharges && !alerts.hasDisputedCharges && !alerts.hasLockedPaymentMethod) {
    return null
  }

  return (
    <div className="space-y-2 mb-6">
      {alerts.hasPendingCharges && (
        <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <IoWarningOutline className="w-5 h-5 text-red-600 dark:text-red-400" />
          <span className="text-sm text-red-800 dark:text-red-200">
            {summary.pendingChargesCount} pending charge{summary.pendingChargesCount !== 1 ? 's' : ''} - {formatCurrency(summary.pendingChargesAmount)} require action
          </span>
          <button
            onClick={() => onTabChange('charges')}
            className="ml-auto text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            View →
          </button>
        </div>
      )}
      {alerts.hasDisputedCharges && (
        <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <IoAlertCircleOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <span className="text-sm text-yellow-800 dark:text-yellow-200">
            {summary.disputedChargesCount} charge{summary.disputedChargesCount !== 1 ? 's' : ''} in dispute - {formatCurrency(summary.disputedChargesAmount)}
          </span>
          <button
            onClick={() => onTabChange('disputes')}
            className="ml-auto text-sm text-yellow-600 dark:text-yellow-400 hover:underline"
          >
            View →
          </button>
        </div>
      )}
      {alerts.hasLockedPaymentMethod && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <IoLockClosedOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-blue-800 dark:text-blue-200">
            {summary.activeBookingsCount} active booking{summary.activeBookingsCount !== 1 ? 's' : ''} - payment method locked
          </span>
        </div>
      )}
    </div>
  )
}
