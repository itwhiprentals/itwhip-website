// app/(guest)/rentals/dashboard/bookings/[id]/page.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Booking, Message } from './types'
import { BookingDetails } from './components/BookingDetails'
import { MessagesPanel } from './components/MessagesPanel'
import { BookingSidebar } from './components/BookingSidebar'
import { PolicyFooter, CancellationDialog } from './components/BookingModals'
import { ChevronLeft, XCircle, CheckCircle, Copy, Clock } from './components/Icons'
import StatusProgression from '../../../components/StatusProgression'
// Import Trip Cards
import { TripStartCard } from './components/trip/TripStartCard'
import { TripActiveCard } from './components/trip/TripActiveCard'
import { TripEndCard } from './components/trip/TripEndCard'
import { 
  getTimeUntilPickup, getStatusColor, validateFileUpload, 
  formatCurrency 
} from './utils/helpers'
import { 
  MESSAGE_POLLING_INTERVAL, BOOKING_POLLING_INTERVAL, 
  FILE_UPLOAD_CONFIG 
} from './constants'

export default function BookingDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State management
  const [booking, setBooking] = useState<Booking | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [lastMessageCount, setLastMessageCount] = useState(0)
  const [previousStatus, setPreviousStatus] = useState<string | null>(null)

  // Load booking data
  const loadBooking = useCallback(async () => {
    try {
      const response = await fetch(`/api/rentals/user-bookings?bookingId=${bookingId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.bookings && data.bookings.length > 0) {
          const newBooking = data.bookings[0]
          
          // Check for status change
          if (booking && booking.status !== newBooking.status) {
            if (newBooking.status === 'CONFIRMED' && booking.status === 'PENDING') {
              // Booking was just approved!
              showApprovalNotification()
            }
          }
          
          setBooking(newBooking)
        }
      }
    } catch (error) {
      console.error('Failed to load booking:', error)
      setError('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }, [bookingId, booking])

  // Load messages
  const loadMessages = useCallback(async () => {
    if (!booking) return
    
    try {
      const headers: HeadersInit = {}
      if (booking.guestEmail) {
        headers['x-guest-email'] = booking.guestEmail
      }
      
      const response = await fetch(`/api/rentals/bookings/${bookingId}/messages`, { headers })
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        
        // Track message count for auto-scroll
        if (data.messages && data.messages.length > lastMessageCount) {
          setLastMessageCount(data.messages.length)
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }, [bookingId, booking, lastMessageCount])

  // Send message
  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || !booking) return

    setSending(true)
    setError(null)
    
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      if (booking.guestEmail) {
        headers['x-guest-email'] = booking.guestEmail
      }

      const response = await fetch(`/api/rentals/bookings/${bookingId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: messageText })
      })

      if (response.ok) {
        await loadMessages()
      } else {
        const error = await response.json()
        setError(error.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setError('Failed to send message')
    } finally {
      setSending(false)
    }
  }, [bookingId, booking, loadMessages])

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !booking) return

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

      const headers: HeadersInit = {}
      if (booking.guestEmail) {
        headers['x-guest-email'] = booking.guestEmail
      }

      const response = await fetch(`/api/rentals/bookings/${bookingId}/upload`, {
        method: 'POST',
        headers,
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        
        // Send message with attachment
        await sendMessage(`Uploaded document: ${file.name}`)
        await loadBooking() // Reload to update verification status
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
  }, [bookingId, booking, sendMessage, loadBooking])

  // Handle cancellation
  const handleCancellation = useCallback(async (reason: string) => {
    if (!booking) return
    
    try {
      const response = await fetch(`/api/rentals/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-guest-email': booking.guestEmail || ''
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
    // You could use a toast library here
    alert('Great news! Your booking has been approved and confirmed!')
  }

  // Check for trip-related URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('tripStarted') === 'true') {
      // Show success notification for trip start
      alert('Trip started successfully! Drive safely.')
    } else if (urlParams.get('tripEnded') === 'true') {
      // Show success notification for trip end
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

  // Initial load and polling
  useEffect(() => {
    loadBooking()
    loadMessages()
    
    // Poll for updates
    const bookingInterval = setInterval(loadBooking, BOOKING_POLLING_INTERVAL)
    const messageInterval = setInterval(loadMessages, MESSAGE_POLLING_INTERVAL)
    
    return () => {
      clearInterval(bookingInterval)
      clearInterval(messageInterval)
    }
  }, []) // Empty deps for initial load only

  // Separate effect for message loading when booking changes
  useEffect(() => {
    if (booking) {
      loadMessages()
    }
  }, [booking?.id])

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

        {/* Status Progression Component - UPDATED WITH tripStatus */}
        <StatusProgression
          status={booking.status}
          tripStatus={booking.tripStatus}
          tripStartedAt={booking.tripStartedAt}
          tripEndedAt={booking.tripEndedAt}
          verificationStatus={booking.verificationStatus || 'pending'}
          paymentStatus={booking.paymentStatus}
          documentsSubmittedAt={booking.documentsSubmittedAt}
          reviewedAt={booking.reviewedAt}
        />

        {/* Trip Management Cards - NEW SECTION */}
        {booking.status === 'CONFIRMED' && !booking.tripStartedAt && (
          <div className="mt-6">
            <TripStartCard booking={booking} onTripStarted={loadBooking} />
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
          {/* Left Column - Details & Messages */}
          <div className="lg:col-span-2 space-y-6">
            <BookingDetails 
              booking={booking}
              messages={messages}
              onUploadClick={() => fileInputRef.current?.click()}
              uploadingFile={uploadingFile}
            />
            
            <MessagesPanel
              bookingId={bookingId}
              messages={messages}
              loading={false}
              sending={sending}
              error={error}
              onSendMessage={sendMessage}
              onFileUpload={handleFileUpload}
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
      </div>
    </div>
  )
}