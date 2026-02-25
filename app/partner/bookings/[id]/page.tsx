// app/partner/bookings/[id]/page.tsx
// Comprehensive Booking Detail & Management Page

'use client'

import { useState, useEffect, use } from 'react'
import { useTranslations, useLocale } from 'next-intl'
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
  IoDownloadOutline,
  IoKeyOutline
} from 'react-icons/io5'
import { HandoffPanel } from './HandoffPanel'

interface BookingDetails {
  id: string
  status: string
  paymentStatus: string
  paymentType: string | null
  isRecruitedBooking: boolean
  recruitmentPaymentPreference: string | null
  recruitmentSource: string | null
  isGuestDriven: boolean
  hostApproval: string
  hostNotes: string | null
  hostReviewedAt: string | null
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
  // Handoff fields
  handoffStatus: string | null
  guestGpsDistance: number | null
  handoffAutoFallbackAt: string | null
  guestGpsVerifiedAt: string | null
  hostHandoffVerifiedAt: string | null
  hostHandoffDistance: number | null
  keyInstructionsDeliveredAt: string | null
  // Live tracking fields
  guestLiveDistance: number | null
  guestLiveUpdatedAt: string | null
  guestEtaMessage: string | null
  guestArrivalSummary: string | null
  guestLocationTrust: number | null
  // Onboarding fields
  onboardingCompletedAt: string | null
  licensePhotoUrl: string | null
  licenseBackPhotoUrl: string | null
  guestStripeVerified: boolean
  aiVerificationScore: number | null
  verificationMethod: string | null
  verificationDate: string | null
  // Host final review fields
  hostFinalReviewStatus: string | null
  hostFinalReviewDeadline: string | null
  depositAmount: number
  inspectionPhotosStart: Array<{ category: string; url: string }>
  inspectionPhotosEnd: Array<{ category: string; url: string }>
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
  instantBook: boolean
  keyInstructions: string | null
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

interface GuestHistory {
  totalBookings: number
  totalSpent: number
  bookings: { id: string }[]
  reviews: { id: string }[]
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: bookingId } = use(params)
  const t = useTranslations('PartnerBookings')

  const locale = useLocale()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [renter, setRenter] = useState<Renter | null>(null)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [partner, setPartner] = useState<Partner | null>(null)
  const [insurance, setInsurance] = useState<Insurance | null>(null)
  const [guestHistory, setGuestHistory] = useState<GuestHistory | null>(null)

  // Action states
  const [confirming, setConfirming] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [sendingVerification, setSendingVerification] = useState(false)
  const [sendingAgreement, setSendingAgreement] = useState(false)

  // Host review states
  const [hostApproving, setHostApproving] = useState(false)
  const [hostRejecting, setHostRejecting] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

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

  // Onboard modal state
  const [showOnboardModal, setShowOnboardModal] = useState(false)
  const [fleetOtherActiveCount, setFleetOtherActiveCount] = useState(0)

  // Communication states
  const [showCommModal, setShowCommModal] = useState<'pickup_instructions' | 'keys_instructions' | null>(null)
  const [commMessage, setCommMessage] = useState('')
  const [sendingComm, setSendingComm] = useState(false)
  const [commSendCounts, setCommSendCounts] = useState<Record<string, number>>({})

  // Tooltip state
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  // Toast notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
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
        setGuestHistory(data.guestHistory || null)
        setFleetOtherActiveCount(data.fleetOtherActiveCount || 0)
        // Fetch communication send counts
        try {
          const commRes = await fetch(`/api/partner/bookings/${bookingId}/communicate`)
          if (commRes.ok) {
            const commData = await commRes.json()
            if (commData.success) setCommSendCounts(commData.counts || {})
          }
        } catch { /* non-critical */ }
      } else {
        setError(data.error || t('bdErrorLoadBooking'))
      }
    } catch (err) {
      setError(t('bdErrorLoadDetails'))
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
        showToast('success', t('bdBookingConfirmedSuccess'))
      } else {
        showToast('error', data.error || t('bdFailedConfirmBooking'))
      }
    } catch {
      showToast('error', t('bdFailedConfirmBooking'))
    } finally {
      setConfirming(false)
    }
  }

  const cancelBooking = async () => {
    if (!booking || !confirm(t('bdConfirmCancelBooking'))) return

    setCancelling(true)
    try {
      const response = await fetch(`/api/partner/bookings/${booking.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setBooking(prev => prev ? { ...prev, status: 'CANCELLED' } : null)
        showToast('success', t('bdBookingCancelled'))
      } else {
        showToast('error', data.error || t('bdFailedCancelBooking'))
      }
    } catch {
      showToast('error', t('bdFailedCancelBooking'))
    } finally {
      setCancelling(false)
    }
  }

  // Host approve/reject handlers
  const hostApproveBooking = async () => {
    if (!booking || !confirm(t('bdConfirmApproveBooking'))) return

    setHostApproving(true)
    try {
      const response = await fetch(`/api/partner/bookings/${booking.id}/host-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      })
      const data = await response.json()

      if (response.ok) {
        setBooking(prev => prev ? { ...prev, status: 'CONFIRMED', hostApproval: 'APPROVED', paymentStatus: 'PAID' } : null)
        showToast('success', t('bdBookingApprovedSuccess'))
      } else {
        showToast('error', data.error || t('bdFailedApproveBooking'))
      }
    } catch {
      showToast('error', t('bdFailedApproveBooking'))
    } finally {
      setHostApproving(false)
    }
  }

  const hostRejectBooking = async () => {
    if (!booking || !rejectReason.trim()) return

    setHostRejecting(true)
    try {
      const response = await fetch(`/api/partner/bookings/${booking.id}/host-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', notes: rejectReason.trim() })
      })
      const data = await response.json()

      if (response.ok) {
        setBooking(prev => prev ? { ...prev, hostApproval: 'REJECTED', hostNotes: rejectReason.trim() } : null)
        setShowRejectModal(false)
        setRejectReason('')
        showToast('success', t('bdBookingRejectedSuccess'))
      } else {
        showToast('error', data.error || t('bdFailedRejectBooking'))
      }
    } catch {
      showToast('error', t('bdFailedRejectBooking'))
    } finally {
      setHostRejecting(false)
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
        showToast('success', t('bdVerificationLinkSent'))
      } else if (data.status === 'already_verified') {
        showToast('success', t('bdCustomerAlreadyVerified'))
        // Refresh to show updated verification status
        fetchBookingDetails()
      } else {
        showToast('error', data.error || t('bdFailedSendVerification'))
      }
    } catch {
      showToast('error', t('bdFailedSendVerificationLink'))
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
        showToast('success', data.message || t('bdAgreementSentSuccess'))
        // Refresh booking details to show updated status
        fetchBookingDetails()
      } else if (data.status === 'already_signed') {
        showToast('success', t('bdAgreementAlreadySigned'))
        fetchBookingDetails()
      } else {
        showToast('error', data.error || t('bdFailedSendAgreement'))
      }
    } catch {
      showToast('error', t('bdFailedSendAgreement'))
    } finally {
      setSendingAgreement(false)
    }
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const sendCommunication = async () => {
    if (!booking || !showCommModal || !commMessage.trim()) return

    setSendingComm(true)
    try {
      const response = await fetch(`/api/partner/bookings/${booking.id}/communicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: showCommModal, message: commMessage.trim() })
      })

      const data = await response.json()

      if (data.success) {
        showToast('success', data.message)
        setCommSendCounts(prev => ({
          ...prev,
          [showCommModal]: (prev[showCommModal] || 0) + 1
        }))
        setShowCommModal(null)
        setCommMessage('')
      } else {
        showToast('error', data.error || t('bdFailedSend'))
      }
    } catch {
      showToast('error', t('bdFailedSendCommunication'))
    } finally {
      setSendingComm(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showToast('success', t('bdCopiedToClipboard'))
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
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
        showToast('success', t('bdPaymentMarkedReceived'))
      } else {
        showToast('error', data.error || t('bdFailedUpdatePayment'))
      }
    } catch {
      showToast('error', t('bdFailedUpdatePayment'))
    } finally {
      setMarkingPaid(false)
    }
  }

  // Guest-driven = ItWhip platform booking (renter exists in our database, fleet approved)
  // Manual = host created this booking themselves for their own customer
  const isGuestDriven = booking?.isGuestDriven ?? false

  // Commission rate (Standard tier = 25%)
  const PLATFORM_COMMISSION_RATE = 0.25
  const PROCESSING_FEE = 1.50

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
              {error || t('bdBookingNotFound')}
            </h2>
            <Link
              href="/partner/bookings"
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400"
            >
              <IoArrowBackOutline className="w-4 h-4" />
              {t('bdBackToBookings')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" onClick={() => activeTooltip && setActiveTooltip(null)}>
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
                    {t('bdBookingDetails')}
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
              {isGuestDriven && booking.hostApproval === 'PENDING' ? (
                <>
                  <button
                    onClick={hostApproveBooking}
                    disabled={hostApproving}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium flex items-center gap-2"
                  >
                    {hostApproving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <IoCheckmarkOutline className="w-4 h-4" />
                    )}
                    {t('bdApproveBooking')}
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <IoCloseOutline className="w-4 h-4" />
                    {t('bdReject')}
                  </button>
                </>
              ) : (
                <>
                  {booking.status === 'PENDING' && !isGuestDriven && (
                    booking.isRecruitedBooking && !booking.paymentType ? (
                      <button
                        disabled
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg font-medium flex items-center gap-2 cursor-not-allowed"
                      >
                        <IoTimeOutline className="w-4 h-4" />
                        {t('bdWaitingForPayment')}
                      </button>
                    ) : booking.isRecruitedBooking && booking.paymentType === 'CARD' && booking.paymentStatus !== 'AUTHORIZED' ? (
                      <button
                        disabled
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg font-medium flex items-center gap-2 cursor-not-allowed"
                      >
                        <IoTimeOutline className="w-4 h-4" />
                        {t('bdWaitingForAuthorization')}
                      </button>
                    ) : (
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
                        {t('bdConfirmBooking')}
                      </button>
                    )
                  )}
                  {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && !isGuestDriven && (
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
                      {t('bdCancel')}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Recruited Booking Badges */}
          {booking.isRecruitedBooking && booking.status === 'PENDING' && (
            <div className="mt-2 sm:mt-3">
              {booking.paymentStatus === 'AUTHORIZED' && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
                  <IoCheckmarkCircleOutline className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">{t('bdPaymentAuthorized')}</span>
                </div>
              )}
              {booking.paymentType === 'CASH' && (
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
                  <IoWalletOutline className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">{t('bdCashAtPickup')}</span>
                </div>
              )}
              {!booking.paymentType && (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                  <IoTimeOutline className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">{t('bdAwaitingPaymentSelection')}</span>
                </div>
              )}
            </div>
          )}

          {/* Reservation Expiry Notice - For PENDING bookings */}
          {booking.status === 'PENDING' && (
            <div className="mt-2 sm:mt-3 flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
              <IoTimeOutline className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">
                <strong>{t('bdReservationExpires')}:</strong>{' '}
                {(() => {
                  const createdAt = new Date(booking.createdAt)
                  const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000) // 24 hours
                  const now = new Date()
                  const hoursLeft = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)))
                  const minutesLeft = Math.max(0, Math.floor(((expiresAt.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60)))

                  if (hoursLeft <= 0 && minutesLeft <= 0) {
                    return <span className="text-red-600 dark:text-red-400">{t('bdExpiredConfirmOrCancel')}</span>
                  }
                  return t('bdTimeRemainingToConfirm', { hours: hoursLeft, minutes: minutesLeft })
                })()}
              </span>
            </div>
          )}

          {/* Mobile Quick Actions - Full width buttons on mobile */}
          <div className="sm:hidden mt-3 flex gap-2">
            {isGuestDriven && booking.hostApproval === 'PENDING' ? (
              <>
                <button
                  onClick={hostApproveBooking}
                  disabled={hostApproving}
                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium flex items-center justify-center gap-2 text-sm"
                >
                  {hostApproving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <IoCheckmarkOutline className="w-4 h-4" />
                  )}
                  {t('bdApprove')}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-3 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center gap-2 text-sm"
                >
                  <IoCloseOutline className="w-4 h-4" />
                  {t('bdReject')}
                </button>
              </>
            ) : (
              <>
                {booking.status === 'PENDING' && !isGuestDriven && (
                  booking.isRecruitedBooking && !booking.paymentType ? (
                    <button
                      disabled
                      className="flex-1 px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg font-medium flex items-center justify-center gap-2 text-sm cursor-not-allowed"
                    >
                      <IoTimeOutline className="w-4 h-4" />
                      {t('bdWaitingForPayment')}
                    </button>
                  ) : booking.isRecruitedBooking && booking.paymentType === 'CARD' && booking.paymentStatus !== 'AUTHORIZED' ? (
                    <button
                      disabled
                      className="flex-1 px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg font-medium flex items-center justify-center gap-2 text-sm cursor-not-allowed"
                    >
                      <IoTimeOutline className="w-4 h-4" />
                      {t('bdWaitingForAuthorization')}
                    </button>
                  ) : (
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
                      {t('bdConfirm')}
                    </button>
                  )
                )}
                {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && !isGuestDriven && (
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
                    {t('bdCancel')}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Host Review / Approved / Rejected Banners — scrollable, not sticky */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Host Review Banner — when fleet approved and host needs to act */}
        {isGuestDriven && booking.hostApproval === 'PENDING' && (
          <div className="mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <IoAlertCircleOutline className="w-5 h-5 text-orange-500 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {t('bdYourApprovalRequired')}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {t('bdApprovalRequiredDesc')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Host Approved Banner */}
        {booking.hostApproval === 'APPROVED' && (
          <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg px-4 py-3 flex items-center gap-2">
            <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-800 dark:text-green-200 font-medium">{t('bdYouApprovedBooking')}</span>
            {booking.hostReviewedAt && (
              <span className="text-xs text-green-600 dark:text-green-400 ml-auto">
                {new Date(booking.hostReviewedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Host Rejected Banner */}
        {booking.hostApproval === 'REJECTED' && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <IoCloseCircleOutline className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-800 dark:text-red-200 font-medium">{t('bdYouRejectedBooking')}</span>
              {booking.hostReviewedAt && (
                <span className="text-xs text-red-600 dark:text-red-400 ml-auto">
                  {new Date(booking.hostReviewedAt).toLocaleDateString()}
                </span>
              )}
            </div>
            {booking.hostNotes && (
              <p className="text-xs text-red-700 dark:text-red-300 mt-2 ml-7">{t('bdReason')}: {booking.hostNotes}</p>
            )}
          </div>
        )}
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
                      <div className="mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {vehicle.year} {vehicle.make}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            vehicle.vehicleType === 'RIDESHARE'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                          }`}>
                            {vehicle.vehicleType}
                          </span>
                        </div>
                        <p className="text-base text-gray-600 dark:text-gray-400 font-medium">
                          {vehicle.model}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                        {vehicle.licensePlate && (
                          <span className="font-mono">{vehicle.licensePlate}</span>
                        )}
                        {vehicle.color && <span>{vehicle.color}</span>}
                        {vehicle.currentMileage && (
                          <span>{vehicle.currentMileage.toLocaleString()} {t('bdMi')}</span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-4">
                        <span className="text-orange-600 dark:text-orange-400 font-semibold">
                          {formatCurrency(vehicle.dailyRate)}/{t('bdDay')}
                        </span>
                        <Link
                          href={`/partner/fleet/${vehicle.id}`}
                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          {t('bdViewVehicle')} →
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
                        <div className="w-14 h-14 rounded-full border border-white shadow-sm overflow-hidden">
                          <img
                            src={renter.photo}
                            alt={renter.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 bg-gray-200 dark:bg-gray-600 rounded-full border border-white shadow-sm flex items-center justify-center">
                          <IoPersonOutline className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {renter.name}
                        </h3>
                        {/* Guest-driven: hide direct contact — host communicates via platform */}
                        {!isGuestDriven ? (
                          <>
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
                            {booking && (booking.status === 'CONFIRMED') && renter.phone && (
                              <button
                                onClick={async () => {
                                  try {
                                    const res = await fetch('/api/twilio/masked-call', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      credentials: 'include',
                                      body: JSON.stringify({ bookingId: booking.id }),
                                    })
                                    if (res.ok) {
                                      alert(t('bdCallGuestSuccess'))
                                    } else {
                                      const data = await res.json().catch(() => ({}))
                                      alert(data.error || t('bdCallGuestFailed'))
                                    }
                                  } catch {
                                    alert(t('bdCallGuestFailed'))
                                  }
                                }}
                                className="mt-1 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                              >
                                <IoCallOutline className="w-3.5 h-3.5" />
                                {t('bdCallGuest')}
                              </button>
                            )}
                          </>
                        ) : (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {t('bdContactViaPlatform')}
                          </p>
                        )}
                        {renter.memberSince && (
                          <p className="text-xs text-gray-400 mt-1">
                            {t('bdMemberSince')} {new Date(renter.memberSince).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/partner/customers/${renter.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      {t('bdViewProfile')} →
                    </Link>
                  </div>

                  {/* Verified ItWhip Guest Badges — guest-driven only */}
                  {isGuestDriven && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {/* Verified Badge */}
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'verified' ? null : 'verified') }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-full text-[10px] font-medium text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                        >
                          <IoShieldCheckmarkOutline className="w-3 h-3" />
                          {t('bdVerified')}
                        </button>
                        {activeTooltip === 'verified' && (
                          <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg z-50">
                            <p className="font-semibold mb-1">{t('bdIdentityVerified')}</p>
                            <p>{t('bdIdentityVerifiedDesc')}</p>
                            {booking.verificationMethod && (
                              <p className="mt-2 text-gray-300">
                                {t('bdVerifiedVia')}: {booking.verificationMethod}
                              </p>
                            )}
                            <div className="absolute bottom-0 left-6 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 dark:bg-gray-700" />
                          </div>
                        )}
                      </div>

                      {/* Insured Badge */}
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'insured' ? null : 'insured') }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-full text-[10px] font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                          <IoShieldOutline className="w-3 h-3" />
                          {t('bdInsured')}
                        </button>
                        {activeTooltip === 'insured' && (
                          <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg z-50">
                            <p className="font-semibold mb-1">{t('bdInsuranceCoverage')}</p>
                            <p>{t('bdInsuranceCoverageDesc')}</p>
                            <div className="absolute bottom-0 left-6 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 dark:bg-gray-700" />
                          </div>
                        )}
                      </div>

                      {/* Payment Badge — conditional Hold/Charged */}
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'payment' ? null : 'payment') }}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                            booking.paymentStatus === 'PAID'
                              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                              : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                          }`}
                        >
                          <IoWalletOutline className="w-3 h-3" />
                          {booking.paymentStatus === 'PAID' ? t('bdPaymentCharged') : t('bdPaymentHold')}
                        </button>
                        {activeTooltip === 'payment' && (
                          <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg z-50">
                            <p className="font-semibold mb-1">
                              {booking.paymentStatus === 'PAID' ? t('bdPaymentCapturedTitle') : t('bdPaymentOnHold')}
                            </p>
                            <p>{booking.paymentStatus === 'PAID' ? t('bdPaymentCapturedDesc') : t('bdPaymentOnHoldDesc')}</p>
                            <div className="absolute bottom-0 left-6 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 dark:bg-gray-700" />
                          </div>
                        )}
                      </div>

                      {/* Onboard Badge */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (booking.onboardingCompletedAt) {
                              setShowOnboardModal(true)
                            } else {
                              setActiveTooltip(activeTooltip === 'onboard' ? null : 'onboard')
                            }
                          }}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                            booking.onboardingCompletedAt
                              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                          }`}
                        >
                          {booking.onboardingCompletedAt
                            ? <IoCheckmarkCircleOutline className="w-3 h-3" />
                            : <IoCloseCircleOutline className="w-3 h-3" />
                          }
                          {booking.onboardingCompletedAt ? t('bdOnboarded') : t('bdNotOnboarded')}
                        </button>
                        {activeTooltip === 'onboard' && !booking.onboardingCompletedAt && (
                          <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg z-50">
                            <p className="font-semibold mb-1">{t('bdOnboardingPending')}</p>
                            <p>{t('bdOnboardingPendingDesc')}</p>
                            <div className="absolute bottom-0 left-6 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 dark:bg-gray-700" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Handoff Verification Panel — visible for confirmed + active + completed, guest-driven bookings */}
            {(booking.status === 'CONFIRMED' || booking.status === 'ACTIVE' || booking.status === 'COMPLETED') && isGuestDriven && booking.onboardingCompletedAt && (
              <HandoffPanel
                bookingId={booking.id}
                bookingStatus={booking.status}
                handoffStatus={booking.handoffStatus}
                guestDistance={booking.guestGpsDistance}
                isInstantBook={vehicle?.instantBook ?? false}
                savedKeyInstructions={vehicle?.keyInstructions ?? null}
                autoFallbackAt={booking.handoffAutoFallbackAt}
                hostHandoffVerifiedAt={booking.hostHandoffVerifiedAt}
                guestGpsVerifiedAt={booking.guestGpsVerifiedAt}
                keyInstructionsDeliveredAt={booking.keyInstructionsDeliveredAt}
                hostHandoffDistance={booking.hostHandoffDistance}
                licensePhotoUrl={booking.licensePhotoUrl}
                licenseBackPhotoUrl={booking.licenseBackPhotoUrl}
                guestLiveDistance={booking.guestLiveDistance}
                guestLiveUpdatedAt={booking.guestLiveUpdatedAt}
                guestEtaMessage={booking.guestEtaMessage}
                guestArrivalSummary={booking.guestArrivalSummary}
                guestLocationTrust={booking.guestLocationTrust}
                pickupLocation={booking.pickupLocation}
                hostFinalReviewStatus={booking.hostFinalReviewStatus}
                hostFinalReviewDeadline={booking.hostFinalReviewDeadline}
                depositAmount={booking.depositAmount}
                inspectionPhotosStart={booking.inspectionPhotosStart || []}
                inspectionPhotosEnd={booking.inspectionPhotosEnd || []}
              />
            )}

            {/* Guest History with Host */}
            {guestHistory && renter && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <IoReceiptOutline className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{t('bdGuestHistory')}</h3>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{guestHistory.totalBookings}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('bdTotalBookings')}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">${guestHistory.totalSpent.toFixed(2)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('bdSpentWithYou')}</p>
                    </div>
                  </div>

                  {guestHistory.bookings.length > 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('bdReturningGuest', { count: guestHistory.bookings.length })}</p>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('bdFirstBookingWithYou')}</p>
                  )}
                </div>
              </div>
            )}


            {/* Verification Status Section — only for manual bookings */}
            {renter && !isGuestDriven && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => toggleSection('verification')}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <IoShieldOutline className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{t('bdGuestVerification')}</h3>
                    {renter.verification.identity.status === 'verified' ? (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {t('bdVerified')}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        {t('bdPending')}
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
                        <span className="font-medium text-gray-900 dark:text-white">{t('bdIdentityVerification')}</span>
                        <span className={`flex items-center gap-1 ${getVerificationStatusColor(renter.verification.identity.status)}`}>
                          {renter.verification.identity.status === 'verified' ? (
                            <IoCheckmarkCircleOutline className="w-5 h-5" />
                          ) : renter.verification.identity.status === 'pending' ? (
                            <IoTimeOutline className="w-5 h-5" />
                          ) : (
                            <IoCloseCircleOutline className="w-5 h-5" />
                          )}
                          {renter.verification.identity.status === 'verified' ? t('bdVerified') :
                           renter.verification.identity.status === 'pending' ? t('bdPending') :
                           renter.verification.identity.status === 'failed' ? t('bdFailed') : t('bdNotStarted')}
                        </span>
                      </div>

                      {renter.verification.identity.status === 'verified' && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {renter.verification.identity.verifiedName && (
                            <p>{t('bdName')}: {renter.verification.identity.verifiedName}</p>
                          )}
                          {renter.verification.identity.verifiedAt && (
                            <p>{t('bdVerified')}: {new Date(renter.verification.identity.verifiedAt).toLocaleDateString()}</p>
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
                          {t('bdSendVerificationLink')}
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
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('bdEmail')}</span>
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
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('bdPhone')}</span>
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

            {/* Rental Agreement Section — only for manual bookings */}
            {!isGuestDriven && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => toggleSection('agreement')}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <IoDocumentTextOutline className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('bdRentalAgreement')}</h3>
                  {booking.agreementStatus === 'signed' ? (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {t('bdSigned')}
                    </span>
                  ) : booking.agreementStatus === 'sent' || booking.agreementStatus === 'viewed' ? (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {booking.agreementStatus === 'viewed' ? t('bdViewed') : t('bdSent')}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      {t('bdNotSent')}
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
                          <p className="font-medium text-green-700 dark:text-green-300">{t('bdAgreementSigned')}</p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {t('bdSignedByOn', { name: booking.signerName || '', date: booking.agreementSignedAt ? new Date(booking.agreementSignedAt).toLocaleDateString() : 'N/A' })}
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
                            {booking.agreementStatus === 'viewed' ? t('bdCustomerReviewing') : t('bdAwaitingSignature')}
                          </p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            {t('bdSentOn', { date: booking.agreementSentAt ? new Date(booking.agreementSentAt).toLocaleDateString() : 'N/A' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Agreement Preview */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-4 bg-gray-50 dark:bg-gray-900/50">
                    <div className="text-center mb-6">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">{t('bdVehicleRentalAgreement')}</h4>
                      <p className="text-sm text-gray-500">{t('bdBooking')}: {booking.id.slice(0, 8).toUpperCase()}</p>
                    </div>

                    <div className="space-y-4 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">{t('bdRenterGuest')}</p>
                          <p className="font-medium text-gray-900 dark:text-white">{renter?.name || booking.guestName}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">{t('bdVehicleOwnerPartner')}</p>
                          <p className="font-medium text-gray-900 dark:text-white">{partner?.companyName || partner?.name}</p>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <p className="text-gray-500 dark:text-gray-400 mb-2">{t('bdVehicle')}</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {vehicle?.year} {vehicle?.make} {vehicle?.model}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {vehicle?.carType} ({vehicle?.seats} {t('bdSeats')})
                        </p>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">{t('bdPickup')}</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(booking.startDate)} {t('bdAt')} {booking.startTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">{t('bdReturn')}</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(booking.endDate)} {t('bdAt')} {booking.endTime}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <p className="text-gray-500 dark:text-gray-400 mb-1">{t('bdPickupLocation')}</p>
                        <p className="font-medium text-gray-900 dark:text-white">{booking.pickupLocation}</p>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <p className="text-gray-500 dark:text-gray-400 mb-1">{t('bdTotalDays')}</p>
                        <p className="font-medium text-gray-900 dark:text-white">{booking.numberOfDays}</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
                      <p><strong>{t('bdGoverningLaw')}:</strong> {t('bdStateOfArizona')}</p>
                      <p><strong>{t('bdVenue')}:</strong> {t('bdMaricopaCounty')}</p>
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
                        {t('bdDownloadSignedAgreement')}
                      </a>
                    ) : (
                      <>
                        <button
                          onClick={() => window.print()}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <IoPrintOutline className="w-4 h-4" />
                          {t('bdPrintPreview')}
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
                            ? t('bdResendAgreement')
                            : t('bdSendForSignature')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            )}

            {/* Trip Charges Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => toggleSection('charges')}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <IoReceiptOutline className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('bdTripCharges')}</h3>
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
                      {t('bdNoAdditionalCharges')}
                    </p>
                  )}

                  <button
                    onClick={() => setShowChargeModal(true)}
                    className="mt-4 w-full px-4 py-2 border border-orange-300 dark:border-orange-600 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center justify-center gap-2"
                  >
                    <IoAddOutline className="w-4 h-4" />
                    {t('bdAddCharge')}
                  </button>
                </div>
              )}
            </div>

            {/* Notes Section */}
            {booking.notes && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('bdNotes')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {booking.notes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Pricing (manual) or Earnings (guest-driven) */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => toggleSection('pricing')}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <IoWalletOutline className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {isGuestDriven ? t('bdEarnings') : t('bdPricing')}
                  </h3>
                </div>
                {expandedSections.pricing ? (
                  <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
                ) : (
                  <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedSections.pricing && (
                <div className="px-6 pb-6 space-y-3">
                  {isGuestDriven ? (
                    <>
                      {/* Guest-Driven: What the guest paid (full breakdown) */}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t('bdRentalRate', { rate: formatCurrency(booking.dailyRate), days: booking.numberOfDays })}
                        </span>
                        <span className="text-gray-900 dark:text-white">{formatCurrency(booking.subtotal)}</span>
                      </div>
                      {booking.deliveryFee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{t('bdDelivery')}</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(booking.deliveryFee)}</span>
                        </div>
                      )}

                      {/* Your earnings */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('bdYourEarnings')}</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{t('bdRental')}</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(booking.subtotal)}</span>
                        </div>
                        {booking.deliveryFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{t('bdDelivery')}</span>
                            <span className="text-gray-900 dark:text-white">{formatCurrency(booking.deliveryFee)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{t('bdPlatformFee')}</span>
                          <span className="text-red-600 dark:text-red-400">
                            -{formatCurrency(booking.subtotal * PLATFORM_COMMISSION_RATE)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{t('bdProcessingFee')}</span>
                          <span className="text-red-600 dark:text-red-400">
                            -{formatCurrency(PROCESSING_FEE)}
                          </span>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-semibold">
                          <span className="text-gray-900 dark:text-white">{t('bdYouReceive')}</span>
                          <span className="text-lg text-green-600 dark:text-green-400">
                            {formatCurrency(booking.subtotal + booking.deliveryFee - (booking.subtotal * PLATFORM_COMMISSION_RATE) - PROCESSING_FEE)}
                          </span>
                        </div>
                      </div>

                      {booking.securityDeposit > 0 && (
                        <div className="flex items-start gap-2 pt-2 text-xs text-gray-500 dark:text-gray-400">
                          <IoShieldCheckmarkOutline className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{t('bdDepositHeldOnCard', { amount: formatCurrency(booking.securityDeposit) })}</span>
                        </div>
                      )}

                    </>
                  ) : booking.isRecruitedBooking ? (
                    <>
                      {/* Recruited Booking: Welcome discount pricing */}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t('bdRateTimesDays', { rate: formatCurrency(booking.dailyRate), days: booking.numberOfDays })}
                        </span>
                        <span className="text-gray-900 dark:text-white">{formatCurrency(booking.subtotal)}</span>
                      </div>

                      {booking.deliveryFee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{t('bdDeliveryFee')}</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(booking.deliveryFee)}</span>
                        </div>
                      )}

                      {/* Earnings breakdown with welcome discount */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('bdYourEarnings')}</p>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{t('bdRental')}</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(booking.subtotal)}</span>
                        </div>

                        {booking.deliveryFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{t('bdDelivery')}</span>
                            <span className="text-gray-900 dark:text-white">{formatCurrency(booking.deliveryFee)}</span>
                          </div>
                        )}

                        {/* Standard fee strikethrough */}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400 dark:text-gray-500 line-through">{t('bdStandardPlatformFee')}</span>
                          <span className="text-gray-400 dark:text-gray-500 line-through">
                            -{formatCurrency(booking.subtotal * PLATFORM_COMMISSION_RATE)}
                          </span>
                        </div>

                        {/* Welcome discount highlight */}
                        <div className="flex justify-between text-sm bg-green-50 dark:bg-green-900/20 rounded-lg px-2 py-1.5 -mx-2">
                          <span className="text-green-700 dark:text-green-400 font-medium">{t('bdWelcomeDiscount')}</span>
                          <span className="text-green-700 dark:text-green-400 font-medium">
                            +{formatCurrency(booking.subtotal * PLATFORM_COMMISSION_RATE - booking.subtotal * 0.10)}
                          </span>
                        </div>

                        {/* Actual fee at 10% */}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{t('bdPlatformFee')} (10%)</span>
                          <span className="text-red-600 dark:text-red-400">
                            -{formatCurrency(booking.subtotal * 0.10)}
                          </span>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-semibold">
                          <span className="text-gray-900 dark:text-white">{t('bdYouReceive')}</span>
                          <span className="text-lg text-green-600 dark:text-green-400">
                            {formatCurrency(booking.subtotal + booking.deliveryFee - (booking.subtotal * 0.10))}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                        {t('bdWelcomeDiscountNote')}
                      </p>

                      <div className="pt-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          booking.paymentType === 'CASH'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : booking.paymentStatus === 'AUTHORIZED' || booking.paymentStatus === 'PAID'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {booking.paymentType === 'CASH' ? t('bdCashAtPickup') : `${t('bdPaymentColon')} ${booking.paymentStatus}`}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Manual: Show full pricing */}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t('bdRateTimesDays', { rate: formatCurrency(booking.dailyRate), days: booking.numberOfDays })}
                        </span>
                        <span className="text-gray-900 dark:text-white">{formatCurrency(booking.subtotal)}</span>
                      </div>

                      {booking.deliveryFee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{t('bdDeliveryFee')}</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(booking.deliveryFee)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{t('bdServiceFee')}</span>
                        <span className="text-gray-900 dark:text-white">{formatCurrency(booking.serviceFee)}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{t('bdTaxes')}</span>
                        <span className="text-gray-900 dark:text-white">{formatCurrency(booking.taxes)}</span>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-semibold">
                        <span className="text-gray-900 dark:text-white">{t('bdTotal')}</span>
                        <span className="text-lg text-orange-600 dark:text-orange-400">
                          {formatCurrency(booking.totalAmount)}
                        </span>
                      </div>

                      {booking.securityDeposit > 0 && (
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>{t('bdSecurityDeposit')}</span>
                          <span>{formatCurrency(booking.securityDeposit)}</span>
                        </div>
                      )}

                      <div className="pt-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          booking.paymentStatus === 'PAID'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {t('bdPaymentColon')} {booking.paymentStatus}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Rental Period */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <IoCalendarOutline className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('bdRentalPeriod')}</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('bdPickup')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(booking.startDate)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('bdAt')} {booking.startTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('bdReturn')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(booking.endDate)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('bdAt')} {booking.endTime}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IoLocationOutline className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {booking.pickupType === 'PARTNER_LOCATION' ? t('bdPartnerLocation') :
                         booking.pickupType === 'AIRPORT' ? t('bdAirportPickup') : t('bdDelivery')}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {booking.pickupLocation || t('bdBusinessLocation')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {t('bdDaysCount', { count: booking.numberOfDays })}
                    </span>
                    {(booking.status === 'CONFIRMED' || booking.status === 'ACTIVE') && new Date(booking.endDate) > new Date() ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {(() => {
                          const daysLeft = Math.max(0, Math.ceil((new Date(booking.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                          return t('bdDaysLeft', { count: daysLeft })
                        })()}
                      </p>
                    ) : booking.status === 'COMPLETED' ? (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-0.5">{t('bdTripCompleted')}</p>
                    ) : booking.status === 'CANCELLED' ? (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">{t('bdTripCancelled')}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Insurance Status — only for manual bookings (platform handles insurance for guest-driven) */}
            {insurance && !isGuestDriven && (
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
                    {t('bdInsurance')}
                  </h4>
                </div>
                <p className={`text-sm ${
                  insurance.requiresGuestInsurance
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {insurance.hasVehicleInsurance
                    ? t('bdInsuranceVehicle', { provider: insurance.vehicleProvider || t('bdOwnPolicy') })
                    : insurance.hasPartnerInsurance
                    ? t('bdInsurancePartner', { provider: insurance.partnerProvider || t('bdBusinessPolicy') })
                    : t('bdGuestMustProvideInsurance')}
                </p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('bdQuickActions')}</h3>
              <div className="space-y-2">
                {/* Edit Booking — only for manual PENDING bookings */}
                {booking.status === 'PENDING' && !isGuestDriven && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <IoCreateOutline className="w-4 h-4" />
                    {t('bdEditBooking')}
                  </button>
                )}

                {/* Guest-driven: Edit locked */}
                {isGuestDriven && booking.status === 'PENDING' && (
                  <div className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 rounded-lg flex items-center gap-2 cursor-not-allowed">
                    <IoCreateOutline className="w-4 h-4" />
                    {t('bdEditBooking')}
                    <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{t('bdLocked')}</span>
                  </div>
                )}

                {/* Extend/Modify/Change Customer — only for manual bookings */}
                {!isGuestDriven && (booking.status === 'CONFIRMED' || booking.status === 'ACTIVE') && (
                  <>
                    <button
                      onClick={() => setShowExtendModal(true)}
                      className="w-full px-4 py-2 border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2"
                    >
                      <IoRefreshOutline className="w-4 h-4" />
                      {t('bdExtendRental')}
                    </button>
                    <button
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <IoCalendarOutline className="w-4 h-4" />
                      {t('bdModifyDates')}
                    </button>
                    <button
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <IoPersonOutline className="w-4 h-4" />
                      {t('bdChangeCustomer')}
                    </button>
                  </>
                )}

                {/* Change Vehicle — gated by fleet availability */}
                <div className="relative group">
                  <button
                    disabled={!fleetOtherActiveCount}
                    className={`w-full px-4 py-2 border rounded-lg flex items-center gap-2 ${
                      fleetOtherActiveCount
                        ? 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <IoSwapHorizontalOutline className="w-4 h-4" />
                    {t('bdChangeVehicle')}
                  </button>
                  {!fleetOtherActiveCount && (
                    <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg z-50">
                      <p>{t('bdNoOtherVehicles')}</p>
                      <div className="absolute bottom-0 left-6 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 dark:bg-gray-700" />
                    </div>
                  )}
                </div>

                {/* Add Charge — always available */}
                <button
                  onClick={() => setShowChargeModal(true)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <IoWalletOutline className="w-4 h-4" />
                  {t('bdAddChargeAddon')}
                </button>

                {/* New Booking — only for manual bookings */}
                {!isGuestDriven && (
                  <Link
                    href={`/partner/bookings/new?customerId=${renter?.id}`}
                    className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center justify-center gap-2"
                  >
                    <IoAddOutline className="w-4 h-4" />
                    {t('bdNewBooking')}
                  </Link>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* What's Needed - Checklist Section */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <IoAlertCircleOutline className="w-5 h-5 text-orange-500" />
            {t('bdWhatsNeeded')}
          </h3>

          {isGuestDriven ? (
            /* Guest-Driven: Simplified checklist — only Payment + Trip Charges */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Platform Handled */}
              <div className="p-4 rounded-lg border bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('bdVerification')}</span>
                  <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-xs text-green-600 dark:text-green-400">{t('bdHandledByItWhip')}</p>
              </div>

              <div className="p-4 rounded-lg border bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('bdInsurance')}</span>
                  <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-xs text-green-600 dark:text-green-400">{t('bdHandledByItWhip')}</p>
              </div>

              {/* Payment */}
              <div className={`p-4 rounded-lg border ${
                booking.paymentStatus === 'PAID' || booking.paymentStatus === 'AUTHORIZED'
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                  : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('bdPayment')}</span>
                  {booking.paymentStatus === 'PAID' || booking.paymentStatus === 'AUTHORIZED' ? (
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                  ) : (
                    <IoAlertCircleOutline className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {booking.paymentStatus === 'PAID' ? t('bdPaymentCaptured') :
                   booking.paymentStatus === 'AUTHORIZED' ? t('bdPaymentHeldPendingApproval') :
                   booking.paymentStatus}
                </p>
              </div>
            </div>
          ) : (
            /* Manual: Full checklist — Verification, Insurance, Payment, Agreement */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Guest Verification */}
              <div className={`p-4 rounded-lg border ${
                renter?.verification.identity.status === 'verified'
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                  : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('bdIdVerification')}</span>
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
                    {sendingVerification ? t('bdSending') : t('bdQuickSend')}
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
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('bdInsurance')}</span>
                  {!insurance?.requiresGuestInsurance ? (
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                  ) : (
                    <IoAlertCircleOutline className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {insurance?.hasVehicleInsurance ? t('bdVehicleCovered') :
                   insurance?.hasPartnerInsurance ? t('bdPartnerPolicy') : t('bdGuestNeedsInsurance')}
                </p>
                {insurance?.requiresGuestInsurance && (
                  <button className="w-full mt-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg flex items-center justify-center gap-1">
                    <IoSendOutline className="w-3 h-3" />
                    {t('bdRequestInsurance')}
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
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('bdPayment')}</span>
                  {booking.paymentStatus === 'PAID' ? (
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                  ) : (
                    <IoAlertCircleOutline className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {booking.paymentStatus === 'PAID' ? t('bdPaymentReceived') :
                   booking.paymentStatus === 'PENDING' ? t('bdAwaitingPayment') : booking.paymentStatus}
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
                    {markingPaid ? t('bdUpdating') : t('bdMarkAsPaid')}
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
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('bdAgreement')}</span>
                  {booking.agreementStatus === 'signed' ? (
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                  ) : (
                    <IoAlertCircleOutline className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {booking.agreementStatus === 'signed' ? t('bdSignedBy', { name: booking.signerName || '' }) :
                   booking.agreementStatus === 'viewed' ? t('bdCustomerReviewing') :
                   booking.agreementStatus === 'sent' ? t('bdAwaitingSignature') : t('bdNotSentYet')}
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
                    {booking.agreementStatus === 'sent' || booking.agreementStatus === 'viewed' ? t('bdResend') : t('bdSendForSignature')}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick Communication */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('bdQuickCommunication')}</h4>
            <div className="flex flex-wrap gap-2">
              {/* Agreement button — only for manual bookings */}
              {!isGuestDriven && (
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
                    ? t('bdResendAgreement')
                    : t('bdSendAgreement')}
                </button>
              )}
              {/* Booking Details — manual only */}
              {!isGuestDriven && (
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                  <IoDocumentTextOutline className="w-4 h-4" />
                  {t('bdSendBookingDetails')}
                </button>
              )}
              {/* Send Pickup Instructions — only for ItWhip guest-driven bookings */}
              {isGuestDriven && (
                <button
                  onClick={() => { setCommMessage(''); setShowCommModal('pickup_instructions') }}
                  disabled={(commSendCounts.pickup_instructions || 0) >= 2}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <IoLocationOutline className="w-4 h-4" />
                  {t('bdSendPickupInstructions')}
                  {(commSendCounts.pickup_instructions || 0) > 0 && (
                    <span className="text-xs text-gray-400">({commSendCounts.pickup_instructions}/2)</span>
                  )}
                </button>
              )}
              {/* Send Keys Instructions — only for ItWhip guest-driven + instant pickup vehicles */}
              {isGuestDriven && (
                <div className="relative group inline-block">
                  <button
                    onClick={() => { setCommMessage(''); setShowCommModal('keys_instructions') }}
                    disabled={!vehicle?.instantBook || (commSendCounts.keys_instructions || 0) >= 2}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <IoKeyOutline className="w-4 h-4" />
                    {t('bdSendKeysInstructions')}
                    {(commSendCounts.keys_instructions || 0) > 0 && (
                      <span className="text-xs text-gray-400">({commSendCounts.keys_instructions}/2)</span>
                    )}
                  </button>
                  {!vehicle?.instantBook && (
                    <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg z-50">
                      <p>{t('bdKeysInstantOnly')}</p>
                      <div className="absolute bottom-0 left-6 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 dark:bg-gray-700" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Add Charge Modal */}
      {showChargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-4 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('bdAddCharge')}</h3>
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
                    showToast('success', t('bdChargeAddedSuccess'))
                    setShowChargeModal(false)
                    fetchBookingDetails()
                  } else {
                    showToast('error', data.error || t('bdFailedAddCharge'))
                  }
                } catch {
                  showToast('error', t('bdFailedAddCharge'))
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('bdChargeType')}
                </label>
                <select
                  name="chargeType"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="DAMAGE">{t('bdDamage')}</option>
                  <option value="CLEANING">{t('bdCleaning')}</option>
                  <option value="LATE_FEE">{t('bdLateFee')}</option>
                  <option value="MILEAGE">{t('bdMileageOverage')}</option>
                  <option value="FUEL">{t('bdFuel')}</option>
                  <option value="OTHER">{t('bdOther')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('bdAmount')}
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
                  {t('bdDescription')}
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder={t('bdDescribeCharge')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChargeModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('bdCancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium"
                >
                  {t('bdAddCharge')}
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('bdExtendRental')}</h3>
              <button
                onClick={() => setShowExtendModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <IoCloseOutline className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('bdCurrentEndDate')}</p>
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
                    showToast('success', t('bdRentalExtendedSuccess'))
                    setShowExtendModal(false)
                    fetchBookingDetails()
                  } else {
                    showToast('error', data.error || t('bdFailedExtendRental'))
                  }
                } catch {
                  showToast('error', t('bdFailedExtendRental'))
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('bdNewEndDate')}
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
                  {t('bdAdditionalCostCalculated', { rate: formatCurrency(booking.dailyRate) })}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExtendModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('bdCancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  {t('bdExtendRental')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Communication Modal */}
      {showCommModal && booking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {showCommModal === 'pickup_instructions' ? t('bdSendPickupInstructions') : t('bdSendKeysInstructions')}
                </h3>
                <button
                  onClick={() => setShowCommModal(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <IoCloseOutline className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('bdCommModalDisclaimer')}
              </p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {showCommModal === 'pickup_instructions'
                  ? t('bdPickupInstructionsLabel')
                  : t('bdKeysInstructionsLabel')}
              </label>
              <textarea
                value={commMessage}
                onChange={(e) => setCommMessage(e.target.value)}
                placeholder={showCommModal === 'pickup_instructions'
                  ? t('bdPickupPlaceholder')
                  : t('bdKeysPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={5}
                maxLength={2000}
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-400">{commMessage.length}/2000</span>
                <span className="text-xs text-gray-400">
                  {t('bdSendsRemaining', { count: 2 - (commSendCounts[showCommModal] || 0) })}
                </span>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowCommModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('bdCancel')}
              </button>
              <button
                onClick={sendCommunication}
                disabled={sendingComm || !commMessage.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                {sendingComm ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <IoSendOutline className="w-4 h-4" />
                )}
                {t('bdSendToGuest')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Host Reject Modal */}
      {showRejectModal && booking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('bdRejectBooking')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('bdRejectBookingDesc')}
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('bdReasonForRejection')} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder={t('bdRejectReasonPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason('') }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
              >
                {t('bdCancel')}
              </button>
              <button
                onClick={hostRejectBooking}
                disabled={hostRejecting || !rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2"
              >
                {hostRejecting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <IoCloseOutline className="w-4 h-4" />
                )}
                {t('bdRejectBooking')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal (for PENDING bookings) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg mx-4 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('bdEditBooking')}</h3>
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
                    showToast('success', t('bdBookingUpdatedSuccess'))
                    setShowEditModal(false)
                    fetchBookingDetails()
                  } else {
                    showToast('error', data.error || t('bdFailedUpdateBooking'))
                  }
                } catch {
                  showToast('error', t('bdFailedUpdateBooking'))
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('bdStartDate')}
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
                    {t('bdEndDate')}
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
                    {t('bdPickupTime')}
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
                    {t('bdReturnTime')}
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
                  {t('bdPickupLocation')}
                </label>
                <input
                  type="text"
                  name="pickupLocation"
                  defaultValue={booking.pickupLocation || ''}
                  placeholder={t('bdEnterPickupLocation')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('bdNotes')}
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={booking.notes || ''}
                  placeholder={t('bdAdditionalNotes')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('bdCancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium"
                >
                  {t('bdSaveChanges')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Onboard Details Modal */}
      {showOnboardModal && booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowOnboardModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg mx-4 p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('bdOnboardingDetails')}</h3>
              <button onClick={() => setShowOnboardModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <IoCloseOutline className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Verification Method */}
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('bdVerificationMethod')}</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {booking.verificationMethod || t('bdUnknown')}
              </p>
              {booking.verificationDate && (
                <p className="text-xs text-gray-400 mt-1">
                  {t('bdVerifiedOn')} {new Date(booking.verificationDate).toLocaleDateString()}
                </p>
              )}
              {booking.aiVerificationScore != null && (
                <p className="text-xs text-gray-400 mt-1">
                  {t('bdConfidenceScore')}: {booking.aiVerificationScore}%
                </p>
              )}
            </div>

            {/* DL Front */}
            {booking.licensePhotoUrl ? (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('bdDLFront')}</p>
                <img
                  src={booking.licensePhotoUrl}
                  alt="Driver's License Front"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 pointer-events-none select-none"
                  onContextMenu={e => e.preventDefault()}
                  draggable={false}
                />
              </div>
            ) : (
              <div className="mb-4 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center text-sm text-gray-400">
                {t('bdNoDLFront')}
              </div>
            )}

            {/* DL Back */}
            {booking.licenseBackPhotoUrl ? (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('bdDLBack')}</p>
                <img
                  src={booking.licenseBackPhotoUrl}
                  alt="Driver's License Back"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 pointer-events-none select-none"
                  onContextMenu={e => e.preventDefault()}
                  draggable={false}
                />
              </div>
            ) : (
              <div className="mb-4 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center text-sm text-gray-400">
                {t('bdNoDLBack')}
              </div>
            )}

            <p className="text-xs text-gray-400 text-center mt-4">{t('bdViewOnlyNotice')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
