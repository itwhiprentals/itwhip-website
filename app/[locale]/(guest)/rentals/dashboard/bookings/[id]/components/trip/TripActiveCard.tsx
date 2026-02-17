// app/(guest)/rentals/dashboard/bookings/[id]/components/trip/TripActiveCard.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues
const EndTripGuidelinesModal = dynamic(
  () => import('../../../../../components/modals/EndTripGuidelinesModal'),
  { ssr: false }
)

interface TripActiveCardProps {
  booking: any
  onExtend?: () => void
}

export function TripActiveCard({ booking, onExtend }: TripActiveCardProps) {
  const router = useRouter()
  const [duration, setDuration] = useState('')
  const [timeRemaining, setTimeRemaining] = useState('')
  const [hoursRemaining, setHoursRemaining] = useState(0)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false)
  const [canExtend, setCanExtend] = useState(false)

  // GPS end-trip guard state
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'checking' | 'near' | 'far' | 'failed'>('idle')
  const [gpsDistance, setGpsDistance] = useState<number | null>(null)

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

  // Timer: update duration, time remaining, hours remaining
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
      const hrsLeft = remaining / (1000 * 60 * 60)
      setHoursRemaining(Math.max(0, hrsLeft))

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

  // Check extend availability on mount
  useEffect(() => {
    async function checkExtendAvailability() {
      try {
        const currentEnd = new Date(booking.endDate)
        const proposedEnd = new Date(currentEnd)
        proposedEnd.setDate(proposedEnd.getDate() + 1)

        const startStr = new Date(booking.startDate).toISOString().split('T')[0]
        const endStr = proposedEnd.toISOString().split('T')[0]

        const params = new URLSearchParams({ startDate: startStr, endDate: endStr })
        const res = await fetch(`/api/rentals/bookings/${booking.id}/modify?${params}`)
        if (res.ok) {
          const data = await res.json()
          setCanExtend(data.available === true)
        }
      } catch {
        setCanExtend(false)
      }
    }
    checkExtendAvailability()
  }, [booking.id, booking.startDate, booking.endDate])

  // GPS check for end trip
  const checkGpsLocation = useCallback(() => {
    setGpsStatus('checking')

    if (!navigator.geolocation) {
      setGpsStatus('failed')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const guestLat = position.coords.latitude
        const guestLng = position.coords.longitude
        const carLat = booking.car?.latitude
        const carLng = booking.car?.longitude

        if (!carLat || !carLng) {
          setGpsStatus('failed')
          return
        }

        // Haversine distance in meters
        const R = 6371e3
        const phi1 = (guestLat * Math.PI) / 180
        const phi2 = (carLat * Math.PI) / 180
        const dPhi = ((carLat - guestLat) * Math.PI) / 180
        const dLambda = ((carLng - guestLng) * Math.PI) / 180
        const a = Math.sin(dPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = R * c

        setGpsDistance(Math.round(distance))
        setGpsStatus(distance <= 500 ? 'near' : 'far')
      },
      () => {
        setGpsStatus('failed')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [booking.car?.latitude, booking.car?.longitude])

  const handleEndTrip = () => {
    router.push(`/rentals/trip/end/${booking.id}`)
  }

  const resetEndFlow = () => {
    setShowEndConfirm(false)
    setGpsStatus('idle')
    setGpsDistance(null)
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
  const isLatePickup = actualPickup ? actualPickup.getTime() > scheduledPickup.getTime() + (5 * 60 * 1000) : false
  const lateByMs = actualPickup ? actualPickup.getTime() - scheduledPickup.getTime() : 0
  const lateByHours = Math.floor(lateByMs / (1000 * 60 * 60))
  const lateByMinutes = Math.floor((lateByMs % (1000 * 60 * 60)) / (1000 * 60))
  const lateByText = lateByHours > 0 ? `${lateByHours}h ${lateByMinutes}m late` : `${lateByMinutes}m late`
  const actualPickupFormatted = actualPickup
    ? actualPickup.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' at ' + actualPickup.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : ''

  // Format hours remaining for display
  const hoursLeftDisplay = hoursRemaining >= 1
    ? `${Math.floor(hoursRemaining)} hour${Math.floor(hoursRemaining) !== 1 ? 's' : ''}`
    : `${Math.floor(hoursRemaining * 60)} minutes`

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
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white whitespace-nowrap">Trip in Progress</h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {canExtend && onExtend && (
              <button
                onClick={onExtend}
                className="flex items-center gap-1 px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium text-white">Extend</span>
              </button>
            )}
            <span className="text-xs text-green-100">
              Started at {tripStartTime}
            </span>
          </div>
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

        {/* End Trip Section — GPS-aware guard */}
        {showEndConfirm ? (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            {gpsStatus === 'checking' ? (
              /* Checking GPS location */
              <div className="text-center py-4">
                <div className="animate-spin w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Checking your location...</p>
              </div>
            ) : gpsStatus === 'far' ? (
              /* NOT near car — strong warning */
              <>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">You appear to be away from the vehicle</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1.5">Ending your trip while not at the return location means:</p>
                  <ul className="text-xs text-red-600 dark:text-red-400 space-y-1 ml-4 list-disc">
                    <li>Your security deposit will be held</li>
                    <li>Your account may be suspended</li>
                    <li>An insurance claim may be filed for the vehicle</li>
                  </ul>
                </div>
                {gpsDistance && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Your distance: ~{gpsDistance >= 1000 ? `${(gpsDistance / 1000).toFixed(1)} km` : `${gpsDistance}m`} from the vehicle
                  </p>
                )}
                <div className="flex space-x-3">
                  <button
                    onClick={handleEndTrip}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    End Trip Anyway
                  </button>
                  <button
                    onClick={resetEndFlow}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </>
            ) : gpsStatus === 'near' && hoursRemaining > 5 ? (
              /* Near car but >5 hours remaining — early end warning */
              <>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    You still have {hoursLeftDisplay} remaining
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Are you sure you want to end your trip early?</p>
                <div className="flex items-center justify-start mb-3">
                  <button
                    onClick={() => setShowGuidelinesModal(true)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                  >
                    View end trip guidelines
                  </button>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleEndTrip}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Yes, End Trip
                  </button>
                  <button
                    onClick={resetEndFlow}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Not Yet
                  </button>
                </div>
              </>
            ) : gpsStatus === 'failed' ? (
              /* GPS failed — soft warning */
              <>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                    We couldn&apos;t verify your location
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Please make sure you&apos;re at the return location before ending your trip.
                </p>
                <div className="flex items-center justify-start mb-3">
                  <button
                    onClick={() => setShowGuidelinesModal(true)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                  >
                    View end trip guidelines
                  </button>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleEndTrip}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Yes, End Trip
                  </button>
                  <button
                    onClick={resetEndFlow}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Not Yet
                  </button>
                </div>
              </>
            ) : (
              /* Near car + ≤5 hours — normal end flow */
              <>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Are you ready to end your trip?
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Make sure you&apos;re at the return location and ready to take final inspection photos.
                </p>
                <div className="flex items-center justify-start mb-3">
                  <button
                    onClick={() => setShowGuidelinesModal(true)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                  >
                    View end trip guidelines
                  </button>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleEndTrip}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Yes, End Trip
                  </button>
                  <button
                    onClick={resetEndFlow}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Not Yet
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => { setShowEndConfirm(true); checkGpsLocation() }}
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
