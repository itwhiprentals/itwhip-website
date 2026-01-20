// app/partner/requests/[id]/page.tsx
// Request Detail Page for recruited hosts - shows booking request and onboarding steps

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
  IoCashOutline,
  IoPersonOutline,
  IoCheckmarkCircle,
  IoEllipseOutline,
  IoArrowForwardOutline,
  IoImageOutline,
  IoWalletOutline,
  IoDocumentTextOutline,
  IoCloseCircleOutline,
  IoWarningOutline,
  IoRocketOutline,
  IoStarOutline,
  IoShieldCheckmarkOutline,
  IoCardOutline,
  IoHandLeftOutline,
  IoChatbubbleOutline,
  IoRefreshOutline
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
  const requestId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<RequestData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [timeDisplay, setTimeDisplay] = useState<string>('')
  const [showCounterOffer, setShowCounterOffer] = useState(false)
  const [showDecline, setShowDecline] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [startingOnboarding, setStartingOnboarding] = useState(false)

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
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (hours > 0) {
        setTimeDisplay(`${hours}h ${minutes}m`)
      } else if (minutes > 0) {
        setTimeDisplay(`${minutes}m ${seconds}s`)
      } else {
        setTimeDisplay(`${seconds}s`)
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
        fetchRequest() // Refresh data
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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'TBD'
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatShortDate = (dateStr: string | null) => {
    if (!dateStr) return 'TBD'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48" />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
            <IoWarningOutline className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {error || 'Request Not Found'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              This request may have expired or you may not have access.
            </p>
            <Link
              href="/partner/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
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
  const isExpiringSoon = timeRemaining && !isExpired && timeRemaining.hours < 12
  const hasStartedOnboarding = !!host.onboardingStartedAt
  const hasCompleted = !!host.onboardingCompletedAt
  const hasDeclined = !!host.declinedRequestAt
  const hasPendingCounterOffer = prospect.counterOfferStatus === 'PENDING'

  // Calculate earnings
  const dailyRate = prospect.counterOfferStatus === 'APPROVED' && prospect.counterOfferAmount
    ? prospect.counterOfferAmount
    : request.offeredRate || 0
  const durationDays = request.durationDays || 14
  const totalAmount = dailyRate * durationDays
  const platformFee = totalAmount * 0.1
  const hostEarnings = totalAmount - platformFee

  // Show onboarding wizard if started
  if (showOnboarding || (hasStartedOnboarding && !hasCompleted && !hasDeclined)) {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-900 px-4 pt-4 pb-2 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/partner/dashboard?section=requests"
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <IoArrowBackOutline className="text-xl text-gray-600 dark:text-gray-400" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Request Details
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  #{request.id?.slice(0, 8) || 'REQ'}
                </p>
              </div>
            </div>
            <button
              onClick={fetchRequest}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Refresh"
            >
              <IoRefreshOutline className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Status Banner */}
        {isExpired ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <IoCloseCircleOutline className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300">Request Expired</h3>
                <p className="text-sm text-red-600 dark:text-red-400">
                  This request has expired. Contact support if you'd like to discuss options.
                </p>
              </div>
            </div>
          </div>
        ) : hasDeclined ? (
          <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <IoCloseCircleOutline className="w-6 h-6 text-gray-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">Request Declined</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You declined this request. Contact support if you've changed your mind.
                </p>
              </div>
            </div>
          </div>
        ) : hasPendingCounterOffer ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <IoTimeOutline className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Counter-Offer Pending</h3>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Your counter-offer of ${prospect.counterOfferAmount}/day is being reviewed. We'll notify you within 2 hours.
                </p>
              </div>
            </div>
          </div>
        ) : isExpiringSoon ? (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <IoTimeOutline className="w-6 h-6 text-orange-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-orange-800 dark:text-orange-300">Time Running Out</h3>
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    Complete onboarding soon to secure this booking.
                  </p>
                </div>
              </div>
              <div className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/40 rounded-full text-orange-700 dark:text-orange-300 font-semibold">
                {timeDisplay}
              </div>
            </div>
          </div>
        ) : timeDisplay ? (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <IoRocketOutline className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300">Ready to Start</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Complete onboarding to receive this booking.
                  </p>
                </div>
              </div>
              <div className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-700 dark:text-blue-300 font-semibold">
                {timeDisplay} remaining
              </div>
            </div>
          </div>
        ) : null}

        {/* Earnings Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <p className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wide font-medium mb-1">
                Your Potential Earnings
              </p>
              <p className="text-4xl font-bold text-green-700 dark:text-green-300">
                ${hostEarnings.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                {durationDays} days @ ${dailyRate}/day • After 10% platform fee
              </p>
              {prospect.counterOfferStatus === 'APPROVED' && (
                <p className="text-xs text-green-500 dark:text-green-500 mt-1">
                  Rate adjusted based on your approved counter-offer
                </p>
              )}
            </div>
            <div className="flex items-center justify-end">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">${totalAmount.toLocaleString()}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Platform fee: ${platformFee.toFixed(0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle & Rental Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vehicle Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <IoCarOutline className="w-5 h-5 text-blue-600" />
              Your Vehicle
            </h2>
            {host.cars.length > 0 ? (
              <div className="space-y-3">
                {host.cars.map(car => (
                  <div key={car.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="w-16 h-12 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden flex-shrink-0">
                      {car.photos?.[0]?.url ? (
                        <img src={car.photos[0].url} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <IoCarOutline className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {car.year} {car.make} {car.model}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">Ready for booking</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <IoCarOutline className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {request.vehicleInfo || 'Vehicle Awaiting Setup'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Add your vehicle details during onboarding
                </p>
              </div>
            )}
          </div>

          {/* Rental Period */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <IoCalendarOutline className="w-5 h-5 text-purple-600" />
              Rental Period
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Dates</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatShortDate(request.startDate)} - {formatShortDate(request.endDate)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {durationDays} days
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pickup Location</p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <IoLocationOutline className="w-4 h-4 text-gray-400" />
                  {request.pickupCity || 'Phoenix'}, {request.pickupState || 'AZ'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Guest will come to your location
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Daily Rate</p>
                <p className="font-semibold text-green-600 dark:text-green-400 text-lg">
                  ${dailyRate}/day
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Guest Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <IoPersonOutline className="w-5 h-5 text-indigo-600" />
              Guest Information
            </h2>
            {!hasCompleted && (
              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                Full details after onboarding
              </span>
            )}
          </div>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {request.guestName?.charAt(0) || 'G'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {request.guestName || 'Guest'}
              </h3>
              {request.guestRating && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <IoStarOutline className="w-4 h-4 fill-current" />
                    <span className="font-medium">{request.guestRating.toFixed(1)}</span>
                  </div>
                  {request.guestTrips && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({request.guestTrips} trips)
                    </span>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded">
                  <IoShieldCheckmarkOutline className="w-3 h-3" />
                  Identity Verified
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
                  <IoCardOutline className="w-3 h-3" />
                  Payment on File
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Onboarding Progress */}
        {!hasCompleted && !hasDeclined && !isExpired && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <IoRocketOutline className="w-5 h-5 text-orange-600" />
              Complete Onboarding
            </h2>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-medium text-gray-900 dark:text-white">{onboardingProgress.percentComplete}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-600 rounded-full transition-all duration-500"
                  style={{ width: `${onboardingProgress.percentComplete}%` }}
                />
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3 mb-6">
              {/* Step 1: Photos */}
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                onboardingProgress.carPhotosUploaded
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
              }`}>
                {onboardingProgress.carPhotosUploaded ? (
                  <IoCheckmarkCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <IoEllipseOutline className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${onboardingProgress.carPhotosUploaded ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-white'}`}>
                    Upload Car Photos
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {onboardingProgress.carPhotosUploaded ? 'Photos uploaded' : 'Minimum 3 photos required'}
                  </p>
                </div>
                <IoImageOutline className="w-5 h-5 text-gray-400" />
              </div>

              {/* Step 2: Rates */}
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                onboardingProgress.ratesConfigured
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
              }`}>
                {onboardingProgress.ratesConfigured ? (
                  <IoCheckmarkCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <IoEllipseOutline className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${onboardingProgress.ratesConfigured ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-white'}`}>
                    Set Your Rate
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {onboardingProgress.ratesConfigured ? 'Rate configured' : 'Confirm or adjust daily rate'}
                  </p>
                </div>
                <IoCashOutline className="w-5 h-5 text-gray-400" />
              </div>

              {/* Step 3: Payout */}
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                onboardingProgress.payoutConnected
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
              }`}>
                {onboardingProgress.payoutConnected ? (
                  <IoCheckmarkCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <IoEllipseOutline className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${onboardingProgress.payoutConnected ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-white'}`}>
                    Connect Payout
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {onboardingProgress.payoutConnected ? 'Payout connected' : 'Connect bank for payments'}
                  </p>
                </div>
                <IoWalletOutline className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleStartOnboarding}
                disabled={startingOnboarding || hasPendingCounterOffer}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {startingOnboarding ? (
                  <>
                    <IoRefreshOutline className="w-5 h-5 animate-spin" />
                    Starting...
                  </>
                ) : hasStartedOnboarding ? (
                  <>
                    Continue Onboarding
                    <IoArrowForwardOutline className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Start Onboarding
                    <IoArrowForwardOutline className="w-5 h-5" />
                  </>
                )}
              </button>
              <button
                onClick={() => setShowCounterOffer(true)}
                disabled={hasPendingCounterOffer}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IoHandLeftOutline className="w-5 h-5" />
                Counter-Offer
              </button>
              <button
                onClick={() => setShowDecline(true)}
                className="flex items-center justify-center gap-2 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors"
              >
                <IoCloseCircleOutline className="w-5 h-5" />
                Decline
              </button>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-start gap-3">
            <IoChatbubbleOutline className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Questions? We're here to help.
              </p>
              <div className="flex flex-wrap gap-4 mt-2">
                <a
                  href="tel:+13053999069"
                  className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
                >
                  Call (305) 399-9069
                </a>
                <a
                  href="mailto:info@itwhip.com"
                  className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
                >
                  Email Support
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
    </div>
  )
}
