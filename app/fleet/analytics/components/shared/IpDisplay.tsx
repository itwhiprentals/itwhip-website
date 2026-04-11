// app/fleet/analytics/components/shared/IpDisplay.tsx
// Masked IP display for privacy (172.56.xx.xx)

'use client'

interface IpDisplayProps {
  ip: string | null
  masked?: boolean
}

export default function IpDisplay({ ip, masked = true }: IpDisplayProps) {
  if (!ip) return <span className="text-gray-400">-</span>

  const display = masked ? maskIp(ip) : ip

  return (
    <span className="font-mono text-xs text-gray-600">{display}</span>
  )
}

function maskIp(ip: string): string {
  const parts = ip.split('.')
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.xx.xx`
  }
  // IPv6 or other — show first segment
  if (ip.includes(':')) {
    const segments = ip.split(':')
    return `${segments[0]}:${segments[1]}:xxxx`
  }
  return ip
}
