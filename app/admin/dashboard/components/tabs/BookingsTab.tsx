// app/admin/dashboard/components/tabs/BookingsTab.tsx
'use client'

import Link from 'next/link'
import {
  IoSearchOutline,
  IoDownloadOutline,
  IoEyeOutline,
  IoCreateOutline,
  IoBanOutline,
  IoDocumentTextOutline
} from 'react-icons/io5'

interface Booking {
  id: string
  bookingCode: string
  guestName: string
  guestEmail: string
  guestPhone: string
  car: {
    id: string
    make: string
    model: string
    year: number
    photos: Array<{ url: string }>
    host: {
      name: string
    }
  }
  status: string
  verificationStatus: string
  startDate: string
  endDate: string
  totalAmount: number
  createdAt: string
  hasDispute?: boolean
  tripStatus?: string
}

interface BookingsTabProps {
  bookings: Booking[]
  searchTerm: string
  filterStatus: string
  onSearchChange: (value: string) => void
  onFilterChange: (value: string) => void
  onCancelBooking: (bookingId: string, reason: string) => Promise<void>
  getStatusColor: (status: string) => string
}

export default function BookingsTab({
  bookings,
  searchTerm,
  filterStatus,
  onSearchChange,
  onFilterChange,
  onCancelBooking,
  getStatusColor
}: BookingsTabProps) {
  const filteredBookings = bookings.filter(booking => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        booking.bookingCode.toLowerCase().includes(search) ||
        booking.guestName.toLowerCase().includes(search) ||
        booking.guestEmail.toLowerCase().includes(search)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => onFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center">
            <IoDownloadOutline className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Booking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Trip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBookings.map(booking => (
                <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{booking.bookingCode}</p>
                      <p className="text-xs text-gray-500">{new Date(booking.createdAt).toLocaleDateString()}</p>
                      {booking.hasDispute && (
                        <span className="text-xs text-red-600">Has dispute</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{booking.guestName}</p>
                      <p className="text-xs text-gray-500">{booking.guestEmail}</p>
                      <p className="text-xs text-gray-500">{booking.guestPhone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {booking.car.photos[0] && (
                        <img 
                          src={booking.car.photos[0].url}
                          alt={`${booking.car.make} ${booking.car.model}`}
                          className="w-10 h-10 rounded object-cover mr-3"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {booking.car.year} {booking.car.make} {booking.car.model}
                        </p>
                        <p className="text-xs text-gray-500">Host: {booking.car.host.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(booking.startDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        to {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    {booking.verificationStatus === 'pending' && (
                      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        Verify Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.tripStatus === 'ACTIVE' ? (
                      <Link href={`/admin/rentals/trips/inspections/${booking.id}`} className="text-green-600 hover:text-green-800 font-medium text-sm">
                        Trip Active →
                      </Link>
                    ) : booking.tripStatus === 'COMPLETED' ? (
                      <span className="text-gray-600 text-sm">Completed</span>
                    ) : (
                      <span className="text-gray-400 text-sm">Not Started</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      ${booking.totalAmount?.toFixed(2) || '0.00'}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/rentals/bookings/${booking.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <IoEyeOutline className="w-5 h-5" />
                      </Link>
                      <button className="text-gray-600 hover:text-gray-900">
                        <IoCreateOutline className="w-5 h-5" />
                      </button>
                      {booking.status !== 'cancelled' && (
                        <button 
                          onClick={() => onCancelBooking(booking.id, 'Admin cancellation')}
                          className="text-red-600 hover:text-red-900"
                        >
                          <IoBanOutline className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBookings.length === 0 && (
            <div className="p-12 text-center">
              <IoDocumentTextOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No bookings found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}