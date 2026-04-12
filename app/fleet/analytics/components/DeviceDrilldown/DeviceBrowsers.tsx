// app/fleet/analytics/components/DeviceDrilldown/DeviceBrowsers.tsx
'use client'

interface DeviceBrowsersProps {
  data: { browser: string; views: number }[]
  totalViews: number
}

export default function DeviceBrowsers({ data, totalViews }: DeviceBrowsersProps) {
  const maxViews = data.length > 0 ? Math.max(...data.map(d => d.views)) : 1

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Browsers</h3>
      <div className="space-y-2">
        {data.map(item => {
          const pct = totalViews > 0 ? ((item.views / totalViews) * 100).toFixed(1) : '0'
          const width = (item.views / maxViews) * 100

          return (
            <div key={item.browser}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.browser}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{pct}%</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">{item.views}</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${width}%` }} />
              </div>
            </div>
          )
        })}
        {data.length === 0 && <p className="text-sm text-gray-400">No browser data</p>}
      </div>
    </div>
  )
}
