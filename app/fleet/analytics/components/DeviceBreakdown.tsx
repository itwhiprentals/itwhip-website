// app/fleet/analytics/components/DeviceBreakdown.tsx
// Device and browser breakdown for analytics

'use client'

import { IoDesktopOutline, IoPhonePortraitOutline, IoTabletPortraitOutline, IoLogoChrome } from 'react-icons/io5'

interface DeviceData {
  device: string
  views: number
}

interface BrowserData {
  browser: string
  views: number
}

interface DeviceBreakdownProps {
  devices: DeviceData[]
  browsers: BrowserData[]
  loading?: boolean
}

// Device icons
const deviceIcons: Record<string, React.ElementType> = {
  desktop: IoDesktopOutline,
  mobile: IoPhonePortraitOutline,
  tablet: IoTabletPortraitOutline
}

// Device colors
const deviceColors: Record<string, string> = {
  desktop: 'bg-blue-500',
  mobile: 'bg-green-500',
  tablet: 'bg-purple-500',
  unknown: 'bg-gray-500'
}

export default function DeviceBreakdown({ devices, browsers, loading = false }: DeviceBreakdownProps) {
  const totalDevices = devices.reduce((sum, d) => sum + d.views, 0)
  const totalBrowsers = browsers.reduce((sum, b) => sum + b.views, 0)

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-4" />
        <div className="flex gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 h-20 bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
          ))}
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3" />
        <div className="h-3 bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      {/* Devices */}
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
        Devices
      </h3>

      {devices.length === 0 ? (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
          No device data yet
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {devices.map((item) => {
            const Icon = deviceIcons[item.device.toLowerCase()] || IoDesktopOutline
            const percentage = totalDevices > 0 ? ((item.views / totalDevices) * 100).toFixed(0) : 0

            return (
              <div
                key={item.device}
                className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900"
              >
                <Icon className="w-6 h-6 mx-auto mb-1 text-gray-600 dark:text-gray-400" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">{percentage}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{item.device}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Browsers */}
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Browsers
      </h3>

      {browsers.length === 0 ? (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
          No browser data yet
        </div>
      ) : (
        <>
          {/* Stacked bar */}
          <div className="h-3 rounded-full overflow-hidden flex">
            {browsers.map((item, i) => {
              const percentage = totalBrowsers > 0 ? (item.views / totalBrowsers) * 100 : 0
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500']
              return (
                <div
                  key={item.browser}
                  className={`${colors[i % colors.length]} transition-all`}
                  style={{ width: `${percentage}%` }}
                  title={`${item.browser}: ${percentage.toFixed(1)}%`}
                />
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-3">
            {browsers.map((item, i) => {
              const percentage = totalBrowsers > 0 ? ((item.views / totalBrowsers) * 100).toFixed(0) : 0
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500']
              return (
                <div key={item.browser} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${colors[i % colors.length]}`} />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {item.browser} ({percentage}%)
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
