// app/partner/requests/[id]/components/RecruitmentBottomSheet.tsx
// Main orchestrator for the recruited host onboarding bottomsheet flow
// Steps: Secure Account → Agreement → Payment Preference → Add Car → Congrats

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import BottomSheet from '@/app/components/BottomSheet'
import SecureAccountStep from './SecureAccountStep'
import AgreementPreferenceStep from './AgreementPreferenceStep'
import PaymentPreferenceStep from './PaymentPreferenceStep'
import AddCarWizard from '@/app/partner/fleet/add/AddCarWizard'
import {
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoWalletOutline,
  IoCarOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5'

type OnboardingStep = 'SECURE_ACCOUNT' | 'AGREEMENT' | 'PAYMENT_PREFERENCE' | 'ADD_CAR' | 'CONGRATS'

interface MissingFields {
  needsPhone: boolean
  needsEmail: boolean
  needsPassword: boolean
  needsEmailVerification: boolean
  needsPhoneVerification: boolean
}

interface RecruitmentBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  hostData: {
    id: string
    name: string
    email: string
    hasPassword: boolean
    phone?: string
  }
  prospectData: {
    id: string
    status: string
  }
  requestData: {
    id: string
    guestName: string | null
    offeredRate: number | null
    startDate: string | null
    endDate: string | null
    durationDays: number | null
    pickupCity: string | null
    pickupState: string | null
    totalAmount: number | null
    hostEarnings: number | null
  }
  existingAgreement?: {
    url?: string
    fileName?: string
    validationScore?: number
    validationSummary?: string
  }
  onboardingProgress?: {
    agreementPreference?: string | null
    paymentPreference?: string | null
  }
}

const STEPS: OnboardingStep[] = ['SECURE_ACCOUNT', 'AGREEMENT', 'PAYMENT_PREFERENCE', 'ADD_CAR', 'CONGRATS']

const STEP_ICONS = {
  SECURE_ACCOUNT: IoShieldCheckmarkOutline,
  AGREEMENT: IoDocumentTextOutline,
  PAYMENT_PREFERENCE: IoWalletOutline,
  ADD_CAR: IoCarOutline,
  CONGRATS: IoCheckmarkCircleOutline
}

export default function RecruitmentBottomSheet({
  isOpen,
  onClose,
  onComplete,
  hostData,
  prospectData,
  requestData,
  existingAgreement,
  onboardingProgress
}: RecruitmentBottomSheetProps) {
  const t = useTranslations('PartnerRequestDetail')

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('SECURE_ACCOUNT')
  const [completedSteps, setCompletedSteps] = useState<Set<OnboardingStep>>(new Set())
  const [finalizing, setFinalizing] = useState(false)
  const [finalizeError, setFinalizeError] = useState('')
  const [bookingCode, setBookingCode] = useState('')
  const [missingFields, setMissingFields] = useState<MissingFields>({
    needsPhone: false,
    needsEmail: false,
    needsPassword: !hostData.hasPassword,
    needsEmailVerification: false,
    needsPhoneVerification: true
  })

  // Detect missing fields on mount
  useEffect(() => {
    detectMissingFields()
  }, [hostData])

  const detectMissingFields = useCallback(async () => {
    try {
      const response = await fetch('/api/partner/onboarding')
      const data = await response.json()

      if (data.success) {
        const host = data.host
        setMissingFields({
          needsPhone: !host.phone,
          needsEmail: !host.email,
          needsPassword: !host.hasPassword,
          needsEmailVerification: host.email && !host.emailVerified,
          needsPhoneVerification: !host.phoneVerified
        })

        // Determine which steps are already done and find first incomplete
        const completed = new Set<OnboardingStep>()
        let firstIncomplete: OnboardingStep = 'SECURE_ACCOUNT'

        // Check Secure Account (requires password + phone verified + email)
        if (host.hasPassword && host.phone && host.email && host.phoneVerified) {
          completed.add('SECURE_ACCOUNT')
        }

        // Check Agreement
        const progress = data.onboardingProgress
        if (progress?.agreementPreference) {
          completed.add('AGREEMENT')
        }

        // Check Payment Preference
        if (progress?.paymentPreference) {
          completed.add('PAYMENT_PREFERENCE')
        }

        // Check Add Car
        if (progress?.carPhotosUploaded) {
          completed.add('ADD_CAR')
        }

        // Find first incomplete step
        for (const step of STEPS) {
          if (step === 'CONGRATS') break
          if (!completed.has(step)) {
            firstIncomplete = step
            break
          }
        }

        setCompletedSteps(completed)
        if (completed.size > 0) {
          setCurrentStep(firstIncomplete)
        }
      }
    } catch (error) {
      console.error('Failed to detect missing fields:', error)
    }
  }, [])

  const handleFinalize = useCallback(async () => {
    setFinalizing(true)
    setFinalizeError('')
    try {
      const response = await fetch('/api/partner/onboarding/finalize', {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success) {
        setBookingCode(data.booking?.bookingCode || '')
        setCompletedSteps(prev => new Set([...prev, 'ADD_CAR']))
        setCurrentStep('CONGRATS')
      } else {
        setFinalizeError(data.error || t('bsFailedToFinalize'))
      }
    } catch {
      setFinalizeError(t('bsFailedToFinalize'))
    } finally {
      setFinalizing(false)
    }
  }, [t])

  const handleStepComplete = useCallback((step: OnboardingStep) => {
    // When ADD_CAR completes, trigger finalization instead of just advancing
    if (step === 'ADD_CAR') {
      handleFinalize()
      return
    }

    setCompletedSteps(prev => new Set([...prev, step]))

    // Advance to next step
    const currentIndex = STEPS.indexOf(step)
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1])
    }
  }, [handleFinalize])

  const handleSecureAccountComplete = useCallback(() => {
    handleStepComplete('SECURE_ACCOUNT')
  }, [handleStepComplete])

  const currentStepIndex = STEPS.indexOf(currentStep)
  const stepLabels = {
    SECURE_ACCOUNT: t('bsStepSecureAccount'),
    AGREEMENT: t('bsStepAgreement'),
    PAYMENT_PREFERENCE: t('bsStepPayment'),
    ADD_CAR: t('bsStepAddCar'),
    CONGRATS: t('bsStepDone')
  }

  const getSubtitle = () => {
    return t('bsStepOf', { current: currentStepIndex + 1, total: STEPS.length })
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={stepLabels[currentStep]}
      subtitle={getSubtitle()}
      size="full"
      showDragHandle={true}
      footer={undefined}
    >
      {/* Step Progress Indicator — completed steps are tappable */}
      <div className="flex items-center justify-between mb-6 px-1">
        {STEPS.map((step, index) => {
          const Icon = STEP_ICONS[step]
          const isActive = step === currentStep
          const isCompleted = completedSteps.has(step)
          const isPast = index < currentStepIndex
          const canNavigate = isCompleted && !isActive && step !== 'CONGRATS'

          return (
            <div key={step} className="flex items-center flex-1">
              <button
                type="button"
                disabled={!canNavigate}
                onClick={() => canNavigate && setCurrentStep(step)}
                className={`flex flex-col items-center flex-1 ${canNavigate ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : isActive
                        ? 'bg-orange-100 dark:bg-orange-900/30'
                        : 'bg-gray-100 dark:bg-gray-700'
                  } ${canNavigate ? 'ring-2 ring-green-300 dark:ring-green-600 ring-offset-1 dark:ring-offset-gray-900' : ''}`}
                >
                  {isCompleted ? (
                    <IoCheckmarkCircleOutline className="w-4.5 h-4.5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Icon className={`w-4 h-4 ${
                      isActive
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`} />
                  )}
                </div>
                <span className={`text-[9px] mt-1 text-center leading-tight ${
                  isActive
                    ? 'text-orange-600 dark:text-orange-400 font-medium'
                    : isCompleted
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {stepLabels[step]}
                </span>
              </button>
              {index < STEPS.length - 1 && (
                <div className={`flex-shrink-0 w-6 h-0.5 mx-0.5 -mt-4 ${
                  isPast || isCompleted
                    ? 'bg-green-300 dark:bg-green-700'
                    : 'bg-gray-200 dark:bg-gray-600'
                }`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      {currentStep === 'SECURE_ACCOUNT' && (
        <SecureAccountStep
          hostData={hostData}
          missingFields={missingFields}
          onComplete={handleSecureAccountComplete}
        />
      )}

      {currentStep === 'AGREEMENT' && (
        <AgreementPreferenceStep
          onComplete={() => handleStepComplete('AGREEMENT')}
          existingAgreement={existingAgreement}
          requestData={requestData}
          hostName={hostData.name}
          hostEmail={hostData.email}
        />
      )}

      {currentStep === 'PAYMENT_PREFERENCE' && (
        <PaymentPreferenceStep
          hostData={{ id: hostData.id, name: hostData.name }}
          requestData={{ hostEarnings: requestData.hostEarnings, durationDays: requestData.durationDays }}
          onComplete={() => handleStepComplete('PAYMENT_PREFERENCE')}
        />
      )}

      {currentStep === 'ADD_CAR' && (
        <>
          {finalizing ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('bsFinalizing')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('bsFinalizingDesc')}
              </p>
            </div>
          ) : finalizeError ? (
            <div className="text-center py-12">
              <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">{finalizeError}</p>
              </div>
              <button
                onClick={handleFinalize}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
              >
                {t('bsRetry')}
              </button>
            </div>
          ) : (
            <AddCarWizard
              mode="bottomsheet"
              prefillDailyRate={requestData.offeredRate || undefined}
              defaultPublicListing={false}
              showListingToggle={false}
              onComplete={() => handleStepComplete('ADD_CAR')}
            />
          )}
        </>
      )}

      {currentStep === 'CONGRATS' && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <IoCheckmarkCircleOutline className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('bsCongratsTitle')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {t('bsCongratsDesc', { guest: requestData.guestName || 'the guest' })}
          </p>
          {bookingCode && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 font-mono">
              {bookingCode}
            </p>
          )}
          <button
            onClick={() => {
              onClose()
              onComplete()
            }}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            {t('bsViewBooking')}
          </button>
        </div>
      )}
    </BottomSheet>
  )
}
