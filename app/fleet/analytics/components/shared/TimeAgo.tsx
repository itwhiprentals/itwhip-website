// app/fleet/analytics/components/shared/TimeAgo.tsx
// Relative timestamp display ("3m ago", "2h ago", "Apr 11, 3:45 PM")

'use client'

interface TimeAgoProps {
  timestamp: string
  showFull?: boolean
}

export default function TimeAgo({ timestamp, showFull = false }: TimeAgoProps) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  let relative: string
  if (diffMin < 1) relative = 'just now'
  else if (diffMin < 60) relative = `${diffMin}m ago`
  else if (diffHour < 24) relative = `${diffHour}h ago`
  else if (diffDay < 7) relative = `${diffDay}d ago`
  else relative = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const full = date.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })

  if (showFull) {
    return <span className="text-xs text-gray-500" title={full}>{full}</span>
  }

  return <span className="text-xs text-gray-500" title={full}>{relative}</span>
}
