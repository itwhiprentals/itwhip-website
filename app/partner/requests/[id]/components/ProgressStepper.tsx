'use client'

import { useTranslations } from 'next-intl'
import {
  IoCheckmarkCircle,
  IoChevronForwardOutline,
  IoCarSportOutline,
  IoDocumentTextOutline,
  IoWalletOutline,
  IoCreateOutline,
} from 'react-icons/io5'

interface OnboardingProgress {
  carPhotosUploaded: boolean
  ratesConfigured: boolean
  agreementUploaded: boolean
  payoutConnected: boolean
  agreementPreference?: string | null
  paymentPreference?: string | null
  firstCarName?: string | null
}

interface ProgressStepperProps {
  onboardingProgress: OnboardingProgress
  onOpenRecruitmentSheet: () => void
  onEditAgreement: () => void
  onEditPayment: () => void
  onConnectPayout: () => void
  connectingPayout: boolean
  hasPendingCounterOffer: boolean
}

export default function ProgressStepper({
  onboardingProgress,
  onOpenRecruitmentSheet,
  onEditAgreement,
  onEditPayment,
  onConnectPayout,
  connectingPayout,
  hasPendingCounterOffer,
}: ProgressStepperProps) {
  const t = useTranslations('PartnerRequestDetail')

  const carDone = onboardingProgress.carPhotosUploaded && onboardingProgress.ratesConfigured
  const agreementDone = onboardingProgress.agreementUploaded
  const payoutDone = onboardingProgress.payoutConnected
  const completedCount = [carDone, agreementDone, payoutDone].filter(Boolean).length
  const allDone = completedCount === 3
  const pref = onboardingProgress.agreementPreference
  const payPref = onboardingProgress.paymentPreference

  const steps = [
    {
      key: 'car',
      done: carDone,
      icon: IoCarSportOutline,
      label: t('listYourCar'),
      desc: carDone
        ? (onboardingProgress.firstCarName ? t('carListed', { car: onboardingProgress.firstCarName }) : t('carListedSuccessfully'))
        : t('addPhotosAndRate'),
      onAction: onOpenRecruitmentSheet,
      onEdit: onOpenRecruitmentSheet,
    },
    {
      key: 'agreement',
      done: agreementDone,
      icon: IoDocumentTextOutline,
      label: t('rentalAgreement'),
      desc: agreementDone
        ? (pref === 'ITWHIP' ? t('agreementItwhipSet') : pref === 'OWN' ? t('agreementOwnSet') : pref === 'BOTH' ? t('agreementBothSet') : t('agreementUploadedTested'))
        : t('chooseAgreementType'),
      onAction: onOpenRecruitmentSheet,
      onEdit: onEditAgreement,
    },
    {
      key: 'payout',
      done: payoutDone,
      icon: IoWalletOutline,
      label: t('connectPayout'),
      desc: payoutDone
        ? (payPref === 'CASH' ? t('cashAtPickup') : t('bankConnected'))
        : t('connectToReceivePayments'),
      onAction: onConnectPayout,
      onEdit: onEditPayment,
      loading: connectingPayout,
      disabled: connectingPayout || hasPendingCounterOffer,
    },
  ]

  // Find the first incomplete step (the "next" step to do)
  const nextStepIndex = steps.findIndex(s => !s.done)

  return (
    <div className="mt-4 sm:mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('whatsNeeded')}</h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            allDone
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            {completedCount} / 3
          </span>
        </div>

        {/* Segmented progress bar */}
        <div className="flex gap-1.5">
          {steps.map((step) => (
            <div key={step.key} className="flex-1 h-1.5 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  step.done ? 'w-full bg-green-500' : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Step List */}
      <div className="px-2 pb-2">
        {steps.map((step, i) => {
          const Icon = step.icon
          const isNext = i === nextStepIndex

          return (
            <button
              key={step.key}
              type="button"
              onClick={step.done ? step.onEdit : step.onAction}
              disabled={!step.done && step.disabled}
              className={`w-full flex items-center gap-3 px-3 py-3 text-left group rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                step.done
                  ? 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                  : isNext
                    ? 'bg-gray-50 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-700/60'
                    : 'opacity-60 hover:bg-gray-50 dark:hover:bg-gray-700/20 hover:opacity-80'
              }`}
            >
              {/* Step indicator */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                step.done
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : isNext
                    ? 'bg-gray-900 dark:bg-white'
                    : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                {step.done ? (
                  <IoCheckmarkCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Icon className={`w-4.5 h-4.5 ${
                    isNext
                      ? 'text-white dark:text-gray-900'
                      : 'text-gray-400 dark:text-gray-500'
                  }`} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  step.done
                    ? 'text-gray-500 dark:text-gray-400 line-through decoration-green-400/50'
                    : isNext
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {step.label}
                </p>
                <p className={`text-xs mt-0.5 ${
                  step.done
                    ? 'text-green-600 dark:text-green-400'
                    : isNext
                      ? 'text-gray-500 dark:text-gray-400'
                      : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {step.desc}
                </p>
              </div>

              {/* Right action */}
              <div className="flex-shrink-0">
                {step.done ? (
                  <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                    <IoCreateOutline className="w-3.5 h-3.5" />
                    <span className="text-xs">{t('edit')}</span>
                  </div>
                ) : step.loading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 dark:border-gray-600 dark:border-t-gray-300 rounded-full animate-spin" />
                ) : isNext ? (
                  <div className="w-7 h-7 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IoChevronForwardOutline className="w-3.5 h-3.5 text-white dark:text-gray-900" />
                  </div>
                ) : (
                  <IoChevronForwardOutline className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
