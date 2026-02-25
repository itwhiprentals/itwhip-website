// app/partner/dashboard/components/PendingRequestCard.tsx
// Card showing pending request for external recruit hosts with onboarding steps

'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import {
  IoTimeOutline,
  IoCarOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoCashOutline,
  IoCheckmarkCircle,
  IoEllipseOutline,
  IoArrowForwardOutline,
  IoCloseCircleOutline,
  IoWarningOutline,
  IoRocketOutline,
  IoPersonOutline,
  IoStarOutline,
  IoShieldCheckmarkOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

// Data from /api/partner/onboarding for recruited hosts
interface OnboardingData {
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
    guestVerified: boolean
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

interface OnboardingProgress {
  hasVehicle: boolean
  hasPhotos: boolean
  hasAgreement: boolean
  vehicleCount: number
  photoCount: number
}

export default function PendingRequestCard() {
  const [loading, setLoading] = useState(true)
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [isRecruitedHost, setIsRecruitedHost] = useState(true) // Assume true initially
  const [progress, setProgress] = useState<OnboardingProgress>({
    hasVehicle: false,
    hasPhotos: false,
    hasAgreement: false,
    vehicleCount: 0,
    photoCount: 0
  })
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const t = useTranslations('PartnerDashboard')

  const locale = useLocale()

  useEffect(() => {
    fetchPendingRequest()
  }, [])

  // Countdown timer - use timeRemaining from API or calculate from expiresAt
  useEffect(() => {
    if (!onboardingData?.request?.expiresAt && !onboardingData?.timeRemaining) return

    const updateCountdown = () => {
      // Use API-provided timeRemaining if available
      if (onboardingData?.timeRemaining) {
        if (onboardingData.timeRemaining.expired) {
          setTimeRemaining('Expired')
          return
        }
        setTimeRemaining(`${onboardingData.timeRemaining.hours}h ${onboardingData.timeRemaining.minutes}m`)
        return
      }

      // Fallback to calculating from expiresAt
      if (onboardingData?.request?.expiresAt) {
        const now = new Date()
        const expires = new Date(onboardingData.request.expiresAt)
        const diff = expires.getTime() - now.getTime()

        if (diff <= 0) {
          setTimeRemaining('Expired')
          return
        }

        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        setTimeRemaining(`${hours}h ${minutes}m`)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [onboardingData?.request?.expiresAt, onboardingData?.timeRemaining])

  const fetchPendingRequest = async () => {
    try {
      // Fetch onboarding data for recruited hosts
      const response = await fetch('/api/partner/onboarding', {
        credentials: 'include'
      })

      if (!response.ok) {
        // Not a recruited host or error - hide the card
        if (response.status === 400) {
          // "Not a recruited host" - this is expected for regular hosts
          setIsRecruitedHost(false)
        }
        setLoading(false)
        return
      }

      const data = await response.json()

      if (data.success) {
        setOnboardingData(data)
        setIsRecruitedHost(true)

        // Set progress from API response
        const vehicles = data.host?.cars || []
        const hasVehicle = vehicles.length > 0
        const totalPhotos = vehicles.reduce((acc: number, v: any) => acc + (v.photos?.length || 0), 0)
        const hasPhotos = totalPhotos >= 3

        setProgress({
          hasVehicle,
          hasPhotos,
          hasAgreement: data.onboardingProgress?.agreementUploaded || false,
          vehicleCount: vehicles.length,
          photoCount: totalPhotos
        })
      }
    } catch (error) {
      console.error('Failed to fetch pending request:', error)
      setIsRecruitedHost(false)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Calculate potential earnings from API data
  const request = onboardingData?.request
  const potentialEarnings = request?.hostEarnings ||
    (request?.offeredRate && request?.durationDays
      ? request.offeredRate * request.durationDays * 0.9 // 90% after platform fee
      : null)

  // Loading state
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Not a recruited host - don't show this card
  if (!isRecruitedHost || !onboardingData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <IoCheckmarkCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('prAllCaughtUp')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {t('prNoPendingRequests')}
          </p>
          <Link
            href="/partner/requests"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
          >
            {t('prBrowseRequests')}
            <IoArrowForwardOutline className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  // Check if onboarding is already completed or declined
  if (onboardingData.host.onboardingCompletedAt) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <IoCheckmarkCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('prOnboardingComplete')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {t('prBookingProcessing')}
          </p>
          <Link
            href="/partner/bookings"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
          >
            {t('prViewBookings')}
            <IoArrowForwardOutline className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  if (onboardingData.host.declinedRequestAt) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <IoCloseCircleOutline className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('prRequestDeclined')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {t('prDeclinedMessage')}
          </p>
        </div>
      </div>
    )
  }

  const startDate = formatDate(request?.startDate || null)
  const endDate = formatDate(request?.endDate || null)
  const datesDisplay = startDate && endDate ? `${startDate} - ${endDate}` : (startDate || 'Flexible')
  const isExpiringSoon = onboardingData.timeRemaining &&
    !onboardingData.timeRemaining.expired &&
    onboardingData.timeRemaining.hours < 12

  // Calculate completion percentage from API
  const completionPercent = onboardingData.onboardingProgress?.percentComplete || 0

  const totalAmount = request?.totalAmount || (request?.offeredRate && request?.durationDays ? request.offeredRate * request.durationDays : 0)
  const platformFee = Math.round(totalAmount * 0.1)

  return (
    <div className="space-y-4">
      {/* Urgency warning — top level if expiring */}
      {isExpiringSoon && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <IoWarningOutline className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">{t('prTimeRunningOut')}</p>
            <p className="text-xs text-red-600 dark:text-red-400">{t('prCompleteOnboarding')}</p>
          </div>
          {timeRemaining && (
            <span className="px-3 py-1.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full text-sm font-bold">
              {timeRemaining}
            </span>
          )}
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* ── Header ───────────────────────────────────────── */}
        <div className={`px-6 py-4 ${isExpiringSoon ? 'bg-red-50 dark:bg-red-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isExpiringSoon ? 'bg-red-100 dark:bg-red-900/40' : 'bg-orange-100 dark:bg-orange-900/40'}`}>
                <IoRocketOutline className={`w-5 h-5 ${isExpiringSoon ? 'text-red-600' : 'text-orange-600'}`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('prYourBookingRequest')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{request?.vehicleInfo || t('prVehicleRequest')}</p>
              </div>
            </div>
            {timeRemaining && !isExpiringSoon && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300">
                <IoTimeOutline className="w-4 h-4" />
                {timeRemaining}
              </div>
            )}
          </div>
        </div>

        {/* ── Your Potential Payout ────────────────────────── */}
        {potentialEarnings && request && (
          <div className="px-6 pt-5">
            <p className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wide font-medium mb-1">{t('prYourPotentialPayout')}</p>
            <p className="text-4xl font-extrabold text-green-700 dark:text-green-300 tracking-tight">
              ${Math.round(potentialEarnings).toLocaleString()}<span className="text-2xl">.00</span>
            </p>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">{t('prDaysAtRate', { days: request.durationDays || 0, rate: request.offeredRate?.toFixed(2) || '0' })}</span>
                <span className="font-medium text-gray-700 dark:text-gray-200">${totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t('prPlatformFee')}</span>
                <span className="text-gray-500 dark:text-gray-400">-${platformFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-green-700 dark:text-green-300 pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>{t('prYouReceive')}</span>
                <span>${Math.round(potentialEarnings).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Booking Details ─────────────────────────────── */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Guest */}
            {request?.guestName && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                  <IoPersonOutline className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">{t('prGuestRequesting')}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="font-semibold text-gray-900 dark:text-white">{request.guestName}</span>
                    {request.guestRating && (
                      <span className="flex items-center gap-0.5 text-yellow-500">
                        <IoStarOutline className="w-3.5 h-3.5 fill-current" />
                        <span className="text-xs font-bold">{request.guestRating.toFixed(1)}</span>
                      </span>
                    )}
                    {request.guestTrips !== null && request.guestTrips !== undefined && (
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">{t('prTrips', { trips: request.guestTrips })}</span>
                    )}
                    {request.guestVerified && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-[10px] font-semibold">
                        <IoShieldCheckmarkOutline className="w-3 h-3" />
                        {t('prVerified')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Vehicle */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <IoCarOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">{t('prYourVehicle')}</p>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">
                  {progress.hasVehicle ? (request?.vehicleInfo || t('prVehicleAdded')) : (
                    <span className="text-amber-600 dark:text-amber-400">{t('prNotListed')}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <IoCalendarOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">{t('prRentalPeriod')}</p>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">
                  {datesDisplay}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('prDaysCount', { days: request?.durationDays || 0 })}</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                <IoLocationOutline className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">{t('prPickupLocation')}</p>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">
                  {request?.pickupCity || 'Phoenix'}, {request?.pickupState || 'AZ'}
                </p>
              </div>
            </div>
          </div>

          {/* Daily Rate — highlighted strip */}
          {request?.offeredRate && (
            <div className="mt-4 flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-200/60 dark:border-orange-800/40 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('prDailyRate')}</span>
              <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{t('prRatePerDay', { rate: request.offeredRate.toFixed(2) })}</span>
            </div>
          )}
        </div>

        {/* ── Divider ─────────────────────────────────────── */}
        <div className="border-t border-gray-200 dark:border-gray-700" />

        {/* ── Add Your Car / Car Added ────────────────────── */}
        <div className="px-6 py-5">
          {/* Status dot */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-2.5 h-2.5 rounded-full ${progress.hasVehicle ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {progress.hasVehicle ? t('prCarListedReady') : t('prNextStepAddCar')}
            </span>
          </div>

          {!progress.hasVehicle ? (
            <div className="space-y-4">
              <p className="font-semibold text-gray-900 dark:text-white text-base">
                {t('prAddCarToReceive')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('prListVehicleDesc', { vehicle: request?.vehicleInfo || 'vehicle' })}
              </p>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <p className="text-xs text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1.5">
                  <IoEllipseOutline className="w-3 h-3" />
                  {t('prNotPublic')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-4.5">
                  {t('prOnlyGuestSees', { guest: request?.guestName || 'this guest' })}
                </p>
              </div>
              <Link
                href="/partner/fleet"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                <IoCarOutline className="w-5 h-5" />
                {t('prAddYourCar')}
              </Link>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200/70 dark:border-green-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                  <IoCheckmarkCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-200">{t('prCarAddedSuccess')}</p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {t('prVehicleWithPhotos', { vehicleCount: progress.vehicleCount, photoCount: progress.photoCount })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Divider ─────────────────────────────────────── */}
        <div className="border-t border-gray-200 dark:border-gray-700" />

        {/* ── How This Works ──────────────────────────────── */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-2 mb-4">
            <IoInformationCircleOutline className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('prHowThisWorks')}</p>
          </div>
          <div className="flex items-start gap-4">
            {/* Step 1 */}
            <div className="flex-1 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-sm">1</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-tight">{t('prStep1AddVehicle')}</p>
            </div>
            <div className="flex-shrink-0 mt-4 w-8 border-t-2 border-dashed border-gray-300 dark:border-gray-600" />
            {/* Step 2 */}
            <div className="flex-1 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-sm">2</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-tight">{t('prStep2GuestReviews')}</p>
            </div>
            <div className="flex-shrink-0 mt-4 w-8 border-t-2 border-dashed border-gray-300 dark:border-gray-600" />
            {/* Step 3 */}
            <div className="flex-1 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-sm">3</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-tight">{t('prStep3GetPaid')}</p>
            </div>
          </div>
        </div>

        {/* ── Action Button ───────────────────────────────── */}
        <div className="px-6 pb-5">
          <Link
            href={`/partner/requests/${request?.id || ''}`}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition-colors text-base shadow-sm"
          >
            {progress.hasVehicle ? (
              <>
                {t('prContinueToRequest')}
                <IoArrowForwardOutline className="w-5 h-5" />
              </>
            ) : (
              <>{t('prViewFullRequest')}</>
            )}
          </Link>
        </div>
      </div>

      {/* I Can't Do This — separate card below */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('prChangedMind')}</p>
          <button
            onClick={async () => {
              if (confirm('Are you sure you want to decline this request? This action cannot be undone.')) {
                try {
                  const response = await fetch('/api/partner/onboarding/decline', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                  })
                  if (response.ok) {
                    window.location.reload()
                  }
                } catch (error) {
                  console.error('Failed to decline:', error)
                }
              }
            }}
            className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg font-medium transition-colors text-sm"
          >
            {t('prICantDoThis')}
          </button>
        </div>
      </div>
    </div>
  )
}
