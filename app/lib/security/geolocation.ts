// Enhanced IP → Location lookup with threat intelligence
// Uses Vercel's built-in geo headers (free, zero-dependency, works in serverless)

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
 * Enhanced geolocation using Vercel's built-in geo headers.
 * These headers are automatically populated by Vercel's edge network on every request.
 * No npm packages or external API calls needed.
 *
 * @param ip - Client IP address
 * @param headers - Request headers (optional, but needed for Vercel geo data)
 */
export async function getEnhancedLocation(ip: string, headers?: Headers): Promise<EnhancedLocationData> {
  try {
    if (isPrivateIp(ip)) {
      console.log(`[Geolocation] Skipping private IP: ${ip}`)
      return { ...EMPTY_LOCATION, ip }
    }

    if (!headers) {
      // No headers available - return IP only
      return { ...EMPTY_LOCATION, ip }
    }

    // Vercel automatically provides these geo headers on every request:
    // x-vercel-ip-country, x-vercel-ip-country-region, x-vercel-ip-city,
    // x-vercel-ip-latitude, x-vercel-ip-longitude, x-vercel-ip-timezone
    const country = headers.get('x-vercel-ip-country') || null
    const region = headers.get('x-vercel-ip-country-region') || null
    const city = headers.get('x-vercel-ip-city') ? decodeURIComponent(headers.get('x-vercel-ip-city')!) : null
    const latitude = headers.get('x-vercel-ip-latitude') ? parseFloat(headers.get('x-vercel-ip-latitude')!) : null
    const longitude = headers.get('x-vercel-ip-longitude') ? parseFloat(headers.get('x-vercel-ip-longitude')!) : null
    const timezone = headers.get('x-vercel-ip-timezone') || null
    const zipCode = headers.get('x-vercel-ip-postal-code') || null

    console.log(`[Geolocation] Vercel geo: ${city}, ${region}, ${country} (${latitude}, ${longitude})`)

    return {
      ip,
      country,
      city,
      region,
      zipCode,
      timezone,
      latitude,
      longitude,
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

// BACKWARD COMPATIBILITY: Keep old function for existing code (loginMonitor etc.)
export async function getLocationFromIp(ip: string, headers?: Headers): Promise<{
  ip: string
  country: string | null
  city: string | null
  region: string | null
  latitude: number | null
  longitude: number | null
  timezone: string | null
}> {
  const enhanced = await getEnhancedLocation(ip, headers)
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
