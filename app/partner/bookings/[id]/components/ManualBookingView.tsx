// app/partner/bookings/[id]/components/ManualBookingView.tsx
// Manual Booking Detail View — same layout as standard booking, manual booking content
// This component renders when bookingType === 'MANUAL'

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
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
  IoKeyOutline,
  IoDownloadOutline
} from 'react-icons/io5'
import { formatPhoneNumber } from '@/app/utils/helpers'
import BookingAgreementSection from './BookingAgreementSection'

// ─── Interfaces ───────────────────────────────────────────────

interface BookingDetails {
  id: string
  status: string
  paymentStatus: string
  paymentType: string | null
  bookingType: string
  isRecruitedBooking: boolean
  recruitmentPaymentPreference: string | null
  recruitmentAgreementPreference: string | null
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
  handoffStatus: string | null
  onboardingCompletedAt: string | null
  licensePhotoUrl: string | null
  licenseBackPhotoUrl: string | null
  guestStripeVerified: boolean
  aiVerificationScore: number | null
  verificationMethod: string | null
  verificationDate: string | null
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
    email: { verified: boolean; verifiedAt: string | null }
    phone: { verified: boolean }
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
  currentCommissionRate: number
  stripeConnected: boolean
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

interface ManualBookingViewProps {
  booking: BookingDetails
  renter: Renter | null
  vehicle: Vehicle | null
  partner: Partner | null
  insurance: Insurance | null
  guestHistory: GuestHistory | null
  fleetOtherActiveCount: number
  onRefresh: () => void
}

// ─── Component ────────────────────────────────────────────────

export default function ManualBookingView({
  booking, renter, vehicle, partner, insurance, guestHistory, fleetOtherActiveCount, onRefresh
}: ManualBookingViewProps) {
  const t = useTranslations('PartnerBookings')

  // Action states
  const [confirming, setConfirming] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [sendingVerification, setSendingVerification] = useState(false)
  const [sendingAgreement, setSendingAgreement] = useState(false)
  const [markingPaid, setMarkingPaid] = useState(false)

  // UI states
  const [showChargeModal, setShowChargeModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    pricing: true,
    verification: true,
    charges: false
  })

  // Communication states
  const [showCommModal, setShowCommModal] = useState<'pickup_instructions' | 'keys_instructions' | null>(null)
  const [commMessage, setCommMessage] = useState('')
  const [sendingComm, setSendingComm] = useState(false)
  const [commSendCounts, setCommSendCounts] = useState<Record<string, number>>({})

  // Toast notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Commission rate from host's actual tier
  const STANDARD_COMMISSION_RATE = 0.25
  const commissionRate = partner?.currentCommissionRate || 0.25
  const PROCESSING_FEE = 1.50

  // ─── Helpers ──────────────────────────────────────────────────

  const formatCurrency = (amount: number) =>
    `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'ACTIVE': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'COMPLETED': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
      case 'CANCELLED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    }
  }

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 dark:text-green-400'
      case 'pending': return 'text-yellow-600 dark:text-yellow-400'
      case 'failed': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-500 dark:text-gray-400'
    }
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showToast('success', t('bdCopiedToClipboard'))
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // ─── Actions ──────────────────────────────────────────────────

  const confirmBooking = async () => {
    setConfirming(true)
    try {
      const res = await fetch('/api/partner/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id })
      })
      const data = await res.json()
      if (data.success) {
        showToast('success', t('bdBookingConfirmedSuccess'))
        onRefresh()
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
    if (!confirm(t('bdConfirmCancelBooking'))) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/partner/bookings/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      })
      const data = await res.json()
      if (data.success) {
        showToast('success', t('bdBookingCancelled'))
        onRefresh()
      } else {
        showToast('error', data.error || t('bdFailedCancelBooking'))
      }
    } catch {
      showToast('error', t('bdFailedCancelBooking'))
    } finally {
      setCancelling(false)
    }
  }

  const sendVerificationRequest = async () => {
    if (!renter) return
    setSendingVerification(true)
    try {
      const res = await fetch('/api/partner/verify/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, guestEmail: renter.email })
      })
      const data = await res.json()
      if (data.success) {
        showToast('success', data.message || t('bdVerificationLinkSent'))
        onRefresh()
      } else {
        showToast('error', data.error || t('bdFailedSendVerification'))
      }
    } catch {
      showToast('error', t('bdFailedSendVerification'))
    } finally {
      setSendingVerification(false)
    }
  }

  // Quick action send agreement (used by sidebar + status summary — main section uses BookingAgreementSection)
  const sendAgreement = async () => {
    setSendingAgreement(true)
    try {
      const res = await fetch('/api/agreements/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id })
      })
      const data = await res.json()
      if (data.success) {
        showToast('success', data.message || t('bdAgreementSentSuccess'))
        onRefresh()
      } else if (data.status === 'already_signed') {
        showToast('success', t('bdAgreementAlreadySigned'))
        onRefresh()
      } else {
        showToast('error', data.error || t('bdFailedSendAgreement'))
      }
    } catch {
      showToast('error', t('bdFailedSendAgreement'))
    } finally {
      setSendingAgreement(false)
    }
  }

  const markAsPaid = async () => {
    setMarkingPaid(true)
    try {
      const res = await fetch(`/api/partner/bookings/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'PAID' })
      })
      const data = await res.json()
      if (data.success) {
        showToast('success', t('bdPaymentMarkedReceived'))
        onRefresh()
      } else {
        showToast('error', data.error || t('bdFailedUpdatePayment'))
      }
    } catch {
      showToast('error', t('bdFailedUpdatePayment'))
    } finally {
      setMarkingPaid(false)
    }
  }

  const sendCommunication = async () => {
    if (!showCommModal || !commMessage.trim()) return
    setSendingComm(true)
    try {
      const res = await fetch(`/api/partner/bookings/${booking.id}/communicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: showCommModal, message: commMessage.trim() })
      })
      const data = await res.json()
      if (data.success) {
        showToast('success', data.message)
        setShowCommModal(null)
        setCommMessage('')
        setCommSendCounts(prev => ({ ...prev, [showCommModal]: (prev[showCommModal] || 0) + 1 }))
      } else {
        showToast('error', data.error || t('bdFailedSend'))
      }
    } catch {
      showToast('error', t('bdFailedSend'))
    } finally {
      setSendingComm(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="p-3 sm:p-4 space-y-4">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? (
            <IoCheckmarkCircleOutline className="w-5 h-5" />
          ) : (
            <IoCloseCircleOutline className="w-5 h-5" />
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="p-3 sm:p-4">
          {/* Top row — title + badges + actions */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Link
                href="/partner/bookings"
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              >
                <IoArrowBackOutline className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </Link>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                {t('bdBookingDetails')}
              </h1>
              <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap uppercase flex-shrink-0 ${
                booking.paymentType === 'CASH'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : booking.paymentStatus === 'AUTHORIZED' || booking.paymentStatus === 'PAID'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {booking.paymentType === 'CASH' ? 'CASH' : `PAYMENT: ${booking.paymentStatus}`}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap uppercase flex-shrink-0 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                MANUAL BOOKING
              </span>
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              {booking.status === 'PENDING' && (
                <>
                  <button
                    onClick={confirmBooking}
                    disabled={confirming || !booking.paymentType}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2"
                  >
                    {confirming ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <IoCheckmarkOutline className="w-4 h-4" />
                    )}
                    {t('bdConfirm')}
                  </button>
                  <button
                    onClick={cancelBooking}
                    disabled={cancelling}
                    className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    {cancelling ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
                    ) : (
                      <IoCloseOutline className="w-4 h-4" />
                    )}
                    {t('bdCancel')}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Second line — booking ID + status */}
          <div className="ml-10 sm:ml-12 mt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-mono">
                {booking.id.slice(0, 8).toUpperCase()}
              </span>
              <button
                onClick={() => copyToClipboard(booking.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <IoCopyOutline className="w-3.5 h-3.5" />
              </button>
            </div>
            {!booking.paymentType && booking.status === 'PENDING' && (
              <p className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                <IoTimeOutline className="w-4 h-4 flex-shrink-0" />
                Awaiting guest payment selection
              </p>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="sm:hidden flex gap-2 mt-3">
            {booking.status === 'PENDING' && (
              <>
                <button
                  onClick={confirmBooking}
                  disabled={confirming || !booking.paymentType}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-1 text-sm"
                >
                  {confirming ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <IoCheckmarkOutline className="w-4 h-4" />
                  )}
                  {t('bdConfirm')}
                </button>
                <button
                  onClick={cancelBooking}
                  disabled={cancelling}
                  className="flex-1 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-medium flex items-center justify-center gap-1 text-sm"
                >
                  {cancelling ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
                  ) : (
                    <IoCloseOutline className="w-4 h-4" />
                  )}
                  {t('bdCancel')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-4">

            {/* Vehicle & Customer Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Vehicle Section */}
              {vehicle && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
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
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {vehicle.year} {vehicle.make}
                        </p>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {vehicle.model}{vehicle.color ? <span className="text-sm font-normal text-gray-500 dark:text-gray-400"> ({vehicle.color})</span> : ''}
                        </h3>
                        <p className="text-sm font-mono text-gray-600 dark:text-gray-400 mt-0.5">
                          {vehicle.licensePlate || <span className="text-red-500 dark:text-red-400">MISSING PLATE</span>}
                        </p>
                        <span className="text-orange-600 dark:text-orange-400 font-semibold text-sm mt-1 inline-block">
                          {formatCurrency(vehicle.dailyRate)}/{t('bdDay')}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0">
                      {!vehicle.isActive ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                          INACTIVE
                        </span>
                      ) : (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
                          vehicle.vehicleType === 'RIDESHARE'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                        }`}>
                          {vehicle.vehicleType === 'RIDESHARE' ? 'RIDESHARE' : 'RENTAL'}
                        </span>
                      )}
                      <Link
                        href={`/partner/fleet/${vehicle.id}`}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        {t('bdViewVehicle')} →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Section — direct contact for manual bookings */}
              {renter && (
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {renter.photo ? (
                        <div className="w-14 h-14 rounded-full border border-white shadow-sm overflow-hidden">
                          <img src={renter.photo} alt={renter.name} className="w-full h-full rounded-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 bg-gray-200 dark:bg-gray-600 rounded-full border border-white shadow-sm flex items-center justify-center">
                          <IoPersonOutline className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{renter.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <IoMailOutline className="w-4 h-4" />
                          {renter.email}
                        </div>
                        {renter.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <IoCallOutline className="w-4 h-4" />
                            +1 {formatPhoneNumber(renter.phone)}
                          </div>
                        )}
                        {booking.status === 'CONFIRMED' && renter.phone && (
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
                        {renter.memberSince && (
                          <p className="text-xs text-gray-400 mt-1">
                            {t('bdMemberSince')} {new Date(renter.memberSince).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                        ACTIVE MEMBER
                      </span>
                      <Link
                        href={`/partner/customers/${renter.id}`}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        {t('bdViewProfile')} →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Rental Period */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <IoCalendarOutline className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('bdRentalPeriod')}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('bdPickup')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(booking.startDate)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('bdAt')} {booking.startTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('bdReturn')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(booking.endDate)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('bdAt')} {booking.endTime}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IoLocationOutline className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Delivery/Pick Up</p>
                      <p className="font-medium text-gray-900 dark:text-white">{booking.pickupLocation || t('bdBusinessLocation')}</p>
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

            {/* Pricing / Earnings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => toggleSection('pricing')}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <IoWalletOutline className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('bdPricing')}</h3>
                </div>
                {expandedSections.pricing ? <IoChevronUpOutline className="w-5 h-5 text-gray-400" /> : <IoChevronDownOutline className="w-5 h-5 text-gray-400" />}
              </button>

              {expandedSections.pricing && (
                <div className="px-4 pb-4 space-y-3">
                  {/* Earnings breakdown — fees deducted from rental */}
                  <div className="space-y-2">
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

                    {booking.paymentType === 'CASH' ? (
                      /* Cash: no commission, host gets 100% */
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-semibold">
                        <span className="text-gray-900 dark:text-white">{t('bdYouReceive')}</span>
                        <span className="text-lg text-green-600 dark:text-green-400">
                          {formatCurrency(booking.subtotal + booking.deliveryFee)}
                        </span>
                      </div>
                    ) : (
                      /* Card/Platform: welcome discount (10% instead of 25%) */
                      <>
                        {/* Standard fee strikethrough */}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400 dark:text-gray-500 line-through">{t('bdStandardPlatformFee')}</span>
                          <span className="text-gray-400 dark:text-gray-500 line-through">
                            -{formatCurrency(booking.subtotal * STANDARD_COMMISSION_RATE)}
                          </span>
                        </div>

                        {/* Welcome discount highlight */}
                        <div className="flex justify-between text-sm bg-green-50 dark:bg-green-900/20 rounded-lg px-2 py-1.5 -mx-2">
                          <span className="text-green-700 dark:text-green-400 font-medium">{t('bdWelcomeDiscount')}</span>
                          <span className="text-green-700 dark:text-green-400 font-medium">
                            +{formatCurrency(booking.subtotal * STANDARD_COMMISSION_RATE - booking.subtotal * commissionRate)}
                          </span>
                        </div>

                        {/* Actual fee at host's rate */}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Platform fee ({Math.round(commissionRate * 100)}%)
                          </span>
                          <span className="text-red-600 dark:text-red-400">
                            -{formatCurrency(booking.subtotal * commissionRate)}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{t('bdProcessingFee')}</span>
                          <span className="text-red-600 dark:text-red-400">-{formatCurrency(PROCESSING_FEE)}</span>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-semibold">
                          <span className="text-gray-900 dark:text-white">{t('bdYouReceive')}</span>
                          <span className="text-lg text-green-600 dark:text-green-400">
                            {formatCurrency(booking.subtotal + booking.deliveryFee - (booking.subtotal * commissionRate) - PROCESSING_FEE)}
                          </span>
                        </div>

                        <p className="text-xs text-gray-400 mt-1">{t('bdWelcomeDiscountNote')}</p>
                      </>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* Guest History */}
            {guestHistory && renter && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <IoReceiptOutline className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{t('bdGuestHistory')}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{guestHistory.totalBookings}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('bdTotalBookings')}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(guestHistory.totalSpent)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('bdSpentWithYou')}</p>
                    </div>
                  </div>
                  {guestHistory.bookings.length > 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('bdReturningGuest', { count: guestHistory.bookings.length })}</p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">{t('bdFirstBookingWithYou')}</p>
                  )}
                </div>
              </div>
            )}

            {/* Guest Verification — disabled until payment selected */}
            {renter && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => toggleSection('verification')}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <IoShieldOutline className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{t('bdGuestVerification')}</h3>
                    {renter.verification.identity.status === 'verified' ? (
                      <span className="px-2 py-0.5 text-xs rounded font-medium uppercase bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{t('bdVerified')}</span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs rounded font-medium uppercase bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">{t('bdPending')}</span>
                    )}
                  </div>
                  {expandedSections.verification ? <IoChevronUpOutline className="w-5 h-5 text-gray-400" /> : <IoChevronDownOutline className="w-5 h-5 text-gray-400" />}
                </button>

                {expandedSections.verification && (
                  <div className="px-4 pb-4 space-y-4">
                    {/* Identity Verification */}
                    <div className={`p-4 rounded-lg ${
                      renter.verification.identity.status === 'verified' ? 'bg-green-50 dark:bg-green-900/20'
                      : renter.verification.identity.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/20'
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
                        !booking.paymentType ? (
                          <div className="mt-3">
                            <button
                              disabled
                              className="w-full px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg font-medium flex items-center justify-center gap-2 cursor-not-allowed"
                            >
                              <IoTimeOutline className="w-4 h-4" />
                              {t('bdSendVerificationLink')}
                            </button>
                            <p className="text-xs text-gray-400 mt-1 text-center">{t('bdVerificationDisabledUntilPayment')}</p>
                          </div>
                        ) : (
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
                        )
                      )}
                    </div>

                    {/* Email & Phone Verification */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg ${renter.verification.email.verified ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('bdEmail')}</span>
                          {renter.verification.email.verified ? <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" /> : <IoCloseCircleOutline className="w-5 h-5 text-gray-400" />}
                        </div>
                      </div>
                      <div className={`p-4 rounded-lg ${renter.verification.phone.verified ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('bdPhone')}</span>
                          {renter.verification.phone.verified ? <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" /> : <IoCloseCircleOutline className="w-5 h-5 text-gray-400" />}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rental Agreement — respects onboarding preference */}
            <BookingAgreementSection
              booking={booking}
              renterName={renter?.name || null}
              partnerName={partner?.companyName || partner?.name || null}
              partnerEmail={partner?.email || null}
              commissionRate={commissionRate}
              onRefresh={onRefresh}
              showToast={showToast}
            />

            {/* Trip Charges */}
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
                {expandedSections.charges ? <IoChevronUpOutline className="w-5 h-5 text-gray-400" /> : <IoChevronDownOutline className="w-5 h-5 text-gray-400" />}
              </button>

              {expandedSections.charges && (
                <div className="px-4 pb-4">
                  {booking.tripCharges.length > 0 ? (
                    <div className="space-y-3">
                      {booking.tripCharges.map((charge) => (
                        <div key={charge.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{charge.description}</p>
                            <p className="text-xs text-gray-500">{charge.chargeType} • {new Date(charge.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(charge.amount)}</p>
                            <span className={`text-xs ${charge.status === 'PAID' ? 'text-green-600' : charge.status === 'PENDING' ? 'text-yellow-600' : 'text-gray-500'}`}>
                              {charge.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">{t('bdNoAdditionalCharges')}</p>
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

          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4">

            {/* Insurance */}
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
                  <h4 className={`font-medium ${insurance.requiresGuestInsurance ? 'text-amber-700 dark:text-amber-300' : 'text-green-700 dark:text-green-300'}`}>
                    {t('bdInsurance')}
                  </h4>
                </div>
                <p className={`text-sm ${insurance.requiresGuestInsurance ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                  {insurance.hasVehicleInsurance
                    ? t('bdInsuranceVehicle', { provider: insurance.vehicleProvider || t('bdOwnPolicy') })
                    : insurance.hasPartnerInsurance
                    ? t('bdInsurancePartner', { provider: insurance.partnerProvider || t('bdBusinessPolicy') })
                    : t('bdGuestMustProvideInsurance')}
                </p>
              </div>
            )}

            {/* Quick Actions (merged with communication) */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('bdQuickActions')}</h3>
              <div className="space-y-2">
                {/* Edit Booking */}
                {booking.status === 'PENDING' && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <IoCreateOutline className="w-4 h-4" />
                    {t('bdEditBooking')}
                  </button>
                )}

                {/* Extend / Modify / Change Customer */}
                {(booking.status === 'CONFIRMED' || booking.status === 'ACTIVE') && (
                  <>
                    <button
                      onClick={() => setShowExtendModal(true)}
                      className="w-full px-4 py-2 border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2"
                    >
                      <IoRefreshOutline className="w-4 h-4" />
                      {t('bdExtendRental')}
                    </button>
                    <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                      <IoCalendarOutline className="w-4 h-4" />
                      {t('bdModifyDates')}
                    </button>
                    <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                      <IoPersonOutline className="w-4 h-4" />
                      {t('bdChangeCustomer')}
                    </button>
                  </>
                )}

                {/* Change Vehicle */}
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
                    <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] leading-snug rounded shadow-md z-50 whitespace-nowrap">
                      {t('bdNoOtherVehicles')}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-1.5 h-1.5 bg-gray-900 dark:bg-white" />
                    </div>
                  )}
                </div>

                {/* Add Charge */}
                <button
                  onClick={() => setShowChargeModal(true)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <IoWalletOutline className="w-4 h-4" />
                  {t('bdAddChargeAddon')}
                </button>

                {/* Mark as Paid */}
                {booking.paymentStatus !== 'PAID' && (
                  <button
                    onClick={markAsPaid}
                    disabled={markingPaid}
                    className="w-full px-4 py-2 border border-green-300 dark:border-green-600 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2"
                  >
                    {markingPaid ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500" />
                    ) : (
                      <IoWalletOutline className="w-4 h-4" />
                    )}
                    {markingPaid ? t('bdUpdating') : t('bdMarkAsPaid')}
                  </button>
                )}

                {/* Send Agreement — all 3 types (ITWHIP/OWN/BOTH) */}
                <button
                  onClick={sendAgreement}
                  disabled={sendingAgreement}
                  className="w-full px-4 py-2 border border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center gap-2"
                >
                  {sendingAgreement ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500" />
                  ) : (
                    <IoDocumentTextOutline className="w-4 h-4" />
                  )}
                  {booking.agreementStatus === 'sent' || booking.agreementStatus === 'viewed' || booking.agreementStatus === 'signed'
                    ? t('bdResendAgreement') : t('bdSendAgreement')}
                </button>

                {/* Send Pickup Instructions */}
                <button
                  onClick={() => { setCommMessage(''); setShowCommModal('pickup_instructions') }}
                  disabled={(commSendCounts.pickup_instructions || 0) >= 2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <IoLocationOutline className="w-4 h-4" />
                  {t('bdSendPickupInstructions')}
                  {(commSendCounts.pickup_instructions || 0) > 0 && (
                    <span className="ml-auto text-xs text-gray-400">({commSendCounts.pickup_instructions}/2)</span>
                  )}
                </button>

                {/* Send Keys Instructions */}
                <div className="relative group">
                  <button
                    onClick={() => { setCommMessage(''); setShowCommModal('keys_instructions') }}
                    disabled={!vehicle?.instantBook || (commSendCounts.keys_instructions || 0) >= 2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <IoKeyOutline className="w-4 h-4" />
                    {t('bdSendKeysInstructions')}
                    {(commSendCounts.keys_instructions || 0) > 0 && (
                      <span className="ml-auto text-xs text-gray-400">({commSendCounts.keys_instructions}/2)</span>
                    )}
                  </button>
                  {!vehicle?.instantBook && (
                    <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] leading-snug rounded shadow-md z-50 whitespace-nowrap">
                      {t('bdKeysInstantOnly')}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-1.5 h-1.5 bg-gray-900 dark:bg-white" />
                    </div>
                  )}
                </div>

                {/* New Booking */}
                <Link
                  href={`/partner/bookings/new?customerId=${renter?.id}`}
                  className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  <IoAddOutline className="w-4 h-4" />
                  {t('bdNewBooking')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* What's Needed — Insurance + Agreement only (no DL, no Payment) */}
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <IoAlertCircleOutline className="w-5 h-5 text-orange-500" />
            {t('bdWhatsNeeded')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Insurance */}
            <Link href="/partner/insurance" className={`block rounded-lg border overflow-hidden cursor-pointer transition-shadow hover:shadow-md ${
              insurance?.requiresGuestInsurance
                ? 'border-amber-200 dark:border-amber-800'
                : 'border-green-200 dark:border-green-800'
            }`}>
              <div className={`px-4 py-3 flex items-center justify-between ${
                insurance?.requiresGuestInsurance
                  ? 'bg-amber-100 dark:bg-amber-900/30'
                  : 'bg-green-100 dark:bg-green-900/30'
              }`}>
                <div className="flex items-center gap-2">
                  <IoShieldCheckmarkOutline className={`w-4 h-4 ${insurance?.requiresGuestInsurance ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`} />
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t('bdInsurance')}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                  insurance?.requiresGuestInsurance
                    ? 'bg-amber-500 text-white'
                    : 'bg-green-600 text-white'
                }`}>
                  {insurance?.requiresGuestInsurance ? t('bdRequired') : t('bdCovered')}
                </span>
              </div>
              <div className={`px-4 py-3 ${
                insurance?.requiresGuestInsurance
                  ? 'bg-amber-50 dark:bg-amber-900/10'
                  : 'bg-green-50 dark:bg-green-900/10'
              }`}>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {insurance?.requiresGuestInsurance ? t('bdGuestNeedsInsurance') : t('bdVehicleCovered')}
                </p>
                {insurance?.vehicleProvider && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{insurance.vehicleProvider}</p>
                )}
              </div>
            </Link>

            {/* Agreement */}
            <div className={`rounded-lg border overflow-hidden ${
              booking.agreementStatus === 'signed'
                ? 'border-green-200 dark:border-green-800'
                : 'border-amber-200 dark:border-amber-800'
            }`}>
              <div className={`px-4 py-3 flex items-center justify-between ${
                booking.agreementStatus === 'signed'
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-amber-100 dark:bg-amber-900/30'
              }`}>
                <div className="flex items-center gap-2">
                  <IoDocumentTextOutline className={`w-4 h-4 ${booking.agreementStatus === 'signed' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`} />
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t('bdAgreement')}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                  booking.agreementStatus === 'signed'
                    ? 'bg-green-600 text-white'
                    : 'bg-amber-500 text-white'
                }`}>
                  {booking.agreementStatus === 'signed' ? t('bdSigned') : t('bdPending')}
                </span>
              </div>
              <div className={`px-4 py-3 ${
                booking.agreementStatus === 'signed'
                  ? 'bg-green-50 dark:bg-green-900/10'
                  : 'bg-amber-50 dark:bg-amber-900/10'
              }`}>
                {booking.agreementStatus === 'signed' ? (
                  <>
                    {booking.signerName && booking.agreementSignedAt && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {t('bdSignedBy', { name: booking.signerName })} · {new Date(booking.agreementSignedAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                    {booking.agreementSignedPdfUrl && (
                      <a
                        href={booking.agreementSignedPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
                      >
                        <IoDownloadOutline className="w-3.5 h-3.5" />
                        {t('bdDownloadSignedAgreement')}
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {booking.agreementStatus === 'sent' || booking.agreementStatus === 'viewed' ? t('bdAwaitingSignature') : t('bdNotSentYet')}
                    </p>
                    <button
                      onClick={sendAgreement}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                    >
                      <IoSendOutline className="w-3.5 h-3.5" />
                      {booking.agreementStatus === 'sent' || booking.agreementStatus === 'viewed' ? t('bdResend') : t('bdSendForSignature')}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Stripe Connect / Bank Account */}
            <Link href="/partner/revenue" className={`block rounded-lg border overflow-hidden cursor-pointer transition-shadow hover:shadow-md ${
              partner?.stripeConnected
                ? 'border-green-200 dark:border-green-800'
                : 'border-red-200 dark:border-red-800'
            }`}>
              <div className={`px-4 py-3 flex items-center justify-between ${
                partner?.stripeConnected
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                <div className="flex items-center gap-2">
                  <IoWalletOutline className={`w-4 h-4 ${partner?.stripeConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t('bdBankAccount')}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                  partner?.stripeConnected
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white'
                }`}>
                  {partner?.stripeConnected ? t('bdConnected') : t('bdNotConnected')}
                </span>
              </div>
              <div className={`px-4 py-3 ${
                partner?.stripeConnected
                  ? 'bg-green-50 dark:bg-green-900/10'
                  : 'bg-red-50 dark:bg-red-900/10'
              }`}>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {partner?.stripeConnected ? t('bdBankConnected') : t('bdBankNotConnected')}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Communication Modal */}
      {showCommModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {showCommModal === 'pickup_instructions' ? t('bdSendPickupInstructions') : t('bdSendKeysInstructions')}
            </h3>
            <textarea
              value={commMessage}
              onChange={(e) => setCommMessage(e.target.value)}
              placeholder={showCommModal === 'pickup_instructions' ? t('bdPickupPlaceholder') : t('bdKeysPlaceholder')}
              className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowCommModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
              >
                {t('bdCancel')}
              </button>
              <button
                onClick={sendCommunication}
                disabled={sendingComm || !commMessage.trim()}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg flex items-center justify-center gap-2"
              >
                {sendingComm ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <IoSendOutline className="w-4 h-4" />
                )}
                {t('bdSend')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
