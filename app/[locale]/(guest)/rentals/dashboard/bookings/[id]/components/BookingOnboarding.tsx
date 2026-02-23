// app/(guest)/rentals/dashboard/bookings/[id]/components/BookingOnboarding.tsx
// Post-booking onboarding — smart verification routing
// Path A (Stripe verified): Claude AI DL camera verification → selfie fallback
// Path B (not Stripe verified): Stripe Identity redirect → auto-complete on return

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Booking } from '../types'
import {
  IoShieldCheckmarkOutline,
  IoLockClosedOutline,
  IoCheckmarkCircle,
  IoInformationCircleOutline,
} from 'react-icons/io5'
import { VisitorIdentityVerify } from '../../../../[carId]/book/components/VisitorIdentityVerify'

interface BookingOnboardingProps {
  booking: Booking
  onDocumentUploaded: () => void
}

export function BookingOnboarding({ booking, onDocumentUploaded }: BookingOnboardingProps) {
  const t = useTranslations('BookingDetail')
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verificationDone, setVerificationDone] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const isOnHold = booking.status === 'ON_HOLD'
  const [showContent, setShowContent] = useState(isOnHold)

  const isPending = booking.status === 'PENDING'
  const onboardingDone = !!booking.onboardingCompletedAt

  if (booking.status === 'ACTIVE' || booking.status === 'COMPLETED' || onboardingDone) return null

  // Skip Stripe if guest already Stripe-verified OR admin approved verification
  const isStripeVerified = !!booking.guestStripeVerified || booking.verificationStatus?.toUpperCase() === 'APPROVED'

  // Complete onboarding via API
  const completeOnboarding = async () => {
    try {
      const response = await fetch(`/api/rentals/bookings/${booking.id}/onboarding`, {
        method: 'POST',
        credentials: 'include'
      })
      if (response.ok) {
        onDocumentUploaded()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to complete onboarding')
      }
    } catch {
      setError('Failed to complete onboarding')
    }
  }

  // Path A: Stripe-verified → Claude AI camera verification
  const handleAIVerificationComplete = async (result: any) => {
    if (result.passed || result.manualPending) {
      setVerificationDone(true)
      await completeOnboarding()
    }
  }

  // Path B: Not Stripe-verified → Redirect to Stripe Identity
  const handleStripeVerify = async () => {
    setIsVerifying(true)
    setError(null)
    try {
      const response = await fetch('/api/identity/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/rentals/dashboard/bookings/${booking.id}?verified=true`
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to start verification')
      if (data.url) window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start verification')
      setIsVerifying(false)
    }
  }

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all ${isPending ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
            {t('onboardTitle')}
          </h3>
          <div className="flex items-center justify-center gap-1 mt-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isPending
                ? t('onboardAvailableAfterApproval')
                : t('hostWantsToSeeDL', { hostName: booking.host.name })}
            </p>
            {!isPending && (
              <div className="relative">
                <button
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <IoInformationCircleOutline className="w-3.5 h-3.5" />
                </button>
                {showTooltip && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowTooltip(false)} />
                    <div className="absolute right-0 top-full mt-1 z-50 w-72 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg leading-relaxed sm:left-0 sm:right-auto">
                      {t('hostVerifyTooltip')}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          {isPending && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mt-2">
              <IoLockClosedOutline className="w-4 h-4" />
              <span>{t('locked')}</span>
            </div>
          )}
          {!isPending && !showContent && !verificationDone && (
            <button
              onClick={() => setShowContent(true)}
              className="mt-3 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <IoShieldCheckmarkOutline className="w-4 h-4" />
              <span>{t('uploadNow')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Content — collapsed by default, expand on button click */}
      {!isPending && (showContent || verificationDone) && (
        <div className="relative px-4 sm:px-6 py-4">
          {/* X close button — collapse back to initial state */}
          {!verificationDone && (
            <button
              onClick={() => setShowContent(false)}
              className="absolute top-3 right-3 sm:right-5 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {isStripeVerified ? (
            // ═══ Path A: Already Stripe-verified → Claude AI DL verification ═══
            verificationDone ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <IoCheckmarkCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-200">{t('identityVerified')}</p>
                </div>
              </div>
            ) : (
              <VisitorIdentityVerify
                onVerificationComplete={handleAIVerificationComplete}
                driverName={booking.guestName}
                driverEmail={booking.guestEmail}
                driverPhone={booking.guestPhone}
                carId={booking.car.id}
                hideStripeFallback={true}
                allowFileUpload={true}
              />
            )
          ) : (
            // ═══ Path B: Not Stripe-verified → Stripe Identity button directly ═══
            <button
              onClick={handleStripeVerify}
              disabled={isVerifying}
              className="w-full px-4 py-3 bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <IoShieldCheckmarkOutline className="w-4 h-4" />
                  {t('verifyNow')}
                </>
              )}
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="px-4 sm:px-6 pb-3">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}
