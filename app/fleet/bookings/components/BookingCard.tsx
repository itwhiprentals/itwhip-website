// app/fleet/bookings/components/BookingCard.tsx
'use client'

import Link from 'next/link'
import {
  IoCarOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoChevronForwardOutline
} from 'react-icons/io5'
import { FleetBooking, formatCurrency, formatDate, getStatusColor, getStatusLabel, getVerificationColor, getVerificationLabel, isTerminalStatus } from '../types'

interface BookingCardProps {
  booking: FleetBooking
  onSelect: (booking: FleetBooking) => void
  onAction: (booking: FleetBooking, action: string) => void
}

export function BookingCard({ booking, onSelect, onAction }: BookingCardProps) {
  const isHighRisk = (booking.riskScore || 0) >= 60
  const needsVerification = booking.verificationStatus === 'PENDING' || booking.verificationStatus === 'IN_REVIEW'
  const needsFleetApproval = booking.status === 'PENDING' && booking.paymentStatus === 'AUTHORIZED'

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border ${
      isHighRisk
        ? 'border-red-300 dark:border-red-700'
        : needsFleetApproval
          ? 'border-amber-300 dark:border-amber-700'
          : needsVerification
            ? 'border-yellow-300 dark:border-yellow-700'
            : 'border-gray-200 dark:border-gray-700'
    } overflow-hidden hover:shadow-md transition-shadow`}>
      {/* Payment On Hold Banner */}
      {needsFleetApproval && (
        <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IoTimeOutline className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              Payment On Hold — Awaiting Fleet Approval
            </span>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => onAction(booking, 'approve')}
              className="px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded hover:bg-green-700"
            >
              Approve
            </button>
            <button
              onClick={() => onAction(booking, 'reject')}
              className="px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Risk/Attention Banner */}
      {!needsFleetApproval && (isHighRisk || booking.flaggedForReview) && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 flex items-center gap-2">
          <IoAlertCircleOutline className="w-4 h-4 text-red-600" />
          <span className="text-xs font-medium text-red-700 dark:text-red-300">
            {isHighRisk ? `High Risk Score: ${booking.riskScore}` : 'Flagged for Review'}
          </span>
        </div>
      )}

      <div className="p-4">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-900 dark:text-white">
                {booking.bookingCode}
              </span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                {getStatusLabel(booking.status)}
              </span>
              {booking.paymentType === 'CASH' && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  Cash
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Created {formatDate(booking.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(booking.totalAmount)}
            </p>
            <p className="text-xs text-gray-500">{booking.numberOfDays} days</p>
          </div>
        </div>

        {/* Guest & Car Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {/* Guest */}
          <div className="flex items-start gap-2">
            <IoPersonOutline className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {booking.guestName}
              </p>
              <p className="text-xs text-gray-500 truncate">{booking.guestEmail}</p>
              {booking.guestPhone && (
                <p className="text-xs text-gray-500">{booking.guestPhone}</p>
              )}
            </div>
          </div>

          {/* Car */}
          <div className="flex items-start gap-2">
            <IoCarOutline className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {booking.car.year} {booking.car.make} {booking.car.model}
              </p>
              <p className="text-xs text-gray-500">Host: {booking.host.name}</p>
              {booking.car.licensePlate && (
                <p className="text-xs text-gray-500">{booking.car.licensePlate}</p>
              )}
            </div>
          </div>
        </div>

        {/* Dates & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-2">
            <IoCalendarOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <IoLocationOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {booking.pickupLocation}
            </span>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getVerificationColor(booking.verificationStatus)}`}>
            {booking.verificationStatus === 'PENDING' ? (
              <span className="flex items-center gap-1">
                <IoTimeOutline className="w-3 h-3" />
                Verification Pending
              </span>
            ) : booking.verificationStatus === 'APPROVED' ? (
              <span className="flex items-center gap-1">
                <IoCheckmarkCircleOutline className="w-3 h-3" />
                Verified
              </span>
            ) : (
              booking.verificationStatus
            )}
          </span>

          {booking.paymentStatus && (
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              booking.paymentStatus === 'PAID'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : booking.paymentStatus === 'PENDING'
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              Payment: {booking.paymentStatus}
            </span>
          )}

          {booking.hasDispute && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              Has Dispute
            </span>
          )}

          {(booking as any).hasClaim && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
              Has Claim
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
          {needsVerification && !isTerminalStatus(booking.status) && (
            <>
              <button
                onClick={() => onAction(booking, 'approve')}
                className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 min-h-[32px]"
              >
                Approve
              </button>
              <button
                onClick={() => onAction(booking, 'reject')}
                className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 min-h-[32px]"
              >
                Reject
              </button>
              <button
                onClick={() => onAction(booking, 'request_documents')}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 min-h-[32px]"
              >
                Request Docs
              </button>
            </>
          )}

          {!isTerminalStatus(booking.status) && (
            <>
              <button
                onClick={() => onAction(booking, 'modify')}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 min-h-[32px]"
              >
                Modify
              </button>
              <button
                onClick={() => onAction(booking, 'cancel')}
                className="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 rounded hover:bg-red-100 dark:hover:bg-red-900/40 min-h-[32px]"
              >
                Cancel
              </button>
            </>
          )}

          <button
            onClick={() => onSelect(booking)}
            className="ml-auto px-3 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 rounded hover:bg-purple-100 dark:hover:bg-purple-900/40 min-h-[32px] flex items-center gap-1"
          >
            View Details
            <IoChevronForwardOutline className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
