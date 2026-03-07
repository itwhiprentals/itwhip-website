// app/partner/bookings/[id]/page.tsx
// Comprehensive Booking Detail & Management Page

'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import {
  IoArrowBackOutline,
  IoCarOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoAlertCircleOutline,
  IoDocumentTextOutline,
  IoWalletOutline,
  IoArrowForwardOutline,
} from 'react-icons/io5'
import { HandoffPanel } from './HandoffPanel'
import { CashHandoffChecklist } from './components/CashHandoffChecklist'
import EarningsSection from './components/EarningsSection'
import RentalPeriodCard from '@/app/partner/requests/[id]/components/RentalPeriodCard'
import { GuestInfoCard } from '@/app/partner/components/GuestInfoCard'
import { CustomerSection } from './components/CustomerSection'
import { QuickActions } from './components/QuickActions'
import { WhatsNeeded } from './components/WhatsNeeded'
import { BookingHeader } from './components/BookingHeader'
import { VerificationSection } from './components/VerificationSection'
import { RentalAgreementSection } from './components/RentalAgreementSection'
import { MessagesSection } from './components/MessagesSection'
import { BookingModals } from './components/BookingModals'
import { TripChargesSection } from './components/TripChargesSection'
import BookingAgreementSection from './components/BookingAgreementSection'
import AddChargeSheet from './components/AddChargeSheet'
import BottomSheet from '@/app/components/BottomSheet'
import { formatPhoneNumber } from '@/app/utils/helpers'
import { useBookingModals } from './hooks/useBookingModals'
import { useBookingMessages } from './hooks/useBookingMessages'
import { useCommunication } from './hooks/useCommunication'

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
  // No-show fields
  tripStartedAt: string | null
  noShowDeadline: string | null
  noShowMarkedBy: string | null
  noShowMarkedAt: string | null
  noShowFeeCharged: number | null
  noShowFeeStatus: string | null
  // Reassignment / booking bridge fields
  originalBookingId: string | null
  replacedByBookingId: string | null
  vehicleAccepted: boolean
  vehicleAcceptedAt: string | null
  // Reservation request link
  reservationRequestId: string | null
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
  manuallyVerifiedByHost?: boolean
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
    documents?: {
      verified: boolean
      verifiedAt: string | null
      verifiedBy: string | null
    }
    adminOverride?: {
      isVerified: boolean
      fullyVerified: boolean
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
  approvalStatus?: string
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
  welcomeDiscountUsed: boolean
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

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: bookingId } = use(params)
  const t = useTranslations('PartnerBookings')
  const router = useRouter()
  const locale = useLocale()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [renter, setRenter] = useState<Renter | null>(null)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [partner, setPartner] = useState<Partner | null>(null)
  const [insurance, setInsurance] = useState<Insurance | null>(null)
  const [guestInsurance, setGuestInsurance] = useState<any>(null)
  const [guestHistory, setGuestHistory] = useState<GuestHistory | null>(null)

  // Action states
  const [confirming, setConfirming] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [markingNoShow, setMarkingNoShow] = useState(false)
  const [sendingVerification, setSendingVerification] = useState(false)
  const [sendingAgreement, setSendingAgreement] = useState(false)

  // Host review states
  const [hostApproving, setHostApproving] = useState(false)
  const [hostRejecting, setHostRejecting] = useState(false)

  // UI states
  const [markingPaid, setMarkingPaid] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    pricing: true,
    verification: true,
    agreement: false,
    charges: false,
    messages: true
  })

  const [activatingCar, setActivatingCar] = useState(false)

  // Verify guest state (#3)
  const [verifyingGuest, setVerifyingGuest] = useState(false)

  const [fleetOtherActiveCount, setFleetOtherActiveCount] = useState(0)

  // Tooltip state
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  // Toast notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  // Extracted hooks
  const modals = useBookingModals()
  const messages = useBookingMessages({ bookingId: booking?.id || null, showToast })
  const comm = useCommunication({ bookingId: booking?.id || null, showToast, t })

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
        // Redirect to request page if request stage is still active
        // (agreement not yet sent/viewed/signed — request page handles the onboarding)
        const b = data.booking
        if (b.reservationRequestId && !['sent', 'viewed', 'signed'].includes(b.agreementStatus || '')) {
          router.replace(`/partner/requests/${b.reservationRequestId}`)
          return
        }

        setBooking(data.booking)
        setRenter(data.renter)
        setVehicle(data.vehicle)
        setPartner(data.partner)
        setInsurance(data.insurance)
        setGuestInsurance(data.guestInsurance || null)
        setGuestHistory(data.guestHistory || null)
        setFleetOtherActiveCount(data.fleetOtherActiveCount || 0)
        messages.setBookingMessages(data.booking?.messages || data.messages || [])
        // Fetch communication send counts
        try {
          const commRes = await fetch(`/api/partner/bookings/${bookingId}/communicate`)
          if (commRes.ok) {
            const commData = await commRes.json()
            if (commData.success) comm.setCommSendCounts(commData.counts || {})
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

  // Auto-expand agreement + verification sections for PENDING manual bookings
  useEffect(() => {
    const manual = (booking?.bookingType || 'STANDARD') === 'MANUAL'
    if (booking?.status === 'PENDING' && manual) {
      setExpandedSections(prev => ({ ...prev, agreement: true, verification: true }))
    }
  }, [booking?.status, booking?.bookingType])

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
    if (!booking) return

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

  const markNoShow = async () => {
    if (!booking) return

    setMarkingNoShow(true)
    try {
      const response = await fetch(`/api/partner/bookings/${booking.id}/no-show`, {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        setBooking(prev => prev ? {
          ...prev,
          status: 'NO_SHOW',
          noShowMarkedBy: 'HOST',
          noShowMarkedAt: new Date().toISOString(),
          noShowFeeCharged: data.feeCharged ?? null,
          noShowFeeStatus: data.feeStatus ?? null,
        } : null)
        showToast('success', t('bdNoShowMarked'))
      } else {
        showToast('error', data.error || t('bdFailedMarkNoShow'))
      }
    } catch {
      showToast('error', t('bdFailedMarkNoShow'))
    } finally {
      setMarkingNoShow(false)
    }
  }

  // Host approve/reject handlers
  const hostApproveBooking = async () => {
    if (!booking) return

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
    if (!booking || !modals.rejectReason.trim()) return

    setHostRejecting(true)
    try {
      const response = await fetch(`/api/partner/bookings/${booking.id}/host-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', notes: modals.rejectReason.trim() })
      })
      const data = await response.json()

      if (response.ok) {
        setBooking(prev => prev ? { ...prev, hostApproval: 'REJECTED', hostNotes: modals.rejectReason.trim() } : null)
        modals.setShowRejectModal(false)
        modals.setRejectReason('')
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showToast('success', t('bdCopiedToClipboard'))
  }

  const formatDate = (dateStr: string) => {
    // Extract date part and use noon local time to avoid UTC midnight timezone shift
    // e.g. "2026-03-01T00:00:00.000Z" → "2026-03-01" → new Date("2026-03-01T12:00:00")
    const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr
    const d = new Date(datePart + 'T12:00:00')
    return d.toLocaleDateString(locale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime12h = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    const period = h >= 12 ? 'PM' : 'AM'
    const hour12 = h % 12 || 12
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`
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
      case 'NO_SHOW':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'ON_HOLD':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
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

  // #2 — Activate inactive car
  const handleCarClick = () => {
    if (!vehicle || vehicle.isActive) return
    if (vehicle.approvalStatus === 'APPROVED') {
      modals.setShowCarActivateModal(true)
    } else {
      modals.setShowCarNotApprovedModal(true)
    }
  }

  const activateCar = async () => {
    if (!vehicle) return
    setActivatingCar(true)
    try {
      const res = await fetch(`/api/partner/fleet/${vehicle.id}/toggle-active`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setVehicle(prev => prev ? { ...prev, isActive: true } : null)
        showToast('success', t('bdCarActivated'))
        modals.setShowCarActivateModal(false)
      } else {
        showToast('error', data.error || t('bdFailedActivateCar'))
      }
    } catch {
      showToast('error', t('bdFailedActivateCar'))
    } finally {
      setActivatingCar(false)
    }
  }

  // #3 — Verify guest via Stripe Identity ($5 fee)
  const verifyGuest = async () => {
    if (!booking) return
    setVerifyingGuest(true)
    try {
      const res = await fetch(`/api/partner/bookings/${booking.id}/verify-guest`, { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.open(data.url, '_blank')
        showToast('success', t('bdVerificationStarted'))
      } else {
        showToast('error', data.error || t('bdFailedStartVerification'))
      }
    } catch {
      showToast('error', t('bdFailedStartVerification'))
    } finally {
      setVerifyingGuest(false)
    }
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
  // Manual = host created this booking themselves or system-created from recruitment
  const isGuestDriven = booking?.isGuestDriven ?? false
  const isManualBooking = (booking?.bookingType || 'STANDARD') === 'MANUAL'

  // Commission rate: welcome discount (10%) for recruited hosts on first booking, else standard tier
  const PLATFORM_COMMISSION_RATE = 0.25
  const PROCESSING_FEE = 1.50
  const commissionRate = (booking?.isRecruitedBooking && partner?.welcomeDiscountUsed === false)
    ? 0.10
    : (partner?.currentCommissionRate || 0.25)

  // Strip system metadata prefixes from notes for display
  const cleanNotes = (notes: string | null): string | null => {
    if (!notes) return null
    return notes.replace(/\[.*?\]\s*/g, '').trim() || null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-200/70 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-200/70 dark:bg-gray-900 p-6">
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

  // All booking statuses (PENDING, CONFIRMED, ACTIVE, COMPLETED) use
  // the same unified layout — left column + right sidebar
  return (
    <div className="p-3 sm:p-4 space-y-4" onClick={() => activeTooltip && setActiveTooltip(null)}>
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
      <BookingHeader
        booking={booking}
        renter={renter}
        isManualBooking={isManualBooking}
        isGuestDriven={isGuestDriven}
        confirming={confirming}
        cancelling={cancelling}
        hostApproving={hostApproving}
        confirmBooking={confirmBooking}
        cancelBooking={cancelBooking}
        hostApproveBooking={hostApproveBooking}
        setShowRejectModal={modals.setShowRejectModal}
        copyToClipboard={copyToClipboard}
        getStatusColor={getStatusColor}
      />

      {/* Host Review / Approved / Rejected Banners — scrollable, not sticky */}
      <div>
        {/* Host Review Banner — when fleet approved and host needs to act */}
        {isGuestDriven && booking.hostApproval === 'PENDING' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
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

        {/* Host Approved Banner — only for guest-driven bookings where host explicitly approved */}
        {booking.hostApproval === 'APPROVED' && !isManualBooking && booking.status !== 'NO_SHOW' && booking.status !== 'CANCELLED' && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg px-4 py-3 flex items-center gap-2">
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
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-4 py-3">
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
        {/* No-Show Result Banner */}
        {booking.status === 'NO_SHOW' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <IoCloseCircleOutline className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-800 dark:text-red-200 font-medium">{t('bdNoShowBanner')}</span>
              {booking.noShowMarkedAt && (
                <span className="text-xs text-red-600 dark:text-red-400 ml-auto">
                  {new Date(booking.noShowMarkedAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="ml-7 mt-1 space-y-0.5">
              {booking.noShowMarkedBy && (
                <p className="text-xs text-red-700 dark:text-red-300">
                  {t('bdNoShowMarkedByLabel', { by: booking.noShowMarkedBy === 'HOST' ? t('bdNoShowByHost') : booking.noShowMarkedBy === 'ADMIN' ? t('bdNoShowByAdmin') : t('bdNoShowBySystem') })}
                </p>
              )}
              {booking.noShowFeeCharged != null && (
                <p className="text-xs text-red-700 dark:text-red-300">
                  {t('bdNoShowFeeLabel', { amount: `$${booking.noShowFeeCharged.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` })} — {booking.noShowFeeStatus}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Handoff Verification Panel — under header, visible for confirmed + active + completed, guest-driven bookings */}
      {(booking.status === 'CONFIRMED' || booking.status === 'ACTIVE' || booking.status === 'COMPLETED') && isGuestDriven &&
       (booking.onboardingCompletedAt || isManualBooking) && (
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

      {/* Main Content */}
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
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
                          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`}
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
                          {vehicle.model}{vehicle.trim ? ` ${vehicle.trim}` : ''}{vehicle.color ? <span className="text-sm font-normal text-gray-500 dark:text-gray-400"> ({vehicle.color})</span> : ''}
                        </h3>
                        <p className="text-sm font-mono text-gray-600 dark:text-gray-400 mt-0.5">
                          {vehicle.licensePlate || <span className="text-red-500 dark:text-red-400">MISSING PLATE</span>}
                        </p>
                        <span className="text-orange-600 dark:text-orange-400 font-semibold text-sm mt-1 inline-block">
                          {formatCurrency(vehicle.dailyRate)}/{t('bdDay')}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0 pb-0.5">
                      {!vehicle.isActive ? (
                        <button
                          onClick={handleCarClick}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase border border-red-300 dark:border-red-600 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                        >
                          INACTIVE
                        </button>
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

              {/* Customer Section — manual bookings use the shared GuestInfoCard */}
              {renter && (
                isManualBooking ? (
                  <GuestInfoCard
                    renter={renter}
                    isVerified={!!(
                      booking.guestStripeVerified
                      || renter.verification?.identity?.status === 'verified'
                      || renter.verification?.adminOverride?.isVerified
                      || renter.verification?.adminOverride?.fullyVerified
                      || renter.verification?.documents?.verified
                      || renter.manuallyVerifiedByHost
                    )}
                    guestInsurance={guestInsurance}
                    bookingId={booking.id}
                    bookingStatus={booking.status}
                    guestHistory={guestHistory}
                    formatCurrency={formatCurrency}
                  />
                ) : (
                  <CustomerSection
                    renter={renter}
                    booking={booking}
                    isGuestDriven={isGuestDriven}
                    isManualBooking={isManualBooking}
                    guestInsurance={guestInsurance}
                    guestHistory={guestHistory}
                    vehicle={vehicle}
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    setShowOnboardModal={modals.setShowOnboardModal}
                    setConfirmAction={modals.setConfirmAction}
                    verifyGuest={verifyGuest}
                    verifyingGuest={verifyingGuest}
                    formatCurrency={formatCurrency}
                  />
                )
              )}
            </div>

            {/* #4 — Rental Period — for manual bookings, RentalPeriodCard replaces this */}
            {!isManualBooking && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <IoCalendarOutline className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('bdRentalPeriod')}</h3>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('bdPickup')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(booking.startDate)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('bdAt')} {formatTime12h(booking.startTime)}</p>
                  </div>
                  <IoArrowForwardOutline className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('bdReturn')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(booking.endDate)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('bdAt')} {formatTime12h(booking.endTime)}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IoLocationOutline className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('bdPickupLocation')}</p>
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
            )}


            {/* RentalPeriodCard — manual bookings, left column all screens */}
            {isManualBooking && (
              <RentalPeriodCard
                startDate={booking.startDate}
                startTime={booking.startTime}
                endDate={booking.endDate}
                endTime={booking.endTime}
                pickupCity={undefined}
                pickupState={undefined}
                durationDays={booking.numberOfDays}
                dailyRate={booking.dailyRate}
                totalAmount={booking.subtotal}
                platformFee={booking.subtotal * commissionRate}
                hostEarnings={booking.subtotal - booking.subtotal * commissionRate}
                hasPendingCounterOffer={false}
                bookingStatus={booking.status}
                isExpired={false}
                hasDeclined={false}
                hasCompleted={true}
                onRequestDifferentRate={() => {}}
                onLearnHowItWorks={() => modals.setShowTaxInfo(true)}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
              />
            )}

            {/* Messages with Guest */}
            <MessagesSection
              bookingMessages={messages.bookingMessages}
              newMessage={messages.newMessage}
              setNewMessage={messages.setNewMessage}
              sendingMessage={messages.sendingMessage}
              sendBookingMessage={messages.sendBookingMessage}
              messagesContainerRef={messages.messagesContainerRef}
              expanded={expandedSections.messages}
              onToggle={() => toggleSection('messages')}
              readOnly={booking.status === 'NO_SHOW' || booking.status === 'CANCELLED'}
            />

            {/* Verification Status Section — left column for non-manual only */}
            {!isManualBooking && renter && !isGuestDriven && (
              <VerificationSection
                renter={renter}
                booking={booking}
                isManualBooking={isManualBooking}
                expanded={expandedSections.verification}
                onToggle={() => toggleSection('verification')}
                sendVerificationRequest={sendVerificationRequest}
                sendingVerification={sendingVerification}
                getVerificationStatusColor={getVerificationStatusColor}
                onLearnMoreVerification={() => modals.setShowVerificationInfo(true)}
              />
            )}

            {/* Rental Agreement Section */}
            {!isGuestDriven && (
              isManualBooking && booking.status === 'PENDING' ? (
                <BookingAgreementSection
                  booking={booking}
                  renterName={renter?.name || null}
                  partnerName={partner?.companyName || partner?.name || null}
                  partnerEmail={partner?.email || null}
                  commissionRate={commissionRate}
                  onRefresh={fetchBookingDetails}
                  showToast={showToast}
                  defaultExpanded={true}
                />
              ) : (
                <RentalAgreementSection
                  booking={booking}
                  renter={renter}
                  partner={partner}
                  vehicle={vehicle}
                  expanded={expandedSections.agreement}
                  onToggle={() => toggleSection('agreement')}
                  sendAgreement={sendAgreement}
                  sendingAgreement={sendingAgreement}
                  formatDate={formatDate}
                />
              )
            )}

            {/* Trip Charges Section — left column for non-manual only */}
            {!isManualBooking && (
              <TripChargesSection
                tripCharges={booking.tripCharges}
                expanded={expandedSections.charges}
                onToggle={() => toggleSection('charges')}
                onAddCharge={() => modals.setShowChargeModal(true)}
                formatCurrency={formatCurrency}
              />
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4">
            {/* Cash Handoff Checklist — desktop only */}
            {booking.paymentType === 'CASH' && (booking.status === 'CONFIRMED' || booking.status === 'ACTIVE' || booking.status === 'COMPLETED') && (
              <div className="hidden lg:block">
                <CashHandoffChecklist
                  bookingId={booking.id}
                  bookingStatus={booking.status}
                  handoffStatus={booking.handoffStatus}
                  paymentStatus={booking.paymentStatus}
                  onComplete={fetchBookingDetails}
                />
              </div>
            )}

            {!isManualBooking && (
              <EarningsSection
                booking={booking}
                isGuestDriven={isGuestDriven}
                isManualBooking={false}
                expanded={expandedSections.pricing}
                onToggle={() => toggleSection('pricing')}
                commissionRate={commissionRate}
                platformCommissionRate={PLATFORM_COMMISSION_RATE}
                processingFee={PROCESSING_FEE}
                formatCurrency={formatCurrency}
                insurance={insurance}
                onLearnMoreTax={() => modals.setShowTaxInfo(true)}
              />
            )}

            {/* Manual bookings: Verification + Trip Charges in sidebar */}
            {isManualBooking && renter && (
              <VerificationSection
                renter={renter}
                booking={booking}
                isManualBooking={isManualBooking}
                expanded={expandedSections.verification}
                onToggle={() => toggleSection('verification')}
                sendVerificationRequest={sendVerificationRequest}
                sendingVerification={sendingVerification}
                getVerificationStatusColor={getVerificationStatusColor}
                onLearnMoreVerification={() => modals.setShowVerificationInfo(true)}
              />
            )}

            {isManualBooking && (
              <TripChargesSection
                tripCharges={booking.tripCharges}
                expanded={expandedSections.charges}
                onToggle={() => toggleSection('charges')}
                onAddCharge={() => modals.setShowChargeModal(true)}
                formatCurrency={formatCurrency}
              />
            )}

            {/* Quick Actions — always last */}
            <QuickActions
              booking={booking}
              isGuestDriven={isGuestDriven}
              vehicle={vehicle}
              renterId={renter?.id || null}
              fleetOtherActiveCount={fleetOtherActiveCount}
              markingPaid={markingPaid}
              sendingAgreement={sendingAgreement}
              cancelling={cancelling}
              commSendCounts={comm.commSendCounts}
              setConfirmAction={modals.setConfirmAction}
              setShowEditModal={modals.setShowEditModal}
              setShowExtendModal={modals.setShowExtendModal}
              setShowChargeModal={modals.setShowChargeModal}
              setShowCommModal={comm.setShowCommModal}
              setCommMessage={comm.setCommMessage}
              markAsPaid={markAsPaid}
              sendAgreement={sendAgreement}
              cancelBooking={cancelBooking}
              markNoShow={markNoShow}
              markingNoShow={markingNoShow}
            />

          </div>
        </div>

        {/* What's Needed - Checklist Section */}
        <WhatsNeeded
          booking={booking}
          guestInsurance={guestInsurance}
          partner={partner}
          sendAgreement={sendAgreement}
        />
      </div>

      {/* Add Charge Modal */}
      <AddChargeSheet
        isOpen={modals.showChargeModal}
        onClose={() => modals.setShowChargeModal(false)}
        bookingId={booking.id}
        onSuccess={fetchBookingDetails}
        showToast={showToast}
      />

      {/* All Modals */}
      <BookingModals
        booking={booking}
        vehicle={vehicle}
        confirmAction={modals.confirmAction}
        setConfirmAction={modals.setConfirmAction}
        showCarActivateModal={modals.showCarActivateModal}
        setShowCarActivateModal={modals.setShowCarActivateModal}
        activateCar={activateCar}
        activatingCar={activatingCar}
        showCarNotApprovedModal={modals.showCarNotApprovedModal}
        setShowCarNotApprovedModal={modals.setShowCarNotApprovedModal}
        showExtendModal={modals.showExtendModal}
        setShowExtendModal={modals.setShowExtendModal}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        showToast={showToast}
        fetchBookingDetails={fetchBookingDetails}
        showCommModal={comm.showCommModal}
        setShowCommModal={comm.setShowCommModal}
        commMessage={comm.commMessage}
        setCommMessage={comm.setCommMessage}
        commSendCounts={comm.commSendCounts}
        sendCommunication={comm.sendCommunication}
        sendingComm={comm.sendingComm}
        showRejectModal={modals.showRejectModal}
        setShowRejectModal={modals.setShowRejectModal}
        rejectReason={modals.rejectReason}
        setRejectReason={modals.setRejectReason}
        hostRejectBooking={hostRejectBooking}
        hostRejecting={hostRejecting}
        showEditModal={modals.showEditModal}
        setShowEditModal={modals.setShowEditModal}
        showOnboardModal={modals.showOnboardModal}
        setShowOnboardModal={modals.setShowOnboardModal}
      />

      {/* Tax Responsibility BottomSheet */}
      <BottomSheet
        isOpen={modals.showTaxInfo}
        onClose={() => modals.setShowTaxInfo(false)}
        title={t('bdTaxInfoTitle')}
        size="small"
      >
        <div className="space-y-3 px-1">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">{t('bdManualBookings')}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t('bdTaxInfoManual')}</p>
          </div>
          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">{t('bdGuestTaxes')}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t('bdTaxInfoGuest')}</p>
          </div>
          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">1099 {t('bdStatus')}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t('bdTaxInfo1099')}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">{t('bdPlatformBookings')}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t('bdTaxInfoPlatform')}</p>
          </div>
        </div>
      </BottomSheet>

      {/* Guest Verification BottomSheet */}
      <BottomSheet
        isOpen={modals.showVerificationInfo}
        onClose={() => modals.setShowVerificationInfo(false)}
        title={t('bdVerificationInfoTitle')}
        size="small"
      >
        <div className="space-y-3 px-1">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">{t('bdVerifiedGuests')}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t('bdVerificationInfoVerified')}</p>
          </div>
          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">{t('bdNoDoubleVerification')}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t('bdVerificationInfoNoDouble')}</p>
          </div>
          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">{t('bdVerificationInfoTitle')}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t('bdVerificationInfoVisible')}</p>
          </div>
          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">{t('bdManualBookingVerification')}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t('bdVerificationInfoCost')}</p>
          </div>
          <div>
            <a
              href="https://itwhip.com/help/identity-verification"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-orange-600 dark:text-orange-400 font-medium hover:underline"
            >
              {t('bdLearnHowWeVerify')} →
            </a>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
