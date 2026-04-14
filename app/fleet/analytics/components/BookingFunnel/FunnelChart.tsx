// app/fleet/analytics/components/BookingFunnel/FunnelChart.tsx
// Visual funnel — horizontal bars with animated counters and bar widths

'use client'

import { motion } from 'framer-motion'
import {
  IoCarSportOutline,
  IoCalendarOutline,
  IoShieldCheckmarkOutline,
  IoCartOutline,
  IoDocumentTextOutline,
  IoIdCardOutline,
  IoCheckmarkCircleOutline,
  IoCardOutline,
  IoHourglassOutline,
  IoRibbonOutline,
} from 'react-icons/io5'
import AnimatedCounter from '../shared/AnimatedCounter'

interface FunnelStep {
  step: string
  label: string
  count: number
  dropOff: number
  conversionFromPrev: number
}

interface FunnelChartProps {
  steps: FunnelStep[]
}

const STEP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  funnel_car_viewed: IoCarSportOutline,
  funnel_dates_selected: IoCalendarOutline,
  funnel_insurance_selected: IoShieldCheckmarkOutline,
  funnel_book_clicked: IoCartOutline,
  funnel_checkout_loaded: IoDocumentTextOutline,
  funnel_identity_started: IoIdCardOutline,
  funnel_identity_completed: IoCheckmarkCircleOutline,
  funnel_payment_started: IoCardOutline,
  funnel_payment_processing: IoHourglassOutline,
  funnel_booking_confirmed: IoRibbonOutline,
}

export default function FunnelChart({ steps }: FunnelChartProps) {
  const maxCount = steps.length > 0 ? Math.max(...steps.map(s => s.count)) : 1

  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        const width = maxCount > 0 ? (step.count / maxCount) * 100 : 0
        const isDropOff = step.dropOff > 30
        const barColor = step.step === 'funnel_booking_confirmed'
          ? 'bg-green-500'
          : isDropOff
            ? 'bg-red-400'
            : 'bg-blue-500'
        const StepIcon = STEP_ICONS[step.step]

        return (
          <div key={step.step}>
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-4 text-right">{i + 1}</span>
                {StepIcon && <StepIcon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />}
                <span className="text-sm text-gray-700 dark:text-gray-300">{step.label}</span>
              </div>
              <div className="flex items-center gap-3">
                {i > 0 && step.dropOff > 0 && (
                  <span className={`text-[10px] font-medium ${isDropOff ? 'text-red-500' : 'text-gray-400'}`}>
                    -{step.dropOff}%
                  </span>
                )}
                <span className="text-sm font-semibold text-gray-900 dark:text-white w-10 text-right">
                  <AnimatedCounter value={step.count} />
                </span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${barColor}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(width, 1)}%` }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
              />
            </div>
          </div>
        )
      })}

      {steps.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">
          No funnel data yet — booking events will appear as users go through checkout
        </p>
      )}
    </div>
  )
}
