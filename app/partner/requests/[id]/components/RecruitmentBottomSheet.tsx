// app/partner/requests/[id]/components/RecruitmentBottomSheet.tsx
// Main orchestrator for the recruited host onboarding bottomsheet flow
// Steps: Secure Account → Payment Preference → Add Car → Congrats

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import BottomSheet from '@/app/components/BottomSheet'
import SecureAccountStep from './SecureAccountStep'
import {
  IoShieldCheckmarkOutline,
  IoWalletOutline,
  IoCarOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5'

type OnboardingStep = 'SECURE_ACCOUNT' | 'PAYMENT_PREFERENCE' | 'ADD_CAR' | 'CONGRATS'

interface MissingFields {
  needsPhone: boolean
  needsEmail: boolean
  needsPassword: boolean
  needsEmailVerification: boolean
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
}

const STEPS: OnboardingStep[] = ['SECURE_ACCOUNT', 'PAYMENT_PREFERENCE', 'ADD_CAR', 'CONGRATS']

const STEP_ICONS = {
  SECURE_ACCOUNT: IoShieldCheckmarkOutline,
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
  requestData
}: RecruitmentBottomSheetProps) {
  const t = useTranslations('PartnerRequestDetail')

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('SECURE_ACCOUNT')
  const [completedSteps, setCompletedSteps] = useState<Set<OnboardingStep>>(new Set())
  const [missingFields, setMissingFields] = useState<MissingFields>({
    needsPhone: false,
    needsEmail: false,
    needsPassword: !hostData.hasPassword,
    needsEmailVerification: false
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
          needsEmailVerification: host.email && !host.emailVerified
        })

        // If account is already fully secured, skip to next step
        if (host.hasPassword && host.phone && host.email) {
          setCompletedSteps(prev => new Set([...prev, 'SECURE_ACCOUNT']))
          setCurrentStep('PAYMENT_PREFERENCE')
        }
      }
    } catch (error) {
      console.error('Failed to detect missing fields:', error)
    }
  }, [])

  const handleStepComplete = useCallback((step: OnboardingStep) => {
    setCompletedSteps(prev => new Set([...prev, step]))

    // Advance to next step
    const currentIndex = STEPS.indexOf(step)
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1])
    }
  }, [])

  const handleSecureAccountComplete = useCallback(() => {
    handleStepComplete('SECURE_ACCOUNT')
  }, [handleStepComplete])

  const currentStepIndex = STEPS.indexOf(currentStep)
  const stepLabels = {
    SECURE_ACCOUNT: t('bsStepSecureAccount'),
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
      {/* Step Progress Indicator */}
      <div className="flex items-center justify-between mb-6 px-1">
        {STEPS.map((step, index) => {
          const Icon = STEP_ICONS[step]
          const isActive = step === currentStep
          const isCompleted = completedSteps.has(step)
          const isPast = index < currentStepIndex

          return (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : isActive
                        ? 'bg-orange-100 dark:bg-orange-900/30'
                        : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  {isCompleted ? (
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Icon className={`w-4.5 h-4.5 ${
                      isActive
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`} />
                  )}
                </div>
                <span className={`text-[10px] mt-1 text-center leading-tight ${
                  isActive
                    ? 'text-orange-600 dark:text-orange-400 font-medium'
                    : isCompleted
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {stepLabels[step]}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`flex-shrink-0 w-8 h-0.5 mx-1 -mt-4 ${
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

      {currentStep === 'PAYMENT_PREFERENCE' && (
        <div className="text-center py-12">
          <IoWalletOutline className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('bsPaymentComingSoon')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {t('bsPaymentComingSoonDesc')}
          </p>
          <button
            onClick={() => handleStepComplete('PAYMENT_PREFERENCE')}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
          >
            {t('bsContinue')}
          </button>
        </div>
      )}

      {currentStep === 'ADD_CAR' && (
        <div className="text-center py-12">
          <IoCarOutline className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('bsAddCarComingSoon')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {t('bsAddCarComingSoonDesc')}
          </p>
          <button
            onClick={() => handleStepComplete('ADD_CAR')}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
          >
            {t('bsContinue')}
          </button>
        </div>
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
