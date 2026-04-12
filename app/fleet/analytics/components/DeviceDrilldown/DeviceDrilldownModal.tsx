// app/fleet/analytics/components/DeviceDrilldown/DeviceDrilldownModal.tsx
// Modal shell — fetches data, composes children

'use client'

import { useState, useEffect } from 'react'
import OsBreakdown from './OsBreakdown'
import DeviceBrowsers from './DeviceBrowsers'
import DeviceTopPages from './DeviceTopPages'
import DeviceThreatSummary from './DeviceThreatSummary'

interface DeviceDrilldownModalProps {
  device: string
  onClose: () => void
}

interface DeviceData {
  device: string
  totalViews: number
  osBreakdown: { os: string; osVersion: string | null; views: number }[]
  browserBreakdown: { browser: string; views: number }[]
  topPages: { path: string; views: number }[]
  threatSummary: { avgRiskScore: number; maxRiskScore: number; vpnCount: number; proxyCount: number; torCount: number; hostingCount: number }
}

export default function DeviceDrilldownModal({ device, onClose }: DeviceDrilldownModalProps) {
  const [data, setData] = useState<DeviceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/fleet/analytics/device/${encodeURIComponent(device)}?key=phoenix-fleet-2847`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [device])

  const icon = device === 'mobile' ? '📱' : device === 'tablet' ? '📟' : '💻'

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span>{icon}</span>
              {device.charAt(0).toUpperCase() + device.slice(1)} Traffic
            </h2>
            {data && <p className="text-sm text-gray-500 mt-0.5">{data.totalViews.toLocaleString()} views</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : data ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <OsBreakdown data={data.osBreakdown} totalViews={data.totalViews} />
                <DeviceBrowsers data={data.browserBreakdown} totalViews={data.totalViews} />
              </div>
              <DeviceTopPages data={data.topPages} />
              <DeviceThreatSummary data={data.threatSummary} totalViews={data.totalViews} />
            </>
          ) : (
            <p className="text-center text-gray-500">No data available</p>
          )}
        </div>
      </div>
    </div>
  )
}
