// app/fleet/analytics/components/DeviceDrilldown/DeviceTopPages.tsx
'use client'

interface DeviceTopPagesProps {
  data: { path: string; views: number }[]
}

export default function DeviceTopPages({ data }: DeviceTopPagesProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Top Pages</h3>
      <div className="space-y-1">
        {data.map((item, i) => (
          <div key={item.path} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-750">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-gray-400 w-4 text-right">{i + 1}</span>
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{item.path}</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white flex-shrink-0 ml-2">{item.views}</span>
          </div>
        ))}
        {data.length === 0 && <p className="text-sm text-gray-400">No page data</p>}
      </div>
    </div>
  )
}
