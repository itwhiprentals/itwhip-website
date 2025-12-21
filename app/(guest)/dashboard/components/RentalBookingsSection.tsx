// app/(guest)/dashboard/components/RentalBookingsSection.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Fixed Car icon - showing actual car instead of checkmark
const Car = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M5 13l1-1h3l2-2h6l2 2h3l1 1v5a1 1 0 01-1 1h-2a1 1 0 01-1-1v-1H7v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-5l2-1zm0 0l-2-5.5A1 1 0 014 6h3.5l2 4H5zm14 0l2-5.5A1 1 0 0020 6h-3.5l-2 4H19zm-10 4h6" />
  </svg>
)

const AlertCircle = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

interface RentalBooking {
  id: string
  bookingCode: string
  car: {
    make: string
    model: string
    year: number
    photos?: any[]
  }
  startDate: string
  endDate: string
  status: string
  verificationStatus?: string
  totalAmount: number
}

export default function RentalBookingsSection() {
  const router = useRouter()
  const [bookings, setBookings] = useState<RentalBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/rentals/user-bookings')
      const data = await response.json()
      
      console.log('RentalBookingsSection - API Response:', data)
      
      if (data.success && data.bookings) {
        setBookings(data.bookings)
        console.log('RentalBookingsSection - Set bookings:', data.bookings.length)
      } else {
        setBookings([])
        console.log('RentalBookingsSection - No bookings found')
      }
    } catch (error) {
      console.error('RentalBookingsSection - Failed to fetch:', error)
      setError('Failed to load rental bookings')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleBookingClick = (bookingId: string) => {
    router.push(`/rentals/dashboard/bookings/${bookingId}`)
  }

  const handleBrowseCars = () => {
    router.push('/rentals/search')
  }

  const handleViewAll = () => {
    router.push('/rentals/dashboard/bookings')
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800/95 rounded-lg shadow-md p-4 sm:p-6 mb-4 border-2 border-gray-300 dark:border-gray-600">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Your Car Rentals
        </h2>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800/95 rounded-lg shadow-md p-4 sm:p-6 mb-4 border-2 border-gray-300 dark:border-gray-600">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Your Car Rentals
        </h2>
        <div className="text-center py-6">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 dark:text-red-400 mb-3">{error}</p>
          <button
            onClick={fetchBookings}
            className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // No bookings state
  if (!bookings || bookings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800/95 rounded-lg shadow-md p-4 sm:p-6 mb-4 border-2 border-gray-300 dark:border-gray-600">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Your Car Rentals
        </h2>
        <div className="text-center py-6">
          <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-3">No active rentals</p>
          <button
            onClick={handleBrowseCars}
            className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
          >
            Browse Cars
          </button>
        </div>
      </div>
    )
  }

  // Has bookings - MOBILE: GRID/SQUARE CARDS, DESKTOP: LIST VIEW
  return (
    <>
      {/* Header with fixed dark mode background */}
      <div className="bg-white dark:bg-gray-800/95 rounded-lg shadow-md p-4 sm:p-6 mb-4 border-2 border-gray-300 dark:border-gray-600">
        <div className="flex justify-between items-center">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
            Your Car Rentals ({bookings.length})
          </h2>
          <button
            onClick={handleViewAll}
            className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
          >
            View All
          </button>
        </div>
      </div>
      
      {/* MOBILE: Horizontal scrollable square cards */}
      <div className="sm:hidden mb-4">
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {bookings.slice(0, 3).map(booking => (
            <div
              key={booking.id}
              className="flex-shrink-0 w-64 bg-white dark:bg-gray-800/95 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden hover:shadow-lg cursor-pointer transition-all snap-start shadow-md"
              onClick={() => handleBookingClick(booking.id)}
            >
              {/* Car Image - Square aspect ratio */}
              <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700">
                {booking.car?.photos?.[0] ? (
                  <img 
                    src={booking.car.photos[0].url}
                    alt={`${booking.car.make} ${booking.car.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                {/* Status badge on image */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    booking.status === 'ACTIVE' 
                      ? 'bg-green-500 text-white'
                      : booking.status === 'COMPLETED'
                      ? 'bg-gray-500 text-white'
                      : 'bg-yellow-500 text-white'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
              
              {/* Card Info */}
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 truncate">
                  {booking.car?.year} {booking.car?.make} {booking.car?.model}
                </h3>
                
                {/* Confirmation Number */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                  <span className="font-medium">Confirmation #:</span><br />
                  {booking.bookingCode}
                </p>
                
                {/* Trip Dates */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <span className="font-medium">Trip Dates:</span><br />
                  {new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(booking.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                
                {/* Price */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Total</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    ${booking.totalAmount?.toFixed(0) || '0'}
                  </span>
                </div>
                
                {(booking.verificationStatus === 'pending' || booking.verificationStatus === 'submitted') && (
                  <div className="flex items-center mt-2 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200">
                    <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate text-xs">Verify Required</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DESKTOP: List view with container */}
      <div className="hidden sm:block bg-white dark:bg-gray-800/95 rounded-lg shadow-md p-4 sm:p-6 mb-4 border-2 border-gray-300 dark:border-gray-600">
        <div className="space-y-3">
          {bookings.slice(0, 3).map(booking => (
            <div 
              key={booking.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              onClick={() => handleBookingClick(booking.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {booking.car?.photos?.[0] ? (
                    <img 
                      src={booking.car.photos[0].url}
                      alt={`${booking.car.make} ${booking.car.model}`}
                      className="w-20 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                      <Car className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {booking.car?.year} {booking.car?.make} {booking.car?.model}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {booking.bookingCode} • {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                    </p>
                    {(booking.verificationStatus === 'pending' || booking.verificationStatus === 'submitted') && (
                      <span className="inline-flex items-center px-2 py-1 mt-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Verification Required
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${booking.totalAmount?.toFixed(0) || '0'}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {booking.status}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}