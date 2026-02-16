'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { TRIP_CONSTANTS, HANDOFF_STATUS } from '@/app/lib/trip/constants'
import { TESTING_MODE } from '@/app/lib/trip/validation'

type HandoffState =
  | 'LOCATING'
  | 'TOO_FAR'
  | 'VERIFYING'
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
  const [state, setState] = useState<HandoffState>('LOCATING')
  const [distance, setDistance] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [keyInstructions, setKeyInstructions] = useState<string | null>(null)
  const [autoFallbackMs, setAutoFallbackMs] = useState<number | null>(null)
  const [isInstantBook, setIsInstantBook] = useState(false)
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null)
  const gpsLocationRef = useRef<{ lat: number; lng: number } | null>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)

  // Check if handoff was already completed (e.g. page refresh)
  useEffect(() => {
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
    // Start GPS automatically
    requestGPS()
  }, [])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

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
        verifyWithServer(loc)
      },
      (gpsError) => {
        // Try low-accuracy fallback
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const loc = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }
            setGpsLocation(loc)
            gpsLocationRef.current = loc
            verifyWithServer(loc)
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

  const verifyWithServer = async (loc: { lat: number; lng: number }) => {
    setState('VERIFYING')

    try {
      const response = await fetch(`/api/rentals/bookings/${booking.id}/handoff/guest-verify`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: loc.lat, longitude: loc.lng }),
      })

      const result = await response.json()

      if (!response.ok) {
        setState('ERROR')
        setError(result.error || t('verifyFailed'))
        return
      }

      setDistance(result.distance)
      setIsInstantBook(result.isInstantBook || false)

      if (result.verified) {
        setState('GUEST_VERIFIED')
        startPolling()
      } else {
        setState('TOO_FAR')
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

    // Poll immediately, then every 5s
    poll()
    pollRef.current = setInterval(poll, TRIP_CONSTANTS.HANDOFF_POLLING_INTERVAL)
  }, [booking.id, data.location, onLocationVerified])

  const handleBypass = async () => {
    setState('HANDOFF_COMPLETE')
    const loc = gpsLocationRef.current || { lat: 0, lng: 0 }
    onLocationVerified(loc)

    // Only send to server if we have real GPS coordinates (not null-island)
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
    // If no GPS available, skip server call — handoff status will stay as-is
    // and host can still confirm manually
  }

  const handleContinueAnyway = async () => {
    // For expired/bypassed scenarios — use real GPS if we have it
    setState('HANDOFF_COMPLETE')
    onLocationVerified(gpsLocationRef.current || data.location || { lat: 0, lng: 0 })
  }

  const formatCountdown = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* LOCATING */}
      {state === 'LOCATING' && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('findingLocation')}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('allowGps')}</p>
        </div>
      )}

      {/* VERIFYING */}
      {state === 'VERIFYING' && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-4">
            <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('confirmingLocation')}</p>
        </div>
      )}

      {/* TOO FAR */}
      {state === 'TOO_FAR' && (
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-50 dark:bg-amber-900/30 rounded-full mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t('tooFar', { distance: distance || 0 })}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('getCloser', { radius: TRIP_CONSTANTS.HANDOFF_RADIUS_METERS })}
          </p>
          <button
            onClick={requestGPS}
            className="mt-4 px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            {t('retryLocation')}
          </button>
        </div>
      )}

      {/* GUEST VERIFIED — Waiting for host */}
      {state === 'GUEST_VERIFIED' && (
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 dark:bg-green-900/30 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-green-700 dark:text-green-400">{t('locationConfirmed')}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('waitingForHost')}</p>

          {/* Animated waiting dots */}
          <div className="flex justify-center mt-3 space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
              className="inline-flex items-center mt-4 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm rounded-lg hover:bg-blue-100 transition-colors"
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
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-green-700 dark:text-green-400">{t('handoffComplete')}</p>

          {/* Key instructions if any */}
          {keyInstructions && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-left">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">{t('keyInstructions')}</p>
              <p className="text-sm text-blue-900 dark:text-blue-100 whitespace-pre-wrap">{keyInstructions}</p>
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">{t('proceedToInspection')}</p>
        </div>
      )}

      {/* EXPIRED */}
      {state === 'EXPIRED' && (
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('handoffExpired')}</p>
          <button
            onClick={handleContinueAnyway}
            className="mt-4 px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            {t('continueWithout')}
          </button>
        </div>
      )}

      {/* ERROR */}
      {state === 'ERROR' && (
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
          <button
            onClick={requestGPS}
            className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            {t('tryAgain')}
          </button>
        </div>
      )}

      {/* TESTING MODE bypass button */}
      {TESTING_MODE && state !== 'HANDOFF_COMPLETE' && (
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
