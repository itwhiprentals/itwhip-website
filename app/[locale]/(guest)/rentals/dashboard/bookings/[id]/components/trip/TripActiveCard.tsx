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
  const [timeRemaining, setTimeRemaining] = useState('')
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false)

  // Helper to combine date + time string
  const combineDateTime = (dateString: string, timeString: string): Date => {
    const date = new Date(dateString)
    let hours = 0
    let minutes = 0

    if (timeString?.includes(':')) {
      const timeParts = timeString.split(':')
      let hourPart = parseInt(timeParts[0])
      const minutePart = parseInt(timeParts[1]?.replace(/\D/g, '') || '0')
      const isPM = timeString.toLowerCase().includes('pm')
      const isAM = timeString.toLowerCase().includes('am')
      if (isPM && hourPart !== 12) hourPart += 12
      else if (isAM && hourPart === 12) hourPart = 0
      hours = hourPart
      minutes = minutePart
    }

    const combined = new Date(date)
    combined.setHours(hours, minutes, 0, 0)
    return combined
  }

  useEffect(() => {
    const updateTimers = () => {
      const now = new Date()

      // Duration elapsed
      if (booking.tripStartedAt) {
        const start = new Date(booking.tripStartedAt)
        const elapsed = now.getTime() - start.getTime()
        const hours = Math.floor(elapsed / (1000 * 60 * 60))
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60))
        if (hours > 0) {
          setDuration(`${hours}h ${minutes}m`)
        } else {
          setDuration(`${minutes}m`)
        }
      }

      // Time remaining until return
      const returnDate = combineDateTime(booking.endDate, booking.endTime || '10:00')
      const remaining = returnDate.getTime() - now.getTime()

      if (remaining <= 0) {
        setTimeRemaining('Overdue')
      } else {
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
        const hrs = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))

        if (days > 0) {
          setTimeRemaining(`${days}d ${hrs}h left`)
        } else if (hrs > 0) {
          setTimeRemaining(`${hrs}h ${mins}m left`)
        } else {
          setTimeRemaining(`${mins}m left`)
        }
      }
    }

    updateTimers()
    const interval = setInterval(updateTimers, 60000)
    return () => clearInterval(interval)
  }, [booking.tripStartedAt, booking.endDate, booking.endTime])

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

  // Format return deadline
  const returnDate = combineDateTime(booking.endDate, booking.endTime || '10:00')
  const returnTime = returnDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' at ' + returnDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  // Format pickup time (booking start, not trip started)
  const pickupDate = combineDateTime(booking.startDate, booking.startTime || '10:00')
  const pickupTime = pickupDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' at ' + pickupDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  // Late pickup detection
  const scheduledPickup = combineDateTime(booking.startDate, booking.startTime || '10:00')
  const actualPickup = booking.tripStartedAt ? new Date(booking.tripStartedAt) : null
  const isLatePickup = actualPickup ? actualPickup.getTime() > scheduledPickup.getTime() + (5 * 60 * 1000) : false // 5min grace
  const lateByMs = actualPickup ? actualPickup.getTime() - scheduledPickup.getTime() : 0
  const lateByHours = Math.floor(lateByMs / (1000 * 60 * 60))
  const lateByMinutes = Math.floor((lateByMs % (1000 * 60 * 60)) / (1000 * 60))
  const lateByText = lateByHours > 0 ? `${lateByHours}h ${lateByMinutes}m late` : `${lateByMinutes}m late`
  const actualPickupFormatted = actualPickup
    ? actualPickup.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' at ' + actualPickup.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : ''

  const carPhoto = booking.car?.photos?.[0]?.url

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Car Photo with Trip Status Overlay */}
      {carPhoto && (
        <div className="relative">
          <img
            src={carPhoto}
            alt={`${booking.car.make} ${booking.car.model}`}
            className="w-full h-44 sm:h-52 object-cover object-[center_35%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          {/* Duration badge on photo */}
          <div className="absolute top-3 right-3 bg-green-600 rounded-full px-3 py-1 shadow-lg">
            <p className="text-white text-xs font-semibold">{duration}</p>
          </div>
          {/* Car info on photo */}
          <div className="absolute bottom-3 left-4 right-4">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-white text-lg font-bold drop-shadow-md">
                  {booking.car.year} {booking.car.make}
                </h2>
                <p className="text-white/80 text-sm drop-shadow-md">{booking.car.model}</p>
              </div>
              <code className="text-white/90 text-xs font-mono bg-white/20 backdrop-blur-sm px-2 py-1 rounded">
                {booking.bookingCode}
              </code>
            </div>
          </div>
        </div>
      )}

      {/* Green Status Header */}
      <div className="bg-green-600 dark:bg-green-700 px-4 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white whitespace-nowrap">Trip in Progress</h3>
          </div>
          <span className="text-xs text-green-100 flex-shrink-0">
            Started at {tripStartTime}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3 sm:p-6 dark:bg-gray-900 space-y-3 sm:space-y-4">
        {/* 3-row layout matching TripStartCard */}
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            {/* Row 1: Time remaining + mileage */}
            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{timeRemaining}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{booking.startMileage ? `${booking.startMileage.toLocaleString()} mi start` : 'Trip active'}</p>
            {/* Row 2: Pickup label + date + late badge */}
            <div className="flex items-baseline gap-1.5 mt-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Pickup</p>
              {isLatePickup && (
                <span className="relative inline-block group cursor-help" style={{ position: 'relative', top: '-2px' }}>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 leading-none">
                    Late
                  </span>
                  <span className="invisible group-hover:visible absolute bottom-full left-0 mb-1.5 px-2.5 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 w-[180px]">
                    <span className="text-[11px] font-medium text-gray-900 dark:text-gray-100 block">Picked up {lateByText}</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block mt-0.5">Actual: {actualPickupFormatted}</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block">Scheduled: {pickupTime}</span>
                    <span className="absolute bottom-0 left-3 translate-y-1/2 rotate-45 w-2 h-2 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700" />
                  </span>
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{pickupTime}</p>
            {/* Row 3: Pickup location — use car address (actual vehicle location) */}
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-3">{booking.car?.address || booking.pickupLocation || 'Phoenix, AZ'}</p>
            {booking.car?.city && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{booking.car.city}, {booking.car.state} {booking.car.zipCode}</p>
            )}
          </div>
          <div className="flex-shrink-0">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
          <div className="flex-1 min-w-0 pl-4">
            {/* Row 1: Included miles */}
            <p className="text-xs font-semibold text-green-600 dark:text-green-400">{booking.startMileage ? `${(booking.numberOfDays * 200).toLocaleString()} mi included` : 'Active'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{booking.numberOfDays} day{booking.numberOfDays !== 1 ? 's' : ''} booked</p>
            {/* Row 2: Return by label + date */}
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-3">Return By</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{returnTime}</p>
            {/* Row 3: Drop-off location — use car address (return to vehicle location) */}
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-3">{booking.car?.address || booking.dropoffLocation || booking.pickupLocation || 'Phoenix, AZ'}</p>
            {booking.car?.city && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{booking.car.city}, {booking.car.state} {booking.car.zipCode}</p>
            )}
          </div>
        </div>

        {/* During Your Trip Reminders */}
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">During Your Trip</h4>
          <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
              Drive safely and follow all traffic laws.
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
              Emergency: Call 911 first, then Manager: 602-845-9758
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
              Return with same fuel level to avoid fees.
            </li>
          </ul>
        </div>

        {/* End Trip Confirmation */}
        {showEndConfirm ? (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Are you ready to end your trip?
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
              Make sure you're at the return location and ready to take final inspection photos.
            </p>
            <div className="flex items-center justify-start">
              <button
                onClick={() => setShowGuidelinesModal(true)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
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

        {/* Support Contact & Footer */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
          <p className="text-center text-[10px] text-gray-400 dark:text-gray-500">
            Need help? <a href="tel:602-845-9758" className="font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">602-845-9758</a>
          </p>
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
