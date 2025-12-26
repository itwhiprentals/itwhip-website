// app/partner/dashboard/components/RecentBookings.tsx
// Recent Bookings Component - Shows latest booking activity

'use client'

import Link from 'next/link'
import {
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoCloseCircleOutline,
  IoCarOutline,
  IoChevronForwardOutline,
  IoCalendarOutline
} from 'react-icons/io5'

interface Booking {
  id: string
  guestName: string
  vehicleName: string
  startDate: string
  endDate: string
  status: 'confirmed' | 'pending' | 'active' | 'completed' | 'cancelled'
  totalAmount: number
}

interface RecentBookingsProps {
  bookings: Booking[]
}

export default function RecentBookings({ bookings }: RecentBookingsProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          icon: IoCheckmarkCircleOutline,
          color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
          label: 'Confirmed'
        }
      case 'pending':
        return {
          icon: IoTimeOutline,
          color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
          label: 'Pending'
        }
      case 'active':
        return {
          icon: IoCarOutline,
          color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
          label: 'Active'
        }
      case 'completed':
        return {
          icon: IoCheckmarkCircleOutline,
          color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700',
          label: 'Completed'
        }
      case 'cancelled':
        return {
          icon: IoCloseCircleOutline,
          color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
          label: 'Cancelled'
        }
      default:
        return {
          icon: IoTimeOutline,
          color: 'text-gray-600 bg-gray-100',
          label: status
        }
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <IoCalendarOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No bookings yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Bookings will appear here once guests start reserving your vehicles
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {bookings.slice(0, 5).map((booking) => {
        const statusConfig = getStatusConfig(booking.status)
        const StatusIcon = statusConfig.icon

        return (
          <Link
            key={booking.id}
            href={`/partner/bookings/${booking.id}`}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {booking.guestName}
                </p>
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {booking.vehicleName}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                ${booking.totalAmount.toLocaleString()}
              </span>
              <IoChevronForwardOutline className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
            </div>
          </Link>
        )
      })}

      {bookings.length > 5 && (
        <Link
          href="/partner/bookings"
          className="block text-center py-2 text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
        >
          View all {bookings.length} bookings
        </Link>
      )}
    </div>
  )
}
