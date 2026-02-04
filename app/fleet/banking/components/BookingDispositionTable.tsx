// app/fleet/banking/components/BookingDispositionTable.tsx
// Shows all-time booking status breakdown with amounts

import { formatCurrency } from '../types'

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

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PAID: 'Paid',
  PENDING: 'Payment Pending',
  PARTIAL_REFUND: 'Partial Refund',
  REFUNDED: 'Refunded',
  FAILED: 'Failed',
  PROCESSING: 'Processing'
}

export function BookingDispositionTable({ bookingsByStatus, bookingsByPaymentStatus }: BookingDispositionProps) {
  const statusEntries = Object.entries(bookingsByStatus)
    .sort((a, b) => b[1].count - a[1].count)

  const paymentEntries = Object.entries(bookingsByPaymentStatus)
    .sort((a, b) => b[1].count - a[1].count)

  const totalBookings = statusEntries.reduce((sum, [, data]) => sum + data.count, 0)
  const totalAmount = statusEntries.reduce((sum, [, data]) => sum + data.totalAmount, 0)
  const totalFees = statusEntries.reduce((sum, [, data]) => sum + data.serviceFees, 0)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        All-Time Booking Disposition
      </h2>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {totalBookings.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalAmount)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Service Fees</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalFees)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Trip Status */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            By Trip Status
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">Status</th>
                  <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium">Count</th>
                  <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {statusEntries.map(([status, data]) => (
                  <tr key={status} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-2 text-gray-900 dark:text-white">
                      {STATUS_LABELS[status] || status}
                    </td>
                    <td className="py-2 text-right text-gray-600 dark:text-gray-400">
                      {data.count.toLocaleString()}
                    </td>
                    <td className="py-2 text-right font-medium text-gray-900 dark:text-white">
                      {formatCurrency(data.totalAmount)}
                    </td>
                  </tr>
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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">Status</th>
                  <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium">Count</th>
                  <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {paymentEntries.map(([status, data]) => (
                  <tr key={status} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-2 text-gray-900 dark:text-white">
                      {PAYMENT_STATUS_LABELS[status] || status}
                    </td>
                    <td className="py-2 text-right text-gray-600 dark:text-gray-400">
                      {data.count.toLocaleString()}
                    </td>
                    <td className="py-2 text-right font-medium text-gray-900 dark:text-white">
                      {formatCurrency(data.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
