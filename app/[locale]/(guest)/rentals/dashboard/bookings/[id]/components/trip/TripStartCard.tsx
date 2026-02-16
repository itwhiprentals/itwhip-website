// app/(guest)/rentals/dashboard/bookings/[id]/components/trip/TripStartCard.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface TripStartCardProps {
  booking: any
  onTripStarted?: () => void
  onCancel?: () => void
  onModify?: () => void
  onViewAgreement?: () => void
  onShowCancellationPolicy?: () => void
  onShowTrustSafety?: () => void
  noWrapper?: boolean
}

export function TripStartCard({ booking, onTripStarted, onCancel, onModify, onViewAgreement, onShowCancellationPolicy, onShowTrustSafety, noWrapper }: TripStartCardProps) {
  const router = useRouter()
  const t = useTranslations('TripStartCard')
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
      case 'upcoming': return t('statusUpcoming')
      case 'ready': return t('statusReady')
      case 'grace': return t('statusGrace')
      case 'late': return t('statusLate')
      case 'expired': return t('statusExpired')
      default: return t('statusDefault')
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
  
  const content = (
    <>
      {/* Hidden trigger for the car photo circle button */}
      <button data-trip-start className="hidden" onClick={handleStartInspection} />

      {/* Header */}
      <div className="bg-gray-900 dark:bg-gray-950 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon()}
            <h3 className="text-sm font-semibold text-white ml-2">
              {getStatusMessage()}
            </h3>
          </div>
          <span className="text-xs text-gray-300">
            {tripStatus === 'ready' ? t('badgeActive') :
             tripStatus === 'grace' ? t('badgeAction') :
             tripStatus === 'late' ? t('badgeLate') :
             tripStatus === 'expired' ? t('badgeExpired') :
             t('badgeReady')}
          </span>
        </div>
        <p className="text-xs text-gray-300 mt-0.5 sm:mt-1 ml-7">
          {timeDisplay}
        </p>
      </div>
      
      {/* Content */}
      <div className="px-4 py-3 sm:p-6 dark:bg-gray-900 flex-1 flex flex-col justify-between gap-3 sm:gap-4">
        {/* Pickup & Drop-off Details */}
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{booking.car.year} {booking.car.make}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{booking.car.model}</p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-3">{t('pickup')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{formatPickupTime(booking.startDate, booking.startTime)}</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-3">{booking.pickupLocation || 'Phoenix, AZ'}</p>
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
            <p className="text-xs font-semibold text-green-600 dark:text-green-400">{t('badgeReady')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{booking.bookingCode}</p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-3">{t('dropoff')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{formatPickupTime(booking.endDate, booking.endTime)}</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-3">{booking.dropoffLocation || booking.pickupLocation || 'Phoenix, AZ'}</p>
            {booking.car?.city && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{booking.car.city}, {booking.car.state} {booking.car.zipCode}</p>
            )}
          </div>
        </div>

        {/* Status-specific messaging */}
        {tripStatus === 'grace' && (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{t('graceTitle')}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {t('graceDesc')}
                </p>
                {remainingTripTime && (
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400 mt-2">{t('tripDuration', { time: remainingTripTime })}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {tripStatus === 'late' && (
          <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-2.5 py-1.5">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{t('lateStart')}</p>
            </div>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-tight mt-0.5 ml-5">
              {t('lateDesc')}{' '}
              <span className="relative inline-block group cursor-help">
                <svg className="w-3 h-3 text-gray-400 inline align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="invisible group-hover:visible absolute bottom-full left-0 mb-1 px-2 py-1.5 bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-700 z-50 w-[200px]">
                  <span className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed block">{t('lateTooltip')}</span>
                  <span className="absolute bottom-0 left-3 translate-y-1/2 rotate-45 w-2 h-2 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700" />
                </span>
              </span>
            </p>
          </div>
        )}

        {tripStatus === 'upcoming' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{t('checklistTitle')}</h4>
            <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                {t('checklistLicense')}
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                {t('checklistAgreement')}
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                {t('checklistRoute')}
              </li>
            </ul>
          </div>
        )}

        {tripStatus === 'expired' && (
          <div className="bg-gray-200 dark:bg-gray-800 border border-gray-400 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{t('expiredTitle')}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {t('expiredDesc')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cancel / Modify / Agreement actions */}
        {(onCancel || onModify || onViewAgreement) && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {onCancel && (
              <button
                onClick={onCancel}
                className="flex items-center justify-center gap-1.5 px-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                {t('cancel')}
              </button>
            )}
            {onModify && (
              <button
                onClick={onModify}
                className="flex items-center justify-center gap-1.5 px-2 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-xs font-medium"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                {t('modify')}
              </button>
            )}
            {onViewAgreement && (
              <button
                onClick={onViewAgreement}
                className="flex items-center justify-center gap-1.5 px-2 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-xs font-medium"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                {t('agreement')}
              </button>
            )}
          </div>
        )}

        {/* Support Contact & Footer Links */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
          <p className="text-center text-[10px] text-gray-400 dark:text-gray-500">
            {t('needHelp')} <a href="tel:602-845-9758" className="font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">602-845-9758</a>
          </p>
          <div className="flex items-center justify-center gap-3">
            {onViewAgreement && (
              <button onClick={onViewAgreement} className="text-[10px] text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                {t('rentalAgreement')}
              </button>
            )}
            <span className="text-gray-300 dark:text-gray-600 text-[10px]">·</span>
            {onShowCancellationPolicy && (
              <button onClick={onShowCancellationPolicy} className="text-[10px] text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                {t('cancellationPolicy')}
              </button>
            )}
            <span className="text-gray-300 dark:text-gray-600 text-[10px]">·</span>
            {onShowTrustSafety ? (
              <button onClick={onShowTrustSafety} className="text-[10px] text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                {t('trustSafety')}
              </button>
            ) : (
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                {t('trustSafety')}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  )

  if (noWrapper) return content

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {content}
    </div>
  )
}