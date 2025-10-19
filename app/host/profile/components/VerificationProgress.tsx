// app/host/profile/components/VerificationProgress.tsx
'use client'

import { IoCheckmarkCircleOutline } from 'react-icons/io5'

interface VerificationProgressProps {
  isApproved: boolean
  isPending: boolean
  areAllDocsApproved: boolean
}

export default function VerificationProgress({
  isApproved,
  isPending,
  areAllDocsApproved
}: VerificationProgressProps) {
  // Don't show banner if approved or suspended
  if (isApproved || !isPending) {
    return null
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
      <h3 className="text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 sm:mb-4">
        Complete Your Verification
      </h3>
      
      <div className="space-y-2 sm:space-y-3">
        {/* Step 1: Profile Created - Always completed */}
        <div className="flex items-start gap-3">
          <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Profile Created
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Your basic information is set up
            </p>
          </div>
        </div>

        {/* Step 2: Upload Documents */}
        <div className="flex items-start gap-3">
          {areAllDocsApproved ? (
            <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-blue-400 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Upload Documents
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Government ID, Driver's License, Insurance
            </p>
          </div>
        </div>

        {/* Step 3: Background Check */}
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Background Check
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Completed after document approval (2-3 days)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}