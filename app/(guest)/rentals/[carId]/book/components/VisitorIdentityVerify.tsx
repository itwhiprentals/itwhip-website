// app/(guest)/rentals/[carId]/book/components/VisitorIdentityVerify.tsx
// AI-powered DL verification for visitors (not logged in)
// Uses Claude Vision for quick verification (~$0.02) instead of Stripe Identity ($1.50)

'use client'

import { useState, useRef } from 'react'
import {
  IoCloudUploadOutline,
  IoCheckmarkCircle,
  IoWarningOutline,
  IoIdCardOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
  IoCloseCircleOutline,
  IoRefreshOutline
} from 'react-icons/io5'

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
  error?: string
}

interface VisitorIdentityVerifyProps {
  onVerificationComplete: (result: VerificationResult) => void
  driverName?: string
  disabled?: boolean
}

export function VisitorIdentityVerify({
  onVerificationComplete,
  driverName,
  disabled = false
}: VisitorIdentityVerifyProps) {
  const [dlFrontUrl, setDlFrontUrl] = useState<string | null>(null)
  const [dlBackUrl, setDlBackUrl] = useState<string | null>(null)
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null)

  const [uploadingFront, setUploadingFront] = useState(false)
  const [uploadingBack, setUploadingBack] = useState(false)
  const [uploadingSelfie, setUploadingSelfie] = useState(false)

  const [verifying, setVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)

  const frontInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)
  const selfieInputRef = useRef<HTMLInputElement>(null)

  // Upload image to Cloudinary
  const uploadImage = async (file: File, type: 'front' | 'back' | 'selfie') => {
    const setUploading = type === 'front' ? setUploadingFront :
                         type === 'back' ? setUploadingBack : setUploadingSelfie

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type === 'selfie' ? 'selfie' : 'license')

      const response = await fetch('/api/upload/document', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()

      if (type === 'front') setDlFrontUrl(data.url)
      else if (type === 'back') setDlBackUrl(data.url)
      else setSelfieUrl(data.url)

      return data.url
    } catch (error) {
      console.error(`[VisitorIdentityVerify] ${type} upload error:`, error)
      return null
    } finally {
      setUploading(false)
    }
  }

  // Verify DL with AI
  const verifyWithAI = async () => {
    if (!dlFrontUrl || !dlBackUrl) return

    setVerifying(true)
    setVerificationResult(null)

    try {
      const response = await fetch('/api/bookings/verify-dl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frontImageUrl: dlFrontUrl,
          backImageUrl: dlBackUrl,
          selfieUrl: selfieUrl || undefined,
          expectedName: driverName || undefined
        })
      })

      const data = await response.json()

      // Map API response fields to component expected format
      // API returns: quickVerifyPassed, validation.allRedFlags
      // Component expects: passed, redFlags
      const result: VerificationResult = {
        success: response.ok && data.success,
        passed: data.quickVerifyPassed || false,
        data: data.data ? {
          name: data.data.fullName || '',
          dob: data.data.dateOfBirth || '',
          licenseNumber: data.data.licenseNumber || '',
          expiration: data.data.expirationDate || '',
          state: data.data.stateOrCountry || '',
          isExpired: data.validation?.isExpired || false
        } : undefined,
        confidence: data.confidence,
        redFlags: data.validation?.allRedFlags || data.validation?.redFlags || [],
        error: data.error
      }

      setVerificationResult(result)
      onVerificationComplete(result)
    } catch (error) {
      const result: VerificationResult = {
        success: false,
        passed: false,
        error: 'Failed to verify driver\'s license'
      }
      setVerificationResult(result)
      onVerificationComplete(result)
    } finally {
      setVerifying(false)
    }
  }

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back' | 'selfie') => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be under 10MB')
      return
    }

    await uploadImage(file, type)
  }

  // Reset verification
  const resetVerification = () => {
    setDlFrontUrl(null)
    setDlBackUrl(null)
    setSelfieUrl(null)
    setVerificationResult(null)
  }

  const bothUploaded = dlFrontUrl && dlBackUrl
  const isVerified = verificationResult?.passed

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-4">
        <IoIdCardOutline className="text-xl text-orange-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Verify Your Identity
        </h3>
        {isVerified && (
          <span className="ml-auto flex items-center gap-1 text-green-600 text-sm">
            <IoCheckmarkCircle className="text-lg" />
            Verified
          </span>
        )}
      </div>

      {/* Already verified */}
      {isVerified ? (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <IoShieldCheckmarkOutline className="text-2xl text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-800 dark:text-green-300">
                Identity Verified
              </p>
              {verificationResult?.data && (
                <div className="mt-2 text-sm text-green-700 dark:text-green-400 space-y-1">
                  <p>Name: {verificationResult.data.name}</p>
                  <p>License: {verificationResult.data.state} - {verificationResult.data.licenseNumber}</p>
                  <p>Expires: {verificationResult.data.expiration}</p>
                </div>
              )}
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                Confidence: {((verificationResult?.confidence || 0) * 100).toFixed(0)}%
              </p>
            </div>
            <button
              onClick={resetVerification}
              className="text-green-600 hover:text-green-700 p-1"
              title="Re-verify"
            >
              <IoRefreshOutline className="text-lg" />
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Upload instructions */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Upload photos of your driver's license for quick AI verification.
          </p>

          {/* Upload grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Front of DL */}
            <div
              onClick={() => !disabled && !uploadingFront && frontInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                dlFrontUrl
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-orange-400'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                ref={frontInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFileSelect(e, 'front')}
                className="hidden"
                disabled={disabled}
              />
              {uploadingFront ? (
                <div className="animate-pulse">
                  <div className="w-8 h-8 mx-auto mb-2 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-gray-500">Uploading...</p>
                </div>
              ) : dlFrontUrl ? (
                <>
                  <IoCheckmarkCircle className="text-3xl text-green-500 mx-auto mb-1" />
                  <p className="text-xs text-green-600 font-medium">Front uploaded</p>
                </>
              ) : (
                <>
                  <IoCloudUploadOutline className="text-3xl text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">DL Front</p>
                </>
              )}
            </div>

            {/* Back of DL */}
            <div
              onClick={() => !disabled && !uploadingBack && backInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                dlBackUrl
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-orange-400'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                ref={backInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFileSelect(e, 'back')}
                className="hidden"
                disabled={disabled}
              />
              {uploadingBack ? (
                <div className="animate-pulse">
                  <div className="w-8 h-8 mx-auto mb-2 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-gray-500">Uploading...</p>
                </div>
              ) : dlBackUrl ? (
                <>
                  <IoCheckmarkCircle className="text-3xl text-green-500 mx-auto mb-1" />
                  <p className="text-xs text-green-600 font-medium">Back uploaded</p>
                </>
              ) : (
                <>
                  <IoCloudUploadOutline className="text-3xl text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">DL Back</p>
                </>
              )}
            </div>
          </div>

          {/* Optional selfie */}
          <div className="mb-4">
            <div
              onClick={() => !disabled && !uploadingSelfie && selfieInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
                selfieUrl
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-orange-400'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                ref={selfieInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={(e) => handleFileSelect(e, 'selfie')}
                className="hidden"
                disabled={disabled}
              />
              <div className="flex items-center justify-center gap-2">
                {uploadingSelfie ? (
                  <>
                    <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-gray-500">Uploading...</span>
                  </>
                ) : selfieUrl ? (
                  <>
                    <IoCheckmarkCircle className="text-xl text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Selfie uploaded</span>
                  </>
                ) : (
                  <>
                    <IoPersonOutline className="text-xl text-gray-400" />
                    <span className="text-xs text-gray-500">Add selfie (optional)</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Verification error */}
          {verificationResult && !verificationResult.passed && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <IoCloseCircleOutline className="text-xl text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    Verification Failed
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {verificationResult.error || 'Could not verify your license. Please try again.'}
                  </p>
                  {verificationResult.redFlags && verificationResult.redFlags.length > 0 && (
                    <ul className="text-xs text-red-600 dark:text-red-400 mt-2 list-disc list-inside">
                      {verificationResult.redFlags.map((flag, i) => (
                        <li key={i}>{flag}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Verify button */}
          <button
            onClick={verifyWithAI}
            disabled={!bothUploaded || verifying || disabled}
            className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
              bothUploaded && !verifying && !disabled
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {verifying ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <IoShieldCheckmarkOutline className="text-xl" />
                <span>{bothUploaded ? 'Verify My License' : 'Upload DL to verify'}</span>
              </>
            )}
          </button>

          {/* Info text */}
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
            AI verification takes just a few seconds. Your data is encrypted and secure.
          </p>
        </>
      )}
    </div>
  )
}

export default VisitorIdentityVerify
