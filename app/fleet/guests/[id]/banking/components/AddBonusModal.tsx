// app/fleet/guests/[id]/banking/components/AddBonusModal.tsx
'use client'

import { useState } from 'react'

interface AddBonusModalProps {
  actionLoading: boolean
  onAddBonus: (amount: number, reason: string) => void
  onClose: () => void
}

export function AddBonusModal({ actionLoading, onAddBonus, onClose }: AddBonusModalProps) {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount)
    if (parsedAmount > 0 && reason.trim()) {
      onAddBonus(parsedAmount, reason)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Bonus Credits</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount ($) *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="25.00"
              min="1"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason *
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="Referral bonus, loyalty reward, etc."
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!amount || !reason.trim() || actionLoading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
          >
            {actionLoading ? 'Adding...' : 'Add Bonus'}
          </button>
        </div>
      </div>
    </div>
  )
}
