// app/fleet/choe/components/SeverityBadge.tsx

'use client'

import { SEVERITY_COLORS } from '../constants'

interface SeverityBadgeProps {
  severity: string
}

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const colors = SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.INFO

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded flex items-center gap-1 ${colors.bg} ${colors.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {severity}
    </span>
  )
}
