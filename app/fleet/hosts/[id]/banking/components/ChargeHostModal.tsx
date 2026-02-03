// app/fleet/hosts/[id]/banking/components/ChargeHostModal.tsx
'use client'

import { ChargeFormData } from '../types'

interface ChargeHostModalProps {
  isOpen: boolean
  onClose: () => void
  chargeForm: ChargeFormData
  setChargeForm: (form: ChargeFormData) => void
  onSubmit: () => void
  loading: boolean
}

export function ChargeHostModal({
  isOpen,
  onClose,
  chargeForm,
  setChargeForm,
  onSubmit,
  loading
}: ChargeHostModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Charge Host
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={chargeForm.amount}
              onChange={(e) => setChargeForm({ ...chargeForm, amount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Charge Type
            </label>
            <select
              value={chargeForm.chargeType}
              onChange={(e) => setChargeForm({ ...chargeForm, chargeType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="subscription">Subscription</option>
              <option value="damage_claim">Damage Claim</option>
              <option value="guest_refund">Guest Refund</option>
              <option value="penalty">Penalty</option>
              <option value="late_fee">Late Fee</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason *
            </label>
            <textarea
              value={chargeForm.reason}
              onChange={(e) => setChargeForm({ ...chargeForm, reason: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              rows={3}
              placeholder="Describe the reason for this charge..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={chargeForm.notes}
              onChange={(e) => setChargeForm({ ...chargeForm, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              rows={2}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={chargeForm.deductFromBalance}
              onChange={(e) => setChargeForm({ ...chargeForm, deductFromBalance: e.target.checked })}
              className="rounded"
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Try deducting from balance first (no fee)
            </label>
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
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Charge Host'}
          </button>
        </div>
      </div>
    </div>
  )
}
