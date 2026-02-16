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
  IoIdCardOutline,
  IoCameraOutline,
  IoFlashOutline,
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
  const [showContent, setShowContent] = useState(false)

  const isPending = booking.status === 'PENDING'
  const onboardingDone = !!booking.onboardingCompletedAt

  if (booking.status === 'ACTIVE' || booking.status === 'COMPLETED' || onboardingDone) return null

  const isStripeVerified = !!booking.guestStripeVerified

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
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all ${isPending ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 bg-gray-900 rounded-lg flex-shrink-0">
            <IoShieldCheckmarkOutline className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                {t('onboardTitle')}
              </h3>
              {isPending ? (
                <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0">
                  <IoLockClosedOutline className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('locked')}</span>
                </div>
              ) : !showContent && !verificationDone && (
                <button
                  onClick={() => setShowContent(true)}
                  className="hidden sm:flex px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors items-center gap-2 flex-shrink-0"
                >
                  <IoShieldCheckmarkOutline className="w-4 h-4" />
                  <span>{t('uploadNow')}</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <p className="text-xs text-gray-500">
                {isPending
                  ? t('onboardAvailableAfterApproval')
                  : isStripeVerified
                    ? t('hostWantsToSeeDL', { hostName: booking.host.name })
                    : t('onboardCompleteStripe')}
              </p>
              {!isPending && isStripeVerified && (
                <div className="relative">
                  <button
                    onClick={() => setShowTooltip(!showTooltip)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <IoInformationCircleOutline className="w-3.5 h-3.5" />
                  </button>
                  {showTooltip && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowTooltip(false)} />
                      <div className="absolute right-0 top-full mt-1 z-50 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg leading-relaxed sm:left-0 sm:right-auto">
                        {t('hostVerifyTooltip')}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            {/* Mobile: full-width button below text */}
            {!isPending && !showContent && !verificationDone && (
              <button
                onClick={() => setShowContent(true)}
                className="sm:hidden mt-3 w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <IoShieldCheckmarkOutline className="w-4 h-4" />
                <span>{t('uploadNow')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content — collapsed by default, expand on button click */}
      {!isPending && (showContent || verificationDone) && (
        <div className="px-4 sm:px-6 py-4">
          {isStripeVerified ? (
            // ═══ Path A: Already Stripe-verified → Claude AI DL verification ═══
            verificationDone ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <IoCheckmarkCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-900">{t('identityVerified')}</p>
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
            // ═══ Path B: Not Stripe-verified → Stripe Identity ═══
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  {t('stripeIdentityRequired')}
                </h4>
                <p className="text-xs text-blue-700 mb-3">
                  {t('stripeIdentityDesc')}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-blue-800">
                    <IoIdCardOutline className="w-4 h-4 flex-shrink-0" />
                    <span>{t('stripeStep1PhotoId')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-800">
                    <IoCameraOutline className="w-4 h-4 flex-shrink-0" />
                    <span>{t('stripeStep2Selfie')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-800">
                    <IoFlashOutline className="w-4 h-4 flex-shrink-0" />
                    <span>{t('stripeStep3Instant')}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleStripeVerify}
                disabled={isVerifying}
                className="w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="px-4 sm:px-6 pb-3">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}
