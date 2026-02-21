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
import { ChevronLeft, XCircle, CheckCircle, Copy, Clock, MessageSquare, Calendar, User, MapPin, Car } from './components/Icons'
import StatusProgression from '../../../components/StatusProgression'
// Import Trip Cards
import { TripStartCard } from './components/trip/TripStartCard'
import { TripActiveCard } from './components/trip/TripActiveCard'
import { TripEndCard } from './components/trip/TripEndCard'
import GuestReviewModal from '../../../components/review/GuestReviewModal'
import { BookingOnboarding } from './components/BookingOnboarding'
import { ModifyBookingSheet } from './components/ModifyBookingSheet'
import { SecureAccountBanner } from './components/SecureAccountBanner'
import RentalAgreementModal from '../../../components/modals/RentalAgreementModal'
import { getVehicleClass, formatFuelTypeBadge } from '@/app/lib/utils/vehicleClassification'
import {
  getTimeUntilPickup, validateFileUpload, formatDate, formatCurrency
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

  // Messages state
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [messageSending, setMessageSending] = useState(false)
  const [messageError, setMessageError] = useState<string | null>(null)
  const [messageUploading, setMessageUploading] = useState(false)

  // Toast notification state
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null)

  // ✅ FIXED: Load booking data - removed booking from dependencies
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
        }
      }
    } catch (error) {
      console.error('Failed to load booking:', error)
      setError(t('failedToLoadBooking'))
    } finally {
      setLoading(false)
    }
  }, [bookingId]) // ✅ Only bookingId in dependencies

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
  useEffect(() => {
    loadBooking()

    // Poll for booking updates
    const bookingInterval = setInterval(() => {
      loadBooking()
    }, BOOKING_POLLING_INTERVAL)

    return () => {
      clearInterval(bookingInterval)
    }
  }, [bookingId]) // ✅ Only bookingId, loadBooking is stable now

  // Auto-redirect to end trip page if guest already notified host
  useEffect(() => {
    // Don't mark checked until booking is loaded — prevents premature render
    if (!booking) return
    if (!booking.tripStartedAt || booking.tripEndedAt) {
      setEndTripRedirectChecked(true)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/rentals/bookings/${bookingId}/handoff/status`, {
          credentials: 'include',
        })
        if (!res.ok || cancelled) {
          if (!cancelled) setEndTripRedirectChecked(true)
          return
        }
        const data = await res.json()
        if (data.dropoffNotification && !cancelled) {
          router.replace(`/rentals/trip/end/${bookingId}`)
          return // Don't set checked — we're redirecting
        }
      } catch {
        // Silently fail — show normal booking detail
      }
      if (!cancelled) setEndTripRedirectChecked(true)
    })()
    return () => { cancelled = true }
  }, [booking?.tripStartedAt, booking?.tripEndedAt, bookingId, router])

  // Load and poll messages only when booking is confirmed (not PENDING/CANCELLED)
  useEffect(() => {
    if (!booking || booking.status === 'PENDING' || booking.status === 'CANCELLED') return

    loadMessages()
    const messageInterval = setInterval(() => {
      loadMessages()
    }, MESSAGE_POLLING_INTERVAL)

    return () => clearInterval(messageInterval)
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
  const isPreTripReady = booking.status === 'CONFIRMED'
    && !!booking.onboardingCompletedAt
    && !booking.tripStartedAt

  // Active trip: show only TripActiveCard + messages, hide everything else
  const isTripActive = !!booking.tripStartedAt && !booking.tripEndedAt

  // Completed trip: clean single-column layout
  const isCompletedTrip = !!booking.tripEndedAt

  return (
    <div className={`bg-gray-50 dark:bg-gray-950 ${isTripActive ? 'pb-4' : 'min-h-screen'}`}>
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

      <div className={`max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 ${isTripActive ? 'pt-2 pb-1 sm:pt-3 sm:pb-2' : isPreTripReady ? 'py-2 sm:py-3' : 'py-3 sm:py-6'}`}>
        {/* Header */}
        <div className={`${isPreTripReady || isTripActive ? 'mb-1' : 'mb-4 sm:mb-6'} ${isPreTripReady || isTripActive ? 'mt-4' : 'mt-4 sm:mt-2'}`}>
          <div className={`flex items-center justify-between ${isPreTripReady || isTripActive ? 'mb-1' : 'mb-3'}`}>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 flex items-center text-sm sm:text-base transition-colors"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
              <span className="hidden sm:inline">{t('backToDashboard')}</span>
              <span className="sm:hidden">{t('back')}</span>
            </button>
            <h1 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">{t('bookingStatus')}</h1>
          </div>
          
          {/* Car info header — hidden during inspection phase, active trip, completed trip & ON_HOLD (shown in card photo) */}
          {!isPreTripReady && !isTripActive && !isCompletedTrip && booking.status !== 'ON_HOLD' && (
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

        {/* Status Progression — always visible */}
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
          onCancel={!isPreTripReady && !isTripActive && booking.status !== 'ON_HOLD' && (booking.status === 'PENDING' || booking.status === 'CONFIRMED') ? () => setShowCancelDialog(true) : undefined}
          onModify={!isPreTripReady && !isTripActive && booking.status !== 'ON_HOLD' && ['PENDING', 'CONFIRMED'].includes(booking.status) ? () => setShowModifyModal(true) : undefined}
          onViewAgreement={!isPreTripReady && !isTripActive && booking.status !== 'ON_HOLD' && !isCompletedTrip ? () => setShowAgreement(true) : undefined}
          hideStatusMessage={isPreTripReady || isTripActive || isCompletedTrip}
          hideTitle={isPreTripReady || isTripActive}
        />

        {/* Payment hold alert — PENDING only */}
        {booking.status === 'PENDING' && (
          <div className="mt-4">
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('paymentOnHold')}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {t('paymentOnHoldDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ON_HOLD card — car photo with info overlay + verify button, matching CONFIRMED layout */}
        {booking.status === 'ON_HOLD' && (
          <div className="mt-3">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Car photo with info overlay */}
              {booking.car.photos && booking.car.photos.length > 0 && (
                <div className="relative">
                  <img
                    src={booking.car.photos[0].url}
                    alt={`${booking.car.make} ${booking.car.model}`}
                    className="w-full h-52 sm:h-60 object-cover object-[center_35%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  {/* Car info overlay — bottom left */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white text-lg font-bold drop-shadow-lg">
                      {booking.car.year} {booking.car.make}
                    </h3>
                    <p className="text-white/90 text-sm font-medium drop-shadow-lg">
                      {booking.car.model}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {(() => {
                        const vc = getVehicleClass(booking.car.make, booking.car.model, (booking.car.type || null) as any)
                        return vc ? <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/20 text-white backdrop-blur-sm">{vc}</span> : null
                      })()}
                      {(() => {
                        const ft = formatFuelTypeBadge((booking.car as any).fuelType || null)
                        return ft ? <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/20 text-white backdrop-blur-sm">{ft}</span> : null
                      })()}
                      {booking.car.transmission && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/20 text-white backdrop-blur-sm capitalize">
                          {booking.car.transmission.toLowerCase()}
                        </span>
                      )}
                      {booking.car.seats && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/20 text-white backdrop-blur-sm">
                          {t('seats', { count: booking.car.seats })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* Verify identity content */}
              <div className="p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                  {t('verificationHoldDesc')}
                </p>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/identity/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                          returnUrl: `${window.location.origin}/rentals/dashboard/bookings/${booking.id}?verified=true`
                        })
                      })
                      const data = await response.json()
                      if (!response.ok) throw new Error(data.error || 'Failed to start verification')
                      if (data.url) window.location.href = data.url
                    } catch (err) {
                      console.error('Stripe Identity error:', err)
                    }
                  }}
                  className="mt-3 w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {t('verifyIdentity')}
                </button>
              </div>
              {/* Trip Details — pickup/dropoff layout matching TripStartCard */}
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('confirmationNumber')}</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{booking.bookingCode}</p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-3">{t('pickup')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(booking.startDate)} at {booking.startTime}</p>
                    <p className="text-xs text-gray-500 italic mt-3">{t('completeVerificationForLocation')}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0 pl-4">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('statusLabel')}</p>
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase">{t('onHoldBadge')}</p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-3">{t('dropoff')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(booking.endDate)} at {booking.endTime}</p>
                    <p className="text-xs text-gray-500 italic mt-3">{t('completeVerificationForLocation')}</p>
                  </div>
                </div>
              </div>
              {/* Cancel / Modify / Agreement buttons */}
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setShowCancelDialog(true)}
                    className="flex items-center justify-center gap-1.5 px-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    {t('cancel')}
                  </button>
                  <button
                    onClick={() => setShowModifyModal(true)}
                    className="flex items-center justify-center gap-1.5 px-2 py-2 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    {t('modify')}
                  </button>
                  <button
                    onClick={() => setShowAgreement(true)}
                    className="flex items-center justify-center gap-1.5 px-2 py-2 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    {t('agreement')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking Onboarding - show for PENDING (grayed out) and CONFIRMED (active) */}
        {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && !booking.onboardingCompletedAt && (
          <div className="mt-6">
            <BookingOnboarding booking={booking} onDocumentUploaded={loadBooking} />
          </div>
        )}

        {/* Trip Management Cards - only after onboarding complete */}
        {booking.status === 'CONFIRMED' && !booking.tripStartedAt && booking.onboardingCompletedAt && (
          <div className="mt-3">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[55vh] sm:min-h-0 flex flex-col">
              {/* Car photo with centered Start Inspection circle */}
              {booking.car.photos && booking.car.photos.length > 0 && (
                <div className="relative">
                  <img
                    src={booking.car.photos[0].url}
                    alt={`${booking.car.make} ${booking.car.model}`}
                    className="w-full h-44 sm:h-52 object-cover object-[center_35%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Pulsing ring */}
                    <div className="absolute w-24 h-24 rounded-full border-2 border-white/30 animate-ping" style={{ animationDuration: '2s' }} />
                    <div className="absolute w-28 h-28 rounded-full border border-white/15 animate-pulse" />
                    <button
                      onClick={() => {
                        const card = document.querySelector('[data-trip-start]') as HTMLElement
                        card?.click()
                      }}
                      className="relative w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center
                        bg-gradient-to-br from-green-400 via-green-500 to-green-600
                        hover:from-green-300 hover:via-green-400 hover:to-green-500
                        active:scale-90 transition-all duration-300 ease-out
                        shadow-[0_6px_24px_rgba(0,0,0,0.4),inset_0_2px_3px_rgba(255,255,255,0.3),0_0_30px_rgba(34,197,94,0.35)]
                        hover:shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_2px_3px_rgba(255,255,255,0.4),0_0_45px_rgba(34,197,94,0.5)]
                        hover:scale-110
                        ring-[3px] ring-white/80 ring-offset-2 ring-offset-transparent
                        backdrop-blur-sm"
                    >
                      <svg className="w-6 h-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-[7px] font-extrabold text-white uppercase tracking-[0.1em] mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
                        {t('inspect')}
                      </span>
                      {/* Glossy highlight */}
                      <div className="absolute top-0.5 left-2 right-2 h-6 rounded-full bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
                    </button>
                  </div>
                </div>
              )}
              <TripStartCard
                booking={booking}
                onTripStarted={loadBooking}
                onCancel={() => setShowCancelDialog(true)}
                onModify={() => setShowModifyModal(true)}
                onViewAgreement={() => setShowAgreement(true)}
                onShowCancellationPolicy={() => setShowCancellationPolicy(true)}
                onShowTrustSafety={() => setShowTrustSafety(true)}
                noWrapper
              />
            </div>

          </div>
        )}
        {booking.status === 'CONFIRMED' && !booking.tripStartedAt && !booking.onboardingCompletedAt && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('completeOnboardingToStart')}</p>
          </div>
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

        {/* Main Content */}
        {isCompletedTrip ? (
          /* Completed trip: clean single-column layout */
          <div className="max-w-3xl mx-auto mt-6 space-y-6">
            {/* Trip Card with Car Photo */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {booking.car.photos && booking.car.photos.length > 0 && (
                <div className="relative">
                  <img
                    src={booking.car.photos[0].url}
                    alt={`${booking.car.make} ${booking.car.model}`}
                    className="w-full h-44 sm:h-52 object-cover object-[center_35%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <h2 className="text-lg font-bold text-white drop-shadow-sm">
                      {booking.car.year} {booking.car.make} {booking.car.model}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      {(() => {
                        const vc = getVehicleClass(booking.car.make, booking.car.model, (booking.car.type || null) as any)
                        return vc ? <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/20 text-white backdrop-blur-sm">{vc}</span> : null
                      })()}
                      {booking.car.transmission && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/20 text-white backdrop-blur-sm capitalize">
                          {booking.car.transmission.toLowerCase()}
                        </span>
                      )}
                      {booking.car.seats && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/20 text-white backdrop-blur-sm">
                          {t('seats', { count: booking.car.seats })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="p-4">
                {/* Trip Completed badge + booking code */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('tripCompletedTitle')}</p>
                      <p className="text-xs text-gray-500">{t('thankYouForChoosing')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">{booking.bookingCode}</code>
                    <button onClick={copyBookingCode} className="text-gray-400 hover:text-gray-600 transition-colors p-0.5" title={t('copyBookingCode')}>
                      {copiedCode ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Trip Stats Grid */}
                {(() => {
                  const tripDuration = booking.tripStartedAt && booking.tripEndedAt
                    ? (() => {
                        const start = new Date(booking.tripStartedAt)
                        const end = new Date(booking.tripEndedAt)
                        const diff = end.getTime() - start.getTime()
                        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                        if (days > 0) return `${days}d ${hours}h`
                        return `${hours}h`
                      })()
                    : null
                  const totalMiles = booking.startMileage && booking.endMileage
                    ? booking.endMileage - booking.startMileage
                    : null
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{t('dates')}</p>
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{formatDate(booking.startDate)} <span className="text-gray-500 font-normal">{booking.startTime}</span></p>
                        <p className="text-xs text-gray-500">{t('to')} {formatDate(booking.endDate)} <span className="text-gray-500 font-normal">{booking.endTime}</span></p>
                      </div>
                      {tripDuration && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{t('durationLabel')}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{tripDuration}</p>
                        </div>
                      )}
                      {totalMiles !== null && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{t('milesDriven')}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{totalMiles} mi</p>
                        </div>
                      )}
                      {booking.fuelLevelStart && booking.fuelLevelEnd && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{t('fuelLabel')}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {booking.fuelLevelStart} → {booking.fuelLevelEnd}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })()}

                {/* Host Info */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{t('host')}: {booking.host.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-yellow-500 text-xs">★</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">{booking.host.rating.toFixed(1)}</span>
                        <span className="text-gray-300 dark:text-gray-600 text-xs">•</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">~{booking.host.responseTime}min</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rate Your Experience */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <GuestReviewModal
                    booking={{
                      id: booking.id,
                      car: { make: booking.car.make, model: booking.car.model, year: booking.car.year },
                      host: { name: booking.host?.name || 'Host' },
                      tripStartedAt: booking.tripStartedAt,
                      tripEndedAt: booking.tripEndedAt,
                      tripStatus: booking.tripStatus,
                      fraudulent: booking.fraudulent,
                      guestName: booking.guestName,
                      guestEmail: booking.guestEmail
                    }}
                    guestToken={booking.guestToken || ''}
                  />
                </div>
              </div>
            </div>

            {/* Charges Status */}
            {(() => {
              let extraCharges: any = null
              if (booking.extras) {
                try { extraCharges = JSON.parse(booking.extras) } catch {}
              }
              if (extraCharges && extraCharges.total > 0) {
                return (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-3">{t('additionalChargesTitle')}</h4>
                    <div className="space-y-2">
                      {extraCharges.breakdown?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-amber-800 dark:text-amber-300">{item.label}</span>
                          <span className="font-medium text-amber-900 dark:text-amber-200">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-amber-200 dark:border-amber-700">
                        <div className="flex justify-between font-medium">
                          <span className="text-amber-900 dark:text-amber-200">{t('tripTotal')}</span>
                          <span className="text-amber-900 dark:text-amber-200">{formatCurrency(extraCharges.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
              // Review-aware deposit status
              const reviewStatus = booking.hostFinalReviewStatus
              if (reviewStatus === 'PENDING_REVIEW') {
                return (
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-200">{t('hostReviewingTrip')}</p>
                        <p className="text-xs text-blue-800 dark:text-blue-300 mt-1">{t('depositReleaseWithin24h')}</p>
                      </div>
                    </div>
                  </div>
                )
              }
              if (reviewStatus === 'CLAIM_FILED') {
                return (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <div className="flex items-center">
                      <XCircle className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{t('hostReportedIssue')}</p>
                        <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">{t('depositOnHoldPendingReview')}</p>
                      </div>
                    </div>
                  </div>
                )
              }
              // APPROVED, AUTO_APPROVED, or null (legacy)
              return (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-900 dark:text-green-200">{t('noAdditionalChargesTitle')}</p>
                      <p className="text-xs text-green-800 dark:text-green-300 mt-1">{t('depositReleaseMessage')}</p>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Payment Summary — collapsible */}
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 select-none">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('paymentSummary')}</span>
                <svg className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-2">
                <BookingSidebar
                  booking={booking}
                  onCancelClick={() => {}}
                  onUploadClick={() => {}}
                  onAddToCalendar={() => {}}
                  uploadingFile={false}
                />
              </div>
            </details>

            {/* Messages — collapsible, locked after trip */}
            {booking.status !== 'CANCELLED' && (
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 select-none">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('messages')}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{t('messagesLocked')}</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-2">
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
              </details>
            )}

            {/* Receipt Links */}
            <div className="text-center">
              <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">{t('downloadReceipt')}</button>
              <span className="mx-2 text-gray-400 dark:text-gray-600">•</span>
              <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">{t('emailReceipt')}</button>
            </div>
          </div>
        ) : isTripActive ? (
          /* Active trip: collapsible messages */
          <>
            {booking.status !== 'CANCELLED' && (
              <details className="mt-3 group">
                <summary className="flex items-center justify-between cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 select-none">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Messages</span>
                  <svg className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-2">
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
              </details>
            )}
            <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-3">
              Need help? <a href="tel:+18557030806" className="font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">(855) 703-0806</a>
            </p>
          </>
        ) : (
          <div className={`grid gap-6 ${booking.status === 'ON_HOLD' ? 'mt-3' : 'mt-6'} ${isPreTripReady ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
            {/* Left Column - Details */}
            <div className={isPreTripReady ? '' : 'lg:col-span-2 space-y-6'}>
              <BookingDetails
                booking={booking}
                messages={messages}
                onUploadClick={() => fileInputRef.current?.click()}
                uploadingFile={uploadingFile}
                isPreTripReady={isPreTripReady}
              />

              {/* Messages Panel - hidden during inspection phase and ON_HOLD */}
              {!isPreTripReady && booking.status !== 'PENDING' && booking.status !== 'CANCELLED' && booking.status !== 'ON_HOLD' && (
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

            {/* Right Column - Sidebar (hidden during inspection phase) */}
            {!isPreTripReady && (
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
        {!isPreTripReady && !isTripActive && booking.status !== 'ON_HOLD' && <PolicyFooter booking={booking} />}

        {/* Minimal legal footer for ON_HOLD */}
        {booking.status === 'ON_HOLD' && (
          <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-3xl mx-auto mb-2">
              {t('footerLegal')}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {t('copyright')}
            </p>
          </div>
        )}

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
              profilePhoto: booking.host?.profilePhoto ?? undefined,
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
        />
      </div>
    </div>
  )
}