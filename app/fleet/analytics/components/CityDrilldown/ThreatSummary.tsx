// app/fleet/analytics/components/CityDrilldown/ThreatSummary.tsx
// VPN/Proxy/Tor/Datacenter counts for a city

'use client'

interface ThreatSummaryProps {
  vpnCount: number
  proxyCount: number
  torCount: number
  hostingCount: number
  uniqueVisitors: number
}

export default function ThreatSummary({ vpnCount, proxyCount, torCount, hostingCount, uniqueVisitors }: ThreatSummaryProps) {
  const threats = [
    { label: 'VPN', count: vpnCount, color: 'bg-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-50' },
    { label: 'Proxy', count: proxyCount, color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50' },
    { label: 'Tor', count: torCount, color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50' },
    { label: 'Datacenter', count: hostingCount, color: 'bg-purple-500', textColor: 'text-purple-700', bgColor: 'bg-purple-50' },
  ]

  const cleanCount = uniqueVisitors - vpnCount - proxyCount - torCount - hostingCount
  const hasThreats = vpnCount + proxyCount + torCount + hostingCount > 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Threat Breakdown</h3>

      {!hasThreats ? (
        <p className="text-sm text-green-600 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          All visitors are clean — no VPN, proxy, Tor, or datacenter detected
        </p>
      ) : (
        <div className="space-y-2">
          {threats.map(t => (
            <div key={t.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${t.color}`} />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${t.count > 0 ? t.textColor : 'text-gray-400'}`}>
                  {t.count}
                </span>
                {t.count > 0 && uniqueVisitors > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${t.bgColor} ${t.textColor}`}>
                    {Math.round((t.count / uniqueVisitors) * 100)}%
                  </span>
                )}
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Clean</span>
            </div>
            <span className="text-sm font-medium text-green-600">{Math.max(0, cleanCount)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
