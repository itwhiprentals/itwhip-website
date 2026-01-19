// app/fleet/analytics/components/GeoBreakdown.tsx
// Country/region breakdown for analytics

'use client'

import { IoGlobeOutline } from 'react-icons/io5'

interface CountryData {
  country: string
  views: number
}

interface GeoBreakdownProps {
  data: CountryData[]
  loading?: boolean
}

// Country code to flag emoji
const countryFlags: Record<string, string> = {
  US: '🇺🇸',
  GB: '🇬🇧',
  UK: '🇬🇧',
  CA: '🇨🇦',
  AU: '🇦🇺',
  DE: '🇩🇪',
  FR: '🇫🇷',
  ES: '🇪🇸',
  IT: '🇮🇹',
  JP: '🇯🇵',
  CN: '🇨🇳',
  IN: '🇮🇳',
  BR: '🇧🇷',
  MX: '🇲🇽',
  NL: '🇳🇱',
  SE: '🇸🇪',
  PL: '🇵🇱',
  KR: '🇰🇷',
  RU: '🇷🇺',
  Unknown: '🌍'
}

// Country code to name
const countryNames: Record<string, string> = {
  US: 'United States',
  GB: 'United Kingdom',
  UK: 'United Kingdom',
  CA: 'Canada',
  AU: 'Australia',
  DE: 'Germany',
  FR: 'France',
  ES: 'Spain',
  IT: 'Italy',
  JP: 'Japan',
  CN: 'China',
  IN: 'India',
  BR: 'Brazil',
  MX: 'Mexico',
  NL: 'Netherlands',
  SE: 'Sweden',
  PL: 'Poland',
  KR: 'South Korea',
  RU: 'Russia',
  Unknown: 'Unknown'
}

export default function GeoBreakdown({ data, loading = false }: GeoBreakdownProps) {
  const maxViews = data.length ? Math.max(...data.map(d => d.views)) : 1
  const totalViews = data.reduce((sum, d) => sum + d.views, 0)

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-6 bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <IoGlobeOutline className="w-4 h-4 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Top Countries
        </h3>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No geographic data yet
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item) => {
            const widthPercent = (item.views / maxViews) * 100
            const percentage = ((item.views / totalViews) * 100).toFixed(1)
            const flag = countryFlags[item.country] || '🌍'
            const name = countryNames[item.country] || item.country

            return (
              <div key={item.country}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{flag}</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{percentage}%</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                      {item.views.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
