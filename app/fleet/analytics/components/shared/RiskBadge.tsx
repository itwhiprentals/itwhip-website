// app/fleet/analytics/components/shared/RiskBadge.tsx
// Color-coded risk score badge (green/yellow/red)

'use client'

import { getRiskBgColor, getRiskLabel } from './types'

interface RiskBadgeProps {
  score: number
  showLabel?: boolean
}

export default function RiskBadge({ score, showLabel = true }: RiskBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getRiskBgColor(score)}`}>
      {score}
      {showLabel && <span className="opacity-75">({getRiskLabel(score)})</span>}
    </span>
  )
}
