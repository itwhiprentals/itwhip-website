// app/fleet/analytics/components/VisitorProfile/LocationComparison.tsx
// Side-by-side IP location vs GPS location with distance calculation

'use client'

import GpsIndicator from '../shared/GpsIndicator'

interface LocationData {
  latitude: number | null
  longitude: number | null
  address: string | null
  label: string
}

interface LocationComparisonProps {
  ipLocation: LocationData
  gpsLocation: LocationData & { accuracy: number | null }
}

export default function LocationComparison({ ipLocation, gpsLocation }: LocationComparisonProps) {
  const hasGps = gpsLocation.latitude != null && gpsLocation.longitude != null
  const hasIp = ipLocation.latitude != null && ipLocation.longitude != null

  if (!hasGps && !hasIp) return null

  // Calculate distance between IP and GPS if both available
  let distanceMiles: number | null = null
  if (hasGps && hasIp) {
    distanceMiles = haversineDistance(
      ipLocation.latitude!, ipLocation.longitude!,
      gpsLocation.latitude!, gpsLocation.longitude!
    )
  }

  const isMismatch = distanceMiles !== null && distanceMiles > 50

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Location Intel</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* GPS Location */}
        {hasGps && (
          <div className="px-3 py-2.5 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">📍</span>
              <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase">Device GPS</span>
              <GpsIndicator accuracy={gpsLocation.accuracy} />
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
              {gpsLocation.address || 'Address unavailable'}
            </p>
            <p className="text-[10px] text-gray-400 mt-1 font-mono">
              {gpsLocation.latitude?.toFixed(4)}, {gpsLocation.longitude?.toFixed(4)}
            </p>
          </div>
        )}

        {/* IP Location */}
        {hasIp && (
          <div className="px-3 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">🌐</span>
              <span className="text-xs font-semibold text-gray-500 uppercase">IP Location (ISP)</span>
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
              {ipLocation.address || 'Address unavailable'}
            </p>
            <p className="text-[10px] text-gray-400 mt-1 font-mono">
              {ipLocation.latitude?.toFixed(4)}, {ipLocation.longitude?.toFixed(4)}
            </p>
          </div>
        )}

        {/* No GPS */}
        {!hasGps && (
          <div className="px-3 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 border-dashed">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">📍</span>
              <span className="text-xs font-semibold text-gray-400 uppercase">Device GPS</span>
            </div>
            <p className="text-sm text-gray-400">Not available — user denied or desktop browser</p>
          </div>
        )}
      </div>

      {/* Distance mismatch warning */}
      {isMismatch && (
        <div className="mt-3 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 flex items-center gap-2">
          <span className="text-sm">⚠️</span>
          <span className="text-sm text-yellow-700 dark:text-yellow-400">
            IP and GPS locations are <strong>{Math.round(distanceMiles!)} miles apart</strong> — possible VPN or ISP routing mismatch
          </span>
        </div>
      )}

      {/* Distance info (not a warning) */}
      {distanceMiles !== null && !isMismatch && (
        <p className="mt-2 text-[10px] text-gray-400">
          IP and GPS are {Math.round(distanceMiles)} miles apart (normal ISP routing variance)
        </p>
      )}
    </div>
  )
}

/** Haversine distance in miles */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
