// app/(guest)/profile/components/tabs/DocumentsTab.tsx
// ✅ SIMPLIFIED: Stripe Identity handles all ID verification

'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('DocumentsTab')
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
      alert(error instanceof Error ? error.message : t('failedToStartVerification'))
      setStartingVerification(false)
    }
  }

  const isIdentityVerified = identityStatus?.isVerified || false
  const isAdminOverride = identityStatus?.isAdminOverride || false

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('identityVerification')}</h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
          {t('verifyOnceInstantBook')}
        </p>
      </div>

      {/* Stripe Identity Verification Status */}
      {identityLoading ? (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-600 border-t-transparent" />
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('checkingStatus')}</p>
          </div>
        </div>
      ) : isIdentityVerified ? (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg">
          <div className="flex items-start gap-3">
            <IoShieldCheckmarkOutline className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                {t('identityVerified')}
              </h3>
              <p className="text-xs text-green-800 dark:text-green-300 mb-2">
                {isAdminOverride
                  ? t('adminVerified')
                  : t('stripeVerified')
                }
              </p>
              <ul className="text-[10px] text-green-700 dark:text-green-400 space-y-0.5 mb-2">
                <li>✓ {t('driversLicenseVerified')}</li>
                <li>✓ {isAdminOverride ? t('manualVerificationComplete') : t('faceVerificationComplete')}</li>
                <li>✓ {t('instantBookEnabled')}</li>
                <li>✓ {t('accessAllVehicles')}</li>
              </ul>
              {!isAdminOverride && (
                <a
                  href="https://itwhip.com/help/identity-verification"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-green-700 dark:text-green-400 hover:underline"
                >
                  {t('learnMore')}
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
                {t('identityRequired')}
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 mb-3">
                {t('completeVerificationDesc')}
              </p>
              <ul className="text-[10px] text-amber-700 dark:text-amber-400 space-y-0.5 mb-3">
                <li>✓ {t('takesLessThan2Min')}</li>
                <li>✓ {t('secureIdScan')}</li>
                <li>✓ {t('oneTimeProcess')}</li>
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
                      {t('starting')}
                    </>
                  ) : (
                    <>
                      <IoFingerPrintOutline className="w-4 h-4" />
                      {t('completeVerification')}
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
                  {t('howItWorks')}
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
                {t('verifyPhoneNumber')}
              </h3>
              <p className="text-xs text-blue-800 dark:text-blue-300 mb-3">
                {t('phoneVerificationDesc')}
              </p>
              <button
                onClick={() => {
                  window.location.href = `/auth/verify-phone?phone=${encodeURIComponent(profile.phoneNumber || '')}&returnTo=/profile?tab=documents`
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <IoPhonePortraitOutline className="w-4 h-4" />
                {t('verifyPhoneBtn')}
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
              {t('phoneVerified', { phone: profile.phoneNumber })}
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
              {t('aboutVerification')}
            </h4>
            <ul className="space-y-0.5 text-[10px] text-gray-600 dark:text-gray-400">
              <li>• {t('aboutItem1')}</li>
              <li>• {t('aboutItem2')}</li>
              <li>• {t('aboutItem3')}</li>
              <li>• {t('aboutItem4')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
