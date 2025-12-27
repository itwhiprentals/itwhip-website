// app/partner/bookings/page.tsx
// Partner Bookings Page - List and manage all bookings

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IoCalendarOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoCloseCircleOutline,
  IoCarOutline,
  IoPersonOutline,
  IoChevronForwardOutline,
  IoRefreshOutline,
  IoDownloadOutline,
  IoEllipsisHorizontalOutline
} from 'react-icons/io5'

interface Booking {
  id: string
  guestName: string
  guestEmail: string
  guestPhone?: string
  vehicleName: string
  vehicleId: string
  startDate: string
  endDate: string
  status: 'confirmed' | 'pending' | 'active' | 'completed' | 'cancelled'
  totalAmount: number
  createdAt: string
  days: number
}

type FilterStatus = 'all' | 'confirmed' | 'pending' | 'active' | 'completed' | 'cancelled'

export default function PartnerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/partner/bookings')
      const data = await res.json()
      if (data.success) {
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          label: 'Confirmed',
          color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
          icon: IoCheckmarkCircleOutline
        }
      case 'pending':
        return {
          label: 'Pending',
          color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
          icon: IoTimeOutline
        }
      case 'active':
        return {
          label: 'Active',
          color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
          icon: IoCarOutline
        }
      case 'completed':
        return {
          label: 'Completed',
          color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700',
          icon: IoCheckmarkCircleOutline
        }
      case 'cancelled':
        return {
          label: 'Cancelled',
          color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
          icon: IoCloseCircleOutline
        }
      default:
        return {
          label: status,
          color: 'text-gray-600 bg-gray-100',
          icon: IoTimeOutline
        }
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const isInDateRange = (booking: Booking) => {
    if (dateRange === 'all') return true

    const now = new Date()
    const bookingStart = new Date(booking.startDate)

    switch (dateRange) {
      case 'today':
        return bookingStart.toDateString() === now.toDateString()
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return bookingStart >= weekAgo
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return bookingStart >= monthAgo
      default:
        return true
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    const matchesDate = isInDateRange(booking)

    return matchesSearch && matchesStatus && matchesDate
  })

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    active: bookings.filter(b => b.status === 'active').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  }

  const totalRevenue = bookings
    .filter(b => b.status === 'completed' || b.status === 'active' || b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalAmount, 0)

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bookings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage reservations across your fleet
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchBookings()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <IoRefreshOutline className="w-5 h-5" />
            Refresh
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <IoDownloadOutline className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-lg border transition-colors ${
            statusFilter === 'all'
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
          }`}
        >
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-lg border transition-colors ${
            statusFilter === 'pending'
              ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
          }`}
        >
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
        </button>
        <button
          onClick={() => setStatusFilter('confirmed')}
          className={`p-4 rounded-lg border transition-colors ${
            statusFilter === 'confirmed'
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
          }`}
        >
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.confirmed}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Confirmed</p>
        </button>
        <button
          onClick={() => setStatusFilter('active')}
          className={`p-4 rounded-lg border transition-colors ${
            statusFilter === 'active'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
          }`}
        >
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.active}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
        </button>
        <button
          onClick={() => setStatusFilter('completed')}
          className={`p-4 rounded-lg border transition-colors ${
            statusFilter === 'completed'
              ? 'border-gray-500 bg-gray-50 dark:bg-gray-700'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
          }`}
        >
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.completed}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
        </button>
        <button
          onClick={() => setStatusFilter('cancelled')}
          className={`p-4 rounded-lg border transition-colors ${
            statusFilter === 'cancelled'
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
          }`}
        >
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.cancelled}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Cancelled</p>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by guest, vehicle, or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Bookings List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <IoCalendarOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              {bookings.length === 0 ? 'No bookings yet' : 'No bookings match your filters'}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Bookings will appear here when guests reserve your vehicles
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredBookings.map((booking) => {
                  const statusConfig = getStatusConfig(booking.status)
                  const StatusIcon = statusConfig.icon

                  return (
                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <IoPersonOutline className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {booking.guestName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {booking.guestEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/partner/fleet/${booking.vehicleId}`}
                          className="text-sm font-medium text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400"
                        >
                          {booking.vehicleName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {formatShortDate(booking.startDate)} - {formatShortDate(booking.endDate)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {booking.days} day{booking.days !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${booking.totalAmount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`/partner/bookings/${booking.id}`}
                          className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
                        >
                          View
                          <IoChevronForwardOutline className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredBookings.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <p>
            Showing {filteredBookings.length} of {bookings.length} bookings
          </p>
          <p>
            Total Revenue: <span className="font-semibold text-gray-900 dark:text-white">${totalRevenue.toLocaleString()}</span>
          </p>
        </div>
      )}
    </div>
  )
}
