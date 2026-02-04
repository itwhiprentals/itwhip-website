// app/fleet/bookings/components/modals/ApproveRejectModal.tsx
'use client'

import { useState } from 'react'
import {
  IoCloseOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline
} from 'react-icons/io5'
import { FleetBooking } from '../../types'

interface ApproveRejectModalProps {
  isOpen: boolean
  onClose: () => void
  booking: FleetBooking | null
  action: 'approve' | 'reject'
  onSubmit: (bookingId: string, action: string, data: { notes?: string; reason?: string }) => Promise<void>
  loading: boolean
}

export function ApproveRejectModal({
  isOpen,
  onClose,
  booking,
  action,
  onSubmit,
  loading
}: ApproveRejectModalProps) {
  const [notes, setNotes] = useState('')
  const [reason, setReason] = useState('')

  if (!isOpen || !booking) return null

  const isApprove = action === 'approve'

  const handleSubmit = async () => {
    await onSubmit(booking.id, action, {
      notes,
      reason: isApprove ? undefined : reason
    })
    setNotes('')
    setReason('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className={`p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between ${
          isApprove ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
        }`}>
          <div className="flex items-center gap-2">
            {isApprove ? (
              <IoCheckmarkCircleOutline className="w-6 h-6 text-green-600" />
            ) : (
              <IoCloseCircleOutline className="w-6 h-6 text-red-600" />
            )}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isApprove ? 'Approve Booking' : 'Reject Booking'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
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
              {booking.guestName} • {booking.car.year} {booking.car.make} {booking.car.model}
            </p>
          </div>

          {isApprove ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                placeholder="Add any notes about this approval..."
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select a reason...</option>
                  <option value="invalid_license">Invalid Driver's License</option>
                  <option value="expired_license">Expired License</option>
                  <option value="failed_verification">Failed Identity Verification</option>
                  <option value="suspicious_activity">Suspicious Activity Detected</option>
                  <option value="underage">Guest Under Minimum Age</option>
                  <option value="document_quality">Poor Document Quality</option>
                  <option value="fraud_suspected">Fraud Suspected</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                  placeholder="Add details about the rejection..."
                />
              </div>
            </>
          )}

          {!isApprove && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                This will cancel the booking and notify the guest. The guest will receive a full refund.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || (!isApprove && !reason)}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 min-h-[44px] ${
              isApprove
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {loading ? 'Processing...' : isApprove ? 'Approve Booking' : 'Reject Booking'}
          </button>
        </div>
      </div>
    </div>
  )
}
