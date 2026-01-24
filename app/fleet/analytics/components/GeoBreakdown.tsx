// app/fleet/analytics/components/GeoBreakdown.tsx
// Enhanced geographic breakdown with city/region precision (military-grade)

'use client'

import { useState } from 'react'
import { IoGlobeOutline, IoLocationOutline, IoChevronDownOutline, IoChevronUpOutline } from 'react-icons/io5'

// Simple country data (for backwards compatibility)
interface CountryData {
  country: string
  views: number
}

// Enhanced location data with city/region
interface LocationData {
  country: string
  region: string | null
  city: string | null
  location: string
  views: number
}

interface GeoBreakdownProps {
  data: CountryData[]
  locationData?: LocationData[]
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

export default function GeoBreakdown({ data, locationData, loading = false }: GeoBreakdownProps) {
  const [showDetailedView, setShowDetailedView] = useState(false)

  const maxViews = data.length ? Math.max(...data.map(d => d.views)) : 1
  const totalViews = data.reduce((sum, d) => sum + d.views, 0)

  // Use detailed location data if available
  const detailedMaxViews = locationData?.length ? Math.max(...locationData.map(d => d.views)) : 1
  const detailedTotalViews = locationData?.reduce((sum, d) => sum + d.views, 0) || 0

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {showDetailedView ? (
            <IoLocationOutline className="w-4 h-4 text-green-500" />
          ) : (
            <IoGlobeOutline className="w-4 h-4 text-gray-500" />
          )}
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {showDetailedView ? 'Top Locations' : 'Top Countries'}
          </h3>
        </div>

        {/* Toggle for detailed view */}
        {locationData && locationData.length > 0 && (
          <button
            onClick={() => setShowDetailedView(!showDetailedView)}
            className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            {showDetailedView ? (
              <>
                <span>By Country</span>
                <IoChevronUpOutline className="w-3 h-3" />
              </>
            ) : (
              <>
                <span>By City</span>
                <IoChevronDownOutline className="w-3 h-3" />
              </>
            )}
          </button>
        )}
      </div>

      {data.length === 0 && (!locationData || locationData.length === 0) ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No geographic data yet
        </div>
      ) : showDetailedView && locationData && locationData.length > 0 ? (
        // Detailed location view with city/region
        <div className="space-y-3">
          {locationData.map((item, index) => {
            const widthPercent = (item.views / detailedMaxViews) * 100
            const percentage = ((item.views / detailedTotalViews) * 100).toFixed(1)
            const flag = countryFlags[item.country] || '🌍'

            return (
              <div key={`${item.location}-${index}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-base flex-shrink-0">{flag}</span>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate block">
                        {item.city || item.region || countryNames[item.country] || item.country}
                      </span>
                      {(item.city || item.region) && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate block">
                          {[item.region, countryNames[item.country] || item.country]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
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
      ) : (
        // Simple country view
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
