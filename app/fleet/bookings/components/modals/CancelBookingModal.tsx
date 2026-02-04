// app/fleet/bookings/components/modals/CancelBookingModal.tsx
'use client'

import { useState } from 'react'
import { IoCloseOutline, IoBanOutline } from 'react-icons/io5'
import { FleetBooking, formatCurrency } from '../../types'

interface CancelBookingModalProps {
  isOpen: boolean
  onClose: () => void
  booking: FleetBooking | null
  onSubmit: (bookingId: string, data: { reason: string; notes?: string; refundType?: string }) => Promise<void>
  loading: boolean
}

export function CancelBookingModal({
  isOpen,
  onClose,
  booking,
  onSubmit,
  loading
}: CancelBookingModalProps) {
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [refundType, setRefundType] = useState('full')

  if (!isOpen || !booking) return null

  const handleSubmit = async () => {
    if (!reason) return
    await onSubmit(booking.id, { reason, notes, refundType })
    setReason('')
    setNotes('')
    setRefundType('full')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IoBanOutline className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cancel Booking
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded"
          >
            <IoCloseOutline className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Booking: {booking.bookingCode}
            </p>
            <p className="text-sm text-gray-500">
              {booking.guestName} • {formatCurrency(booking.totalAmount)}
            </p>
            <p className="text-sm text-gray-500">
              {booking.car.year} {booking.car.make} {booking.car.model}
            </p>
          </div>

          {/* Cancellation Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cancellation Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select a reason...</option>
              <option value="guest_request">Guest Requested</option>
              <option value="host_unavailable">Host/Vehicle Unavailable</option>
              <option value="verification_failed">Verification Failed</option>
              <option value="payment_issue">Payment Issue</option>
              <option value="fraud_detected">Fraud Detected</option>
              <option value="vehicle_maintenance">Vehicle Needs Maintenance</option>
              <option value="safety_concern">Safety Concern</option>
              <option value="policy_violation">Policy Violation</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Refund Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Refund Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  value="full"
                  checked={refundType === 'full'}
                  onChange={(e) => setRefundType(e.target.value)}
                  className="text-red-600 focus:ring-red-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Full Refund</p>
                  <p className="text-xs text-gray-500">Guest receives {formatCurrency(booking.totalAmount)}</p>
                </div>
              </label>
              <label className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  value="partial"
                  checked={refundType === 'partial'}
                  onChange={(e) => setRefundType(e.target.value)}
                  className="text-red-600 focus:ring-red-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Partial Refund</p>
                  <p className="text-xs text-gray-500">Apply cancellation fee per policy</p>
                </div>
              </label>
              <label className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  value="none"
                  checked={refundType === 'none'}
                  onChange={(e) => setRefundType(e.target.value)}
                  className="text-red-600 focus:ring-red-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">No Refund</p>
                  <p className="text-xs text-gray-500">Guest forfeits payment (fraud/policy violation)</p>
                </div>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Internal Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
              placeholder="Add any internal notes about this cancellation..."
            />
          </div>

          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              This action cannot be undone. The guest and host will be notified of the cancellation.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Keep Booking
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !reason}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 min-h-[44px]"
          >
            {loading ? 'Cancelling...' : 'Cancel Booking'}
          </button>
        </div>
      </div>
    </div>
  )
}
