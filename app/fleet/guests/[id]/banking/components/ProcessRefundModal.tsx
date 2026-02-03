// app/fleet/guests/[id]/banking/components/ProcessRefundModal.tsx
'use client'

import { useState } from 'react'
import { ActiveBooking } from '../types'

interface ProcessRefundModalProps {
  activeBookings: ActiveBooking[]
  actionLoading: boolean
  onRefund: (bookingId: string, amount: number, reason: string) => void
  onClose: () => void
}

export function ProcessRefundModal({ activeBookings, actionLoading, onRefund, onClose }: ProcessRefundModalProps) {
  const [bookingId, setBookingId] = useState('')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount)
    if (bookingId && parsedAmount > 0 && reason.trim()) {
      if (confirm(`Process refund of $${amount}?`)) {
        onRefund(bookingId, parsedAmount, reason)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Process Refund</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Booking *
            </label>
            <select
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select a booking...</option>
              {activeBookings.map(booking => (
                <option key={booking.id} value={booking.id}>
                  {booking.bookingCode} - {booking.carName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount ($) *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="50.00"
              min="1"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              rows={2}
              placeholder="Reason for refund..."
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
            disabled={!bookingId || !amount || !reason.trim() || actionLoading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
          >
            {actionLoading ? 'Processing...' : 'Process Refund'}
          </button>
        </div>
      </div>
    </div>
  )
}
