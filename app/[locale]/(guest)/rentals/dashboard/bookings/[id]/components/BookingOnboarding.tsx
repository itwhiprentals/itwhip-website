// app/(guest)/rentals/dashboard/bookings/[id]/components/BookingOnboarding.tsx
// Post-booking onboarding section
// - Grayed out when PENDING (awaiting approval)
// - Active when CONFIRMED
// - For visitors (not Stripe verified): "Start Now" in header triggers Stripe Identity
// - For account holders (Stripe verified): DL front/back + insurance upload

'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Booking } from '../types'
import {
  IoShieldCheckmarkOutline,
  IoDocumentOutline,
  IoCheckmarkCircle,
  IoCloudUploadOutline,
  IoLockClosedOutline,
  IoArrowForwardOutline
} from 'react-icons/io5'

interface BookingOnboardingProps {
  booking: Booking
  onDocumentUploaded: () => void
}

export function BookingOnboarding({ booking, onDocumentUploaded }: BookingOnboardingProps) {
  const t = useTranslations('BookingDetail')
  const [isVerifying, setIsVerifying] = useState(false)
  const [uploadingType, setUploadingType] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingUploadType = useRef<string | null>(null)

  const isPending = booking.status === 'PENDING'
  const isConfirmed = booking.status === 'CONFIRMED'
  const onboardingDone = !!booking.onboardingCompletedAt

  if (booking.status === 'ACTIVE' || booking.status === 'COMPLETED' || onboardingDone) return null

  const needsStripeVerification = !booking.guestStripeVerified
  const hasLicenseFront = !!booking.licensePhotoUrl
  const hasLicenseBack = !!booking.licenseBackPhotoUrl
  const hasInsurance = !!booking.insurancePhotoUrl || !!booking.guestInsuranceOnFile
  const allDocsUploaded = hasLicenseFront && hasLicenseBack && hasInsurance

  // Handle Stripe Identity verification
  const handleStripeVerify = async () => {
    setIsVerifying(true)
    setError(null)
    try {
      const response = await fetch('/api/identity/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/rentals/dashboard/bookings/${booking.id}?verified=true`
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to start verification')
      if (data.url) window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start verification')
      setIsVerifying(false)
    }
  }

  // Handle document upload
  const triggerUpload = (type: string) => {
    pendingUploadType.current = type
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    const docType = pendingUploadType.current
    if (!file || !docType) return

    setUploadingType(docType)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', docType)

      const response = await fetch(`/api/rentals/bookings/${booking.id}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload')
      }

      onDocumentUploaded()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadingType(null)
      pendingUploadType.current = null
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Mark onboarding complete
  const handleCompleteOnboarding = async () => {
    try {
      const response = await fetch(`/api/rentals/bookings/${booking.id}/onboarding`, {
        method: 'POST',
        credentials: 'include'
      })
      if (response.ok) onDocumentUploaded()
      else {
        const data = await response.json()
        setError(data.error || 'Failed to complete onboarding')
      }
    } catch {
      setError('Failed to complete onboarding')
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all ${isPending ? 'opacity-60' : ''}`}>
      {/* Header with Start Now button for visitors */}
      <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
              <IoShieldCheckmarkOutline className="w-5 h-5 text-orange-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                {t('onboardTitle')}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {isPending
                  ? t('onboardAvailableAfterApproval')
                  : isConfirmed && !needsStripeVerification
                    ? t('onboardUploadDocs')
                    : t('onboardCompleteToFinalize')}
              </p>
            </div>
          </div>

          {/* Start Now button (visitors only) — in the header */}
          {needsStripeVerification ? (
            <button
              onClick={handleStripeVerify}
              disabled={isPending || isVerifying}
              className="ml-3 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex-shrink-0 flex items-center gap-1.5"
            >
              {isVerifying ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('startNow')}</span>
                  <IoArrowForwardOutline className="w-4 h-4" />
                </>
              )}
            </button>
          ) : isPending ? (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 ml-3 flex-shrink-0">
              <IoLockClosedOutline className="w-4 h-4" />
              <span className="hidden sm:inline">{t('locked')}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Content — only for account holders (DL + insurance upload) or insurance reminder */}
      {needsStripeVerification ? (
        // Visitor flow: insurance reminder only when confirmed
        isConfirmed && !hasInsurance ? (
          <div className="px-4 sm:px-6 py-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                <span className="font-medium">{t('saveOnDeposit')}</span> {t('addInsuranceForDiscount')}
              </p>
            </div>
          </div>
        ) : null
      ) : (
        // Account holder flow: DL front + back + insurance
        <div className={`px-4 sm:px-6 py-4 space-y-2 ${isPending ? 'pointer-events-none' : ''}`}>
          <OnboardingItem
            label={t('driversLicenseFront')}
            completed={hasLicenseFront}
            uploading={uploadingType === 'license-front'}
            disabled={isPending}
            onUpload={() => triggerUpload('license-front')}
            uploadLabel={t('upload')}
          />
          <OnboardingItem
            label={t('driversLicenseBack')}
            completed={hasLicenseBack}
            uploading={uploadingType === 'license-back'}
            disabled={isPending}
            onUpload={() => triggerUpload('license-back')}
            uploadLabel={t('upload')}
          />
          <OnboardingItem
            label={t('insuranceProof')}
            completed={hasInsurance}
            uploading={uploadingType === 'insurance'}
            disabled={isPending}
            onUpload={() => triggerUpload('insurance')}
            subtitle={booking.guestInsuranceOnFile ? t('usingProfileInsurance') : undefined}
            uploadLabel={t('upload')}
          />

          {!hasInsurance && !booking.guestInsuranceOnFile && (
            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                <span className="font-medium">{t('saveOnDeposit')}</span> {t('uploadInsuranceForDiscount')}
              </p>
            </div>
          )}

          {allDocsUploaded && !onboardingDone && (
            <button
              onClick={handleCompleteOnboarding}
              className="w-full mt-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <IoCheckmarkCircle className="w-4 h-4" />
              {t('completeOnboarding')}
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="px-4 sm:px-6 pb-3">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

// Individual onboarding checklist item
function OnboardingItem({
  label,
  completed,
  uploading,
  disabled,
  onUpload,
  subtitle,
  uploadLabel = 'Upload'
}: {
  label: string
  completed: boolean
  uploading: boolean
  disabled: boolean
  onUpload: () => void
  subtitle?: string
  uploadLabel?: string
}) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
      completed
        ? 'bg-green-50 border-green-200'
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center gap-3">
        {completed ? (
          <IoCheckmarkCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
        ) : (
          <IoDocumentOutline className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
        <div>
          <p className={`text-sm font-medium ${completed ? 'text-green-900' : 'text-gray-900'}`}>
            {label}
          </p>
          {subtitle && (
            <p className="text-xs text-green-600 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {!completed && (
        <button
          onClick={onUpload}
          disabled={disabled || uploading}
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          {uploading ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <IoCloudUploadOutline className="w-3.5 h-3.5" />
              {uploadLabel}
            </>
          )}
        </button>
      )}
    </div>
  )
}
