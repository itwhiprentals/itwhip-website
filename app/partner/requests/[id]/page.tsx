// app/partner/requests/[id]/page.tsx
// Request Detail Page for recruited hosts - mirrors booking details page structure
// Shows booking request info and onboarding steps in one unified view

'use client'

import { useLocale, useTranslations } from 'next-intl'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  IoArrowBackOutline,
  IoTimeOutline,
  IoCarOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoCheckmarkCircleOutline,
  IoArrowForwardOutline,
  IoImageOutline,
  IoWalletOutline,
  IoDocumentTextOutline,
  IoStarOutline,
  IoShieldCheckmarkOutline,
  IoShieldOutline,
  IoCardOutline,
  IoHandLeftOutline,
  IoChatbubbleOutline,
  IoRefreshOutline,
  IoCopyOutline,
  IoMailOutline,
  IoCallOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoAlertCircleOutline,
  IoCashOutline,
  IoAddOutline,
  IoEyeOutline,
  IoCloseOutline,
  IoSendOutline,
  IoDocumentOutline
} from 'react-icons/io5'
import CounterOfferModal from './components/CounterOfferModal'
import DeclineModal from './components/DeclineModal'
import OnboardingWizard from './components/OnboardingWizard'
import AgreementUpload from './components/AgreementUpload'

interface RequestData {
  host: {
    id: string
    name: string
    email: string
    hasPassword: boolean
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
  const [sendingTestPdf, setSendingTestPdf] = useState(false)
  const [showAgreementPreview, setShowAgreementPreview] = useState(false)
  const [connectingPayout, setConnectingPayout] = useState(false)

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

  // Loading state
  if (loading) {
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
                  <Link
                    href="/partner/fleet/add"
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium flex items-center gap-2"
                  >
                    <IoArrowForwardOutline className="w-4 h-4" />
                    {t('continueAddingCar')}
                  </Link>
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

          {/* Reservation Expiry Notice */}
          {!isExpired && !hasDeclined && !hasCompleted && timeDisplay && (
            <div className="mt-2 sm:mt-3 flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
              <IoTimeOutline className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm flex-1">
                <strong>{t('reservationExpires')}</strong>{' '}
                {isExpiringSoon ? (
                  <span className="text-red-600 dark:text-red-400">
                    {t('expiringUrgent', { timeDisplay })}
                  </span>
                ) : (
                  <span>{t('expiringNormal', { timeDisplay })}</span>
                )}
              </span>
            </div>
          )}

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
                <Link
                  href="/partner/fleet/add"
                  className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 text-sm"
                >
                  <IoArrowForwardOutline className="w-4 h-4" />
                  {t('continueAddingCar')}
                </Link>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle & Guest Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Vehicle Section */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-4">
                  {/* Vehicle Photo / Placeholder */}
                  {host.cars.length > 0 && host.cars[0].photos?.[0]?.url ? (
                    <img
                      src={host.cars[0].photos[0].url}
                      alt={`${host.cars[0].year} ${host.cars[0].make} ${host.cars[0].model}`}
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
                        {host.cars.length > 0
                          ? `${host.cars[0].year} ${host.cars[0].make} ${host.cars[0].model}`
                          : request.vehicleInfo || t('vehicle')}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        hasCarListed
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                      }`}>
                        {hasCarListed ? t('ready') : t('awaitingSetup')}
                      </span>
                    </div>
                    {!hasCarListed && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {t('addPhotosAndRate')}
                      </p>
                    )}
                    {hasCarListed && (
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`/partner/fleet/${host.cars[0]?.id}`}
                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          {t('viewVehicle')}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Guest Section */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {request.guestName?.charAt(0) || 'G'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {request.guestName || t('guest')}
                      </h3>
                      {request.guestRating && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <IoStarOutline className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{request.guestRating.toFixed(1)}</span>
                          {request.guestTrips && (
                            <span>({request.guestTrips} {t('trips')})</span>
                          )}
                        </div>
                      )}
                      {/* Contact details - locked until car listed */}
                      {hasCarListed ? (
                        <div className="mt-2 space-y-1">
                          {request.guestEmail && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <IoMailOutline className="w-4 h-4" />
                              {request.guestEmail}
                            </div>
                          )}
                          {request.guestPhone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <IoCallOutline className="w-4 h-4" />
                              {request.guestPhone}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          {t('contactDetailsLocked')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rental Period */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-4">
                <IoCalendarOutline className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('rentalPeriod')}</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('pickup')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(request.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('return')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(request.endDate)}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IoLocationOutline className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('pickupLocation')}</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {request.pickupCity || 'Phoenix'}, {request.pickupState || 'AZ'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {t('guestWillComeToYou')}
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {t('durationDays', { count: durationDays })}
                  </span>
                </div>
              </div>
            </div>

            {/* Guest Verification - Grayed out until car listed */}
            <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${!hasCarListed ? 'opacity-60' : ''}`}>
              <button
                onClick={() => hasCarListed && toggleSection('verification')}
                className={`w-full p-4 flex items-center justify-between text-left ${!hasCarListed ? 'cursor-not-allowed' : ''}`}
                disabled={!hasCarListed}
              >
                <div className="flex items-center gap-2">
                  <IoShieldOutline className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('guestVerification')}</h3>
                  {hasCarListed ? (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                      {t('pending')}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                      {t('listCarFirst')}
                    </span>
                  )}
                </div>
                {hasCarListed && (
                  expandedSections.verification ? (
                    <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
                  ) : (
                    <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
                  )
                )}
              </button>

              {hasCarListed && expandedSections.verification && (
                <div className="px-4 pb-4 space-y-4">
                  {/* Pre-verification badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-lg">
                      <IoShieldCheckmarkOutline className="w-4 h-4" />
                      {t('identityVerified')}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-lg">
                      <IoCardOutline className="w-4 h-4" />
                      {t('paymentOnFile')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('guestWillCompleteVerification')}
                  </p>
                </div>
              )}
            </div>

            {/* Rental Agreement Section */}
            <div id="agreement-section" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => toggleSection('agreement')}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <IoDocumentTextOutline className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('rentalAgreement')}</h3>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    onboardingProgress.agreementUploaded
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {onboardingProgress.agreementUploaded ? t('uploaded') : t('notUploaded')}
                  </span>
                </div>
                {expandedSections.agreement ? (
                  <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
                ) : (
                  <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedSections.agreement && (
                <div className="px-4 pb-4 space-y-4">
                  {/* Host's Agreement - with AI validation */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{t('yourRentalAgreement')}</h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{t('optional')}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {t('uploadAgreementDesc')}
                    </p>

                    <AgreementUpload
                      onUploadSuccess={fetchRequest}
                      existingAgreement={data?.agreement}
                    />

                    {/* Test E-Sign button - only available after uploading PDF */}
                    {onboardingProgress.agreementUploaded && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <button
                          onClick={() => setShowTestPdfModal(true)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium"
                        >
                          <IoSendOutline className="w-4 h-4" />
                          {t('testESignExperience')}
                        </button>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          {t('previewGuestSigning')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ItWhip Agreement */}
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{t('itwhipStandardAgreement')}</h4>
                      <span className="text-xs text-purple-600 dark:text-purple-400">{t('required')}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {t('standardTermsDesc')}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAgreementPreview(true)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
                      >
                        <IoEyeOutline className="w-4 h-4" />
                        {t('previewAgreement')}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {t('guestWillSignBoth')}
                  </p>
                </div>
              )}
            </div>
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
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('pricing')}</h3>
                </div>
                {expandedSections.pricing ? (
                  <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
                ) : (
                  <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedSections.pricing && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatCurrency(dailyRate)} × {t('durationDays', { count: durationDays })}
                    </span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('platformFee')}</span>
                    <span className="text-gray-500 dark:text-gray-400">-{formatCurrency(platformFee)}</span>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900 dark:text-white">{t('yourEarnings')}</span>
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(hostEarnings)}
                      </span>
                    </div>
                  </div>

                  {prospect.counterOfferStatus === 'APPROVED' && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {t('counterOfferApproved')}
                    </p>
                  )}

                  {!hasPendingCounterOffer && !isExpired && !hasDeclined && !hasCompleted && (
                    <button
                      onClick={() => setShowCounterOffer(true)}
                      className="w-full mt-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <IoHandLeftOutline className="w-4 h-4" />
                      {t('requestDifferentRate')}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Connect Payout - Single Quick Action */}
            {!isExpired && !hasDeclined && !hasCompleted && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('connectPayout')}</h3>
                <button
                  onClick={handleConnectPayoutDirect}
                  disabled={connectingPayout || hasPendingCounterOffer || onboardingProgress.payoutConnected}
                  className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  {connectingPayout ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : onboardingProgress.payoutConnected ? (
                    <IoCheckmarkCircleOutline className="w-5 h-5" />
                  ) : (
                    <IoWalletOutline className="w-5 h-5" />
                  )}
                  {connectingPayout ? t('connecting') : onboardingProgress.payoutConnected ? t('payoutConnected') : t('connectPayoutAccount')}
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  {t('requiredToReceivePayments')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* What's Needed Checklist - Bottom Section */}
        {!isExpired && !hasDeclined && !hasCompleted && (
          <div className="mt-4 sm:mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <IoAlertCircleOutline className="w-5 h-5 text-orange-500" />
              {t('whatsNeeded')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* List Your Car */}
              <div className={`p-4 rounded-lg border ${
                onboardingProgress.carPhotosUploaded && onboardingProgress.ratesConfigured
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                  : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('listYourCar')}</span>
                  {onboardingProgress.carPhotosUploaded && onboardingProgress.ratesConfigured ? (
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                  ) : (
                    <IoAlertCircleOutline className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {onboardingProgress.carPhotosUploaded && onboardingProgress.ratesConfigured
                    ? t('carListedSuccessfully')
                    : t('addPhotosAndRate')}
                </p>
                {!(onboardingProgress.carPhotosUploaded && onboardingProgress.ratesConfigured) && (
                  <Link
                    href="/partner/fleet/add"
                    className="w-full mt-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg flex items-center justify-center gap-1"
                  >
                    <IoCarOutline className="w-3 h-3" />
                    {t('addCar')}
                  </Link>
                )}
              </div>

              {/* Upload Rental Agreement */}
              <div className={`p-4 rounded-lg border ${
                onboardingProgress.agreementUploaded
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                  : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('rentalAgreement')}</span>
                  {onboardingProgress.agreementUploaded ? (
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                  ) : (
                    <IoAlertCircleOutline className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {onboardingProgress.agreementUploaded ? t('agreementUploadedTested') : t('uploadPdfAndTest')}
                </p>
                {!onboardingProgress.agreementUploaded && (
                  <button
                    onClick={() => {
                      setExpandedSections(prev => ({ ...prev, agreement: true }))
                      setTimeout(() => {
                        const element = document.getElementById('agreement-section')
                        if (element) {
                          const y = element.getBoundingClientRect().top + window.scrollY - 80
                          window.scrollTo({ top: y, behavior: 'smooth' })
                        }
                      }, 100)
                    }}
                    className="w-full mt-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg flex items-center justify-center gap-1"
                  >
                    <IoDocumentTextOutline className="w-3 h-3" />
                    {t('uploadAgreement')}
                  </button>
                )}
              </div>

              {/* Connect Payout */}
              <div className={`p-4 rounded-lg border ${
                onboardingProgress.payoutConnected
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                  : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('connectPayout')}</span>
                  {onboardingProgress.payoutConnected ? (
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                  ) : (
                    <IoAlertCircleOutline className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {onboardingProgress.payoutConnected ? t('bankConnected') : t('connectToReceivePayments')}
                </p>
                {!onboardingProgress.payoutConnected && (
                  <button
                    onClick={handleConnectPayoutDirect}
                    disabled={connectingPayout || hasPendingCounterOffer}
                    className="w-full mt-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg flex items-center justify-center gap-1"
                  >
                    {connectingPayout ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <IoWalletOutline className="w-3 h-3" />
                    )}
                    {connectingPayout ? t('connecting') : t('connectPayout')}
                  </button>
                )}
              </div>
            </div>

            {/* Important Note */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>{t('noteLabel')}</strong> {t('noteCarNotPublic')}
              </p>
            </div>
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

      {/* Test PDF Modal - Tests the user's uploaded agreement */}
      {showTestPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <IoDocumentOutline className="w-5 h-5 text-blue-600" />
                {t('testESignExperience')}
              </h2>
              <button
                onClick={() => setShowTestPdfModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <IoCloseOutline className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* What will be sent */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('testWillSendEmail')}
                </p>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IoDocumentTextOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{t('yourRentalAgreement')}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('thePdfYouUploaded')}</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IoDocumentTextOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{t('itwhipStandardAgreement')}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('requiredPlatformTerms')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email destination */}
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <IoMailOutline className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('testEmailSentTo')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{host.email}</p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>{t('previewWhatGuestsSee')}</strong> {t('previewWhatGuestsSeeDesc')}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowTestPdfModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={async () => {
                  setSendingTestPdf(true)
                  try {
                    const response = await fetch('/api/partner/onboarding/agreement/test', {
                      method: 'POST'
                    })
                    const result = await response.json()

                    if (!response.ok) {
                      alert(result.error || t('failedToSendTestEmail'))
                      return
                    }

                    setShowTestPdfModal(false)
                    alert(t('testEmailSentSuccess', { sentTo: result.sentTo }))
                  } catch (err) {
                    console.error('Test e-sign error:', err)
                    alert(t('failedToSendTestEmail'))
                  } finally {
                    setSendingTestPdf(false)
                  }
                }}
                disabled={sendingTestPdf}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingTestPdf ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    {t('sending')}
                  </>
                ) : (
                  <>
                    <IoSendOutline className="w-4 h-4" />
                    {t('sendTestEmail')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agreement Preview Modal */}
      {showAgreementPreview && data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <IoDocumentTextOutline className="w-5 h-5 text-purple-600" />
                {t('vehicleRentalAgreement')}
              </h2>
              <button
                onClick={() => setShowAgreementPreview(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <IoCloseOutline className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Agreement Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('vehicleRentalAgreement')}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('requestNumber', { id: data.prospect.id.slice(0, 8).toUpperCase() })}</p>
              </div>

              <div className="space-y-4">
                {/* Parties */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('renterGuest')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{data.request.guestName || t('guest')}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('vehicleOwnerPartner')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{data.host.name}</p>
                  </div>
                </div>

                {/* Vehicle */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('vehicle')}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {data.request.vehicleInfo || t('vehicleDetailsPending')}
                  </p>
                </div>

                {/* Dates */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('pickupDate')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {data.request.startDate ? new Date(data.request.startDate).toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : t('tbd')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('returnDate')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {data.request.endDate ? new Date(data.request.endDate).toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : t('tbd')}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('pickupLocation')}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {data.request.pickupCity && data.request.pickupState ? `${data.request.pickupCity}, ${data.request.pickupState}` : t('locationTbd')}
                  </p>
                </div>

                {/* Duration & Rate */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('totalDays')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{t('durationDays', { count: data.request.durationDays || 0 })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('dailyRate')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{t('ratePerDay', { rate: data.request.offeredRate || 0 })}</p>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">{t('totalRentalAmount')}</span>
                      <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        ${data.request.totalAmount?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Legal */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-sm text-gray-500 dark:text-gray-400 space-y-2">
                  <p><strong>{t('governingLaw')}</strong> {t('governingLawValue')}</p>
                  <p><strong>{t('venue')}</strong> {t('venueValue')}</p>
                  <p className="text-xs mt-4">
                    {t('bySigningAgreement')}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
              <button
                onClick={() => setShowAgreementPreview(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                {t('close')}
              </button>
              <a
                href="https://itwhip.com/rentals/cmjutqr7k0001ju04qwg6ds9a/book"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                <IoDocumentTextOutline className="w-4 h-4" />
                {t('viewFullAgreement')}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
