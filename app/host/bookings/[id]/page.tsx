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
  IoCashOutline,
  IoDocumentAttachOutline,
  IoReceipt
} from 'react-icons/io5'

interface InsuranceCoverage {
  level: 'primary' | 'secondary' | 'tertiary'
  provider: string
  policyNumber?: string
  liabilityCoverage: number
  collisionCoverage: number
  deductible: number
}

interface ClaimSummary {
  id: string
  type: string
  status: string
  estimatedCost: number
  createdAt: string
  vehicleDeactivated: boolean
}

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
    hasActiveClaim?: boolean
    activeClaimId?: string
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
  securityDeposit: number
  depositHeld: number
  
  // Insurance Coverage
  insuranceHierarchy?: {
    primary?: InsuranceCoverage
    secondary?: InsuranceCoverage
    tertiary?: InsuranceCoverage
  }
  guestInsuranceActive?: boolean
  
  // Host earnings info
  hostEarnings?: {
    tier: string
    percentage: number
    amount: number
  }
  
  // Post-trip charges
  pendingChargesAmount?: number
  chargesProcessedAt?: string
  chargesNotes?: string
  
  // Claims
  claims?: ClaimSummary[]
  
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

type TabType = 'overview' | 'verification' | 'trip' | 'financial' | 'messages' | 'claims'

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
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    ACTIVE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    COMPLETED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  }

  const claimStatusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    UNDER_REVIEW: 'bg-blue-100 text-blue-800',
    APPROVED: 'bg-green-100 text-green-800',
    DENIED: 'bg-red-100 text-red-800',
    PAID: 'bg-purple-100 text-purple-800',
    RESOLVED: 'bg-gray-100 text-gray-800',
    GUEST_RESPONSE_PENDING: 'bg-orange-100 text-orange-800',
    GUEST_NO_RESPONSE: 'bg-red-100 text-red-800',
    VEHICLE_REPAIR_PENDING: 'bg-yellow-100 text-yellow-800',
    INSURANCE_PROCESSING: 'bg-blue-100 text-blue-800',
    CLOSED: 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-4 sm:p-6 pt-24 max-w-7xl mx-auto">
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
              <span className={`px-3 py-1 rounded-lg text-xs font-medium ${statusColors[booking.status as keyof typeof statusColors]}`}>
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                >
                  Approve Booking
                </button>
                <button
                  onClick={handleDecline}
                  className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors shadow-sm"
                >
                  Decline
                </button>
              </>
            )}
            
            {booking.status === 'CONFIRMED' && booking.tripStatus === 'NOT_STARTED' && (
              <Link
                href={`/host/bookings/${bookingId}/checkin`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Start Check-in
              </Link>
            )}
            
            {booking.tripStatus === 'ACTIVE' && (
              <Link
                href={`/host/bookings/${bookingId}/checkout`}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
              >
                Complete Check-out
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* PHASE 1: ACTIVE CLAIMS ALERT BANNER */}
      {booking.claims && booking.claims.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-6 mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <IoWarningOutline className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-200 mb-1">
                Active Claims on This Booking
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                {booking.claims.length} {booking.claims.length === 1 ? 'claim' : 'claims'} associated with this booking. 
                {booking.car.hasActiveClaim && ' Vehicle is currently deactivated.'}
              </p>
              <div className="flex flex-wrap gap-2">
                {booking.claims.map((claim) => (
                  <Link
                    key={claim.id}
                    href={`/host/claims/${claim.id}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <IoDocumentAttachOutline className="w-4 h-4" />
                    Claim #{claim.id.slice(0, 8)}
                    <span className={`px-2 py-0.5 rounded text-xs ${claimStatusColors[claim.status as keyof typeof claimStatusColors] || 'bg-gray-100 text-gray-800'}`}>
                      {claim.status.replace(/_/g, ' ')}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Score Alert */}
      {booking.riskScore && booking.riskScore > 50 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 shadow-sm">
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
        <div className="flex overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview', icon: IoInformationCircleOutline },
            { key: 'verification', label: 'Verification', icon: IoShieldCheckmarkOutline },
            { key: 'trip', label: 'Trip Details', icon: IoCarOutline },
            { key: 'financial', label: 'Financial', icon: IoWalletOutline },
            { key: 'claims', label: 'Claims', icon: IoDocumentAttachOutline, badge: booking.claims?.length },
            { key: 'messages', label: 'Messages', icon: IoChatbubbleOutline }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`flex-1 min-w-[120px] px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 relative ${
                activeTab === tab.key
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 sm:relative sm:top-0 sm:right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <IoPersonOutline className="w-5 h-5 text-purple-600" />
                  Guest Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {booking.renter?.avatar ? (
                      <Image
                        src={booking.renter.avatar}
                        alt={booking.renter.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <IoPersonOutline className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm">{booking.renter?.name || booking.guestName}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Guest</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1">
                      <span className="text-gray-500 dark:text-gray-400">Email</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs truncate max-w-[180px]">{booking.renter?.email || booking.guestEmail}</span>
                        <button
                          onClick={() => copyToClipboard(booking.renter?.email || booking.guestEmail || '')}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                        >
                          <IoCopyOutline className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-gray-500 dark:text-gray-400">Phone</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{booking.renter?.phone || booking.guestPhone || 'Not provided'}</span>
                        {(booking.renter?.phone || booking.guestPhone) && (
                          <a
                            href={`tel:${booking.renter?.phone || booking.guestPhone}`}
                            className="text-purple-600 hover:text-purple-700 flex-shrink-0"
                          >
                            <IoCallOutline className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                    {booking.bookingCity && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-gray-500 dark:text-gray-400">Location</span>
                        <span className="text-xs">{booking.bookingCity}, {booking.bookingCountry}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Car Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
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
                      <span className="text-gray-500 dark:text-gray-400">Daily Rate</span>
                      <p className="font-semibold">{formatCurrency(booking.car.dailyRate)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Total Days</span>
                      <p className="font-semibold">{booking.numberOfDays}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Schedule */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <IoCalendarOutline className="w-5 h-5 text-purple-600" />
                Trip Schedule
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pickup</p>
                  <p className="font-semibold">{formatDate(booking.startDate)}</p>
                  <p className="text-sm">at {booking.startTime}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <IoLocationOutline className="inline w-4 h-4 mr-1" />
                    {booking.pickupType === 'delivery' ? booking.deliveryAddress : booking.pickupLocation}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Return</p>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
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
                  <IoCheckmarkCircleOutline className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <IoCloseCircleOutline className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
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
                  <IoCheckmarkCircleOutline className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <IoCloseCircleOutline className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Trip Status</h3>
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-3 py-1 rounded-lg text-sm font-medium shadow-sm ${
                  booking.tripStatus === 'NOT_STARTED' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                  booking.tripStatus === 'ACTIVE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
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
                      <span className="text-gray-500 dark:text-gray-400">Check-in Time</span>
                      <p className="font-medium">{formatDate(booking.actualStartTime)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Starting Mileage</span>
                      <p className="font-medium">{booking.startMileage || 'Not recorded'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Fuel Level</span>
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
                      <span className="text-gray-500 dark:text-gray-400">Check-out Time</span>
                      <p className="font-medium">{formatDate(booking.actualEndTime)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Ending Mileage</span>
                      <p className="font-medium">{booking.endMileage || 'Not recorded'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Fuel Level</span>
                      <p className="font-medium">{booking.fuelLevelEnd || 'Not recorded'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Total Miles Driven</span>
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
            {/* PHASE 1: INSURANCE COVERAGE SECTION */}
            {booking.insuranceHierarchy && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <IoShieldCheckmarkOutline className="w-5 h-5 text-purple-600" />
                  Insurance Coverage Hierarchy
                </h3>
                
                <div className="space-y-4">
                  {/* Primary Coverage */}
                  {booking.insuranceHierarchy.primary && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                        <span className="font-semibold text-green-900 dark:text-green-200">Primary Coverage</span>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Provider</span>
                          <p className="font-medium">{booking.insuranceHierarchy.primary.provider}</p>
                        </div>
                        {booking.insuranceHierarchy.primary.policyNumber && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Policy Number</span>
                            <p className="font-medium">{booking.insuranceHierarchy.primary.policyNumber}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Liability Coverage</span>
                          <p className="font-medium">{formatCurrency(booking.insuranceHierarchy.primary.liabilityCoverage)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Collision Coverage</span>
                          <p className="font-medium">{formatCurrency(booking.insuranceHierarchy.primary.collisionCoverage)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Deductible</span>
                          <p className="font-medium">{formatCurrency(booking.insuranceHierarchy.primary.deductible)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Secondary Coverage */}
                  {booking.insuranceHierarchy.secondary && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        <span className="font-semibold text-blue-900 dark:text-blue-200">Secondary Coverage</span>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Provider</span>
                          <p className="font-medium">{booking.insuranceHierarchy.secondary.provider}</p>
                        </div>
                        {booking.insuranceHierarchy.secondary.policyNumber && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Policy Number</span>
                            <p className="font-medium">{booking.insuranceHierarchy.secondary.policyNumber}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Liability Coverage</span>
                          <p className="font-medium">{formatCurrency(booking.insuranceHierarchy.secondary.liabilityCoverage)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Collision Coverage</span>
                          <p className="font-medium">{formatCurrency(booking.insuranceHierarchy.secondary.collisionCoverage)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Deductible</span>
                          <p className="font-medium">{formatCurrency(booking.insuranceHierarchy.secondary.deductible)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tertiary Coverage */}
                  {booking.insuranceHierarchy.tertiary && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 bg-gray-600 dark:bg-gray-400 rounded-full"></div>
                        <span className="font-semibold text-gray-900 dark:text-gray-200">Tertiary Coverage</span>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Provider</span>
                          <p className="font-medium">{booking.insuranceHierarchy.tertiary.provider}</p>
                        </div>
                        {booking.insuranceHierarchy.tertiary.policyNumber && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Policy Number</span>
                            <p className="font-medium">{booking.insuranceHierarchy.tertiary.policyNumber}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Liability Coverage</span>
                          <p className="font-medium">{formatCurrency(booking.insuranceHierarchy.tertiary.liabilityCoverage)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Collision Coverage</span>
                          <p className="font-medium">{formatCurrency(booking.insuranceHierarchy.tertiary.collisionCoverage)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Deductible</span>
                          <p className="font-medium">{formatCurrency(booking.insuranceHierarchy.tertiary.deductible)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Context Message */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                    <p>
                      <strong>Coverage Order:</strong> In the event of a claim, insurance will be applied in order: 
                      Primary → Secondary → Tertiary. Each level covers up to its maximum after the previous level is exhausted.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
              
              {/* Payment Status */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Payment Status</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium shadow-sm ${
                    booking.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    booking.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
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
                  <span className="text-gray-600 dark:text-gray-400">Security Deposit (Held)</span>
                  <span>{formatCurrency(booking.depositHeld || booking.depositAmount)}</span>
                </div>

                {/* Host Earnings Info */}
                {booking.hostEarnings && (
                  <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-purple-900 dark:text-purple-200">Your Earnings</span>
                      <span className="px-2 py-1 bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-200 rounded text-xs font-medium">
                        {booking.hostEarnings.tier} - {booking.hostEarnings.percentage}%
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                      {formatCurrency(booking.hostEarnings.amount)}
                    </p>
                  </div>
                )}
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

        {/* PHASE 1: CLAIMS TAB - VIEW ONLY */}
        {activeTab === 'claims' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Claims for This Booking</h3>

            {!booking.claims || booking.claims.length === 0 ? (
              <div className="text-center py-12">
                <IoDocumentAttachOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">No claims filed for this booking</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                  Claims filed for this booking will appear here.
                </p>
                <Link
                  href="/host/claims"
                  className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  <IoDocumentTextOutline className="w-4 h-4" />
                  Go to Claims Center to file a new claim
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {booking.claims.map((claim) => (
                  <div
                    key={claim.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h4 className="font-semibold">Claim #{claim.id.slice(0, 8)}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${claimStatusColors[claim.status as keyof typeof claimStatusColors] || 'bg-gray-100 text-gray-800'}`}>
                            {claim.status.replace(/_/g, ' ')}
                          </span>
                          {claim.vehicleDeactivated && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded text-xs font-medium">
                              Vehicle Deactivated
                            </span>
                          )}
                        </div>
                        <div className="grid sm:grid-cols-3 gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            <span className="text-gray-500 dark:text-gray-500 block text-xs">Type</span>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{claim.type}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-500 block text-xs">Estimated Cost</span>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(claim.estimatedCost)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-500 block text-xs">Filed</span>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(claim.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/host/claims/${claim.id}`}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm shadow-sm whitespace-nowrap"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
                
                {/* Link to claims center at bottom */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href="/host/claims"
                    className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    <IoDocumentTextOutline className="w-4 h-4" />
                    View all claims or file a new claim
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Messages</h3>
            
            {/* Messages List */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {booking.messages.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No messages yet</p>
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
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sendingMessage}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 shadow-sm"
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