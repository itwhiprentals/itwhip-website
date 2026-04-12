// app/fleet/analytics/components/BrowserDrilldown/BrowserDrilldownModal.tsx
// Modal shell for browser drill-down

'use client'

import { useState, useEffect } from 'react'
import VersionBreakdown from './VersionBreakdown'
import BrowserDevices from './BrowserDevices'
import BrowserTopPages from './BrowserTopPages'
import BrowserThreatSummary from './BrowserThreatSummary'

interface BrowserDrilldownModalProps {
  browser: string
  onClose: () => void
}

interface BrowserData {
  browser: string
  totalViews: number
  versionBreakdown: { version: string; views: number }[]
  deviceBreakdown: { device: string; views: number }[]
  osBreakdown: { os: string; views: number }[]
  topPages: { path: string; views: number }[]
  threatSummary: { avgRiskScore: number; maxRiskScore: number; vpnCount: number; proxyCount: number; torCount: number; hostingCount: number }
}

export default function BrowserDrilldownModal({ browser, onClose }: BrowserDrilldownModalProps) {
  const [data, setData] = useState<BrowserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/fleet/analytics/browser/${encodeURIComponent(browser)}?key=phoenix-fleet-2847`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [browser])

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{browser} Traffic</h2>
            {data && <p className="text-sm text-gray-500 mt-0.5">{data.totalViews.toLocaleString()} views</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : data ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <VersionBreakdown data={data.versionBreakdown} totalViews={data.totalViews} />
                <BrowserDevices devices={data.deviceBreakdown} os={data.osBreakdown} totalViews={data.totalViews} />
              </div>
              <BrowserTopPages data={data.topPages} />
              <BrowserThreatSummary data={data.threatSummary} totalViews={data.totalViews} />
            </>
          ) : (
            <p className="text-center text-gray-500">No data available</p>
          )}
        </div>
      </div>
    </div>
  )
}
