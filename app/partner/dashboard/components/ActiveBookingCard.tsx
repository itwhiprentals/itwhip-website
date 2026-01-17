// app/partner/dashboard/components/ActiveBookingCard.tsx
// Shows currently active bookings with car photo, guest info, and booking details

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  IoCarSportOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoCallOutline,
  IoChevronForwardOutline,
  IoRefreshOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5'

interface ActiveBooking {
  id: string
  bookingNumber: string
  status: string
  startDate: string
  endDate: string
  pickupLocation: string | null
  dropoffLocation: string | null
  totalAmount: number
  guest: {
    name: string
    phone: string | null
    profilePhoto: string | null
  }
  vehicle: {
    id: string
    make: string
    model: string
    year: number
    photo: string | null
    licensePlate: string
  }
}

interface ActiveBookingCardProps {
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export default function ActiveBookingCard({
  collapsible = true,
  defaultCollapsed = false
}: ActiveBookingCardProps) {
  const [bookings, setBookings] = useState<ActiveBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  useEffect(() => {
    fetchActiveBookings()
  }, [])

  const fetchActiveBookings = async () => {
    try {
      setLoading(true)
      // API returns mapped lowercase statuses: confirmed, active, pending, completed, cancelled
      const response = await fetch('/api/partner/bookings', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.bookings) {
          // Filter for active bookings (confirmed = upcoming, active = checked in)
          const activeBookings = data.bookings
            .filter((b: any) => ['confirmed', 'active', 'pending'].includes(b.status))
            .slice(0, 3) // Show max 3 active bookings
            .map((b: any) => ({
              id: b.id,
              bookingNumber: b.bookingNumber || b.id.substring(0, 8).toUpperCase(),
              status: b.status,
              startDate: b.startDate,
              endDate: b.endDate,
              pickupLocation: b.pickupLocation,
              dropoffLocation: b.dropoffLocation,
              totalAmount: b.totalAmount || 0,
              guest: {
                name: b.guest?.name || b.guestName || 'Guest',
                phone: b.guest?.phone || b.guestPhone || null,
                profilePhoto: b.guest?.profilePhoto || null
              },
              vehicle: {
                id: b.car?.id || b.carId,
                make: b.car?.make || 'Unknown',
                model: b.car?.model || 'Vehicle',
                year: b.car?.year || new Date().getFullYear(),
                photo: b.car?.photos?.[0]?.url || null,
                licensePlate: b.car?.licensePlate || ''
              }
            }))
          setBookings(activeBookings)
        }
      }
    } catch (error) {
      console.error('Failed to fetch active bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pending', className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
      confirmed: { label: 'Confirmed', className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
      active: { label: 'In Progress', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
      completed: { label: 'Completed', className: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' }
    }
    return statusMap[status] || { label: status, className: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' }
  }

  const getTimeRemaining = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diffMs = end.getTime() - now.getTime()

    if (diffMs <= 0) return 'Overdue'

    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h left`
    if (hours > 0) return `${hours}h left`

    const minutes = Math.floor(diffMs / (1000 * 60))
    return `${minutes}m left`
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-16 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Don't render if no active bookings
  if (bookings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <IoCarSportOutline className="w-5 h-5 text-orange-500" />
            Active Bookings
          </h3>
        </div>
        <div className="text-center py-4">
          <IoCheckmarkCircleOutline className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No active bookings</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Your fleet is ready for new trips
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <IoCarSportOutline className="w-5 h-5 text-orange-500" />
            Active Bookings
            <span className="px-1.5 py-0.5 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded">
              {bookings.length}
            </span>
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchActiveBookings}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <IoRefreshOutline className="w-4 h-4" />
            </button>
            {collapsible && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                {isCollapsed ? '▼' : '▲'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4 space-y-3">
          {bookings.map((booking) => {
            const statusBadge = getStatusBadge(booking.status)
            return (
              <Link
                key={booking.id}
                href={`/partner/bookings/${booking.id}`}
                className="flex gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
              >
                {/* Vehicle Photo */}
                <div className="flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {booking.vehicle.photo ? (
                    <Image
                      src={booking.vehicle.photo}
                      alt={`${booking.vehicle.make} ${booking.vehicle.model}`}
                      width={80}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <IoCarSportOutline className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Booking Info */}
                <div className="flex-1 min-w-0">
                  {/* Top row: Vehicle + Status */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
                    </p>
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${statusBadge.className} flex-shrink-0`}>
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Guest name + Booking # */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <IoPersonOutline className="w-3 h-3" />
                      {booking.guest.name}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span>#{booking.bookingNumber}</span>
                  </div>

                  {/* Time info */}
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      <IoTimeOutline className="w-3 h-3" />
                      {getTimeRemaining(booking.endDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <IoCalendarOutline className="w-3 h-3" />
                      Returns {formatDate(booking.endDate)}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <IoChevronForwardOutline className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            )
          })}

          {/* View All Link */}
          <Link
            href="/partner/bookings?status=active"
            className="flex items-center justify-center gap-2 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 pt-2 border-t border-gray-100 dark:border-gray-700"
          >
            View All Bookings
            <IoChevronForwardOutline className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
