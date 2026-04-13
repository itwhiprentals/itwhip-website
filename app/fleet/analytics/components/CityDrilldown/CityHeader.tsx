// app/fleet/analytics/components/CityDrilldown/CityHeader.tsx
// City name, country flag, stats bar

'use client'

import RiskBadge from '../shared/RiskBadge'

interface CityHeaderProps {
  city: string
  country: string | null
  totalViews: number
  uniqueVisitors: number
  avgRiskScore: number
  maxRiskScore: number
  range: string
}

function getFlag(code: string | null): string {
  if (!code) return '🌍'
  const upper = code.toUpperCase()
  const a = upper.codePointAt(0)! - 65 + 0x1F1E6
  const b = upper.codePointAt(1)! - 65 + 0x1F1E6
  return String.fromCodePoint(a, b)
}

export default function CityHeader({ city, country, totalViews, uniqueVisitors, avgRiskScore, maxRiskScore, range }: CityHeaderProps) {
  const flag = getFlag(country)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-3xl">{flag}</span>
            {city}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {country || 'Unknown'} &middot; Last {range}
          </p>
        </div>
        {maxRiskScore > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Highest Risk</p>
            <RiskBadge score={maxRiskScore} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <Stat label="Total Views" value={totalViews.toLocaleString()} />
        <Stat label="Unique Visitors" value={uniqueVisitors.toLocaleString()} />
        <Stat label="Avg Risk Score" value={String(avgRiskScore)} />
        <Stat label="Views/Visitor" value={uniqueVisitors > 0 ? (totalViews / uniqueVisitors).toFixed(1) : '-'} />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}
