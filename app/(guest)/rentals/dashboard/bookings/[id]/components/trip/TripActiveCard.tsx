// app/(guest)/rentals/dashboard/bookings/[id]/components/trip/TripActiveCard.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues
const EndTripGuidelinesModal = dynamic(
  () => import('../../../../../components/modals/EndTripGuidelinesModal'),
  { ssr: false }
)

interface TripActiveCardProps {
  booking: any
}

export function TripActiveCard({ booking }: TripActiveCardProps) {
  const router = useRouter()
  const [duration, setDuration] = useState('')
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false)

  useEffect(() => {
    // Calculate trip duration
    const updateDuration = () => {
      if (booking.tripStartedAt) {
        const start = new Date(booking.tripStartedAt)
        const now = new Date()
        const diff = now.getTime() - start.getTime()
        
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        
        if (hours > 0) {
          setDuration(`${hours}h ${minutes}m`)
        } else {
          setDuration(`${minutes} minutes`)
        }
      }
    }

    updateDuration()
    const interval = setInterval(updateDuration, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [booking.tripStartedAt])

  const handleEndTrip = () => {
    router.push(`/rentals/trip/end/${booking.id}`)
  }

  const tripStartTime = booking.tripStartedAt 
    ? new Date(booking.tripStartedAt).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    : ''

  const returnDeadline = new Date(booking.endDate)
  const returnTime = `${returnDeadline.toLocaleDateString()} at ${booking.endTime}`

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header - Changed to solid green */}
      <div className="bg-green-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Trip in Progress</h3>
            <p className="text-green-100 text-sm mt-1">
              Started at {tripStartTime}
            </p>
          </div>
          <div className="bg-white/20 rounded-full px-3 py-1">
            <p className="text-white text-sm font-medium">{duration}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Trip Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Trip Duration</p>
              <p className="text-sm text-gray-600">{duration}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Return By</p>
              <p className="text-sm text-gray-600">{returnTime}</p>
            </div>
          </div>
        </div>

        {/* Important Reminders */}
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">During Your Trip</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
              Drive safely and follow all traffic laws.
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
              Emergency: Call 911 first, then Manager: 602-845-9758
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
              Return with same fuel level to avoid fees.
            </li>
          </ul>
        </div>

        {/* Mileage Info */}
        {booking.startMileage && (
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Starting Mileage</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {booking.startMileage.toLocaleString()} miles
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Included Miles</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {(booking.numberOfDays * 200).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* End Trip Confirmation */}
        {showEndConfirm ? (
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-900 mb-3">
              Are you ready to end your trip?
            </p>
            <p className="text-sm text-gray-700 mb-1">
              Make sure you're at the return location and ready to take final inspection photos.
            </p>
            <div className="flex items-center justify-start">
              <button
                onClick={() => setShowGuidelinesModal(true)}
                className="text-xs text-blue-600 hover:text-blue-700 underline"
              >
                View end trip guidelines
              </button>
            </div>
            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleEndTrip}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Yes, End Trip
              </button>
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Not Yet
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowEndConfirm(true)}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-sm hover:shadow"
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            End Trip
          </button>
        )}

        {/* Support Contact - Added for quick access */}
        <div className="text-center pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Need assistance?</p>
          <a href="tel:602-845-9758" className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors">
            Direct Support, Manager: 602-845-9758
          </a>
        </div>
      </div>

      {/* End Trip Guidelines Modal */}
      <EndTripGuidelinesModal 
        isOpen={showGuidelinesModal}
        onClose={() => setShowGuidelinesModal(false)}
      />
    </div>
  )
}