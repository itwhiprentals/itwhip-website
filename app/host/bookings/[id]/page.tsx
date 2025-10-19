// app/host/bookings/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  IoArrowBackOutline,
  IoCarOutline,
  IoPersonOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoAlertCircleOutline,
  IoChatbubbleOutline,
  IoDocumentTextOutline,
  IoWalletOutline,
  IoCallOutline,
  IoMailOutline,
  IoCameraOutline,
  IoWarningOutline,
  IoShieldCheckmarkOutline,
  IoCardOutline,
  IoInformationCircleOutline,
  IoDownloadOutline,
  IoCopyOutline,
  IoSpeedometerOutline,
  IoWaterOutline,
  IoConstructOutline,
  IoCashOutline
} from 'react-icons/io5'

interface BookingDetail {
  id: string
  bookingCode: string
  status: string
  paymentStatus: string
  verificationStatus: string
  tripStatus: string
  
  // Car details
  car: {
    id: string
    make: string
    model: string
    year: number
    licensePlate: string
    dailyRate: number
    photos: Array<{ url: string }>
  }
  
  // Guest details
  renter?: {
    id: string
    name: string
    email: string
    phone?: string
    avatar?: string
  }
  guestName?: string
  guestEmail?: string
  guestPhone?: string
  
  // Verification
  licenseVerified: boolean
  licenseNumber?: string
  licenseState?: string
  licenseExpiry?: string
  licensePhotoUrl?: string
  selfieVerified: boolean
  selfiePhotoUrl?: string
  dateOfBirth?: string
  
  // Trip details
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  numberOfDays: number
  pickupType: string
  pickupLocation: string
  deliveryAddress?: string
  
  // Check-in/out details
  actualStartTime?: string
  actualEndTime?: string
  startMileage?: number
  endMileage?: number
  fuelLevelStart?: string
  fuelLevelEnd?: string
  
  // Inspection
  inspectionPhotosStart?: string
  inspectionPhotosEnd?: string
  damageReported: boolean
  damageDescription?: string
  
  // Financial
  dailyRate: number
  subtotal: number
  deliveryFee: number
  insuranceFee: number
  serviceFee: number
  taxes: number
  totalAmount: number
  depositAmount: number
  
  // Post-trip charges
  pendingChargesAmount?: number
  chargesProcessedAt?: string
  chargesNotes?: string
  
  // Messages
  messages: Array<{
    id: string
    senderType: string
    senderName?: string
    message: string
    createdAt: string
    isRead: boolean
  }>
  
  // Metadata
  createdAt: string
  updatedAt: string
  bookingIpAddress?: string
  bookingCountry?: string
  bookingCity?: string
  riskScore?: number
}

type TabType = 'overview' | 'verification' | 'trip' | 'financial' | 'messages'

export default function BookingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id as string
  
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetail()
    }
  }, [bookingId])

  const fetchBookingDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/host/bookings/${bookingId}`, {
        headers: {
          'x-host-id': localStorage.getItem('hostId') || ''
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setBooking(data.booking)
      }
    } catch (error) {
      console.error('Failed to fetch booking details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!confirm('Approve this booking?')) return

    try {
      const response = await fetch(`/api/host/bookings/${bookingId}/approve`, {
        method: 'POST',
        headers: {
          'x-host-id': localStorage.getItem('hostId') || ''
        }
      })

      if (response.ok) {
        await fetchBookingDetail()
      }
    } catch (error) {
      console.error('Failed to approve booking:', error)
    }
  }

  const handleDecline = async () => {
    const reason = prompt('Reason for declining:')
    if (!reason) return

    try {
      const response = await fetch(`/api/host/bookings/${bookingId}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-host-id': localStorage.getItem('hostId') || ''
        },
        body: JSON.stringify({ reason })
      })

      if (response.ok) {
        await fetchBookingDetail()
      }
    } catch (error) {
      console.error('Failed to decline booking:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setSendingMessage(true)
    try {
      const response = await fetch(`/api/host/bookings/${bookingId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-host-id': localStorage.getItem('hostId') || ''
        },
        body: JSON.stringify({ message: newMessage })
      })

      if (response.ok) {
        setNewMessage('')
        await fetchBookingDetail()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSendingMessage(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <IoAlertCircleOutline className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-lg font-semibold">Booking not found</p>
          <Link href="/host/bookings" className="text-purple-600 hover:underline mt-2 inline-block">
            Back to Bookings
          </Link>
        </div>
      </div>
    )
  }

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    ACTIVE: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800'
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href="/host/bookings" 
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
        >
          <IoArrowBackOutline className="w-5 h-5" />
          Back to Bookings
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Booking #{booking.bookingCode}
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status as keyof typeof statusColors]}`}>
                {booking.status}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Created {formatDate(booking.createdAt)}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {booking.status === 'PENDING' && (
              <>
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve Booking
                </button>
                <button
                  onClick={handleDecline}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Decline
                </button>
              </>
            )}
            
            {booking.status === 'CONFIRMED' && booking.tripStatus === 'NOT_STARTED' && (
              <Link
                href={`/host/bookings/${bookingId}/checkin`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Check-in
              </Link>
            )}
            
            {booking.tripStatus === 'ACTIVE' && (
              <Link
                href={`/host/bookings/${bookingId}/checkout`}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Complete Check-out
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Risk Score Alert */}
      {booking.riskScore && booking.riskScore > 50 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <IoWarningOutline className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-200">High Risk Booking</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Risk score: {booking.riskScore}/100. Please verify guest documents carefully.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
        <div className="flex overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview', icon: IoInformationCircleOutline },
            { key: 'verification', label: 'Verification', icon: IoShieldCheckmarkOutline },
            { key: 'trip', label: 'Trip Details', icon: IoCarOutline },
            { key: 'financial', label: 'Financial', icon: IoWalletOutline },
            { key: 'messages', label: 'Messages', icon: IoChatbubbleOutline }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`flex-1 min-w-[120px] px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            {/* Guest & Car Info */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Guest Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <IoPersonOutline className="w-5 h-5 text-purple-600" />
                  Guest Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {booking.renter?.avatar ? (
                      <Image
                        src={booking.renter.avatar}
                        alt={booking.renter.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <IoPersonOutline className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{booking.renter?.name || booking.guestName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Guest</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Email</span>
                      <div className="flex items-center gap-2">
                        <span>{booking.renter?.email || booking.guestEmail}</span>
                        <button
                          onClick={() => copyToClipboard(booking.renter?.email || booking.guestEmail || '')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <IoCopyOutline className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Phone</span>
                      <div className="flex items-center gap-2">
                        <span>{booking.renter?.phone || booking.guestPhone || 'Not provided'}</span>
                        {(booking.renter?.phone || booking.guestPhone) && (
                          <a
                            href={`tel:${booking.renter?.phone || booking.guestPhone}`}
                            className="text-purple-600 hover:text-purple-700"
                          >
                            <IoCallOutline className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                    {booking.dateOfBirth && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Date of Birth</span>
                        <span>{formatDate(booking.dateOfBirth)}</span>
                      </div>
                    )}
                    {booking.bookingCity && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Location</span>
                        <span>{booking.bookingCity}, {booking.bookingCountry}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Car Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <IoCarOutline className="w-5 h-5 text-purple-600" />
                  Vehicle Information
                </h3>
                <div className="space-y-3">
                  {booking.car.photos?.[0] && (
                    <Image
                      src={booking.car.photos[0].url}
                      alt={`${booking.car.year} ${booking.car.make} ${booking.car.model}`}
                      width={300}
                      height={200}
                      className="rounded-lg object-cover w-full"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-lg">
                      {booking.car.year} {booking.car.make} {booking.car.model}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      License Plate: {booking.car.licensePlate}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Daily Rate</span>
                      <p className="font-semibold">{formatCurrency(booking.car.dailyRate)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Days</span>
                      <p className="font-semibold">{booking.numberOfDays}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Schedule */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <IoCalendarOutline className="w-5 h-5 text-purple-600" />
                Trip Schedule
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Pickup</p>
                  <p className="font-semibold">{formatDate(booking.startDate)}</p>
                  <p className="text-sm">at {booking.startTime}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <IoLocationOutline className="inline w-4 h-4 mr-1" />
                    {booking.pickupType === 'delivery' ? booking.deliveryAddress : booking.pickupLocation}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Return</p>
                  <p className="font-semibold">{formatDate(booking.endDate)}</p>
                  <p className="text-sm">at {booking.endTime}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <IoLocationOutline className="inline w-4 h-4 mr-1" />
                    {booking.pickupLocation}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'verification' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Verification Status</h3>
            
            {/* Verification Status Banner */}
            <div className={`p-4 rounded-lg mb-6 ${
              booking.licenseVerified && booking.selfieVerified 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
            }`}>
              <div className="flex items-center gap-3">
                {booking.licenseVerified && booking.selfieVerified ? (
                  <>
                    <IoCheckmarkCircleOutline className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-semibold text-green-900 dark:text-green-200">Fully Verified</p>
                      <p className="text-sm text-green-700 dark:text-green-300">Guest identity confirmed</p>
                    </div>
                  </>
                ) : (
                  <>
                    <IoWarningOutline className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <p className="font-semibold text-yellow-900 dark:text-yellow-200">Verification Incomplete</p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">Some documents missing or pending review</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Document Checklist */}
            <div className="space-y-4">
              {/* Driver's License */}
              <div className="flex items-start gap-3">
                {booking.licenseVerified ? (
                  <IoCheckmarkCircleOutline className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5" />
                ) : (
                  <IoCloseCircleOutline className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">Driver's License</p>
                  {booking.licenseNumber && (
                    <div className="mt-2 text-sm space-y-1">
                      <p>License #: {booking.licenseNumber}</p>
                      <p>State: {booking.licenseState}</p>
                      {booking.licenseExpiry && <p>Expires: {formatDate(booking.licenseExpiry)}</p>}
                    </div>
                  )}
                  {booking.licensePhotoUrl && (
                    <a 
                      href={booking.licensePhotoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-2 text-purple-600 hover:text-purple-700 text-sm"
                    >
                      <IoDocumentTextOutline className="w-4 h-4" />
                      View Document
                    </a>
                  )}
                </div>
              </div>

              {/* Selfie Verification */}
              <div className="flex items-start gap-3">
                {booking.selfieVerified ? (
                  <IoCheckmarkCircleOutline className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5" />
                ) : (
                  <IoCloseCircleOutline className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">Selfie Verification</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {booking.selfieVerified ? 'Identity confirmed with selfie' : 'Selfie verification pending'}
                  </p>
                  {booking.selfiePhotoUrl && (
                    <a 
                      href={booking.selfiePhotoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-2 text-purple-600 hover:text-purple-700 text-sm"
                    >
                      <IoCameraOutline className="w-4 h-4" />
                      View Selfie
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trip' && (
          <div className="space-y-6">
            {/* Trip Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Trip Status</h3>
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  booking.tripStatus === 'NOT_STARTED' ? 'bg-gray-100 text-gray-800' :
                  booking.tripStatus === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {booking.tripStatus?.replace('_', ' ')}
                </span>
              </div>

              {/* Check-in Details */}
              {booking.actualStartTime && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Check-in Details</h4>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Check-in Time</span>
                      <p className="font-medium">{formatDate(booking.actualStartTime)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Starting Mileage</span>
                      <p className="font-medium">{booking.startMileage || 'Not recorded'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Fuel Level</span>
                      <p className="font-medium">{booking.fuelLevelStart || 'Not recorded'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Check-out Details */}
              {booking.actualEndTime && (
                <div>
                  <h4 className="font-semibold mb-3">Check-out Details</h4>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Check-out Time</span>
                      <p className="font-medium">{formatDate(booking.actualEndTime)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Ending Mileage</span>
                      <p className="font-medium">{booking.endMileage || 'Not recorded'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Fuel Level</span>
                      <p className="font-medium">{booking.fuelLevelEnd || 'Not recorded'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Miles Driven</span>
                      <p className="font-medium">
                        {booking.startMileage && booking.endMileage 
                          ? booking.endMileage - booking.startMileage 
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Damage Report */}
              {booking.damageReported && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2">Damage Reported</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {booking.damageDescription || 'Damage reported but no description provided'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
              
              {/* Payment Status */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Payment Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    booking.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                    booking.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Daily Rate × {booking.numberOfDays} days
                  </span>
                  <span>{formatCurrency(booking.subtotal)}</span>
                </div>
                
                {booking.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                    <span>{formatCurrency(booking.deliveryFee)}</span>
                  </div>
                )}
                
                {booking.insuranceFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Insurance</span>
                    <span>{formatCurrency(booking.insuranceFee)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
                  <span>{formatCurrency(booking.serviceFee)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Taxes</span>
                  <span>{formatCurrency(booking.taxes)}</span>
                </div>
                
                <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount</span>
                    <span className="text-lg">{formatCurrency(booking.totalAmount)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-gray-600 dark:text-gray-400">Security Deposit</span>
                  <span>{formatCurrency(booking.depositAmount)}</span>
                </div>
              </div>

              {/* Post-Trip Charges */}
              {booking.pendingChargesAmount && booking.pendingChargesAmount > 0 && (
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                    Post-Trip Charges
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Pending Charges</span>
                      <span className="font-semibold">{formatCurrency(booking.pendingChargesAmount)}</span>
                    </div>
                    {booking.chargesNotes && (
                      <p className="text-yellow-700 dark:text-yellow-300 mt-2">
                        {booking.chargesNotes}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Messages</h3>
            
            {/* Messages List */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {booking.messages.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No messages yet</p>
              ) : (
                booking.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderType === 'host' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.senderType === 'host'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <p className="text-xs opacity-75 mb-1">
                        {message.senderName || message.senderType} • {formatDate(message.createdAt)}
                      </p>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Send Message */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sendingMessage}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {sendingMessage ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}