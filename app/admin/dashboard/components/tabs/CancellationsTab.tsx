// app/admin/dashboard/components/tabs/CancellationsTab.tsx
'use client'

import { IoBanOutline } from 'react-icons/io5'

interface Booking {
  id: string
  bookingCode: string
  guestName: string
  guestEmail: string
  status: string
  totalAmount: number
  cancelledBy?: string
  cancellationReason?: string
  cancelledAt?: string
}

interface CancellationsTabProps {
  bookings: Booking[]
}

export default function CancellationsTab({ bookings }: CancellationsTabProps) {
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled')

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cancelled Bookings</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            All cancelled bookings with reasons
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Booking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Cancelled By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Refund
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {cancelledBookings.map(booking => (
                <tr key={booking.id}>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{booking.bookingCode}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 dark:text-white">{booking.guestName}</p>
                    <p className="text-xs text-gray-500">{booking.guestEmail}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900 dark:text-white">{booking.cancelledBy || 'System'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 dark:text-white">{booking.cancellationReason || 'No reason provided'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {booking.cancelledAt 
                        ? new Date(booking.cancelledAt).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-green-600">
                      ${booking.totalAmount?.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cancelledBookings.length === 0 && (
            <div className="p-12 text-center">
              <IoBanOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No cancelled bookings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}