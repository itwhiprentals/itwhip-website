// app/partner/bookings/[id]/page.tsx
// Comprehensive Booking Detail & Management Page

'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import {
  IoArrowBackOutline,
  IoCarOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoMailOutline,
  IoCallOutline,
  IoShieldCheckmarkOutline,
  IoShieldOutline,
  IoWarningOutline,
  IoDocumentTextOutline,
  IoCreateOutline,
  IoWalletOutline,
  IoAddOutline,
  IoSendOutline,
  IoRefreshOutline,
  IoSwapHorizontalOutline,
  IoReceiptOutline,
  IoAlertCircleOutline,
  IoCopyOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoPrintOutline,
  IoDownloadOutline
} from 'react-icons/io5'

interface BookingDetails {
  id: string
  status: string
  paymentStatus: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  numberOfDays: number
  dailyRate: number
  subtotal: number
  deliveryFee: number
  insuranceFee: number
  serviceFee: number
  taxes: number
  securityDeposit: number
  depositHeld: number
  totalAmount: number
  pickupType: string
  pickupLocation: string
  guestName: string
  guestEmail: string
  notes: string | null
  createdAt: string
  updatedAt: string
  // Agreement fields
  agreementStatus: string | null
  agreementSentAt: string | null
  agreementSignedAt: string | null
  agreementSignedPdfUrl: string | null
  signerName: string | null
  tripCharges: Array<{
    id: string
    amount: number
    description: string
    chargeType: string
    status: string
    createdAt: string
  }>
}

interface Renter {
  id: string
  name: string
  email: string
  phone: string | null
  photo: string | null
  memberSince: string | null
  reviewerProfileId: string | null
  verification: {
    identity: {
      status: string
      verifiedAt: string | null
      verifiedName: string | null
      verifiedDOB: string | null
      verifiedAddress: string | null
    }
    email: {
      verified: boolean
      verifiedAt: string | null
    }
    phone: {
      verified: boolean
    }
  }
}

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  licensePlate: string | null
  vin: string | null
  color: string | null
  photo: string | null
  photos: string[]
  dailyRate: number
  weeklyRate: number | null
  monthlyRate: number | null
  vehicleType: string
  carType: string
  seats: number
  currentMileage: number | null
  isActive: boolean
}

interface Partner {
  id: string
  companyName: string | null
  name: string
  email: string
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
}

interface Insurance {
  hasVehicleInsurance: boolean
  hasPartnerInsurance: boolean
  vehicleProvider: string | null
  partnerProvider: string | null
  requiresGuestInsurance: boolean
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: bookingId } = use(params)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [renter, setRenter] = useState<Renter | null>(null)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [partner, setPartner] = useState<Partner | null>(null)
  const [insurance, setInsurance] = useState<Insurance | null>(null)

  // Action states
  const [confirming, setConfirming] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [sendingVerification, setSendingVerification] = useState(false)
  const [sendingAgreement, setSendingAgreement] = useState(false)

  // UI states
  const [showChargeModal, setShowChargeModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [markingPaid, setMarkingPaid] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    pricing: true,
    verification: true,
    agreement: false,
    charges: false
  })

  // Toast notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    fetchBookingDetails()
  }, [bookingId])

  const fetchBookingDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/partner/bookings/${bookingId}`)
      const data = await response.json()

      if (data.success) {
        setBooking(data.booking)
        setRenter(data.renter)
        setVehicle(data.vehicle)
        setPartner(data.partner)
        setInsurance(data.insurance)
      } else {
        setError(data.error || 'Failed to load booking')
      }
    } catch (err) {
      setError('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  const confirmBooking = async () => {
    if (!booking) return

    setConfirming(true)
    try {
      const response = await fetch('/api/partner/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id })
      })

      const data = await response.json()

      if (data.success) {
        setBooking(prev => prev ? { ...prev, status: 'CONFIRMED' } : null)
        showToast('success', 'Booking confirmed successfully')
      } else {
        showToast('error', data.error || 'Failed to confirm booking')
      }
    } catch {
      showToast('error', 'Failed to confirm booking')
    } finally {
      setConfirming(false)
    }
  }

  const cancelBooking = async () => {
    if (!booking || !confirm('Are you sure you want to cancel this booking?')) return

    setCancelling(true)
    try {
      const response = await fetch(`/api/partner/bookings/${booking.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setBooking(prev => prev ? { ...prev, status: 'CANCELLED' } : null)
        showToast('success', 'Booking cancelled')
      } else {
        showToast('error', data.error || 'Failed to cancel booking')
      }
    } catch {
      showToast('error', 'Failed to cancel booking')
    } finally {
      setCancelling(false)
    }
  }

  const sendVerificationRequest = async () => {
    if (!renter || !booking) return

    setSendingVerification(true)
    try {
      const response = await fetch('/api/partner/verify/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: renter.name,
          email: renter.email,
          phone: renter.phone || '',
          purpose: vehicle?.vehicleType === 'RIDESHARE' ? 'rideshare' : 'rental',
          bookingId: booking.id
        })
      })

      const data = await response.json()

      if (data.success) {
        showToast('success', 'Verification link sent to customer')
      } else if (data.status === 'already_verified') {
        showToast('success', 'Customer is already verified')
        // Refresh to show updated verification status
        fetchBookingDetails()
      } else {
        showToast('error', data.error || 'Failed to send verification')
      }
    } catch {
      showToast('error', 'Failed to send verification link')
    } finally {
      setSendingVerification(false)
    }
  }

  const sendAgreement = async () => {
    if (!booking) return

    setSendingAgreement(true)
    try {
      const response = await fetch('/api/agreements/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id })
      })

      const data = await response.json()

      if (data.success) {
        showToast('success', data.message || 'Agreement sent successfully')
        // Refresh booking details to show updated status
        fetchBookingDetails()
      } else if (data.status === 'already_signed') {
        showToast('success', 'Agreement already signed')
        fetchBookingDetails()
      } else {
        showToast('error', data.error || 'Failed to send agreement')
      }
    } catch {
      showToast('error', 'Failed to send agreement')
    } finally {
      setSendingAgreement(false)
    }
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showToast('success', 'Copied to clipboard')
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 dark:text-green-400'
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'failed':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const markAsPaid = async () => {
    if (!booking) return

    setMarkingPaid(true)
    try {
      const response = await fetch(`/api/partner/bookings/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'PAID' })
      })

      const data = await response.json()

      if (data.success) {
        setBooking(prev => prev ? { ...prev, paymentStatus: 'PAID' } : null)
        showToast('success', 'Payment marked as received')
      } else {
        showToast('error', data.error || 'Failed to update payment status')
      }
    } catch {
      showToast('error', 'Failed to update payment status')
    } finally {
      setMarkingPaid(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <IoAlertCircleOutline className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
              {error || 'Booking not found'}
            </h2>
            <Link
              href="/partner/bookings"
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400"
            >
              <IoArrowBackOutline className="w-4 h-4" />
              Back to Bookings
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
          toast.type === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? (
            <IoCheckmarkCircleOutline className="w-5 h-5" />
          ) : (
            <IoCloseCircleOutline className="w-5 h-5" />
          )}
          {toast.message}
        </div>
      )}

      {/* Header - Mobile Optimized */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Top row - Back button, title, status */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Link
                href="/partner/bookings"
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              >
                <IoArrowBackOutline className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                    Booking Details
                  </h1>
                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {booking.id.slice(0, 8).toUpperCase()}
                  </span>
                  <button
                    onClick={() => copyToClipboard(booking.id)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <IoCopyOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions - Hidden on mobile, shown inline on desktop */}
            <div className="hidden sm:flex items-center gap-2">
              {booking.status === 'PENDING' && (
                <button
                  onClick={confirmBooking}
                  disabled={confirming}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium flex items-center gap-2"
                >
                  {confirming ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <IoCheckmarkOutline className="w-4 h-4" />
                  )}
                  Confirm Booking
                </button>
              )}
              {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                <button
                  onClick={cancelBooking}
                  disabled={cancelling}
                  className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  {cancelling ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
                  ) : (
                    <IoCloseOutline className="w-4 h-4" />
                  )}
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Reservation Expiry Notice - For PENDING bookings */}
          {booking.status === 'PENDING' && (
            <div className="mt-2 sm:mt-3 flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
              <IoTimeOutline className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">
                <strong>Reservation expires:</strong>{' '}
                {(() => {
                  const createdAt = new Date(booking.createdAt)
                  const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000) // 24 hours
                  const now = new Date()
                  const hoursLeft = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)))
                  const minutesLeft = Math.max(0, Math.floor(((expiresAt.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60)))

                  if (hoursLeft <= 0 && minutesLeft <= 0) {
                    return <span className="text-red-600 dark:text-red-400">Expired - confirm or it will be auto-cancelled</span>
                  }
                  return `${hoursLeft}h ${minutesLeft}m remaining to confirm`
                })()}
              </span>
            </div>
          )}

          {/* Mobile Quick Actions - Full width buttons on mobile */}
          <div className="sm:hidden mt-3 flex gap-2">
            {booking.status === 'PENDING' && (
              <button
                onClick={confirmBooking}
                disabled={confirming}
                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium flex items-center justify-center gap-2 text-sm"
              >
                {confirming ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <IoCheckmarkOutline className="w-4 h-4" />
                )}
                Confirm
              </button>
            )}
            {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
              <button
                onClick={cancelBooking}
                disabled={cancelling}
                className={`${booking.status === 'PENDING' ? '' : 'flex-1'} px-3 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center gap-2 text-sm`}
              >
                {cancelling ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
                ) : (
                  <IoCloseOutline className="w-4 h-4" />
                )}
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle & Customer Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Vehicle Section */}
              {vehicle && (
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-4">
                    {vehicle.photo ? (
                      <img
                        src={vehicle.photo}
                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        className="w-32 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-32 h-24 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                        <IoCarOutline className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          vehicle.vehicleType === 'RIDESHARE'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                        }`}>
                          {vehicle.vehicleType}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                        {vehicle.licensePlate && (
                          <span className="font-mono">{vehicle.licensePlate}</span>
                        )}
                        {vehicle.color && <span>{vehicle.color}</span>}
                        {vehicle.currentMileage && (
                          <span>{vehicle.currentMileage.toLocaleString()} mi</span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-4">
                        <span className="text-orange-600 dark:text-orange-400 font-semibold">
                          {formatCurrency(vehicle.dailyRate)}/day
                        </span>
                        <Link
                          href={`/partner/fleet/${vehicle.id}`}
                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          View Vehicle →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Section */}
              {renter && (
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {renter.photo ? (
                        <img
                          src={renter.photo}
                          alt={renter.name}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <IoPersonOutline className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {renter.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <IoMailOutline className="w-4 h-4" />
                          {renter.email}
                        </div>
                        {renter.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <IoCallOutline className="w-4 h-4" />
                            {renter.phone}
                          </div>
                        )}
                        {renter.memberSince && (
                          <p className="text-xs text-gray-400 mt-1">
                            Member since {new Date(renter.memberSince).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/partner/customers/${renter.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      View Profile →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Rental Period */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <IoCalendarOutline className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Rental Period</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pickup</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(booking.startDate)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    at {booking.startTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Return</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(booking.endDate)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    at {booking.endTime}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IoLocationOutline className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {booking.pickupType === 'PARTNER_LOCATION' ? 'Partner Location' :
                         booking.pickupType === 'AIRPORT' ? 'Airport Pickup' : 'Delivery'}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {booking.pickupLocation || 'Business location'}
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {booking.numberOfDays} {booking.numberOfDays === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Status Section */}
            {renter && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => toggleSection('verification')}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <IoShieldOutline className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Guest Verification</h3>
                    {renter.verification.identity.status === 'verified' ? (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        Pending
                      </span>
                    )}
                  </div>
                  {expandedSections.verification ? (
                    <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
                  ) : (
                    <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {expandedSections.verification && (
                  <div className="px-6 pb-6 space-y-4">
                    {/* Identity Verification */}
                    <div className={`p-4 rounded-lg ${
                      renter.verification.identity.status === 'verified'
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : renter.verification.identity.status === 'pending'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20'
                        : 'bg-gray-50 dark:bg-gray-700/50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">Identity Verification</span>
                        <span className={`flex items-center gap-1 ${getVerificationStatusColor(renter.verification.identity.status)}`}>
                          {renter.verification.identity.status === 'verified' ? (
                            <IoCheckmarkCircleOutline className="w-5 h-5" />
                          ) : renter.verification.identity.status === 'pending' ? (
                            <IoTimeOutline className="w-5 h-5" />
                          ) : (
                            <IoCloseCircleOutline className="w-5 h-5" />
                          )}
                          {renter.verification.identity.status === 'verified' ? 'Verified' :
                           renter.verification.identity.status === 'pending' ? 'Pending' :
                           renter.verification.identity.status === 'failed' ? 'Failed' : 'Not Started'}
                        </span>
                      </div>

                      {renter.verification.identity.status === 'verified' && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {renter.verification.identity.verifiedName && (
                            <p>Name: {renter.verification.identity.verifiedName}</p>
                          )}
                          {renter.verification.identity.verifiedAt && (
                            <p>Verified: {new Date(renter.verification.identity.verifiedAt).toLocaleDateString()}</p>
                          )}
                        </div>
                      )}

                      {renter.verification.identity.status !== 'verified' && (
                        <button
                          onClick={sendVerificationRequest}
                          disabled={sendingVerification}
                          className="mt-3 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                        >
                          {sendingVerification ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          ) : (
                            <IoSendOutline className="w-4 h-4" />
                          )}
                          Send Verification Link
                        </button>
                      )}
                    </div>

                    {/* Email & Phone Verification */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg ${
                        renter.verification.email.verified
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : 'bg-gray-50 dark:bg-gray-700/50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
                          {renter.verification.email.verified ? (
                            <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                          ) : (
                            <IoCloseCircleOutline className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div className={`p-4 rounded-lg ${
                        renter.verification.phone.verified
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : 'bg-gray-50 dark:bg-gray-700/50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</span>
                          {renter.verification.phone.verified ? (
                            <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                          ) : (
                            <IoCloseCircleOutline className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rental Agreement Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => toggleSection('agreement')}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <IoDocumentTextOutline className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Rental Agreement</h3>
                  {booking.agreementStatus === 'signed' ? (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Signed
                    </span>
                  ) : booking.agreementStatus === 'sent' || booking.agreementStatus === 'viewed' ? (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {booking.agreementStatus === 'viewed' ? 'Viewed' : 'Sent'}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      Not Sent
                    </span>
                  )}
                </div>
                {expandedSections.agreement ? (
                  <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
                ) : (
                  <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedSections.agreement && (
                <div className="px-6 pb-6">
                  {/* Agreement Status Banner */}
                  {booking.agreementStatus === 'signed' && (
                    <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <IoCheckmarkCircleOutline className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="font-medium text-green-700 dark:text-green-300">Agreement Signed</p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Signed by {booking.signerName} on {booking.agreementSignedAt ? new Date(booking.agreementSignedAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {(booking.agreementStatus === 'sent' || booking.agreementStatus === 'viewed') && (
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <IoTimeOutline className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="font-medium text-blue-700 dark:text-blue-300">
                            {booking.agreementStatus === 'viewed' ? 'Customer is Reviewing' : 'Awaiting Signature'}
                          </p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            Sent on {booking.agreementSentAt ? new Date(booking.agreementSentAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Agreement Preview */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-4 bg-gray-50 dark:bg-gray-900/50">
                    <div className="text-center mb-6">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">Vehicle Rental Agreement</h4>
                      <p className="text-sm text-gray-500">Booking: {booking.id.slice(0, 8).toUpperCase()}</p>
                    </div>

                    <div className="space-y-4 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Renter (Guest)</p>
                          <p className="font-medium text-gray-900 dark:text-white">{renter?.name || booking.guestName}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Vehicle Owner (Partner)</p>
                          <p className="font-medium text-gray-900 dark:text-white">{partner?.companyName || partner?.name}</p>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <p className="text-gray-500 dark:text-gray-400 mb-2">Vehicle</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {vehicle?.year} {vehicle?.make} {vehicle?.model}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {vehicle?.carType} ({vehicle?.seats} seats)
                        </p>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Pickup</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(booking.startDate)} at {booking.startTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Return</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(booking.endDate)} at {booking.endTime}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <p className="text-gray-500 dark:text-gray-400 mb-1">Pickup Location</p>
                        <p className="font-medium text-gray-900 dark:text-white">{booking.pickupLocation}</p>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <p className="text-gray-500 dark:text-gray-400 mb-1">Total Days</p>
                        <p className="font-medium text-gray-900 dark:text-white">{booking.numberOfDays}</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
                      <p><strong>Governing Law:</strong> State of Arizona</p>
                      <p><strong>Venue:</strong> Maricopa County Superior Court</p>
                    </div>
                  </div>

                  {/* Agreement Actions */}
                  <div className="flex flex-wrap gap-3">
                    {booking.agreementStatus === 'signed' && booking.agreementSignedPdfUrl ? (
                      <a
                        href={booking.agreementSignedPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                      >
                        <IoDownloadOutline className="w-4 h-4" />
                        Download Signed Agreement
                      </a>
                    ) : (
                      <>
                        <button
                          onClick={() => window.print()}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <IoPrintOutline className="w-4 h-4" />
                          Print Preview
                        </button>
                        <button
                          onClick={sendAgreement}
                          disabled={sendingAgreement}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg flex items-center gap-2"
                        >
                          {sendingAgreement ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          ) : (
                            <IoSendOutline className="w-4 h-4" />
                          )}
                          {booking.agreementStatus === 'sent' || booking.agreementStatus === 'viewed'
                            ? 'Resend Agreement'
                            : 'Send for Signature'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Trip Charges Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => toggleSection('charges')}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <IoReceiptOutline className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Trip Charges</h3>
                  {booking.tripCharges.length > 0 && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {booking.tripCharges.length}
                    </span>
                  )}
                </div>
                {expandedSections.charges ? (
                  <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
                ) : (
                  <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedSections.charges && (
                <div className="px-6 pb-6">
                  {booking.tripCharges.length > 0 ? (
                    <div className="space-y-3">
                      {booking.tripCharges.map((charge) => (
                        <div
                          key={charge.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{charge.description}</p>
                            <p className="text-xs text-gray-500">
                              {charge.chargeType} • {new Date(charge.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(charge.amount)}
                            </p>
                            <span className={`text-xs ${
                              charge.status === 'PAID' ? 'text-green-600' :
                              charge.status === 'PENDING' ? 'text-yellow-600' : 'text-gray-500'
                            }`}>
                              {charge.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No additional charges
                    </p>
                  )}

                  <button
                    onClick={() => setShowChargeModal(true)}
                    className="mt-4 w-full px-4 py-2 border border-orange-300 dark:border-orange-600 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center justify-center gap-2"
                  >
                    <IoAddOutline className="w-4 h-4" />
                    Add Charge
                  </button>
                </div>
              )}
            </div>

            {/* Notes Section */}
            {booking.notes && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Notes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {booking.notes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => toggleSection('pricing')}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <IoWalletOutline className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Pricing</h3>
                </div>
                {expandedSections.pricing ? (
                  <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
                ) : (
                  <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedSections.pricing && (
                <div className="px-6 pb-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatCurrency(booking.dailyRate)} × {booking.numberOfDays} days
                    </span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(booking.subtotal)}</span>
                  </div>

                  {booking.deliveryFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Delivery fee</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(booking.deliveryFee)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Service fee</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(booking.serviceFee)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Taxes</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(booking.taxes)}</span>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-semibold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-lg text-orange-600 dark:text-orange-400">
                      {formatCurrency(booking.totalAmount)}
                    </span>
                  </div>

                  {booking.securityDeposit > 0 && (
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>Security deposit</span>
                      <span>{formatCurrency(booking.securityDeposit)}</span>
                    </div>
                  )}

                  <div className="pt-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      booking.paymentStatus === 'PAID'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      Payment: {booking.paymentStatus}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Insurance Status */}
            {insurance && (
              <div className={`rounded-lg border p-4 ${
                insurance.requiresGuestInsurance
                  ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
                  : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {insurance.requiresGuestInsurance ? (
                    <IoWarningOutline className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
                  )}
                  <h4 className={`font-medium ${
                    insurance.requiresGuestInsurance
                      ? 'text-amber-700 dark:text-amber-300'
                      : 'text-green-700 dark:text-green-300'
                  }`}>
                    Insurance
                  </h4>
                </div>
                <p className={`text-sm ${
                  insurance.requiresGuestInsurance
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {insurance.hasVehicleInsurance
                    ? `Vehicle: ${insurance.vehicleProvider || 'Own Policy'}`
                    : insurance.hasPartnerInsurance
                    ? `Partner: ${insurance.partnerProvider || 'Business Policy'}`
                    : 'Guest must provide insurance'}
                </p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {/* Edit only for PENDING */}
                {booking.status === 'PENDING' && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <IoCreateOutline className="w-4 h-4" />
                    Edit Booking
                  </button>
                )}

                {/* Actions for CONFIRMED/ACTIVE */}
                {(booking.status === 'CONFIRMED' || booking.status === 'ACTIVE') && (
                  <>
                    <button
                      onClick={() => setShowExtendModal(true)}
                      className="w-full px-4 py-2 border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2"
                    >
                      <IoRefreshOutline className="w-4 h-4" />
                      Extend Rental
                    </button>
                    <button
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <IoCalendarOutline className="w-4 h-4" />
                      Modify Dates
                    </button>
                    <button
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <IoPersonOutline className="w-4 h-4" />
                      Change Customer
                    </button>
                  </>
                )}

                <button
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <IoSwapHorizontalOutline className="w-4 h-4" />
                  Change Vehicle
                </button>

                <button
                  onClick={() => setShowChargeModal(true)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <IoWalletOutline className="w-4 h-4" />
                  Add Charge / Add-On
                </button>

                <Link
                  href={`/partner/bookings/new?customerId=${renter?.id}`}
                  className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  <IoAddOutline className="w-4 h-4" />
                  New Booking
                </Link>
              </div>
            </div>

            {/* Timestamps */}
            <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
              <p>Created: {new Date(booking.createdAt).toLocaleString()}</p>
              <p>Updated: {new Date(booking.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* What's Needed - Checklist Section */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <IoAlertCircleOutline className="w-5 h-5 text-orange-500" />
            What&apos;s Needed for This Booking
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Guest Verification */}
            <div className={`p-4 rounded-lg border ${
              renter?.verification.identity.status === 'verified'
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ID Verification</span>
                {renter?.verification.identity.status === 'verified' ? (
                  <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                ) : (
                  <IoAlertCircleOutline className="w-5 h-5 text-amber-600" />
                )}
              </div>
              {renter?.verification.identity.status !== 'verified' && (
                <button
                  onClick={sendVerificationRequest}
                  disabled={sendingVerification}
                  className="w-full mt-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg flex items-center justify-center gap-1"
                >
                  <IoSendOutline className="w-3 h-3" />
                  {sendingVerification ? 'Sending...' : 'Quick Send'}
                </button>
              )}
            </div>

            {/* Insurance */}
            <div className={`p-4 rounded-lg border ${
              !insurance?.requiresGuestInsurance
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Insurance</span>
                {!insurance?.requiresGuestInsurance ? (
                  <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                ) : (
                  <IoAlertCircleOutline className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {insurance?.hasVehicleInsurance ? 'Vehicle covered' :
                 insurance?.hasPartnerInsurance ? 'Partner policy' : 'Guest needs insurance'}
              </p>
              {insurance?.requiresGuestInsurance && (
                <button className="w-full mt-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg flex items-center justify-center gap-1">
                  <IoSendOutline className="w-3 h-3" />
                  Request Insurance
                </button>
              )}
            </div>

            {/* Payment */}
            <div className={`p-4 rounded-lg border ${
              booking.paymentStatus === 'PAID'
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment</span>
                {booking.paymentStatus === 'PAID' ? (
                  <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                ) : (
                  <IoAlertCircleOutline className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {booking.paymentStatus === 'PAID' ? 'Payment received' :
                 booking.paymentStatus === 'PENDING' ? 'Awaiting payment' : booking.paymentStatus}
              </p>
              {booking.paymentStatus !== 'PAID' && (
                <button
                  onClick={markAsPaid}
                  disabled={markingPaid}
                  className="w-full mt-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white text-sm rounded-lg flex items-center justify-center gap-1"
                >
                  {markingPaid ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                  ) : (
                    <IoWalletOutline className="w-3 h-3" />
                  )}
                  {markingPaid ? 'Updating...' : 'Mark as Paid'}
                </button>
              )}
            </div>

            {/* Rental Agreement */}
            <div className={`p-4 rounded-lg border ${
              booking.agreementStatus === 'signed'
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Agreement</span>
                {booking.agreementStatus === 'signed' ? (
                  <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                ) : (
                  <IoAlertCircleOutline className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {booking.agreementStatus === 'signed' ? `Signed by ${booking.signerName}` :
                 booking.agreementStatus === 'viewed' ? 'Customer reviewing' :
                 booking.agreementStatus === 'sent' ? 'Awaiting signature' : 'Not sent yet'}
              </p>
              {booking.agreementStatus !== 'signed' && (
                <button
                  onClick={sendAgreement}
                  disabled={sendingAgreement}
                  className="w-full mt-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm rounded-lg flex items-center justify-center gap-1"
                >
                  {sendingAgreement ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                  ) : (
                    <IoSendOutline className="w-3 h-3" />
                  )}
                  {booking.agreementStatus === 'sent' || booking.agreementStatus === 'viewed' ? 'Resend' : 'Send for Signature'}
                </button>
              )}
            </div>
          </div>

          {/* Quick Communication */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Communication</h4>
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center gap-2">
                <IoMailOutline className="w-4 h-4" />
                Send Reminder Email
              </button>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg flex items-center gap-2">
                <IoCallOutline className="w-4 h-4" />
                Send SMS
              </button>
              <button
                onClick={sendAgreement}
                disabled={sendingAgreement}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm rounded-lg flex items-center gap-2"
              >
                {sendingAgreement ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <IoDocumentTextOutline className="w-4 h-4" />
                )}
                {booking.agreementStatus === 'sent' || booking.agreementStatus === 'viewed' || booking.agreementStatus === 'signed'
                  ? 'Resend Agreement'
                  : 'Send Agreement'}
              </button>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                <IoDocumentTextOutline className="w-4 h-4" />
                Send Booking Details
              </button>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                <IoLocationOutline className="w-4 h-4" />
                Send Pickup Instructions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Charge Modal */}
      {showChargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-4 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Charge</h3>
              <button
                onClick={() => setShowChargeModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <IoCloseOutline className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const chargeType = formData.get('chargeType') as string
                const amount = parseFloat(formData.get('amount') as string)
                const description = formData.get('description') as string

                try {
                  const response = await fetch(`/api/partner/bookings/${booking.id}/charges`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chargeType, amount, description })
                  })
                  const data = await response.json()
                  if (data.success) {
                    showToast('success', 'Charge added successfully')
                    setShowChargeModal(false)
                    fetchBookingDetails()
                  } else {
                    showToast('error', data.error || 'Failed to add charge')
                  }
                } catch {
                  showToast('error', 'Failed to add charge')
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Charge Type
                </label>
                <select
                  name="chargeType"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="DAMAGE">Damage</option>
                  <option value="CLEANING">Cleaning</option>
                  <option value="LATE_FEE">Late Fee</option>
                  <option value="MILEAGE">Mileage Overage</option>
                  <option value="FUEL">Fuel</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Describe the charge..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChargeModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium"
                >
                  Add Charge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extend Rental Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-4 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Extend Rental</h3>
              <button
                onClick={() => setShowExtendModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <IoCloseOutline className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Current End Date</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(booking.endDate)} at {booking.endTime}
              </p>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const newEndDate = formData.get('newEndDate') as string

                try {
                  const response = await fetch(`/api/partner/bookings/${booking.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endDate: newEndDate })
                  })
                  const data = await response.json()
                  if (data.success) {
                    showToast('success', 'Rental extended successfully')
                    setShowExtendModal(false)
                    fetchBookingDetails()
                  } else {
                    showToast('error', data.error || 'Failed to extend rental')
                  }
                } catch {
                  showToast('error', 'Failed to extend rental')
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New End Date
                </label>
                <input
                  type="date"
                  name="newEndDate"
                  required
                  min={new Date(booking.endDate).toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Additional cost will be calculated at {formatCurrency(booking.dailyRate)}/day
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExtendModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Extend Rental
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Booking Modal (for PENDING bookings) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg mx-4 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Booking</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <IoCloseOutline className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const updates = {
                  startDate: formData.get('startDate') as string,
                  endDate: formData.get('endDate') as string,
                  startTime: formData.get('startTime') as string,
                  endTime: formData.get('endTime') as string,
                  pickupLocation: formData.get('pickupLocation') as string,
                  notes: formData.get('notes') as string
                }

                try {
                  const response = await fetch(`/api/partner/bookings/${booking.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates)
                  })
                  const data = await response.json()
                  if (data.success) {
                    showToast('success', 'Booking updated successfully')
                    setShowEditModal(false)
                    fetchBookingDetails()
                  } else {
                    showToast('error', data.error || 'Failed to update booking')
                  }
                } catch {
                  showToast('error', 'Failed to update booking')
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    defaultValue={new Date(booking.startDate).toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    defaultValue={new Date(booking.endDate).toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pickup Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    defaultValue={booking.startTime}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Return Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    defaultValue={booking.endTime}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pickup Location
                </label>
                <input
                  type="text"
                  name="pickupLocation"
                  defaultValue={booking.pickupLocation || ''}
                  placeholder="Enter pickup location"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={booking.notes || ''}
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
