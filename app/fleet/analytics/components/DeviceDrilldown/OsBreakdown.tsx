// app/fleet/analytics/components/DeviceDrilldown/OsBreakdown.tsx
'use client'

interface OsBreakdownProps {
  data: { os: string; osVersion: string | null; views: number }[]
  totalViews: number
}

const OS_ICONS: Record<string, string> = {
  iOS: '🍎', iPadOS: '🍎', macOS: '🍎', Android: '🤖', Windows: '🪟', Linux: '🐧', 'Chrome OS': '💻',
}

export default function OsBreakdown({ data, totalViews }: OsBreakdownProps) {
  const maxViews = data.length > 0 ? Math.max(...data.map(d => d.views)) : 1

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Operating Systems</h3>
      <div className="space-y-2">
        {data.map((item, i) => {
          const pct = totalViews > 0 ? ((item.views / totalViews) * 100).toFixed(1) : '0'
          const width = (item.views / maxViews) * 100
          const icon = Object.entries(OS_ICONS).find(([k]) => item.os.startsWith(k))?.[1] || '💻'
          const label = item.osVersion ? `${item.os} ${item.osVersion}` : item.os

          return (
            <div key={`${item.os}-${item.osVersion}-${i}`}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <span className="text-xs">{icon}</span>
                  {label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{pct}%</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">{item.views}</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${width}%` }} />
              </div>
            </div>
          )
        })}
        {data.length === 0 && <p className="text-sm text-gray-400">No OS data</p>}
      </div>
    </div>
  )
}
