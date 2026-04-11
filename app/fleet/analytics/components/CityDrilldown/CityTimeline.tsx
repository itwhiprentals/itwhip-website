// app/fleet/analytics/components/CityDrilldown/CityTimeline.tsx
// Chronological page view list from a city

'use client'

import { PageViewEntry } from '../shared/types'
import ThreatFlags from '../shared/ThreatFlags'
import IpDisplay from '../shared/IpDisplay'
import TimeAgo from '../shared/TimeAgo'

interface CityTimelineProps {
  views: PageViewEntry[]
}

export default function CityTimeline({ views }: CityTimelineProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        <span className="text-xs text-gray-400">{views.length} events</span>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
        {views.map(v => (
          <div key={v.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${v.riskScore >= 51 ? 'bg-red-500' : v.riskScore >= 21 ? 'bg-yellow-500' : 'bg-green-500'}`} />
              <div className="min-w-0">
                <p className="text-sm text-gray-800 dark:text-gray-200 truncate">{v.path}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <IpDisplay ip={v.ip} />
                  {v.isp && <span className="text-[10px] text-gray-400 truncate max-w-[120px]">{v.isp}</span>}
                  <ThreatFlags isVpn={v.isVpn} isProxy={v.isProxy} isTor={v.isTor} isHosting={v.isHosting} compact />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 ml-3">
              <span className="text-[10px] text-gray-400">{v.device} / {v.browser}</span>
              <TimeAgo timestamp={v.timestamp} />
            </div>
          </div>
        ))}
      </div>

      {views.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">No recent activity</div>
      )}
    </div>
  )
}
