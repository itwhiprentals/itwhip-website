// app/(guest)/rentals/components/booking/BookingSteps.tsx
'use client'

import { 
  IoCarOutline,
  IoPersonOutline,
  IoCardOutline,
  IoCheckmarkCircleOutline,
  IoCheckmarkOutline
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

const steps: Step[] = [
  {
    id: 1,
    name: 'Trip Details',
    description: 'Select dates and options',
    icon: <IoCarOutline className="w-6 h-6" />
  },
  {
    id: 2,
    name: 'Verification',
    description: 'Verify your identity',
    icon: <IoPersonOutline className="w-6 h-6" />
  },
  {
    id: 3,
    name: 'Payment',
    description: 'Secure payment',
    icon: <IoCardOutline className="w-6 h-6" />
  },
  {
    id: 4,
    name: 'Confirmation',
    description: 'Booking complete',
    icon: <IoCheckmarkCircleOutline className="w-6 h-6" />
  }
]

export default function BookingSteps({ currentStep }: BookingStepsProps) {
  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2">
            <div 
              className="h-full bg-amber-600 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Steps */}
          {steps.map((step, index) => (
            <div key={step.id} className="relative flex flex-col items-center">
              {/* Step Circle */}
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  transition-all duration-300 z-10
                  ${
                    step.id < currentStep
                      ? 'bg-amber-600 text-white'
                      : step.id === currentStep
                      ? 'bg-amber-600 text-white ring-4 ring-amber-100 dark:ring-amber-900'
                      : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-400'
                  }
                `}
              >
                {step.id < currentStep ? (
                  <IoCheckmarkOutline className="w-6 h-6" />
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </div>

              {/* Step Label */}
              <div className="mt-3 text-center">
                <div
                  className={`
                    text-sm font-medium
                    ${
                      step.id <= currentStep
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    }
                  `}
                >
                  {step.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {step.description}
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
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-white text-sm font-semibold">
              {currentStep}
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Step {currentStep} of {steps.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {steps[currentStep - 1].name}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(((currentStep - 1) / (steps.length - 1)) * 100)}% complete
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-600 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Step List */}
        <div className="mt-6 space-y-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`
                flex items-center p-3 rounded-lg
                ${
                  step.id === currentStep
                    ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                    : ''
                }
              `}
            >
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full mr-3
                  ${
                    step.id < currentStep
                      ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                      : step.id === currentStep
                      ? 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  }
                `}
              >
                {step.id < currentStep ? (
                  <IoCheckmarkOutline className="w-5 h-5" />
                ) : (
                  step.icon
                )}
              </div>
              <div className="flex-1">
                <div
                  className={`
                    text-sm font-medium
                    ${
                      step.id <= currentStep
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    }
                  `}
                >
                  {step.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {step.description}
                </div>
              </div>
              {step.id < currentStep && (
                <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Alternative Compact View (Optional) */}
      <div className="hidden">
        <div className="flex items-center space-x-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                    ${
                      step.id < currentStep
                        ? 'bg-green-600 text-white'
                        : step.id === currentStep
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }
                  `}
                >
                  {step.id < currentStep ? '✓' : step.id}
                </div>
                <span
                  className={`
                    ml-2 text-sm hidden lg:inline
                    ${
                      step.id <= currentStep
                        ? 'text-gray-900 dark:text-white font-medium'
                        : 'text-gray-500 dark:text-gray-400'
                    }
                  `}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 min-w-4">
                  <div
                    className={`
                      h-full bg-gradient-to-r transition-all duration-500
                      ${
                        step.id < currentStep
                          ? 'from-green-600 to-green-600 w-full'
                          : step.id === currentStep
                          ? 'from-amber-600 to-transparent w-1/2'
                          : 'w-0'
                      }
                    `}
                  />
                </div>
              )}
            </React.Fragment>
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
            h-2 rounded-full transition-all duration-300
            ${
              step < currentStep
                ? 'w-8 bg-green-600'
                : step === currentStep
                ? 'w-12 bg-amber-600'
                : 'w-8 bg-gray-300 dark:bg-gray-600'
            }
          `}
        />
      ))}
    </div>
  )
}

// Vertical Steps Component (for sidebars)
export function BookingStepsVertical({ currentStep }: BookingStepsProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-start">
          {/* Step Indicator */}
          <div className="flex flex-col items-center mr-4">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${
                  step.id < currentStep
                    ? 'bg-green-600 text-white'
                    : step.id === currentStep
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }
              `}
            >
              {step.id < currentStep ? (
                <IoCheckmarkOutline className="w-5 h-5" />
              ) : (
                step.icon
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`
                  w-0.5 h-16 mt-2
                  ${
                    step.id < currentStep
                      ? 'bg-green-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }
                `}
              />
            )}
          </div>

          {/* Step Content */}
          <div className="flex-1 pt-2">
            <div
              className={`
                font-medium
                ${
                  step.id <= currentStep
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400'
                }
              `}
            >
              {step.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {step.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}