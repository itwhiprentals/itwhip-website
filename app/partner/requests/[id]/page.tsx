// app/partner/requests/[id]/page.tsx
// Request Detail Page for recruited hosts - mirrors booking details page structure
// Shows booking request info and onboarding steps in one unified view

'use client'

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
  const [testPdfEmail, setTestPdfEmail] = useState('')
  const [sendingTestPdf, setSendingTestPdf] = useState(false)
  const [showAgreementPreview, setShowAgreementPreview] = useState(false)

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
  }, [])

  useEffect(() => {
    fetchRequest()
  }, [fetchRequest])

  // Countdown timer
  useEffect(() => {
    if (!data?.timeRemaining || data.timeRemaining.expired) {
      setTimeDisplay(data?.timeRemaining?.expired ? 'Expired' : '')
      return
    }

    const updateTimer = () => {
      if (!data?.request?.expiresAt) return

      const now = new Date()
      const expires = new Date(data.request.expiresAt)
      const diff = expires.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeDisplay('Expired')
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
  }, [data?.timeRemaining, data?.request?.expiresAt])

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
        alert(result.error || 'Failed to start onboarding')
      }
    } catch (err) {
      console.error('Failed to start onboarding:', err)
      alert('Failed to start onboarding')
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'TBD'
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <IoAlertCircleOutline className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
              {error || 'Request not found'}
            </h2>
            <Link
              href="/partner/dashboard"
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400"
            >
              <IoArrowBackOutline className="w-4 h-4" />
              Back to Dashboard
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
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
                    Request Booking Details
                  </h1>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                    {hasDeclined ? 'DECLINED' : isExpired ? 'EXPIRED' : hasPendingCounterOffer ? 'COUNTER PENDING' : 'PENDING'}
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
                    Continue Adding Your Car
                  </Link>
                  <button
                    onClick={() => setShowDecline(true)}
                    className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Decline
                  </button>
                </>
              )}
              <button
                onClick={fetchRequest}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                title="Refresh"
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
                <strong>Reservation expires:</strong>{' '}
                {isExpiringSoon ? (
                  <span className="text-red-600 dark:text-red-400">
                    {timeDisplay} remaining - List your car now or this request will be auto-cancelled
                  </span>
                ) : (
                  <span>{timeDisplay} remaining to list your car</span>
                )}
              </span>
            </div>
          )}

          {/* Counter-offer pending notice */}
          {hasPendingCounterOffer && (
            <div className="mt-2 sm:mt-3 flex items-center gap-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
              <IoTimeOutline className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">
                <strong>Counter-offer pending:</strong>{' '}
                Your ${prospect.counterOfferAmount}/day counter-offer is being reviewed. We&apos;ll notify you within 2 hours.
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
                  Continue Adding Your Car
                </Link>
                <button
                  onClick={() => setShowDecline(true)}
                  className="px-3 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"
                >
                  Decline
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle & Guest Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Vehicle Section */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
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
                          : request.vehicleInfo || 'Set up now'}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        hasCarListed
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                      }`}>
                        {hasCarListed ? 'READY' : <><span className="sm:hidden">NOT COMPLETED</span><span className="hidden sm:inline">AWAITING SETUP</span></>}
                      </span>
                    </div>
                    {!hasCarListed && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        Add photos and set your rate to receive this booking
                      </p>
                    )}
                    {hasCarListed && (
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`/partner/fleet/${host.cars[0]?.id}`}
                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          View Vehicle →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Guest Section */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {request.guestName?.charAt(0) || 'G'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {request.guestName || 'Guest'}
                      </h3>
                      {request.guestRating && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <IoStarOutline className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{request.guestRating.toFixed(1)}</span>
                          {request.guestTrips && (
                            <span>({request.guestTrips} trips)</span>
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
                          🔒 Full contact details after you list your car
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
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
                    {formatDate(request.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Return</p>
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
                      <p className="text-sm text-gray-500 dark:text-gray-400">Pickup Location</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {request.pickupCity || 'Phoenix'}, {request.pickupState || 'AZ'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Guest will come to your location
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {durationDays} {durationDays === 1 ? 'day' : 'days'}
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
                  <h3 className="font-semibold text-gray-900 dark:text-white">Guest Verification</h3>
                  {hasCarListed ? (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                      Pending
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                      🔒 List car first
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
                <div className="px-6 pb-6 space-y-4">
                  {/* Pre-verification badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-lg">
                      <IoShieldCheckmarkOutline className="w-4 h-4" />
                      Identity Verified
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-lg">
                      <IoCardOutline className="w-4 h-4" />
                      Payment on File
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Guest will complete full verification before pickup.
                  </p>
                </div>
              )}
            </div>

            {/* Rental Agreement Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => toggleSection('agreement')}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <IoDocumentTextOutline className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Rental Agreement</h3>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    Not Sent
                  </span>
                </div>
                {expandedSections.agreement ? (
                  <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
                ) : (
                  <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedSections.agreement && (
                <div className="px-6 pb-6 space-y-4">
                  {/* Host's Agreement */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">Your Rental Agreement</h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Optional</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Upload your existing rental agreement for the guest to sign.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
                      >
                        <IoAddOutline className="w-4 h-4" />
                        Upload PDF
                      </button>
                      {/* Test E-Sign - only available after uploading PDF */}
                      <button
                        onClick={() => setShowTestPdfModal(true)}
                        disabled={!onboardingProgress.agreementUploaded}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 text-sm font-medium"
                        title={!onboardingProgress.agreementUploaded ? 'Upload your PDF first to test e-signature' : ''}
                      >
                        <IoSendOutline className="w-4 h-4" />
                        Test E-Sign
                      </button>
                    </div>
                    {!onboardingProgress.agreementUploaded && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        Upload your PDF to test the e-signature feature
                      </p>
                    )}
                  </div>

                  {/* ItWhip Agreement */}
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">ItWhip Standard Agreement</h4>
                      <span className="text-xs text-purple-600 dark:text-purple-400">Required</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Standard terms protecting both you and the guest.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAgreementPreview(true)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
                      >
                        <IoEyeOutline className="w-4 h-4" />
                        Preview Agreement
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Guest will sign both agreements before pickup (after you list your car)
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
                      {formatCurrency(dailyRate)} × {durationDays} days
                    </span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Platform fee (10%)</span>
                    <span className="text-gray-500 dark:text-gray-400">-{formatCurrency(platformFee)}</span>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900 dark:text-white">Your Earnings</span>
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(hostEarnings)}
                      </span>
                    </div>
                  </div>

                  {prospect.counterOfferStatus === 'APPROVED' && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      ✓ Counter-offer approved
                    </p>
                  )}

                  {!hasPendingCounterOffer && !isExpired && !hasDeclined && !hasCompleted && (
                    <button
                      onClick={() => setShowCounterOffer(true)}
                      className="w-full mt-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <IoHandLeftOutline className="w-4 h-4" />
                      Request Different Rate
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions - Focused on Onboarding */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {!isExpired && !hasDeclined && !hasCompleted && (
                  <>
                    <button
                      onClick={() => hasStartedOnboarding ? setShowOnboarding(true) : handleStartOnboarding()}
                      disabled={startingOnboarding || hasPendingCounterOffer}
                      className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                      {onboardingProgress.carPhotosUploaded ? (
                        <IoCheckmarkCircleOutline className="w-4 h-4" />
                      ) : (
                        <IoImageOutline className="w-4 h-4" />
                      )}
                      {onboardingProgress.carPhotosUploaded ? 'Photos Uploaded ✓' : 'Upload Car Photos'}
                    </button>

                    <button
                      onClick={() => hasStartedOnboarding ? setShowOnboarding(true) : handleStartOnboarding()}
                      disabled={startingOnboarding || hasPendingCounterOffer}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
                    >
                      {onboardingProgress.ratesConfigured ? (
                        <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500" />
                      ) : (
                        <IoCashOutline className="w-4 h-4" />
                      )}
                      {onboardingProgress.ratesConfigured ? 'Rate Set ✓' : 'Set Your Rate'}
                    </button>

                    <button
                      onClick={() => hasStartedOnboarding ? setShowOnboarding(true) : handleStartOnboarding()}
                      disabled={startingOnboarding || hasPendingCounterOffer}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
                    >
                      {onboardingProgress.payoutConnected ? (
                        <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500" />
                      ) : (
                        <IoWalletOutline className="w-4 h-4" />
                      )}
                      {onboardingProgress.payoutConnected ? 'Payout Connected ✓' : 'Connect Payout'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-start gap-3">
                <IoChatbubbleOutline className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Questions? We&apos;re here to help.
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <a
                      href="tel:+13053999069"
                      className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
                    >
                      (305) 399-9069
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
        </div>

        {/* What's Needed Checklist - Bottom Section */}
        {!isExpired && !hasDeclined && !hasCompleted && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <IoAlertCircleOutline className="w-5 h-5 text-orange-500" />
              What&apos;s Needed to Receive This Booking
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Upload Photos */}
              <div className={`p-4 rounded-lg border ${
                onboardingProgress.carPhotosUploaded
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                  : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Car Photos</span>
                  {onboardingProgress.carPhotosUploaded ? (
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                  ) : (
                    <IoAlertCircleOutline className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {onboardingProgress.carPhotosUploaded ? 'Photos uploaded' : 'Min 3 photos required'}
                </p>
                {!onboardingProgress.carPhotosUploaded && (
                  <button
                    onClick={() => hasStartedOnboarding ? setShowOnboarding(true) : handleStartOnboarding()}
                    disabled={startingOnboarding || hasPendingCounterOffer}
                    className="w-full mt-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg flex items-center justify-center gap-1"
                  >
                    <IoImageOutline className="w-3 h-3" />
                    Upload Now
                  </button>
                )}
              </div>

              {/* Set Rate */}
              <div className={`p-4 rounded-lg border ${
                onboardingProgress.ratesConfigured
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                  : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Rate</span>
                  {onboardingProgress.ratesConfigured ? (
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                  ) : (
                    <IoAlertCircleOutline className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {onboardingProgress.ratesConfigured ? `${formatCurrency(dailyRate)}/day set` : 'Confirm or adjust rate'}
                </p>
                {!onboardingProgress.ratesConfigured && (
                  <button
                    onClick={() => hasStartedOnboarding ? setShowOnboarding(true) : handleStartOnboarding()}
                    disabled={startingOnboarding || hasPendingCounterOffer}
                    className="w-full mt-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg flex items-center justify-center gap-1"
                  >
                    <IoCashOutline className="w-3 h-3" />
                    Set Rate
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
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Payout</span>
                  {onboardingProgress.payoutConnected ? (
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                  ) : (
                    <IoAlertCircleOutline className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {onboardingProgress.payoutConnected ? 'Bank connected' : 'Connect bank account'}
                </p>
                {!onboardingProgress.payoutConnected && (
                  <button
                    onClick={() => hasStartedOnboarding ? setShowOnboarding(true) : handleStartOnboarding()}
                    disabled={startingOnboarding || hasPendingCounterOffer}
                    className="w-full mt-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg flex items-center justify-center gap-1"
                  >
                    <IoWalletOutline className="w-3 h-3" />
                    Connect
                  </button>
                )}
              </div>

              {/* Overall Progress */}
              <div className={`p-4 rounded-lg border ${
                onboardingProgress.percentComplete === 100
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                  : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {onboardingProgress.percentComplete}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${onboardingProgress.percentComplete}%` }}
                  />
                </div>
                {onboardingProgress.percentComplete === 100 && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    Ready to receive booking!
                  </p>
                )}
              </div>
            </div>

            {/* Important Note */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> Your car will NOT be published publicly. Only this guest will be able to book it.
                You can choose to make it public later if you want to receive more bookings.
              </p>
            </div>
          </div>
        )}
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
                Test Your Agreement
              </h2>
              <button
                onClick={() => {
                  setShowTestPdfModal(false)
                  setTestPdfEmail('')
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <IoCloseOutline className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Document Preview */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                    <IoDocumentTextOutline className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Your Rental Agreement</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">The PDF you uploaded</p>
                  </div>
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Send test to your email
                </label>
                <div className="relative">
                  <IoMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={testPdfEmail}
                    onChange={(e) => setTestPdfEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  We'll send your agreement with an e-signature request
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>How it works:</strong> You'll receive an email just like your guests will,
                  with a link to review and sign the agreement electronically.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowTestPdfModal(false)
                  setTestPdfEmail('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!testPdfEmail) return
                  setSendingTestPdf(true)
                  // TODO: Replace with actual API call to send test e-sign
                  await new Promise(resolve => setTimeout(resolve, 1500))
                  setSendingTestPdf(false)
                  setShowTestPdfModal(false)
                  setTestPdfEmail('')
                  alert('Test agreement sent! Check your email.')
                }}
                disabled={!testPdfEmail || sendingTestPdf}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingTestPdf ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Sending...
                  </>
                ) : (
                  <>
                    <IoSendOutline className="w-4 h-4" />
                    Send Test
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
                Vehicle Rental Agreement
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Vehicle Rental Agreement</h3>
                <p className="text-sm text-gray-500 mt-1">Request: #{data.prospect.id.slice(0, 8).toUpperCase()}</p>
              </div>

              <div className="space-y-4">
                {/* Parties */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Renter (Guest)</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{data.request.guestName || 'Guest'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Vehicle Owner (Partner)</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{data.host.name}</p>
                  </div>
                </div>

                {/* Vehicle */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Vehicle</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {data.request.vehicleInfo || 'Vehicle details pending'}
                  </p>
                </div>

                {/* Dates */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pickup Date</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {data.request.startDate ? new Date(data.request.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Return Date</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {data.request.endDate ? new Date(data.request.endDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pickup Location</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {data.request.pickupCity && data.request.pickupState ? `${data.request.pickupCity}, ${data.request.pickupState}` : 'Location TBD'}
                  </p>
                </div>

                {/* Duration & Rate */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Days</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{data.request.durationDays || 0} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Daily Rate</p>
                    <p className="font-semibold text-gray-900 dark:text-white">${data.request.offeredRate || 0}/day</p>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Total Rental Amount</span>
                      <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        ${data.request.totalAmount?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Legal */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-sm text-gray-500 dark:text-gray-400 space-y-2">
                  <p><strong>Governing Law:</strong> State of Arizona</p>
                  <p><strong>Venue:</strong> Maricopa County Superior Court</p>
                  <p className="text-xs mt-4">
                    By signing this agreement, both parties agree to the terms and conditions outlined herein.
                    This agreement is facilitated by ItWhip as a platform service.
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
                Close
              </button>
              <a
                href="https://itwhip.com/rentals/cmjutqr7k0001ju04qwg6ds9a/book"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                <IoDocumentTextOutline className="w-4 h-4" />
                View Full Agreement
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
