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
}

export default function VerificationProgress({
  documentsVerified,
  emailVerified,
  phoneVerified,
  insuranceVerified,
  fullyVerified,
  email,
  phone
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 mt-4">
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
        <div className={`flex items-center gap-3 p-3 rounded-lg border ${
          emailComplete
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
        }`}>
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
        </div>

        {/* Phone Verification */}
        <div className={`flex items-center gap-3 p-3 rounded-lg border ${
          phoneComplete
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
        }`}>
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
        </div>

        {/* Documents Verification */}
        <div className={`flex items-center gap-3 p-3 rounded-lg border ${
          documentsVerified 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
        }`}>
          {documentsVerified ? (
            <IoCheckmarkCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          ) : (
            <IoTimeOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">ID Documents</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {documentsVerified ? 'Verified' : 'Required - Upload in Documents tab'}
            </p>
          </div>
        </div>

        {/* Insurance Verification (Optional) */}
        <div className={`flex items-center gap-3 p-3 rounded-lg border ${
          insuranceVerified 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        }`}>
          {insuranceVerified ? (
            <IoCheckmarkCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          ) : (
            <IoTimeOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Insurance</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {insuranceVerified ? 'Verified - Lower deposit' : 'Optional - Save 50% on deposit'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Banner */}
      {!fullyVerified && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start gap-3">
            <IoRocketOutline className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-green-900 dark:text-green-100 font-medium mb-1">
                {!documentsVerified 
                  ? 'Upload your ID to complete verification!'
                  : !hasPhone
                  ? 'Add your phone number to complete verification!'
                  : 'Almost there! Complete verification to unlock instant booking.'
                }
              </p>
              <p className="text-xs text-green-800 dark:text-green-300">
                Verified guests get priority access, lower deposits, and faster checkout.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}