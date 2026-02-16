'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { IoLocationOutline, IoCheckmarkCircleOutline, IoKeyOutline } from 'react-icons/io5'
import { HANDOFF_STATUS, TRIP_CONSTANTS } from '@/app/lib/trip/constants'

interface HandoffPanelProps {
  bookingId: string
  handoffStatus: string | null
  guestDistance: number | null
  isInstantBook: boolean
  savedKeyInstructions: string | null
  autoFallbackAt: string | null
}

export function HandoffPanel({
  bookingId,
  handoffStatus: initialStatus,
  guestDistance: initialDistance,
  isInstantBook,
  savedKeyInstructions,
  autoFallbackAt,
}: HandoffPanelProps) {
  const t = useTranslations('HandoffHost')
  const [status, setStatus] = useState(initialStatus || HANDOFF_STATUS.PENDING)
  const [guestDistance, setGuestDistance] = useState<number | null>(initialDistance)
  const [confirming, setConfirming] = useState(false)
  const [keyText, setKeyText] = useState(savedKeyInstructions || '')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [saveForFuture, setSaveForFuture] = useState(false)
  const [autoCountdown, setAutoCountdown] = useState<number | null>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  // Poll for guest arrival
  useEffect(() => {
    if (status === HANDOFF_STATUS.PENDING || status === HANDOFF_STATUS.GUEST_VERIFIED) {
      startPolling()
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [status])

  // Countdown for auto-confirm (instant-book)
  useEffect(() => {
    if (status === HANDOFF_STATUS.GUEST_VERIFIED && isInstantBook && autoFallbackAt) {
      const updateCountdown = () => {
        const remaining = new Date(autoFallbackAt).getTime() - Date.now()
        if (remaining <= 0) {
          setAutoCountdown(0)
          setStatus(HANDOFF_STATUS.HANDOFF_COMPLETE)
          if (countdownRef.current) clearInterval(countdownRef.current)
        } else {
          setAutoCountdown(remaining)
        }
      }
      updateCountdown()
      countdownRef.current = setInterval(updateCountdown, 1000)
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [status, isInstantBook, autoFallbackAt])

  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current)

    const poll = async () => {
      try {
        const response = await fetch(`/api/rentals/bookings/${bookingId}/handoff/status`, {
          credentials: 'include',
        })
        if (!response.ok) return
        const result = await response.json()

        if (result.handoffStatus !== status) {
          setStatus(result.handoffStatus)
        }
        if (result.guestDistance !== null) {
          setGuestDistance(result.guestDistance)
        }

        // Stop polling on terminal states
        if (result.handoffStatus === HANDOFF_STATUS.HANDOFF_COMPLETE ||
            result.handoffStatus === HANDOFF_STATUS.EXPIRED ||
            result.handoffStatus === HANDOFF_STATUS.BYPASSED) {
          if (pollRef.current) clearInterval(pollRef.current)
        }
      } catch { /* silent */ }
    }

    poll()
    pollRef.current = setInterval(poll, TRIP_CONSTANTS.HANDOFF_POLLING_INTERVAL)
  }, [bookingId, status])

  const handleConfirmHandoff = async () => {
    setConfirming(true)

    // Get host GPS silently
    let hostLat: number | undefined
    let hostLng: number | undefined

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 60000,
        })
      })
      hostLat = pos.coords.latitude
      hostLng = pos.coords.longitude
    } catch {
      // GPS not available — that's fine, it's a soft requirement
    }

    try {
      const response = await fetch(`/api/partner/bookings/${bookingId}/handoff/confirm`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: hostLat,
          longitude: hostLng,
          keyInstructions: keyText.trim() || undefined,
          saveKeyInstructions: saveForFuture,
        }),
      })

      if (response.ok) {
        setStatus(HANDOFF_STATUS.HANDOFF_COMPLETE)
        if (pollRef.current) clearInterval(pollRef.current)
      }
    } catch {
      // Retry silently
    } finally {
      setConfirming(false)
    }
  }

  const formatCountdown = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // WAITING — Guest hasn't arrived yet
  if (status === HANDOFF_STATUS.PENDING || status === null) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-2">
          <IoLocationOutline className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('tripHandoff')}</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('waitingForGuest')}</p>
      </div>
    )
  }

  // GUEST VERIFIED — Guest is at the car!
  if (status === HANDOFF_STATUS.GUEST_VERIFIED) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-4">
        <div className="flex items-center gap-2 mb-2">
          <IoLocationOutline className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            {t('guestArrived')}
            {guestDistance !== null && (
              <span className="font-normal text-amber-600 dark:text-amber-400 ml-1">({guestDistance}m {t('away')})</span>
            )}
          </h3>
        </div>

        {/* Visual checklist (not blocking) */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded">
            <IoCheckmarkCircleOutline className="w-3.5 h-3.5 mr-1 text-green-500" /> {t('guestPresent')}
          </span>
          <span className="inline-flex items-center text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded">
            <IoCheckmarkCircleOutline className="w-3.5 h-3.5 mr-1 text-green-500" /> {t('dlChecked')}
          </span>
          <span className="inline-flex items-center text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded">
            <IoKeyOutline className="w-3.5 h-3.5 mr-1 text-green-500" /> {t('keysHandedOver')}
          </span>
        </div>

        {/* Optional key instructions */}
        {!showKeyInput ? (
          <button
            onClick={() => setShowKeyInput(true)}
            className="text-xs text-amber-700 dark:text-amber-400 underline mb-3"
          >
            {t('addKeyInstructions')}
          </button>
        ) : (
          <div className="mb-3 space-y-2">
            <textarea
              value={keyText}
              onChange={(e) => setKeyText(e.target.value)}
              placeholder={t('keyInstructionsPlaceholder')}
              className="w-full text-sm p-2 border border-amber-300 dark:border-amber-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
              rows={2}
            />
            <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <input
                type="checkbox"
                checked={saveForFuture}
                onChange={(e) => setSaveForFuture(e.target.checked)}
                className="rounded border-gray-300"
              />
              {t('saveForFuture')}
            </label>
          </div>
        )}

        {/* Big confirm button */}
        <button
          onClick={handleConfirmHandoff}
          disabled={confirming}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {confirming ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t('confirming')}
            </span>
          ) : (
            t('confirmHandoff')
          )}
        </button>

        {/* Instant-book auto-confirm countdown */}
        {isInstantBook && autoCountdown !== null && autoCountdown > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 text-center mt-2">
            {t('autoConfirmIn', { time: formatCountdown(autoCountdown) })}
          </p>
        )}
      </div>
    )
  }

  // HANDOFF COMPLETE
  if (status === HANDOFF_STATUS.HANDOFF_COMPLETE || status === HANDOFF_STATUS.BYPASSED) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
        <div className="flex items-center gap-2">
          <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">{t('handoffComplete')}</h3>
        </div>
        <p className="text-sm text-green-700 dark:text-green-400 mt-1">{t('guestStartingInspection')}</p>
      </div>
    )
  }

  // EXPIRED
  if (status === HANDOFF_STATUS.EXPIRED) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2">
          <IoLocationOutline className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('handoffExpired')}</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('handoffExpiredDesc')}</p>
      </div>
    )
  }

  return null
}
