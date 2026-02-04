// app/fleet/banking/components/BookingDispositionTable.tsx
// Shows all-time booking status breakdown with expandable drill-down

'use client'

import { useState } from 'react'
import React from 'react'
import { formatCurrency, formatDate } from '../types'

interface BookingDetail {
  id: string
  bookingCode: string
  carName: string
  guestName: string
  startDate: string
  endDate: string
  total: number
  subtotal?: number
  serviceFee?: number
  refundAmount?: number
  platformRetained?: number
  refundPercent?: number
  hoursBeforeStart?: number
  cancelledAt?: string
  cancellationReason?: string
  cancellationPolicy?: string
  paymentStatus?: string
}

interface CancellationSummary {
  totalBookings: number
  totalOriginalValue: number
  totalRefunds: number
  totalPlatformRetained: number
  byPolicy: {
    flexible: number
    moderate: number
    strict: number
    super_strict: number
  }
}

interface BookingDispositionProps {
  bookingsByStatus: Record<string, { count: number; totalAmount: number; serviceFees: number }>
  bookingsByPaymentStatus: Record<string, { count: number; totalAmount: number }>
}

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: 'Completed',
  ACTIVE: 'Active',
  CONFIRMED: 'Confirmed',
  PENDING: 'Pending',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
  DISPUTE_REVIEW: 'In Dispute',
  NO_SHOW: 'No Show'
}

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  ACTIVE: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  CONFIRMED: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  CANCELLED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  EXPIRED: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  DISPUTE_REVIEW: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  NO_SHOW: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PAID: 'Paid',
  PAYMENT_PENDING: 'Payment Pending',
  PARTIAL_REFUND: 'Partial Refund',
  REFUNDED: 'Refunded',
  FAILED: 'Failed',
  PROCESSING: 'Processing'
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PAID: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  PAYMENT_PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  PARTIAL_REFUND: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  REFUNDED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  FAILED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  PROCESSING: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
}

const CANCELLATION_POLICIES: Record<string, { label: string; description: string }> = {
  flexible: { label: 'Flexible', description: 'Full refund 24h before' },
  moderate: { label: 'Moderate', description: 'Full refund 48h before' },
  strict: { label: 'Strict', description: 'Full refund 7 days before' },
  super_strict: { label: 'Super Strict', description: 'No refund' }
}

export function BookingDispositionTable({ bookingsByStatus, bookingsByPaymentStatus }: BookingDispositionProps) {
  const [expandedStatus, setExpandedStatus] = useState<string | null>(null)
  const [expandedPaymentStatus, setExpandedPaymentStatus] = useState<string | null>(null)
  const [expandedBookings, setExpandedBookings] = useState<BookingDetail[]>([])
  const [cancellationSummary, setCancellationSummary] = useState<CancellationSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const statusEntries = Object.entries(bookingsByStatus)
    .sort((a, b) => b[1].count - a[1].count)

  const paymentEntries = Object.entries(bookingsByPaymentStatus)
    .sort((a, b) => b[1].count - a[1].count)

  const totalBookings = statusEntries.reduce((sum, [, data]) => sum + data.count, 0)
  const totalAmount = statusEntries.reduce((sum, [, data]) => sum + data.totalAmount, 0)
  const totalFees = statusEntries.reduce((sum, [, data]) => sum + data.serviceFees, 0)

  // Fetch bookings by status
  const handleStatusClick = async (status: string) => {
    if (expandedStatus === status) {
      setExpandedStatus(null)
      setExpandedBookings([])
      setCancellationSummary(null)
      return
    }

    // For COMPLETED, show link to full list (too many)
    if (status === 'COMPLETED') {
      setExpandedStatus(status)
      setExpandedBookings([])
      setCancellationSummary(null)
      return
    }

    setLoading(true)
    setError(null)
    setExpandedPaymentStatus(null)
    setCancellationSummary(null)

    try {
      const res = await fetch(`/fleet/api/banking/bookings-by-status?status=${status}&key=phoenix-fleet-2847`)
      if (res.ok) {
        const data = await res.json()
        setExpandedBookings(data.bookings || [])
        if (data.cancellationSummary) {
          setCancellationSummary(data.cancellationSummary)
        }
      } else {
        setError('Failed to load bookings')
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err)
      setError('Failed to load bookings')
    } finally {
      setLoading(false)
      setExpandedStatus(status)
    }
  }

  // Fetch bookings by payment status
  const handlePaymentStatusClick = async (status: string) => {
    if (expandedPaymentStatus === status) {
      setExpandedPaymentStatus(null)
      setExpandedBookings([])
      setCancellationSummary(null)
      return
    }

    // For PAID, show link to full list (too many)
    if (status === 'PAID') {
      setExpandedPaymentStatus(status)
      setExpandedBookings([])
      setCancellationSummary(null)
      return
    }

    setLoading(true)
    setError(null)
    setExpandedStatus(null)
    setCancellationSummary(null)

    try {
      const res = await fetch(`/fleet/api/banking/bookings-by-status?paymentStatus=${status}&key=phoenix-fleet-2847`)
      if (res.ok) {
        const data = await res.json()
        setExpandedBookings(data.bookings || [])
      } else {
        setError('Failed to load bookings')
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err)
      setError('Failed to load bookings')
    } finally {
      setLoading(false)
      setExpandedPaymentStatus(status)
    }
  }

  // Render expanded booking details
  const renderExpandedSection = (isPaymentStatus = false) => {
    const currentStatus = isPaymentStatus ? expandedPaymentStatus : expandedStatus

    if (!currentStatus) return null

    // Special case for COMPLETED/PAID - too many to show
    if (currentStatus === 'COMPLETED' || currentStatus === 'PAID') {
      return (
        <tr>
          <td colSpan={3} className="py-4 px-4 bg-gray-50 dark:bg-gray-700/50">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p className="mb-2">Too many bookings to display inline ({bookingsByStatus[currentStatus]?.count || bookingsByPaymentStatus[currentStatus]?.count} total)</p>
              <a
                href="/fleet/bookings"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all bookings →
              </a>
            </div>
          </td>
        </tr>
      )
    }

    if (loading) {
      return (
        <tr>
          <td colSpan={3} className="py-4 px-4 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading bookings...
            </div>
          </td>
        </tr>
      )
    }

    if (error) {
      return (
        <tr>
          <td colSpan={3} className="py-4 px-4 bg-red-50 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400 text-center">
              {error}
            </p>
          </td>
        </tr>
      )
    }

    if (expandedBookings.length === 0) {
      return (
        <tr>
          <td colSpan={3} className="py-4 px-4 bg-gray-50 dark:bg-gray-700/50">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              No bookings found
            </p>
          </td>
        </tr>
      )
    }

    return (
      <tr>
        <td colSpan={3} className="p-0">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 border-t border-gray-200 dark:border-gray-600">
            {/* Cancellation Summary Banner */}
            {currentStatus === 'CANCELLED' && cancellationSummary && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  Cancellation Revenue Summary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Original Value</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(cancellationSummary.totalOriginalValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Refunded to Guests</p>
                    <p className="font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(cancellationSummary.totalRefunds)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Platform Retained</p>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(cancellationSummary.totalPlatformRetained)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">By Policy</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      F:{cancellationSummary.byPolicy.flexible} M:{cancellationSummary.byPolicy.moderate} S:{cancellationSummary.byPolicy.strict}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
              {STATUS_LABELS[currentStatus] || PAYMENT_STATUS_LABELS[currentStatus] || currentStatus} Bookings ({expandedBookings.length})
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {expandedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {booking.bookingCode}
                      </span>
                      <span className="mx-2 text-gray-400">|</span>
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        {booking.carName}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {formatCurrency(booking.total)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{booking.guestName}</span>
                    <span>
                      {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                    </span>
                  </div>

                  {/* Enhanced Cancellation Details */}
                  {currentStatus === 'CANCELLED' && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      {/* Policy and Timing Row */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {booking.cancellationPolicy && (
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            booking.cancellationPolicy === 'super_strict'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                              : booking.cancellationPolicy === 'strict'
                                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                : booking.cancellationPolicy === 'moderate'
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                  : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          }`}>
                            {CANCELLATION_POLICIES[booking.cancellationPolicy]?.label || booking.cancellationPolicy}
                          </span>
                        )}
                        {booking.hoursBeforeStart !== undefined && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Cancelled {booking.hoursBeforeStart}h before start
                          </span>
                        )}
                        {booking.refundPercent !== undefined && (
                          <span className={`text-xs font-medium ${
                            booking.refundPercent === 100
                              ? 'text-green-600 dark:text-green-400'
                              : booking.refundPercent === 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-yellow-600 dark:text-yellow-400'
                          }`}>
                            {booking.refundPercent}% refund
                          </span>
                        )}
                      </div>

                      {/* Financial Breakdown */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                          <p className="text-gray-500 dark:text-gray-400">Subtotal</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(booking.subtotal || 0)}
                          </p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                          <p className="text-blue-600 dark:text-blue-400">Refunded</p>
                          <p className="font-medium text-blue-700 dark:text-blue-300">
                            {formatCurrency(booking.refundAmount || 0)}
                          </p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                          <p className="text-green-600 dark:text-green-400">Retained</p>
                          <p className="font-medium text-green-700 dark:text-green-300">
                            {formatCurrency(booking.platformRetained || 0)}
                          </p>
                        </div>
                      </div>

                      {/* Reason */}
                      {booking.cancellationReason && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {booking.cancellationReason}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Payment Status Actions */}
                  {isPaymentStatus && currentStatus !== 'PAID' && (
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                      {currentStatus === 'PAYMENT_PENDING' && (
                        <>
                          <button className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50">
                            Send Reminder
                          </button>
                          <button className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50">
                            Cancel Booking
                          </button>
                        </>
                      )}
                      {currentStatus === 'FAILED' && (
                        <>
                          <button className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50">
                            Retry Payment
                          </button>
                          <button className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50">
                            Contact Guest
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        All-Time Booking Disposition
      </h2>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="text-center sm:text-left">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            {totalBookings.toLocaleString()}
          </p>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalAmount)}
          </p>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Service Fees</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalFees)}
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Click on a status to view booking details
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Trip Status */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            By Booking Status
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium w-[45%]">Status</th>
                  <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium w-[20%]">Count</th>
                  <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium w-[35%]">Amount</th>
                </tr>
              </thead>
              <tbody>
                {statusEntries.map(([status, data]) => (
                  <React.Fragment key={status}>
                    <tr
                      onClick={() => handleStatusClick(status)}
                      className={`border-b border-gray-100 dark:border-gray-700/50 cursor-pointer transition-colors ${
                        expandedStatus === status
                          ? 'bg-gray-100 dark:bg-gray-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <td className="py-2">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className={`inline-flex px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium truncate ${STATUS_COLORS[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                            {STATUS_LABELS[status] || status}
                          </span>
                          <svg
                            className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition-transform flex-shrink-0 ${expandedStatus === status ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </td>
                      <td className="py-2 text-right text-gray-600 dark:text-gray-400 tabular-nums">
                        {data.count.toLocaleString()}
                      </td>
                      <td className="py-2 text-right font-medium text-gray-900 dark:text-white tabular-nums text-xs sm:text-sm">
                        {formatCurrency(data.totalAmount)}
                      </td>
                    </tr>
                    {expandedStatus === status && renderExpandedSection(false)}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* By Payment Status */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            By Payment Status
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium w-[45%]">Status</th>
                  <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium w-[20%]">Count</th>
                  <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium w-[35%]">Amount</th>
                </tr>
              </thead>
              <tbody>
                {paymentEntries.map(([status, data]) => (
                  <React.Fragment key={status}>
                    <tr
                      onClick={() => handlePaymentStatusClick(status)}
                      className={`border-b border-gray-100 dark:border-gray-700/50 cursor-pointer transition-colors ${
                        expandedPaymentStatus === status
                          ? 'bg-gray-100 dark:bg-gray-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <td className="py-2">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className={`inline-flex px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium truncate ${PAYMENT_STATUS_COLORS[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                            {PAYMENT_STATUS_LABELS[status] || status}
                          </span>
                          <svg
                            className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition-transform flex-shrink-0 ${expandedPaymentStatus === status ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </td>
                      <td className="py-2 text-right text-gray-600 dark:text-gray-400 tabular-nums">
                        {data.count.toLocaleString()}
                      </td>
                      <td className="py-2 text-right font-medium text-gray-900 dark:text-white tabular-nums text-xs sm:text-sm">
                        {formatCurrency(data.totalAmount)}
                      </td>
                    </tr>
                    {expandedPaymentStatus === status && renderExpandedSection(true)}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
