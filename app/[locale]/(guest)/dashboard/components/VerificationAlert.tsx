// app/(guest)/dashboard/components/VerificationAlert.tsx
// ✅ ONBOARDING ALERT SYSTEM (post-booking, after host approval)
// Only shows when guest has a CONFIRMED booking and hasn't completed onboarding
// State 1: Not Started (Blue - Action Required) - "Start Onboarding"
// State 2: In Progress (Orange - Needs Completion)
// State 3: Verified (No Alert - Hidden)

'use client'

import { useState } from 'react'

// ========== SVG ICONS ==========
const AlertCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Clock = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CheckCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Shield = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const ExternalLink = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
)

// ========== TYPES ==========
interface DocumentVerificationState {
  emailVerified: boolean
  phoneVerified: boolean
  phoneNumber?: string | null
  documentsVerified: boolean
  driversLicenseUrl: string | null
  selfieUrl: string | null
  // Stripe Identity fields
  stripeIdentityStatus?: string | null
  stripeIdentityVerifiedAt?: string | null
}

interface VerificationAlertProps {
  verificationState: DocumentVerificationState
  onNavigate: (path: string) => void
  hasConfirmedBooking?: boolean
}

// ========== MAIN COMPONENT ==========
export default function VerificationAlert({
  verificationState,
  onNavigate,
  hasConfirmedBooking = false
}: VerificationAlertProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    documentsVerified,
    stripeIdentityStatus,
    phoneNumber
  } = verificationState

  // Determine verification state
  const isVerified = documentsVerified || stripeIdentityStatus === 'verified'
  const isProcessing = stripeIdentityStatus === 'pending' // Stripe is actively reviewing
  const needsCompletion = stripeIdentityStatus === 'requires_input' // User started but didn't finish
  const hasPhone = !!phoneNumber

  // Don't render if verified or no confirmed booking yet
  if (isVerified) {
    return null
  }
  if (!hasConfirmedBooking) {
    return null
  }

  // Handle Stripe Identity verification
  const handleVerifyWithStripe = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/identity/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/profile?tab=documents&verified=true`
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start verification')
      }

      // Redirect to Stripe Identity verification
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start verification')
      setIsLoading(false)
    }
  }

  // User started verification but didn't complete it
  if (needsCompletion) {
    return (
      <div
        className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-3 sm:p-4 mt-4 transition-all duration-300 animate-fadeIn shadow-md"
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-start flex-1 min-w-0">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm sm:text-base text-orange-900 dark:text-orange-100">
                Complete Your Onboarding
              </p>
              <p className="text-xs sm:text-sm mt-1 text-orange-700 dark:text-orange-300">
                Complete your onboarding to finalize your booking.
              </p>
              <div className="mt-3 flex items-center space-x-2 text-xs text-orange-700 dark:text-orange-300">
                <ExternalLink className="w-4 h-4" />
                <span>Click "Continue" to finish where you left off</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleVerifyWithStripe}
            disabled={isLoading}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center space-x-1.5 active:scale-95 flex-shrink-0 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Continue</span>
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  // Pending state - user started but may not have completed
  if (isProcessing) {
    return (
      <div
        className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-3 sm:p-4 mt-4 transition-all duration-300 animate-fadeIn shadow-md"
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-start flex-1 min-w-0">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm sm:text-base text-orange-900 dark:text-orange-100">
                Complete Your Onboarding
              </p>
              <p className="text-xs sm:text-sm mt-1 text-orange-700 dark:text-orange-300">
                Your onboarding is being reviewed. We'll notify you when it's complete.
              </p>
              <div className="mt-3 flex items-center space-x-2 text-xs text-orange-700 dark:text-orange-300">
                <ExternalLink className="w-4 h-4" />
                <span>Click "Continue" to finish where you left off</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleVerifyWithStripe}
            disabled={isLoading}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center space-x-1.5 active:scale-95 flex-shrink-0 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Continue</span>
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  // Not verified state - action required (soft blue/gray theme)
  return (
    <div
      className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 border border-blue-200 dark:border-gray-700 rounded-lg p-4 mt-4 transition-all duration-300 animate-fadeIn shadow-sm"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left Section: Icon + Text */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-gray-900 dark:text-white">
              Complete Onboarding
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              {!hasPhone ? 'Add phone number to continue' : 'Complete your onboarding to finalize your booking'}
            </p>
          </div>
        </div>

        {/* Right Section: Action Button */}
        <button
          onClick={hasPhone ? handleVerifyWithStripe : () => onNavigate('/profile?tab=personal')}
          disabled={isLoading}
          className={`px-4 py-2 ${
            hasPhone
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-600 hover:bg-gray-700'
          } text-white rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 active:scale-95 flex-shrink-0 disabled:opacity-50 shadow-sm`}
          aria-label={hasPhone ? "Verify with Stripe" : "Add phone number"}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Shield className="w-4 h-4" />
              <span>{hasPhone ? 'Start Onboarding' : 'Add Phone'}</span>
            </>
          )}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 text-xs text-red-600 dark:text-red-400 pl-11">
          {error}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
