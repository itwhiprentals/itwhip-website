'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  IoShieldCheckmarkOutline,
  IoCheckmarkOutline,
  IoCheckmarkCircle,
  IoDocumentTextOutline,
  IoInformationCircleOutline,
  IoWarningOutline,
  IoEyeOutline,
  IoSparklesOutline
} from 'react-icons/io5'
import { VisitorIdentityVerify } from './VisitorIdentityVerify'

interface IdentityVerificationSectionProps {
  sessionStatus: string
  userProfile: {
    documentsVerified?: boolean
    stripeIdentityStatus?: string
    documentVerifiedAt?: string
    insuranceVerified?: boolean
    insuranceCardUrl?: string
  } | null
  existingAccountInfo: {
    exists: boolean
    verified?: boolean
    type?: string
    email: string
  } | null
  aiVerificationResult: {
    passed: boolean
    data?: any
    manualPending?: boolean
  } | null
  driverInfoComplete: boolean
  emailValidation: {
    isValid: boolean
    error: string | null
    suggestion: string | null
  }
  driverEmail: string
  driverFirstName: string
  driverLastName: string
  driverPhone: string
  identityError: string | null
  isVerifyingIdentity: boolean
  insuranceUploaded: boolean
  insurancePhotoUrl: string
  isUploading: boolean
  carId: string
  documentsRef: React.RefObject<HTMLDivElement | null>
  onAcceptEmailSuggestion: () => void
  onAiVerificationComplete: (result: any) => void
  onPhotosUploaded: (frontUrl: string, backUrl?: string) => void
  onSetIsVerifyingIdentity: (val: boolean) => void
  onSetIdentityError: (val: string | null) => void
  onFileUpload: (file: File, type: string) => void
}

export function IdentityVerificationSection({
  sessionStatus,
  userProfile,
  existingAccountInfo,
  aiVerificationResult,
  driverInfoComplete,
  emailValidation,
  driverEmail,
  driverFirstName,
  driverLastName,
  driverPhone,
  identityError,
  isVerifyingIdentity,
  insuranceUploaded,
  insurancePhotoUrl,
  isUploading,
  carId,
  documentsRef,
  onAcceptEmailSuggestion,
  onAiVerificationComplete,
  onPhotosUploaded,
  onSetIsVerifyingIdentity,
  onSetIdentityError,
  onFileUpload
}: IdentityVerificationSectionProps) {
  const t = useTranslations('BookingPage')
  const router = useRouter()
  const insuranceInputRef = useRef<HTMLInputElement>(null)

  return (
    <div ref={documentsRef} className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-4 shadow-sm border border-gray-300 dark:border-gray-600">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <IoShieldCheckmarkOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        {t('verifyYourIdentity')}
        {(userProfile?.documentsVerified || userProfile?.stripeIdentityStatus === 'verified' || aiVerificationResult?.passed) ? (
          <span className="ml-2 text-sm text-green-600 dark:text-green-400 font-normal">
            ✓ {t('verified')}
          </span>
        ) : aiVerificationResult?.manualPending ? (
          <span className="ml-2 text-sm text-amber-600 dark:text-amber-400 font-normal">
            {t('underReview')}
          </span>
        ) : null}
      </h2>

      {/* NOT LOGGED IN - VERIFY FIRST, ACCOUNT LATER */}
      {sessionStatus === 'unauthenticated' ? (
        <div className="space-y-4">
          {/* Email already exists notification */}
          {existingAccountInfo?.exists && existingAccountInfo.verified && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-green-900 dark:text-green-100 mb-1">
                    {t('alreadyVerifiedExclaim')}
                  </p>
                  <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                    {t('emailAlreadyVerified')}
                  </p>
                  <button
                    onClick={() => router.push(`/auth/login?email=${encodeURIComponent(existingAccountInfo.email)}&returnTo=${encodeURIComponent(window.location.pathname)}`)}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {t('signInToContinue')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Host account exists notification */}
          {existingAccountInfo?.exists && existingAccountInfo.type === 'host' && !existingAccountInfo.verified && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <IoWarningOutline className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-orange-900 dark:text-orange-100 mb-1">
                    {t('hostAccountFound')}
                  </p>
                  <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                    {t('hostAccountExistsMsg')}
                  </p>
                  <button
                    onClick={() => router.push(`/auth/login?email=${encodeURIComponent(existingAccountInfo.email)}&returnTo=${encodeURIComponent(window.location.pathname)}`)}
                    className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    {t('signInAsHost')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main verification card - Phase 14: AI-powered DL verification */}
          {!existingAccountInfo?.exists && (
            <>
              {/* Show message if driver info not complete */}
              {!driverInfoComplete ? (
                <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <IoInformationCircleOutline className="w-6 h-6 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('completeDriverInfoToVerify')}
                  </p>
                </div>
              ) : (
                <>
                  {/* Using email from Primary Driver Info */}
                  <div className={`mb-4 p-3 rounded-lg ${
                    emailValidation.isValid
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : emailValidation.suggestion || emailValidation.error
                        ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                        : 'bg-gray-50 dark:bg-gray-700/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('verifyingAs')} <span className={`font-medium ${
                          emailValidation.isValid
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-gray-900 dark:text-white'
                        }`}>{driverEmail}</span>
                      </p>
                      {emailValidation.isValid && (
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500" />
                      )}
                      {emailValidation.suggestion && (
                        <IoWarningOutline className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    {emailValidation.suggestion && (
                      <div className="mt-2 flex items-center gap-2">
                        <p className="text-xs text-orange-600 dark:text-orange-400">
                          {emailValidation.suggestion}
                        </p>
                        <button
                          type="button"
                          onClick={onAcceptEmailSuggestion}
                          className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-500 underline font-medium"
                        >
                          {t('fixIt')}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Phase 14: AI-powered DL verification (~$0.02 instead of $1.50 Stripe) */}
                  <VisitorIdentityVerify
                    onVerificationComplete={onAiVerificationComplete}
                    onPhotosUploaded={onPhotosUploaded}
                    driverName={`${driverFirstName} ${driverLastName}`.trim()}
                    driverEmail={driverEmail}
                    driverPhone={driverPhone}
                    carId={carId}
                    disabled={!emailValidation.isValid}
                  />
                </>
              )}

              {/* Already have account link */}
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
                {t('alreadyVerified')}{' '}
                <button
                  onClick={() => router.push(`/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`)}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t('signIn')}
                </button>
              </p>
            </>
          )}
        </div>
      ) : /* VERIFIED USER - SKIP DOCUMENTS */
      userProfile?.documentsVerified ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <IoCheckmarkCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-100 mb-1">
                {t('identityVerified')}
              </p>
              <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                {t('yourIdentityWasVerified', { date: new Date(userProfile.documentVerifiedAt || '').toLocaleDateString() })}
              </p>
              <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                <li className="flex items-center gap-1">
                  <IoCheckmarkOutline className="w-3.5 h-3.5" />
                  {t('driversLicenseVerified')}
                </li>
                <li className="flex items-center gap-1">
                  <IoCheckmarkOutline className="w-3.5 h-3.5" />
                  {t('identityPhotoVerified')}
                </li>
                {userProfile.insuranceVerified && (
                  <li className="flex items-center gap-1">
                    <IoCheckmarkOutline className="w-3.5 h-3.5" />
                    {t('insuranceCardVerified')}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* NON-VERIFIED USER - SHOW STRIPE IDENTITY + INSURANCE UPLOAD */
        <>
          {/* ========== STRIPE IDENTITY VERIFICATION ========== */}
          {(() => {
            const stripeStatus = userProfile?.stripeIdentityStatus
            const isStripeVerified = stripeStatus === 'verified'
            const isStripePending = stripeStatus === 'pending' || stripeStatus === 'requires_input'

            const handleVerifyWithStripe = async () => {
              onSetIsVerifyingIdentity(true)
              onSetIdentityError(null)

              try {
                const response = await fetch('/api/identity/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    returnUrl: `${window.location.origin}/rentals/${carId}/book?verified=true`
                  })
                })

                const data = await response.json()

                if (!response.ok) {
                  throw new Error(data.error || 'Failed to start verification')
                }

                if (data.url) {
                  window.location.href = data.url
                }
              } catch (err) {
                onSetIdentityError(err instanceof Error ? err.message : 'Failed to start verification')
                onSetIsVerifyingIdentity(false)
              }
            }

            return (
              <div className={`p-4 mb-4 border-2 rounded-lg transition-all ${
                isStripeVerified
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                  : isStripePending
                    ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/10'
                    : 'border-gray-200 dark:border-gray-600'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isStripeVerified
                        ? 'bg-green-500'
                        : isStripePending
                          ? 'bg-orange-500'
                          : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {isStripeVerified ? (
                        <IoCheckmarkOutline className="w-5 h-5 text-white" />
                      ) : isStripePending ? (
                        <IoWarningOutline className="w-5 h-5 text-white" />
                      ) : (
                        <IoShieldCheckmarkOutline className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {t('identityVerification')}
                      </p>
                      {isStripeVerified ? (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                          {t('verifiedViaStripeIdentity')}
                        </p>
                      ) : isStripePending ? (
                        <>
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                            {t('verificationIncompletePrompt')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {t('verificationIncompleteMessage')}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            {t('requiredVerifyLicenseAndIdentity')}
                          </p>
                          <ul className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                            <li className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-500 flex items-center justify-center text-[8px]">1</span>
                              {t('photoOfDriversLicense')}
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-500 flex items-center justify-center text-[8px]">2</span>
                              {t('selfieToMatch')}
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-500 flex items-center justify-center text-[8px]">3</span>
                              {t('instantVerificationViaStripe')}
                            </li>
                          </ul>
                        </>
                      )}

                      {identityError && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                          {identityError}
                        </p>
                      )}
                    </div>
                  </div>

                  {!isStripeVerified && (
                    <button
                      onClick={handleVerifyWithStripe}
                      disabled={isVerifyingIdentity}
                      className={`px-4 py-2 text-white text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 flex-shrink-0 ${
                        isStripePending
                          ? 'bg-orange-600 hover:bg-orange-700'
                          : 'bg-black hover:bg-gray-800'
                      }`}
                    >
                      {isVerifyingIdentity ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <IoShieldCheckmarkOutline className="w-4 h-4" />
                          <span>{isStripePending ? t('continue') : t('verifyNow')}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )
          })()}

          {/* ========== INSURANCE CARD (OPTIONAL) ========== */}
          <div className={`p-4 border-2 rounded-lg transition-all ${
            insuranceUploaded ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  insuranceUploaded ? 'bg-green-500' : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {insuranceUploaded ? (
                    <IoCheckmarkOutline className="w-5 h-5 text-white" />
                  ) : (
                    <IoDocumentTextOutline className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {t('insuranceCard')}
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">{t('optional')}</span>
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {insurancePhotoUrl ? t('uploadedSuccessfully') : t('uploadFor50PercentDiscount')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {insurancePhotoUrl && (
                  <a
                    href={insurancePhotoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <IoEyeOutline className="w-4 h-4" />
                    {t('view')}
                  </a>
                )}

                <input
                  ref={insuranceInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) onFileUpload(file, 'insurance')
                  }}
                  className="hidden"
                />

                <button
                  onClick={() => insuranceInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {insuranceUploaded ? t('replace') : t('upload')}
                </button>
              </div>
            </div>

            {/* Deposit discount callout */}
            {!insuranceUploaded && (
              <div className="mt-3 flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded text-xs">
                <IoSparklesOutline className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-blue-700 dark:text-blue-300">
                  {t('uploadYourInsuranceCard')}
                </span>
              </div>
            )}
          </div>

          {/* Success message when identity verified */}
          {userProfile?.stripeIdentityStatus === 'verified' && (
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <p className="text-xs font-medium text-green-700 dark:text-green-300 text-center flex items-center justify-center gap-1">
                <IoCheckmarkCircle className="w-4 h-4" />
                {t('identityVerifiedProceedToPayment')}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
