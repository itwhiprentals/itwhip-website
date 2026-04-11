// app/fleet/analytics/components/VisitorProfile/SessionTimeline.tsx
// Page-by-page session replay — every path visited with timestamps

'use client'

import { PageViewEntry } from '../shared/types'
import ThreatFlags from '../shared/ThreatFlags'
import TimeAgo from '../shared/TimeAgo'

interface SessionTimelineProps {
  views: PageViewEntry[]
}

export default function SessionTimeline({ views }: SessionTimelineProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Session Timeline</h3>
        <span className="text-xs text-gray-400">{views.length} pages</span>
      </div>

      <div className="divide-y divide-gray-50 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
        {views.map((v, i) => {
          // Calculate time gap from previous view
          const prevTime = i < views.length - 1 ? new Date(views[i + 1].timestamp).getTime() : null
          const thisTime = new Date(v.timestamp).getTime()
          const gapMs = prevTime ? thisTime - prevTime : null
          const gapLabel = gapMs !== null ? formatGap(gapMs) : null
          const isSuspiciousGap = gapMs !== null && gapMs < 1000 && gapMs >= 0 // < 1 second

          return (
            <div key={v.id}>
              {/* Time gap indicator */}
              {gapLabel && (
                <div className="px-4 py-1 flex items-center gap-2">
                  <div className="flex-1 border-t border-dashed border-gray-200 dark:border-gray-700" />
                  <span className={`text-[10px] ${isSuspiciousGap ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                    {isSuspiciousGap ? '⚡ ' : ''}{gapLabel}
                  </span>
                  <div className="flex-1 border-t border-dashed border-gray-200 dark:border-gray-700" />
                </div>
              )}
              <div className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    v.riskScore >= 51 ? 'bg-red-500' : v.riskScore >= 21 ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-200 truncate font-mono">{v.path}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {v.loadTime && <span className="text-[10px] text-gray-400">{v.loadTime}ms</span>}
                      <ThreatFlags isVpn={v.isVpn} isProxy={v.isProxy} isTor={v.isTor} isHosting={v.isHosting} compact />
                    </div>
                  </div>
                </div>
                <TimeAgo timestamp={v.timestamp} showFull />
              </div>
            </div>
          )
        })}
      </div>

      {views.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">No page views</div>
      )}
    </div>
  )
}

function formatGap(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  if (ms < 3600000) return `${Math.round(ms / 60000)}m`
  return `${(ms / 3600000).toFixed(1)}h`
}
