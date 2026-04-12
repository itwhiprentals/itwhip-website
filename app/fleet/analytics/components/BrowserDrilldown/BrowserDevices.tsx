// app/fleet/analytics/components/BrowserDrilldown/BrowserDevices.tsx
'use client'

interface BrowserDevicesProps {
  devices: { device: string; views: number }[]
  os: { os: string; views: number }[]
  totalViews: number
}

export default function BrowserDevices({ devices, os, totalViews }: BrowserDevicesProps) {
  const deviceIcons: Record<string, string> = { mobile: '📱', desktop: '💻', tablet: '📟' }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Devices & OS</h3>

      {/* Device split */}
      <div className="flex gap-3 mb-4">
        {devices.map(d => {
          const pct = totalViews > 0 ? ((d.views / totalViews) * 100).toFixed(0) : '0'
          return (
            <div key={d.device} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <span className="text-sm">{deviceIcons[d.device] || '💻'}</span>
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{d.device}</span>
              <span className="text-xs text-gray-400">{pct}%</span>
            </div>
          )
        })}
      </div>

      {/* OS split */}
      <div className="space-y-1.5">
        {os.map(item => {
          const pct = totalViews > 0 ? ((item.views / totalViews) * 100).toFixed(1) : '0'
          return (
            <div key={item.os} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{item.os}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{pct}%</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">{item.views}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
