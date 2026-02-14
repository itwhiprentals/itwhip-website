// app/(guest)/rentals/[carId]/book/components/GuestIdentityVerify.tsx
// Stripe Identity verification pill for logged-in guests
// Redirects to Stripe Identity for full verification ($1.50)

'use client'

import { useState } from 'react'
import {
  IoShieldCheckmarkOutline,
  IoCheckmarkCircle,
  IoIdCardOutline,
  IoPersonOutline,
  IoWarningOutline,
  IoArrowForwardOutline
} from 'react-icons/io5'

interface UserProfile {
  id: string
  email?: string | null
  name?: string | null
  stripeIdentityStatus?: string | null
  stripeIdentityVerifiedAt?: string | null
  documentsVerified?: boolean
  documentVerifiedAt?: string | null
}

interface GuestIdentityVerifyProps {
  userProfile: UserProfile | null
  onVerificationStarted?: () => void
  disabled?: boolean
}

export function GuestIdentityVerify({
  userProfile,
  onVerificationStarted,
  disabled = false
}: GuestIdentityVerifyProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Determine verification status
  const stripeStatus = userProfile?.stripeIdentityStatus
  const isVerified = userProfile?.documentsVerified || stripeStatus === 'verified'
  const isPending = stripeStatus === 'requires_input' || stripeStatus === 'pending'
  const verifiedAt = userProfile?.documentVerifiedAt || userProfile?.stripeIdentityVerifiedAt

  // Start Stripe Identity verification
  const handleVerify = async () => {
    if (disabled || isVerifying) return

    setIsVerifying(true)
    setError(null)
    onVerificationStarted?.()

    try {
      const response = await fetch('/api/identity/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnUrl: window.location.href
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start verification')
      }

      // Redirect to Stripe Identity
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('[GuestIdentityVerify] Error:', err)
      setError(err instanceof Error ? err.message : 'Verification failed')
      setIsVerifying(false)
    }
  }

  // Already verified
  if (isVerified) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <IoShieldCheckmarkOutline className="text-2xl text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-green-800 dark:text-green-300">
                Identity Verified
              </h3>
              <IoCheckmarkCircle className="text-green-600" />
            </div>
            {verifiedAt && (
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                Verified on {new Date(verifiedAt).toLocaleDateString()}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-green-600 dark:text-green-400">
              <span className="flex items-center gap-1">
                <IoIdCardOutline /> Driver's License
              </span>
              <span className="flex items-center gap-1">
                <IoPersonOutline /> Identity Photo
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Pending / needs to continue
  if (isPending) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <IoWarningOutline className="text-2xl text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">
              Verification Incomplete
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
              You started verification but didn't complete it. Please continue to book.
            </p>
            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
            <button
              onClick={handleVerify}
              disabled={isVerifying || disabled}
              className="mt-3 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Continue Verification</span>
                  <IoArrowForwardOutline />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Not verified - show verification prompt
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <IoIdCardOutline className="text-2xl text-orange-500 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Identity Verification
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Required - Verify your driver's license and identity to proceed
          </p>

          <div className="mt-3 space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <IoIdCardOutline className="text-gray-400" />
              <span>Photo of Driver's License (front & back)</span>
            </div>
            <div className="flex items-center gap-2">
              <IoPersonOutline className="text-gray-400" />
              <span>Selfie to match your ID</span>
            </div>
            <div className="flex items-center gap-2">
              <IoShieldCheckmarkOutline className="text-gray-400" />
              <span>Instant verification via Stripe</span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 mt-3">{error}</p>
          )}

          <button
            onClick={handleVerify}
            disabled={isVerifying || disabled}
            className="mt-4 w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Starting verification...</span>
              </>
            ) : (
              <>
                <IoShieldCheckmarkOutline className="text-xl" />
                <span>Verify My Identity</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GuestIdentityVerify
