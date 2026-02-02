// app/(guest)/profile/components/tabs/DocumentsTab.tsx
// ✅ SIMPLIFIED: Stripe Identity handles all ID verification

'use client'

import { useState, useEffect } from 'react'
import {
  IoCheckmarkCircle,
  IoInformationCircleOutline,
  IoShieldCheckmarkOutline,
  IoArrowForwardOutline,
  IoFingerPrintOutline,
  IoPhonePortraitOutline
} from 'react-icons/io5'

interface DocumentsTabProps {
  profile: {
    documentsVerified: boolean
    documentVerifiedAt?: string
    phoneVerified?: boolean
    phoneNumber?: string
    phoneVerificationSkipped?: boolean
  }
  onDocumentUpdate: () => void
}

interface StripeIdentityStatus {
  isVerified: boolean
  isAdminOverride: boolean
  status: string | null
}

export default function DocumentsTab({ profile, onDocumentUpdate }: DocumentsTabProps) {
  const [identityStatus, setIdentityStatus] = useState<StripeIdentityStatus | null>(null)
  const [identityLoading, setIdentityLoading] = useState(true)
  const [startingVerification, setStartingVerification] = useState(false)

  // Load Stripe Identity verification status
  useEffect(() => {
    loadIdentityStatus()
  }, [])

  const loadIdentityStatus = async () => {
    try {
      setIdentityLoading(true)
      const response = await fetch('/api/identity/verify', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setIdentityStatus({
          isVerified: data.isVerified || false,
          isAdminOverride: data.isAdminOverride || false,
          status: data.status || null
        })
      }
    } catch (error) {
      console.error('Failed to load identity status:', error)
    } finally {
      setIdentityLoading(false)
    }
  }

  const handleStartVerification = async () => {
    try {
      setStartingVerification(true)

      // Create a Stripe Identity verification session
      const response = await fetch('/api/identity/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/profile?tab=documents&verified=true`
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start verification')
      }

      const data = await response.json()

      // Redirect to Stripe Identity verification page
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No verification URL returned')
      }
    } catch (error) {
      console.error('Failed to start verification:', error)
      alert(error instanceof Error ? error.message : 'Failed to start verification. Please try again.')
      setStartingVerification(false)
    }
  }

  const isIdentityVerified = identityStatus?.isVerified || false
  const isAdminOverride = identityStatus?.isAdminOverride || false

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Identity Verification</h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
          Complete verification once and enjoy instant booking for all future rentals
        </p>
      </div>

      {/* Stripe Identity Verification Status */}
      {identityLoading ? (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-600 border-t-transparent" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Checking verification status...</p>
          </div>
        </div>
      ) : isIdentityVerified ? (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg">
          <div className="flex items-start gap-3">
            <IoShieldCheckmarkOutline className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                Identity Verified ✨
              </h3>
              <p className="text-xs text-green-800 dark:text-green-300 mb-2">
                {isAdminOverride
                  ? 'Your identity has been manually verified by our team. You can now book vehicles instantly and access premium cars.'
                  : 'Your identity has been verified via Stripe Identity. You can now book vehicles instantly and access premium cars.'
                }
              </p>
              <ul className="text-[10px] text-green-700 dark:text-green-400 space-y-0.5 mb-2">
                <li>✓ Driver's license verified</li>
                <li>✓ {isAdminOverride ? 'Manual verification complete' : 'Face verification complete'}</li>
                <li>✓ Instant booking enabled</li>
                <li>✓ Access to all vehicles</li>
              </ul>
              {!isAdminOverride && (
                <a
                  href="https://itwhip.com/help/identity-verification"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-green-700 dark:text-green-400 hover:underline"
                >
                  Learn more about verification →
                </a>
              )}
            </div>
            <IoCheckmarkCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          </div>
        </div>
      ) : (
        <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-lg">
          <div className="flex items-start gap-3">
            <IoFingerPrintOutline className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                Identity Verification Required
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 mb-3">
                Complete identity verification to unlock instant booking and access premium vehicles. This is a quick, secure process powered by Stripe Identity.
              </p>
              <ul className="text-[10px] text-amber-700 dark:text-amber-400 space-y-0.5 mb-3">
                <li>✓ Takes less than 2 minutes</li>
                <li>✓ Secure ID scan with face verification</li>
                <li>✓ One-time process for all future bookings</li>
              </ul>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleStartVerification}
                  disabled={startingVerification}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
                >
                  {startingVerification ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <IoFingerPrintOutline className="w-4 h-4" />
                      Complete Verification
                      <IoArrowForwardOutline className="w-3 h-3" />
                    </>
                  )}
                </button>
                <a
                  href="https://itwhip.com/help/identity-verification"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-amber-700 dark:text-amber-400 hover:underline"
                >
                  How it works →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phone Verification Section - Show if phone exists but not verified */}
      {profile.phoneNumber && !profile.phoneVerified && !profile.phoneVerificationSkipped && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg">
          <div className="flex items-start gap-3">
            <IoPhonePortraitOutline className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Verify Your Phone Number
              </h3>
              <p className="text-xs text-blue-800 dark:text-blue-300 mb-3">
                Phone verification helps secure your account and enables SMS notifications for bookings. It only takes a minute!
              </p>
              <button
                onClick={() => {
                  window.location.href = `/auth/verify-phone?phone=${encodeURIComponent(profile.phoneNumber || '')}&returnTo=/profile?tab=documents`
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <IoPhonePortraitOutline className="w-4 h-4" />
                Verify Phone Number
                <IoArrowForwardOutline className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phone Verified Status */}
      {profile.phoneVerified && profile.phoneNumber && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg">
          <div className="flex items-center gap-2">
            <IoCheckmarkCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-xs text-green-800 dark:text-green-300">
              Phone number verified: {profile.phoneNumber}
            </p>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-2.5">
          <IoInformationCircleOutline className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
              About Verification
            </h4>
            <ul className="space-y-0.5 text-[10px] text-gray-600 dark:text-gray-400">
              <li>• Your ID is verified securely via Stripe Identity</li>
              <li>• Driver's license and face verification are handled automatically</li>
              <li>• Verification is required once and applies to all future bookings</li>
              <li>• All data is encrypted and stored securely</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
