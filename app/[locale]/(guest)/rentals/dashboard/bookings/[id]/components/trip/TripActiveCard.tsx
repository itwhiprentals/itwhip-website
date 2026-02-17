// app/(guest)/rentals/dashboard/bookings/[id]/components/trip/TripActiveCard.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

import { EndTripConfirmSheet } from './EndTripConfirmSheet'

// Dynamic import to avoid SSR issues
const EndTripGuidelinesModal = dynamic(
  () => import('../../../../../components/modals/EndTripGuidelinesModal'),
  { ssr: false }
)

interface TripActiveCardProps {
  booking: any
  onExtend?: () => void
  onViewAgreement?: () => void
}

export function TripActiveCard({ booking, onExtend, onViewAgreement }: TripActiveCardProps) {
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

  const carPhoto = booking.car?.photos?.[0]?.url

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Car Photo with Trip Status Overlay */}
      {carPhoto && (
        <div className="relative">
          <img
            src={carPhoto}
            alt={`${booking.car.make} ${booking.car.model}`}
            className="w-full h-52 sm:h-60 object-cover object-[center_35%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          {/* End Trip button on photo — shown when ≤1h 25m remaining (TEST: 15h for now) */}
          {hoursRemaining <= 15 && hoursRemaining > 0 && !showEndConfirm && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-24 h-24 rounded-full border-2 border-white/30 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute w-28 h-28 rounded-full border border-white/15 animate-pulse" />
              <button
                onClick={() => { setShowEndConfirm(true); checkGpsLocation() }}
                className="relative w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center
                  bg-red-600 hover:bg-red-700
                  active:scale-90 transition-all duration-300 ease-out
                  shadow-[0_6px_24px_rgba(0,0,0,0.4),0_0_30px_rgba(239,68,68,0.35)]
                  hover:shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_45px_rgba(239,68,68,0.5)]
                  hover:scale-110
                  ring-[3px] ring-white/80 ring-offset-2 ring-offset-transparent
                  backdrop-blur-sm"
              >
                <svg className="w-6 h-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                <span className="text-[7px] font-extrabold text-white uppercase tracking-[0.1em] mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
                  End Trip
                </span>
              </button>
            </div>
          )}
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
            <div className="min-w-0 leading-tight">
              <h3 className="text-sm font-semibold text-white whitespace-nowrap uppercase">{booking.car.year} {booking.car.make}</h3>
              <div className="flex items-center gap-1.5 -mt-0.5">
                <p className="text-xs text-green-100">{booking.car.model}</p>
                {booking.car.type && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded border border-white/30 text-white/80 leading-none">{booking.car.type}</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => window.location.href = 'tel:602-845-9758'}
            className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/50 text-white leading-none hover:bg-red-700 transition-colors bg-red-600"
          >
            Emergency
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3 sm:px-6 sm:py-4 dark:bg-gray-900 space-y-3">
        {/* 3-row layout matching TripStartCard */}
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            {/* Row 1: Days booked + time remaining */}
            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase">{booking.numberOfDays} day{booking.numberOfDays !== 1 ? 's' : ''} booked</p>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-gray-500 dark:text-gray-400">{timeRemaining}</p>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded border border-green-300 dark:border-green-700 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 leading-none">Trip in Progress</span>
            </div>
            {/* Row 2: Pickup label + date + late badge */}
            <div className="flex items-baseline gap-1.5 mt-3">
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Pickup</p>
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
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">{pickupTime}</p>
            {/* Row 3: Pickup location — use car address (actual vehicle location) */}
            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mt-3">{booking.car?.address || booking.pickupLocation || 'Phoenix, AZ'}</p>
            {booking.car?.city && (
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">{booking.car.city}, {booking.car.state} {booking.car.zipCode}</p>
            )}
          </div>
          <div className="flex-shrink-0">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
          <div className="flex-1 min-w-0 pl-4">
            {/* Row 1: Booking code + mileage */}
            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{booking.bookingCode}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{booking.startMileage ? `${booking.startMileage.toLocaleString()} mi start` : 'Trip active'}</p>
            {/* Row 2: Return by label + date + extend badge */}
            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide mt-3">Return By</p>
            <div className="flex items-baseline gap-1.5 -mt-0.5">
              <p className="text-xs text-gray-500 dark:text-gray-400">{returnTime}</p>
              {canExtend && onExtend && (
                <span className="relative inline-block cursor-pointer" style={{ position: 'relative', top: '-2px' }} onClick={onExtend}>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 leading-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    Extend
                  </span>
                </span>
              )}
            </div>
            {/* Row 3: Drop-off location — use car address (return to vehicle location) */}
            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mt-3">{booking.car?.address || booking.dropoffLocation || booking.pickupLocation || 'Phoenix, AZ'}</p>
            {booking.car?.city && (
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">{booking.car.city}, {booking.car.state} {booking.car.zipCode}</p>
            )}
          </div>
        </div>

        {/* End Trip Section — GPS-aware guard */}
        {/* End Trip button — shown when hours threshold met */}
        {!showEndConfirm && (hoursRemaining > 15 || hoursRemaining <= 0) ? (
          <button
            onClick={() => { setShowEndConfirm(true); checkGpsLocation() }}
            className="w-full bg-gradient-to-b from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-[0_4px_0_0_#991b1b,0_6px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_3px_0_0_#991b1b,0_4px_8px_rgba(0,0,0,0.2)] active:shadow-[0_1px_0_0_#991b1b,0_2px_4px_rgba(0,0,0,0.15)] active:translate-y-[2px]"
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            End Trip
          </button>
        ) : (
          null
        )}

        {/* Footer Links */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-center gap-4 text-[10px]">
            {onViewAgreement && (
              <button onClick={onViewAgreement} className="font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                View Agreement
              </button>
            )}
          </div>
        </div>
      </div>

      {/* End Trip Confirmation Sheet */}
      <EndTripConfirmSheet
        isOpen={showEndConfirm}
        onClose={resetEndFlow}
        onConfirm={handleEndTrip}
        booking={booking}
        hoursRemaining={hoursRemaining}
        gpsStatus={gpsStatus}
        gpsDistance={gpsDistance}
        onViewGuidelines={() => setShowGuidelinesModal(true)}
      />

      {/* End Trip Guidelines Modal */}
      <EndTripGuidelinesModal
        isOpen={showGuidelinesModal}
        onClose={() => setShowGuidelinesModal(false)}
      />
    </div>
  )
}
