// app/(guest)/rentals/components/booking/BookingSteps.tsx
'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import {
  IoCarOutline,
  IoPersonOutline,
  IoCardOutline,
  IoCheckmarkCircleOutline,
  IoCheckmarkOutline,
  IoLockClosedOutline
} from 'react-icons/io5'

interface BookingStepsProps {
  currentStep: number
}

interface Step {
  id: number
  name: string
  description: string
  icon: React.ReactNode
}

export default function BookingSteps({ currentStep }: BookingStepsProps) {
  const t = useTranslations('BookingSteps')

  const steps: Step[] = [
    {
      id: 1,
      name: t('tripDetails'),
      description: t('tripDetailsDesc'),
      icon: <IoCarOutline className="w-6 h-6" />
    },
    {
      id: 2,
      name: t('verification'),
      description: t('verificationDesc'),
      icon: <IoPersonOutline className="w-6 h-6" />
    },
    {
      id: 3,
      name: t('payment'),
      description: t('paymentDesc'),
      icon: <IoCardOutline className="w-6 h-6" />
    },
    {
      id: 4,
      name: t('confirmation'),
      description: t('confirmationDesc'),
      icon: <IoCheckmarkCircleOutline className="w-6 h-6" />
    }
  ]

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          {/* Progress Line Background */}
          <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-amber-500 transition-all duration-700 ease-out"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Steps */}
          {steps.map((step, index) => (
            <div key={step.id} className="relative flex flex-col items-center">
              {/* Step Circle */}
              <div
                className={`
                  w-14 h-14 rounded-full flex items-center justify-center
                  transition-all duration-300 z-10 font-bold
                  ${
                    step.id < currentStep
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                      : step.id === currentStep
                      ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/40 ring-4 ring-amber-500/20 animate-pulse'
                      : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-400'
                  }
                `}
              >
                {step.id < currentStep ? (
                  <IoCheckmarkOutline className="w-7 h-7" />
                ) : step.id === currentStep ? (
                  <span className="text-lg font-bold">{step.id}</span>
                ) : (
                  <IoLockClosedOutline className="w-5 h-5 opacity-50" />
                )}
              </div>

              {/* Step Label */}
              <div className="mt-4 text-center">
                <div
                  className={`
                    text-sm font-semibold
                    ${
                      step.id < currentStep
                        ? 'text-green-700 dark:text-green-400'
                        : step.id === currentStep
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400 dark:text-gray-500'
                    }
                  `}
                >
                  {step.name}
                </div>
                <div className={`
                  text-xs mt-1
                  ${
                    step.id < currentStep
                      ? 'text-green-600 dark:text-green-500'
                      : step.id === currentStep
                      ? 'text-gray-700 dark:text-gray-300 font-medium'
                      : 'text-gray-400 dark:text-gray-600'
                  }
                `}>
                  {step.id < currentStep ? t('completed') : step.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full text-white font-bold
              ${currentStep === steps.length ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}
            `}>
              {currentStep}
            </div>
            <div className="ml-3">
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {steps[currentStep - 1].name}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {t('stepOf', { current: currentStep, total: steps.length })}
              </div>
            </div>
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('percentComplete', { percent: Math.round(((currentStep - 1) / (steps.length - 1)) * 100) })}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-700 ease-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Step List */}
        <div className="mt-6 space-y-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`
                flex items-center p-3.5 rounded-lg transition-all
                ${
                  step.id < currentStep
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : step.id === currentStep
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 dark:border-amber-600 shadow-md'
                    : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 opacity-60'
                }
              `}
            >
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full mr-3 font-bold
                  ${
                    step.id < currentStep
                      ? 'bg-green-500 text-white'
                      : step.id === currentStep
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  }
                `}
              >
                {step.id < currentStep ? (
                  <IoCheckmarkOutline className="w-5 h-5" />
                ) : step.id === currentStep ? (
                  <span className="text-sm">{step.id}</span>
                ) : (
                  <IoLockClosedOutline className="w-4 h-4 opacity-60" />
                )}
              </div>
              <div className="flex-1">
                <div
                  className={`
                    text-sm font-semibold
                    ${
                      step.id < currentStep
                        ? 'text-green-700 dark:text-green-400'
                        : step.id === currentStep
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400 dark:text-gray-500'
                    }
                  `}
                >
                  {step.name}
                </div>
                <div className={`
                  text-xs mt-0.5
                  ${
                    step.id < currentStep
                      ? 'text-green-600 dark:text-green-500'
                      : step.id === currentStep
                      ? 'text-gray-700 dark:text-gray-300'
                      : 'text-gray-400 dark:text-gray-600'
                  }
                `}>
                  {step.id < currentStep ? t('completed') : step.description}
                </div>
              </div>
              {step.id < currentStep && (
                <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Alternative Minimal Steps Component
export function BookingStepsMinimal({ currentStep }: BookingStepsProps) {
  return (
    <div className="flex items-center justify-center space-x-2">
      {[1, 2, 3, 4].map((step) => (
        <div
          key={step}
          className={`
            h-2.5 rounded-full transition-all duration-500
            ${
              step < currentStep
                ? 'w-10 bg-green-500'
                : step === currentStep
                ? 'w-16 bg-amber-500'
                : 'w-10 bg-gray-300 dark:bg-gray-600'
            }
          `}
        />
      ))}
    </div>
  )
}

// Vertical Steps Component (for sidebars)
export function BookingStepsVertical({ currentStep }: BookingStepsProps) {
  const t = useTranslations('BookingSteps')

  const steps: Step[] = [
    {
      id: 1,
      name: t('tripDetails'),
      description: t('tripDetailsDesc'),
      icon: <IoCarOutline className="w-6 h-6" />
    },
    {
      id: 2,
      name: t('verification'),
      description: t('verificationDesc'),
      icon: <IoPersonOutline className="w-6 h-6" />
    },
    {
      id: 3,
      name: t('payment'),
      description: t('paymentDesc'),
      icon: <IoCardOutline className="w-6 h-6" />
    },
    {
      id: 4,
      name: t('confirmation'),
      description: t('confirmationDesc'),
      icon: <IoCheckmarkCircleOutline className="w-6 h-6" />
    }
  ]

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-start">
          {/* Step Indicator */}
          <div className="flex flex-col items-center mr-4">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold
                ${
                  step.id < currentStep
                    ? 'bg-green-500 text-white'
                    : step.id === currentStep
                    ? 'bg-amber-500 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }
              `}
            >
              {step.id < currentStep ? (
                <IoCheckmarkOutline className="w-5 h-5" />
              ) : step.id > currentStep ? (
                <IoLockClosedOutline className="w-4 h-4 opacity-60" />
              ) : (
                <span>{step.id}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`
                  w-0.5 h-16 mt-2
                  ${
                    step.id < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-300 dark:bg-gray-700'
                  }
                `}
              />
            )}
          </div>

          {/* Step Content */}
          <div className="flex-1 pt-2">
            <div
              className={`
                font-semibold
                ${
                  step.id < currentStep
                    ? 'text-green-700 dark:text-green-400'
                    : step.id === currentStep
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-400 dark:text-gray-500'
                }
              `}
            >
              {step.name}
            </div>
            <div className={`
              text-sm mt-1
              ${
                step.id < currentStep
                  ? 'text-green-600 dark:text-green-500'
                  : step.id === currentStep
                  ? 'text-gray-600 dark:text-gray-400'
                  : 'text-gray-400 dark:text-gray-600'
              }
            `}>
              {step.id < currentStep ? t('completed') : step.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}