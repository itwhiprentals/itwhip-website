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
  IoTimeOutline,
  IoArrowForwardOutline,
  IoChatbubbleOutline,
  IoAlertCircleOutline,
  IoCloseOutline,
  IoCallOutline,
} from 'react-icons/io5'
import RequestHeader from './components/RequestHeader'
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

  // Messages hook — lightweight toast for errors
  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    if (type === 'error') console.error('[Messages]', message)
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <RequestHeader
        requestId={request.id}
        isCarAssigned={isCarAssigned}
        isExpired={isExpired}
        hasDeclined={hasDeclined}
        hasCompleted={hasCompleted}
        isBookingExpired={isBookingExpired}
        hasPendingCounterOffer={hasPendingCounterOffer}
        counterOfferAmount={prospect.counterOfferAmount}
        copied={copied}
        onConfirmAndSend={() => setShowConfirmSendSheet(true)}
        onDecline={() => setShowDecline(true)}
        onContinueAddingCar={() => setShowRecruitmentSheet(true)}
        onRefresh={fetchRequest}
        onCopyId={copyToClipboard}
      />

      {/* Main Content */}
      <div className="px-3 sm:px-4 py-4 sm:py-6">
        <div className="space-y-6 max-w-3xl">
          <div className="space-y-6">
            {/* Booking Expired Banner */}
            {isBookingExpired && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <IoAlertCircleOutline className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    {t('bookingExpiredBanner')}
                  </p>
                </div>
              </div>
            )}

            {/* Late Acceptance / Today / Within 24h Amber Warnings */}
            {(isBookingLate || isBookingToday || isBookingWithin24h) && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <IoAlertCircleOutline className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    {isBookingLate ? t('bookingLateWarning') : isBookingToday ? t('bookingTodayWarning') : t('bookingWithin24hWarning')}
                  </p>
                </div>
              </div>
            )}

            {/* Expiration Countdown Banner */}
            {!isExpired && !hasDeclined && !hasCompleted && timeRemaining && timeDisplay && (
              <div className={`rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 border flex items-center gap-2.5 ${
                timeRemaining.hours < 6
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : 'bg-gray-200/70 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
              }`}>
                <IoTimeOutline className={`w-4 h-4 flex-shrink-0 ${
                  timeRemaining.hours < 6
                    ? 'text-red-500 dark:text-red-400'
                    : 'text-gray-400'
                }`} />
                <p className={`text-xs flex-1 min-w-0 ${
                  timeRemaining.hours < 6
                    ? 'text-red-700 dark:text-red-300'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {t('completeSetupBefore')}
                </p>
                <span className={`text-sm font-semibold flex-shrink-0 ${
                  timeRemaining.hours < 6
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {timeDisplay}
                </span>
              </div>
            )}

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
              guestInsurance={null}
              bookingId={data.bookingId}
              bookingStatus="PENDING"
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

            <GuestVerificationCard
              hasCarListed={hasCarListed}
              expanded={expandedSections.verification}
              onToggle={() => toggleSection('verification')}
            />

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
          </div>

          {/* Quick Actions */}
          {!isExpired && !isBookingExpired && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('quickActions')}</h3>
              <div className="space-y-2">
                {/* Call Guest — CAR_ASSIGNED + phone available */}
                {isCarAssigned && request.guestPhone && (
                  <button
                    onClick={async () => {
                      if (!data.bookingId) return
                      try {
                        const res = await fetch('/api/twilio/masked-call', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          credentials: 'include',
                          body: JSON.stringify({ bookingId: data.bookingId }),
                        })
                        if (res.ok) {
                          alert(t('callGuestSuccess'))
                        } else {
                          const d = await res.json().catch(() => ({}))
                          alert(d.error || t('callGuestFailed'))
                        }
                      } catch {
                        alert(t('callGuestFailed'))
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <IoCallOutline className="w-4 h-4" />
                    {t('callGuest')}
                  </button>
                )}

                {/* View Booking — when booking exists */}
                {data.bookingId && (
                  <a
                    href={`/partner/bookings/${data.bookingId}`}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <IoArrowForwardOutline className="w-4 h-4" />
                    {t('viewBooking')}
                  </a>
                )}

                {/* Decline Request — dangerous */}
                {!hasDeclined && !hasCompleted && (
                  <button
                    onClick={() => setShowDecline(true)}
                    className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2"
                  >
                    <IoCloseOutline className="w-4 h-4" />
                    {t('declineRequest')}
                  </button>
                )}
              </div>
            </div>
          )}

        </div>


        {/* What's Needed — Interactive Progress Stepper */}
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

        {/* Important Note - Standalone */}
        {!isExpired && !hasDeclined && !hasCompleted && !isBookingExpired && (
          <div className="mt-4 sm:mt-6 p-3 bg-gray-200/70 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong>{t('noteLabel')}</strong> {t('noteCarNotPublic')}{' '}
              <button onClick={() => setShowHowItWorks(true)} className="text-xs text-orange-600 dark:text-orange-400 font-medium hover:underline">
                {t('learnHowItWorks')}
              </button>
            </p>
          </div>
        )}

        {/* Help Section - Bottom */}
        <div className="mt-4 sm:mt-6 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-start gap-3">
            <IoChatbubbleOutline className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('questionsHereToHelp')}
              </p>
              <div className="flex flex-wrap gap-3 mt-2">
                <a
                  href="tel:+18557030806"
                  className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
                >
                  (855) 703-0806
                </a>
                <a
                  href="mailto:info@itwhip.com"
                  className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
                >
                  info@itwhip.com
                </a>
              </div>
            </div>
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
