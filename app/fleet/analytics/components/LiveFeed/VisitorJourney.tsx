// app/fleet/analytics/components/LiveFeed/VisitorJourney.tsx
// Expandable session timeline — shows a visitor's funnel journey step by step

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  IoAlertCircleOutline,
  IoExitOutline,
} from 'react-icons/io5'

interface JourneyStep {
  eventType: string
  timestamp: string
  metadata: any
}

interface VisitorJourneyProps {
  visitorId: string
  onClose: () => void
}

const STEP_CONFIG: Record<string, { Icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  funnel_car_viewed: { Icon: IoCarSportOutline, label: 'Viewed Car', color: 'text-blue-500' },
  funnel_dates_selected: { Icon: IoCalendarOutline, label: 'Selected Dates', color: 'text-indigo-500' },
  funnel_insurance_selected: { Icon: IoShieldCheckmarkOutline, label: 'Chose Insurance', color: 'text-indigo-500' },
  funnel_book_clicked: { Icon: IoCartOutline, label: 'Clicked Book', color: 'text-amber-500' },
  funnel_checkout_loaded: { Icon: IoDocumentTextOutline, label: 'Checkout Loaded', color: 'text-amber-500' },
  funnel_identity_started: { Icon: IoIdCardOutline, label: 'Started ID Verify', color: 'text-orange-500' },
  funnel_identity_completed: { Icon: IoCheckmarkCircleOutline, label: 'ID Verified', color: 'text-green-500' },
  funnel_payment_started: { Icon: IoCardOutline, label: 'Started Payment', color: 'text-purple-500' },
  funnel_payment_processing: { Icon: IoHourglassOutline, label: 'Processing Payment', color: 'text-purple-500' },
  funnel_booking_confirmed: { Icon: IoRibbonOutline, label: 'Booking Confirmed!', color: 'text-green-600' },
  funnel_error: { Icon: IoAlertCircleOutline, label: 'Error', color: 'text-red-500' },
  funnel_abandoned: { Icon: IoExitOutline, label: 'Abandoned', color: 'text-gray-500' },
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export default function VisitorJourney({ visitorId, onClose }: VisitorJourneyProps) {
  const [steps, setSteps] = useState<JourneyStep[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/fleet/analytics/visitor-journey/${encodeURIComponent(visitorId)}?key=phoenix-fleet-2847`)
        const data = await res.json()
        if (data.success) setSteps(data.steps)
      } catch {}
      setLoading(false)
    })()
  }, [visitorId])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="ml-6 pl-4 py-2 border-l-2 border-gray-200 dark:border-gray-700 space-y-1">
          {loading ? (
            <div className="flex items-center gap-2 py-1">
              <div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-400">Loading journey...</span>
            </div>
          ) : steps.length === 0 ? (
            <p className="text-xs text-gray-400 py-1">No funnel events for this visitor</p>
          ) : (
            steps.map((step, i) => {
              const config = STEP_CONFIG[step.eventType]
              const StepIcon = config?.Icon || IoCarSportOutline
              const stepColor = config?.color || 'text-gray-400'
              const stepLabel = config?.label || step.eventType
              const isLast = i === steps.length - 1
              const carName = step.metadata?.carName

              return (
                <motion.div
                  key={`${step.eventType}-${step.timestamp}`}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-2 py-0.5 ${isLast ? 'font-medium' : ''}`}
                >
                  <StepIcon className={`w-3.5 h-3.5 flex-shrink-0 ${stepColor}`} />
                  <span className="text-xs text-gray-500 w-16 flex-shrink-0">{formatTime(step.timestamp)}</span>
                  <span className={`text-xs ${isLast ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                    {stepLabel}
                    {carName && <span className="text-gray-400"> — {carName}</span>}
                  </span>
                  {isLast && (
                    <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  )}
                </motion.div>
              )
            })
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
