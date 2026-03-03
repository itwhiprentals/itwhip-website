// app/partner/bookings/[id]/components/CashHandoffChecklist.tsx
// Sequential cash handoff checklist for manual/recruited bookings with paymentType=CASH

'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  IoCheckmarkCircleOutline,
  IoEllipseOutline,
  IoWalletOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
  IoCarOutline,
  IoCheckmarkDoneOutline,
  IoHandLeftOutline
} from 'react-icons/io5'

interface CashHandoffChecklistProps {
  bookingId: string
  bookingStatus: string
  handoffStatus: string | null
  paymentStatus: string
  onComplete?: () => void
}

const STEPS = [
  'arrived',
  'payment_received',
  'dl_checked',
  'identity_confirmed',
  'inspection_started',
  'handoff_complete',
] as const

type Step = typeof STEPS[number]

const STEP_ICONS: Record<Step, React.ComponentType<{ className?: string }>> = {
  arrived: IoPersonOutline,
  payment_received: IoWalletOutline,
  dl_checked: IoShieldCheckmarkOutline,
  identity_confirmed: IoShieldCheckmarkOutline,
  inspection_started: IoCarOutline,
  handoff_complete: IoCheckmarkDoneOutline,
}

export function CashHandoffChecklist({
  bookingId,
  bookingStatus,
  handoffStatus,
  paymentStatus,
  onComplete,
}: CashHandoffChecklistProps) {
  const t = useTranslations('CashHandoff')
  const [completedSteps, setCompletedSteps] = useState<Step[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // If handoff is already complete, mark all steps done
  const isHandoffComplete = handoffStatus === 'HANDOFF_COMPLETE' || handoffStatus === 'BYPASSED'
    || bookingStatus === 'ACTIVE' || bookingStatus === 'COMPLETED'

  useEffect(() => {
    if (isHandoffComplete) {
      setCompletedSteps([...STEPS])
    }
  }, [isHandoffComplete])

  const currentStepIndex = completedSteps.length

  const handleStepClick = async (step: Step) => {
    const stepIndex = STEPS.indexOf(step)

    // Can only click the next sequential step
    if (stepIndex !== currentStepIndex) return
    if (submitting) return

    setSubmitting(true)
    setError(null)

    try {
      const newCompletedSteps = [...completedSteps, step]

      const res = await fetch(`/api/partner/bookings/${bookingId}/handoff/cash-checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedSteps: newCompletedSteps }),
      })

      const data = await res.json()

      if (res.ok) {
        setCompletedSteps(newCompletedSteps)
        if (step === 'handoff_complete') {
          onComplete?.()
        }
      } else {
        setError(data.error || t('failedToUpdate'))
      }
    } catch {
      setError(t('failedToUpdate'))
    } finally {
      setSubmitting(false)
    }
  }

  // Don't show for non-cash or already completed trips
  if (bookingStatus === 'CANCELLED' || bookingStatus === 'PENDING') return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <IoHandLeftOutline className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('title')}</h3>
          {isHandoffComplete && (
            <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-green-600 text-white">
              {t('complete')}
            </span>
          )}
        </div>
        {!isHandoffComplete && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('description')}</p>
        )}
      </div>

      <div className="p-4 space-y-1">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step)
          const isCurrent = index === currentStepIndex && !isHandoffComplete
          const isLocked = index > currentStepIndex && !isHandoffComplete
          const Icon = STEP_ICONS[step]

          return (
            <button
              key={step}
              onClick={() => handleStepClick(step)}
              disabled={!isCurrent || submitting}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                isCompleted
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : isCurrent
                    ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30'
                    : 'bg-gray-200/70 dark:bg-gray-700/30 opacity-50 cursor-not-allowed'
              }`}
            >
              {/* Step indicator */}
              <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                isCompleted
                  ? 'bg-green-600 text-white'
                  : isCurrent
                    ? 'bg-orange-500 text-white animate-pulse'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
              }`}>
                {isCompleted ? (
                  <IoCheckmarkCircleOutline className="w-4 h-4" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Step text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  isCompleted
                    ? 'text-green-700 dark:text-green-400'
                    : isCurrent
                      ? 'text-orange-700 dark:text-orange-400'
                      : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {t(`step_${step}`)}
                </p>
                {step === 'identity_confirmed' && isCurrent && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {t('identityConfirmedNote')}
                  </p>
                )}
                {step === 'payment_received' && isCurrent && (
                  <p className="text-[11px] text-orange-600 dark:text-orange-400 font-medium mt-0.5">
                    {t('paymentRequired')}
                  </p>
                )}
              </div>

              {/* Tap indicator for current step */}
              {isCurrent && !submitting && (
                <span className="text-[10px] text-orange-500 font-medium flex-shrink-0">{t('tap')}</span>
              )}
              {isCurrent && submitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 flex-shrink-0" />
              )}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="px-4 pb-3">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}
