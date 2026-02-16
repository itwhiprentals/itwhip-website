'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
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
