// app/fleet/analytics/components/VisitorProfile/VisitorCard.tsx
// IP, ISP, ASN, threat flags, risk score — the visitor's identity

'use client'

import { EnrichedVisitor } from '../shared/types'
import RiskBadge from '../shared/RiskBadge'
import ThreatFlags from '../shared/ThreatFlags'
import IpDisplay from '../shared/IpDisplay'
import TimeAgo from '../shared/TimeAgo'

interface VisitorCardProps {
  visitor: EnrichedVisitor
}

export default function VisitorCard({ visitor }: VisitorCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <IpDisplay ip={visitor.ip} masked={false} />
            <ThreatFlags isVpn={visitor.isVpn} isProxy={visitor.isProxy} isTor={visitor.isTor} isHosting={visitor.isHosting} />
          </div>
          <p className="text-xs text-gray-400 mt-1 font-mono">{visitor.visitorId}</p>
        </div>
        <RiskBadge score={visitor.riskScore} />
      </div>

      {/* Physical address */}
      {(visitor as any).address && (
        <div className="mt-3 px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Approximate Address</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{(visitor as any).address}</p>
          {(visitor as any).latitude && (
            <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
              {(visitor as any).latitude?.toFixed(4)}, {(visitor as any).longitude?.toFixed(4)}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
        <InfoCell label="ISP" value={visitor.isp} />
        <InfoCell label="ASN" value={visitor.asn} />
        <InfoCell label="Organization" value={visitor.org} />
        <InfoCell label="Location" value={[visitor.city, visitor.region, visitor.country].filter(Boolean).join(', ')} />
        <InfoCell label="Device" value={visitor.device} />
        <InfoCell label="Browser" value={visitor.browser} />
        <InfoCell label="Total Pages" value={String(visitor.pageCount)} />
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Active</p>
          <div className="mt-0.5">
            <TimeAgo timestamp={visitor.firstSeen} showFull /> → <TimeAgo timestamp={visitor.lastSeen} showFull />
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoCell({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5 truncate">{value || '-'}</p>
    </div>
  )
}
