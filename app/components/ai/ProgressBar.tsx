'use client'

import {
  IoLocationSharp,
  IoCalendar,
  IoCar,
  IoCheckmarkCircle,
  IoCard,
} from 'react-icons/io5'
import { BookingState, CheckoutStep } from '@/app/lib/ai-booking/types'

interface ProgressBarProps {
  state: BookingState
  /** When set, the "Pay" step reflects checkout progress */
  checkoutStep?: CheckoutStep
}

const STEPS = [
  { key: BookingState.COLLECTING_LOCATION, label: 'Location', icon: IoLocationSharp },
  { key: BookingState.COLLECTING_DATES, label: 'Dates', icon: IoCalendar },
  { key: BookingState.COLLECTING_VEHICLE, label: 'Vehicle', icon: IoCar },
  { key: BookingState.CONFIRMING, label: 'Confirm', icon: IoCheckmarkCircle },
  { key: BookingState.READY_FOR_PAYMENT, label: 'Pay', icon: IoCard },
]

const STATE_ORDER: Record<string, number> = {
  [BookingState.INIT]: 0,
  [BookingState.COLLECTING_LOCATION]: 1,
  [BookingState.COLLECTING_DATES]: 2,
  [BookingState.COLLECTING_VEHICLE]: 3,
  [BookingState.CONFIRMING]: 4,
  [BookingState.CHECKING_AUTH]: 4,
  [BookingState.READY_FOR_PAYMENT]: 5,
}

export default function ProgressBar({ state, checkoutStep }: ProgressBarProps) {
  // When in checkout, override to show "Pay" step as active/complete
  let currentOrder = STATE_ORDER[state] ?? 0
  if (checkoutStep) {
    // Checkout active → "Pay" step (order 5) is active
    currentOrder = 5
    // Checkout confirmed → "Pay" step is complete (go past 5)
    if (checkoutStep === CheckoutStep.CONFIRMED) currentOrder = 6
  }

  return (
    <div className="flex items-center py-2 px-3">
      {STEPS.map((step, i) => {
        const stepOrder = STATE_ORDER[step.key] ?? 0
        const isComplete = currentOrder > stepOrder
        const isCurrent = currentOrder === stepOrder
        const Icon = step.icon
        const isFirst = i === 0

        return (
          <div key={step.key} className={`flex items-center ${isFirst ? '' : 'flex-1'}`}>
            {/* Connector line before step (except first) */}
            {!isFirst && (
              <div
                className={`
                  flex-1 h-0.5 mr-1 transition-colors
                  ${isComplete || isCurrent ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}
                `}
              />
            )}
            <div className="flex flex-col items-center gap-0.5">
              <div
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center transition-colors
                  ${isComplete
                    ? 'bg-primary text-white'
                    : isCurrent
                      ? 'bg-primary/10 text-primary ring-2 ring-primary/30'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }
                `}
              >
                <Icon size={14} />
              </div>
              <span
                className={`
                  text-[10px] font-medium transition-colors whitespace-nowrap
                  ${isComplete || isCurrent
                    ? 'text-primary'
                    : 'text-gray-400 dark:text-gray-500'
                  }
                `}
              >
                {step.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
