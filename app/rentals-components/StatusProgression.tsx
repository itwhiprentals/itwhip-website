// app/(guest)/rentals/components/StatusProgression.tsx
'use client'

import { motion } from 'framer-motion'
import { 
  IoCheckmarkCircle, 
  IoCloseCircle, 
  IoHourglassOutline,
  IoAlertCircle 
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
  hideStatusMessage,
  hideTitle,
}: StatusProgressionProps) {
  
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
  
  // For cancelled bookings, determine how far they got before cancellation
  // Status is 'CANCELLED' so we check payment/verification/trip data instead
  const wasPaid = paymentStatus?.toLowerCase() === 'paid' || paymentStatus?.toLowerCase() === 'captured'
  const cancelledAfterStep = isCancelled
    ? (!!tripStartedAt ? 3 : wasPaid ? 2 : isVerified ? 1 : 0)
    : -1

  const steps = [
    {
      name: 'Booked',
      complete: isBooked,
      active: !isVerified && !isCancelled,
      description: documentsSubmittedAt ? 'Documents submitted' : 'Awaiting documents',
      cancelled: isCancelled && cancelledAfterStep === 0,
    },
    {
      name: 'Verified',
      complete: isVerified || (isCancelled && cancelledAfterStep >= 1),
      active: isVerified && !wasConfirmed && !paymentFailed && !isCancelled && !hasPendingCharges,
      description: isVerified ? 'Documents approved' : 'Under review',
      error: paymentFailed && !isCancelled,
      cancelled: isCancelled && cancelledAfterStep === 1,
    },
    {
      name: hasPendingCharges ? 'Charges' : 'Confirmed',
      complete: (isConfirmed && !hasPendingCharges) || (isCancelled && cancelledAfterStep >= 2),
      active: hasPendingCharges || (isConfirmed && !isActive),
      description: isCancelled && cancelledAfterStep >= 2 ? 'Payment captured' :
                   hasPendingCharges ? 'Processing final charges' :
                   isConfirmed ? 'Payment successful' :
                   paymentFailed ? 'Payment failed' : 'Processing payment',
      error: paymentFailed && !isCancelled,
      cancelled: isCancelled && cancelledAfterStep === 2,
    },
    {
      name: 'Active',
      complete: isActive || (isCancelled && cancelledAfterStep >= 3),
      active: isActive && !isCompleted && !isCancelled,
      description: isActive ? 'Trip in progress' : 'Ready for pickup',
      cancelled: isCancelled && cancelledAfterStep === 3,
    },
    {
      name: 'Completed',
      complete: isCompleted,
      active: false,
      description: isCompleted ? 'Trip finished' : 'Not started',
      cancelled: false,
    }
  ]
  
  // Progress bar width based on how far they got
  const progressWidth = isCancelled
    ? (cancelledAfterStep === 3 ? '75%' : cancelledAfterStep === 2 ? '50%' : cancelledAfterStep === 1 ? '25%' : '0%')
    : isCompleted ? '100%' : isActive ? '75%' : isConfirmed ? '50%' : isVerified ? '25%' : '0%'

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
      {!hideTitle && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Booking Status</h2>
          {isCancelled && (
            <span className="flex items-center text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-1 rounded-full">
              <IoCloseCircle className="w-4 h-4 mr-1" />
              Cancelled
            </span>
          )}
          {paymentFailed && !hasPendingCharges && !isCancelled && (
            <span className="flex items-center text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
              <IoAlertCircle className="w-4 h-4 mr-1" />
              Payment Required
            </span>
          )}
          {hasPendingCharges && (
            <span className="flex items-center text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              <IoHourglassOutline className="w-4 h-4 mr-1" />
              Charges Pending
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700">
          <motion.div
            className={`h-full ${isCancelled ? 'bg-red-400' : 'bg-green-500'}`}
            initial={{ width: '0%' }}
            animate={{ width: progressWidth }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <div key={step.name} className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center z-10 relative
                  ${step.cancelled ? 'bg-red-500 ring-2 ring-red-300' :
                    step.complete ? 'bg-green-500' :
                    step.active ? 'bg-yellow-500 animate-pulse' :
                    step.error ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}
                `}
              >
                {step.cancelled ? (
                  <IoCloseCircle className="w-6 h-6 text-white" />
                ) : step.complete ? (
                  <IoCheckmarkCircle className="w-6 h-6 text-white" />
                ) : step.active ? (
                  <IoHourglassOutline className="w-5 h-5 text-white animate-spin" />
                ) : step.error ? (
                  <IoCloseCircle className="w-6 h-6 text-white" />
                ) : (
                  <div className="w-3 h-3 bg-white rounded-full" />
                )}
              </motion.div>

              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${
                  step.cancelled ? 'text-red-600 dark:text-red-400' :
                  step.complete || step.active ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.cancelled ? 'Cancelled' : step.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block max-w-[100px]">
                  {step.cancelled ? 'Booking cancelled' : step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Messages — hidden when hideStatusMessage is true */}
      {!hideStatusMessage && (
      <div className="mt-6 pt-6 border-t dark:border-gray-700 space-y-4">
        {(() => {
          // Priority order for status messages
          if (hasPendingCharges) {
            return (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start">
                  <IoHourglassOutline className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Processing Final Charges</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                      Your trip has ended. We&apos;re calculating final charges for mileage, fuel, or any additional fees.
                      You&apos;ll receive an email with the detailed breakdown shortly.
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
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Trip Completed</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                      Thank you for choosing ItWhip! We hope you enjoyed your rental experience.
                    </p>
                  </div>
                </div>
              </div>
            )
          }

          if (isActive && !isCompleted) {
            return (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start">
                  <IoCheckmarkCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Trip Active</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Your rental is currently active. Drive safely and enjoy your trip!
                    </p>
                  </div>
                </div>
              </div>
            )
          }

          if (isConfirmed && !isActive) {
            return (
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start">
                  <IoCheckmarkCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-200">Booking Confirmed</p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      Your booking is confirmed and payment has been processed. You&apos;ll receive pickup instructions 24 hours before your trip.
                    </p>
                  </div>
                </div>
              </div>
            )
          }

          if (paymentFailed) {
            return (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start">
                  <IoAlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900 dark:text-red-200">Payment Failed - Action Required</p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                      Your documents have been verified, but payment could not be processed. Please update your payment method within 24 hours to secure your booking.
                    </p>
                    <button className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700">
                      Update Payment Method →
                    </button>
                  </div>
                </div>
              </div>
            )
          }

          if (isVerified && !isConfirmed) {
            return (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start">
                  <IoHourglassOutline className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Processing Payment</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Your documents have been verified. We&apos;re now processing your payment.
                    </p>
                  </div>
                </div>
              </div>
            )
          }

          if (!isVerified) {
            return (
              <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start">
                  <IoHourglassOutline className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">Documents Under Review</p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      We&apos;re reviewing your submitted documents. This typically takes 1-2 hours during business hours.
                    </p>
                  </div>
                </div>
              </div>
            )
          }

          return null
        })()}
      </div>
      )}
    </div>
  )
}