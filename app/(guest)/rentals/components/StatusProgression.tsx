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
}

export default function StatusProgression({
  status,
  tripStatus,
  tripStartedAt,
  tripEndedAt,
  verificationStatus,
  paymentStatus,
  documentsSubmittedAt,
  reviewedAt
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
  
  const steps = [
    { 
      name: 'Booked', 
      complete: isBooked,
      active: !isVerified && !isCancelled,
      description: documentsSubmittedAt ? 'Documents submitted' : 'Awaiting documents'
    },
    { 
      name: 'Verified', 
      complete: isVerified,
      active: isVerified && !wasConfirmed && !paymentFailed && !isCancelled && !hasPendingCharges,
      description: isVerified ? 'Documents approved' : 'Under review',
      error: paymentFailed
    },
    { 
      name: hasPendingCharges ? 'Charges' : 'Confirmed', 
      complete: isConfirmed && !hasPendingCharges,
      active: hasPendingCharges || (isConfirmed && !isActive),
      description: hasPendingCharges ? 'Processing final charges' : 
                   isConfirmed ? 'Payment successful' : 
                   paymentFailed ? 'Payment failed' : 'Processing payment',
      error: paymentFailed
    },
    { 
      name: 'Active', 
      complete: isActive,
      active: isActive && !isCompleted,
      description: isActive ? 'Trip in progress' : 'Ready for pickup'
    },
    { 
      name: 'Completed', 
      complete: isCompleted,
      active: false,
      description: isCompleted ? 'Trip finished' : 'Not started'
    }
  ]
  
  // Handle cancelled state
  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <IoCloseCircle className="w-8 h-8 text-red-500 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-red-900">Booking Cancelled</h3>
            <p className="text-sm text-red-700 mt-1">This booking has been cancelled and is no longer active.</p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Booking Status</h2>
        {paymentFailed && !hasPendingCharges && (
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
      
      {/* Progress Bar */}
      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
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
                  ${step.complete ? 'bg-green-500' : 
                    step.active ? 'bg-yellow-500 animate-pulse' : 
                    step.error ? 'bg-red-500' : 'bg-gray-300'}
                `}
              >
                {step.complete ? (
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
                  step.complete || step.active ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 hidden sm:block max-w-[100px]">
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
                    <p className="text-sm font-medium text-amber-900">Processing Final Charges</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Your trip has ended. We're calculating final charges for mileage, fuel, or any additional fees. 
                      You'll receive an email with the detailed breakdown shortly.
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
                    <p className="text-sm font-medium text-gray-900">Trip Completed</p>
                    <p className="text-xs text-gray-700 mt-1">
                      Thank you for choosing ItWhip! We hope you enjoyed your rental experience.
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
                    <p className="text-sm font-medium text-blue-900">Trip Active</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Your rental is currently active. Drive safely and enjoy your trip!
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
                    <p className="text-sm font-medium text-green-900">Booking Confirmed</p>
                    <p className="text-xs text-green-700 mt-1">
                      Your booking is confirmed and payment has been processed. You'll receive pickup instructions 24 hours before your trip.
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
                    <p className="text-sm font-medium text-red-900">Payment Failed - Action Required</p>
                    <p className="text-xs text-red-700 mt-1">
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
          
          return null
        })()}
      </div>
    </div>
  )
}