// app/(guest)/rentals/dashboard/bookings/[id]/page.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import confetti from 'canvas-confetti'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Booking, Message } from './types'
import { BookingDetails } from './components/BookingDetails'
import { BookingSidebar } from './components/BookingSidebar'
import { MessagesPanel } from './components/MessagesPanel'
import { PolicyFooter, CancellationDialog } from './components/BookingModals'
import CancellationPolicyModal from '@/app/[locale]/(guest)/rentals/components/modals/CancellationPolicyModal'
import TrustSafetyModal from '@/app/[locale]/(guest)/rentals/components/modals/TrustSafetyModal'
import { ChevronLeft, XCircle, CheckCircle, Copy, Clock } from './components/Icons'
import StatusProgression from '../../../components/StatusProgression'
import { TripActiveCard } from './components/trip/TripActiveCard'
import { TripStartCard } from './components/trip/TripStartCard'
import { TripEndCard } from './components/trip/TripEndCard'
import { BookingOnboarding } from './components/BookingOnboarding'
import { ModifyBookingSheet } from './components/ModifyBookingSheet'
import { SecureAccountBanner } from './components/SecureAccountBanner'
import RentalAgreementModal from '../../../components/modals/RentalAgreementModal'
import { BookedCard, VerifiedCard, IssuesCard, OnHoldCard, ConfirmedCard, CompletedCard, CancelledCard, NoShowCard } from './components/cards'
import ManualBookingGuestView from './components/ManualBookingGuestView'
import ManualBookingProgress from './components/ManualBookingProgress'
import { MinimalLegalFooter } from './components/cards/SharedCardSections'
import { CarPhotoOverlay } from './components/cards/CarPhotoOverlay'
import { getVehicleClass, formatFuelTypeBadge } from '@/app/lib/utils/vehicleClassification'
import {
  getTimeUntilPickup, validateFileUpload
} from './utils/helpers'
import {
  BOOKING_POLLING_INTERVAL,
  MESSAGE_POLLING_INTERVAL,
  FILE_UPLOAD_CONFIG
} from './constants'

export default function BookingDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('BookingDetail')
  const bookingId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State management
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showAgreement, setShowAgreement] = useState(false)
  const [showModifyModal, setShowModifyModal] = useState(false)
  const [showCancellationPolicy, setShowCancellationPolicy] = useState(false)
  const [showTrustSafety, setShowTrustSafety] = useState(false)
  const [hasPassword, setHasPassword] = useState<boolean | null>(null)
  const [previousStatus, setPreviousStatus] = useState<string | null>(null)
  const [endTripRedirectChecked, setEndTripRedirectChecked] = useState(false)
  // Active trip banner moved to main dashboard — no longer shown here

  // Messages state
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [messageSending, setMessageSending] = useState(false)
  const [messageError, setMessageError] = useState<string | null>(null)
  const [messageUploading, setMessageUploading] = useState(false)

  // Toast notification state
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null)

  // ✅ FIXED: Load booking data - removed booking from dependencies
  const endTripRedirectingRef = useRef(false)
  const loadBooking = useCallback(async () => {
    try {
      const response = await fetch(`/api/rentals/user-bookings?bookingId=${bookingId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.bookings && data.bookings.length > 0) {
          const newBooking = data.bookings[0]

          // ✅ FIXED: Use functional update to avoid dependency on booking
          setBooking(prevBooking => {
            // Check for status change
            if (prevBooking && prevBooking.status !== newBooking.status) {
              if (newBooking.status === 'CONFIRMED' && prevBooking.status === 'PENDING') {
                // Booking was just approved!
                showApprovalNotification()
              }
            }
            return newBooking
          })

          // Quantum sync: if trip is active, check for drop-off notification
          // (auto-redirect to end trip wizard if started on another platform)
          if (newBooking.tripStartedAt && !newBooking.tripEndedAt && !endTripRedirectingRef.current) {
            try {
              const hsRes = await fetch(`/api/rentals/bookings/${bookingId}/handoff/status`, { credentials: 'include' })
              if (hsRes.ok) {
                const hsData = await hsRes.json()
                if (hsData.dropoffNotification) {
                  endTripRedirectingRef.current = true
                  router.replace(`/rentals/trip/end/${bookingId}`)
                }
              }
            } catch { /* non-blocking */ }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load booking:', error)
      setError(t('failedToLoadBooking'))
    } finally {
      setLoading(false)
    }
  }, [bookingId, router]) // ✅ Only bookingId + router in dependencies

  // Load messages for this booking
  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/rentals/bookings/${bookingId}/messages`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (err) {
      console.error('Failed to load messages:', err)
    } finally {
      setMessagesLoading(false)
    }
  }, [bookingId])

  // Send a message
  const sendMessage = useCallback(async (message: string) => {
    setMessageSending(true)
    setMessageError(null)
    try {
      const response = await fetch(`/api/rentals/bookings/${bookingId}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })
      if (response.ok) {
        await loadMessages()
      } else {
        const data = await response.json()
        setMessageError(data.error || t('failedToSendMessage'))
      }
    } catch {
      setMessageError(t('failedToSendMessage'))
    } finally {
      setMessageSending(false)
    }
  }, [bookingId, loadMessages])

  // Handle file upload in messages
  const handleMessageFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setMessageUploading(true)
    setMessageError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch(`/api/rentals/bookings/${bookingId}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (uploadResponse.ok) {
        const data = await uploadResponse.json()
        await fetch(`/api/rentals/bookings/${bookingId}/messages`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Shared a file: ${file.name}`,
            attachmentUrl: data.url,
            attachmentName: file.name
          })
        })
        await loadMessages()
      } else {
        setMessageError(t('failedToUploadFile'))
      }
    } catch {
      setMessageError(t('failedToUploadFile'))
    } finally {
      setMessageUploading(false)
    }
  }, [bookingId, loadMessages])

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validation = validateFileUpload(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setUploadingFile(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/rentals/bookings/${bookingId}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (response.ok) {
        await loadBooking() // Reload to update verification status
        setToast({ message: t('documentUploadedSuccess'), type: 'success' })
      } else {
        const error = await response.json()
        setError(error.error || t('failedToUploadFile'))
      }
    } catch (error) {
      console.error('Failed to upload file:', error)
      setError(t('failedToUploadRetry'))
    } finally {
      setUploadingFile(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [bookingId, booking, loadBooking])

  // Handle cancellation
  const handleCancellation = useCallback(async (reason: string) => {
    const currentBooking = booking
    if (!currentBooking) return
    
    try {
      const response = await fetch(`/api/rentals/bookings/${bookingId}/cancel`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason || 'Guest requested cancellation',
          cancelledBy: 'guest'
        })
      })
      
      if (response.ok) {
        router.push('/dashboard?cancelled=true')
      } else {
        const error = await response.json()
        setError(error.error || t('failedToCancelBooking'))
      }
    } catch (error) {
      setError(t('failedToCancelBooking'))
    }
  }, [bookingId, booking, router])

  // Copy booking code
  const copyBookingCode = useCallback(() => {
    if (booking?.bookingCode) {
      navigator.clipboard.writeText(booking.bookingCode)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }, [booking])

  // Add to Google Calendar
  const addToGoogleCalendar = useCallback(() => {
    if (!booking) return
    const startDate = new Date(booking.startDate).toISOString().replace(/-|:|\.\d\d\d/g, '')
    const endDate = new Date(booking.endDate).toISOString().replace(/-|:|\.\d\d\d/g, '')
    const details = `Rental: ${booking.car.year} ${booking.car.make} ${booking.car.model}%0ABooking Code: ${booking.bookingCode}%0AHost: ${booking.host.name}`
    const location = encodeURIComponent(booking.pickupLocation)
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Car+Rental+Pickup&dates=${startDate}/${endDate}&details=${details}&location=${location}`
    window.open(url, '_blank')
  }, [booking])

  // Show approval notification
  const showApprovalNotification = () => {
    setToast({ message: t('bookingApproved'), type: 'success' })
  }

  // Check for trip-related URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('new') === '1') {
      // New booking — fire confetti celebration
      setToast({ message: t('bookingSubmitted'), type: 'success' })
      setTimeout(() => {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
        setTimeout(() => {
          confetti({ particleCount: 50, spread: 100, origin: { y: 0.5 } })
        }, 300)
      }, 500)
      window.history.replaceState({}, '', window.location.pathname)
    } else if (urlParams.get('tripStarted') === 'true') {
      setToast({ message: t('tripStartedSuccess'), type: 'success' })
      window.history.replaceState({}, '', window.location.pathname)
    } else if (urlParams.get('tripEnded') === 'true') {
      setToast({ message: t('tripCompletedSuccess'), type: 'success' })
      window.history.replaceState({}, '', window.location.pathname)
    } else if (urlParams.get('verified') === 'true') {
      // Returning from Stripe Identity verification — auto-complete onboarding
      setToast({ message: t('identityVerified'), type: 'success' })
      window.history.replaceState({}, '', window.location.pathname)
      fetch(`/api/rentals/bookings/${bookingId}/onboarding`, {
        method: 'POST',
        credentials: 'include'
      }).then(() => loadBooking()).catch(() => {})
    }
  }, [])

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Status change detection
  useEffect(() => {
    if (booking && previousStatus && previousStatus !== booking.status) {
      if (booking.status === 'CONFIRMED' && previousStatus === 'PENDING') {
        showApprovalNotification()
      }
    }
    setPreviousStatus(booking?.status || null)
  }, [booking?.status, previousStatus])

  // Check if user has set a password (for secure account banner)
  useEffect(() => {
    async function checkPasswordStatus() {
      try {
        const res = await fetch('/api/guest/profile')
        if (res.ok) {
          const data = await res.json()
          setHasPassword(data.profile?.hasPassword ?? null)
        }
      } catch {
        // Non-critical, silently fail
      }
    }
    checkPasswordStatus()
  }, [])

  // ✅ FIXED: Initial load and polling - only depend on bookingId
  // Polls every 30s when tab is active, pauses when hidden
  useEffect(() => {
    loadBooking()
    let bookingInterval: ReturnType<typeof setInterval> | null = null

    const startPolling = () => {
      if (!bookingInterval) {
        bookingInterval = setInterval(loadBooking, 5000) // 5s for quantum sync
      }
    }
    const stopPolling = () => {
      if (bookingInterval) {
        clearInterval(bookingInterval)
        bookingInterval = null
      }
    }

    // Start polling immediately
    startPolling()

    // Pause when tab hidden, resume when visible
    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling()
      } else {
        loadBooking() // Refresh on return
        startPolling()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [bookingId]) // ✅ Only bookingId, loadBooking is stable now

  // Mark end-trip redirect as checked once booking loads
  // (actual redirect logic is in loadBooking poll)
  useEffect(() => {
    if (booking) setEndTripRedirectChecked(true)
  }, [booking?.tripStartedAt, booking?.tripEndedAt, bookingId, router])

  // Active trip banner moved to main dashboard

  // Load and poll messages (skip PENDING unless recruited booking has inline messages)
  // Pauses when tab hidden
  useEffect(() => {
    if (!booking || (booking.status === 'PENDING' && !booking.isRecruitedBooking && !booking.isManualBooking)) return

    loadMessages()
    let messageInterval: ReturnType<typeof setInterval> | null = null

    const startMsgPolling = () => {
      if (!messageInterval) {
        messageInterval = setInterval(loadMessages, MESSAGE_POLLING_INTERVAL)
      }
    }
    const stopMsgPolling = () => {
      if (messageInterval) {
        clearInterval(messageInterval)
        messageInterval = null
      }
    }

    startMsgPolling()
    const handleVis = () => {
      if (document.hidden) { stopMsgPolling() } else { loadMessages(); startMsgPolling() }
    }
    document.addEventListener('visibilitychange', handleVis)

    return () => { stopMsgPolling(); document.removeEventListener('visibilitychange', handleVis) }
  }, [bookingId, booking?.status])

  // Loading state (also wait for end-trip redirect check to avoid flash)
  if (loading || !endTripRedirectChecked) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loadingBooking')}</p>
        </div>
      </div>
    )
  }

  // Not found state
  if (!booking) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('bookingNotFound')}</h1>
          <p className="text-gray-600 mb-6">{t('bookingNotFoundDesc')}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {t('backToDashboard')}
          </button>
        </div>
      </div>
    )
  }

  const timeUntilPickup = getTimeUntilPickup(booking)

  // Inspection phase: onboarding done, trip not started → show only essentials
  // Manual bookings skip onboarding entirely — host manages guest verification
  const isPreTripReady = booking.status === 'CONFIRMED'
    && (!!booking.onboardingCompletedAt || booking.bookingType === 'MANUAL')
    && !booking.tripStartedAt

  // Active trip: show only TripActiveCard + messages, hide everything else
  const isTripActive = !!booking.tripStartedAt && !booking.tripEndedAt

  // Completed trip: clean single-column layout
  const isCompletedTrip = !!booking.tripEndedAt

  // State detection for Booked / Verified / Issues cards
  const vsLower = booking.verificationStatus?.toLowerCase()
  const isVerifiedPending = booking.status === 'PENDING' && (
    vsLower === 'approved' || vsLower === 'verified' || vsLower === 'completed' ||
    booking.documentsVerified === true || booking.manuallyVerifiedByHost === true
  )
  const hasIssues = (
    booking.paymentStatus?.toLowerCase() === 'failed' ||
    vsLower === 'rejected' ||
    (booking as any).disputeCount > 0
  ) && booking.status !== 'ON_HOLD' && booking.status !== 'CANCELLED' && booking.status !== 'MODIFIED'

  // ═══════════════════════════════════════════════════════════════════════════
  // MODIFIED BOOKING — clean page, no progress bar, just the update card
  // ═══════════════════════════════════════════════════════════════════════════
  if (booking.status === 'MODIFIED') {
    const fmtDate = (d: string | Date | null) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
    const fmtMoney = (n: number | null | undefined) => n != null ? `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'

    return (
      <div className="bg-gray-50 dark:bg-gray-950 min-h-screen px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Back button */}
          <a href="/rentals/dashboard/bookings" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
          </a>

          {/* Car photo + Booking Updated header */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <CarPhotoOverlay car={booking.car} />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Booking Updated</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your reservation has been modified by ItWhip.</p>
                </div>
              </div>

              {/* Two-column comparison — always side by side */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-0 mb-5">
                {/* Left: Original Booking */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Previous</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Pickup</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 line-through decoration-gray-400">
                      {fmtDate(booking.startDate)}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 line-through decoration-gray-400">
                      {booking.startTime || ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Return</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 line-through decoration-gray-400">
                      {fmtDate(booking.endDate)}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 line-through decoration-gray-400">
                      {booking.endTime || ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Rate</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 line-through decoration-gray-400">
                      {fmtMoney(booking.dailyRate)}/day
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Total</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 line-through decoration-gray-400">
                      {fmtMoney(booking.totalAmount)}
                    </p>
                  </div>
                  <div className="pt-1 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-[9px] text-gray-400 dark:text-gray-500 font-mono">{booking.bookingCode}</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center px-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>

                {/* Right: Updated Booking */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Updated</p>
                  </div>
                  {booking.replacedByBooking ? (
                    <>
                      <div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Pickup</p>
                        <p className="text-xs font-medium text-gray-900 dark:text-white">
                          {fmtDate(booking.replacedByBooking.startDate)}
                        </p>
                        <p className="text-[10px] text-gray-600 dark:text-gray-300">
                          {booking.replacedByBooking.startTime || ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Return</p>
                        <p className="text-xs font-medium text-gray-900 dark:text-white">
                          {fmtDate(booking.replacedByBooking.endDate)}
                        </p>
                        <p className="text-[10px] text-gray-600 dark:text-gray-300">
                          {booking.replacedByBooking.endTime || ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Rate</p>
                        <p className="text-xs font-medium text-gray-900 dark:text-white">
                          {fmtMoney(booking.replacedByBooking.dailyRate)}/day
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Total</p>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">
                          {fmtMoney(booking.replacedByBooking.totalAmount)}
                        </p>
                      </div>
                      <div className="pt-1 border-t border-blue-200 dark:border-blue-700">
                        <p className="text-[9px] text-blue-500 dark:text-blue-400 font-mono">{booking.replacedByBooking.bookingCode}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">Details coming soon.</p>
                  )}
                </div>
              </div>

              {/* Automatic Refund Breakdown */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <h4 className="text-sm font-semibold text-green-900 dark:text-green-100">Automatic Refund — No Charges Applied</h4>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs text-green-800 dark:text-green-300">
                    All holds and charges from this booking have been automatically reversed. Since we never took the funds, they return to your account right away — in rare cases up to 1–3 business days depending on your bank. Credits and bonus are immediately available to use on your new reservation.
                  </p>

                  <div className="border-t border-green-200 dark:border-green-700 pt-2 mt-2" />

                  {booking.chargeAmount && booking.chargeAmount > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-green-700 dark:text-green-300">
                        {booking.cardBrand && booking.cardLast4
                          ? `Hold released on ${booking.cardBrand} ···${booking.cardLast4}`
                          : 'Card hold released'}
                      </span>
                      <span className="font-medium text-green-700 dark:text-green-200">
                        {fmtMoney(booking.chargeAmount)}
                      </span>
                    </div>
                  )}

                  {booking.creditsApplied > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-green-700 dark:text-green-300">Credits restored</span>
                      <span className="font-medium text-green-700 dark:text-green-200">
                        {fmtMoney(booking.creditsApplied)}
                      </span>
                    </div>
                  )}

                  {booking.bonusApplied > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-green-700 dark:text-green-300">Bonus restored</span>
                      <span className="font-medium text-green-700 dark:text-green-200">
                        {fmtMoney(booking.bonusApplied)}
                      </span>
                    </div>
                  )}

                  {booking.depositAmount > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-green-700 dark:text-green-300">Security deposit released</span>
                      <span className="font-medium text-green-700 dark:text-green-200">
                        {fmtMoney(booking.depositAmount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs sm:text-sm pt-2 border-t border-green-200 dark:border-green-700">
                    <span className="text-green-700 dark:text-green-300 font-semibold">Rebooking bonus added</span>
                    <span className="font-semibold text-green-700 dark:text-green-200">
                      +{fmtMoney(100)}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-green-600 dark:text-green-400 mt-3">
                  Funds are released automatically back to your account. Use them on your new reservation right away. The bonus can cover up to 25% of your new booking total.
                </p>
              </div>

              {/* View New Reservation button */}
              {booking.replacedByBookingId && (
                <a
                  href={`/rentals/dashboard/bookings/${booking.replacedByBookingId}`}
                  className="block w-full text-center py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  View New Reservation
                </a>
              )}
            </div>
          </div>

          {/* Footer */}
          <PolicyFooter booking={booking} compact={true} />
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MANUAL / RECRUITED BOOKING — PRE-CONFIRMATION only
  // After CONFIRMED, manual bookings merge into the standard flow below
  // ═══════════════════════════════════════════════════════════════════════════
  if ((booking.isRecruitedBooking || booking.isManualBooking) && booking.status === 'PENDING') {
    return (
      <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-2 ${
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
          }`}>
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{toast.message}</p>
            <button onClick={() => setToast(null)} className="ml-2 text-white/80 hover:text-white">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 pt-2 pb-3 sm:pt-3 sm:pb-6">
          {/* Header */}
          <div className="mb-2 sm:mb-3 mt-4 sm:mt-5">
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 flex items-center text-sm sm:text-base transition-colors"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                <span className="hidden sm:inline">{t('backToDashboard')}</span>
                <span className="sm:hidden">{t('back')}</span>
              </button>
              <h1 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 ml-auto pr-1">{t('bookingStatus')}</h1>
            </div>
          </div>

          {/* Secure Account Banner */}
          <SecureAccountBanner hasPassword={hasPassword} />

          {/* PENDING manual booking — agreement-first checklist */}
          <ManualBookingGuestView
            booking={booking}
            messages={messages}
            messagesLoading={messagesLoading}
            messageSending={messageSending}
            messageError={messageError}
            messageUploading={messageUploading}
            onSendMessage={sendMessage}
            onFileUpload={handleMessageFileUpload}
            onBookingRefresh={loadBooking}
            onCancel={() => setShowCancelDialog(true)}
            onModify={() => setShowModifyModal(true)}
            onViewAgreement={() => setShowAgreement(true)}
          />
        </div>

        {/* Shared Modals */}
        <ModifyBookingSheet
          booking={booking}
          isOpen={showModifyModal}
          onClose={() => setShowModifyModal(false)}
          onSuccess={() => {
            loadBooking()
            setShowModifyModal(false)
          }}
          extendOnly={isTripActive}
        />
        <CancellationDialog
          booking={booking}
          isOpen={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          onConfirm={(reason) => {
            handleCancellation(reason)
            setShowCancelDialog(false)
          }}
        />
        <RentalAgreementModal
          isOpen={showAgreement}
          onClose={() => setShowAgreement(false)}
          carDetails={{
            id: booking.car.id || '',
            make: booking.car.make,
            model: booking.car.model,
            year: booking.car.year,
            carType: booking.car.type || 'standard',
            seats: booking.car.seats || 4,
            dailyRate: booking.dailyRate,
            city: booking.car?.city || 'Phoenix',
            address: booking.car?.address || booking.pickupLocation || 'Phoenix, AZ',
            host: {
              name: booking.host?.name || '',
              profilePhoto: booking.host?.partnerLogo || booking.host?.profilePhoto || undefined,
              responseTime: booking.host?.responseTime
            }
          }}
          bookingDetails={{
            carId: booking.car.id || '',
            carClass: booking.car.type || 'standard',
            startDate: booking.startDate,
            endDate: booking.endDate,
            startTime: booking.startTime || '10:00 AM',
            endTime: booking.endTime || '10:00 AM',
            deliveryType: booking.pickupType || 'pickup',
            deliveryAddress: booking.exactAddress || booking.car?.address || booking.pickupLocation || 'Phoenix, AZ',
            insuranceType: booking.insuranceType || 'basic',
            addOns: { refuelService: false, additionalDriver: false, extraMiles: false, vipConcierge: false },
            pricing: {
              days: Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)),
              dailyRate: booking.dailyRate,
              basePrice: booking.dailyRate * Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)),
              insurancePrice: booking.insuranceFee,
              deliveryFee: booking.deliveryFee,
              serviceFee: booking.serviceFee,
              taxes: booking.taxes,
              total: booking.totalAmount,
              deposit: booking.depositAmount,
              creditsApplied: booking.creditsApplied || 0,
              bonusApplied: booking.bonusApplied || 0,
              chargeAmount: booking.chargeAmount ?? null,
              breakdown: { refuelService: 0, additionalDriver: 0, extraMiles: 0, vipConcierge: 0 }
            }
          }}
          guestDetails={{
            name: booking.guestName || '',
            email: booking.guestEmail || '',
            bookingCode: booking.bookingCode,
            verificationStatus: (booking.verificationStatus?.toUpperCase() as 'PENDING' | 'APPROVED' | 'REJECTED') || 'PENDING'
          }}
          context="dashboard"
          isDraft={booking.status === 'PENDING'}
          bookingStatus={booking.status}
        />
      </div>
    )
  }

  return (
    <div className={`bg-gray-50 dark:bg-gray-950 overflow-x-hidden ${isTripActive ? 'pb-4' : 'min-h-screen'}`}>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
        }`}>
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{toast.message}</p>
          <button onClick={() => setToast(null)} className="ml-2 text-white/80 hover:text-white">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className={`max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 ${isTripActive ? 'pt-2 pb-1 sm:pt-3 sm:pb-2' : isPreTripReady ? 'py-2 sm:py-3' : 'pt-2 pb-3 sm:pt-3 sm:pb-6'}`}>
        {/* Header */}
        <div className={`${isPreTripReady || isTripActive ? 'mb-1' : 'mb-2 sm:mb-3'} ${isPreTripReady || isTripActive ? 'mt-4' : 'mt-4 sm:mt-5'}`}>
          <div className={`flex items-center gap-3 ${isPreTripReady || isTripActive ? 'mb-1' : 'mb-3'}`}>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 flex items-center text-sm sm:text-base transition-colors"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
              <span className="hidden sm:inline">{t('backToDashboard')}</span>
              <span className="sm:hidden">{t('back')}</span>
            </button>
            <h1 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 ml-auto pr-1">{t('bookingStatus')}</h1>
          </div>
          
          {/* Car info header — hidden for all card-based states (shown in CarPhotoOverlay) */}
          {!isTripActive && !isCompletedTrip && booking.status !== 'ON_HOLD' && booking.status !== 'PENDING' && booking.status !== 'CONFIRMED' && booking.status !== 'CANCELLED' && booking.status !== 'MODIFIED' && booking.status !== 'NO_SHOW' && !hasIssues && (
            <div className="space-y-3 pl-6">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                    {booking.car.year} {booking.car.make}
                  </h1>
                  <div className="flex items-center gap-1.5 ml-auto">
                    {(() => {
                      const vc = getVehicleClass(booking.car.make, booking.car.model, (booking.car.type || null) as any)
                      return vc ? <span className="text-xs font-medium px-2 py-1 rounded-lg border border-gray-300 text-gray-700">{vc}</span> : null
                    })()}
                    {(() => {
                      const ft = formatFuelTypeBadge((booking.car as any).fuelType || null)
                      return ft ? <span className="text-xs font-medium px-2 py-1 rounded-lg border border-gray-300 text-gray-700">{ft}</span> : null
                    })()}
                    {booking.car.transmission && (
                      <span className="text-xs font-medium px-2 py-1 rounded-lg border border-gray-300 text-gray-700 capitalize">
                        {booking.car.transmission.toLowerCase()}
                      </span>
                    )}
                    {booking.car.seats && (
                      <span className="text-xs font-medium px-2 py-1 rounded-lg border border-gray-300 text-gray-700">
                        {t('seats', { count: booking.car.seats })}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm sm:text-base text-gray-500 font-medium">
                  {booking.car.model}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-xs sm:text-sm text-gray-600">{t('booking')}</span>
                  <div className="flex items-center gap-1.5">
                    <code className="font-mono text-xs sm:text-sm bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                      {booking.bookingCode}
                    </code>
                    <button
                      onClick={copyBookingCode}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                      title={t('copyBookingCode')}
                    >
                      {copiedCode ? <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    </button>
                  </div>
                  {timeUntilPickup && booking.status === 'CONFIRMED' && (
                    <span className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full inline-flex items-center ml-auto">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                      {timeUntilPickup}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Secure Account Banner — hidden during active trip */}
        {!isTripActive && <SecureAccountBanner hasPassword={hasPassword} />}

        {/* Active trip banner moved to main dashboard */}

        {/* Status Progression — ManualBookingProgress for recruited bookings, standard for others */}
        {booking.isRecruitedBooking ? (
          <ManualBookingProgress
            status={booking.status}
            paymentType={booking.paymentType || null}
            paymentStatus={booking.paymentStatus || null}
            agreementStatus={booking.agreementStatus || null}
            tripStartedAt={booking.tripStartedAt}
            tripEndedAt={booking.tripEndedAt}
            isExpired={booking.status === 'CONFIRMED' && !booking.tripStartedAt && new Date(booking.endDate) < new Date()}
          />
        ) : (
          <StatusProgression
            status={booking.status}
            tripStatus={booking.tripStatus}
            tripStartedAt={booking.tripStartedAt}
            tripEndedAt={booking.tripEndedAt}
            verificationStatus={booking.verificationStatus || 'pending'}
            paymentStatus={booking.paymentStatus}
            documentsSubmittedAt={typeof booking.documentsSubmittedAt === 'string' ? booking.documentsSubmittedAt : undefined}
            reviewedAt={typeof booking.reviewedAt === 'string' ? booking.reviewedAt : undefined}
            handoffStatus={booking.handoffStatus}
            documentsVerified={booking.documentsVerified}
            manuallyVerifiedByHost={booking.manuallyVerifiedByHost}
            cancelledBy={booking.cancelledBy}
            hideStatusMessage={isTripActive || isCompletedTrip || booking.status === 'PENDING' || booking.status === 'CONFIRMED' || booking.status === 'ON_HOLD' || booking.status === 'CANCELLED' || booking.status === 'MODIFIED' || booking.status === 'NO_SHOW'}
            hideTitle={isTripActive || isCompletedTrip || booking.status === 'PENDING' || booking.status === 'CONFIRMED' || booking.status === 'ON_HOLD' || booking.status === 'NO_SHOW'}
          />
        )}

        {/* Booking Onboarding - show for PENDING (grayed out) — excluded for verified-pending and CONFIRMED (rendered inside their cards) */}
        {booking.status === 'PENDING' && !isVerifiedPending && !booking.onboardingCompletedAt && (
          <div className="mt-3">
            <BookingOnboarding booking={booking} onDocumentUploaded={loadBooking} />
          </div>
        )}

        {/* BOOKED CARD — PENDING status, not yet verified, no issues */}
        {booking.status === 'PENDING' && !isVerifiedPending && !hasIssues && (
          <BookedCard
            booking={booking}
            onCancel={() => setShowCancelDialog(true)}
            onModify={() => setShowModifyModal(true)}
            onAgreement={() => setShowAgreement(true)}
          />
        )}

        {/* VERIFIED CARD — PENDING + docs approved, awaiting fleet confirmation */}
        {isVerifiedPending && !hasIssues && (
          <VerifiedCard
            booking={booking}
            messages={messages}
            messagesLoading={messagesLoading}
            messageSending={messageSending}
            messageError={messageError}
            messageUploading={messageUploading}
            onSendMessage={sendMessage}
            onFileUpload={handleMessageFileUpload}
            onDocumentUploaded={loadBooking}
            onCancel={() => setShowCancelDialog(true)}
            onModify={() => setShowModifyModal(true)}
            onAgreement={() => setShowAgreement(true)}
          />
        )}

        {/* ISSUES CARD — payment failed / verification rejected / dispute */}
        {hasIssues && (
          <IssuesCard
            booking={booking}
            onCancel={() => setShowCancelDialog(true)}
            onModify={() => setShowModifyModal(true)}
            onAgreement={() => setShowAgreement(true)}
          />
        )}

        {/* ON_HOLD card */}
        {booking.status === 'ON_HOLD' && (
          <OnHoldCard
            booking={booking}
            messages={messages}
            messagesLoading={messagesLoading}
            messageSending={messageSending}
            messageError={messageError}
            messageUploading={messageUploading}
            onSendMessage={sendMessage}
            onFileUpload={handleMessageFileUpload}
            onCancel={() => setShowCancelDialog(true)}
            onModify={() => setShowModifyModal(true)}
            onAgreement={() => setShowAgreement(true)}
          />
        )}

        {/* MODIFIED card — booking was converted to manual */}
        {booking.status === 'MODIFIED' && (
          <div className="max-w-3xl mx-auto mt-3 space-y-3">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Booking Updated</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your reservation has been modified by ItWhip. A new booking is being prepared for you.</p>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Any previous charges or holds will be refunded. You&apos;ll receive a new booking confirmation with updated payment options shortly.
                  </p>
                </div>
                {booking.cancellationReason && booking.cancellationReason.includes('REQ-') && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    Reference: {booking.cancellationReason.split('REQ-').pop()?.split(' ')[0] ? `REQ-${booking.cancellationReason.split('REQ-').pop()?.split(' ')[0]}` : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CANCELLED card */}
        {booking.status === 'CANCELLED' && (
          <CancelledCard
            booking={booking}
            messages={messages}
            messagesLoading={messagesLoading}
            messageSending={messageSending}
            messageError={messageError}
            messageUploading={messageUploading}
            onSendMessage={sendMessage}
            onFileUpload={handleFileUpload}
            onViewAgreement={() => setShowAgreement(true)}
          />
        )}

        {/* NO_SHOW card */}
        {booking.status === 'NO_SHOW' && (
          <NoShowCard
            booking={booking}
            messages={messages}
            messagesLoading={messagesLoading}
            messageSending={messageSending}
            messageError={messageError}
            messageUploading={messageUploading}
            onSendMessage={sendMessage}
            onFileUpload={handleFileUpload}
            onViewAgreement={() => setShowAgreement(true)}
          />
        )}

        {/* Sidebar for PENDING — rendered directly below card, not in grid (excluded for verified-pending — inside VerifiedCard) */}
        {booking.status === 'PENDING' && !isVerifiedPending && (
          <div className="mt-3">
            <BookingSidebar
              booking={booking}
              onCancelClick={() => setShowCancelDialog(true)}
              onUploadClick={() => fileInputRef.current?.click()}
              onAddToCalendar={addToGoogleCalendar}
              uploadingFile={uploadingFile}
            />
          </div>
        )}

        {/* Booking Onboarding - MOVED TO after progress bar, see above */}

        {/* CONFIRMED card — pre-trip (onboarding complete or not, trip not started) */}
        {booking.status === 'CONFIRMED' && !booking.tripStartedAt && (
          isPreTripReady ? (
            <TripStartCard
              booking={booking}
              messages={messages}
              messagesLoading={messagesLoading}
              messageSending={messageSending}
              messageError={messageError}
              messageUploading={messageUploading}
              onSendMessage={sendMessage}
              onFileUpload={handleMessageFileUpload}
              onTripStarted={loadBooking}
              onCancel={() => setShowCancelDialog(true)}
              onModify={() => setShowModifyModal(true)}
              onViewAgreement={() => setShowAgreement(true)}
            />
          ) : (
            <ConfirmedCard
              booking={booking}
              messages={messages}
              messagesLoading={messagesLoading}
              messageSending={messageSending}
              messageError={messageError}
              messageUploading={messageUploading}
              onSendMessage={sendMessage}
              onFileUpload={handleMessageFileUpload}
              onDocumentUploaded={loadBooking}
              onCancel={() => setShowCancelDialog(true)}
              onModify={() => setShowModifyModal(true)}
              onAgreement={() => setShowAgreement(true)}
            />
          )
        )}

        {booking.tripStartedAt && !booking.tripEndedAt && (
          <div className="mt-6">
            <TripActiveCard
              booking={booking}
              onExtend={() => setShowModifyModal(true)}
              onViewAgreement={() => setShowAgreement(true)}
            />
          </div>
        )}

        {/* Main Content — skip for CANCELLED / NO_SHOW (their cards handle everything) */}
        {(booking.status === 'CANCELLED' || booking.status === 'MODIFIED' || booking.status === 'NO_SHOW') ? null : isCompletedTrip ? (
          <CompletedCard
            booking={booking}
            messages={messages}
            messagesLoading={messagesLoading}
            messageSending={messageSending}
            messageError={messageError}
            messageUploading={messageUploading}
            onSendMessage={sendMessage}
            onFileUpload={handleMessageFileUpload}
            onViewAgreement={() => setShowAgreement(true)}
          />
        ) : isTripActive ? (
          /* Active trip: collapsible messages */
          <>
            {booking.status !== 'CANCELLED' && booking.status !== 'MODIFIED' && (
              <div className="mt-5">
                <MessagesPanel
                  bookingId={bookingId}
                  messages={messages}
                  loading={messagesLoading}
                  sending={messageSending}
                  error={messageError}
                  onSendMessage={sendMessage}
                  onFileUpload={handleMessageFileUpload}
                  uploadingFile={messageUploading}
                />
              </div>
            )}
            <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-3">
              Need help? <a href="tel:+18557030806" className="font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">(855) 703-0806</a>
            </p>
          </>
        ) : (
          <div className={`grid gap-6 ${booking.status === 'PENDING' || booking.status === 'ON_HOLD' || booking.status === 'CONFIRMED' ? '' : 'mt-4'} ${booking.status === 'PENDING' || booking.status === 'ON_HOLD' || booking.status === 'CONFIRMED' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
            {/* Left Column - Details (hidden for PENDING/ON_HOLD/CONFIRMED since content is in cards) */}
            {booking.status !== 'PENDING' && booking.status !== 'ON_HOLD' && booking.status !== 'CONFIRMED' && (
              <div className={isPreTripReady ? '' : 'lg:col-span-2 space-y-6'}>
                <BookingDetails
                  booking={booking}
                  messages={messages}
                  onUploadClick={() => fileInputRef.current?.click()}
                  uploadingFile={uploadingFile}
                  isPreTripReady={isPreTripReady}
                />

                {/* Messages Panel - hidden during inspection phase and ON_HOLD */}
                {!isPreTripReady && booking.status !== 'CANCELLED' && booking.status !== 'MODIFIED' && (
                  <MessagesPanel
                    bookingId={bookingId}
                    messages={messages}
                    loading={messagesLoading}
                    sending={messageSending}
                    error={messageError}
                    onSendMessage={sendMessage}
                    onFileUpload={handleMessageFileUpload}
                    uploadingFile={messageUploading}
                  />
                )}
              </div>
            )}

            {/* Right Column - Sidebar (skip for PENDING/CONFIRMED/ON_HOLD — rendered in card components) */}
            {booking.status !== 'PENDING' && booking.status !== 'CONFIRMED' && booking.status !== 'ON_HOLD' && (
              <BookingSidebar
                booking={booking}
                onCancelClick={() => setShowCancelDialog(true)}
                onUploadClick={() => fileInputRef.current?.click()}
                onAddToCalendar={addToGoogleCalendar}
                uploadingFile={uploadingFile}
              />
            )}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept={FILE_UPLOAD_CONFIG.acceptedFormats}
        />

        {/* Modify Booking Sheet */}
        <ModifyBookingSheet
          booking={booking}
          isOpen={showModifyModal}
          onClose={() => setShowModifyModal(false)}
          onSuccess={() => {
            loadBooking()
            setShowModifyModal(false)
          }}
          extendOnly={isTripActive}
        />

        {/* Cancellation Dialog */}
        <CancellationDialog
          booking={booking}
          isOpen={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          onConfirm={(reason) => {
            handleCancellation(reason)
            setShowCancelDialog(false)
          }}
        />

        {/* Policy Footer — hidden during inspection phase, active trip & ON_HOLD */}
        {!isPreTripReady && !isTripActive && booking.status !== 'ON_HOLD' && (
          <PolicyFooter booking={booking} compact={booking.status === 'PENDING' || isCompletedTrip || booking.status === 'CANCELLED' || booking.status === 'MODIFIED' || booking.status === 'NO_SHOW'} />
        )}

        {/* Legal footer — always visible (matches mobile app) */}
        <MinimalLegalFooter />

        {/* Cancellation Policy & Trust Safety Modals (for inspection phase) */}
        <CancellationPolicyModal
          isOpen={showCancellationPolicy}
          onClose={() => setShowCancellationPolicy(false)}
        />
        <TrustSafetyModal
          isOpen={showTrustSafety}
          onClose={() => setShowTrustSafety(false)}
        />

        {/* Rental Agreement Modal (triggered from StatusProgression) */}
        <RentalAgreementModal
          isOpen={showAgreement}
          onClose={() => setShowAgreement(false)}
          carDetails={{
            id: booking.car.id || '',
            make: booking.car.make,
            model: booking.car.model,
            year: booking.car.year,
            carType: booking.car.type || 'standard',
            seats: booking.car.seats || 4,
            dailyRate: booking.dailyRate,
            city: booking.car?.city || 'Phoenix',
            address: booking.car?.address || booking.pickupLocation || 'Phoenix, AZ',
            host: {
              name: booking.host?.name || '',
              profilePhoto: booking.host?.partnerLogo || booking.host?.profilePhoto || undefined,
              responseTime: booking.host?.responseTime
            }
          }}
          bookingDetails={{
            carId: booking.car.id || '',
            carClass: booking.car.type || 'standard',
            startDate: booking.startDate,
            endDate: booking.endDate,
            startTime: booking.startTime || '10:00 AM',
            endTime: booking.endTime || '10:00 AM',
            deliveryType: booking.pickupType || 'pickup',
            deliveryAddress: booking.exactAddress || booking.car?.address || booking.pickupLocation || 'Phoenix, AZ',
            insuranceType: booking.insuranceType || 'basic',
            addOns: { refuelService: false, additionalDriver: false, extraMiles: false, vipConcierge: false },
            pricing: {
              days: Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)),
              dailyRate: booking.dailyRate,
              basePrice: booking.dailyRate * Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)),
              insurancePrice: booking.insuranceFee,
              deliveryFee: booking.deliveryFee,
              serviceFee: booking.serviceFee,
              taxes: booking.taxes,
              total: booking.totalAmount,
              deposit: booking.depositAmount,
              creditsApplied: booking.creditsApplied || 0,
              bonusApplied: booking.bonusApplied || 0,
              chargeAmount: booking.chargeAmount ?? null,
              breakdown: { refuelService: 0, additionalDriver: 0, extraMiles: 0, vipConcierge: 0 }
            }
          }}
          guestDetails={{
            name: booking.guestName || '',
            email: booking.guestEmail || '',
            bookingCode: booking.bookingCode,
            verificationStatus: (booking.verificationStatus?.toUpperCase() as 'PENDING' | 'APPROVED' | 'REJECTED') || 'PENDING'
          }}
          context="dashboard"
          isDraft={booking.status === 'PENDING'}
          bookingStatus={booking.status}
        />
      </div>
    </div>
  )
}