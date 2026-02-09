// app/fleet/verifications/components/AIAnalysisPanel.tsx
// Claude AI verification summary panel for verification cards
'use client'

import Link from 'next/link'
import { IoShieldCheckmarkOutline, IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5'

interface AIAnalysisPanelProps {
  bookingId: string
  aiScore: number
  aiPassed: boolean | null
  aiCriticalFlags: number
  aiInfoFlags: number
  aiExtractedName: string | null
  aiNameMatch: boolean | null
  aiModel: string | null
  aiAt: string | null
  formatTimeAgo: (d: string | null) => string
}

export default function AIAnalysisPanel({
  bookingId, aiScore, aiPassed, aiCriticalFlags, aiInfoFlags,
  aiExtractedName, aiNameMatch, aiModel, aiAt, formatTimeAgo,
}: AIAnalysisPanelProps) {
  const bgColor = aiPassed
    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    : aiScore >= 60
      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'

  const scoreColor = aiScore >= 85
    ? 'bg-green-200 text-green-800'
    : aiScore >= 60
      ? 'bg-yellow-200 text-yellow-800'
      : 'bg-red-200 text-red-800'

  const recommendation = aiPassed
    ? 'Recommends: APPROVE'
    : aiScore >= 60
      ? 'Recommends: REVIEW'
      : 'Recommends: REJECT'

  return (
    <div className={`rounded-lg p-3 border ${bgColor}`}>
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <IoShieldCheckmarkOutline />
          Claude AI Analysis
        </h4>
        <div className="flex items-center gap-2">
          {aiModel && <span className="text-xs text-gray-400">{aiModel}</span>}
          {aiAt && <span className="text-xs text-gray-400">{formatTimeAgo(aiAt)}</span>}
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${scoreColor}`}>
          {aiScore}
        </div>
        <div className="flex-1 text-xs space-y-0.5">
          <p className="font-medium text-gray-800 dark:text-gray-200">{recommendation}</p>
          <p className="text-gray-500">
            {aiCriticalFlags} critical flags, {aiInfoFlags} info flags
          </p>
          {aiExtractedName && (
            <p className="text-gray-500">
              Name: &ldquo;{aiExtractedName}&rdquo;
              {aiNameMatch !== null && (
                aiNameMatch
                  ? <IoCheckmarkCircle className="inline ml-1 text-green-500" />
                  : <IoCloseCircle className="inline ml-1 text-red-500" />
              )}
            </p>
          )}
        </div>
        <Link
          href={`/admin/rentals/verifications/${bookingId}`}
          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Full Report
        </Link>
      </div>
    </div>
  )
}
