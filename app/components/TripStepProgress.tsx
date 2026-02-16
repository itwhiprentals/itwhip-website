// app/components/TripStepProgress.tsx
'use client'

import { motion } from 'framer-motion'
import {
  IoCheckmarkCircle,
  IoHourglassOutline,
} from 'react-icons/io5'

interface TripStepProgressProps {
  steps: { name: string; description?: string }[]
  currentStep: number
  className?: string
}

export default function TripStepProgress({
  steps,
  currentStep,
  className = '',
}: TripStepProgressProps) {
  const totalSteps = steps.length
  // Fill percentage: maps current step index to 0–100% across the bar
  const fillPercent =
    currentStep >= totalSteps
      ? 100
      : Math.round((currentStep / (totalSteps - 1)) * 100)

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg shadow p-4 sm:p-6 ${className}`}>
      {/* Progress Bar with Arrow — matches StatusProgression layout */}
      <div className="relative -mx-4 sm:-mx-5">
        {/* Track line — gray base with gradient green fill */}
        <div className="absolute top-[15px] sm:top-[20px] left-[10%] right-[10%] h-1.5 sm:h-2 bg-gray-200/80 dark:bg-gray-700 rounded-full shadow-inner">
          {/* Green gradient filled portion */}
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 via-green-500 to-emerald-500 rounded-full relative shadow-[0_1px_3px_rgba(34,197,94,0.4)]"
            initial={{ width: '0%' }}
            animate={{ width: `${fillPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
            </div>
            {/* Arrow at the leading edge */}
            {currentStep > 0 && currentStep < totalSteps && (
              <div className="absolute -right-1.5 top-1/2 -translate-y-1/2">
                <motion.div
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-emerald-500 sm:border-t-[5px] sm:border-b-[5px] sm:border-l-[8px] drop-shadow-sm" />
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Steps */}
        <div
          className="relative grid"
          style={{ gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))` }}
        >
          {steps.map((step, index) => {
            const isComplete = index < currentStep
            const isActive = index === currentStep
            return (
              <div key={index} className="flex flex-col items-center min-w-0 px-0.5">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
                  className={`
                    w-8 h-8 sm:w-11 sm:h-11 rounded-full flex items-center justify-center z-10 relative
                    transition-shadow duration-300
                    ${isComplete
                      ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-[0_2px_8px_rgba(34,197,94,0.4)] ring-2 ring-green-200/50 dark:ring-green-800/50'
                      : isActive
                      ? 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-[0_2px_8px_rgba(245,158,11,0.4)] ring-2 ring-yellow-200/50 dark:ring-yellow-800/50'
                      : 'bg-gray-200 dark:bg-gray-600 shadow-inner'}
                  `}
                >
                  {isComplete ? (
                    <IoCheckmarkCircle className="w-5 h-5 sm:w-7 sm:h-7 text-white drop-shadow-sm" />
                  ) : isActive ? (
                    <IoHourglassOutline className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-sm animate-spin" />
                  ) : (
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white/80 rounded-full shadow-inner" />
                  )}
                  {/* Glossy highlight on circles */}
                  {(isComplete || isActive) && (
                    <div className="absolute top-0.5 left-1.5 right-1.5 h-3 sm:h-4 rounded-full bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                  )}
                </motion.div>

                <div className="mt-1.5 sm:mt-2 text-center">
                  <p
                    className={`text-[10px] sm:text-xs font-semibold tracking-wide leading-tight ${
                      isComplete
                        ? 'text-green-700 dark:text-green-400'
                        : isActive
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {step.name}
                  </p>
                  {step.description && (
                    <p
                      className={`text-[9px] sm:text-[11px] mt-0.5 leading-tight ${
                        isComplete || isActive
                          ? 'text-gray-600 dark:text-gray-300'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
