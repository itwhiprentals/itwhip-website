// app/partner/requests/[id]/components/OnboardingWizard.tsx
// Step-by-step onboarding wizard for recruited hosts

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IoArrowBackOutline,
  IoArrowForwardOutline,
  IoCheckmarkCircle,
  IoImageOutline,
  IoCashOutline,
  IoWalletOutline,
  IoCloudUploadOutline,
  IoTimeOutline,
  IoCarOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoRefreshOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
  IoStarOutline
} from 'react-icons/io5'

interface OnboardingWizardProps {
  request: {
    id: string
    vehicleInfo: string | null
    guestName: string | null
    guestRating: number | null
    startDate: string | null
    endDate: string | null
    durationDays: number | null
    offeredRate: number | null
    pickupCity: string | null
    pickupState: string | null
  }
  prospect: {
    id: string
    counterOfferAmount: number | null
    counterOfferStatus: string | null
  }
  host: {
    id: string
    name: string
    cars: Array<{
      id: string
      make: string
      model: string
      year: number
      photos: Array<{ url: string }>
    }>
  }
  onboardingProgress: {
    carPhotosUploaded: boolean
    ratesConfigured: boolean
    payoutConnected: boolean
    percentComplete: number
  }
  timeDisplay: string
  isExpiringSoon: boolean
  onComplete: () => void
  onBack: () => void
}

type Step = 'photos' | 'rate' | 'payout' | 'complete'

export default function OnboardingWizard({
  request,
  prospect,
  host,
  onboardingProgress,
  timeDisplay,
  isExpiringSoon,
  onComplete,
  onBack
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('photos')
  const [uploading, setUploading] = useState(false)
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [dailyRate, setDailyRate] = useState<string>(
    (prospect.counterOfferAmount || request.offeredRate || 45).toString()
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Determine initial step based on progress
  useEffect(() => {
    if (onboardingProgress.carPhotosUploaded && onboardingProgress.ratesConfigured && onboardingProgress.payoutConnected) {
      setCurrentStep('complete')
    } else if (onboardingProgress.carPhotosUploaded && onboardingProgress.ratesConfigured) {
      setCurrentStep('payout')
    } else if (onboardingProgress.carPhotosUploaded) {
      setCurrentStep('rate')
    } else {
      setCurrentStep('photos')
    }
  }, [onboardingProgress])

  const steps = [
    { id: 'photos', label: 'Photos', icon: IoImageOutline, completed: onboardingProgress.carPhotosUploaded },
    { id: 'rate', label: 'Rate', icon: IoCashOutline, completed: onboardingProgress.ratesConfigured },
    { id: 'payout', label: 'Payout', icon: IoWalletOutline, completed: onboardingProgress.payoutConnected }
  ] as const

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)
  const canGoNext = currentStep === 'photos' ? (uploadedPhotos.length >= 3 || onboardingProgress.carPhotosUploaded)
    : currentStep === 'rate' ? parseFloat(dailyRate) > 0
    : currentStep === 'payout' ? onboardingProgress.payoutConnected
    : false

  const formatShortDate = (dateStr: string | null) => {
    if (!dateStr) return 'TBD'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    // Simulate upload - in production, this would upload to your storage
    // For now, we'll create preview URLs
    const newPhotos: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        newPhotos.push(url)
      }
    }

    setUploadedPhotos(prev => [...prev, ...newPhotos])
    setUploading(false)

    // TODO: Actually upload files to storage and create vehicle/photos in database
  }

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleNextStep = async () => {
    setSaving(true)
    setError(null)

    try {
      if (currentStep === 'photos') {
        // In production: Save photos to database
        // For now, just advance
        setCurrentStep('rate')
      } else if (currentStep === 'rate') {
        // In production: Save rate to database
        // For now, just advance
        setCurrentStep('payout')
      } else if (currentStep === 'payout') {
        // Payout connection is handled separately
        // If completed, show completion screen
        if (onboardingProgress.payoutConnected) {
          setCurrentStep('complete')
        }
      }
    } catch (err) {
      console.error('Save error:', err)
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handlePrevStep = () => {
    if (currentStep === 'rate') {
      setCurrentStep('photos')
    } else if (currentStep === 'payout') {
      setCurrentStep('rate')
    } else if (currentStep === 'complete') {
      setCurrentStep('payout')
    }
  }

  const handleConnectPayout = () => {
    // TODO: Implement Stripe Connect OAuth flow
    // For now, redirect to partner settings
    window.location.href = '/partner/settings?tab=payout'
  }

  const handleCompleteOnboarding = async () => {
    setSaving(true)
    try {
      // Call complete endpoint
      const response = await fetch('/api/partner/onboarding/complete', {
        method: 'POST'
      })

      if (response.ok) {
        onComplete()
      } else {
        const result = await response.json()
        setError(result.error || 'Failed to complete onboarding')
      }
    } catch (err) {
      console.error('Complete error:', err)
      setError('Failed to complete onboarding')
    } finally {
      setSaving(false)
    }
  }

  // Calculate earnings
  const rate = parseFloat(dailyRate) || request.offeredRate || 45
  const durationDays = request.durationDays || 14
  const totalAmount = rate * durationDays
  const hostEarnings = totalAmount * 0.9

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <IoArrowBackOutline className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            {timeDisplay && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                isExpiringSoon
                  ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                  : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
              }`}>
                <IoTimeOutline className="w-4 h-4" />
                {timeDisplay}
              </div>
            )}
          </div>

          {/* Progress Steps */}
          {currentStep !== 'complete' && (
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const isCurrent = step.id === currentStep
                const isCompleted = step.completed || index < currentStepIndex
                const Icon = step.icon

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? 'bg-green-600 text-white'
                          : isCurrent
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }`}>
                        {isCompleted ? (
                          <IoCheckmarkCircle className="w-6 h-6" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <span className={`text-xs mt-1 ${
                        isCurrent ? 'text-orange-600 font-medium' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 rounded ${
                        index < currentStepIndex ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step: Photos */}
            {currentStep === 'photos' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Upload Car Photos
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Add at least 3 photos of your {request.vehicleInfo || 'vehicle'}. Include exterior, interior, and dashboard shots.
                </p>

                {/* Photo Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {uploadedPhotos.map((url, index) => (
                    <div key={index} className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      >
                        <IoCloseOutline className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {uploadedPhotos.length < 8 && (
                    <label className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handlePhotoUpload(e.target.files)}
                        className="hidden"
                        disabled={uploading}
                      />
                      {uploading ? (
                        <IoRefreshOutline className="w-8 h-8 text-gray-400 animate-spin" />
                      ) : (
                        <>
                          <IoCloudUploadOutline className="w-8 h-8 text-gray-400" />
                          <span className="text-xs text-gray-500 mt-1">Add Photo</span>
                        </>
                      )}
                    </label>
                  )}
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {uploadedPhotos.length}/3 minimum • {uploadedPhotos.length}/8 total
                </p>

                {onboardingProgress.carPhotosUploaded && uploadedPhotos.length === 0 && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <IoCheckmarkCircle className="w-5 h-5" />
                      <span className="font-medium">Photos already uploaded</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step: Rate */}
            {currentStep === 'rate' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Confirm Your Rate
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Review and confirm your daily rate for this booking.
                </p>

                <div className="space-y-6">
                  {/* Rate Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Daily Rate
                    </label>
                    <div className="relative max-w-xs">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl font-medium">$</span>
                      <input
                        type="number"
                        value={dailyRate}
                        onChange={(e) => setDailyRate(e.target.value)}
                        className="w-full pl-10 pr-16 py-4 border border-gray-300 dark:border-gray-600 rounded-lg text-2xl font-bold bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">/day</span>
                    </div>
                    {request.offeredRate && parseFloat(dailyRate) !== request.offeredRate && (
                      <p className="text-xs text-gray-500 mt-2">
                        Original offered rate: ${request.offeredRate}/day
                      </p>
                    )}
                  </div>

                  {/* Earnings Preview */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <h3 className="font-medium text-green-800 dark:text-green-300 mb-3">Earnings Estimate</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">${rate}/day × {durationDays} days</span>
                        <span className="font-medium text-gray-900 dark:text-white">${totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Platform fee (10%)</span>
                        <span className="text-gray-500">-${(totalAmount * 0.1).toFixed(0)}</span>
                      </div>
                      <div className="border-t border-green-200 dark:border-green-700 pt-2 flex justify-between">
                        <span className="font-semibold text-green-700 dark:text-green-300">You'll Receive</span>
                        <span className="font-bold text-green-700 dark:text-green-300 text-lg">${hostEarnings.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step: Payout */}
            {currentStep === 'payout' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Connect Payout Method
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Connect your bank account to receive payments after each booking.
                </p>

                {onboardingProgress.payoutConnected ? (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <IoCheckmarkCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-green-800 dark:text-green-300">Payout Connected</h3>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Your bank account is connected and ready to receive payments.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start gap-3">
                        <IoWalletOutline className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">Secure Stripe Connect</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            We use Stripe to securely process payments. You'll be redirected to complete verification.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleConnectPayout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <IoWalletOutline className="w-5 h-5" />
                      Connect Bank Account
                    </button>

                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Payments are deposited within 2-3 business days after trip completion.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step: Complete */}
            {currentStep === 'complete' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <IoCheckmarkCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  You're All Set!
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Your onboarding is complete. The guest will be notified and can proceed with payment to confirm the booking.
                </p>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800 mb-6 max-w-sm mx-auto">
                  <p className="text-sm text-green-600 dark:text-green-400 mb-1">Expected Earnings</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                    ${hostEarnings.toFixed(0)}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleCompleteOnboarding}
                    disabled={saving}
                    className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <IoRefreshOutline className="w-5 h-5 animate-spin" />
                        Finalizing...
                      </>
                    ) : (
                      <>
                        Go to Dashboard
                        <IoArrowForwardOutline className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep !== 'complete' && (
              <div className="flex gap-3">
                {currentStepIndex > 0 && (
                  <button
                    onClick={handlePrevStep}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                  >
                    <IoArrowBackOutline className="w-4 h-4" />
                    Back
                  </button>
                )}
                <button
                  onClick={handleNextStep}
                  disabled={!canGoNext || saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <IoRefreshOutline className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : currentStep === 'payout' && onboardingProgress.payoutConnected ? (
                    <>
                      Complete Onboarding
                      <IoCheckmarkOutline className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Continue
                      <IoArrowForwardOutline className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Booking Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Booking Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <IoPersonOutline className="w-4 h-4 text-gray-400" />
                  <span>{request.guestName || 'Guest'}</span>
                  {request.guestRating && (
                    <span className="flex items-center gap-1 text-yellow-500">
                      <IoStarOutline className="w-3 h-3 fill-current" />
                      {request.guestRating.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <IoCarOutline className="w-4 h-4 text-gray-400" />
                  <span>{request.vehicleInfo || 'Your Vehicle'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <IoCalendarOutline className="w-4 h-4 text-gray-400" />
                  <span>{formatShortDate(request.startDate)} - {formatShortDate(request.endDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <IoCashOutline className="w-4 h-4 text-gray-400" />
                  <span>${rate}/day • {durationDays} days</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Your Earnings</span>
                  <span className="font-bold text-green-600 dark:text-green-400">${hostEarnings.toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Quick Tips</h3>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                {currentStep === 'photos' && (
                  <>
                    <li>• Clean your car before taking photos</li>
                    <li>• Include exterior shots from all angles</li>
                    <li>• Show interior, trunk, and dashboard</li>
                  </>
                )}
                {currentStep === 'rate' && (
                  <>
                    <li>• Check local market rates for similar cars</li>
                    <li>• Consider your car's condition and features</li>
                    <li>• Longer trips often justify lower daily rates</li>
                  </>
                )}
                {currentStep === 'payout' && (
                  <>
                    <li>• Have your bank details ready</li>
                    <li>• Stripe setup takes only 2-3 minutes</li>
                    <li>• Payments arrive within 2-3 business days</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
