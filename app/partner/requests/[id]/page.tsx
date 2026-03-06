// app/partner/requests/[id]/page.tsx
// Request Detail Page for recruited hosts - mirrors booking details page structure
// Shows booking request info and onboarding steps in one unified view

'use client'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  IoArrowBackOutline,
  IoChatbubbleOutline,
  IoAlertCircleOutline,
} from 'react-icons/io5'
import RequestHeader from './components/RequestHeader'
import RequestQuickActions from './components/RequestQuickActions'
import CounterOfferModal from './components/CounterOfferModal'
import DeclineModal from './components/DeclineModal'
import OnboardingWizard from './components/OnboardingWizard'
import BottomSheet from '@/app/components/BottomSheet'
import RecruitmentBottomSheet from './components/RecruitmentBottomSheet'
import AgreementPreferenceStep from './components/AgreementPreferenceStep'
import PaymentPreferenceStep from './components/PaymentPreferenceStep'
import VehicleGuestCard from './components/VehicleGuestCard'
import RentalPeriodCard from './components/RentalPeriodCard'
import GuestVerificationCard from './components/GuestVerificationCard'
import RentalAgreementCard from './components/RentalAgreementCard'
import ProgressStepper from './components/ProgressStepper'
import HowItWorksSheet from './components/HowItWorksSheet'
import ConfirmSendSheet from './components/ConfirmSendSheet'
import { MessagesSection } from '@/app/partner/bookings/[id]/components/MessagesSection'
import { useBookingMessages } from '@/app/partner/bookings/[id]/hooks/useBookingMessages'
import BookingAgreementSection from '@/app/partner/bookings/[id]/components/BookingAgreementSection'
import { WhatsNeeded } from '@/app/partner/bookings/[id]/components/WhatsNeeded'
interface RequestData {
  host: {
    id: string
    name: string
    email: string
    phone: string | null
    hasPassword: boolean
    emailVerified: boolean
    onboardingStartedAt: string | null
    onboardingCompletedAt: string | null
    declinedRequestAt: string | null
    cars: Array<{
      id: string
      make: string
      model: string
      trim?: string
      year: number
      licensePlate?: string | null
      dailyRate?: number
      vehicleType?: string
      isActive?: boolean
      color?: string | null
      photos: Array<{ url: string }>
    }>
  }
  prospect: {
    id: string
    status: string
    counterOfferAmount: number | null
    counterOfferNote: string | null
    counterOfferStatus: string | null
  }
  request: {
    id: string
    status: string
    vehicleInfo: string | null
    guestName: string | null
    guestEmail: string | null
    guestPhone: string | null
    guestUserId: string | null
    startDate: string | null
    startTime: string | null
    endDate: string | null
    endTime: string | null
    durationDays: number | null
    pickupCity: string | null
    pickupState: string | null
    offeredRate: number | null
    totalAmount: number | null
    hostEarnings: number | null
    platformFee: number | null
    expiresAt: string | null
  }
  bookingId: string | null
  bookingSnapshot: {
    id: string
    status: string
    paymentType: string | null
    paymentStatus: string
    bookingType: string
    agreementStatus: string | null
    agreementSentAt: string | null
    agreementSignedAt: string | null
    agreementSignedPdfUrl: string | null
    signerName: string | null
    handoffStatus: string | null
    pickupLocation: string | null
    guestName: string | null
    guestEmail: string | null
    dailyRate: number
    subtotal: number
    totalAmount: number
    numberOfDays: number
    startDate: string | null
    endDate: string | null
    startTime: string | null
    endTime: string | null
    createdAt: string
    tripStartedAt: string | null
    noShowDeadline: string | null
    recruitmentAgreementPreference: string | null
  } | null
  partnerInfo: {
    stripeConnected: boolean
    companyName: string | null
    name: string
    email: string
  }
  guestInsurance: {
    provided: boolean
    provider: string | null
    policyNumber: string | null
    verified: boolean
    verifiedAt: string | null
    cardFrontUrl: string | null
    cardBackUrl: string | null
    expiryDate: string | null
    coverageType: string | null
    addedAt: string | null
  } | null
  onboardingProgress: {
    carPhotosUploaded: boolean
    ratesConfigured: boolean
    payoutConnected: boolean
    agreementUploaded: boolean
    agreementPreference: string | null
    paymentPreference: string | null
    firstCarName: string | null
    percentComplete: number
  }
  agreement?: {
    url?: string
    fileName?: string
    validationScore?: number
    validationSummary?: string
  }
  timeRemaining: {
    ms: number
    hours: number
    minutes: number
    expired: boolean
  } | null
}

export default function RequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  // Note: requestId from params not used - we fetch via /api/partner/onboarding which uses auth context
  void params?.id

  const locale = useLocale()
  const t = useTranslations('PartnerRequestDetail')
  const tBd = useTranslations('PartnerBookings')

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<RequestData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [timeDisplay, setTimeDisplay] = useState<string>('')
  const [showCounterOffer, setShowCounterOffer] = useState(false)
  const [showDecline, setShowDecline] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [startingOnboarding, setStartingOnboarding] = useState(false)
  const [copied, setCopied] = useState(false)
  const [connectingPayout, setConnectingPayout] = useState(false)
  const [sendingAgreement, setSendingAgreement] = useState(false)
  const [showRecruitmentSheet, setShowRecruitmentSheet] = useState(false)
  const [showEditAgreement, setShowEditAgreement] = useState(false)
  const [showEditPayment, setShowEditPayment] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [showConfirmSendSheet, setShowConfirmSendSheet] = useState(false)
  const [showOutsideInfo, setShowOutsideInfo] = useState(false)
  const [showTaxInfo, setShowTaxInfo] = useState(false)

  // Expandable sections
  const [expandedSections, setExpandedSections] = useState({
    pricing: true,
    verification: true,
    agreement: false,
    messages: true,
  })

  // Toast notification (lightweight — matches booking page pattern)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }, [])
  const messages = useBookingMessages({ bookingId: data?.bookingId || null, showToast })

  // Customer data for CustomerSection (fetched when guestUserId available)
  const [customerData, setCustomerData] = useState<any>(null)
  const fetchedGuestIdRef = useRef<string | null>(null)
  useEffect(() => {
    const gid = data?.request?.guestUserId
    if (!gid || fetchedGuestIdRef.current === gid) return
    fetchedGuestIdRef.current = gid
    fetch(`/api/partner/customers/${gid}`)
      .then(r => r.json())
      .then(result => {
        if (result.success) setCustomerData(result)
      })
      .catch(() => {})
  }, [data?.request?.guestUserId])

  // Fetch messages when bookingId is available
  const fetchedBookingIdRef = useRef<string | null>(null)
  useEffect(() => {
    const bid = data?.bookingId
    if (!bid || fetchedBookingIdRef.current === bid) return
    fetchedBookingIdRef.current = bid
    fetch(`/api/partner/messages?bookingId=${bid}`)
      .then(r => r.json())
      .then(result => {
        if (result.success && result.conversations?.[0]?.messages) {
          messages.setBookingMessages(result.conversations[0].messages)
        }
      })
      .catch(() => {})
  }, [data?.bookingId])

  const fetchRequest = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/partner/onboarding')
      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to load request')
        return
      }

      setData(result)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch request:', err)
      setError('Failed to load request details')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchRequest()
  }, [fetchRequest])

  // Auto-open recruitment bottom sheet when navigating from fleet "Add Car"
  useEffect(() => {
    if (data && !loading && searchParams.get('addCar') === '1') {
      setShowRecruitmentSheet(true)
    }
  }, [data, loading, searchParams])

  // Countdown timer
  useEffect(() => {
    if (!data?.timeRemaining || data.timeRemaining.expired) {
      setTimeDisplay(data?.timeRemaining?.expired ? t('expired') : '')
      return
    }

    const updateTimer = () => {
      if (!data?.request?.expiresAt) return

      const now = new Date()
      const expires = new Date(data.request.expiresAt)
      const diff = expires.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeDisplay(t('expired'))
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (hours > 0) {
        setTimeDisplay(`${hours}h ${minutes}m`)
      } else {
        setTimeDisplay(`${minutes}m`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [data?.timeRemaining, data?.request?.expiresAt, t])

  const handleStartOnboarding = async () => {
    setStartingOnboarding(true)
    try {
      const response = await fetch('/api/partner/onboarding/start', {
        method: 'POST'
      })
      const result = await response.json()

      if (result.success) {
        setShowOnboarding(true)
        fetchRequest()
      } else {
        alert(result.error || t('failedToStartOnboarding'))
      }
    } catch (err) {
      console.error('Failed to start onboarding:', err)
      alert(t('failedToStartOnboarding'))
    } finally {
      setStartingOnboarding(false)
    }
  }

  const handleDeclineSuccess = () => {
    setShowDecline(false)
    router.push('/partner/dashboard')
  }

  const handleCounterOfferSuccess = () => {
    setShowCounterOffer(false)
    fetchRequest()
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    fetchRequest()
  }

  const handleRecruitmentComplete = () => {
    setShowRecruitmentSheet(false)
    fetchRequest()
  }

  // Direct Stripe Connect - bypasses the wizard
  const handleConnectPayoutDirect = async () => {
    setConnectingPayout(true)
    try {
      const response = await fetch('/api/partner/banking/connect', {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success && data.onboardingUrl) {
        // Redirect to Stripe Connect
        window.location.href = data.onboardingUrl
      } else if (data.onboardingRequired === false) {
        // Already connected
        fetchRequest()
      } else {
        alert(data.error || t('failedToConnectStripe'))
      }
    } catch (err) {
      console.error('Stripe Connect error:', err)
      alert(t('failedToConnectStripe'))
    } finally {
      setConnectingPayout(false)
    }
  }

  // Send agreement handler — for WhatsNeeded and BookingAgreementSection
  const sendAgreement = async () => {
    if (!data?.bookingId) return
    setSendingAgreement(true)
    try {
      const response = await fetch('/api/agreements/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: data.bookingId })
      })
      const result = await response.json()
      if (result.success) {
        showToast('success', result.message || tBd('bdAgreementSentSuccess'))
        fetchRequest()
      } else if (result.status === 'already_signed') {
        showToast('success', tBd('bdAgreementAlreadySigned'))
        fetchRequest()
      } else {
        showToast('error', result.error || tBd('bdFailedSendAgreement'))
      }
    } catch {
      showToast('error', tBd('bdFailedSendAgreement'))
    } finally {
      setSendingAgreement(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return t('tbd')
    // Extract YYYY-MM-DD portion to avoid UTC→local timezone shift
    const datePart = dateStr.substring(0, 10)
    const [y, m, d] = datePart.split('-').map(Number)
    const local = new Date(y, m - 1, d)
    return local.toLocaleDateString(locale, {
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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Loading state — only show full-page spinner on initial load (data is null).
  // Subsequent refreshes (HMR, Fast Refresh, timer re-renders) must NOT unmount
  // the component tree or the bottomsheet loses all state mid-finalize.
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-200/70 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-200/70 dark:bg-gray-900 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <IoAlertCircleOutline className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
              {error || t('requestNotFound')}
            </h2>
            <Link
              href="/partner/dashboard"
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400"
            >
              <IoArrowBackOutline className="w-4 h-4" />
              {t('backToDashboard')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { host, prospect, request, onboardingProgress, timeRemaining } = data
  const isExpired = timeRemaining?.expired || false
  const isExpiringSoon = !!(timeRemaining && !isExpired && timeRemaining.hours < 12)
  const hasStartedOnboarding = !!host.onboardingStartedAt
  const hasCompleted = !!host.onboardingCompletedAt
  const hasDeclined = !!host.declinedRequestAt
  const hasPendingCounterOffer = prospect.counterOfferStatus === 'PENDING'
  const hasCarListed = host.cars.length > 0 && onboardingProgress.carPhotosUploaded
  const isCarAssigned = request.status === 'CAR_ASSIGNED' && hasCompleted

  // Booking date expiration (separate from the 3-day response window)
  // pickupMs: pickup date+time as epoch. hoursOverdue: how many hours past pickup (negative = not yet).
  const pickupMs = (() => {
    if (!request.startDate) return null
    const datePart = request.startDate.substring(0, 10)
    const [y, m, d] = datePart.split('-').map(Number)
    const pickup = new Date(y, m - 1, d)
    const [h, min] = (request.startTime || '10:00').split(':').map(Number)
    pickup.setHours(h, min, 0, 0)
    return pickup.getTime()
  })()
  const hoursUntilPickup = pickupMs ? (pickupMs - Date.now()) / (1000 * 60 * 60) : null
  // 12h+ past pickup → truly expired, cannot confirm
  const isBookingExpired = hoursUntilPickup !== null && hoursUntilPickup < -12
  // 0-12h past pickup → late acceptance, host CAN still confirm
  const isBookingLate = hoursUntilPickup !== null && hoursUntilPickup < 0 && hoursUntilPickup >= -12
  // Pickup is today but time hasn't passed yet
  const isBookingToday = (() => {
    if (!request.startDate || hoursUntilPickup === null || hoursUntilPickup < 0) return false
    const now = new Date()
    const datePart = request.startDate.substring(0, 10)
    const [y, m, d] = datePart.split('-').map(Number)
    return now.getFullYear() === y && now.getMonth() === m - 1 && now.getDate() === d
  })()
  // Pickup within 24h but not today and not past
  const isBookingWithin24h = hoursUntilPickup !== null && hoursUntilPickup > 0 && hoursUntilPickup < 24 && !isBookingToday

  // Calculate earnings
  const dailyRate = prospect.counterOfferStatus === 'APPROVED' && prospect.counterOfferAmount
    ? prospect.counterOfferAmount
    : request.offeredRate || 0
  const durationDays = request.durationDays || 14
  const totalAmount = dailyRate * durationDays
  const platformFee = totalAmount * 0.1
  const hostEarnings = totalAmount - platformFee

  // Show onboarding wizard if started and user clicked continue
  if (showOnboarding) {
    return (
      <OnboardingWizard
        request={request}
        prospect={prospect}
        host={host}
        onboardingProgress={onboardingProgress}
        timeDisplay={timeDisplay}
        isExpiringSoon={isExpiringSoon}
        onComplete={handleOnboardingComplete}
        onBack={() => setShowOnboarding(false)}
      />
    )
  }

  const bookingSnapshot = data.bookingSnapshot || null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium ${
          toast.type === 'success'
            ? 'bg-green-600 text-white'
            : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Main Content */}
      <div className="px-3 sm:px-4 py-4 sm:py-6">
        {/* Header — full width */}
        <div className="space-y-4 mb-4">
          <RequestHeader
            requestId={request.id}
            requestStatus={request.status}
            isCarAssigned={isCarAssigned}
            isExpired={isExpired}
            hasDeclined={hasDeclined}
            hasCompleted={hasCompleted}
            isBookingExpired={isBookingExpired}
            isBookingLate={isBookingLate}
            isBookingToday={isBookingToday}
            isBookingWithin24h={isBookingWithin24h}
            hasPendingCounterOffer={hasPendingCounterOffer}
            counterOfferAmount={prospect.counterOfferAmount}
            paymentType={bookingSnapshot?.paymentType || null}
            timeRemaining={timeRemaining}
            timeDisplay={timeDisplay}
            copied={copied}
            onConfirmAndSend={() => setShowConfirmSendSheet(true)}
            onDecline={() => setShowDecline(true)}
            onContinueAddingCar={() => setShowRecruitmentSheet(true)}
            onRefresh={fetchRequest}
            onCopyId={copyToClipboard}
          />
        </div>

        {/* Desktop Grid: left content + right sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column — Main Info */}
          <div className="lg:col-span-2 space-y-4">
            <VehicleGuestCard
              car={host.cars[0]}
              vehicleInfo={request.vehicleInfo}
              hasCarListed={hasCarListed}
              isCarAssigned={isCarAssigned}
              guestName={request.guestName}
              guestEmail={request.guestEmail}
              guestPhone={request.guestPhone}
              renter={customerData?.customer ? {
                id: customerData.customer.id,
                name: customerData.customer.name,
                email: customerData.customer.email || request.guestEmail || '',
                phone: customerData.customer.phone,
                photo: customerData.customer.photo,
                memberSince: customerData.customer.memberSince,
              } : null}
              isVerified={customerData?.customer?.verification?.status === 'verified'}
              guestInsurance={data.guestInsurance}
              bookingId={data.bookingId}
              bookingStatus={bookingSnapshot?.status || 'PENDING'}
              guestHistory={customerData?.customer?.stats ? {
                totalBookings: customerData.customer.stats.totalPlatformBookings || 0,
                totalSpent: customerData.customer.stats.totalPlatformSpent || 0,
              } : null}
              formatCurrency={formatCurrency}
            />

            {/* Messages — available at CAR_ASSIGNED when booking exists */}
            {isCarAssigned && data.bookingId && (
              <MessagesSection
                bookingMessages={messages.bookingMessages}
                newMessage={messages.newMessage}
                setNewMessage={messages.setNewMessage}
                sendingMessage={messages.sendingMessage}
                sendBookingMessage={messages.sendBookingMessage}
                messagesContainerRef={messages.messagesContainerRef}
                expanded={expandedSections.messages}
                onToggle={() => toggleSection('messages')}
                formatMessageTime={messages.formatMessageTime}
              />
            )}

            <RentalPeriodCard
              startDate={request.startDate}
              startTime={request.startTime}
              endDate={request.endDate}
              endTime={request.endTime}
              pickupCity={request.pickupCity}
              pickupState={request.pickupState}
              durationDays={durationDays}
              dailyRate={dailyRate}
              totalAmount={totalAmount}
              platformFee={platformFee}
              hostEarnings={hostEarnings}
              counterOfferStatus={prospect.counterOfferStatus}
              hasPendingCounterOffer={hasPendingCounterOffer}
              isLate={isBookingLate}
              isExpired={isExpired}
              hasDeclined={hasDeclined}
              hasCompleted={hasCompleted}
              onRequestDifferentRate={() => setShowCounterOffer(true)}
              onLearnHowItWorks={() => setShowTaxInfo(true)}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
            />

            {/* Agreement Section — BookingAgreementSection when booking exists, RentalAgreementCard for onboarding */}
            {bookingSnapshot ? (
              <BookingAgreementSection
                booking={{
                  id: data.bookingId!,
                  agreementStatus: bookingSnapshot.agreementStatus,
                  agreementSentAt: bookingSnapshot.agreementSentAt,
                  agreementSignedAt: bookingSnapshot.agreementSignedAt,
                  agreementSignedPdfUrl: bookingSnapshot.agreementSignedPdfUrl,
                  signerName: bookingSnapshot.signerName,
                  dailyRate: dailyRate,
                  startDate: request.startDate || '',
                  endDate: request.endDate || '',
                  numberOfDays: durationDays,
                  totalAmount: totalAmount,
                  subtotal: totalAmount,
                  pickupLocation: `${request.pickupCity || ''}, ${request.pickupState || ''}`,
                  guestName: request.guestName || '',
                  recruitmentAgreementPreference: bookingSnapshot.recruitmentAgreementPreference,
                }}
                renterName={request.guestName}
                partnerName={host.name}
                partnerEmail={host.email}
                commissionRate={0.10}
                onRefresh={fetchRequest}
                showToast={showToast}
                defaultExpanded={true}
              />
            ) : (
              <RentalAgreementCard
                agreementUploaded={onboardingProgress.agreementUploaded}
                agreementPreference={onboardingProgress.agreementPreference}
                expanded={expandedSections.agreement}
                onToggle={() => toggleSection('agreement')}
                onRefresh={fetchRequest}
                existingAgreement={data?.agreement}
                requestData={{
                  id: request.id,
                  guestName: request.guestName,
                  offeredRate: request.offeredRate,
                  startDate: request.startDate,
                  endDate: request.endDate,
                  durationDays: request.durationDays,
                  pickupCity: request.pickupCity,
                  pickupState: request.pickupState,
                  totalAmount: request.totalAmount,
                  hostEarnings: request.hostEarnings,
                }}
                hostName={host.name}
                hostEmail={host.email}
              />
            )}

            {/* Guest Verification — only shown after host accepts & adds car (other pages show it always) */}
            {isCarAssigned && (
              <GuestVerificationCard
                hasCarListed={hasCarListed}
                expanded={expandedSections.verification}
                onToggle={() => toggleSection('verification')}
              />
            )}

            {/* Onboarding Progress Stepper */}
            {!isExpired && !hasDeclined && !hasCompleted && !isBookingExpired && (
              <ProgressStepper
                onboardingProgress={onboardingProgress}
                onOpenRecruitmentSheet={() => setShowRecruitmentSheet(true)}
                onEditAgreement={() => setShowEditAgreement(true)}
                onEditPayment={() => setShowEditPayment(true)}
                onConnectPayout={handleConnectPayoutDirect}
                connectingPayout={connectingPayout}
                hasPendingCounterOffer={hasPendingCounterOffer}
              />
            )}

          </div>

          {/* Right Column — Sidebar */}
          <div className="space-y-4">
            <RequestQuickActions
              bookingId={data.bookingId}
              bookingSnapshot={bookingSnapshot}
              isCarAssigned={isCarAssigned}
              isExpired={isExpired}
              isBookingExpired={isBookingExpired}
              hasDeclined={hasDeclined}
              hasCompleted={hasCompleted}
              hasPendingCounterOffer={hasPendingCounterOffer}
              guestPhone={request.guestPhone}
              onConfirmAndSend={() => setShowConfirmSendSheet(true)}
              onDecline={() => setShowDecline(true)}
              onContinueAddingCar={() => setShowRecruitmentSheet(true)}
              onCounterOffer={() => setShowCounterOffer(true)}
              onSendAgreement={data.bookingId ? sendAgreement : undefined}
              sendingAgreement={sendingAgreement}
              onEdit={() => setShowCounterOffer(true)}
              onCancel={() => setShowDecline(true)}
            />
          </div>
        </div>

        {/* Full-width sections below grid */}
        <div className="space-y-4 mt-4">
          {/* What's Needed — when booking exists */}
          {bookingSnapshot && (
            <WhatsNeeded
              booking={{
                paymentType: bookingSnapshot.paymentType,
                agreementStatus: bookingSnapshot.agreementStatus,
                signerName: bookingSnapshot.signerName,
                agreementSignedAt: bookingSnapshot.agreementSignedAt,
                agreementSignedPdfUrl: bookingSnapshot.agreementSignedPdfUrl,
                originalBookingId: null,
                vehicleAccepted: false,
              }}
              guestInsurance={data.guestInsurance}
              partner={{ stripeConnected: data.partnerInfo.stripeConnected }}
              sendAgreement={sendAgreement}
            />
          )}

          {/* Note + Help — always last */}
          <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            {!isExpired && !hasDeclined && !hasCompleted && !isBookingExpired && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <strong>{t('noteLabel')}</strong> {t('noteCarNotPublic')}{' '}
                <button onClick={() => setShowHowItWorks(true)} className="text-xs text-orange-600 dark:text-orange-400 font-medium hover:underline">
                  {t('learnHowItWorks')}
                </button>
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center flex-wrap gap-1">
              <IoChatbubbleOutline className="w-3.5 h-3.5 flex-shrink-0" />
              {t('questionsHereToHelp')}
              <a href="tel:+18557030806" className="text-orange-600 dark:text-orange-400 font-medium hover:underline">(855) 703-0806</a>
              <span className="text-gray-400">{t('orChatWith')}</span>
              <a href="/choe" className="text-orange-600 dark:text-orange-400 font-medium hover:underline">Choé</a>
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCounterOffer && (
        <CounterOfferModal
          currentRate={request.offeredRate || 45}
          durationDays={durationDays}
          onClose={() => setShowCounterOffer(false)}
          onSuccess={handleCounterOfferSuccess}
        />
      )}

      {showDecline && (
        <DeclineModal
          onClose={() => setShowDecline(false)}
          onSuccess={handleDeclineSuccess}
        />
      )}

      {/* How It Works Bottomsheet */}
      <HowItWorksSheet
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
        onGetStarted={() => {
          setShowHowItWorks(false)
          setShowRecruitmentSheet(true)
        }}
      />

      {/* Tax Responsibility BottomSheet */}
      <BottomSheet
        isOpen={showTaxInfo}
        onClose={() => setShowTaxInfo(false)}
        title={tBd('bdTaxInfoTitle')}
        size="small"
      >
        <div className="space-y-3 px-1">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">{tBd('bdManualBookings')}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{tBd('bdTaxInfoManual')}</p>
          </div>
          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">{tBd('bdGuestTaxes')}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{tBd('bdTaxInfoGuest')}</p>
          </div>
          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">1099 {tBd('bdStatus')}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{tBd('bdTaxInfo1099')}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">{tBd('bdPlatformBookings')}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{tBd('bdTaxInfoPlatform')}</p>
          </div>
        </div>
      </BottomSheet>

      {/* Recruitment Bottomsheet */}
      <RecruitmentBottomSheet
        isOpen={showRecruitmentSheet}
        onClose={() => setShowRecruitmentSheet(false)}
        onComplete={handleRecruitmentComplete}
        hostData={{
          id: host.id,
          name: host.name,
          email: host.email,
          hasPassword: host.hasPassword,
          phone: host.phone || undefined
        }}
        prospectData={{
          id: prospect.id,
          status: prospect.status
        }}
        requestData={{
          id: request.id,
          guestName: request.guestName,
          offeredRate: request.offeredRate,
          startDate: request.startDate,
          endDate: request.endDate,
          durationDays: request.durationDays,
          pickupCity: request.pickupCity,
          pickupState: request.pickupState,
          totalAmount: request.totalAmount,
          hostEarnings: request.hostEarnings
        }}
        existingAgreement={data?.agreement}
        onboardingProgress={onboardingProgress}
      />

      {/* Confirm & Send Agreement — CAR_ASSIGNED state */}
      <ConfirmSendSheet
        isOpen={showConfirmSendSheet}
        onClose={() => setShowConfirmSendSheet(false)}
        requestId={request.id}
        guestName={request.guestName || 'Guest'}
        guestEmail={request.guestEmail || ''}
        hostAgreementPreference={(onboardingProgress.agreementPreference as 'ITWHIP' | 'OWN' | 'BOTH') || 'ITWHIP'}
        hostAgreementUrl={data?.agreement?.url}
        existingAgreement={data?.agreement}
        requestData={{
          id: request.id,
          guestName: request.guestName,
          offeredRate: request.offeredRate,
          startDate: request.startDate,
          endDate: request.endDate,
          durationDays: request.durationDays,
          pickupCity: request.pickupCity,
          pickupState: request.pickupState,
          totalAmount: request.totalAmount,
          hostEarnings: request.hostEarnings,
        }}
        hostName={host.name}
        hostEmail={host.email}
      />

      {/* Standalone Edit: Agreement Preference */}
      <BottomSheet
        isOpen={showEditAgreement}
        onClose={() => setShowEditAgreement(false)}
        title={t('rentalAgreement')}
        size="large"
        showDragHandle={true}
        footer={undefined}
      >
        <AgreementPreferenceStep
          onComplete={() => {}}
          existingAgreement={data?.agreement}
          standalone
          onSaveStandalone={() => {
            setShowEditAgreement(false)
            fetchRequest()
          }}
        />
      </BottomSheet>

      {/* Standalone Edit: Payment Preference */}
      <BottomSheet
        isOpen={showEditPayment}
        onClose={() => setShowEditPayment(false)}
        title={t('bsStepPayment')}
        size="large"
        showDragHandle={true}
        footer={undefined}
      >
        <PaymentPreferenceStep
          hostData={{ id: host.id, name: host.name }}
          requestData={{ hostEarnings: request.hostEarnings, durationDays: request.durationDays }}
          onComplete={() => {
            setShowEditPayment(false)
            fetchRequest()
          }}
        />
      </BottomSheet>

    </div>
  )
}
