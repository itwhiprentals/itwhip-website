// app/(guest)/rentals/dashboard/bookings/[id]/components/trip/TripStartCard.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface TripStartCardProps {
  booking: any
  onTripStarted?: () => void
}

export function TripStartCard({ booking, onTripStarted }: TripStartCardProps) {
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)
  const [timeDisplay, setTimeDisplay] = useState('')
  const [tripStatus, setTripStatus] = useState<'upcoming' | 'ready' | 'grace' | 'late' | 'expired'>('upcoming')
  const [remainingTripTime, setRemainingTripTime] = useState('')
  
  // Environment variable for bypass logic (hidden from users)
  const BYPASS_RESTRICTIONS = process.env.NEXT_PUBLIC_BYPASS_TRIP_RESTRICTIONS === 'true'
  
  // Helper function to properly combine date and time
  const combineDateTime = (dateString: string, timeString: string): Date => {
    const date = new Date(dateString)
    
    // Parse time string (handles both "10:00 AM" and "23:00" formats)
    let hours = 0
    let minutes = 0
    
    if (timeString) {
      if (timeString.includes(':')) {
        // Handle both 12-hour (10:00 AM) and 24-hour (23:00) formats
        const timeParts = timeString.split(':')
        let hourPart = parseInt(timeParts[0])
        const minutePart = parseInt(timeParts[1]?.replace(/\D/g, '') || '0')
        
        // Check for AM/PM
        const isPM = timeString.toLowerCase().includes('pm')
        const isAM = timeString.toLowerCase().includes('am')
        
        if (isPM && hourPart !== 12) {
          hourPart += 12
        } else if (isAM && hourPart === 12) {
          hourPart = 0
        }
        
        hours = hourPart
        minutes = minutePart
      }
    }
    
    // Create new date with proper time
    const combinedDate = new Date(date)
    combinedDate.setHours(hours, minutes, 0, 0)
    
    return combinedDate
  }
  
  useEffect(() => {
    const updateTimers = () => {
      const now = new Date()
      
      // Properly combine date and time for pickup and return
      const pickupTime = combineDateTime(booking.startDate, booking.startTime || '10:00')
      const endTime = combineDateTime(booking.endDate, booking.endTime || '10:00')
      const graceEndTime = new Date(pickupTime.getTime() + (2 * 60 * 60 * 1000)) // 2 hours after pickup
      
      // Debug logging (remove in production)
      console.log('Current time:', now.toLocaleString())
      console.log('Pickup time:', pickupTime.toLocaleString())
      console.log('End time:', endTime.toLocaleString())
      
      // Calculate time differences
      const timeUntilPickup = pickupTime.getTime() - now.getTime()
      const timeUntilGraceEnd = graceEndTime.getTime() - now.getTime()
      const timeUntilTripEnd = endTime.getTime() - now.getTime()
      
      // Determine trip status with FIXED logic
      if (timeUntilTripEnd <= 0) {
        // Trip end date has passed - truly expired
        setTripStatus('expired')
        setTimeDisplay('Booking expired - Trip period has ended')
      } else if (timeUntilPickup > 0) {
        // Before pickup time - UPCOMING
        setTripStatus('upcoming')
        const hours = Math.floor(timeUntilPickup / (1000 * 60 * 60))
        const minutes = Math.floor((timeUntilPickup % (1000 * 60 * 60)) / (1000 * 60))
        
        if (hours > 24) {
          const days = Math.floor(hours / 24)
          const remainingHours = hours % 24
          setTimeDisplay(`Trip starts in ${days} day${days > 1 ? 's' : ''}, ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`)
        } else if (hours > 0) {
          setTimeDisplay(`Trip starts in ${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`)
        } else {
          setTimeDisplay(`Trip starts in ${minutes} minute${minutes !== 1 ? 's' : ''}`)
        }
      } else if (Math.abs(timeUntilPickup) < 5 * 60 * 1000) {
        // Within 5 minutes of pickup time - READY
        setTripStatus('ready')
        setTimeDisplay('Ready for pickup')
      } else if (timeUntilGraceEnd > 0) {
        // Within grace period (pickup time passed, but within 2 hours)
        setTripStatus('grace')
        const hoursLeft = Math.floor(timeUntilGraceEnd / (1000 * 60 * 60))
        const minutesLeft = Math.floor((timeUntilGraceEnd % (1000 * 60 * 60)) / (1000 * 60))
        
        if (hoursLeft > 0) {
          setTimeDisplay(`Start within ${hoursLeft}h ${minutesLeft}m for best experience`)
        } else {
          setTimeDisplay(`Start within ${minutesLeft} minutes for best experience`)
        }
        
        // Calculate remaining trip time
        const tripDays = Math.floor(timeUntilTripEnd / (1000 * 60 * 60 * 24))
        const tripHours = Math.floor((timeUntilTripEnd % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        if (tripDays > 0) {
          setRemainingTripTime(`${tripDays} day${tripDays > 1 ? 's' : ''}, ${tripHours} hour${tripHours !== 1 ? 's' : ''} remaining`)
        } else {
          setRemainingTripTime(`${tripHours} hour${tripHours !== 1 ? 's' : ''} remaining`)
        }
      } else if (timeUntilTripEnd > 0) {
        // Grace period passed but trip not expired - late start allowed
        setTripStatus('late')
        const tripDays = Math.floor(timeUntilTripEnd / (1000 * 60 * 60 * 24))
        const tripHours = Math.floor((timeUntilTripEnd % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        
        if (tripDays > 0) {
          setTimeDisplay(`Late start - ${tripDays} day${tripDays > 1 ? 's' : ''}, ${tripHours} hour${tripHours !== 1 ? 's' : ''} remaining`)
        } else if (tripHours > 0) {
          setTimeDisplay(`Late start - ${tripHours} hour${tripHours !== 1 ? 's' : ''} remaining`)
        } else {
          const tripMinutes = Math.floor(timeUntilTripEnd / (1000 * 60))
          setTimeDisplay(`Late start - ${tripMinutes} minute${tripMinutes !== 1 ? 's' : ''} remaining`)
        }
      }
    }
    
    updateTimers()
    const interval = setInterval(updateTimers, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [booking])
  
  // If trip already started, don't show this card
  if (booking.tripStartedAt && !BYPASS_RESTRICTIONS) {
    return null
  }
  
  const handleStartInspection = () => {
    if (tripStatus === 'expired' && !BYPASS_RESTRICTIONS) {
      // Don't allow starting truly expired trips (unless bypassed)
      return
    }
    setIsStarting(true)
    router.push(`/rentals/trip/start/${booking.id}`)
  }
  
  const getStatusMessage = () => {
    switch(tripStatus) {
      case 'upcoming': return 'Trip Not Started Yet'
      case 'ready': return 'Ready for Pickup'
      case 'grace': return 'Action Required - Start Your Trip'
      case 'late': return 'Late Start - Trip Still Available'
      case 'expired': return 'Booking Expired'
      default: return 'Trip Status'
    }
  }
  
  const getStatusIcon = () => {
    switch(tripStatus) {
      case 'upcoming':
        return (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'ready':
        return (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7.835-1.949a10 10 0 11-15.67 0m15.67 0a10 10 0 00-15.67 0" />
          </svg>
        )
      case 'grace':
        return (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      case 'late':
        return (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'expired':
        return (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }
  
  const isButtonDisabled = tripStatus === 'expired' && !BYPASS_RESTRICTIONS
  
  // Format display time properly
  const formatPickupTime = (date: string, time: string) => {
    const pickupDate = combineDateTime(date, time || '10:00')
    return `${pickupDate.toLocaleDateString()} at ${pickupDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}`
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header - Solid Black like BookingDetails */}
      <div className="bg-gray-900 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon()}
            <h3 className="text-sm font-semibold text-white ml-2">
              {getStatusMessage()}
            </h3>
          </div>
          <span className="text-xs text-gray-300">
            {tripStatus === 'ready' ? 'Trip Active' : 
             tripStatus === 'grace' ? 'Action Required' :
             tripStatus === 'late' ? 'Late Start' :
             tripStatus === 'expired' ? 'Expired' : 
             'Ready for Pickup'}
          </span>
        </div>
        <p className="text-xs text-gray-300 mt-1 ml-7">
          {timeDisplay}
        </p>
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Pickup Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Pickup Location</p>
            <p className="text-sm text-gray-900 mt-1">{booking.pickupLocation || 'Phoenix, AZ'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Scheduled Pickup</p>
            <p className="text-sm text-gray-900 mt-1">
              {formatPickupTime(booking.startDate, booking.startTime)}
            </p>
          </div>
        </div>
        
        {/* Return Details for Active Statuses */}
        {(tripStatus === 'grace' || tripStatus === 'late' || tripStatus === 'ready') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-500">Return Location</p>
              <p className="text-sm text-gray-900 mt-1">{booking.returnLocation || booking.pickupLocation || 'Phoenix, AZ'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Return By</p>
              <p className="text-sm text-gray-900 mt-1">
                {formatPickupTime(booking.endDate, booking.endTime)}
              </p>
            </div>
          </div>
        )}
        
        {/* Status-specific messaging */}
        {tripStatus === 'grace' && (
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-gray-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Optimal Pickup Window</h4>
                <p className="text-sm text-gray-700">
                  You're within your scheduled pickup window. Starting now ensures the full rental period.
                </p>
                {remainingTripTime && (
                  <p className="text-sm font-semibold text-red-600 mt-2">Trip duration: {remainingTripTime}</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {tripStatus === 'late' && (
          <div className="bg-gray-100 border border-gray-400 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-gray-700 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Late Start Notice</h4>
                <p className="text-sm text-gray-700">
                  You've passed the optimal pickup window, but your trip is still available. 
                  The rental period will be shorter than originally scheduled.
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Note: Late start fees may apply as per rental agreement.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {tripStatus === 'upcoming' && (
          <div className="bg-white border border-gray-300 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Preparation Checklist</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Have your driver's license ready
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Review rental agreement and rules
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Plan your route to pickup location
              </li>
            </ul>
          </div>
        )}
        
        {tripStatus === 'expired' && (
          <div className="bg-gray-200 border border-gray-400 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-gray-700 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Booking Period Ended</h4>
                <p className="text-sm text-gray-700">
                  This booking has expired as the rental period has ended. 
                  Please make a new booking if you still need a vehicle.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Start Trip Button - Black like BookingDetails Navigate button */}
        <button
          onClick={handleStartInspection}
          disabled={isStarting || isButtonDisabled}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all shadow-sm
            ${isButtonDisabled 
              ? 'bg-gray-400 cursor-not-allowed opacity-50 text-gray-200' 
              : tripStatus === 'upcoming'
              ? 'bg-gray-500 text-white cursor-not-allowed opacity-75'
              : 'bg-gray-900 hover:bg-gray-800 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isStarting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading Inspection...
            </span>
          ) : (
            <>
              <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {tripStatus === 'late' ? 'Start Late Trip Inspection' : 
               tripStatus === 'upcoming' ? 'Trip Not Ready Yet' : 'Start Trip Inspection'}
            </>
          )}
        </button>
        
        {/* Cancel Option - Show during grace and late periods */}
        {(tripStatus === 'grace' || tripStatus === 'late') && (
          <button className="w-full py-2 px-4 border border-gray-600 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            Cancel Booking
          </button>
        )}
        
        {/* Support Contact */}
        <div className="text-center pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Need assistance?</p>
          <a href="tel:602-845-9758" className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors">
            Direct Support, Manager: 602-845-9758
          </a>
        </div>
      </div>
    </div>
  )
}