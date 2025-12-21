// app/(guest)/profile/components/VerificationProgress.tsx
'use client'

import { IoCheckmarkCircle, IoCloseCircle, IoTimeOutline, IoRocketOutline, IoMailOutline, IoPhonePortraitOutline } from 'react-icons/io5'

interface VerificationProgressProps {
  documentsVerified: boolean
  emailVerified: boolean
  phoneVerified: boolean
  insuranceVerified: boolean
  fullyVerified: boolean
  email?: string | null
  phone?: string | null
  onTabChange?: (tab: string) => void
}

export default function VerificationProgress({
  documentsVerified,
  emailVerified,
  phoneVerified,
  insuranceVerified,
  fullyVerified,
  email,
  phone,
  onTabChange
}: VerificationProgressProps) {
  
  // Email/phone are considered "provided" if they exist, even if not formally verified
  const hasEmail = !!email
  const hasPhone = !!phone
  
  // Calculate verification percentage
  // For email/phone: if provided, count as verified (most users provide these on signup)
  const emailComplete = emailVerified || hasEmail
  const phoneComplete = phoneVerified || hasPhone
  
  const requiredChecks = [emailComplete, phoneComplete, documentsVerified]
  const completedRequired = requiredChecks.filter(Boolean).length
  const totalRequired = requiredChecks.length
  const percentageRequired = Math.round((completedRequired / totalRequired) * 100)
  
  // Insurance is optional but adds to overall trust
  const totalChecks = insuranceVerified ? 4 : 3
  const completedTotal = completedRequired + (insuranceVerified ? 1 : 0)
  const percentageTotal = Math.round((completedTotal / totalChecks) * 100)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-gray-300 dark:border-gray-600 p-3 sm:p-4 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Verification Status
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {fullyVerified 
              ? 'You are fully verified and can instant book!' 
              : `Complete verification to unlock instant booking (${completedRequired}/${totalRequired} required)`
            }
          </p>
        </div>
        {fullyVerified && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-lg">
            <IoCheckmarkCircle className="w-5 h-5" />
            <span className="font-medium text-sm">Verified</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Overall Progress
          </span>
          <span className="text-sm font-bold text-green-600 dark:text-green-400">
            {percentageTotal}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              fullyVerified 
                ? 'bg-green-500' 
                : 'bg-green-600'
            }`}
            style={{ width: `${percentageTotal}%` }}
          />
        </div>
      </div>

      {/* Verification Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Email Verification */}
        <button
          onClick={() => onTabChange?.('profile')}
          className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all hover:shadow-md active:scale-[0.98] cursor-pointer ${
            emailComplete
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700'
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 hover:border-yellow-300 dark:hover:border-yellow-700'
          }`}
        >
          {emailComplete ? (
            <IoCheckmarkCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          ) : (
            <IoMailOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Email {emailVerified ? 'Verified' : hasEmail ? 'Provided' : 'Required'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {emailVerified ? 'Fully verified' : hasEmail ? 'Using account email' : 'Add email to profile'}
            </p>
          </div>
        </button>

        {/* Phone Verification */}
        <button
          onClick={() => onTabChange?.('profile')}
          className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all hover:shadow-md active:scale-[0.98] cursor-pointer ${
            phoneComplete
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700'
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 hover:border-yellow-300 dark:hover:border-yellow-700'
          }`}
        >
          {phoneComplete ? (
            <IoCheckmarkCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          ) : (
            <IoPhonePortraitOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Phone {phoneVerified ? 'Verified' : hasPhone ? 'Provided' : 'Required'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {phoneVerified ? 'Fully verified' : hasPhone ? 'Using account phone' : 'Add phone to profile'}
            </p>
          </div>
        </button>

        {/* Driver's License Verification */}
        <button
          onClick={() => onTabChange?.('documents')}
          className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all hover:shadow-md active:scale-[0.98] cursor-pointer ${
            documentsVerified
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700'
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 hover:border-yellow-300 dark:hover:border-yellow-700'
          }`}
        >
          {documentsVerified ? (
            <IoCheckmarkCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          ) : (
            <IoTimeOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Driver's License</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {documentsVerified ? 'Verified' : 'Required - Click to upload'}
            </p>
          </div>
        </button>

        {/* Insurance Verification (Optional) */}
        <button
          onClick={() => onTabChange?.('insurance')}
          className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all hover:shadow-md active:scale-[0.98] cursor-pointer ${
            insuranceVerified
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700'
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700'
          }`}
        >
          {insuranceVerified ? (
            <IoCheckmarkCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          ) : (
            <IoTimeOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Insurance</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {insuranceVerified ? 'Verified - Lower deposit' : 'Optional - Click to add'}
            </p>
          </div>
        </button>
      </div>

      {/* Removed redundant action banner - Documents tab has its own prompts */}
    </div>
  )
}