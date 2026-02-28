// app/partner/bookings/page.tsx
// Partner Bookings Page - List and manage all bookings

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
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
  paymentType: string | null
}

type FilterStatus = 'all' | 'confirmed' | 'pending' | 'active' | 'completed' | 'cancelled'

export default function PartnerBookingsPage() {
  const t = useTranslations('PartnerBookings')

  const locale = useLocale()
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
          label: t('statusConfirmed'),
          color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
          icon: IoCheckmarkCircleOutline
        }
      case 'pending':
        return {
          label: t('statusPending'),
          color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
          icon: IoTimeOutline
        }
      case 'active':
        return {
          label: t('statusActive'),
          color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
          icon: IoCarOutline
        }
      case 'completed':
        return {
          label: t('statusCompleted'),
          color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700',
          icon: IoCheckmarkCircleOutline
        }
      case 'cancelled':
        return {
          label: t('statusCancelled'),
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
    return new Date(dateStr).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale, {
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
      <div className="p-3 sm:p-4 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('bookingsTitle')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('manageReservations')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchBookings()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <IoRefreshOutline className="w-5 h-5" />
            {t('refresh')}
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <IoDownloadOutline className="w-5 h-5" />
            {t('export')}
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
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('total')}</p>
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
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('pending')}</p>
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
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('confirmed')}</p>
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
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('active')}</p>
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
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('completed')}</p>
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
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('cancelled')}</p>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
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
          <option value="all">{t('allTime')}</option>
          <option value="today">{t('today')}</option>
          <option value="week">{t('thisWeek')}</option>
          <option value="month">{t('thisMonth')}</option>
        </select>
      </div>

      {/* Bookings List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <IoCalendarOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              {bookings.length === 0 ? t('noBookingsYet') : t('noBookingsMatch')}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {t('bookingsWillAppear')}
            </p>
          </div>
        ) : (
          <>
          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
            {filteredBookings.map((booking) => {
              const statusConfig = getStatusConfig(booking.status)
              const StatusIcon = statusConfig.icon
              return (
                <Link
                  key={booking.id}
                  href={`/partner/bookings/${booking.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-100 dark:active:bg-gray-700 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <IoPersonOutline className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{booking.guestName}</p>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white flex-shrink-0">
                        ${booking.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <div className="truncate">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{booking.vehicleName.split(' ').slice(0, 2).join(' ')}</p>
                        <p className="text-xs font-medium text-gray-900 dark:text-white">{booking.vehicleName.split(' ').slice(2).join(' ')}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {t(booking.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {formatShortDate(booking.startDate)} — {formatShortDate(booking.endDate)} · {t('daysCount', { count: booking.days })}
                    </p>
                  </div>
                  <IoChevronForwardOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </Link>
              )
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('guest')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('vehicle')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('dates')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('amount')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('actions')}
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
                        <Link
                          href={`/partner/bookings/${booking.id}`}
                          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <IoPersonOutline className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {booking.guestName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {booking.guestEmail}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/partner/fleet/${booking.vehicleId}`}
                          className="hover:text-orange-600 dark:hover:text-orange-400"
                        >
                          {(() => {
                            const parts = booking.vehicleName.split(' ')
                            const year = parts[0]
                            const make = parts[1] || ''
                            const model = parts.slice(2).join(' ') || ''
                            return (
                              <>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{year} {make}</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{model}</p>
                              </>
                            )
                          })()}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {formatShortDate(booking.startDate)} - {formatShortDate(booking.endDate)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('daysCount', { count: booking.days })}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.label}
                          </span>
                          {booking.paymentType === 'CASH' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                              {t('cash')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${booking.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`/partner/bookings/${booking.id}`}
                          className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
                        >
                          {t('view')}
                          <IoChevronForwardOutline className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* Summary */}
      {filteredBookings.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('showingOf', { filtered: filteredBookings.length, total: bookings.length })}
          </p>
          <Link href="/partner/revenue" className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            {t('totalRevenue')} <span className="font-semibold text-gray-900 dark:text-white">${totalRevenue.toLocaleString()}</span>
          </Link>
        </div>
      )}
    </div>
  )
}
