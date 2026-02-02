// Enhanced IP → Location lookup with threat intelligence
// Uses Vercel's built-in geo headers + proxycheck.io for VPN/Proxy/Tor detection

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

// In-memory cache for proxycheck.io results (5 min TTL)
const proxyCache = new Map<string, { data: ProxyCheckResult; expires: number }>()
const PROXY_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

interface ProxyCheckResult {
  isVpn: boolean
  isProxy: boolean
  isTor: boolean
  isHosting: boolean
  isp: string | null
  asn: string | null
  organization: string | null
  riskScore: number
}

/**
 * Query proxycheck.io for VPN/Proxy/Tor detection (1,000 free queries/day)
 * Non-blocking — returns defaults on any failure or timeout
 */
async function checkProxyStatus(ip: string): Promise<ProxyCheckResult> {
  const defaults: ProxyCheckResult = {
    isVpn: false, isProxy: false, isTor: false, isHosting: false,
    isp: null, asn: null, organization: null, riskScore: 0
  }

  try {
    // Check cache first
    const cached = proxyCache.get(ip)
    if (cached && cached.expires > Date.now()) {
      return cached.data
    }

    // proxycheck.io free tier: 1,000 queries/day, no API key required
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000) // 3s timeout

    const response = await fetch(
      `https://proxycheck.io/v2/${ip}?vpn=1&asn=1&risk=1`,
      { signal: controller.signal }
    )
    clearTimeout(timeout)

    if (!response.ok) {
      console.warn(`[ProxyCheck] HTTP ${response.status} for ${ip}`)
      return defaults
    }

    const data = await response.json()

    if (data.status !== 'ok' || !data[ip]) {
      return defaults
    }

    const ipData = data[ip]
    const result: ProxyCheckResult = {
      isProxy: ipData.proxy === 'yes',
      isVpn: ipData.type === 'VPN',
      isTor: ipData.type === 'TOR',
      isHosting: ipData.type === 'Hosting' || ipData.type === 'Data Center',
      isp: ipData.provider || null,
      asn: ipData.asn || null,
      organization: ipData.organisation || null,
      riskScore: parseInt(ipData.risk || '0', 10)
    }

    // Cache the result
    proxyCache.set(ip, { data: result, expires: Date.now() + PROXY_CACHE_TTL })

    // Clean old cache entries periodically
    if (proxyCache.size > 500) {
      const now = Date.now()
      for (const [key, val] of proxyCache) {
        if (val.expires < now) proxyCache.delete(key)
      }
    }

    console.log(`[ProxyCheck] ${ip}: VPN=${result.isVpn} Proxy=${result.isProxy} Tor=${result.isTor} Hosting=${result.isHosting} Risk=${result.riskScore}`)
    return result
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn(`[ProxyCheck] Timeout for ${ip}`)
    } else {
      console.error(`[ProxyCheck] Error for ${ip}:`, error.message)
    }
    return defaults
  }
}

/**
 * Enhanced geolocation using Vercel's built-in geo headers + proxycheck.io threat intelligence.
 * Vercel headers: free, zero-dependency, automatic on every request.
 * proxycheck.io: 1,000 free queries/day for VPN/Proxy/Tor detection.
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

    // Get Vercel geo data from headers
    let country: string | null = null
    let region: string | null = null
    let city: string | null = null
    let latitude: number | null = null
    let longitude: number | null = null
    let timezone: string | null = null
    let zipCode: string | null = null

    if (headers) {
      country = headers.get('x-vercel-ip-country') || null
      region = headers.get('x-vercel-ip-country-region') || null
      city = headers.get('x-vercel-ip-city') ? decodeURIComponent(headers.get('x-vercel-ip-city')!) : null
      latitude = headers.get('x-vercel-ip-latitude') ? parseFloat(headers.get('x-vercel-ip-latitude')!) : null
      longitude = headers.get('x-vercel-ip-longitude') ? parseFloat(headers.get('x-vercel-ip-longitude')!) : null
      timezone = headers.get('x-vercel-ip-timezone') || null
      zipCode = headers.get('x-vercel-ip-postal-code') || null
    }

    console.log(`[Geolocation] Vercel geo: ${city}, ${region}, ${country} (${latitude}, ${longitude})`)

    // Query proxycheck.io for threat intelligence (non-blocking)
    const proxy = await checkProxyStatus(ip)

    // Calculate combined risk score
    let riskScore = proxy.riskScore
    if (proxy.isVpn) riskScore = Math.max(riskScore, 30)
    if (proxy.isProxy) riskScore = Math.max(riskScore, 40)
    if (proxy.isTor) riskScore = Math.max(riskScore, 70)
    if (proxy.isHosting) riskScore = Math.max(riskScore, 20)

    return {
      ip,
      country,
      city,
      region,
      zipCode,
      timezone,
      latitude,
      longitude,
      isp: proxy.isp,
      asn: proxy.asn ? parseInt(proxy.asn.replace(/^AS/, ''), 10) || null : null,
      organization: proxy.organization,
      isVpn: proxy.isVpn,
      isProxy: proxy.isProxy,
      isTor: proxy.isTor,
      isDatacenter: proxy.isHosting,
      isHosting: proxy.isHosting,
      riskScore: Math.min(riskScore, 100)
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
