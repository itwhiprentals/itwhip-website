// app/partner/bookings/new/components/BookingStepper.tsx

'use client'

import { useTranslations } from 'next-intl'
import {
  IoCheckmarkCircleOutline,
  IoChevronForwardOutline,
} from 'react-icons/io5'
import { Step } from '../types'

interface BookingStepperProps {
  currentStep: Step
  onStepClick: (step: Step) => void
}

const STEPS: { id: number; key: Step; titleKey: string }[] = [
  { id: 1, key: 'customer', titleKey: 'stepCustomer' },
  { id: 2, key: 'verify', titleKey: 'stepVerify' },
  { id: 3, key: 'vehicle', titleKey: 'stepVehicle' },
  { id: 4, key: 'dates', titleKey: 'stepDates' },
  { id: 5, key: 'confirm', titleKey: 'stepConfirm' },
]

export default function BookingStepper({ currentStep, onStepClick }: BookingStepperProps) {
  const t = useTranslations('PartnerBookingNew')
  const stepIndex = STEPS.findIndex(s => s.key === currentStep)

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {STEPS.map((step, index) => (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => {
                if (index < stepIndex) onStepClick(step.key)
              }}
              disabled={index > stepIndex}
              className="flex flex-col items-center"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                index < stepIndex
                  ? 'bg-green-600 text-white'
                  : index === stepIndex
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {index < stepIndex ? (
                  <IoCheckmarkCircleOutline className="w-6 h-6" />
                ) : (
                  step.id
                )}
              </div>
              <div className="mt-1 text-center">
                <p className={`text-[10px] sm:text-xs font-medium ${
                  index <= stepIndex
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {t(step.titleKey)}
                </p>
              </div>
            </button>
            {index < STEPS.length - 1 && (
              <div className="flex-1 flex items-center justify-center px-1 sm:px-2 -mt-5">
                <IoChevronForwardOutline className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  index < stepIndex
                    ? 'text-green-600'
                    : 'text-gray-300 dark:text-gray-600'
                }`} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
