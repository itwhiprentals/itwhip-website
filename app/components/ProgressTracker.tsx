// app/components/ProgressTracker.tsx
'use client'

import { IoCheckmarkCircle, IoEllipseOutline, IoRemoveCircleOutline } from 'react-icons/io5'

export type StepStatus = 'completed' | 'current' | 'pending' | 'failed'

interface Step {
  id: string
  label: string
  status: StepStatus
  description?: string
  timestamp?: string
}

interface ProgressTrackerProps {
  steps: Step[]
  orientation?: 'horizontal' | 'vertical'
  showTimestamps?: boolean
  className?: string
}

export default function ProgressTracker({
  steps,
  orientation = 'horizontal',
  showTimestamps = false,
  className = ''
}: ProgressTrackerProps) {
  const getStepIcon = (status: StepStatus) => {
    switch (status) {
      case 'completed':
        return <IoCheckmarkCircle className="w-6 h-6 text-green-600" />
      case 'current':
        return <IoEllipseOutline className="w-6 h-6 text-blue-600 animate-pulse" />
      case 'failed':
        return <IoRemoveCircleOutline className="w-6 h-6 text-red-600" />
      case 'pending':
      default:
        return <IoEllipseOutline className="w-6 h-6 text-gray-400" />
    }
  }

  const getStepColor = (status: StepStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400'
      case 'current':
        return 'text-blue-600 dark:text-blue-400'
      case 'failed':
        return 'text-red-600 dark:text-red-400'
      case 'pending':
      default:
        return 'text-gray-500 dark:text-gray-400'
    }
  }

  const getConnectorColor = (currentIndex: number) => {
    if (currentIndex === 0) return ''
    const previousStep = steps[currentIndex - 1]
    return previousStep.status === 'completed' ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
  }

  if (orientation === 'vertical') {
    return (
      <div className={`space-y-4 ${className}`}>
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start">
            {/* Icon and Connector */}
            <div className="relative flex flex-col items-center">
              <div className="flex-shrink-0">
                {getStepIcon(step.status)}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-16 mt-2 ${
                  step.status === 'completed' ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                }`} />
              )}
            </div>

            {/* Content */}
            <div className="ml-4 flex-1">
              <p className={`text-sm font-semibold ${getStepColor(step.status)}`}>
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {step.description}
                </p>
              )}
              {showTimestamps && step.timestamp && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {new Date(step.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Horizontal orientation
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          {/* Step */}
          <div className="flex flex-col items-center flex-1">
            <div className="flex-shrink-0 mb-2">
              {getStepIcon(step.status)}
            </div>
            <p className={`text-xs font-semibold text-center ${getStepColor(step.status)}`}>
              {step.label}
            </p>
            {step.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1 max-w-[120px]">
                {step.description}
              </p>
            )}
            {showTimestamps && step.timestamp && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {new Date(step.timestamp).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div className={`h-0.5 flex-1 mx-2 ${getConnectorColor(index + 1)}`} />
          )}
        </div>
      ))}
    </div>
  )
}