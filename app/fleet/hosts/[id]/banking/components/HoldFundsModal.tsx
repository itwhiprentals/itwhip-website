// app/fleet/hosts/[id]/banking/components/HoldFundsModal.tsx
'use client'

import { HoldFormData, formatCurrency } from '../types'

interface HoldFundsModalProps {
  isOpen: boolean
  onClose: () => void
  holdForm: HoldFormData
  setHoldForm: (form: HoldFormData) => void
  onSubmit: () => void
  loading: boolean
  currentBalance: number
  holdBalance: number
}

export function HoldFundsModal({
  isOpen,
  onClose,
  holdForm,
  setHoldForm,
  onSubmit,
  loading,
  currentBalance,
  holdBalance
}: HoldFundsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {holdForm.action === 'hold' ? 'Hold Funds' : 'Release Funds'}
        </h3>

        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setHoldForm({ ...holdForm, action: 'hold' })}
              className={`flex-1 px-4 py-2 rounded-lg ${
                holdForm.action === 'hold'
                  ? 'bg-orange-600 text-white'
                  : 'border border-gray-300 dark:border-gray-600'
              }`}
            >
              Hold
            </button>
            <button
              onClick={() => setHoldForm({ ...holdForm, action: 'release' })}
              className={`flex-1 px-4 py-2 rounded-lg ${
                holdForm.action === 'release'
                  ? 'bg-green-600 text-white'
                  : 'border border-gray-300 dark:border-gray-600'
              }`}
            >
              Release
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={holdForm.amount}
              onChange={(e) => setHoldForm({ ...holdForm, amount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              placeholder="0.00"
            />
            {holdForm.action === 'hold' && (
              <p className="text-xs text-gray-500 mt-1">
                Available: {formatCurrency(currentBalance)}
              </p>
            )}
            {holdForm.action === 'release' && (
              <p className="text-xs text-gray-500 mt-1">
                Currently held: {formatCurrency(holdBalance)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason *
            </label>
            <textarea
              value={holdForm.reason}
              onChange={(e) => setHoldForm({ ...holdForm, reason: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              rows={3}
              placeholder="Explain why you're holding/releasing these funds..."
            />
          </div>

          {holdForm.action === 'hold' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hold Until (optional)
              </label>
              <input
                type="date"
                value={holdForm.holdUntil}
                onChange={(e) => setHoldForm({ ...holdForm, holdUntil: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
          )}
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
            className={`px-4 py-2 rounded-lg text-white disabled:opacity-50 ${
              holdForm.action === 'hold' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Processing...' : holdForm.action === 'hold' ? 'Hold Funds' : 'Release Funds'}
          </button>
        </div>
      </div>
    </div>
  )
}
