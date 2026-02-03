// app/fleet/guests/[id]/banking/components/WaiveChargeModal.tsx
'use client'

import { useState } from 'react'
import { Charge, formatCurrency } from '../types'

interface WaiveChargeModalProps {
  charge: Charge
  actionLoading: boolean
  onWaive: (chargeId: string, reason: string) => void
  onClose: () => void
}

export function WaiveChargeModal({ charge, actionLoading, onWaive, onClose }: WaiveChargeModalProps) {
  const [reason, setReason] = useState('')

  const handleSubmit = () => {
    if (reason.trim()) {
      onWaive(charge.id, reason)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Waive Charge - {formatCurrency(charge.totalCharges)}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason for waiving *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Enter reason..."
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
            disabled={!reason.trim() || actionLoading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
          >
            {actionLoading ? 'Waiving...' : 'Waive Charge'}
          </button>
        </div>
      </div>
    </div>
  )
}
