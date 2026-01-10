// app/(guest)/dashboard/components/VerificationAlert.tsx
// ✅ STRIPE IDENTITY VERIFICATION ALERT SYSTEM
// State 1: Not Verified (Yellow - Action Required) - "Verify with Stripe"
// State 2: Verification Pending (Blue - In Progress)
// State 3: Verified (No Alert - Success)

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
}

// ========== MAIN COMPONENT ==========
export default function VerificationAlert({
  verificationState,
  onNavigate
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
  const isPending = stripeIdentityStatus === 'pending' || stripeIdentityStatus === 'requires_input'
  const hasPhone = !!phoneNumber

  // Don't render if verified
  if (isVerified) {
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

  // Pending state - verification in progress
  if (isPending) {
    return (
      <div
        className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4 mt-4 transition-all duration-300 animate-fadeIn shadow-md"
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-start flex-1 min-w-0">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm sm:text-base text-blue-900 dark:text-blue-100">
                Verification In Progress
              </p>
              <p className="text-xs sm:text-sm mt-1 text-blue-700 dark:text-blue-300">
                Your identity is being verified. This usually takes a few minutes. You'll be notified once complete.
              </p>
              <div className="mt-3 flex items-center space-x-2 text-xs text-blue-700 dark:text-blue-300">
                <Clock className="w-4 h-4" />
                <span>Verification typically completes within minutes</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleVerifyWithStripe}
            disabled={isLoading}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center space-x-1.5 active:scale-95 flex-shrink-0 disabled:opacity-50"
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

  // Not verified state - action required
  return (
    <div
      className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4 mt-4 transition-all duration-300 animate-fadeIn shadow-md"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start justify-between flex-wrap gap-3">
        {/* Left Section: Icon + Text */}
        <div className="flex items-start flex-1 min-w-0">
          <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm sm:text-base text-yellow-900 dark:text-yellow-100">
              Verify Your Identity
            </p>
            <p className="text-xs sm:text-sm mt-1 text-yellow-700 dark:text-yellow-300">
              Complete identity verification to unlock all features and receive a $250 deposit bonus.
            </p>

            {/* Verification steps */}
            <div className="mt-3 space-y-1.5">
              {/* Phone Number - Show if missing */}
              {!hasPhone && (
                <div className="flex items-center text-xs">
                  <div className="w-4 h-4 rounded-full border-2 border-red-400 dark:border-red-500 mr-2" />
                  <span className="text-red-700 dark:text-red-300 font-medium">
                    Add Phone Number First
                  </span>
                </div>
              )}

              {/* Stripe Identity verification steps */}
              <div className="flex items-center text-xs">
                <div className="w-4 h-4 rounded-full border-2 border-yellow-400 dark:border-yellow-500 mr-2 flex items-center justify-center">
                  <span className="text-[8px] text-yellow-600">1</span>
                </div>
                <span className="text-yellow-700 dark:text-yellow-300">
                  Photo of Driver's License (front & back)
                </span>
              </div>
              <div className="flex items-center text-xs">
                <div className="w-4 h-4 rounded-full border-2 border-yellow-400 dark:border-yellow-500 mr-2 flex items-center justify-center">
                  <span className="text-[8px] text-yellow-600">2</span>
                </div>
                <span className="text-yellow-700 dark:text-yellow-300">
                  Selfie to match your ID
                </span>
              </div>
              <div className="flex items-center text-xs">
                <div className="w-4 h-4 rounded-full border-2 border-yellow-400 dark:border-yellow-500 mr-2 flex items-center justify-center">
                  <span className="text-[8px] text-yellow-600">3</span>
                </div>
                <span className="text-yellow-700 dark:text-yellow-300">
                  Instant verification via Stripe
                </span>
              </div>
            </div>

            {/* Bonus callout */}
            <div className="mt-3 flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded text-xs">
              <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-300 font-medium">
                Get signup bonus when verified + payment method added!
              </span>
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Action Button */}
        <button
          onClick={hasPhone ? handleVerifyWithStripe : () => onNavigate('/profile?tab=personal')}
          disabled={isLoading}
          className={`px-2.5 sm:px-3 py-1.5 sm:py-2 ${
            hasPhone
              ? 'bg-yellow-600 hover:bg-yellow-700'
              : 'bg-gray-500 hover:bg-gray-600'
          } text-white rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center space-x-1.5 active:scale-95 flex-shrink-0 disabled:opacity-50`}
          aria-label={hasPhone ? "Verify with Stripe" : "Add phone number"}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{hasPhone ? 'Verify with Stripe' : 'Add Phone First'}</span>
              <span className="sm:hidden">{hasPhone ? 'Verify' : 'Add Phone'}</span>
            </>
          )}
        </button>
      </div>

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
