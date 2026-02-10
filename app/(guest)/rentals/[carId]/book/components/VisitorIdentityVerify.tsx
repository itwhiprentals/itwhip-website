// app/(guest)/rentals/[carId]/book/components/VisitorIdentityVerify.tsx
// Step-by-step DL verification for visitors (not logged in).
// Opens an in-app camera with DL positioning guide, shows image previews,
// and auto-verifies via Claude AI when both DL sides are captured.

'use client'

import { useState, useRef, useEffect } from 'react'
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
}

interface VisitorIdentityVerifyProps {
  onVerificationComplete: (result: VerificationResult) => void
  onPhotosUploaded?: (frontUrl: string, backUrl?: string) => void
  driverName?: string
  driverEmail?: string
  disabled?: boolean
}

type VerifyStep = 'front' | 'back' | 'verifying' | 'success' | 'failed'

// ─── Main Component ─────────────────────────────────────────────────────────

export function VisitorIdentityVerify({
  onVerificationComplete,
  onPhotosUploaded,
  driverName,
  driverEmail,
  disabled = false,
}: VisitorIdentityVerifyProps) {
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

  // Selfie accordion
  const [showSelfie, setShowSelfie] = useState(false)

  // Fallback file inputs
  const frontInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)
  const selfieInputRef = useRef<HTMLInputElement>(null)

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
      setStep(result.passed ? 'success' : 'failed')
      onVerificationComplete(result)
    } catch {
      const result: VerificationResult = {
        success: false,
        passed: false,
        error: "Failed to verify driver's license",
      }
      setVerificationResult(result)
      setStep('failed')
      onVerificationComplete(result)
    } finally {
      setVerifying(false)
    }
  }

  // ── Handle upload target tap — always open CameraCapture modal ──
  const handleUploadTap = (target: 'front' | 'back' | 'selfie') => {
    if (disabled) return
    setCameraTarget(target)
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

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Hidden fallback file inputs */}
      <input ref={frontInputRef} type="file" accept="image/*" capture="environment" onChange={(e) => handleFileSelect(e, 'front')} className="hidden" disabled={disabled} />
      <input ref={backInputRef} type="file" accept="image/*" capture="environment" onChange={(e) => handleFileSelect(e, 'back')} className="hidden" disabled={disabled} />
      <input ref={selfieInputRef} type="file" accept="image/*" capture="user" onChange={(e) => handleFileSelect(e, 'selfie')} className="hidden" disabled={disabled} />

      {/* Camera modal */}
      <CameraCapture
        isOpen={cameraOpen}
        onCapture={handleCameraCapture}
        onClose={() => setCameraOpen(false)}
        onCameraError={handleCameraError}
        label={
          cameraTarget === 'front'
            ? 'Front of Driver\'s License'
            : cameraTarget === 'back'
              ? 'Back of Driver\'s License'
              : 'Take a Selfie'
        }
        facingMode={cameraTarget === 'selfie' ? 'user' : 'environment'}
      />

      {/* ════════════ STEP: FRONT ════════════ */}
      {step === 'front' && (
        <>
          <PhotoTips />
          <UploadTarget
            icon={<IoIdCardOutline className="text-4xl text-gray-400" />}
            label="Front of Driver's License"
            sublabel="Tap to open camera"
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
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">Front uploaded</p>
          </div>

          <UploadTarget
            icon={<IoIdCardOutline className="text-4xl text-gray-400 rotate-180" />}
            label="Back of Driver's License"
            sublabel="Tap to open camera"
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
              Verifying your license...
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This takes just a few seconds
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
                {selfiePreview ? 'Selfie uploaded' : 'Add selfie (optional)'}
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
                      Remove
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
                        <span className="text-xs text-gray-500">Uploading...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <IoCameraOutline className="text-xl text-gray-400" />
                        <span className="text-xs text-gray-500">Take a selfie</span>
                      </div>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ════════════ STEP: FAILED ════════════ */}
      {step === 'failed' && verificationResult && (
        <ErrorCard result={verificationResult} onRetry={resetVerification} />
      )}

      {/* Info text (shown on upload steps only) */}
      {(step === 'front' || step === 'back') && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
          Your data is encrypted and secure. Verification takes just a few seconds.
        </p>
      )}
    </div>
  )
}

// ─── Inline Helper Components ───────────────────────────────────────────────

function PhotoTips() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg mb-4">
      <IoInformationCircleOutline className="text-blue-500 flex-shrink-0 text-base" />
      <p className="text-xs text-blue-700 dark:text-blue-400">
        Place license on a flat surface. Good lighting, all 4 corners visible.
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
          <p className="text-xs text-gray-500">Uploading...</p>
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
              Retake
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
  const confidence = result.confidence || 0

  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
          <IoShieldCheckmarkOutline className="text-xl text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-green-800 dark:text-green-200">
            Identity Verified
          </p>
          {result.data && (
            <div className="mt-2 space-y-1.5">
              <InfoRow label="Name" value={result.data.name} />
              <InfoRow label="License" value={`${result.data.state} — ${result.data.licenseNumber}`} />
              <InfoRow label="Expires" value={result.data.expiration} />
              {result.data.dob && <InfoRow label="DOB" value={result.data.dob} />}
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
              {confidence >= 85 ? 'High confidence' : confidence >= 70 ? 'Verified' : 'Moderate'}
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
          Re-verify
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
          <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-2">Issues found:</p>
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
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2">Notes:</p>
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
        Please retake your photos with better lighting or ensure your name matches the booking.
      </p>

      {/* Try again button */}
      <button
        onClick={onRetry}
        className="w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white transition-colors"
      >
        <IoRefreshOutline className="text-lg" />
        Try Again
      </button>
    </div>
  )
}

export default VisitorIdentityVerify
