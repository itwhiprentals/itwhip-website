// app/fleet/analytics/location/[city]/page.tsx
// City drill-down — thin shell, composes modular components

'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import CityHeader from '../../components/CityDrilldown/CityHeader'
import ThreatSummary from '../../components/CityDrilldown/ThreatSummary'
import VisitorTable from '../../components/CityDrilldown/VisitorTable'
import CityTimeline from '../../components/CityDrilldown/CityTimeline'
import type { EnrichedVisitor, PageViewEntry } from '../../components/shared/types'

interface CityResponse {
  success: boolean
  city: string
  range: string
  totalViews: number
  uniqueVisitors: number
  vpnCount: number
  proxyCount: number
  torCount: number
  hostingCount: number
  avgRiskScore: number
  maxRiskScore: number
  visitors: EnrichedVisitor[]
  recentViews: PageViewEntry[]
}

export default function CityDrilldownPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const city = decodeURIComponent(params.city as string)
  const apiKey = searchParams.get('key') || 'phoenix-fleet-2847'

  const [data, setData] = useState<CityResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('7d')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/fleet/analytics/location/${encodeURIComponent(city)}?key=${apiKey}&range=${range}`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [city, range, apiKey])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500">No data for {city}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Nav */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/fleet/analytics?key=${apiKey}`} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className="text-sm text-gray-500">Analytics</span>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{city}</span>
          </div>
          <div className="flex gap-1">
            {['24h', '7d', '30d', '90d'].map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                  range === r
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <CityHeader
          city={data.city}
          country={data.visitors[0]?.country || null}
          totalViews={data.totalViews}
          uniqueVisitors={data.uniqueVisitors}
          avgRiskScore={data.avgRiskScore}
          maxRiskScore={data.maxRiskScore}
          range={data.range}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VisitorTable visitors={data.visitors} />
          </div>
          <div className="space-y-6">
            <ThreatSummary
              vpnCount={data.vpnCount}
              proxyCount={data.proxyCount}
              torCount={data.torCount}
              hostingCount={data.hostingCount}
              uniqueVisitors={data.uniqueVisitors}
            />
            <CityTimeline views={data.recentViews} />
          </div>
        </div>
      </div>
    </div>
  )
}
