// app/(guest)/rentals/dashboard/bookings/[id]/page.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Booking } from './types'
import { BookingDetails } from './components/BookingDetails'
import { BookingSidebar } from './components/BookingSidebar'
import { PolicyFooter, CancellationDialog } from './components/BookingModals'
import { ChevronLeft, XCircle, CheckCircle, Copy, Clock, MessageSquare } from './components/Icons'
import StatusProgression from '../../../components/StatusProgression'
// Import Trip Cards
import { TripStartCard } from './components/trip/TripStartCard'
import { TripActiveCard } from './components/trip/TripActiveCard'
import { TripEndCard } from './components/trip/TripEndCard'
import { BookingOnboarding } from './components/BookingOnboarding'
import { ModifyBookingSheet } from './components/ModifyBookingSheet'
import { SecureAccountBanner } from './components/SecureAccountBanner'
import RentalAgreementModal from '../../../components/modals/RentalAgreementModal'
import {
  getTimeUntilPickup, validateFileUpload
} from './utils/helpers'
import { 
  BOOKING_POLLING_INTERVAL, 
  FILE_UPLOAD_CONFIG 
} from './constants'

export default function BookingDetailsPage() {
  const params = useParams()
  const router = useRouter()
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
  const [hasPassword, setHasPassword] = useState<boolean | null>(null)
  const [previousStatus, setPreviousStatus] = useState<string | null>(null)

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
      setError('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }, [bookingId]) // ✅ Only bookingId in dependencies

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
        alert('Document uploaded successfully!')
      } else {
        const error = await response.json()
        setError(error.error || 'Failed to upload file')
      }
    } catch (error) {
      console.error('Failed to upload file:', error)
      setError('Failed to upload file. Please try again.')
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
        setError(error.error || 'Failed to cancel booking')
      }
    } catch (error) {
      setError('Failed to cancel booking')
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
    alert('Great news! Your booking has been approved and confirmed!')
  }

  // Check for trip-related URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('tripStarted') === 'true') {
      alert('Trip started successfully! Drive safely.')
    } else if (urlParams.get('tripEnded') === 'true') {
      alert('Trip completed successfully! Thank you for choosing ItWhip.')
    }
  }, [])

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

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your booking...</p>
        </div>
      </div>
    )
  }

  // Not found state
  if (!booking) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking not found</h1>
          <p className="text-gray-600 mb-6">We couldn't find this booking. It may have been cancelled or the link is incorrect.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const timeUntilPickup = getTimeUntilPickup(booking)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900 mb-3 flex items-center text-sm sm:text-base transition-colors"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </button>
          
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                  {booking.car.year} {booking.car.make} {booking.car.model}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-xs sm:text-sm text-gray-600">Booking</span>
                  <div className="flex items-center gap-1.5">
                    <code className="font-mono text-xs sm:text-sm bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                      {booking.bookingCode}
                    </code>
                    <button
                      onClick={copyBookingCode}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                      title="Copy booking code"
                    >
                      {copiedCode ? <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              {timeUntilPickup && booking.status === 'CONFIRMED' && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full inline-flex items-center">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                    {timeUntilPickup}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secure Account Banner */}
        <SecureAccountBanner hasPassword={hasPassword} />

        {/* Status Progression Component */}
        <StatusProgression
          status={booking.status}
          tripStatus={booking.tripStatus}
          tripStartedAt={booking.tripStartedAt}
          tripEndedAt={booking.tripEndedAt}
          verificationStatus={booking.verificationStatus || 'pending'}
          paymentStatus={booking.paymentStatus}
          documentsSubmittedAt={typeof booking.documentsSubmittedAt === 'string' ? booking.documentsSubmittedAt : undefined}
          reviewedAt={typeof booking.reviewedAt === 'string' ? booking.reviewedAt : undefined}
          onCancel={booking.status === 'PENDING' || booking.status === 'CONFIRMED' ? () => setShowCancelDialog(true) : undefined}
          onModify={booking.status === 'PENDING' ? () => setShowModifyModal(true) : undefined}
          onViewAgreement={() => setShowAgreement(true)}
        />

        {/* Payment hold alert — PENDING only */}
        {booking.status === 'PENDING' && (
          <div className="mt-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-gray-200 rounded-full flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Payment on hold</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Your payment will be confirmed after the booking is approved. No charges have been made yet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking Onboarding (grayed out when PENDING, active when CONFIRMED) */}
        {(booking.status === 'PENDING' || (booking.status === 'CONFIRMED' && !booking.onboardingCompletedAt)) && (
          <div className="mt-6">
            <BookingOnboarding booking={booking} onDocumentUploaded={loadBooking} />
          </div>
        )}

        {/* Trip Management Cards - only after onboarding complete */}
        {booking.status === 'CONFIRMED' && !booking.tripStartedAt && booking.onboardingCompletedAt && (
          <div className="mt-6">
            <TripStartCard booking={booking} onTripStarted={loadBooking} />
          </div>
        )}
        {booking.status === 'CONFIRMED' && !booking.tripStartedAt && !booking.onboardingCompletedAt && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-sm text-gray-500">Complete onboarding above to start your trip</p>
          </div>
        )}

        {booking.tripStartedAt && !booking.tripEndedAt && (
          <div className="mt-6">
            <TripActiveCard booking={booking} />
          </div>
        )}

        {booking.tripEndedAt && (
          <div className="mt-6">
            <TripEndCard booking={booking} guestToken={booking.guestToken || ''} />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            <BookingDetails
              booking={booking}
              messages={[]}
              onUploadClick={() => fileInputRef.current?.click()}
              uploadingFile={uploadingFile}
            />
          </div>

          {/* Right Column - Sidebar */}
          <BookingSidebar
            booking={booking}
            onCancelClick={() => setShowCancelDialog(true)}
            onUploadClick={() => fileInputRef.current?.click()}
            onAddToCalendar={addToGoogleCalendar}
            uploadingFile={uploadingFile}
          />
        </div>

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

        {/* Policy Footer */}
        <PolicyFooter booking={booking} />

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
            city: booking.pickupLocation
          }}
          bookingDetails={{
            carId: booking.car.id || '',
            carClass: booking.car.type || 'standard',
            startDate: booking.startDate,
            endDate: booking.endDate,
            startTime: booking.startTime || '10:00 AM',
            endTime: booking.endTime || '10:00 AM',
            deliveryType: booking.pickupType || 'pickup',
            deliveryAddress: booking.pickupLocation || 'Phoenix, AZ',
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