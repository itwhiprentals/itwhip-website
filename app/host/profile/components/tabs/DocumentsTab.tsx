// app/host/profile/components/tabs/DocumentsTab.tsx
// UPDATED: Now shows Stripe verification status instead of manual document upload
'use client'

import { useState, useEffect, useRef } from 'react'
import {
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoBanOutline,
  IoShieldCheckmarkOutline,
  IoArrowForwardOutline,
  IoCloudUploadOutline,
  IoDocumentTextOutline,
  IoEyeOutline,
  IoRefreshOutline,
  IoWalletOutline,
  IoLockClosedOutline
} from 'react-icons/io5'
import Image from 'next/image'

interface HostProfile {
  id: string
  approvalStatus: 'PENDING' | 'NEEDS_ATTENTION' | 'APPROVED' | 'SUSPENDED' | 'REJECTED'
  // Stripe Connect fields
  stripeConnectAccountId?: string | null
  stripeAccountStatus?: string | null
  stripeDetailsSubmitted?: boolean
  stripePayoutsEnabled?: boolean
  stripeChargesEnabled?: boolean
  stripeRequirements?: string[] | null  // Pending requirements from Stripe
  stripeDisabledReason?: string | null  // Why account is disabled
  // Legacy document fields
  documentStatuses?: {
    governmentId?: 'pending' | 'approved' | 'rejected'
    driversLicense?: 'pending' | 'approved' | 'rejected'
    insurance?: 'pending' | 'approved' | 'rejected'
  }
}

// Map Stripe requirement codes to user-friendly messages
function getRequirementMessage(requirement: string): string {
  const messages: Record<string, string> = {
    'individual.id_number': 'Full Social Security Number (SSN)',
    'individual.ssn_last_4': 'Last 4 digits of SSN',
    'individual.verification.document': 'Government-issued ID photo',
    'individual.verification.additional_document': 'Additional ID document',
    'individual.dob.day': 'Date of birth',
    'individual.dob.month': 'Date of birth',
    'individual.dob.year': 'Date of birth',
    'individual.address.line1': 'Street address',
    'individual.address.city': 'City',
    'individual.address.state': 'State',
    'individual.address.postal_code': 'ZIP code',
    'individual.phone': 'Phone number',
    'individual.email': 'Email address',
    'individual.first_name': 'First name',
    'individual.last_name': 'Last name',
    'external_account': 'Bank account information',
    'tos_acceptance.date': 'Terms of Service acceptance',
    'tos_acceptance.ip': 'Terms of Service acceptance',
  }

  // Return mapped message or clean up the requirement code
  return messages[requirement] || requirement.replace(/^individual\./, '').replace(/[._]/g, ' ')
}

interface DocumentsTabProps {
  profile: HostProfile
  isApproved: boolean
  isSuspended: boolean
  onDocumentUpdate: () => void
  managesOwnCars?: boolean
}

export default function DocumentsTab({
  profile,
  isApproved,
  isSuspended,
  onDocumentUpdate,
  managesOwnCars
}: DocumentsTabProps) {
  const [loading, setLoading] = useState(false)
  const [insuranceUrl, setInsuranceUrl] = useState<string | null>(null)
  const [insuranceStatus, setInsuranceStatus] = useState<'NOT_UPLOADED' | 'PENDING' | 'APPROVED' | 'REJECTED'>('NOT_UPLOADED')
  const [uploadingInsurance, setUploadingInsurance] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const insuranceInputRef = useRef<HTMLInputElement | null>(null)

  // Fetch insurance status on mount
  useEffect(() => {
    fetchInsuranceStatus()
  }, [])

  const fetchInsuranceStatus = async () => {
    try {
      const response = await fetch('/api/host/documents/upload', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.documents?.insurance) {
          const ins = data.data.documents.insurance
          setInsuranceUrl(ins.url || null)
          setInsuranceStatus(ins.status === 'UNDER_REVIEW' ? 'PENDING' : ins.status || 'NOT_UPLOADED')
        }
      }
    } catch (error) {
      console.error('Failed to fetch insurance status:', error)
    }
  }

  const handleStartStripeVerification = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/host/banking/connect', {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start verification')
      }

      const data = await response.json()

      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl
      } else if (data.success && !data.onboardingRequired) {
        // Already verified
        onDocumentUpdate()
      }
    } catch (error) {
      console.error('Stripe verification error:', error)
      alert(error instanceof Error ? error.message : 'Failed to start verification')
    } finally {
      setLoading(false)
    }
  }

  const handleInsuranceUpload = async (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload JPG, PNG, or PDF.')
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      alert('File too large. Maximum size is 10MB.')
      return
    }

    setUploadingInsurance(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', 'insurance')

      const response = await fetch('/api/host/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setInsuranceUrl(data.url)
      setInsuranceStatus('PENDING')

      if (onDocumentUpdate) {
        onDocumentUpdate()
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload insurance. Please try again.')
    } finally {
      setUploadingInsurance(false)
    }
  }

  // Determine Stripe verification status
  const hasStripeAccount = !!profile.stripeConnectAccountId
  const stripeVerified = profile.stripeDetailsSubmitted && (profile.stripePayoutsEnabled || profile.stripeChargesEnabled)
  const stripePending = hasStripeAccount && !stripeVerified

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {isSuspended ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start">
            <IoBanOutline className="w-5 h-5 text-red-600 dark:text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800 dark:text-red-300">
              Verification is disabled while your account is suspended.
            </div>
          </div>
        </div>
      ) : stripeVerified ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start">
            <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-200">
                Identity Verified
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Your identity has been verified through Stripe. You're all set to start earning!
              </p>
            </div>
          </div>
        </div>
      ) : stripePending ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start">
            <IoWarningOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                Verification Incomplete
              </p>
              {profile.stripeRequirements && profile.stripeRequirements.length > 0 ? (
                <div className="mt-2">
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
                    To complete verification, please provide:
                  </p>
                  <ul className="text-xs text-yellow-800 dark:text-yellow-200 space-y-1">
                    {/* Dedupe requirements (e.g., multiple dob fields) */}
                    {[...new Set(profile.stripeRequirements.map(r => getRequirementMessage(r)))].map((msg, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full flex-shrink-0" />
                        {msg}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Complete your identity verification to unlock all features.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start">
            <IoShieldCheckmarkOutline className="w-5 h-5 text-blue-600 dark:text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Identity Verification Required
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Complete identity verification to start accepting bookings and receiving payouts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Identity Verification Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <IoShieldCheckmarkOutline className="w-5 h-5 text-purple-600" />
                Identity Verification
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Secure verification powered by Stripe
              </p>
            </div>
            {stripeVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                <IoCheckmarkCircleOutline className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {isSuspended ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <IoLockClosedOutline className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Verification disabled during suspension</p>
            </div>
          ) : stripeVerified ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="p-3 bg-green-100 dark:bg-green-800 rounded-full">
                  <IoCheckmarkCircleOutline className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Identity Verified
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your government ID and personal details have been verified.
                  </p>
                </div>
              </div>

              {/* Verified Items List */}
              <div className="grid gap-3">
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500" />
                  <span>Government-issued ID verified</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500" />
                  <span>Personal information confirmed</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500" />
                  <span>Tax information submitted</span>
                </div>
                {profile.stripePayoutsEnabled && (
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500" />
                    <span>Payouts enabled</span>
                  </div>
                )}
              </div>
            </div>
          ) : stripePending ? (
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-800 rounded-full flex-shrink-0">
                  <IoWarningOutline className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-yellow-900 dark:text-yellow-100">
                    Action Required
                  </p>
                  {profile.stripeRequirements && profile.stripeRequirements.length > 0 ? (
                    <div className="mt-2">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                        Please provide the following to complete verification:
                      </p>
                      <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1.5">
                        {[...new Set(profile.stripeRequirements.map(r => getRequirementMessage(r)))].map((msg, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0" />
                            {msg}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Complete the remaining steps to finish verification.
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleStartStripeVerification}
                disabled={loading}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Opening Stripe...
                  </>
                ) : (
                  <>
                    Continue Verification
                    <IoArrowForwardOutline className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* What Stripe Verifies */}
              <div className="grid gap-3 mb-6">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Stripe will securely verify:
                </p>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <span className="text-xs text-purple-600 dark:text-purple-400">1</span>
                  </div>
                  <span>Government-issued photo ID</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <span className="text-xs text-purple-600 dark:text-purple-400">2</span>
                  </div>
                  <span>Personal & contact information</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <span className="text-xs text-purple-600 dark:text-purple-400">3</span>
                  </div>
                  <span>Tax information (SSN/EIN)</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <span className="text-xs text-purple-600 dark:text-purple-400">4</span>
                  </div>
                  <span>Bank account for payouts</span>
                </div>
              </div>

              <button
                onClick={handleStartStripeVerification}
                disabled={loading}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Opening Stripe...
                  </>
                ) : (
                  <>
                    <IoWalletOutline className="w-5 h-5" />
                    Start Identity Verification
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Powered by Stripe. Your data is encrypted and secure.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Insurance Certificate Section - Hidden for Fleet Managers who don't own cars */}
      {managesOwnCars !== false && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <IoDocumentTextOutline className="w-5 h-5 text-blue-600" />
                  Insurance Certificate
                  <span className="ml-2 text-xs font-normal bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                    Optional
                  </span>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Required for 90% earnings tier
                </p>
              </div>
              {insuranceStatus === 'APPROVED' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                  <IoCheckmarkCircleOutline className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {isSuspended ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <IoLockClosedOutline className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Uploads disabled during suspension</p>
              </div>
            ) : insuranceUrl ? (
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="w-16 h-16 bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center">
                  <IoDocumentTextOutline className="w-8 h-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Insurance Document</p>
                  <p className={`text-sm ${
                    insuranceStatus === 'APPROVED'
                      ? 'text-green-600 dark:text-green-400'
                      : insuranceStatus === 'REJECTED'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {insuranceStatus === 'APPROVED' ? 'Verified' : insuranceStatus === 'REJECTED' ? 'Rejected' : 'Under Review'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewUrl(insuranceUrl)}
                    className="p-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors"
                    title="View document"
                  >
                    <IoEyeOutline className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                  {insuranceStatus !== 'APPROVED' && (
                    <button
                      onClick={() => insuranceInputRef.current?.click()}
                      className="p-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                      title="Replace document"
                    >
                      <IoRefreshOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => insuranceInputRef.current?.click()}
                disabled={uploadingInsurance}
                className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
              >
                <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
                  {uploadingInsurance ? (
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <IoCloudUploadOutline className="w-10 h-10" />
                  )}
                  <div className="text-center">
                    <span className="text-sm font-medium block">
                      {uploadingInsurance ? 'Uploading...' : 'Upload Insurance Certificate'}
                    </span>
                    <span className="text-xs mt-1 block">
                      JPG, PNG, or PDF up to 10MB
                    </span>
                  </div>
                </div>
              </button>
            )}

            <input
              ref={insuranceInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleInsuranceUpload(file)
              }}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-white dark:bg-gray-900 rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-900/50 hover:bg-gray-900/70 text-white rounded-lg transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6">
              {previewUrl.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                <div className="relative w-full h-[70vh]">
                  <Image
                    src={previewUrl}
                    alt="Document preview"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : previewUrl.match(/\.pdf$/i) ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-[70vh] border-0"
                  title="PDF preview"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[70vh] text-gray-500 dark:text-gray-400">
                  <IoDocumentTextOutline className="w-16 h-16 mb-4" />
                  <p>Preview not available</p>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
