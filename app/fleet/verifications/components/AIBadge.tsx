// app/fleet/verifications/components/AIBadge.tsx
'use client'

interface AIBadgeProps {
  aiScore: number | null
  aiRecommendation: 'APPROVE' | 'REVIEW' | 'REJECT' | null
}

export default function AIBadge({ aiScore, aiRecommendation }: AIBadgeProps) {
  if (aiScore === null) {
    return (
      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">
        No AI
      </span>
    )
  }

  const color =
    aiRecommendation === 'APPROVE'
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      : aiRecommendation === 'REVIEW'
        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${color}`}>
      AI: {aiScore} — {aiRecommendation}
    </span>
  )
}
