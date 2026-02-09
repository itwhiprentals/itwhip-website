// app/fleet/verifications/components/VerificationStatusBanner.tsx
// Combined status banner showing Claude AI + Stripe Identity at a glance
'use client'

import {
  IoCheckmarkCircle,
  IoWarningOutline,
  IoRemoveCircleOutline,
  IoSearchOutline,
} from 'react-icons/io5'

interface VerificationStatusBannerProps {
  aiScore: number | null
  aiPassed: boolean | null
  stripeVerified: boolean
  stripeStatus: string | null
  hasAccount: boolean  // whether guest has a ReviewerProfile
}

export default function VerificationStatusBanner({
  aiScore, aiPassed, stripeVerified, stripeStatus, hasAccount,
}: VerificationStatusBannerProps) {
  // Determine combined status
  const bothPass = aiPassed && stripeVerified
  const aiOnly = aiPassed && !stripeVerified
  const stripeOnly = !aiPassed && stripeVerified
  const needsReview = aiScore !== null && !aiPassed && aiScore >= 60
  const aiFailed = aiScore !== null && aiScore < 60

  let bgColor: string
  let icon: React.ReactNode
  let label: string

  if (bothPass) {
    bgColor = 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    icon = <IoCheckmarkCircle className="text-green-600 w-5 h-5" />
    label = 'Both Verified — Ready to Approve'
  } else if (aiOnly) {
    bgColor = 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    icon = <IoCheckmarkCircle className="text-green-600 w-5 h-5" />
    label = 'AI Passed — Ready to Approve'
  } else if (stripeOnly) {
    bgColor = 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    icon = <IoCheckmarkCircle className="text-blue-600 w-5 h-5" />
    label = 'Stripe Verified — AI Pending'
  } else if (needsReview) {
    bgColor = 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    icon = <IoSearchOutline className="text-yellow-600 w-5 h-5" />
    label = 'Manual Review Required'
  } else if (aiFailed) {
    bgColor = 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    icon = <IoWarningOutline className="text-red-600 w-5 h-5" />
    label = 'AI Flagged — Review Carefully'
  } else {
    bgColor = 'bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700'
    icon = <IoRemoveCircleOutline className="text-gray-400 w-5 h-5" />
    label = 'Awaiting Verification'
  }

  return (
    <div className={`rounded-lg border p-3 ${bgColor}`}>
      <div className="flex items-center gap-6 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-gray-900 dark:text-white">{label}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-gray-500">Claude AI:</span>
          {aiScore !== null ? (
            <span className={`font-medium ${aiPassed ? 'text-green-700' : aiScore >= 60 ? 'text-yellow-700' : 'text-red-700'}`}>
              {aiPassed ? 'Pass' : aiScore >= 60 ? 'Review' : 'Fail'} ({aiScore})
            </span>
          ) : (
            <span className="text-gray-400">Not run</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-gray-500">Stripe:</span>
          {stripeVerified ? (
            <span className="font-medium text-blue-700">Verified</span>
          ) : hasAccount ? (
            <span className="text-gray-400">{stripeStatus || 'Not started'}</span>
          ) : (
            <span className="text-gray-400">No account</span>
          )}
        </div>
      </div>
    </div>
  )
}
