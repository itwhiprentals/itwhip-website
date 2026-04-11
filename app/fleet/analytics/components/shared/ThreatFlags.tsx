// app/fleet/analytics/components/shared/ThreatFlags.tsx
// Inline badges for VPN/Proxy/Tor/Datacenter flags

'use client'

interface ThreatFlagsProps {
  isVpn: boolean
  isProxy: boolean
  isTor: boolean
  isHosting: boolean
  compact?: boolean
}

const FLAG_STYLES = {
  vpn: 'bg-orange-100 text-orange-700',
  proxy: 'bg-yellow-100 text-yellow-700',
  tor: 'bg-red-100 text-red-700',
  hosting: 'bg-purple-100 text-purple-700',
} as const

export default function ThreatFlags({ isVpn, isProxy, isTor, isHosting, compact = false }: ThreatFlagsProps) {
  const flags = [
    isVpn && { key: 'vpn', label: compact ? 'V' : 'VPN', style: FLAG_STYLES.vpn },
    isProxy && { key: 'proxy', label: compact ? 'P' : 'Proxy', style: FLAG_STYLES.proxy },
    isTor && { key: 'tor', label: compact ? 'T' : 'Tor', style: FLAG_STYLES.tor },
    isHosting && { key: 'hosting', label: compact ? 'DC' : 'Datacenter', style: FLAG_STYLES.hosting },
  ].filter(Boolean) as { key: string; label: string; style: string }[]

  if (flags.length === 0) return null

  return (
    <span className="inline-flex items-center gap-1">
      {flags.map(f => (
        <span key={f.key} className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${f.style}`}>
          {f.label}
        </span>
      ))}
    </span>
  )
}
