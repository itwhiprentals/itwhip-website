// Fleet-side booking progress bar — mirrors guest StatusProgression visually
// Uses FleetBooking data, English-only (no i18n needed)
'use client'

import { FleetBooking } from '../types'
import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoHourglass,
  IoCloseCircleOutline
} from 'react-icons/io5'

interface BookingProgressBarProps {
  booking: FleetBooking
}

export function BookingProgressBar({ booking }: BookingProgressBarProps) {
  const status = booking.status
  const vs = booking.verificationStatus?.toUpperCase()
  const ps = booking.paymentStatus?.toUpperCase()

  // Derive step states — same logic as guest StatusProgression
  const isBooked = true
  const isVerified = vs === 'APPROVED' || vs === 'COMPLETED'
  const paymentSuccessful = ps === 'PAID' || ps === 'CAPTURED'
  const paymentAuthorized = ps === 'AUTHORIZED'
  const isConfirmed = paymentSuccessful && (status === 'CONFIRMED' || status === 'ACTIVE' || status === 'COMPLETED')
  const isActive = status === 'ACTIVE' || !!booking.tripStartedAt
  const isNoShow = status === 'NO_SHOW'
  const isCompleted = status === 'COMPLETED' || isNoShow || !!booking.tripEndedAt
  const isCancelled = status === 'CANCELLED'
  const isOnHold = status === 'ON_HOLD'
  const paymentFailed = ps === 'FAILED'
  const hasIssues = paymentFailed || vs === 'REJECTED'

  // Build steps
  const steps = [
    {
      label: 'Booked',
      complete: isBooked,
      error: false,
      active: false,
      desc: isVerified ? 'Docs submitted' : paymentAuthorized ? 'Pending verification' : 'Awaiting docs',
    },
    {
      label: isOnHold ? 'Stripe' : hasIssues ? 'Issues' : 'Verified',
      complete: isVerified && !isOnHold && !hasIssues && !isNoShow,
      error: hasIssues || paymentFailed || isNoShow,
      active: false,
      desc: isOnHold ? 'Verification required' : hasIssues ? 'Action needed' : isVerified ? 'Approved' : 'Under review',
    },
    {
      label: isOnHold ? 'On Hold' : 'Confirmed',
      complete: isConfirmed && !isOnHold && !isNoShow,
      error: isOnHold || paymentFailed || isNoShow,
      active: false,
      desc: isOnHold ? 'Awaiting docs' : isConfirmed ? 'Payment captured' : paymentFailed ? 'Payment failed' : 'Processing',
    },
    {
      label: 'Active',
      complete: isActive && !isNoShow,
      error: isNoShow,
      active: false,
      desc: isNoShow ? 'No-show' : isActive ? 'In progress' : 'Ready for pickup',
    },
    {
      label: 'Completed',
      complete: isCompleted,
      error: false,
      active: false,
      desc: isNoShow ? 'Auto-completed' : isCompleted ? 'Trip finished' : 'Not started',
    },
  ]

  // Mark next incomplete step as active (yellow pulse)
  if (!isCancelled && !isCompleted && !isNoShow) {
    const nextIdx = steps.findIndex(s => !s.complete && !s.error)
    if (nextIdx >= 0) steps[nextIdx].active = true
  }

  // Cancelled — show special red bar
  if (isCancelled) {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2">
        <IoCloseCircleOutline className="w-5 h-5 text-red-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-900 dark:text-red-200">Booking Cancelled</p>
          <p className="text-xs text-red-700 dark:text-red-400">
            {booking.cancellationReason || 'This booking has been cancelled.'}
          </p>
        </div>
      </div>
    )
  }

  // Determine how far the bar fills (percentage of the connector track)
  // The track runs between the first and last circle centers
  const fillPercent = isNoShow ? 100 :
    isCompleted ? 100 :
    isActive ? 87.5 :
    isConfirmed ? 62.5 :
    isOnHold ? 37.5 :
    isVerified ? 37.5 :
    paymentAuthorized ? 12.5 : 0

  const isBarRed = isNoShow

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 pb-2">
      <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 font-semibold">
        Guest View — Booking Progress
      </p>

      {/* Steps with connecting line running through circles */}
      <div className="relative">
        {/* Connector track — runs behind the circles */}
        <div className="absolute top-[14px] left-[10%] right-[10%] h-[3px] bg-gray-200 dark:bg-gray-700 rounded-full">
          {/* Filled portion */}
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isBarRed
                ? 'bg-gradient-to-r from-red-400 via-red-500 to-red-600'
                : 'bg-gradient-to-r from-green-400 via-green-500 to-emerald-500'
            }`}
            style={{ width: `${fillPercent}%` }}
          />
        </div>

        {/* Step circles + labels */}
        <div className="relative grid grid-cols-5">
          {steps.map((step, i) => {
            // Connector arrow between steps (not after last)
            const showArrow = i < steps.length - 1
            // Arrow color: green if current step is complete, red if error, gray otherwise
            const arrowColor = step.complete
              ? (isBarRed ? 'text-red-400' : 'text-green-400')
              : step.error
              ? 'text-red-400'
              : 'text-gray-300 dark:text-gray-600'

            return (
              <div key={step.label} className="flex flex-col items-center relative">
                {/* Circle */}
                <div className={`
                  w-7 h-7 rounded-full flex items-center justify-center z-10 relative
                  ${step.complete
                    ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-sm ring-2 ring-green-200/50 dark:ring-green-800/50'
                    : step.active
                    ? 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-sm ring-2 ring-yellow-200/50 dark:ring-yellow-800/50'
                    : step.error
                    ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-sm'
                    : 'bg-gray-200 dark:bg-gray-600 shadow-inner'}
                `}>
                  {step.complete ? (
                    <IoCheckmarkCircle className="w-5 h-5 text-white drop-shadow-sm" />
                  ) : step.active ? (
                    <IoHourglass className="w-3.5 h-3.5 text-white drop-shadow-sm animate-spin" />
                  ) : step.error ? (
                    <IoCloseCircle className="w-5 h-5 text-white drop-shadow-sm" />
                  ) : (
                    <div className="w-2 h-2 bg-white/80 rounded-full" />
                  )}
                </div>

                {/* Arrow connector (between this circle and next) */}
                {showArrow && (
                  <div className={`absolute top-[11px] -right-[2px] z-20 ${arrowColor}`}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                      <path d="M1 1 L6 4 L1 7 Z" />
                    </svg>
                  </div>
                )}

                {/* Label */}
                <p className={`text-[9px] font-semibold mt-1 text-center leading-tight ${
                  step.complete ? 'text-green-700 dark:text-green-400' :
                  step.active ? 'text-amber-700 dark:text-amber-400' :
                  step.error ? 'text-red-700 dark:text-red-400' :
                  'text-gray-400 dark:text-gray-500'
                }`}>
                  {step.label}
                </p>
                {/* Description */}
                <p className={`text-[8px] text-center leading-tight ${
                  step.complete || step.active ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {step.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
