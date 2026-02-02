// IP → Location lookup using geoip-lite (offline, free)
// Dynamic import to avoid Next.js webpack bundling issues

export interface LocationData {
  ip: string
  country: string | null
  city: string | null
  region: string | null
  latitude: number | null
  longitude: number | null
  timezone: string | null
}

export async function getLocationFromIp(ip: string): Promise<LocationData> {
  try {
    // Dynamic import to prevent webpack from bundling geoip database files
    const geoip = await import('geoip-lite')
    const geo = geoip.default.lookup(ip)

    if (!geo) {
      return {
        ip,
        country: null,
        city: null,
        region: null,
        latitude: null,
        longitude: null,
        timezone: null
      }
    }

    return {
      ip,
      country: geo.country,
      city: null, // geoip-lite doesn't provide city
      region: geo.region,
      latitude: geo.ll[0],
      longitude: geo.ll[1],
      timezone: geo.timezone
    }
  } catch (error) {
    console.error('[Geolocation] Error loading geoip-lite:', error)
    // Return null location data if geoip-lite fails to load
    return {
      ip,
      country: null,
      city: null,
      region: null,
      latitude: null,
      longitude: null,
      timezone: null
    }
  }
}

// Calculate distance between two coordinates (in km)
export function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Detect impossible travel (e.g., 5000km in 1 hour)
export function detectImpossibleTravel(
  prevLat: number, prevLon: number, prevTime: Date,
  currLat: number, currLon: number, currTime: Date
): { impossible: boolean; distance: number; speed: number } {
  const distance = calculateDistance(prevLat, prevLon, currLat, currLon)
  const hoursDiff = (currTime.getTime() - prevTime.getTime()) / (1000 * 60 * 60)
  const speed = distance / hoursDiff // km/h

  // Flag if speed > 1000 km/h (impossible for most travel)
  return {
    impossible: speed > 1000,
    distance,
    speed
  }
}
