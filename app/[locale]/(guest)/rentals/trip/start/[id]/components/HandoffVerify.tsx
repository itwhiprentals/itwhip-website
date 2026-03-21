'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api'
import { TRIP_CONSTANTS, HANDOFF_STATUS } from '@/app/lib/trip/constants'
import { TESTING_MODE } from '@/app/lib/trip/validation'

type HandoffState =
  | 'LOADING'      // Initial status check (persistent resume)
  | 'LOCATING'
  | 'TRACKING'     // GPS acquired, pinging server, not yet within range
  | 'NEARBY'       // Within range — show "Notify Host" button
  | 'NOTIFYING'    // Sending notification to host
  | 'GUEST_VERIFIED'
  | 'HANDOFF_COMPLETE'
  | 'EXPIRED'
  | 'ERROR'

interface HandoffVerifyProps {
  booking: any
  data: any
  onLocationVerified: (location: { lat: number; lng: number }) => void
}

export function HandoffVerify({ booking, data, onLocationVerified }: HandoffVerifyProps) {
  const t = useTranslations('Handoff')
  const [state, setState] = useState<HandoffState>('LOADING')
  const [distance, setDistance] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [keyInstructions, setKeyInstructions] = useState<string | null>(null)
  const [autoFallbackMs, setAutoFallbackMs] = useState<number | null>(null)
  const [isInstantBook, setIsInstantBook] = useState(false)
  const [, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null)
  const gpsLocationRef = useRef<{ lat: number; lng: number } | null>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const pingRef = useRef<NodeJS.Timeout | null>(null)
  const resumeNearbyRef = useRef(false)

  // Notify Host popup state
  const [showNotifyModal, setShowNotifyModal] = useState(false)
  const [arrivalMessage, setArrivalMessage] = useState("I've arrived at the vehicle")

  // Initialize: check server state for persistence, then start GPS flow
  useEffect(() => {
    const initialize = async () => {
      // Quick check from booking prop (SSR data)
      if (booking.handoffStatus === HANDOFF_STATUS.HANDOFF_COMPLETE ||
          booking.handoffStatus === HANDOFF_STATUS.BYPASSED) {
        setState('HANDOFF_COMPLETE')
        onLocationVerified(data.location || { lat: 0, lng: 0 })
        return
      }
      if (booking.handoffStatus === HANDOFF_STATUS.GUEST_VERIFIED) {
        setState('GUEST_VERIFIED')
        startPolling()
        return
      }

      // Fetch live status for accurate resume (handles page refresh)
      try {
        const res = await fetch(`/api/rentals/bookings/${booking.id}/handoff/status`, {
          credentials: 'include',
        })
        if (res.ok) {
          const live = await res.json()

          if (live.handoffStatus === HANDOFF_STATUS.HANDOFF_COMPLETE ||
              live.handoffStatus === 'HANDOFF_COMPLETE') {
            setState('HANDOFF_COMPLETE')
            if (live.keyInstructions) setKeyInstructions(live.keyInstructions)
            onLocationVerified(data.location || { lat: 0, lng: 0 })
            return
          }
          if (live.handoffStatus === HANDOFF_STATUS.GUEST_VERIFIED ||
              live.handoffStatus === 'GUEST_VERIFIED') {
            setState('GUEST_VERIFIED')
            setIsInstantBook(live.isInstantBook || false)
            startPolling()
            return
          }
          if (live.handoffStatus === HANDOFF_STATUS.EXPIRED ||
              live.handoffStatus === 'EXPIRED') {
            setState('EXPIRED')
            return
          }

          // If guest was already within range, flag for NEARBY resume
          if (live.guestLiveDistance !== null &&
              live.guestLiveDistance !== undefined &&
              live.guestLiveDistance <= TRIP_CONSTANTS.HANDOFF_RADIUS_METERS) {
            setDistance(live.guestLiveDistance)
            resumeNearbyRef.current = true
          }
        }
      } catch { /* fall through to GPS */ }

      // Start GPS flow
      requestGPS()
    }

    initialize()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      if (pingRef.current) clearInterval(pingRef.current)
    }
  }, [])

  const stopPinging = () => {
    if (pingRef.current) {
      clearInterval(pingRef.current)
      pingRef.current = null
    }
  }

  const requestGPS = () => {
    setState('LOCATING')
    setError(null)

    if (!navigator.geolocation) {
      if (TESTING_MODE) {
        handleBypass()
      } else {
        setState('ERROR')
        setError(t('gpsNotAvailable'))
      }
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setGpsLocation(loc)
        gpsLocationRef.current = loc
        startPinging(loc)
      },
      () => {
        // Try low-accuracy fallback
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const loc = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }
            setGpsLocation(loc)
            gpsLocationRef.current = loc
            startPinging(loc)
          },
          () => {
            if (TESTING_MODE) {
              handleBypass()
            } else {
              setState('ERROR')
              setError(t('gpsError'))
            }
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
        )
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  // Ping server with GPS every 15s
  const startPinging = (_initialLoc: { lat: number; lng: number }) => {
    // If resuming after page refresh and was already nearby, skip to NEARBY
    if (resumeNearbyRef.current) {
      resumeNearbyRef.current = false
      setState('NEARBY')
      return
    }

    setState('TRACKING')

    const sendPing = async () => {
      // Get fresh GPS position
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000,
          })
        })
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude }
        setGpsLocation(loc)
        gpsLocationRef.current = loc
      } catch {
        // Use last known location
      }

      const loc = gpsLocationRef.current
      if (!loc) return

      try {
        const response = await fetch(`/api/rentals/bookings/${booking.id}/handoff/guest-ping`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude: loc.lat, longitude: loc.lng }),
        })

        if (!response.ok) return

        const result = await response.json()
        setDistance(result.distance)

        if (result.withinRange) {
          stopPinging()
          setState('NEARBY')
        }
      } catch {
        // Silent fail — will retry on next ping
      }
    }

    // Send first ping immediately
    sendPing()
    pingRef.current = setInterval(sendPing, TRIP_CONSTANTS.GUEST_PING_INTERVAL)
  }

  // Called when guest clicks "Send" in Notify Host popup
  const notifyHost = async () => {
    const loc = gpsLocationRef.current
    if (!loc) return

    setState('NOTIFYING')

    try {
      const response = await fetch(`/api/rentals/bookings/${booking.id}/handoff/guest-verify`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: loc.lat,
          longitude: loc.lng,
          message: arrivalMessage.trim() || "I've arrived at the vehicle",
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setState('ERROR')
        setError(result.error || t('verifyFailed'))
        return
      }

      setDistance(result.distance)
      setIsInstantBook(result.isInstantBook || false)
      setShowNotifyModal(false)

      if (result.verified) {
        setState('GUEST_VERIFIED')
        startPolling()
      } else {
        setState('NEARBY')
      }
    } catch {
      setState('ERROR')
      setError(t('networkError'))
    }
  }

  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current)

    const poll = async () => {
      try {
        const response = await fetch(`/api/rentals/bookings/${booking.id}/handoff/status`, {
          credentials: 'include',
        })

        if (!response.ok) return

        const result = await response.json()

        if (result.autoFallbackRemainingMs !== null) {
          setAutoFallbackMs(result.autoFallbackRemainingMs)
        }

        if (result.handoffStatus === HANDOFF_STATUS.HANDOFF_COMPLETE ||
            result.handoffStatus === 'HANDOFF_COMPLETE') {
          setState('HANDOFF_COMPLETE')
          if (result.keyInstructions) {
            setKeyInstructions(result.keyInstructions)
          }
          onLocationVerified(gpsLocationRef.current || data.location || { lat: 0, lng: 0 })
          if (pollRef.current) clearInterval(pollRef.current)
        } else if (result.handoffStatus === HANDOFF_STATUS.EXPIRED ||
                   result.handoffStatus === 'EXPIRED') {
          setState('EXPIRED')
          if (pollRef.current) clearInterval(pollRef.current)
        }
      } catch {
        // Silent fail — will retry on next poll
      }
    }

    poll()
    pollRef.current = setInterval(poll, TRIP_CONSTANTS.HANDOFF_POLLING_INTERVAL)
  }, [booking.id, data.location, onLocationVerified])

  const handleBypass = async () => {
    setState('HANDOFF_COMPLETE')
    const loc = gpsLocationRef.current || { lat: 0, lng: 0 }
    onLocationVerified(loc)

    if (loc.lat !== 0 || loc.lng !== 0) {
      try {
        await fetch(`/api/rentals/bookings/${booking.id}/handoff/guest-verify`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude: loc.lat, longitude: loc.lng }),
        })
      } catch { /* silent */ }
    }
  }

  const handleContinueAnyway = async () => {
    setState('HANDOFF_COMPLETE')
    onLocationVerified(gpsLocationRef.current || data.location || { lat: 0, lng: 0 })
  }

  const formatCountdown = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${meters}m`
    const miles = (meters / 1609.34).toFixed(1)
    return `${miles} mi`
  }

  // Progress toward vehicle (0 = far, 100 = at vehicle)
  const proximityPercent = distance !== null
    ? Math.min(100, Math.max(0, Math.round((1 - distance / 2000) * 100)))
    : 0

  return (
    <div className="space-y-6">
      {/* Custom animations */}
      <style>{`
        @keyframes radar-ring {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          50% { box-shadow: 0 0 0 12px rgba(34, 197, 94, 0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-fade-up { animation: fade-up 0.5s ease-out forwards; }
        .animate-fade-up-d1 { animation: fade-up 0.5s ease-out 0.1s forwards; opacity: 0; }
        .animate-fade-up-d2 { animation: fade-up 0.5s ease-out 0.2s forwards; opacity: 0; }
        .animate-fade-up-d3 { animation: fade-up 0.5s ease-out 0.3s forwards; opacity: 0; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
      `}</style>

      {/* ── MAP — shows during LOCATING, TRACKING, NEARBY ── */}
      <HandoffMap
        guestLocation={gpsLocationRef.current}
        carLocation={booking.car?.latitude && booking.car?.longitude ? { lat: booking.car.latitude, lng: booking.car.longitude } : booking.pickupLatitude && booking.pickupLongitude ? { lat: booking.pickupLatitude, lng: booking.pickupLongitude } : null}
        pickupAddress={booking.car?.address ? [booking.car.address, booking.car.city, booking.car.state, booking.car.zipCode].filter(Boolean).join(', ') : booking.pickupLocation || ''}
        carLabel={booking.car ? `${booking.car.year} ${booking.car.make} ${booking.car.model}` : undefined}
        visible={['LOADING', 'LOCATING', 'TRACKING', 'NEARBY'].includes(state)}
        distance={distance}
      />

      {/* LOADING — checking server state */}
      {state === 'LOADING' && (
        <div className="text-center py-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800">
            <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin" />
          </div>
        </div>
      )}

      {/* LOCATING — GPS acquiring with radar animation */}
      {state === 'LOCATING' && (
        <div className="text-center py-8 animate-fade-up">
          <div className="relative inline-flex items-center justify-center w-28 h-28 mb-5">
            {/* Radar rings */}
            <span className="absolute inset-0 rounded-full border border-blue-300/40 dark:border-blue-500/30" style={{ animation: 'radar-ring 2.4s ease-out infinite' }} />
            <span className="absolute inset-0 rounded-full border border-blue-300/40 dark:border-blue-500/30" style={{ animation: 'radar-ring 2.4s ease-out 0.8s infinite' }} />
            <span className="absolute inset-0 rounded-full border border-blue-300/40 dark:border-blue-500/30" style={{ animation: 'radar-ring 2.4s ease-out 1.6s infinite' }} />
            {/* Center icon */}
            <div className="relative z-10 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 animate-fade-up-d1">
            {t('findingLocation')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 animate-fade-up-d2">
            {t('allowGps')}
          </p>
        </div>
      )}

      {/* TRACKING — GPS acquired, approaching vehicle */}
      {state === 'TRACKING' && (
        <div className="text-center py-6 animate-fade-up">
          {/* Distance hero */}
          <div className="relative inline-flex items-center justify-center w-28 h-28 mb-4">
            {/* Progress ring (SVG circle) */}
            <svg className="absolute inset-0 w-28 h-28 -rotate-90" viewBox="0 0 112 112">
              <circle cx="56" cy="56" r="50" fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-200 dark:text-gray-700" />
              <circle
                cx="56" cy="56" r="50" fill="none" strokeWidth="4"
                strokeLinecap="round"
                className="text-blue-500 transition-all duration-1000"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - proximityPercent / 100)}`}
              />
            </svg>
            {/* Distance number */}
            <div className="relative z-10 text-center">
              {distance !== null ? (
                <>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                    {distance < 1000 ? distance : (distance / 1609.34).toFixed(1)}
                  </span>
                  <span className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {distance < 1000 ? 'meters' : 'miles'}
                  </span>
                </>
              ) : (
                <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
              )}
            </div>
          </div>

          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 animate-fade-up-d1">
            {t('trackingLocation')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 animate-fade-up-d2">
            {t('getCloser', { radius: TRIP_CONSTANTS.HANDOFF_RADIUS_METERS })}
          </p>

          {/* Live indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-3 animate-fade-up-d3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Live
            </span>
          </div>
        </div>
      )}

      {/* NEARBY — Within range, "Notify Host" CTA */}
      {state === 'NEARBY' && (
        <div className="text-center py-6 animate-fade-up">
          {/* Success icon with glow */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
            <div className="absolute inset-0 rounded-full bg-green-500/10 dark:bg-green-500/20 animate-pulse-glow" />
            <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
              {/* Car icon */}
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h17.25M3.375 14.25L6 6.75h12l2.625 7.5" />
              </svg>
            </div>
          </div>

          <p className="text-sm font-medium text-green-700 dark:text-green-400 animate-fade-up-d1">
            {t('nearbyTitle')}
          </p>
          {distance !== null && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 animate-fade-up-d2">
              {formatDistance(distance)} {t('fromVehicle')}
            </p>
          )}

          {/* Notify Host popup */}
          {showNotifyModal ? (
            <div className="mt-5 mx-auto max-w-sm text-left animate-fade-up">
              <div className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 rounded-xl p-4 shadow-xl shadow-green-500/10">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                  {t('arrivalMessageLabel')}
                </label>
                <textarea
                  value={arrivalMessage}
                  onChange={(e) => setArrivalMessage(e.target.value)}
                  rows={2}
                  maxLength={200}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={notifyHost}
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 active:scale-[0.98] transition-all"
                  >
                    {t('sendNotification')}
                  </button>
                  <button
                    onClick={() => setShowNotifyModal(false)}
                    className="px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fade-up-d3">
              <button
                onClick={() => setShowNotifyModal(true)}
                className="mt-5 px-8 py-3.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 active:scale-[0.97] transition-all shadow-lg shadow-green-600/25 animate-pulse-glow"
              >
                {t('notifyHost')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* NOTIFYING — Sending to host */}
      {state === 'NOTIFYING' && (
        <div className="text-center py-10 animate-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-4 shadow-lg shadow-green-500/25">
            <svg className="animate-spin h-7 w-7 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('sendingNotification')}</p>
        </div>
      )}

      {/* GUEST VERIFIED — Waiting for host */}
      {state === 'GUEST_VERIFIED' && (
        <div className="text-center py-6 animate-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 mb-4 shadow-lg shadow-green-500/25">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-green-700 dark:text-green-400 animate-fade-up-d1">{t('hostNotified')}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 animate-fade-up-d2">{t('waitingForHost')}</p>

          {/* Animated waiting dots */}
          <div className="flex justify-center mt-4 space-x-1.5 animate-fade-up-d3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>

          {/* Auto-fallback countdown for instant-book */}
          {isInstantBook && autoFallbackMs !== null && autoFallbackMs > 0 && (
            <p className="text-xs text-gray-400 mt-3">
              {t('autoConfirmIn', { time: formatCountdown(autoFallbackMs) })}
            </p>
          )}

          {/* Call host after 5+ minutes for non-instant-book */}
          {!isInstantBook && autoFallbackMs !== null && autoFallbackMs <= 0 && booking.host?.phone && (
            <a
              href={`tel:${booking.host.phone}`}
              className="inline-flex items-center mt-4 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {t('callHost')}
            </a>
          )}
        </div>
      )}

      {/* HANDOFF COMPLETE */}
      {state === 'HANDOFF_COMPLETE' && (
        <div className="text-center py-6 animate-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 mb-4 shadow-lg shadow-green-500/25">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-green-700 dark:text-green-400 animate-fade-up-d1">{t('handoffComplete')}</p>

          {/* Key instructions if any */}
          {keyInstructions && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-left animate-fade-up-d2">
              <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-1.5">{t('keyInstructions')}</p>
              <p className="text-sm text-blue-900 dark:text-blue-100 whitespace-pre-wrap leading-relaxed">{keyInstructions}</p>
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 animate-fade-up-d3">{t('proceedToInspection')}</p>
        </div>
      )}

      {/* EXPIRED */}
      {state === 'EXPIRED' && (
        <div className="text-center py-6 animate-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('handoffExpired')}</p>
          <button
            onClick={handleContinueAnyway}
            className="mt-4 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 active:scale-[0.98] transition-all"
          >
            {t('continueWithout')}
          </button>
        </div>
      )}

      {/* ERROR */}
      {state === 'ERROR' && (
        <div className="text-center py-6 animate-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
          <button
            onClick={requestGPS}
            className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 active:scale-[0.98] transition-all"
          >
            {t('tryAgain')}
          </button>
        </div>
      )}

      {/* TESTING MODE bypass button */}
      {TESTING_MODE && state !== 'HANDOFF_COMPLETE' && state !== 'LOADING' && (
        <div className="text-center">
          <button
            onClick={handleBypass}
            className="text-xs text-gray-400 underline hover:text-gray-600"
          >
            [Test] Bypass Handoff
          </button>
        </div>
      )}
    </div>
  )
}

// ── Premium Handoff Map ─────────────────────────────────────────────────────
const MAP_CONTAINER_STYLE = { width: '100%', height: '380px', borderRadius: '0px' }

// Dark navigation-style map theme
const NAV_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry.stroke', stylers: [{ color: '#334e87' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#023e58' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#0a4d4d' }, { visibility: 'on' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c6675' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#255763' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#b0d5ce' }] },
  { featureType: 'road.highway', elementType: 'labels.text.stroke', stylers: [{ color: '#023e58' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#132f47' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
]

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  styles: NAV_MAP_STYLES,
  gestureHandling: 'greedy',
}

// Pulsing blue dot for guest location
const GUEST_MARKER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44">
  <circle cx="22" cy="22" r="20" fill="rgba(59,130,246,0.12)" stroke="none">
    <animate attributeName="r" values="14;20;14" dur="2s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="22" cy="22" r="10" fill="rgba(59,130,246,0.25)" stroke="none">
    <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="22" cy="22" r="7" fill="#3B82F6" stroke="white" stroke-width="3"/>
  <circle cx="22" cy="22" r="3" fill="white" opacity="0.9"/>
</svg>`

// Car destination pin
const CAR_MARKER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56">
  <defs>
    <filter id="s" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.4"/>
    </filter>
  </defs>
  <path d="M22 2C13.16 2 6 9.16 6 18c0 14 16 36 16 36s16-22 16-36C38 9.16 30.84 2 22 2z" fill="#EF4444" filter="url(#s)"/>
  <path d="M22 2C13.16 2 6 9.16 6 18c0 14 16 36 16 36s16-22 16-36C38 9.16 30.84 2 22 2z" fill="url(#g)"/>
  <defs><linearGradient id="g" x1="6" y1="2" x2="38" y2="40" gradientUnits="userSpaceOnUse">
    <stop offset="0%" stop-color="#F87171"/><stop offset="100%" stop-color="#DC2626"/>
  </linearGradient></defs>
  <circle cx="22" cy="17" r="9" fill="white"/>
  <path d="M16 19.5v-1h.8l1.2-3.5h8l1.2 3.5h.8v1c0 .28-.22.5-.5.5h-.5v-.5h-10v.5h-.5c-.28 0-.5-.22-.5-.5zm2.5-.8a.8.8 0 100-1.6.8.8 0 000 1.6zm7 0a.8.8 0 100-1.6.8.8 0 000 1.6zm-5.5-3h4l-.8-2.4h-2.4l-.8 2.4z" fill="#DC2626"/>
</svg>`

function HandoffMap({ guestLocation, carLocation, pickupAddress, carLabel, visible, distance }: {
  guestLocation: { lat: number; lng: number } | null
  carLocation: { lat: number; lng: number } | null
  pickupAddress?: string
  carLabel?: string
  visible: boolean
  distance: number | null
}) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
  })
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)
  const [eta, setEta] = useState<{ duration: string; distance: string } | null>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const lastKeyRef = useRef<string>('')

  // Fetch directions + ETA when both locations available
  useEffect(() => {
    if (!isLoaded || !guestLocation || !carLocation) return

    // Throttle: only re-request if guest moved significantly (~200m)
    const key = `${Math.round(guestLocation.lat * 1000)},${Math.round(guestLocation.lng * 1000)}`
    if (key === lastKeyRef.current) return
    lastKeyRef.current = key

    const service = new google.maps.DirectionsService()
    service.route({
      origin: guestLocation,
      destination: carLocation,
      travelMode: google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (status === 'OK' && result) {
        setDirections(result)
        const leg = result.routes[0]?.legs[0]
        if (leg) {
          setEta({
            duration: leg.duration?.text || '',
            distance: leg.distance?.text || '',
          })
        }
      }
    })
  }, [isLoaded, guestLocation?.lat, guestLocation?.lng, carLocation?.lat, carLocation?.lng])

  // Auto-zoom to fit both markers with padding
  useEffect(() => {
    if (!mapInstanceRef.current || !guestLocation || !carLocation) return
    const bounds = new google.maps.LatLngBounds()
    bounds.extend(guestLocation)
    bounds.extend(carLocation)
    mapInstanceRef.current.fitBounds(bounds, { top: 70, right: 60, bottom: 70, left: 60 })
  }, [guestLocation?.lat, guestLocation?.lng, carLocation?.lat, carLocation?.lng])

  if (!visible || !isLoaded) return null

  const center = carLocation || guestLocation || { lat: 33.4484, lng: -112.074 }

  return (
    <div className="space-y-0">
      {/* ── Navigation Header ── */}
      <div className="bg-gray-900 dark:bg-gray-950 rounded-t-2xl px-4 py-3">
        <div className="flex items-start gap-3">
          {/* Route indicator dots */}
          <div className="flex flex-col items-center gap-0.5 mt-1">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-500/30" />
            <div className="w-px h-3 bg-gray-600" />
            <div className="w-px h-3 bg-gray-600" />
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-500/30" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Your location</p>
            <p className="text-xs text-gray-500 mt-0.5 mb-2">Current GPS position</p>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Destination</p>
            {/* Address: street on line 1, city/state/zip on line 2 */}
            {(() => {
              const addr = pickupAddress || 'Pickup Location'
              const parts = addr.split(',').map((s: string) => s.trim())
              const street = parts[0] || addr
              const cityLine = parts.slice(1).join(', ')
              return (
                <>
                  <p className="text-sm text-white font-semibold mt-0.5">{street}</p>
                  {cityLine && <p className="text-xs text-gray-400">{cityLine}</p>}
                </>
              )
            })()}
            {carLabel && <p className="text-xs text-gray-500 mt-0.5">{carLabel}</p>}
          </div>
          {/* ETA + Live */}
          <div className="text-right flex-shrink-0">
            {eta && eta.duration && (
              <>
                <p className="text-lg font-bold text-white tabular-nums">{eta.duration}</p>
                <p className="text-xs text-gray-400">{eta.distance}</p>
              </>
            )}
            <div className="flex items-center gap-1.5 justify-end mt-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
              <span className="text-[9px] font-bold text-green-400 uppercase tracking-widest">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Map ── */}
      <div className="relative">
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={center}
          zoom={14}
          options={MAP_OPTIONS}
          onLoad={(map) => { mapInstanceRef.current = map }}
        >
          {/* Car destination marker */}
          {carLocation && (
            <Marker
              position={carLocation}
              icon={{
                url: 'data:image/svg+xml,' + encodeURIComponent(CAR_MARKER_SVG),
                scaledSize: new google.maps.Size(44, 56),
                anchor: new google.maps.Point(22, 56),
              }}
              title={carLabel || 'Vehicle pickup'}
            />
          )}

          {/* Guest location — blue pulsing dot */}
          {guestLocation && (
            <Marker
              position={guestLocation}
              icon={{
                url: 'data:image/svg+xml,' + encodeURIComponent(GUEST_MARKER_SVG),
                scaledSize: new google.maps.Size(44, 44),
                anchor: new google.maps.Point(22, 22),
              }}
              title="Your location"
            />
          )}

          {/* Route polyline */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: '#3B82F6',
                  strokeWeight: 6,
                  strokeOpacity: 0.9,
                },
              }}
            />
          )}
        </GoogleMap>

        {/* Distance overlay — bottom-right of map */}
        {distance !== null && (
          <div className="absolute bottom-3 right-3 bg-gray-900/80 backdrop-blur-sm rounded-full px-3 py-1.5">
            <span className="text-xs font-bold text-white tabular-nums">
              {distance < 1000 ? `${distance}m` : `${(distance / 1609.34).toFixed(1)} mi`}
            </span>
          </div>
        )}
      </div>

      {/* ── ETA Bar ── */}
      {eta && eta.duration && (
        <div className="bg-gray-900 dark:bg-gray-950 rounded-b-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400">Estimated arrival</p>
              <p className="text-sm font-bold text-white">{eta.duration} · {eta.distance}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span className="text-xs font-semibold text-green-400">GPS Active</span>
          </div>
        </div>
      )}
    </div>
  )
}
