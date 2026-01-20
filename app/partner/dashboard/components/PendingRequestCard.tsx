// app/partner/dashboard/components/PendingRequestCard.tsx
// Card showing pending request for external recruit hosts with onboarding steps

'use client'

import { useState, useEffect } from 'react'
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
  IoImageOutline,
  IoDocumentTextOutline,
  IoCloseCircleOutline,
  IoWarningOutline,
  IoRocketOutline
} from 'react-icons/io5'

interface PendingClaim {
  id: string
  requestId: string
  status: string
  claimExpiresAt: string | null
  offeredRate: number | null
  car: {
    id: string
    make: string
    model: string
    year: number
  } | null
  request: {
    id: string
    requestCode: string
    vehicleType: string | null
    vehicleMake: string | null
    vehicleModel: string | null
    startDate: string | null
    endDate: string | null
    durationDays: number | null
    offeredRate: number | null
    pickupCity: string | null
    pickupState: string | null
  }
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
  const [pendingClaim, setPendingClaim] = useState<PendingClaim | null>(null)
  const [progress, setProgress] = useState<OnboardingProgress>({
    hasVehicle: false,
    hasPhotos: false,
    hasAgreement: false,
    vehicleCount: 0,
    photoCount: 0
  })
  const [timeRemaining, setTimeRemaining] = useState<string>('')

  useEffect(() => {
    fetchPendingRequest()
  }, [])

  // Countdown timer
  useEffect(() => {
    if (!pendingClaim?.claimExpiresAt) return

    const updateCountdown = () => {
      const now = new Date()
      const expires = new Date(pendingClaim.claimExpiresAt!)
      const diff = expires.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining('Expired')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setTimeRemaining(`${hours}h ${minutes}m`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [pendingClaim?.claimExpiresAt])

  const fetchPendingRequest = async () => {
    try {
      // Fetch pending claims
      const response = await fetch('/api/partner/requests?myClaims=true&limit=1')
      const data = await response.json()

      if (data.success && data.requests?.length > 0) {
        const request = data.requests[0]
        if (request.myClaim) {
          setPendingClaim({
            ...request.myClaim,
            request: {
              id: request.id,
              requestCode: request.requestCode,
              vehicleType: request.vehicleType,
              vehicleMake: request.vehicleMake,
              vehicleModel: request.vehicleModel,
              startDate: request.startDate,
              endDate: request.endDate,
              durationDays: request.durationDays,
              offeredRate: request.offeredRate,
              pickupCity: request.pickupCity,
              pickupState: request.pickupState
            }
          })
        }
      }

      // Fetch onboarding progress
      const fleetResponse = await fetch('/api/partner/fleet')
      const fleetData = await fleetResponse.json()

      if (fleetData.success) {
        const vehicles = fleetData.vehicles || []
        const hasVehicle = vehicles.length > 0
        const hasPhotos = vehicles.some((v: any) => v.photos && v.photos.length >= 3)

        setProgress({
          hasVehicle,
          hasPhotos,
          hasAgreement: false, // Will be set based on agreement status
          vehicleCount: vehicles.length,
          photoCount: vehicles.reduce((acc: number, v: any) => acc + (v.photos?.length || 0), 0)
        })
      }
    } catch (error) {
      console.error('Failed to fetch pending request:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Calculate potential earnings
  const potentialEarnings = pendingClaim?.request?.offeredRate && pendingClaim?.request?.durationDays
    ? pendingClaim.request.offeredRate * pendingClaim.request.durationDays
    : null

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

  // No pending request
  if (!pendingClaim) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <IoCheckmarkCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            All Caught Up
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            You don't have any pending requests. Check back later or browse open requests.
          </p>
          <Link
            href="/partner/requests"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
          >
            Browse Requests
            <IoArrowForwardOutline className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  const startDate = formatDate(pendingClaim.request.startDate)
  const endDate = formatDate(pendingClaim.request.endDate)
  const datesDisplay = startDate && endDate ? `${startDate} - ${endDate}` : (startDate || 'Flexible')
  const isExpiringSoon = pendingClaim.claimExpiresAt &&
    new Date(pendingClaim.claimExpiresAt).getTime() - Date.now() < 12 * 60 * 60 * 1000 // Less than 12 hours

  // Calculate completion percentage
  const completedSteps = [progress.hasVehicle, progress.hasPhotos, progress.hasAgreement].filter(Boolean).length
  const totalSteps = 3
  const completionPercent = Math.round((completedSteps / totalSteps) * 100)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header with urgency */}
      <div className={`px-6 py-4 ${isExpiringSoon ? 'bg-red-50 dark:bg-red-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isExpiringSoon ? 'bg-red-100 dark:bg-red-900/40' : 'bg-orange-100 dark:bg-orange-900/40'}`}>
              <IoRocketOutline className={`w-5 h-5 ${isExpiringSoon ? 'text-red-600' : 'text-orange-600'}`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pending Request
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                #{pendingClaim.request.requestCode}
              </p>
            </div>
          </div>
          {/* Timer */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            isExpiringSoon
              ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
              : 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
          }`}>
            <IoTimeOutline className="w-4 h-4" />
            {timeRemaining || 'Loading...'}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Earnings highlight + Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Potential Earnings */}
          {potentialEarnings && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <p className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wide font-medium mb-1">
                Your Potential Payout
              </p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                ${potentialEarnings.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                {pendingClaim.request.durationDays} days @ ${pendingClaim.request.offeredRate}/day
              </p>
            </div>
          )}

          {/* Request Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <IoCarOutline className="w-4 h-4 text-gray-400" />
              <span>
                {pendingClaim.request.vehicleMake || pendingClaim.request.vehicleType || 'Any Vehicle'}
                {pendingClaim.request.vehicleModel && ` ${pendingClaim.request.vehicleModel}`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <IoCalendarOutline className="w-4 h-4 text-gray-400" />
              <span>{datesDisplay}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <IoLocationOutline className="w-4 h-4 text-gray-400" />
              <span>
                {pendingClaim.request.pickupCity || 'Phoenix'}, {pendingClaim.request.pickupState || 'AZ'}
              </span>
            </div>
            {pendingClaim.request.offeredRate && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <IoCashOutline className="w-4 h-4 text-gray-400" />
                <span>${pendingClaim.request.offeredRate}/day</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Onboarding Progress</span>
            <span className="font-medium text-gray-900 dark:text-white">{completionPercent}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-600 rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Onboarding Steps */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Complete these steps to accept the booking:
          </p>

          {/* Step 1: Add Vehicle */}
          <div className={`flex items-center gap-3 p-3 rounded-lg border ${
            progress.hasVehicle
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
          }`}>
            {progress.hasVehicle ? (
              <IoCheckmarkCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <IoEllipseOutline className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className={`font-medium ${progress.hasVehicle ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-white'}`}>
                Add Your Vehicle
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {progress.hasVehicle ? `${progress.vehicleCount} vehicle(s) added` : 'List your vehicle details'}
              </p>
            </div>
            {!progress.hasVehicle && (
              <Link
                href="/partner/fleet/add"
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg font-medium transition-colors"
              >
                Add
              </Link>
            )}
          </div>

          {/* Step 2: Upload Photos */}
          <div className={`flex items-center gap-3 p-3 rounded-lg border ${
            progress.hasPhotos
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
          }`}>
            {progress.hasPhotos ? (
              <IoCheckmarkCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <IoEllipseOutline className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className={`font-medium ${progress.hasPhotos ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-white'}`}>
                Upload Photos
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {progress.hasPhotos ? `${progress.photoCount} photos uploaded` : 'Minimum 3 photos required'}
              </p>
            </div>
            {!progress.hasPhotos && progress.hasVehicle && (
              <Link
                href="/partner/fleet"
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg font-medium transition-colors"
              >
                Upload
              </Link>
            )}
          </div>

          {/* Step 3: Sign Agreement */}
          <div className={`flex items-center gap-3 p-3 rounded-lg border ${
            progress.hasAgreement
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
          }`}>
            {progress.hasAgreement ? (
              <IoCheckmarkCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <IoEllipseOutline className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className={`font-medium ${progress.hasAgreement ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-white'}`}>
                Sign Rental Agreement
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {progress.hasAgreement ? 'Agreement signed' : 'Review and sign the host agreement'}
              </p>
            </div>
            {!progress.hasAgreement && progress.hasPhotos && (
              <Link
                href="/partner/settings"
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg font-medium transition-colors"
              >
                Sign
              </Link>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {progress.hasVehicle && progress.hasPhotos ? (
            <Link
              href={`/partner/requests/${pendingClaim.request.id}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
            >
              Accept & Start Booking
              <IoArrowForwardOutline className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/partner/fleet/add"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
            >
              Continue Onboarding
              <IoArrowForwardOutline className="w-4 h-4" />
            </Link>
          )}
          <button
            onClick={() => {
              if (confirm('Are you sure you want to decline this request? This action cannot be undone.')) {
                // Handle decline
              }
            }}
            className="px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors text-center"
          >
            I Can't Do This
          </button>
        </div>

        {/* Urgency warning */}
        {isExpiringSoon && (
          <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <IoWarningOutline className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                Time is running out!
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                Complete your onboarding soon or the request will be offered to another host.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
