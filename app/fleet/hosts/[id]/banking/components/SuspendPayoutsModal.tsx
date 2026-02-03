// app/fleet/hosts/[id]/banking/components/SuspendPayoutsModal.tsx
'use client'

import { HoldFormData } from '../types'

interface SuspendPayoutsModalProps {
  isOpen: boolean
  onClose: () => void
  holdForm: HoldFormData
  setHoldForm: (form: HoldFormData) => void
  onSubmit: () => void
  loading: boolean
}

export function SuspendPayoutsModal({
  isOpen,
  onClose,
  holdForm,
  setHoldForm,
  onSubmit,
  loading
}: SuspendPayoutsModalProps) {
  if (!isOpen) return null

  const isSuspending = holdForm.action === 'suspend_payouts'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {isSuspending ? 'Suspend Payouts' : 'Enable Payouts'}
        </h3>

        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            {isSuspending
              ? 'This will block all automatic payouts for this host until manually re-enabled.'
              : 'This will re-enable automatic payouts for this host.'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason *
            </label>
            <textarea
              value={holdForm.reason}
              onChange={(e) => setHoldForm({ ...holdForm, reason: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              rows={3}
              placeholder={isSuspending
                ? 'Explain why payouts are being suspended...'
                : 'Explain why payouts are being re-enabled...'}
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
            className={`px-4 py-2 rounded-lg text-white disabled:opacity-50 ${
              isSuspending ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Processing...' : isSuspending ? 'Suspend Payouts' : 'Enable Payouts'}
          </button>
        </div>
      </div>
    </div>
  )
}
