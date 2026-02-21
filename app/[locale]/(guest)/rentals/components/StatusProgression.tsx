// app/(guest)/rentals/components/StatusProgression.tsx
'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoHourglassOutline,
  IoAlertCircle,
  IoCloseOutline,
  IoCreateOutline,
  IoDocumentTextOutline
} from 'react-icons/io5'

interface StatusProgressionProps {
  status: string
  tripStatus?: string
  tripStartedAt?: string | Date | null
  tripEndedAt?: string | Date | null
  verificationStatus: string
  paymentStatus: string
  documentsSubmittedAt?: string
  reviewedAt?: string
  handoffStatus?: string | null
  onCancel?: () => void
  onModify?: () => void
  onViewAgreement?: () => void
  hideStatusMessage?: boolean
  hideTitle?: boolean
}

export default function StatusProgression({
  status,
  tripStatus,
  tripStartedAt,
  tripEndedAt,
  verificationStatus,
  paymentStatus,
  documentsSubmittedAt,
  reviewedAt,
  handoffStatus,
  onCancel,
  onModify,
  onViewAgreement,
  hideStatusMessage,
  hideTitle
}: StatusProgressionProps) {
  const t = useTranslations('StatusProgression')

  // Determine which steps are complete - FIXED case sensitivity
  const isBooked = true // Always true if viewing
  const vsLower = verificationStatus?.toLowerCase()
  const isVerified = vsLower === 'approved' ||
                    vsLower === 'verified' ||
                    vsLower === 'completed' ||
                    vsLower === 'pending_charges' ||
                    vsLower === 'dispute_review'
  const paymentSuccessful = paymentStatus?.toLowerCase() === 'paid' ||
                           paymentStatus?.toLowerCase() === 'captured' ||
                           paymentStatus === 'PAID' ||
                           paymentStatus === 'CAPTURED'
  const isConfirmed = paymentSuccessful && (status === 'CONFIRMED' || status === 'ACTIVE' || status === 'COMPLETED')
  // Check trip status for Active state
  const isActive = status === 'ACTIVE' || tripStatus === 'ACTIVE' || !!tripStartedAt
  const isCompleted = status === 'COMPLETED' || tripStatus === 'COMPLETED' || !!tripEndedAt
  const isHandoffDone = handoffStatus === 'HANDOFF_COMPLETE' || handoffStatus === 'BYPASSED'
  const isOnHold = status === 'ON_HOLD'
  
  // Check for special states - FIXED case sensitivity
  const isCancelled = status === 'CANCELLED'
  const paymentFailed = isVerified && (paymentStatus?.toLowerCase() === 'failed' || paymentStatus === 'FAILED')
  
  // NEW: Check for post-trip pending charges
  const hasPendingCharges = isCompleted && status === 'PENDING'
  const wasConfirmed = isConfirmed || isActive || isCompleted // Was ever confirmed
  
  const steps = [
    {
      name: t('stepBooked'),
      complete: isBooked,
      active: !isVerified && !isCancelled,
      description: documentsSubmittedAt ? t('docsSubmitted') : t('awaitingDocs')
    },
    {
      name: isOnHold ? t('stepStripe') : t('stepVerified'),
      complete: isVerified && !isOnHold,
      active: isOnHold || (isVerified && !wasConfirmed && !paymentFailed && !isCancelled && !hasPendingCharges),
      description: isOnHold ? t('verificationRequired') : isVerified ? t('documentsApproved') : t('underReview'),
      error: paymentFailed
    },
    {
      name: isOnHold ? t('stepOnHold') : hasPendingCharges ? t('stepCharges') : t('stepConfirmed'),
      complete: isConfirmed && !hasPendingCharges && !isOnHold,
      active: false,
      description: isOnHold ? t('awaitingDocs') :
                   hasPendingCharges ? t('processingFinalCharges') :
                   (isConfirmed && isHandoffDone) ? t('handoffComplete') :
                   isConfirmed ? t('paymentSuccessful') :
                   paymentFailed ? t('paymentFailed') : t('processingPayment'),
      error: isOnHold || paymentFailed
    },
    {
      name: t('stepActive'),
      complete: isActive,
      active: isActive && !isCompleted,
      description: isActive ? t('tripInProgress') : t('readyForPickup')
    },
    {
      name: t('stepCompleted'),
      complete: isCompleted,
      active: false,
      description: isCompleted ? t('tripFinished') : t('notStarted')
    }
  ]
  
  // Handle cancelled state
  if (isCancelled) {
    return (
      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center">
          <IoCloseCircle className="w-8 h-8 text-red-500 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-200">{t('bookingCancelled')}</h3>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">{t('bookingCancelledDesc')}</p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg shadow ${hideTitle ? 'p-4' : 'p-6'}`}>
      <div className={`flex items-center justify-between ${hideTitle ? 'mb-1' : 'mb-6'}`}>
        {!hideTitle && (
          <h2 className={`text-lg font-semibold ${isOnHold ? 'text-red-600 dark:text-red-400 w-full text-center' : 'text-gray-900 dark:text-gray-100'}`}>
            {isOnHold ? t('onHoldTitle') : t('bookingStatus')}
          </h2>
        )}
        {paymentFailed && !hasPendingCharges && (
          <span className="flex items-center text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-3 py-1 rounded-full">
            <IoAlertCircle className="w-4 h-4 mr-1" />
            {t('paymentRequired')}
          </span>
        )}
        {hasPendingCharges && (
          <span className="flex items-center text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-3 py-1 rounded-full">
            <IoHourglassOutline className="w-4 h-4 mr-1" />
            {t('chargesPending')}
          </span>
        )}
      </div>
      
      {/* Progress Bar with Arrow */}
      <div className="relative -mx-4 sm:-mx-5">
        {/* Track line — gray base with gradient green fill + arrow tip */}
        <div className="absolute top-[15px] sm:top-[20px] left-[10%] right-[10%] h-1.5 sm:h-2 bg-gray-200/80 dark:bg-gray-700 rounded-full shadow-inner">
          {/* Green gradient filled portion */}
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 via-green-500 to-emerald-500 rounded-full relative shadow-[0_1px_3px_rgba(34,197,94,0.4)]"
            initial={{ width: '0%' }}
            animate={{
              width: isOnHold ? '35%' :
                     isCompleted ? '100%' :
                     isActive ? '85%' :
                     (isConfirmed && isHandoffDone) ? '73%' :
                     isConfirmed ? '60%' :
                     isVerified ? '35%' : '0%'
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Shimmer effect on the bar */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
            </div>
            {/* Arrow at the leading edge */}
            {!isCompleted && (isVerified || isConfirmed || isActive || isOnHold) && (
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
                    : step.active
                    ? 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-[0_2px_8px_rgba(245,158,11,0.4)] ring-2 ring-yellow-200/50 dark:ring-yellow-800/50'
                    : step.error
                    ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-[0_2px_8px_rgba(239,68,68,0.3)]'
                    : 'bg-gray-200 dark:bg-gray-600 shadow-inner'}
                `}
              >
                {step.complete ? (
                  <IoCheckmarkCircle className="w-5 h-5 sm:w-7 sm:h-7 text-white drop-shadow-sm" />
                ) : step.active ? (
                  <IoHourglassOutline className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-sm animate-spin" />
                ) : step.error ? (
                  <IoCloseCircle className="w-5 h-5 sm:w-7 sm:h-7 text-white drop-shadow-sm" />
                ) : (
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white/80 rounded-full shadow-inner" />
                )}
                {/* Glossy highlight on circles */}
                {(step.complete || step.active) && (
                  <div className="absolute top-0.5 left-1.5 right-1.5 h-3 sm:h-4 rounded-full bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                )}
              </motion.div>

              <div className="mt-1.5 sm:mt-2 text-center">
                <p className={`text-[10px] sm:text-xs font-semibold tracking-wide ${
                  step.complete ? 'text-green-700 dark:text-green-400' :
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
      
      {/* Status Messages - FIXED with mutually exclusive conditions */}
      {!hideStatusMessage && !isOnHold && (<div className="mt-6 pt-6 border-t dark:border-gray-800 space-y-4">
        {(() => {
          // Priority order for status messages
          if (hasPendingCharges) {
            return (
              <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start">
                  <IoHourglassOutline className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{t('processingFinalChargesTitle')}</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                      {t('processingFinalChargesDesc')}
                    </p>
                  </div>
                </div>
              </div>
            )
          }

          if (isOnHold) {
            return (
              <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start">
                  <IoAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900 dark:text-red-200">{t('onHoldTitle')}</p>
                    <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                      {t('onHoldDesc')}
                    </p>
                  </div>
                </div>
              </div>
            )
          }

          if (isCompleted && !hasPendingCharges) {
            return (
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start">
                  <IoCheckmarkCircle className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('tripCompleted')}</p>
                    <p className="text-xs text-gray-700 dark:text-gray-400 mt-1">
                      {t('tripCompletedDesc')}
                    </p>
                  </div>
                </div>
              </div>
            )
          }

          if (isActive && !isCompleted) {
            return (
              <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start">
                  <IoCheckmarkCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200">{t('tripActive')}</p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                      {t('tripActiveDesc')}
                    </p>
                  </div>
                </div>
              </div>
            )
          }

          if (isConfirmed && !isActive) {
            return (
              <div className="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start">
                  <IoCheckmarkCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-200">{t('bookingConfirmed')}</p>
                    <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                      {t('bookingConfirmedDesc')}
                    </p>
                  </div>
                </div>
              </div>
            )
          }

          if (paymentFailed) {
            return (
              <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start">
                  <IoAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900 dark:text-red-200">{t('paymentFailedTitle')}</p>
                    <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                      {t('paymentFailedDesc')}
                    </p>
                    <button className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                      {t('updatePaymentMethod')}
                    </button>
                  </div>
                </div>
              </div>
            )
          }
          
          return null
        })()}

        {/* Action Buttons */}
        {(onCancel || onModify || onViewAgreement) && (
          <div className="grid grid-cols-3 gap-2 pt-2">
            {onCancel && (
              <button
                onClick={onCancel}
                className="flex items-center justify-center gap-1.5 px-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
              >
                <IoCloseOutline className="w-3.5 h-3.5" />
                <span>{t('cancel')}</span>
              </button>
            )}
            {onModify && (
              <button
                onClick={onModify}
                className="flex items-center justify-center gap-1.5 px-2 py-2 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium"
              >
                <IoCreateOutline className="w-3.5 h-3.5" />
                <span>{t('modify')}</span>
              </button>
            )}
            {onViewAgreement && (
              <button
                onClick={onViewAgreement}
                className="flex items-center justify-center gap-1.5 px-2 py-2 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium"
              >
                <IoDocumentTextOutline className="w-3.5 h-3.5" />
                <span>{t('agreement')}</span>
              </button>
            )}
          </div>
        )}
      </div>)}
    </div>
  )
}