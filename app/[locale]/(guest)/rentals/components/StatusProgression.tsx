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
  onCancel?: () => void
  onModify?: () => void
  onViewAgreement?: () => void
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
  onCancel,
  onModify,
  onViewAgreement
}: StatusProgressionProps) {
  const t = useTranslations('StatusProgression')

  // Determine which steps are complete - FIXED case sensitivity
  const isBooked = true // Always true if viewing
  const isVerified = verificationStatus?.toLowerCase() === 'approved' || 
                    verificationStatus?.toLowerCase() === 'verified' || 
                    verificationStatus === 'APPROVED' || 
                    verificationStatus === 'VERIFIED'
  const isConfirmed = status === 'CONFIRMED' && 
                     (paymentStatus?.toLowerCase() === 'paid' || 
                      paymentStatus?.toLowerCase() === 'captured' ||
                      paymentStatus === 'PAID' ||
                      paymentStatus === 'CAPTURED')
  // Check trip status for Active state
  const isActive = status === 'ACTIVE' || tripStatus === 'ACTIVE' || !!tripStartedAt
  const isCompleted = status === 'COMPLETED' || tripStatus === 'COMPLETED' || !!tripEndedAt
  
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
      name: t('stepVerified'),
      complete: isVerified,
      active: isVerified && !wasConfirmed && !paymentFailed && !isCancelled && !hasPendingCharges,
      description: isVerified ? t('documentsApproved') : t('underReview'),
      error: paymentFailed
    },
    {
      name: hasPendingCharges ? t('stepCharges') : t('stepConfirmed'),
      complete: isConfirmed && !hasPendingCharges,
      active: hasPendingCharges || (isConfirmed && !isActive),
      description: hasPendingCharges ? t('processingFinalCharges') :
                   isConfirmed ? t('paymentSuccessful') :
                   paymentFailed ? t('paymentFailed') : t('processingPayment'),
      error: paymentFailed
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <IoCloseCircle className="w-8 h-8 text-red-500 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-red-900">{t('bookingCancelled')}</h3>
            <p className="text-sm text-red-700 mt-1">{t('bookingCancelledDesc')}</p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">{t('bookingStatus')}</h2>
        {paymentFailed && !hasPendingCharges && (
          <span className="flex items-center text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
            <IoAlertCircle className="w-4 h-4 mr-1" />
            {t('paymentRequired')}
          </span>
        )}
        {hasPendingCharges && (
          <span className="flex items-center text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            <IoHourglassOutline className="w-4 h-4 mr-1" />
            {t('chargesPending')}
          </span>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="relative -mx-4 sm:-mx-5">
        <div className="absolute top-3.5 sm:top-5 left-[10%] right-[10%] h-0.5 bg-gray-200">
          <motion.div
            className="h-full bg-green-500"
            initial={{ width: '0%' }}
            animate={{
              width: isCompleted ? '100%' :
                     isActive ? '75%' :
                     isConfirmed ? '50%' :
                     isVerified ? '25%' : '0%'
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>

        {/* Steps - grid: half-width first/last columns for equal 25% circle spacing */}
        <div className="relative grid grid-cols-5">
          {steps.map((step, index) => (
            <div key={step.name} className="flex flex-col items-center min-w-0">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center z-10 relative
                  ${step.complete ? 'bg-green-500' :
                    step.active ? 'bg-yellow-500 animate-pulse' :
                    step.error ? 'bg-red-500' : 'bg-gray-300'}
                `}
              >
                {step.complete ? (
                  <IoCheckmarkCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                ) : step.active ? (
                  <IoHourglassOutline className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white animate-spin" />
                ) : step.error ? (
                  <IoCloseCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                ) : (
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full" />
                )}
              </motion.div>

              <div className="mt-1.5 sm:mt-2 text-center">
                <p className={`text-[10px] sm:text-sm font-medium ${
                  step.complete || step.active ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.name}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 leading-tight">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Status Messages - FIXED with mutually exclusive conditions */}
      <div className="mt-6 pt-6 border-t space-y-4">
        {(() => {
          // Priority order for status messages
          if (hasPendingCharges) {
            return (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                  <IoHourglassOutline className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">{t('processingFinalChargesTitle')}</p>
                    <p className="text-xs text-amber-700 mt-1">
                      {t('processingFinalChargesDesc')}
                    </p>
                  </div>
                </div>
              </div>
            )
          }
          
          if (isCompleted && !hasPendingCharges) {
            return (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start">
                  <IoCheckmarkCircle className="w-5 h-5 text-gray-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t('tripCompleted')}</p>
                    <p className="text-xs text-gray-700 mt-1">
                      {t('tripCompletedDesc')}
                    </p>
                  </div>
                </div>
              </div>
            )
          }
          
          if (isActive && !isCompleted) {
            return (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <IoCheckmarkCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">{t('tripActive')}</p>
                    <p className="text-xs text-blue-700 mt-1">
                      {t('tripActiveDesc')}
                    </p>
                  </div>
                </div>
              </div>
            )
          }
          
          if (isConfirmed && !isActive) {
            return (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <IoCheckmarkCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">{t('bookingConfirmed')}</p>
                    <p className="text-xs text-green-700 mt-1">
                      {t('bookingConfirmedDesc')}
                    </p>
                  </div>
                </div>
              </div>
            )
          }
          
          if (paymentFailed) {
            return (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <IoAlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">{t('paymentFailedTitle')}</p>
                    <p className="text-xs text-red-700 mt-1">
                      {t('paymentFailedDesc')}
                    </p>
                    <button className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700">
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
                className="flex items-center justify-center gap-1.5 px-2 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
              >
                <IoCreateOutline className="w-3.5 h-3.5" />
                <span>{t('modify')}</span>
              </button>
            )}
            {onViewAgreement && (
              <button
                onClick={onViewAgreement}
                className="flex items-center justify-center gap-1.5 px-2 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
              >
                <IoDocumentTextOutline className="w-3.5 h-3.5" />
                <span>{t('agreement')}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}