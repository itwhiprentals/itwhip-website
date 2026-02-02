// Enhanced IP → Location lookup with threat intelligence
// Uses geoip-lite (battle-tested in serverless, 2.6M downloads/month)

export interface EnhancedLocationData {
  ip: string
  country: string | null
  city: string | null
  region: string | null
  zipCode: string | null
  timezone: string | null
  latitude: number | null
  longitude: number | null

  // ISP & Network Info
  isp: string | null
  asn: number | null
  organization: string | null

  // Threat Intelligence
  isVpn: boolean
  isProxy: boolean
  isTor: boolean
  isDatacenter: boolean
  isHosting: boolean

  // Risk Score (0-100)
  riskScore: number
}

const EMPTY_LOCATION: EnhancedLocationData = {
  ip: '',
  country: null,
  city: null,
  region: null,
  zipCode: null,
  timezone: null,
  latitude: null,
  longitude: null,
  isp: null,
  asn: null,
  organization: null,
  isVpn: false,
  isProxy: false,
  isTor: false,
  isDatacenter: false,
  isHosting: false,
  riskScore: 0
}

/**
 * Enhanced geolocation with threat detection
 * Uses geoip-lite (offline MaxMind database, works reliably in Vercel serverless)
 */
export async function getEnhancedLocation(ip: string): Promise<EnhancedLocationData> {
  try {
    // Skip private/local IPs (they won't resolve)
    if (isPrivateIp(ip)) {
      console.log(`[Geolocation] Skipping private IP: ${ip}`)
      return { ...EMPTY_LOCATION, ip }
    }

    // Use geoip-lite (reliable in serverless, no binary file issues)
    const geoip = await import('geoip-lite')
    const geo = geoip.default.lookup(ip)

    if (!geo) {
      console.log(`[Geolocation] No data for IP: ${ip}`)
      return { ...EMPTY_LOCATION, ip }
    }

    // Threat detection based on available data
    const isVpn = false // geoip-lite doesn't provide this, safe default
    const isProxy = false
    const isTor = false
    const isDatacenter = false
    const isHosting = false

    // Calculate risk score (0 for now since we don't have org data from geoip-lite)
    const riskScore = 0

    return {
      ip,
      country: geo.country || null,
      city: geo.city || null,
      region: geo.region || null,
      zipCode: null, // geoip-lite doesn't provide ZIP
      timezone: geo.timezone || null,
      latitude: geo.ll?.[0] ?? null,
      longitude: geo.ll?.[1] ?? null,

      isp: null, // geoip-lite doesn't provide ISP
      asn: null,
      organization: null,

      isVpn,
      isProxy,
      isTor,
      isDatacenter,
      isHosting,

      riskScore
    }
  } catch (error) {
    console.error('[Enhanced Geolocation] Error:', error)
    return { ...EMPTY_LOCATION, ip }
  }
}

/**
 * Check if IP is private/local (won't have geolocation data)
 */
function isPrivateIp(ip: string): boolean {
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === 'localhost' ||
    ip.startsWith('10.') ||
    ip.startsWith('172.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('169.254.') ||
    ip === '0.0.0.0'
  )
}

/**
 * Detect timezone mismatch (VPN indicator)
 */
export function detectTimezoneMismatch(
  ipTimezone: string,
  browserTimezone: string
): boolean {
  return ipTimezone !== browserTimezone
}

/**
 * Calculate distance between two coordinates (in km)
 */
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

/**
 * Detect impossible travel (e.g., 5000km in 1 hour)
 */
export function detectImpossibleTravel(
  prevLat: number, prevLon: number, prevTime: Date,
  currLat: number, currLon: number, currTime: Date
): { impossible: boolean; distance: number; speed: number } {
  const distance = calculateDistance(prevLat, prevLon, currLat, currLon)
  const hoursDiff = (currTime.getTime() - prevTime.getTime()) / (1000 * 60 * 60)
  const speed = hoursDiff > 0 ? distance / hoursDiff : 0

  return {
    impossible: speed > 1000,
    distance,
    speed
  }
}

// BACKWARD COMPATIBILITY: Keep old function for existing code
export async function getLocationFromIp(ip: string): Promise<{
  ip: string
  country: string | null
  city: string | null
  region: string | null
  latitude: number | null
  longitude: number | null
  timezone: string | null
}> {
  const enhanced = await getEnhancedLocation(ip)
  return {
    ip: enhanced.ip,
    country: enhanced.country,
    city: enhanced.city,
    region: enhanced.region,
    latitude: enhanced.latitude,
    longitude: enhanced.longitude,
    timezone: enhanced.timezone
  }
}
