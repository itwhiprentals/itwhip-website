// app/fleet/bookings/components/BookingsTable.tsx
'use client'

import { FleetBooking, formatCurrency, formatDate, getStatusColor, getStatusLabel, getVerificationColor, getVerificationLabel, getReviewStatusColor, getReviewStatusLabel, isTerminalStatus } from '../types'
import {
  IoAlertCircleOutline,
  IoChevronForwardOutline
} from 'react-icons/io5'

interface BookingsTableProps {
  bookings: FleetBooking[]
  onSelect: (booking: FleetBooking) => void
  onAction: (booking: FleetBooking, action: string) => void
}

export function BookingsTable({ bookings, onSelect, onAction }: BookingsTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">No bookings found</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Booking
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Guest
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {bookings.map((booking) => {
              const isHighRisk = (booking.riskScore || 0) >= 60
              const needsVerification = booking.verificationStatus === 'PENDING'

              return (
                <tr
                  key={booking.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    isHighRisk ? 'bg-red-50 dark:bg-red-900/10' : ''
                  }`}
                >
                  {/* Booking Code */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {(isHighRisk || booking.flaggedForReview) && (
                        <IoAlertCircleOutline className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {booking.bookingCode}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(booking.createdAt)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Guest */}
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {booking.guestName}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">
                      {booking.guestEmail}
                    </p>
                  </td>

                  {/* Vehicle */}
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {booking.car.year} {booking.car.make} {booking.car.model}
                    </p>
                    <p className="text-xs text-gray-500">
                      {booking.host.name}
                    </p>
                  </td>

                  {/* Dates */}
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(booking.startDate)}
                    </p>
                    <p className="text-xs text-gray-500">
                      to {formatDate(booking.endDate)}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                        {getStatusLabel(booking.status)}
                      </span>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getVerificationColor(booking.verificationStatus)}`}>
                        {getVerificationLabel(booking.verificationStatus)}
                      </span>
                      {booking.hostFinalReviewStatus && (
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getReviewStatusColor(booking.hostFinalReviewStatus)}`}>
                          {getReviewStatusLabel(booking.hostFinalReviewStatus)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(booking.totalAmount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {booking.numberOfDays} days
                    </p>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {needsVerification && !isTerminalStatus(booking.status) && (
                        <>
                          <button
                            onClick={() => onAction(booking, 'approve')}
                            className="px-2 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onAction(booking, 'reject')}
                            className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onSelect(booking)}
                        className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded"
                      >
                        <IoChevronForwardOutline className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
