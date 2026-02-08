// app/fleet/choe/components/OutcomeBadge.tsx

'use client'

import { OUTCOME_COLORS } from '../constants'

interface OutcomeBadgeProps {
  outcome: string | null
}

export default function OutcomeBadge({ outcome }: OutcomeBadgeProps) {
  if (!outcome) return <span className="text-xs text-gray-400">In Progress</span>

  const colors = OUTCOME_COLORS[outcome as keyof typeof OUTCOME_COLORS] || OUTCOME_COLORS.ABANDONED

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${colors.bg} ${colors.text}`}>
      {outcome.charAt(0) + outcome.slice(1).toLowerCase()}
    </span>
  )
}
