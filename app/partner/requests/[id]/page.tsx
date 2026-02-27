// app/partner/requests/[id]/page.tsx
// Request Detail Page for recruited hosts - mirrors booking details page structure
// Shows booking request info and onboarding steps in one unified view

'use client'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  IoArrowBackOutline,
  IoTimeOutline,
  IoArrowForwardOutline,
  IoCheckmarkCircleOutline,
  IoChatbubbleOutline,
  IoRefreshOutline,
  IoCopyOutline,
  IoAlertCircleOutline,
} from 'react-icons/io5'
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
import TestPdfModal from './components/TestPdfModal'
import AgreementPreviewModal from './components/AgreementPreviewModal'

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
      year: number
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
    guestRating: number | null
    guestTrips: number | null
    startDate: string | null
    endDate: string | null
    durationDays: number | null
    pickupCity: string | null
    pickupState: string | null
    offeredRate: number | null
    totalAmount: number | null
    hostEarnings: number | null
    platformFee: number | null
    expiresAt: string | null
  }
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
  // Note: requestId from params not used - we fetch via /api/partner/onboarding which uses auth context
  void params?.id

  const locale = useLocale()
  const t = useTranslations('PartnerRequestDetail')

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<RequestData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [timeDisplay, setTimeDisplay] = useState<string>('')
  const [showCounterOffer, setShowCounterOffer] = useState(false)
  const [showDecline, setShowDecline] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [startingOnboarding, setStartingOnboarding] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showTestPdfModal, setShowTestPdfModal] = useState(false)
  const [showAgreementPreview, setShowAgreementPreview] = useState(false)
  const [connectingPayout, setConnectingPayout] = useState(false)
  const [showRecruitmentSheet, setShowRecruitmentSheet] = useState(false)
  const [showEditAgreement, setShowEditAgreement] = useState(false)
  const [showEditPayment, setShowEditPayment] = useState(false)

  // Expandable sections
  const [expandedSections, setExpandedSections] = useState({
    pricing: true,
    verification: true,
    agreement: false
  })

  const fetchRequest = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/partner/onboarding')
      const result = await response.json()

      if (!response.ok) {
        setError(result.error || t('failedToLoadRequest'))
        return
      }

      setData(result)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch request:', err)
      setError(t('failedToLoadRequestDetails'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchRequest()
  }, [fetchRequest])

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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Loading state — only show full-page spinner on initial load (data is null).
  // Subsequent refreshes (HMR, Fast Refresh, timer re-renders) must NOT unmount
  // the component tree or the bottomsheet loses all state mid-finalize.
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4">
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
      {/* Header - Mirrors booking details page header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-3 sm:px-4 py-3 sm:py-4">
          {/* Top row - Back button, title, status */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Link
                href="/partner/dashboard?section=requests"
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              >
                <IoArrowBackOutline className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                    {t('requestBookingDetails')}
                  </h1>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                    {hasDeclined ? t('statusDeclined') : isExpired ? t('statusExpired') : hasPendingCounterOffer ? t('statusCounterPending') : t('statusPending')}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-mono">
                    REQ-{request.id?.slice(0, 8).toUpperCase() || '0000'}
                  </span>
                  <button
                    onClick={() => copyToClipboard(request.id || '')}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {copied ? (
                      <IoCheckmarkCircleOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
                    ) : (
                      <IoCopyOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-2">
              {!isExpired && !hasDeclined && !hasCompleted && (
                <>
                  <button
                    onClick={() => setShowRecruitmentSheet(true)}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium flex items-center gap-2"
                  >
                    <IoArrowForwardOutline className="w-4 h-4" />
                    {t('continueAddingCar')}
                  </button>
                  <button
                    onClick={() => setShowDecline(true)}
                    className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    {t('decline')}
                  </button>
                </>
              )}
              <button
                onClick={fetchRequest}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                title={t('refresh')}
              >
                <IoRefreshOutline className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>


          {/* Counter-offer pending notice */}
          {hasPendingCounterOffer && (
            <div className="mt-2 sm:mt-3 flex items-center gap-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
              <IoTimeOutline className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">
                <strong>{t('counterOfferPending')}</strong>{' '}
                {t('counterOfferReviewing', { amount: prospect.counterOfferAmount })}
              </span>
            </div>
          )}

          {/* Mobile Quick Actions */}
          <div className="sm:hidden mt-3 flex gap-2">
            {!isExpired && !hasDeclined && !hasCompleted && (
              <>
                <button
                  onClick={() => setShowRecruitmentSheet(true)}
                  className="flex-1 px-3 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium flex items-center justify-center gap-2 text-sm"
                >
                  <IoArrowForwardOutline className="w-4 h-4" />
                  {t('continueAddingCar')}
                </button>
                <button
                  onClick={() => setShowDecline(true)}
                  className="px-3 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"
                >
                  {t('decline')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 sm:px-4 py-4 sm:py-6">
        <div className="space-y-6 max-w-3xl">
          <div className="space-y-6">
            {/* Expiration Countdown Banner */}
            {!isExpired && !hasDeclined && !hasCompleted && timeRemaining && timeDisplay && (
              <div className={`rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 border flex items-center gap-2.5 ${
                timeRemaining.hours < 6
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
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
              guestName={request.guestName}
              guestRating={request.guestRating}
              guestTrips={request.guestTrips}
              guestEmail={request.guestEmail}
              guestPhone={request.guestPhone}
            />

            <RentalPeriodCard
              startDate={request.startDate}
              endDate={request.endDate}
              pickupCity={request.pickupCity}
              pickupState={request.pickupState}
              durationDays={durationDays}
              dailyRate={dailyRate}
              totalAmount={totalAmount}
              platformFee={platformFee}
              hostEarnings={hostEarnings}
              counterOfferStatus={prospect.counterOfferStatus}
              hasPendingCounterOffer={hasPendingCounterOffer}
              isExpired={isExpired}
              hasDeclined={hasDeclined}
              hasCompleted={hasCompleted}
              onRequestDifferentRate={() => setShowCounterOffer(true)}
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
              expanded={expandedSections.agreement}
              onToggle={() => toggleSection('agreement')}
              onShowTestPdf={() => setShowTestPdfModal(true)}
              onShowPreview={() => setShowAgreementPreview(true)}
              onRefresh={fetchRequest}
              existingAgreement={data?.agreement}
            />
          </div>

        </div>


        {/* What's Needed — Interactive Progress Stepper */}
        {!isExpired && !hasDeclined && !hasCompleted && (
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
        {!isExpired && !hasDeclined && !hasCompleted && (
          <div className="mt-4 sm:mt-6 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong>{t('noteLabel')}</strong> {t('noteCarNotPublic')}
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
                  href="tel:+16028459758"
                  className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
                >
                  (602) 845-9758
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

      <TestPdfModal
        isOpen={showTestPdfModal}
        onClose={() => setShowTestPdfModal(false)}
        hostEmail={host.email}
      />

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

      <AgreementPreviewModal
        isOpen={showAgreementPreview}
        onClose={() => setShowAgreementPreview(false)}
        prospectId={prospect.id}
        guestName={request.guestName}
        hostName={host.name}
        vehicleInfo={request.vehicleInfo}
        startDate={request.startDate}
        endDate={request.endDate}
        pickupCity={request.pickupCity}
        pickupState={request.pickupState}
        durationDays={request.durationDays}
        offeredRate={request.offeredRate}
        totalAmount={request.totalAmount}
      />
    </div>
  )
}
