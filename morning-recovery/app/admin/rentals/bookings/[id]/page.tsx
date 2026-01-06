// app/admin/rentals/bookings/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
// Temporarily comment out components to identify the issue
// import RiskIndicator from '@/app/admin/components/RiskIndicator'
// import BookingTimeline from '@/app/admin/components/BookingTimeline'
// import DocumentViewer from '@/app/admin/components/DocumentViewer'
import {
  IoArrowBackOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoWarningOutline,
  IoTimeOutline,
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoCarSportOutline,
  IoCashOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoFingerPrintOutline,
  IoGlobeOutline,
  IoWifiOutline,
  IoAlertCircleOutline,
  IoCopyOutline,
  IoRefreshOutline,
  IoBanOutline,
  IoChevronDownOutline,
  IoChevronUpOutline
} from 'react-icons/io5'

interface BookingDetail {
  id: string
  bookingCode: string
  status: string
  verificationStatus: string
  
  // Guest info
  guestName: string
  guestEmail: string
  guestPhone: string
  
  // Car info
  car: {
    id: string
    make: string
    model: string
    year: number
    color: string
    licensePlate: string
    photos: Array<{ url: string; caption?: string }>
    transmission: string
    fuelType: string
    seats: number
    dailyRate: number
  }
  
  // Host info
  host: {
    id: string
    name: string
    email: string
    phone: string
    rating: number
    totalTrips: number
  }
  
  // Dates
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  
  // Location
  pickupLocation: string
  pickupType: string
  deliveryAddress?: string
  
  // Pricing
  dailyRate: number
  numberOfDays: number
  subtotal: number
  deliveryFee: number
  insuranceFee: number
  serviceFee: number
  taxes: number
  totalAmount: number
  depositAmount: number
  
  // Payment
  paymentStatus: string
  paymentIntentId?: string
  
  // Verification
  licensePhotoUrl?: string
  insurancePhotoUrl?: string
  selfiePhotoUrl?: string
  licenseNumber?: string
  licenseState?: string
  licenseExpiry?: string
  dateOfBirth?: string
  
  // Fraud data
  riskScore?: number
  riskFlags?: string[]
  deviceFingerprint?: string
  bookingIpAddress?: string
  bookingCountry?: string
  bookingCity?: string
  sessionDuration?: number
  emailVerified?: boolean
  phoneVerified?: boolean
  fraudulent?: boolean
  flaggedForReview?: boolean
  
  // Timestamps
  createdAt: string
  updatedAt: string
  documentsSubmittedAt?: string
  reviewedAt?: string
  reviewedBy?: string
  
  // Cancellation
  cancellationReason?: string
  cancelledBy?: string
  cancelledAt?: string
  
  // Relations
  disputes?: any[]
  messages?: any[]
}

interface RiskAnalysis {
  overallScore: number
  riskLevel: string
  categories: {
    email: { score: number; factors: string[] }
    session: { score: number; factors: string[] }
    device: { score: number; factors: string[] }
    location: { score: number; factors: string[] }
    velocity: { score: number; factors: string[] }
  }
  recommendations: string[]
  relatedBookings: Array<{
    id: string
    bookingCode: string
    guestName: string
    createdAt: string
    riskScore: number
  }>
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showRiskDetails, setShowRiskDetails] = useState(false)
  const [showSessionDetails, setShowSessionDetails] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setBookingId(p.id))
  }, [params])

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails()
      fetchRiskAnalysis()
    }
  }, [bookingId])

  const fetchBookingDetails = async () => {
    if (!bookingId) return
    try {
      const response = await fetch(`/api/admin/rentals/bookings/${bookingId}`)
      if (response.ok) {
        const data = await response.json()
        setBooking(data.booking || data)
      }
    } catch (error) {
      console.error('Failed to fetch booking:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRiskAnalysis = async () => {
    if (!bookingId) return
    try {
      const response = await fetch(`/api/admin/rentals/bookings/${bookingId}/risk-analysis`)
      if (response.ok) {
        const data = await response.json()
        setRiskAnalysis(data)
      }
    } catch (error) {
      console.error('Failed to fetch risk analysis:', error)
    }
  }

  const handleApprove = async () => {
    if (!bookingId) return
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/rentals/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationStatus: 'approved',
          status: 'confirmed',
          notes: 'Approved after risk review'
        })
      })
      
      if (response.ok) {
        alert('Booking approved successfully')
        fetchBookingDetails()
      }
    } catch (error) {
      console.error('Failed to approve booking:', error)
      alert('Failed to approve booking')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (reason: string) => {
    if (!bookingId) return
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/rentals/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        alert('Booking rejected successfully')
        router.push('/admin/rentals')
      }
    } catch (error) {
      console.error('Failed to reject booking:', error)
      alert('Failed to reject booking')
    } finally {
      setActionLoading(false)
    }
  }

  const handleOverrideFraud = async () => {
    if (!bookingId) return
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/rentals/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fraudulent: false,
          flaggedForReview: false,
          verificationStatus: 'approved',
          notes: 'Admin override - manually verified'
        })
      })
      
      if (response.ok) {
        alert('Fraud flag overridden')
        fetchBookingDetails()
      }
    } catch (error) {
      console.error('Failed to override:', error)
      alert('Failed to override fraud flag')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <IoWarningOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Booking not found</p>
          <Link href="/admin/rentals" className="mt-4 text-blue-600 hover:underline">
            Back to bookings
          </Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: IoDocumentTextOutline },
    { id: 'verification', label: 'Verification', icon: IoShieldCheckmarkOutline },
    { id: 'risk', label: 'Risk Analysis', icon: IoWarningOutline },
    { id: 'timeline', label: 'Timeline', icon: IoTimeOutline },
    { id: 'payment', label: 'Payment', icon: IoCashOutline }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/rentals" 
                className="text-gray-400 hover:text-gray-600"
              >
                <IoArrowBackOutline className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Booking {booking.bookingCode}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Created {new Date(booking.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            
            {/* Status Badges */}
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
              {booking.verificationStatus === 'pending' && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  Verification Pending
                </span>
              )}
              {booking.fraudulent && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  Fraudulent
                </span>
              )}
              {booking.flaggedForReview && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  Under Review
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Alert */}
      {booking.riskScore && booking.riskScore >= 60 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <IoAlertCircleOutline className="w-5 h-5 text-red-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  High Risk Booking - Score: {booking.riskScore}/100
                </p>
                <p className="text-xs text-red-700 mt-1">
                  {booking.riskFlags?.join(', ')}
                </p>
              </div>
            </div>
            {booking.fraudulent && (
              <button
                onClick={handleOverrideFraud}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                Override Fraud Flag
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-1 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Guest Information */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <IoPersonOutline className="w-5 h-5 mr-2" />
                    Guest Information
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{booking.guestName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium flex items-center">
                        {booking.guestEmail}
                        {booking.emailVerified && (
                          <IoCheckmarkCircle className="w-4 h-4 text-green-500 ml-2" />
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium flex items-center">
                        {booking.guestPhone}
                        {booking.phoneVerified && (
                          <IoCheckmarkCircle className="w-4 h-4 text-green-500 ml-2" />
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-medium">
                        {booking.dateOfBirth ? new Date(booking.dateOfBirth).toLocaleDateString() : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <IoCarSportOutline className="w-5 h-5 mr-2" />
                    Vehicle Information
                  </h2>
                  <div className="flex space-x-6">
                    {booking.car.photos[0] && (
                      <img 
                        src={booking.car.photos[0].url} 
                        alt={`${booking.car.make} ${booking.car.model}`}
                        className="w-32 h-24 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Vehicle</p>
                        <p className="font-medium">
                          {booking.car.year} {booking.car.make} {booking.car.model}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Color</p>
                        <p className="font-medium">{booking.car.color}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">License Plate</p>
                        <p className="font-medium">{booking.car.licensePlate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Transmission</p>
                        <p className="font-medium">{booking.car.transmission}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rental Details */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <IoCalendarOutline className="w-5 h-5 mr-2" />
                    Rental Details
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="font-medium">
                        {new Date(booking.startDate).toLocaleDateString()} at {booking.startTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">End Date</p>
                      <p className="font-medium">
                        {new Date(booking.endDate).toLocaleDateString()} at {booking.endTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pickup Location</p>
                      <p className="font-medium">{booking.pickupLocation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pickup Type</p>
                      <p className="font-medium">{booking.pickupType}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Verification Tab */}
            {activeTab === 'verification' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Document Verification</h2>
                <div className="text-gray-600">
                  <p>License Photo: {booking.licensePhotoUrl ? 'Uploaded' : 'Not uploaded'}</p>
                  <p>Insurance Photo: {booking.insurancePhotoUrl ? 'Uploaded' : 'Not uploaded'}</p>
                  <p>Selfie Photo: {booking.selfiePhotoUrl ? 'Uploaded' : 'Not uploaded'}</p>
                </div>
                {/* Temporarily disabled: DocumentViewer component */}
              </div>
            )}

            {/* Risk Analysis Tab */}
            {activeTab === 'risk' && (
              <>
                {/* Risk Score */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h2>
                  {booking.riskScore !== undefined && (
                    <div>
                      <p className="text-2xl font-bold">Risk Score: {booking.riskScore}/100</p>
                      <p className="text-sm text-gray-600 mt-2">Risk Flags: {booking.riskFlags?.join(', ') || 'None'}</p>
                    </div>
                    // Temporarily disabled: <RiskIndicator score={booking.riskScore} factors={booking.riskFlags || []} showDetails={true} size="large" />
                  )}
                </div>

                {/* Fraud Indicators */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <IoFingerPrintOutline className="w-5 h-5 mr-2" />
                    Device & Session Information
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Device Fingerprint</p>
                        <p className="font-mono text-xs">{booking.deviceFingerprint || 'Not captured'}</p>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <IoCopyOutline className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">IP Address</p>
                        <p className="font-medium">{booking.bookingIpAddress || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">
                          {booking.bookingCity}, {booking.bookingCountry}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Session Duration</p>
                        <p className="font-medium">
                          {booking.sessionDuration ? `${Math.round(booking.sessionDuration / 60)} minutes` : 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email Domain</p>
                        <p className="font-medium">
                          {booking.guestEmail?.split('@')[1] || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Related Bookings */}
                {riskAnalysis?.relatedBookings && riskAnalysis.relatedBookings.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Bookings</h2>
                    <div className="space-y-3">
                      {riskAnalysis.relatedBookings.map(related => (
                        <Link
                          key={related.id}
                          href={`/admin/rentals/bookings/${related.id}`}
                          className="block p-3 border border-gray-200 rounded hover:bg-gray-50"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{related.bookingCode}</p>
                              <p className="text-sm text-gray-600">{related.guestName}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(related.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">Risk: {related.riskScore}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Booking Timeline</h2>
                <div className="space-y-3">
                  <div className="border-l-2 border-gray-300 pl-4">
                    <p className="font-medium">Booking Created</p>
                    <p className="text-sm text-gray-600">{new Date(booking.createdAt).toLocaleString()}</p>
                  </div>
                  {booking.documentsSubmittedAt && (
                    <div className="border-l-2 border-gray-300 pl-4">
                      <p className="font-medium">Documents Submitted</p>
                      <p className="text-sm text-gray-600">{new Date(booking.documentsSubmittedAt).toLocaleString()}</p>
                    </div>
                  )}
                  {booking.reviewedAt && (
                    <div className="border-l-2 border-gray-300 pl-4">
                      <p className="font-medium">Reviewed by {booking.reviewedBy}</p>
                      <p className="text-sm text-gray-600">{new Date(booking.reviewedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
                {/* Temporarily disabled: BookingTimeline component */}
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Payment Status</p>
                      <p className="font-medium">{booking.paymentStatus}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Intent</p>
                      <p className="font-mono text-xs">{booking.paymentIntentId || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">Pricing Breakdown</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Daily Rate × {booking.numberOfDays} days</span>
                        <span>${booking.subtotal.toFixed(2)}</span>
                      </div>
                      {booking.deliveryFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery Fee</span>
                          <span>${booking.deliveryFee.toFixed(2)}</span>
                        </div>
                      )}
                      {booking.insuranceFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Insurance</span>
                          <span>${booking.insuranceFee.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Fee</span>
                        <span>${booking.serviceFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Taxes</span>
                        <span>${booking.taxes.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                        <span>Total</span>
                        <span>${booking.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Security Deposit</span>
                        <span>${booking.depositAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                {booking.verificationStatus === 'pending' && (
                  <>
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      <IoCheckmarkCircle className="w-5 h-5 mr-2" />
                      Approve Booking
                    </button>
                    <button
                      onClick={() => handleReject('Failed verification')}
                      disabled={actionLoading}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      <IoCloseCircle className="w-5 h-5 mr-2" />
                      Reject Booking
                    </button>
                  </>
                )}
                
                {booking.status !== 'cancelled' && (
                  <button
                    onClick={() => handleReject('Admin cancellation')}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center"
                  >
                    <IoBanOutline className="w-5 h-5 mr-2" />
                    Cancel Booking
                  </button>
                )}
                
                <button
                  onClick={fetchBookingDetails}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center justify-center"
                >
                  <IoRefreshOutline className="w-5 h-5 mr-2" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Host Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Host Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{booking.host.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-sm">{booking.host.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-sm">{booking.host.phone}</p>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rating</span>
                    <span className="font-medium">{booking.host.rating} ⭐</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Total Trips</span>
                    <span className="font-medium">{booking.host.totalTrips}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Risk Score</span>
                  <span className={`font-medium ${
                    booking.riskScore! >= 60 ? 'text-red-600' : 
                    booking.riskScore! >= 30 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {booking.riskScore || 0}/100
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Session Duration</span>
                  <span className="font-medium">
                    {booking.sessionDuration ? `${Math.round(booking.sessionDuration / 60)}m` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email Verified</span>
                  <span className="font-medium">
                    {booking.emailVerified ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Phone Verified</span>
                  <span className="font-medium">
                    {booking.phoneVerified ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}