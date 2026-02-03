// app/fleet/hosts/[id]/banking/components/ForcePayoutModal.tsx
'use client'

import { PayoutFormData, formatCurrency } from '../types'

interface ForcePayoutModalProps {
  isOpen: boolean
  onClose: () => void
  payoutForm: PayoutFormData
  setPayoutForm: (form: PayoutFormData) => void
  onSubmit: () => void
  loading: boolean
  availableForPayout: number
}

export function ForcePayoutModal({
  isOpen,
  onClose,
  payoutForm,
  setPayoutForm,
  onSubmit,
  loading,
  availableForPayout
}: ForcePayoutModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Force Immediate Payout
        </h3>

        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            This will override the normal payout schedule and send money immediately to the host's bank account.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={payoutForm.amount}
              onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500 mt-1">
              Available: {formatCurrency(availableForPayout)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason *
            </label>
            <textarea
              value={payoutForm.reason}
              onChange={(e) => setPayoutForm({ ...payoutForm, reason: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              rows={3}
              placeholder="Explain why this payout is being forced..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Force Payout'}
          </button>
        </div>
      </div>
    </div>
  )
}
