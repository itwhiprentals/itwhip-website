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
import { BookedCard, VerifiedCard, IssuesCard, OnHoldCard, ConfirmedCard, CompletedCard } from './components/cards'
import { MinimalLegalFooter } from './components/cards/SharedCardSections'
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

  // State detection for Booked / Verified / Issues cards
  const vsLower = booking.verificationStatus?.toLowerCase()
  const isVerifiedPending = booking.status === 'PENDING' && (
    vsLower === 'approved' || vsLower === 'verified' || vsLower === 'completed'
  )
  const hasIssues = (
    booking.paymentStatus?.toLowerCase() === 'failed' ||
    vsLower === 'rejected' ||
    (booking as any).disputeCount > 0
  ) && booking.status !== 'ON_HOLD' && booking.status !== 'CANCELLED'

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
          {!isTripActive && !isCompletedTrip && booking.status !== 'ON_HOLD' && booking.status !== 'PENDING' && booking.status !== 'CONFIRMED' && !hasIssues && (
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
          hideStatusMessage={isTripActive || isCompletedTrip || booking.status === 'PENDING' || booking.status === 'CONFIRMED' || booking.status === 'ON_HOLD'}
          hideTitle={isTripActive || isCompletedTrip || booking.status === 'PENDING' || booking.status === 'CONFIRMED' || booking.status === 'ON_HOLD'}
        />

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

        {/* Main Content */}
        {isCompletedTrip ? (
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
                {!isPreTripReady && booking.status !== 'CANCELLED' && (
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
          <PolicyFooter booking={booking} compact={booking.status === 'PENDING' || isCompletedTrip} />
        )}

        {/* Minimal legal footer for ON_HOLD */}
        {booking.status === 'ON_HOLD' && (
          <MinimalLegalFooter />
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