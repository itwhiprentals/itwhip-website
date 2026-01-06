// app/fleet/messages/components/BookingContextCard.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'

interface BookingDetails {
  id: string
  bookingCode: string
  startDate: string
  endDate: string
  numberOfDays: number
  status: string
  tripStatus?: string
  pickupLocation?: string
  pickupType?: string
  deliveryAddress?: string
  car: {
    id: string
    make: string
    model: string
    year: number
    color?: string
    carType?: string
    transmission?: string
    seats?: number
    photos?: { url: string }[]
  }
  renter?: {
    name?: string
    email?: string
  }
  guestName?: string
  guestEmail?: string
  host?: {
    name?: string
  }
}

interface BookingContextCardProps {
  booking: BookingDetails
  loading?: boolean
  onViewDetails?: () => void
}

export default function BookingContextCard({ 
  booking, 
  loading = false,
  onViewDetails 
}: BookingContextCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border-2 border-blue-200 dark:border-blue-800 p-4 mb-4 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  const carImage = booking.car.photos?.[0]?.url || '/placeholder-car.jpg'
  const guestName = booking.renter?.name || booking.guestName || 'Guest'
  const guestEmail = booking.renter?.email || booking.guestEmail

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getTripStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'in_progress':
        return '🚗'
      case 'completed':
        return '✅'
      case 'not_started':
        return '⏳'
      default:
        return '📋'
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border-2 border-blue-200 dark:border-blue-800 mb-4 overflow-hidden">
      {/* Header with collapse button */}
      <div 
        className="flex items-center justify-between px-4 py-2 bg-blue-100/50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{getTripStatusIcon(booking.tripStatus)}</span>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Booking Context
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(booking.status)}`}>
            {booking.status}
          </span>
        </div>
        <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          <svg 
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Car Image */}
            <div className="flex-shrink-0">
              <div className="relative w-full sm:w-24 h-24 sm:h-24 rounded-lg overflow-hidden border-2 border-blue-300 dark:border-blue-700 shadow-md">
                {!imageError ? (
                  <Image
                    src={carImage}
                    alt={`${booking.car.year} ${booking.car.make} ${booking.car.model}`}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Details */}
            <div className="flex-1 space-y-2">
              {/* Car Info */}
              <div>
                <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  {booking.car.year} {booking.car.make} {booking.car.model}
                  {booking.car.color && (
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                      ({booking.car.color})
                    </span>
                  )}
                </h4>
                {(booking.car.carType || booking.car.transmission || booking.car.seats) && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2 flex-wrap mt-1">
                    {booking.car.carType && <span>{booking.car.carType}</span>}
                    {booking.car.transmission && (
                      <>
                        <span>•</span>
                        <span>{booking.car.transmission}</span>
                      </>
                    )}
                    {booking.car.seats && (
                      <>
                        <span>•</span>
                        <span>{booking.car.seats} seats</span>
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 flex-shrink-0">📋</span>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Booking:</span>
                    <span className="font-semibold text-gray-900 dark:text-white ml-1">
                      {booking.bookingCode}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 flex-shrink-0">📅</span>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Dates:</span>
                    <span className="font-medium text-gray-900 dark:text-white ml-1 block sm:inline">
                      {format(new Date(booking.startDate), 'MMM d')} - {format(new Date(booking.endDate), 'MMM d, yyyy')}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      ({booking.numberOfDays} {booking.numberOfDays === 1 ? 'day' : 'days'})
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 flex-shrink-0">👤</span>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Guest:</span>
                    <span className="font-medium text-gray-900 dark:text-white ml-1">
                      {guestName}
                    </span>
                    {guestEmail && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 block">
                        {guestEmail}
                      </span>
                    )}
                  </div>
                </div>

                {(booking.pickupLocation || booking.deliveryAddress) && (
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 flex-shrink-0">📍</span>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Pickup:</span>
                      <span className="font-medium text-gray-900 dark:text-white ml-1 block sm:inline">
                        {booking.pickupType === 'DELIVERY' 
                          ? booking.deliveryAddress || 'Delivery' 
                          : booking.pickupLocation || 'Location TBD'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* View Full Details Button */}
              {onViewDetails && (
                <button
                  onClick={onViewDetails}
                  className="mt-3 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  <span>View Full Booking Details</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}