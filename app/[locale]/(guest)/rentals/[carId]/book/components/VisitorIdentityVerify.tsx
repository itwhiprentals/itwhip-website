// app/(guest)/rentals/[carId]/book/components/VisitorIdentityVerify.tsx
// Step-by-step DL verification for visitors (not logged in).
// Opens an in-app camera with DL positioning guide, shows image previews,
// and auto-verifies via Claude AI when both DL sides are captured.
// After 2 failed AI attempts, offers Stripe Identity or manual selfie fallback.

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import {
  IoCheckmarkCircle,
  IoIdCardOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
  IoCloseCircleOutline,
  IoRefreshOutline,
  IoInformationCircleOutline,
  IoCameraOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoLockClosedOutline,
  IoCardOutline,
  IoTimeOutline,
} from 'react-icons/io5'
import { CameraCapture } from './CameraCapture'

// ─── Types ──────────────────────────────────────────────────────────────────

interface VerificationResult {
  success: boolean
  passed: boolean
  data?: {
    name: string
    dob: string
    licenseNumber: string
    expiration: string
    state: string
    isExpired: boolean
  }
  confidence?: number
  redFlags?: string[]
  criticalFlags?: string[]
  informationalFlags?: string[]
  error?: string
  stripeVerified?: boolean
  manualPending?: boolean
  frozen?: boolean
  frozenUntil?: string
}

interface VisitorIdentityVerifyProps {
  onVerificationComplete: (result: VerificationResult) => void
  onPhotosUploaded?: (frontUrl: string, backUrl?: string) => void
  driverName?: string
  driverEmail?: string
  driverPhone?: string
  carId?: string
  disabled?: boolean
  hideStripeFallback?: boolean
}

type VerifyStep =
  | 'front' | 'back' | 'verifying' | 'success' | 'failed'
  | 'fallback-options' | 'stripe-redirect' | 'selfie-verify' | 'manual-pending'
  | 'frozen' | 'already-verified'

const MAX_AI_ATTEMPTS = 2

// ─── Main Component ─────────────────────────────────────────────────────────

export function VisitorIdentityVerify({
  onVerificationComplete,
  onPhotosUploaded,
  driverName,
  driverEmail,
  driverPhone,
  carId,
  disabled = false,
  hideStripeFallback = false,
}: VisitorIdentityVerifyProps) {
  const t = useTranslations('DLVerification')
  // Step flow
  const [step, setStep] = useState<VerifyStep>('front')

  // Cloudinary URLs (for API calls)
  const [dlFrontUrl, setDlFrontUrl] = useState<string | null>(null)
  const [dlBackUrl, setDlBackUrl] = useState<string | null>(null)
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null)

  // Local blob previews (instant display)
  const [frontPreview, setFrontPreview] = useState<string | null>(null)
  const [backPreview, setBackPreview] = useState<string | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)

  // Upload state
  const [uploadingFront, setUploadingFront] = useState(false)
  const [uploadingBack, setUploadingBack] = useState(false)
  const [uploadingSelfie, setUploadingSelfie] = useState(false)

  // Verification state
  const [verifying, setVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)

  // Camera state
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraTarget, setCameraTarget] = useState<'front' | 'back' | 'selfie'>('front')
  const [cameraGuideShape, setCameraGuideShape] = useState<'rectangle' | 'circle'>('rectangle')

  // Selfie accordion
  const [showSelfie, setShowSelfie] = useState(false)

  // Attempt tracking
  const [attemptCount, setAttemptCount] = useState(0)
  const [initialCheckDone, setInitialCheckDone] = useState(false)
  const [frozenUntil, setFrozenUntil] = useState<string | null>(null)

  // Stripe fallback
  const [stripeLoading, setStripeLoading] = useState(false)

  // Manual selfie fallback
  const [manualSelfieUrl, setManualSelfieUrl] = useState<string | null>(null)
  const [submittingManual, setSubmittingManual] = useState(false)

  // Fallback file inputs
  const frontInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)
  const selfieInputRef = useRef<HTMLInputElement>(null)

  // ── Check verification status on mount / email change ──
  const checkVerificationStatus = useCallback(async () => {
    if (!driverEmail) return
    try {
      const res = await fetch(`/api/bookings/verify-dl/check-attempts?email=${encodeURIComponent(driverEmail)}`)
      const data = await res.json()
      if (!data.success) return

      if (data.isAlreadyVerified) {
        setStep('already-verified')
        onVerificationComplete({ success: true, passed: true, stripeVerified: true })
        return
      }

      if (data.isFrozen) {
        setFrozenUntil(data.frozenUntil)
        setStep('frozen')
        onVerificationComplete({ success: false, passed: false, frozen: true, frozenUntil: data.frozenUntil })
        return
      }

      if (data.hasManualPending) {
        setStep('manual-pending')
        onVerificationComplete({ success: false, passed: false, manualPending: true })
        return
      }

      setAttemptCount(data.failedAttempts || 0)
      if (data.failedAttempts >= MAX_AI_ATTEMPTS) {
        setStep('fallback-options')
      }
    } catch (err) {
      console.error('[VisitorIdentityVerify] Check attempts error:', err)
    } finally {
      setInitialCheckDone(true)
    }
  }, [driverEmail]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    checkVerificationStatus()
  }, [checkVerificationStatus])

  // ── Auto-skip Stripe fallback when embedded in onboarding (already Stripe-verified) ──
  useEffect(() => {
    if (step === 'fallback-options' && hideStripeFallback) {
      setStep('selfie-verify')
    }
  }, [step, hideStripeFallback])

  // ── Blob URL cleanup ──
  useEffect(() => {
    return () => {
      if (frontPreview) URL.revokeObjectURL(frontPreview)
      if (backPreview) URL.revokeObjectURL(backPreview)
      if (selfiePreview) URL.revokeObjectURL(selfiePreview)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-verify when both images uploaded ──
  useEffect(() => {
    if (dlFrontUrl && dlBackUrl && !verifying && !verificationResult) {
      verifyWithAI()
    }
  }, [dlFrontUrl, dlBackUrl]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Upload image to Cloudinary ──
  const uploadImage = async (file: File, type: 'front' | 'back' | 'selfie') => {
    const setUploading =
      type === 'front' ? setUploadingFront : type === 'back' ? setUploadingBack : setUploadingSelfie

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type === 'selfie' ? 'selfie' : 'license')

      const response = await fetch('/api/upload/document', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      if (type === 'front') {
        setDlFrontUrl(data.url)
        // Notify parent of front URL immediately
        onPhotosUploaded?.(data.url)
        setStep('back')
      } else if (type === 'back') {
        setDlBackUrl(data.url)
        // Notify parent with both URLs (front was already set)
        if (dlFrontUrl) onPhotosUploaded?.(dlFrontUrl, data.url)
        // Step transitions to 'verifying' via the auto-verify useEffect
      } else {
        setSelfieUrl(data.url)
      }
      return data.url
    } catch (error) {
      console.error(`[VisitorIdentityVerify] ${type} upload error:`, error)
      return null
    } finally {
      setUploading(false)
    }
  }

  // ── Verify with Claude AI ──
  const verifyWithAI = async () => {
    if (!dlFrontUrl || !dlBackUrl) return
    setVerifying(true)
    setStep('verifying')
    setVerificationResult(null)

    try {
      const response = await fetch('/api/bookings/verify-dl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frontImageUrl: dlFrontUrl,
          backImageUrl: dlBackUrl,
          selfieUrl: selfieUrl || undefined,
          expectedName: driverName || undefined,
          guestEmail: driverEmail || undefined,
        }),
      })

      const data = await response.json()

      const result: VerificationResult = {
        success: response.ok && data.success,
        passed: data.quickVerifyPassed || false,
        data: data.data
          ? {
              name: data.data.fullName || '',
              dob: data.data.dateOfBirth || '',
              licenseNumber: data.data.licenseNumber || '',
              expiration: data.data.expirationDate || '',
              state: data.data.stateOrCountry || '',
              isExpired: data.validation?.isExpired || false,
            }
          : undefined,
        confidence: data.confidence,
        redFlags: data.validation?.allRedFlags || data.validation?.redFlags || [],
        criticalFlags: data.validation?.criticalFlags || [],
        informationalFlags: data.validation?.informationalFlags || [],
        error: data.error,
      }

      setVerificationResult(result)

      if (result.passed) {
        setStep('success')
      } else {
        // Increment attempt count
        const newCount = attemptCount + 1
        setAttemptCount(newCount)

        if (newCount >= MAX_AI_ATTEMPTS) {
          // Show fallback options after 2 failures
          setStep('fallback-options')
        } else {
          setStep('failed')
        }
      }

      onVerificationComplete(result)
    } catch {
      const newCount = attemptCount + 1
      setAttemptCount(newCount)

      const result: VerificationResult = {
        success: false,
        passed: false,
        error: "Failed to verify driver's license",
      }
      setVerificationResult(result)

      if (newCount >= MAX_AI_ATTEMPTS) {
        setStep('fallback-options')
      } else {
        setStep('failed')
      }

      onVerificationComplete(result)
    } finally {
      setVerifying(false)
    }
  }

  // ── Handle upload target tap — always open CameraCapture modal ──
  const handleUploadTap = (target: 'front' | 'back' | 'selfie') => {
    if (disabled) return
    setCameraTarget(target)
    setCameraGuideShape(target === 'selfie' ? 'circle' : 'rectangle')
    setCameraOpen(true)
  }

  // ── Camera failed — fall back to native file picker ──
  // Note: CameraCapture handles closing the modal itself
  const handleCameraError = () => {
    const ref = cameraTarget === 'front' ? frontInputRef : cameraTarget === 'back' ? backInputRef : selfieInputRef
    // Small delay so the modal close animation finishes before file picker opens
    setTimeout(() => ref.current?.click(), 100)
  }

  // ── Camera capture handler ──
  const handleCameraCapture = async (file: File) => {
    setCameraOpen(false)
    const preview = URL.createObjectURL(file)
    if (cameraTarget === 'front') {
      if (frontPreview) URL.revokeObjectURL(frontPreview)
      setFrontPreview(preview)
    } else if (cameraTarget === 'back') {
      if (backPreview) URL.revokeObjectURL(backPreview)
      setBackPreview(preview)
    } else {
      if (selfiePreview) URL.revokeObjectURL(selfiePreview)
      setSelfiePreview(preview)
    }
    await uploadImage(file, cameraTarget)
  }

  // ── File input fallback handler ──
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back' | 'selfie') => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    if (file.size > 10 * 1024 * 1024) return

    const preview = URL.createObjectURL(file)
    if (type === 'front') {
      if (frontPreview) URL.revokeObjectURL(frontPreview)
      setFrontPreview(preview)
    } else if (type === 'back') {
      if (backPreview) URL.revokeObjectURL(backPreview)
      setBackPreview(preview)
    } else {
      if (selfiePreview) URL.revokeObjectURL(selfiePreview)
      setSelfiePreview(preview)
    }
    await uploadImage(file, type)
  }

  // ── Reset everything ──
  const resetVerification = () => {
    if (frontPreview) URL.revokeObjectURL(frontPreview)
    if (backPreview) URL.revokeObjectURL(backPreview)
    if (selfiePreview) URL.revokeObjectURL(selfiePreview)
    setDlFrontUrl(null)
    setDlBackUrl(null)
    setSelfieUrl(null)
    setFrontPreview(null)
    setBackPreview(null)
    setSelfiePreview(null)
    setVerificationResult(null)
    setShowSelfie(false)
    setStep('front')
  }

  // ── Retake a specific image ──
  const handleRetake = (target: 'front' | 'back') => {
    if (target === 'front') {
      if (frontPreview) URL.revokeObjectURL(frontPreview)
      setFrontPreview(null)
      setDlFrontUrl(null)
      setStep('front')
    } else {
      if (backPreview) URL.revokeObjectURL(backPreview)
      setBackPreview(null)
      setDlBackUrl(null)
      setStep('back')
    }
    setVerificationResult(null)
  }

  // ── Stripe Identity fallback ──
  const handleStripeVerify = async () => {
    if (!driverEmail) return
    setStripeLoading(true)
    setStep('stripe-redirect')

    try {
      const response = await fetch('/api/identity/verify-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: driverEmail,
          carId: carId || undefined,
          returnUrl: window.location.href.split('?')[0], // Clean URL without params
          source: 'booking-fallback'
        }),
      })

      const data = await response.json()

      if (data.url) {
        // Redirect to Stripe Identity
        window.location.href = data.url
      } else if (data.existingAccount && data.verified) {
        // Already verified
        setStep('already-verified')
        onVerificationComplete({ success: true, passed: true, stripeVerified: true })
      } else {
        setStep('fallback-options')
      }
    } catch (err) {
      console.error('[VisitorIdentityVerify] Stripe redirect error:', err)
      setStep('fallback-options')
    } finally {
      setStripeLoading(false)
    }
  }

  // ── Manual selfie verification ──
  const handleManualSelfieCapture = async (file: File) => {
    setCameraOpen(false)
    const preview = URL.createObjectURL(file)
    if (selfiePreview) URL.revokeObjectURL(selfiePreview)
    setSelfiePreview(preview)

    // Upload to Cloudinary
    setUploadingSelfie(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'selfie')

      const uploadRes = await fetch('/api/upload/document', {
        method: 'POST',
        body: formData,
      })
      if (!uploadRes.ok) throw new Error('Upload failed')

      const uploadData = await uploadRes.json()
      setManualSelfieUrl(uploadData.url)

      // Auto-submit manual verification
      await submitManualVerification(uploadData.url)
    } catch (error) {
      console.error('[VisitorIdentityVerify] Manual selfie upload error:', error)
    } finally {
      setUploadingSelfie(false)
    }
  }

  const submitManualVerification = async (uploadedSelfieUrl: string) => {
    setSubmittingManual(true)
    try {
      const response = await fetch('/api/identity/manual-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: driverEmail,
          name: driverName,
          phone: driverPhone,
          selfieUrl: uploadedSelfieUrl,
          dlFrontUrl: dlFrontUrl || undefined,
          dlBackUrl: dlBackUrl || undefined,
          carId: carId || undefined,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setStep('manual-pending')
        onVerificationComplete({ success: false, passed: false, manualPending: true })
      }
    } catch (error) {
      console.error('[VisitorIdentityVerify] Manual verification submit error:', error)
    } finally {
      setSubmittingManual(false)
    }
  }

  // ── Open selfie camera for manual verification ──
  const openManualSelfieCamera = () => {
    setCameraTarget('selfie')
    setCameraGuideShape('circle')
    setCameraOpen(true)
  }

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────────

  // Show loading while checking initial status
  if (!initialCheckDone && driverEmail) {
    return (
      <div className="py-6 text-center">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('checkingStatus')}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Hidden fallback file inputs */}
      <input ref={frontInputRef} type="file" accept="image/*" capture="environment" onChange={(e) => handleFileSelect(e, 'front')} className="hidden" disabled={disabled} />
      <input ref={backInputRef} type="file" accept="image/*" capture="environment" onChange={(e) => handleFileSelect(e, 'back')} className="hidden" disabled={disabled} />
      <input ref={selfieInputRef} type="file" accept="image/*" capture="user" onChange={(e) => handleFileSelect(e, 'selfie')} className="hidden" disabled={disabled} />

      {/* Camera modal */}
      <CameraCapture
        isOpen={cameraOpen}
        onCapture={step === 'selfie-verify' ? handleManualSelfieCapture : handleCameraCapture}
        onClose={() => setCameraOpen(false)}
        onCameraError={handleCameraError}
        label={
          cameraTarget === 'front'
            ? t('dlFrontLabel')
            : cameraTarget === 'back'
              ? t('dlBackLabel')
              : step === 'selfie-verify'
                ? t('selfieWithLicense')
                : t('takeSelfie')
        }
        facingMode={cameraTarget === 'selfie' ? 'user' : 'environment'}
        guideShape={cameraGuideShape}
      />

      {/* ════════════ STEP: ALREADY VERIFIED ════════════ */}
      {step === 'already-verified' && (
        <AlreadyVerifiedCard />
      )}

      {/* ════════════ STEP: FROZEN ════════════ */}
      {step === 'frozen' && (
        <FrozenCard frozenUntil={frozenUntil} />
      )}

      {/* ════════════ STEP: FRONT ════════════ */}
      {step === 'front' && (
        <>
          <PhotoTips />
          <UploadTarget
            icon={<IoIdCardOutline className="text-4xl text-gray-400" />}
            label={t('dlFrontLabel')}
            sublabel={t('tapToOpenCamera')}
            preview={frontPreview}
            isUploading={uploadingFront}
            disabled={disabled}
            onClick={() => handleUploadTap('front')}
            onRetake={() => handleRetake('front')}
          />
          <StepDots current={1} />
        </>
      )}

      {/* ════════════ STEP: BACK ════════════ */}
      {step === 'back' && (
        <>
          <PhotoTips />
          {/* Completed front thumbnail */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative w-20 h-14 rounded-lg overflow-hidden border-2 border-green-500 flex-shrink-0">
              {frontPreview ? (
                <img src={frontPreview} alt="DL Front" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                  <IoCheckmarkCircle className="text-green-500 text-xl" />
                </div>
              )}
              <div className="absolute top-0.5 right-0.5 bg-green-500 rounded-full p-0.5">
                <IoCheckmarkCircle className="w-3 h-3 text-white" />
              </div>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">{t('frontUploaded')}</p>
          </div>

          <UploadTarget
            icon={<IoIdCardOutline className="text-4xl text-gray-400 rotate-180" />}
            label={t('dlBackLabel')}
            sublabel={t('tapToOpenCamera')}
            preview={backPreview}
            isUploading={uploadingBack}
            disabled={disabled}
            onClick={() => handleUploadTap('back')}
            onRetake={() => handleRetake('back')}
          />
          <StepDots current={2} />
        </>
      )}

      {/* ════════════ STEP: VERIFYING ════════════ */}
      {step === 'verifying' && (
        <div className="py-6">
          {/* Both thumbnails side by side */}
          <div className="flex justify-center gap-3 mb-5">
            <MiniThumb preview={frontPreview} label="Front" />
            <MiniThumb preview={backPreview} label="Back" />
          </div>

          {/* Verification animation */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-3 animate-pulse">
              <IoShieldCheckmarkOutline className="text-3xl text-orange-500" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {t('verifyingLicense')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('takesFewSeconds')}
            </p>
            {/* Indeterminate progress bar */}
            <div className="mt-4 mx-auto max-w-[200px] h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-orange-500 rounded-full animate-indeterminate" />
            </div>
          </div>

          <style jsx>{`
            @keyframes indeterminate {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(400%); }
            }
            .animate-indeterminate {
              animation: indeterminate 1.5s ease-in-out infinite;
            }
          `}</style>
        </div>
      )}

      {/* ════════════ STEP: SUCCESS ════════════ */}
      {step === 'success' && verificationResult && (
        <>
          <SuccessCard result={verificationResult} onReVerify={resetVerification} />

          {/* Optional selfie accordion */}
          <div className="mt-3">
            <button
              onClick={() => setShowSelfie(!showSelfie)}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <IoPersonOutline className="text-lg" />
                {selfiePreview ? t('selfieUploaded') : t('addSelfieOptional')}
                {selfiePreview && <IoCheckmarkCircle className="text-green-500" />}
              </span>
              {showSelfie ? (
                <IoChevronUpOutline className="text-sm" />
              ) : (
                <IoChevronDownOutline className="text-sm" />
              )}
            </button>

            {showSelfie && (
              <div className="mt-2">
                {selfiePreview ? (
                  <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-green-500">
                    <img src={selfiePreview} alt="Selfie" className="w-full h-full object-cover" />
                    <button
                      onClick={() => {
                        if (selfiePreview) URL.revokeObjectURL(selfiePreview)
                        setSelfiePreview(null)
                        setSelfieUrl(null)
                      }}
                      className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] py-1 text-center"
                    >
                      {t('remove')}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleUploadTap('selfie')}
                    disabled={disabled || uploadingSelfie}
                    className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-orange-400 transition-colors disabled:opacity-50"
                  >
                    {uploadingSelfie ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-gray-500">{t('uploading')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <IoCameraOutline className="text-xl text-gray-400" />
                        <span className="text-xs text-gray-500">{t('takeSelfie')}</span>
                      </div>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ════════════ STEP: FAILED (1st attempt) ════════════ */}
      {step === 'failed' && verificationResult && (
        <ErrorCard result={verificationResult} onRetry={resetVerification} />
      )}

      {/* ════════════ STEP: FALLBACK OPTIONS (after 2 fails) ════════════ */}
      {step === 'fallback-options' && (
        <FallbackOptionsCard
          onStripeVerify={handleStripeVerify}
          onSelfieVerify={() => setStep('selfie-verify')}
          lastResult={verificationResult}
        />
      )}

      {/* ════════════ STEP: STRIPE REDIRECT ════════════ */}
      {step === 'stripe-redirect' && (
        <div className="py-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-3">
            <IoCardOutline className="text-3xl text-blue-600" />
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {t('redirectingToStripe')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('redirectedToComplete')}
          </p>
          <div className="mt-4 mx-auto w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ════════════ STEP: SELFIE VERIFY ════════════ */}
      {step === 'selfie-verify' && (
        <SelfieVerifyStep
          selfiePreview={selfiePreview}
          uploadingSelfie={uploadingSelfie}
          submittingManual={submittingManual}
          onOpenCamera={openManualSelfieCamera}
          onBack={() => setStep('fallback-options')}
        />
      )}

      {/* ════════════ STEP: MANUAL PENDING ════════════ */}
      {step === 'manual-pending' && (
        <ManualPendingCard />
      )}

      {/* Info text (shown on upload steps only) */}
      {(step === 'front' || step === 'back') && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
          {t('dataEncryptedSecure')}
        </p>
      )}
    </div>
  )
}

// ─── Inline Helper Components ───────────────────────────────────────────────

function PhotoTips() {
  const t = useTranslations('DLVerification')
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg mb-4">
      <IoInformationCircleOutline className="text-blue-500 flex-shrink-0 text-base" />
      <p className="text-xs text-blue-700 dark:text-blue-400">
        {t('photoTips')}
      </p>
    </div>
  )
}

function UploadTarget({
  icon,
  label,
  sublabel,
  preview,
  isUploading,
  disabled,
  onClick,
  onRetake,
}: {
  icon: React.ReactNode
  label: string
  sublabel: string
  preview: string | null
  isUploading: boolean
  disabled: boolean
  onClick: () => void
  onRetake: () => void
}) {
  const t = useTranslations('DLVerification')
  return (
    <div
      onClick={() => !disabled && !isUploading && !preview && onClick()}
      className={`relative overflow-hidden rounded-lg transition-colors ${
        preview
          ? 'border-2 border-green-500'
          : 'border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-orange-400'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ aspectRatio: '1.586' }}
    >
      {isUploading && !preview ? (
        /* Uploading without preview (fallback path) */
        <div className="flex flex-col items-center justify-center h-full gap-2">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500">{t('uploading')}</p>
        </div>
      ) : preview ? (
        /* Image preview with upload overlay */
        <div className="relative h-full">
          <img src={preview} alt={label} className="w-full h-full object-cover" />
          {isUploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!isUploading && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRetake()
              }}
              className="absolute bottom-2 right-2 flex items-center gap-1 px-3 py-1.5 bg-black/60 backdrop-blur text-white text-xs rounded-lg hover:bg-black/80 transition-colors"
            >
              <IoRefreshOutline className="text-sm" />
              {t('retake')}
            </button>
          )}
        </div>
      ) : (
        /* Empty upload target */
        <div className="flex flex-col items-center justify-center h-full gap-2 px-4">
          {icon}
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
          <div className="flex items-center gap-1.5 text-orange-500">
            <IoCameraOutline className="text-base" />
            <span className="text-xs font-medium">{sublabel}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function StepDots({ current }: { current: 1 | 2 }) {
  return (
    <div className="flex justify-center gap-2 mt-3">
      <div className={`w-2 h-2 rounded-full transition-colors ${current >= 1 ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
      <div className={`w-2 h-2 rounded-full transition-colors ${current >= 2 ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
    </div>
  )
}

function MiniThumb({ preview, label }: { preview: string | null; label: string }) {
  return (
    <div className="w-20 h-14 rounded-lg overflow-hidden border-2 border-green-500 relative flex-shrink-0">
      {preview ? (
        <img src={preview} alt={label} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
          <IoCheckmarkCircle className="text-green-500 text-lg" />
        </div>
      )}
    </div>
  )
}

function SuccessCard({
  result,
  onReVerify,
}: {
  result: VerificationResult
  onReVerify: () => void
}) {
  const t = useTranslations('DLVerification')
  const confidence = result.confidence || 0

  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
          <IoShieldCheckmarkOutline className="text-xl text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-green-800 dark:text-green-200">
            {t('identityVerifiedTitle')}
          </p>
          {result.data && (
            <div className="mt-2 space-y-1.5">
              <InfoRow label={t('nameLabel')} value={result.data.name} />
              <InfoRow label={t('licenseLabel')} value={`${result.data.state} — ${result.data.licenseNumber}`} />
              <InfoRow label={t('expiresLabel')} value={result.data.expiration} />
              {result.data.dob && <InfoRow label={t('dobLabel')} value={result.data.dob} />}
            </div>
          )}

          {/* Confidence bar */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  confidence >= 85 ? 'bg-green-500' : confidence >= 70 ? 'bg-yellow-500' : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min(confidence, 100)}%` }}
              />
            </div>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              {confidence >= 85 ? t('highConfidence') : confidence >= 70 ? t('verified') : t('moderate')}
            </span>
          </div>
        </div>
      </div>

      {/* Re-verify link */}
      <div className="mt-3 text-center">
        <button
          onClick={onReVerify}
          className="text-xs text-green-600 dark:text-green-400 hover:underline inline-flex items-center gap-1"
        >
          <IoRefreshOutline className="text-xs" />
          {t('reVerify')}
        </button>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-green-600 dark:text-green-400 w-14 flex-shrink-0">{label}:</span>
      <span className="text-green-800 dark:text-green-200 font-medium truncate">{value}</span>
    </div>
  )
}

function ErrorCard({
  result,
  onRetry,
}: {
  result: VerificationResult
  onRetry: () => void
}) {
  const t = useTranslations('DLVerification')
  const criticalFlags = result.criticalFlags || []
  const infoFlags = result.informationalFlags || []
  // Fallback: if no separated flags, use redFlags
  const fallbackFlags = criticalFlags.length === 0 && infoFlags.length === 0 ? (result.redFlags || []) : []

  return (
    <div className="space-y-3">
      {/* Error message */}
      {result.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <IoCloseCircleOutline className="text-xl text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              {result.error}
            </p>
          </div>
        </div>
      )}

      {/* Critical flags */}
      {(criticalFlags.length > 0 || fallbackFlags.length > 0) && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-2">{t('issuesFound')}</p>
          <ul className="space-y-1.5">
            {[...criticalFlags, ...fallbackFlags].map((flag, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 mt-1" />
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Informational flags */}
      {infoFlags.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2">{t('notes')}</p>
          <ul className="space-y-1">
            {infoFlags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400">
                <IoInformationCircleOutline className="text-sm flex-shrink-0 mt-0.5" />
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actionable guidance */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        {t('retakeWithBetterLighting')}
      </p>

      {/* Try again button */}
      <button
        onClick={onRetry}
        className="w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white transition-colors"
      >
        <IoRefreshOutline className="text-lg" />
        {t('tryAgain')}
      </button>
    </div>
  )
}

// ─── New Fallback Components ─────────────────────────────────────────────────

function FallbackOptionsCard({
  onStripeVerify,
  onSelfieVerify,
  lastResult,
}: {
  onStripeVerify: () => void
  onSelfieVerify: () => void
  lastResult: VerificationResult | null
}) {
  const t = useTranslations('DLVerification')
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-2">
          <IoShieldCheckmarkOutline className="text-2xl text-amber-600" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {t('verificationOptions')}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t('couldntVerifyAuto')}
        </p>
      </div>

      {/* Last error summary (if any) */}
      {lastResult?.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2.5">
          <p className="text-xs text-red-700 dark:text-red-300 flex items-center gap-1.5">
            <IoCloseCircleOutline className="flex-shrink-0" />
            {lastResult.error}
          </p>
        </div>
      )}

      {/* Option Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Stripe Identity */}
        <button
          onClick={onStripeVerify}
          className="flex flex-col items-center gap-2 p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-600 transition-colors text-center"
        >
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <IoCardOutline className="text-xl text-white" />
          </div>
          <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
            {t('verifyWithStripe')}
          </span>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 leading-tight">
            {t('stripeVerifyDesc')}
          </span>
        </button>

        {/* Manual Selfie */}
        <button
          onClick={onSelfieVerify}
          className="flex flex-col items-center gap-2 p-4 border-2 border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-900/20 hover:border-orange-400 dark:hover:border-orange-600 transition-colors text-center"
        >
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
            <IoCameraOutline className="text-xl text-white" />
          </div>
          <span className="text-sm font-semibold text-orange-800 dark:text-orange-200">
            {t('verifyWithSelfie')}
          </span>
          <span className="text-[11px] text-orange-600 dark:text-orange-400 leading-tight">
            {t('selfieVerifyDesc')}
          </span>
        </button>
      </div>

      <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
        {t('mayRequestAdditional')}
      </p>
    </div>
  )
}

function SelfieVerifyStep({
  selfiePreview,
  uploadingSelfie,
  submittingManual,
  onOpenCamera,
  onBack,
}: {
  selfiePreview: string | null
  uploadingSelfie: boolean
  submittingManual: boolean
  onOpenCamera: () => void
  onBack: () => void
}) {
  const t = useTranslations('DLVerification')
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-2">
          <IoPersonOutline className="text-2xl text-orange-600" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {t('selfieVerification')}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t('selfieInstructions')}
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
        <ul className="space-y-1.5 text-xs text-orange-700 dark:text-orange-300">
          <li className="flex items-start gap-2">
            <span className="font-bold mt-0.5">1.</span>
            {t('selfieStep1')}
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold mt-0.5">2.</span>
            {t('selfieStep2')}
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold mt-0.5">3.</span>
            {t('selfieStep3')}
          </li>
        </ul>
      </div>

      {/* Selfie preview or capture button */}
      {selfiePreview ? (
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-3 border-orange-500">
            <img src={selfiePreview} alt="Selfie with license" className="w-full h-full object-cover" />
          </div>
          {(uploadingSelfie || submittingManual) && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-500">
                {uploadingSelfie ? t('uploading') : t('submittingForReview')}
              </span>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={onOpenCamera}
          className="w-full py-4 rounded-lg font-medium flex flex-col items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white transition-colors"
        >
          <IoCameraOutline className="text-2xl" />
          <span>{t('takeSelfieWithLicense')}</span>
        </button>
      )}

      {/* Back button */}
      <button
        onClick={onBack}
        className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        {t('backToOptions')}
      </button>
    </div>
  )
}

function AlreadyVerifiedCard() {
  const t = useTranslations('DLVerification')
  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-5 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500 mb-3">
        <IoShieldCheckmarkOutline className="text-2xl text-white" />
      </div>
      <h3 className="text-sm font-semibold text-green-800 dark:text-green-200">
        {t('alreadyVerified')}
      </h3>
      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
        {t('alreadyVerifiedDesc')}
      </p>
    </div>
  )
}

function FrozenCard({ frozenUntil }: { frozenUntil: string | null }) {
  const t = useTranslations('DLVerification')
  const frozenDate = frozenUntil ? new Date(frozenUntil) : null
  const formattedDate = frozenDate
    ? frozenDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : '—'

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-5 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500 mb-3">
        <IoLockClosedOutline className="text-2xl text-white" />
      </div>
      <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
        {t('verificationFrozen')}
      </h3>
      <p className="text-xs text-red-600 dark:text-red-400 mt-2">
        {t('frozenDesc')}
      </p>
      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-red-700 dark:text-red-300">
        <IoTimeOutline className="text-sm" />
        <span>{t('tryAgainAfter')} <strong>{formattedDate}</strong></span>
      </div>
      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-3">
        {t('needHelpContact')}
      </p>
    </div>
  )
}

function ManualPendingCard() {
  const t = useTranslations('DLVerification')
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-5 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500 mb-3">
        <IoTimeOutline className="text-2xl text-white" />
      </div>
      <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
        {t('selfieUnderReview')}
      </h3>
      <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
        {t('selfieUnderReviewDesc')}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        {t('confirmAfterApproval')}
      </p>
    </div>
  )
}

export default VisitorIdentityVerify
