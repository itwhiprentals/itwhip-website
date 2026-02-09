// app/fleet/bookings/components/BookingQuickActions.tsx
'use client'

import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoBanOutline,
  IoCreateOutline,
  IoCarOutline,
  IoDocumentTextOutline,
  IoMailOutline
} from 'react-icons/io5'
import { FleetBooking } from '../types'

interface BookingQuickActionsProps {
  booking: FleetBooking
  onAction: (action: string) => void
  loading?: boolean
}

export function BookingQuickActions({ booking, onAction, loading }: BookingQuickActionsProps) {
  const needsVerification = booking.verificationStatus === 'PENDING'
  const isActive = booking.status === 'ACTIVE'
  const isCancelled = booking.status === 'CANCELLED'
  const isCompleted = booking.status === 'COMPLETED'

  if (isCancelled || isCompleted) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
        No actions available for {booking.status.toLowerCase()} bookings
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Verification Actions */}
      {needsVerification && (
        <>
          <button
            onClick={() => onAction('approve')}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 min-h-[44px]"
          >
            <IoCheckmarkCircleOutline className="w-5 h-5" />
            Approve
          </button>
          <button
            onClick={() => onAction('reject')}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 min-h-[44px]"
          >
            <IoCloseCircleOutline className="w-5 h-5" />
            Reject
          </button>
        </>
      )}

      {/* Request Documents */}
      <button
        onClick={() => onAction('request_documents')}
        disabled={loading}
        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 min-h-[44px]"
      >
        <IoDocumentTextOutline className="w-5 h-5" />
        Request Docs
      </button>

      {/* Modify Booking */}
      <button
        onClick={() => onAction('modify')}
        disabled={loading || isActive}
        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 min-h-[44px]"
      >
        <IoCreateOutline className="w-5 h-5" />
        Modify
      </button>

      {/* Change Car */}
      <button
        onClick={() => onAction('change_car')}
        disabled={loading || isActive}
        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 min-h-[44px]"
      >
        <IoCarOutline className="w-5 h-5" />
        Change Car
      </button>

      {/* Resend Email */}
      <button
        onClick={() => onAction('resend_email')}
        disabled={loading}
        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 min-h-[44px]"
      >
        <IoMailOutline className="w-5 h-5" />
        Resend Email
      </button>

      {/* Cancel Booking */}
      <button
        onClick={() => onAction('cancel')}
        disabled={loading}
        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 min-h-[44px]"
      >
        <IoBanOutline className="w-5 h-5" />
        Cancel
      </button>
    </div>
  )
}
