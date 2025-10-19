'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  IoCarOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoCashOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoCloseCircleOutline,
  IoArrowBackOutline,
  IoPersonOutline,
  IoStarOutline,
  IoChevronForwardOutline
} from 'react-icons/io5'

interface Trip {
  id: string
  bookingCode: string
  guestName: string
  guestEmail?: string
  guestAvatar?: string
  car: {
    id: string
    make: string
    model: string
    year: number
    licensePlate?: string
    photo?: string
  }
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  numberOfDays: number
  pickupLocation: string
  pickupType: string
  deliveryAddress?: string
  dailyRate: number
  subtotal: number
  totalAmount: number
  depositAmount: number
  status: string
  paymentStatus: string
  verificationStatus: string
  tripStatus: string
  tripStartedAt?: string
  tripEndedAt?: string
  actualStartTime?: string
  actualEndTime?: string
  startMileage?: number
  endMileage?: number
  hasReview: boolean
  review?: {
    rating: number
    comment: string
    createdAt: string
  }
  createdAt: string
  updatedAt: string
}

interface Stats {
  total: number
  upcoming: number
  active: number
  completed: number
  cancelled: number
}

export default function HostTripsPage() {
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    upcoming: 0,
    active: 0,
    completed: 0,
    cancelled: 0
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'active' | 'completed' | 'cancelled'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchTrips()
  }, [filter, page])

  const fetchTrips = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('status', filter)
      if (searchTerm) params.append('search', searchTerm)
      params.append('page', page.toString())
      params.append('limit', '20')

      const response = await fetch(`/api/host/trips?${params}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch trips')
      }

      const data = await response.json()
      setTrips(data.trips || [])
      setStats(data.stats || stats)
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error fetching trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchTrips()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
      case 'ACTIVE':
        return 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30'
      case 'CONFIRMED':
        return 'text-purple-700 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30'
      case 'PENDING':
        return 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30'
      case 'CANCELLED':
        return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
      default:
        return 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <IoCheckmarkCircleOutline className="w-4 h-4" />
      case 'ACTIVE':
        return <IoCarOutline className="w-4 h-4" />
      case 'PENDING':
      case 'CONFIRMED':
        return <IoTimeOutline className="w-4 h-4" />
      case 'CANCELLED':
        return <IoCloseCircleOutline className="w-4 h-4" />
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading && trips.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/host/dashboard')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
          >
            <IoArrowBackOutline className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                All Trips
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                View and manage all your rental bookings
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Upcoming</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.upcoming}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Active</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.active}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completed</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.completed}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700 col-span-2 sm:col-span-1">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cancelled</p>
            <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.cancelled}
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <IoSearchOutline className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by guest name, email, or car..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <IoFilterOutline className="text-gray-400 w-5 h-5" />
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value as any)
                  setPage(1)
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Trips</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Search Button - Mobile */}
            <button
              onClick={handleSearch}
              className="sm:hidden px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Search
            </button>
          </div>
        </div>

        {/* Trips List */}
        {trips.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <IoCarOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No trips found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search' : 'No trips match the selected filter'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => router.push(`/host/bookings/${trip.id}`)}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Car Photo */}
                  <div className="w-full sm:w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    {trip.car.photo ? (
                      <Image
                        src={trip.car.photo}
                        alt={`${trip.car.make} ${trip.car.model}`}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IoCarOutline className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Trip Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {trip.car.year} {trip.car.make} {trip.car.model}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Booking #{trip.bookingCode}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                          {getStatusIcon(trip.status)}
                          {trip.status}
                        </span>
                      </div>
                    </div>

                    {/* Guest Info */}
                    <div className="flex items-center gap-2 mb-3">
                      {trip.guestAvatar ? (
                        <Image
                          src={trip.guestAvatar}
                          alt={trip.guestName}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <IoPersonOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                      )}
                      <span className="text-sm text-gray-900 dark:text-white font-medium">
                        {trip.guestName}
                      </span>
                    </div>

                    {/* Trip Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-start gap-2">
                        <IoCalendarOutline className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">Dates</p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                          </p>
                          <p className="text-gray-500 dark:text-gray-500 text-xs">
                            {trip.numberOfDays} {trip.numberOfDays === 1 ? 'day' : 'days'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <IoLocationOutline className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">Pickup</p>
                          <p className="text-gray-900 dark:text-white font-medium truncate">
                            {trip.pickupType === 'host' ? 'Host Location' : 
                             trip.pickupType === 'airport' ? 'Airport' :
                             trip.pickupType === 'hotel' ? 'Hotel' : 'Delivery'}
                          </p>
                          <p className="text-gray-500 dark:text-gray-500 text-xs truncate">
                            {trip.pickupLocation}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <IoCashOutline className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">Total</p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            ${trip.totalAmount.toLocaleString()}
                          </p>
                          <p className="text-gray-500 dark:text-gray-500 text-xs">
                            ${trip.dailyRate}/day
                          </p>
                        </div>
                      </div>

                      {trip.hasReview && trip.review && (
                        <div className="flex items-start gap-2">
                          <IoStarOutline className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-gray-600 dark:text-gray-400 text-xs">Review</p>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {trip.review.rating} ★
                            </p>
                            <p className="text-gray-500 dark:text-gray-500 text-xs">
                              Reviewed
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* View Details Link */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:underline flex items-center gap-1">
                        View Details
                        <IoChevronForwardOutline className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}