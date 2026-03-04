// Manual Booking Progress — 5-step bar for recruited/manual bookings
// Booked → Payment → Confirmed → Agreement → Trip

'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import {
  IoCheckmarkCircle,
  IoHourglassOutline,
  IoCloseCircle,
  IoWalletOutline,
  IoDocumentTextOutline,
  IoCarSportOutline,
  IoBookmarkOutline,
  IoCheckmarkDoneOutline
} from 'react-icons/io5'

interface ManualBookingProgressProps {
  status: string
  paymentType: string | null
  agreementStatus: string | null
  tripStartedAt?: string | Date | null
  tripEndedAt?: string | Date | null
  isExpired?: boolean
}

export default function ManualBookingProgress({
  status,
  paymentType,
  agreementStatus,
  tripStartedAt,
  tripEndedAt,
  isExpired = false,
}: ManualBookingProgressProps) {
  const t = useTranslations('ManualBookingProgress')

  const isBooked = true
  const isSigned = agreementStatus === 'signed'
  const hasPayment = !!paymentType
  const isNoShow = status === 'NO_SHOW'
  const isConfirmed = status === 'CONFIRMED' || isNoShow || !!tripStartedAt || !!tripEndedAt
  const isTripStarted = !!tripStartedAt
  const isTripCompleted = !!tripEndedAt
  const isCancelled = status === 'CANCELLED'

  if (isCancelled) {
    return null // Page handles cancelled state separately
  }

  // New order: Booked → Agreement → Payment → Confirmed → Start Trip / No Show
  const steps = [
    {
      name: t('stepBooked'),
      complete: isBooked,
      active: false,
      error: false,
      description: t('bookedDesc'),
    },
    {
      name: t('stepAgreement'),
      complete: isNoShow || isSigned,
      active: !isSigned && !isNoShow,
      error: false,
      description: isSigned
        ? t('agreementSigned')
        : agreementStatus === 'sent' || agreementStatus === 'viewed'
        ? t('agreementSent')
        : t('agreementPending'),
    },
    {
      name: t('stepPayment'),
      complete: isNoShow || hasPayment,
      active: isSigned && !hasPayment && !isNoShow,
      error: false,
      description: hasPayment
        ? paymentType === 'CARD' ? t('cardAuthorized') : t('cashSelected')
        : t('awaitingPayment'),
    },
    {
      name: t('stepConfirmed'),
      complete: isConfirmed && !isNoShow,
      active: hasPayment && !isConfirmed,
      error: isNoShow,
      description: isNoShow ? t('noShow') : isConfirmed ? t('hostConfirmed') : t('awaitingConfirmation'),
    },
    {
      name: isNoShow ? t('stepNoShow') : isExpired ? t('stepExpired') : t('stepStartTrip'),
      complete: isTripCompleted && !isNoShow && !isExpired,
      active: !isNoShow && !isExpired && ((isConfirmed && !isTripStarted) || (isTripStarted && !isTripCompleted)),
      error: isNoShow || isExpired,
      description: isNoShow
        ? t('noShowDesc')
        : isExpired
        ? t('expiredDesc')
        : isTripCompleted
        ? t('tripCompleted')
        : isTripStarted
        ? t('tripInProgress')
        : isConfirmed
        ? t('readyForPickup')
        : t('tripPending'),
    },
  ]

  // Calculate progress width (new order)
  const progressWidth = isNoShow ? '100%'
    : isExpired ? '100%'
    : isTripCompleted ? '100%'
    : isTripStarted ? '90%'
    : isConfirmed ? '82%'
    : hasPayment ? '50%'
    : isSigned ? '25%'
    : '0%'

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
      {/* Progress Bar with Arrow */}
      <div className="relative -mx-2 sm:-mx-3">
        {/* Track line */}
        <div className="absolute top-[15px] sm:top-[20px] left-[10%] right-[10%] h-1.5 sm:h-2 bg-gray-200/80 dark:bg-gray-700 rounded-full shadow-inner">
          <motion.div
            className={`h-full rounded-full relative ${
              isNoShow || isExpired
                ? 'bg-gradient-to-r from-red-400 via-red-500 to-red-600 shadow-[0_1px_3px_rgba(239,68,68,0.4)]'
                : 'bg-gradient-to-r from-green-400 via-green-500 to-emerald-500 shadow-[0_1px_3px_rgba(34,197,94,0.4)]'
            }`}
            initial={{ width: '0%' }}
            animate={{ width: progressWidth }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Shimmer */}
            {!isNoShow && !isExpired && (
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
            </div>
            )}
            {/* Arrow tip */}
            {!isNoShow && !isExpired && progressWidth !== '100%' && progressWidth !== '0%' && (
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
        <div className="relative grid grid-cols-5">
          {steps.map((step, index) => (
            <div key={step.name} className="flex flex-col items-center min-w-0">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
                className={`
                  w-8 h-8 sm:w-11 sm:h-11 rounded-full flex items-center justify-center z-10 relative
                  transition-shadow duration-300
                  ${step.complete
                    ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-[0_2px_8px_rgba(34,197,94,0.4)] ring-2 ring-green-200/50 dark:ring-green-800/50'
                    : step.error
                    ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-[0_2px_8px_rgba(239,68,68,0.3)]'
                    : step.active
                    ? 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-[0_2px_8px_rgba(245,158,11,0.4)] ring-2 ring-yellow-200/50 dark:ring-yellow-800/50'
                    : 'bg-gray-200 dark:bg-gray-600 shadow-inner'}
                `}
              >
                {step.complete ? (
                  <IoCheckmarkCircle className="w-5 h-5 sm:w-7 sm:h-7 text-white drop-shadow-sm" />
                ) : step.error ? (
                  <IoCloseCircle className="w-5 h-5 sm:w-7 sm:h-7 text-white drop-shadow-sm" />
                ) : step.active ? (
                  <IoHourglassOutline className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-sm animate-spin" />
                ) : (
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white/80 rounded-full shadow-inner" />
                )}
                {(step.complete || step.active) && (
                  <div className="absolute top-0.5 left-1.5 right-1.5 h-3 sm:h-4 rounded-full bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                )}
              </motion.div>

              <div className="mt-1.5 sm:mt-2 text-center">
                <p className={`text-[10px] sm:text-xs font-semibold tracking-wide ${
                  step.complete ? 'text-green-700 dark:text-green-400' :
                  step.error ? 'text-red-700 dark:text-red-400' :
                  step.active ? 'text-amber-700 dark:text-amber-400' :
                  'text-gray-400 dark:text-gray-500'
                }`}>
                  {step.name}
                </p>
                <p className={`text-[9px] sm:text-[11px] mt-0.5 leading-tight ${
                  step.complete || step.active ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
