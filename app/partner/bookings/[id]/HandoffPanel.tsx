'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { IoLocationOutline, IoCheckmarkCircleOutline, IoKeyOutline, IoChevronDownOutline, IoTimeOutline, IoPersonOutline, IoDocumentTextOutline, IoCarOutline, IoShieldCheckmarkOutline, IoAlertCircleOutline, IoImagesOutline, IoCloseOutline } from 'react-icons/io5'
import { HANDOFF_STATUS, TRIP_CONSTANTS } from '@/app/lib/trip/constants'

interface HandoffPanelProps {
  bookingId: string
  bookingStatus?: string
  handoffStatus: string | null
  guestDistance: number | null
  isInstantBook: boolean
  savedKeyInstructions: string | null
  autoFallbackAt: string | null
  // Expanded details (for completed handoff)
  hostHandoffVerifiedAt?: string | null
  guestGpsVerifiedAt?: string | null
  keyInstructionsDeliveredAt?: string | null
  hostHandoffDistance?: number | null
  licensePhotoUrl?: string | null
  licenseBackPhotoUrl?: string | null
  // Live tracking
  guestLiveDistance?: number | null
  guestLiveUpdatedAt?: string | null
  guestEtaMessage?: string | null
  guestArrivalSummary?: string | null
  guestLocationTrust?: number | null
  pickupLocation?: string | null
  // Post-trip review
  hostFinalReviewStatus?: string | null
  hostFinalReviewDeadline?: string | null
  depositAmount?: number
  inspectionPhotosStart?: Array<{ category: string; url: string }>
  inspectionPhotosEnd?: Array<{ category: string; url: string }>
}

export function HandoffPanel({
  bookingId,
  bookingStatus,
  handoffStatus: initialStatus,
  guestDistance: initialDistance,
  isInstantBook,
  savedKeyInstructions,
  autoFallbackAt,
  hostHandoffVerifiedAt,
  guestGpsVerifiedAt,
  keyInstructionsDeliveredAt,
  hostHandoffDistance,
  licensePhotoUrl,
  licenseBackPhotoUrl,
  guestLiveDistance: initialLiveDistance,
  guestLiveUpdatedAt: initialLiveUpdatedAt,
  guestEtaMessage: initialEtaMessage,
  guestArrivalSummary: initialArrivalSummary,
  guestLocationTrust: initialLocationTrust,
  pickupLocation,
  hostFinalReviewStatus,
  hostFinalReviewDeadline,
  depositAmount,
  inspectionPhotosStart = [],
  inspectionPhotosEnd = [],
}: HandoffPanelProps) {
  const t = useTranslations('HandoffHost')
  const [status, setStatus] = useState(initialStatus || HANDOFF_STATUS.PENDING)
  const [guestDistance, setGuestDistance] = useState<number | null>(initialDistance)
  const [confirming, setConfirming] = useState(false)
  const [keyText, setKeyText] = useState(savedKeyInstructions || '')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [saveForFuture, setSaveForFuture] = useState(false)
  const [autoCountdown, setAutoCountdown] = useState<number | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [dlPreview, setDlPreview] = useState<string | null>(null)
  const [liveDistance, setLiveDistance] = useState<number | null>(initialLiveDistance ?? null)
  const [liveUpdatedAt, setLiveUpdatedAt] = useState<string | null>(initialLiveUpdatedAt ?? null)
  const [etaMessage, setEtaMessage] = useState<string | null>(initialEtaMessage ?? null)
  const [arrivalSummary, setArrivalSummary] = useState<string | null>(initialArrivalSummary ?? null)
  const [hostConfirmedLocally, setHostConfirmedLocally] = useState(false)
  const [handoffChecklist, setHandoffChecklist] = useState({
    idVerified: false,
    vehicleReviewed: false,
    keysProvided: false,
  })
  const allChecked = Object.values(handoffChecklist).every(Boolean)
  const [dropoffNotification, setDropoffNotification] = useState<{
    message: string; notifiedAt: string; metadata?: any
  } | null>(null)
  const [dropoffChecklist, setDropoffChecklist] = useState({
    vehicleInspected: false,
    keysReturned: false,
    conditionNoted: false,
  })
  const [hostDistanceToCar, setHostDistanceToCar] = useState<number | null>(null)
  const [hostGpsRetrying, setHostGpsRetrying] = useState(false)
  // Post-trip review state
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewDone, setReviewDone] = useState<string | null>(hostFinalReviewStatus === 'APPROVED' || hostFinalReviewStatus === 'AUTO_APPROVED' ? 'APPROVED' : hostFinalReviewStatus === 'CLAIM_FILED' ? 'CLAIM_FILED' : null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [reviewTimeRemaining, setReviewTimeRemaining] = useState<string | null>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const dropoffPollRef = useRef<NodeJS.Timeout | null>(null)
  const hostGpsPollRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  const parseDropoffMessage = useCallback((message: string) => {
    const addressMatch = message.match(/Drop-off Location: (.+?)(?:\n|$)/)
    const mapMatch = message.match(/Map: (https:\/\/[^\s]+)/)
    const coordMatch = message.match(/Coordinates: ([\d.-]+), ([\d.-]+)/)
    return {
      address: addressMatch?.[1] || null,
      mapLink: mapMatch?.[1] || null,
      lat: coordMatch ? parseFloat(coordMatch[1]) : null,
      lng: coordMatch ? parseFloat(coordMatch[2]) : null,
    }
  }, [])

  // Poll for guest arrival (pickup handoff)
  useEffect(() => {
    if (status === HANDOFF_STATUS.PENDING || status === HANDOFF_STATUS.GUEST_VERIFIED) {
      startPolling()
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [status])

  // Poll for drop-off notifications during active trips
  useEffect(() => {
    if (bookingStatus === 'ACTIVE' &&
        (status === HANDOFF_STATUS.HANDOFF_COMPLETE || status === HANDOFF_STATUS.BYPASSED) &&
        !dropoffNotification) {
      const pollDropoff = async () => {
        try {
          const response = await fetch(`/api/rentals/bookings/${bookingId}/handoff/status`, {
            credentials: 'include',
          })
          if (!response.ok) return
          const result = await response.json()
          if (result.dropoffNotification) {
            setDropoffNotification(result.dropoffNotification)
            if (dropoffPollRef.current) clearInterval(dropoffPollRef.current)
          }
        } catch { /* silent */ }
      }
      pollDropoff()
      dropoffPollRef.current = setInterval(pollDropoff, TRIP_CONSTANTS.DROPOFF_POLLING_INTERVAL)
    }
    return () => {
      if (dropoffPollRef.current) clearInterval(dropoffPollRef.current)
    }
  }, [bookingStatus, status, dropoffNotification, bookingId])

  // Haversine distance calculation (meters)
  const haversineDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000 // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }, [])

  // Track host GPS position to calculate distance to car drop-off
  useEffect(() => {
    if (!dropoffNotification) return
    const dropoff = parseDropoffMessage(dropoffNotification.message)
    if (!dropoff.lat || !dropoff.lng) return

    const carLat = dropoff.lat
    const carLng = dropoff.lng

    const updateHostDistance = () => {
      setHostGpsRetrying(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const dist = haversineDistance(pos.coords.latitude, pos.coords.longitude, carLat, carLng)
          setHostDistanceToCar(dist)
          setHostGpsRetrying(false)
        },
        () => {
          // GPS failed — keep retrying
          setHostGpsRetrying(true)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      )
    }

    updateHostDistance()
    hostGpsPollRef.current = setInterval(updateHostDistance, 15000) // update every 15s

    return () => {
      if (hostGpsPollRef.current) clearInterval(hostGpsPollRef.current)
    }
  }, [dropoffNotification, haversineDistance])

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
        // Update live tracking data
        if (result.guestLiveDistance !== undefined) setLiveDistance(result.guestLiveDistance)
        if (result.guestLiveUpdatedAt !== undefined) setLiveUpdatedAt(result.guestLiveUpdatedAt)
        if (result.guestEtaMessage !== undefined) setEtaMessage(result.guestEtaMessage)
        if (result.guestArrivalSummary !== undefined) setArrivalSummary(result.guestArrivalSummary)

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
        setHostConfirmedLocally(true)
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

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`
    const km = meters / 1000
    if (km < 1.6) return `${km.toFixed(1)} km`
    const miles = km / 1.609
    return `${miles.toFixed(1)} mi`
  }

  const formatTimeAgo = (dateStr: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    return `${Math.floor(minutes / 60)}h ago`
  }

  // Countdown timer for 24h review deadline
  useEffect(() => {
    if (bookingStatus !== 'COMPLETED' || !hostFinalReviewDeadline || reviewDone) return
    const update = () => {
      const remaining = new Date(hostFinalReviewDeadline).getTime() - Date.now()
      if (remaining <= 0) {
        setReviewTimeRemaining(t('reviewExpired'))
        setReviewDone('AUTO_APPROVED')
        return
      }
      const h = Math.floor(remaining / 3600000)
      const m = Math.floor((remaining % 3600000) / 60000)
      setReviewTimeRemaining(`${h}h ${m}m remaining`)
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [bookingStatus, hostFinalReviewDeadline, reviewDone])

  const handleFinalReview = async (action: 'approve' | 'claim') => {
    setReviewSubmitting(true)
    try {
      const response = await fetch(`/api/partner/bookings/${bookingId}/handoff/final-review`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (response.ok) {
        const result = await response.json()
        setReviewDone(result.status)
        if (result.claimUrl) {
          window.location.href = result.claimUrl
        }
      }
    } catch { /* silent */ } finally {
      setReviewSubmitting(false)
    }
  }

  const PHOTO_LABELS: Record<string, string> = {
    front: 'Front', back: 'Back', driver_side: 'Driver Side',
    passenger_side: 'Passenger Side', dashboard: 'Dashboard',
    odometer: 'Odometer', interior_front: 'Interior Front',
    interior_back: 'Interior Back', trunk: 'Trunk',
  }

  // ── COMPLETED TRIP — Post-Trip Review ──
  if (bookingStatus === 'COMPLETED') {
    // Already reviewed — APPROVED
    if (reviewDone === 'APPROVED' || reviewDone === 'AUTO_APPROVED') {
      return (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">
              {t('tripApprovedTitle')}
            </h3>
          </div>
          <p className="text-xs text-green-700 dark:text-green-400">
            {reviewDone === 'AUTO_APPROVED'
              ? t('autoApprovedMessage')
              : t('manualApprovedMessage')}
          </p>
        </div>
      )
    }

    // Already reviewed — CLAIM FILED
    if (reviewDone === 'CLAIM_FILED') {
      return (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <IoAlertCircleOutline className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {t('claimFiledTitle')}
            </h3>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {t('claimFiledMessage')}
          </p>
        </div>
      )
    }

    // PENDING REVIEW — show photos + actions
    const allPhotos = [
      ...inspectionPhotosStart.map(p => ({ ...p, phase: 'Pre-Trip' as const })),
      ...inspectionPhotosEnd.map(p => ({ ...p, phase: 'Post-Trip' as const })),
    ]

    return (
      <>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 overflow-hidden">
          <div className="p-4">
            {/* Header with countdown */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <IoImagesOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                  {t('postTripReviewTitle')}
                </h3>
              </div>
              {reviewTimeRemaining && (
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <IoTimeOutline className="w-3 h-3" />
                  {reviewTimeRemaining}
                </span>
              )}
            </div>

            <p className="text-xs text-blue-700 dark:text-blue-400 mb-4">
              {t('reviewInstructions', { deposit: depositAmount ? `$${depositAmount.toFixed(2)}` : '' })}
            </p>

            {/* Photo grid */}
            {allPhotos.length > 0 ? (
              <div className="space-y-3 mb-4">
                {/* Pre-Trip Photos */}
                {inspectionPhotosStart.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1.5 uppercase tracking-wide">{t('preTripPhotos')}</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {inspectionPhotosStart.map((photo, i) => (
                        <button
                          key={`start-${i}`}
                          onClick={() => setPhotoPreview(photo.url)}
                          className="relative aspect-[4/3] rounded-md overflow-hidden group"
                        >
                          <Image src={photo.url} alt={photo.category} fill className="object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                            <span className="text-[9px] text-white font-medium">{PHOTO_LABELS[photo.category] || photo.category}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Post-Trip Photos */}
                {inspectionPhotosEnd.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1.5 uppercase tracking-wide">{t('postTripPhotos')}</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {inspectionPhotosEnd.map((photo, i) => (
                        <button
                          key={`end-${i}`}
                          onClick={() => setPhotoPreview(photo.url)}
                          className="relative aspect-[4/3] rounded-md overflow-hidden group"
                        >
                          <Image src={photo.url} alt={photo.category} fill className="object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                            <span className="text-[9px] text-white font-medium">{PHOTO_LABELS[photo.category] || photo.category}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 mb-4 bg-blue-100/50 dark:bg-blue-900/30 rounded-lg">
                <IoImagesOutline className="w-8 h-8 text-blue-400 mx-auto mb-1" />
                <p className="text-xs text-blue-600 dark:text-blue-400">{t('noPhotosAvailable')}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleFinalReview('approve')}
                disabled={reviewSubmitting}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <IoCheckmarkCircleOutline className="w-4 h-4" />
                {reviewSubmitting ? t('processing') : t('approveReleaseDeposit')}
              </button>
              <button
                onClick={() => handleFinalReview('claim')}
                disabled={reviewSubmitting}
                className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <IoAlertCircleOutline className="w-4 h-4" />
                {t('reportIssue')}
              </button>
            </div>
          </div>
        </div>

        {/* Photo preview lightbox */}
        {photoPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setPhotoPreview(null)}>
            <div className="relative max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <Image src={photoPreview} alt="Inspection photo" width={800} height={600} className="rounded-lg w-full h-auto" />
              <button
                onClick={() => setPhotoPreview(null)}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70"
              >
                <IoCloseOutline className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  // ACTIVE TRIP + DROP-OFF NOTIFICATION — Guest is returning the vehicle
  if (bookingStatus === 'ACTIVE' &&
      (status === HANDOFF_STATUS.HANDOFF_COMPLETE || status === HANDOFF_STATUS.BYPASSED) &&
      dropoffNotification) {
    const dropoff = parseDropoffMessage(dropoffNotification.message)
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
        {/* Drop-off animation CSS */}
        <style>{`
          @keyframes dropoff-bar {
            0% { transform: translateX(-100%); opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { transform: translateX(100%); opacity: 0; }
          }
          @keyframes dropoff-bar-reverse {
            0% { transform: translateX(100%); opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { transform: translateX(-100%); opacity: 0; }
          }
          @keyframes dropoff-icon-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.08); }
          }
        `}</style>

        <div className="flex items-center gap-2 mb-3">
          <IoCarOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">{t('guestReturning')}</h3>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {t('notifiedAgo', { time: formatTimeAgo(dropoffNotification.notifiedAt) })}
            </p>
          </div>
        </div>

        {/* Car ←→ Location animation */}
        <div className="flex items-center justify-center gap-0 my-4 px-2">
          <div
            className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md"
            style={{ animation: 'dropoff-icon-pulse 2s ease-in-out infinite' }}
          >
            <IoCarOutline className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 mx-2 h-6 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 right-0 flex items-center">
              <div className="w-full border-t-2 border-dashed border-blue-300/50 dark:border-blue-600/40" />
            </div>
            <div className="absolute inset-y-0 left-0 right-0 flex items-center overflow-hidden">
              <div
                className="w-6 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 absolute"
                style={{ animation: 'dropoff-bar 1.8s ease-in-out infinite', left: '10%' }}
              />
              <div
                className="w-6 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 absolute"
                style={{ animation: 'dropoff-bar 1.8s ease-in-out 0.6s infinite', left: '40%' }}
              />
              <div
                className="w-6 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 absolute"
                style={{ animation: 'dropoff-bar 1.8s ease-in-out 1.2s infinite', left: '70%' }}
              />
            </div>
            <div className="absolute inset-y-0 left-0 right-0 flex items-center overflow-hidden">
              <div
                className="w-6 h-1.5 rounded-full bg-gradient-to-l from-green-400 to-green-500 absolute"
                style={{ animation: 'dropoff-bar-reverse 1.8s ease-in-out 0.3s infinite', left: '20%' }}
              />
              <div
                className="w-6 h-1.5 rounded-full bg-gradient-to-l from-green-400 to-green-500 absolute"
                style={{ animation: 'dropoff-bar-reverse 1.8s ease-in-out 0.9s infinite', left: '55%' }}
              />
            </div>
          </div>

          <div
            className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md"
            style={{ animation: 'dropoff-icon-pulse 2s ease-in-out 0.5s infinite' }}
          >
            <IoLocationOutline className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Drop-off location + host distance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700 p-3 mb-3">
          <div className="flex items-start gap-2">
            <IoLocationOutline className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('dropoffLocation')}</p>
              {dropoff.address && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{dropoff.address}</p>
              )}
              {dropoff.mapLink && (
                <a
                  href={dropoff.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  {t('viewOnMap')}
                </a>
              )}
            </div>
          </div>

          {/* Host distance to car */}
          <div className="mt-2 pt-2 border-t border-blue-100 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">{t('yourDistanceToCar')}</span>
              {hostDistanceToCar !== null ? (
                <span className={`text-xs font-semibold ${
                  hostDistanceToCar < 500
                    ? 'text-green-600 dark:text-green-400'
                    : hostDistanceToCar < 2000
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatDistance(hostDistanceToCar)}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  {hostGpsRetrying && (
                    <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {t('locatingYou')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Return checklist — informational only */}
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">{t('returnChecklist')}</p>
        <div className="space-y-2 mb-3">
          {([
            { key: 'vehicleInspected' as const, label: t('checkVehicleInspected') },
            { key: 'keysReturned' as const, label: t('checkKeysReturned') },
            { key: 'conditionNoted' as const, label: t('checkConditionNoted') },
          ]).map(({ key, label }) => (
            <label
              key={key}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                dropoffChecklist[key]
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <input
                type="checkbox"
                checked={dropoffChecklist[key]}
                onChange={(e) => setDropoffChecklist(prev => ({ ...prev, [key]: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className={`text-xs font-medium ${
                dropoffChecklist[key] ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {label}
              </span>
            </label>
          ))}
        </div>

        <p className="text-[10px] text-blue-600 dark:text-blue-400 text-center">
          {t('guestCanEndTrip')}
        </p>
      </div>
    )
  }

  // ACTIVE TRIP — Handoff complete, trip in progress, no drop-off yet
  if (bookingStatus === 'ACTIVE' &&
      (status === HANDOFF_STATUS.HANDOFF_COMPLETE || status === HANDOFF_STATUS.BYPASSED)) {
    const handoffTime = hostHandoffVerifiedAt || guestGpsVerifiedAt
    const wasAutoConfirmed = !hostHandoffVerifiedAt && !hostConfirmedLocally && status === HANDOFF_STATUS.HANDOFF_COMPLETE
    const handoffType = wasAutoConfirmed ? t('autoConfirmed') : t('metInPerson')

    return (
      <>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 overflow-hidden">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-green-100/50 dark:hover:bg-green-900/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">{t('pickupHandoffComplete')}</h3>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                  </span>
                  <p className="text-xs text-green-600 dark:text-green-400">{t('awaitingReturn')}</p>
                </div>
              </div>
            </div>
            <IoChevronDownOutline className={`w-4 h-4 text-green-600 dark:text-green-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>

          {expanded && (
            <div className="border-t border-green-200 dark:border-green-800 px-4 pb-4 pt-3">
              <div className="flex gap-4">
                <div className="w-1/2 space-y-3">
                  {handoffTime && (
                    <div className="flex items-start gap-2">
                      <IoTimeOutline className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('handoffTime')}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(handoffTime).toLocaleString(undefined, {
                            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <IoPersonOutline className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('handoffType')}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{handoffType}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <IoKeyOutline className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('keyInstructionsSent')}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {keyInstructionsDeliveredAt || savedKeyInstructions
                          ? (savedKeyInstructions || t('keyInstructionsSent'))
                          : t('noKeyInstructions')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <IoLocationOutline className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('pickupLocation')}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {pickupLocation || '—'}
                        {(hostHandoffDistance || guestDistance) && (hostHandoffDistance || guestDistance)! < 50000 && (
                          <span className="ml-1 text-gray-400 dark:text-gray-500">
                            ({formatDistance(hostHandoffDistance || guestDistance!)} {t('away')})
                          </span>
                        )}
                        {' '}
                        <a href="/partner/tracking" className="text-[10px] text-green-600 dark:text-green-400 hover:underline">
                          {t('trackVehicle')}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                {(licensePhotoUrl || licenseBackPhotoUrl) && (
                  <>
                  <div className="w-px bg-green-200 dark:bg-green-800 self-stretch" />
                  <div className="w-1/2 pl-3 flex flex-col items-center">
                    <div className="flex items-center gap-1 mb-1.5">
                      <IoDocumentTextOutline className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('guestDL')}</p>
                    </div>
                    <div className="space-y-1.5">
                      {licensePhotoUrl && (
                        <button onClick={() => setDlPreview(licensePhotoUrl)} className="relative w-[122px] h-[76px] rounded border border-gray-200 dark:border-gray-600 overflow-hidden hover:opacity-80 transition-opacity block">
                          <Image src={licensePhotoUrl} alt="DL Front" fill className="object-cover" sizes="122px" />
                          <span className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[9px] text-center py-0.5">Front</span>
                        </button>
                      )}
                      {licenseBackPhotoUrl && (
                        <button onClick={() => setDlPreview(licenseBackPhotoUrl)} className="relative w-[122px] h-[76px] rounded border border-gray-200 dark:border-gray-600 overflow-hidden hover:opacity-80 transition-opacity block">
                          <Image src={licenseBackPhotoUrl} alt="DL Back" fill className="object-cover" sizes="122px" />
                          <span className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[9px] text-center py-0.5">Back</span>
                        </button>
                      )}
                    </div>
                  </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {dlPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setDlPreview(null)}>
            <div className="relative max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <Image src={dlPreview} alt="Driver License" width={600} height={400} className="rounded-lg w-full h-auto" />
              <button onClick={() => setDlPreview(null)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  // WAITING — Guest hasn't arrived yet (show live tracking if available)
  if (status === HANDOFF_STATUS.PENDING || status === null) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-2">
          <IoLocationOutline className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('tripHandoff')}</h3>
        </div>

        {liveDistance !== null ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t('guestIs')} <span className="text-blue-600 dark:text-blue-400">{formatDistance(liveDistance)}</span> {t('away')}
              </p>
              {liveUpdatedAt && (
                <span className="text-[10px] text-gray-400">{formatTimeAgo(liveUpdatedAt)}</span>
              )}
            </div>
            {etaMessage && (
              <p className="text-xs text-gray-600 dark:text-gray-400 italic">{etaMessage}</p>
            )}
            {/* Pulsing indicator */}
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              <span className="text-[10px] text-gray-400">{t('trackingLive')}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('waitingForGuest')}</p>
        )}
      </div>
    )
  }

  // GUEST VERIFIED — Guest is nearby, notified host
  if (status === HANDOFF_STATUS.GUEST_VERIFIED) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-4">
        {/* Handoff animation CSS */}
        <style>{`
          @keyframes handoff-bar {
            0% { transform: translateX(-100%); opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { transform: translateX(100%); opacity: 0; }
          }
          @keyframes handoff-bar-reverse {
            0% { transform: translateX(100%); opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { transform: translateX(-100%); opacity: 0; }
          }
          @keyframes handoff-icon-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.08); }
          }
        `}</style>

        <div className="flex items-center gap-2 mb-3">
          <IoLocationOutline className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            {t('guestNearby')}
            {guestDistance !== null && (
              <span className="font-normal text-amber-600 dark:text-amber-400 ml-1">({formatDistance(guestDistance)})</span>
            )}
          </h3>
        </div>

        {/* Key ←→ Person handoff animation */}
        <div className="flex items-center justify-center gap-0 my-4 px-2">
          {/* Key icon */}
          <div
            className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md"
            style={{ animation: 'handoff-icon-pulse 2s ease-in-out infinite' }}
          >
            <IoKeyOutline className="w-5 h-5 text-white" />
          </div>

          {/* Animated bars between icons */}
          <div className="flex-1 mx-2 h-6 relative overflow-hidden">
            {/* Static dashed track */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center">
              <div className="w-full border-t-2 border-dashed border-amber-300/50 dark:border-amber-600/40" />
            </div>
            {/* Moving bars (left → right) */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center overflow-hidden">
              <div
                className="w-6 h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 absolute"
                style={{ animation: 'handoff-bar 1.8s ease-in-out infinite', left: '10%' }}
              />
              <div
                className="w-6 h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 absolute"
                style={{ animation: 'handoff-bar 1.8s ease-in-out 0.6s infinite', left: '40%' }}
              />
              <div
                className="w-6 h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 absolute"
                style={{ animation: 'handoff-bar 1.8s ease-in-out 1.2s infinite', left: '70%' }}
              />
            </div>
            {/* Moving bars (right → left) */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center overflow-hidden">
              <div
                className="w-6 h-1.5 rounded-full bg-gradient-to-l from-green-400 to-green-500 absolute"
                style={{ animation: 'handoff-bar-reverse 1.8s ease-in-out 0.3s infinite', left: '20%' }}
              />
              <div
                className="w-6 h-1.5 rounded-full bg-gradient-to-l from-green-400 to-green-500 absolute"
                style={{ animation: 'handoff-bar-reverse 1.8s ease-in-out 0.9s infinite', left: '55%' }}
              />
            </div>
          </div>

          {/* Person icon */}
          <div
            className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md"
            style={{ animation: 'handoff-icon-pulse 2s ease-in-out 0.5s infinite' }}
          >
            <IoPersonOutline className="w-5 h-5 text-white" />
          </div>
        </div>

        <p className="text-center text-xs text-amber-700 dark:text-amber-400 mb-3 font-medium">
          {t('meetGuestOrHandoff')}
        </p>

        {/* AI arrival summary */}
        {arrivalSummary && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 italic">{arrivalSummary}</p>
        )}

        {/* Auto-send note if car has key instructions */}
        {savedKeyInstructions && (
          <p className="text-[10px] text-amber-600 dark:text-amber-400 mb-2">
            {t('keyAutoSendNote')}
          </p>
        )}

        {/* Handoff checklist — host must confirm each step */}
        <div className="space-y-2 mb-3">
          {([
            { key: 'idVerified' as const, label: t('checkIdVerified') },
            { key: 'vehicleReviewed' as const, label: t('checkVehicleReviewed') },
            { key: 'keysProvided' as const, label: t('checkKeysProvided') },
          ]).map(({ key, label }) => (
            <label
              key={key}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                handoffChecklist[key]
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <input
                type="checkbox"
                checked={handoffChecklist[key]}
                onChange={(e) => setHandoffChecklist(prev => ({ ...prev, [key]: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className={`text-xs font-medium ${
                handoffChecklist[key] ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {label}
              </span>
            </label>
          ))}
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

        {/* Confirm button — disabled until all checklist items checked */}
        <button
          onClick={handleConfirmHandoff}
          disabled={confirming || !allChecked}
          className={`w-full py-3 font-semibold rounded-lg transition-colors disabled:cursor-not-allowed ${
            allChecked
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
          }`}
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

  // HANDOFF COMPLETE — expandable
  if (status === HANDOFF_STATUS.HANDOFF_COMPLETE || status === HANDOFF_STATUS.BYPASSED) {
    const handoffTime = hostHandoffVerifiedAt || guestGpsVerifiedAt
    const wasAutoConfirmed = !hostHandoffVerifiedAt && !hostConfirmedLocally && status === HANDOFF_STATUS.HANDOFF_COMPLETE
    const handoffType = wasAutoConfirmed ? t('autoConfirmed') : t('metInPerson')

    return (
      <>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 overflow-hidden">
          {/* Clickable header */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-green-100/50 dark:hover:bg-green-900/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">{t('handoffComplete')}</h3>
                <p className="text-xs text-green-600 dark:text-green-400">{t('guestStartingInspection')}</p>
              </div>
            </div>
            <IoChevronDownOutline className={`w-4 h-4 text-green-600 dark:text-green-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>

          {/* Expanded details — two columns */}
          {expanded && (
            <div className="border-t border-green-200 dark:border-green-800 px-4 pb-4 pt-3">
              <div className="flex gap-4">
                {/* Left column — handoff details */}
                <div className="w-1/2 space-y-3">
                  {/* Handoff time */}
                  {handoffTime && (
                    <div className="flex items-start gap-2">
                      <IoTimeOutline className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('handoffTime')}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(handoffTime).toLocaleString(undefined, {
                            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Handoff type */}
                  <div className="flex items-start gap-2">
                    <IoPersonOutline className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('handoffType')}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{handoffType}</p>
                    </div>
                  </div>

                  {/* Key instructions */}
                  <div className="flex items-start gap-2">
                    <IoKeyOutline className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('keyInstructionsSent')}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {keyInstructionsDeliveredAt || savedKeyInstructions
                          ? (savedKeyInstructions || t('keyInstructionsSent'))
                          : t('noKeyInstructions')}
                      </p>
                    </div>
                  </div>

                  {/* Pickup location + guest distance */}
                  <div className="flex items-start gap-2">
                    <IoLocationOutline className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('pickupLocation')}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {pickupLocation || '—'}
                        {(hostHandoffDistance || guestDistance) && (hostHandoffDistance || guestDistance)! < 50000 && (
                          <span className="ml-1 text-gray-400 dark:text-gray-500">
                            ({formatDistance(hostHandoffDistance || guestDistance!)} {t('away')})
                          </span>
                        )}
                        {' '}
                        <a
                          href="/partner/tracking"
                          className="text-[10px] text-green-600 dark:text-green-400 hover:underline"
                        >
                          {t('trackVehicle')}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Divider + Right column — Guest DL photos stacked */}
                {(licensePhotoUrl || licenseBackPhotoUrl) && (
                  <>
                  <div className="w-px bg-green-200 dark:bg-green-800 self-stretch" />
                  <div className="w-1/2 pl-3 flex flex-col items-center">
                    <div className="flex items-center gap-1 mb-1.5">
                      <IoDocumentTextOutline className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('guestDL')}</p>
                    </div>
                    <div className="space-y-1.5">
                      {licensePhotoUrl && (
                        <button onClick={() => setDlPreview(licensePhotoUrl)} className="relative w-[122px] h-[76px] rounded border border-gray-200 dark:border-gray-600 overflow-hidden hover:opacity-80 transition-opacity block">
                          <Image src={licensePhotoUrl} alt="DL Front" fill className="object-cover" sizes="122px" />
                          <span className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[9px] text-center py-0.5">Front</span>
                        </button>
                      )}
                      {licenseBackPhotoUrl && (
                        <button onClick={() => setDlPreview(licenseBackPhotoUrl)} className="relative w-[122px] h-[76px] rounded border border-gray-200 dark:border-gray-600 overflow-hidden hover:opacity-80 transition-opacity block">
                          <Image src={licenseBackPhotoUrl} alt="DL Back" fill className="object-cover" sizes="122px" />
                          <span className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[9px] text-center py-0.5">Back</span>
                        </button>
                      )}
                    </div>
                  </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* DL preview modal */}
        {dlPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setDlPreview(null)}>
            <div className="relative max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <Image src={dlPreview} alt="Driver License" width={600} height={400} className="rounded-lg w-full h-auto" />
              <button onClick={() => setDlPreview(null)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        )}
      </>
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
