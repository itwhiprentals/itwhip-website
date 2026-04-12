// app/fleet/analytics/components/DeviceDrilldown/DeviceThreatSummary.tsx
'use client'

import RiskBadge from '../shared/RiskBadge'

interface DeviceThreatSummaryProps {
  data: { avgRiskScore: number; maxRiskScore: number; vpnCount: number; proxyCount: number; torCount: number; hostingCount: number }
  totalViews: number
}

export default function DeviceThreatSummary({ data, totalViews }: DeviceThreatSummaryProps) {
  const hasThreats = data.vpnCount + data.proxyCount + data.torCount + data.hostingCount > 0

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Threat Intel</h3>
      {!hasThreats && data.maxRiskScore === 0 ? (
        <p className="text-sm text-green-600 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          Clean — no threats detected on this device type
        </p>
      ) : (
        <div className="flex flex-wrap gap-3">
          <div className="text-center">
            <RiskBadge score={data.avgRiskScore} showLabel={false} />
            <p className="text-[10px] text-gray-400 mt-1">Avg Risk</p>
          </div>
          <div className="text-center">
            <RiskBadge score={data.maxRiskScore} showLabel={false} />
            <p className="text-[10px] text-gray-400 mt-1">Max Risk</p>
          </div>
          {data.vpnCount > 0 && <MiniStat label="VPN" count={data.vpnCount} color="text-orange-600" />}
          {data.proxyCount > 0 && <MiniStat label="Proxy" count={data.proxyCount} color="text-yellow-600" />}
          {data.torCount > 0 && <MiniStat label="Tor" count={data.torCount} color="text-red-600" />}
          {data.hostingCount > 0 && <MiniStat label="DC" count={data.hostingCount} color="text-purple-600" />}
        </div>
      )}
    </div>
  )
}

function MiniStat({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="text-center">
      <p className={`text-lg font-semibold ${color}`}>{count}</p>
      <p className="text-[10px] text-gray-400">{label}</p>
    </div>
  )
}
