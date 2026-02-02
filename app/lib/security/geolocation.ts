// Enhanced IP → Location lookup with threat intelligence
// Uses fast-geoip (10x faster than geoip-lite, includes ZIP codes)

export interface EnhancedLocationData {
  ip: string
  country: string | null
  city: string | null
  region: string | null
  zipCode: string | null  // NEW: ZIP code for precise location
  timezone: string | null
  latitude: number | null
  longitude: number | null

  // NEW: ISP & Network Info
  isp: string | null
  asn: number | null
  organization: string | null

  // NEW: Threat Intelligence
  isVpn: boolean
  isProxy: boolean
  isTor: boolean
  isDatacenter: boolean
  isHosting: boolean

  // NEW: Risk Score (0-100)
  riskScore: number
}

/**
 * Enhanced geolocation with ZIP codes and threat detection
 */
export async function getEnhancedLocation(ip: string): Promise<EnhancedLocationData> {
  try {
    // Use fast-geoip for better accuracy and ZIP codes
    const fastGeoip = await import('fast-geoip')
    const geo = await fastGeoip.default.lookup(ip)

    // Basic threat detection (DIY since packages don't exist on npm)
    const isVpn = detectVPN(ip, geo)
    const isProxy = detectProxy(ip, geo)
    const isTor = detectTor(ip)
    const isDatacenter = detectDatacenter(geo?.organization || '')
    const isHosting = detectHosting(geo?.organization || '')

    // Calculate risk score
    let riskScore = 0
    if (isVpn) riskScore += 30
    if (isProxy) riskScore += 40
    if (isTor) riskScore += 50
    if (isDatacenter) riskScore += 45
    if (isHosting) riskScore += 35

    return {
      ip,
      country: geo?.country || null,
      city: geo?.city || null,
      region: geo?.region || null,
      zipCode: geo?.postal || null,  // fast-geoip provides ZIP/postal codes!
      timezone: geo?.timezone || null,
      latitude: geo?.ll?.[0] || null,
      longitude: geo?.ll?.[1] || null,

      isp: geo?.org || null,
      asn: extractASN(geo?.org || ''),
      organization: geo?.org || null,

      isVpn,
      isProxy,
      isProxy,
      isTor,
      isDatacenter,
      isHosting,

      riskScore: Math.min(riskScore, 100)
    }
  } catch (error) {
    console.error('[Enhanced Geolocation] Error:', error)

    // Fallback to basic detection
    return {
      ip,
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
  }
}

/**
 * Detect VPN usage (basic heuristics)
 */
function detectVPN(ip: string, geo: any): boolean {
  if (!geo) return false

  // Common VPN providers in organization name
  const vpnKeywords = ['vpn', 'virtual private', 'nordvpn', 'expressvpn', 'surfshark', 'protonvpn', 'mullvad']
  const org = (geo.org || '').toLowerCase()

  return vpnKeywords.some(keyword => org.includes(keyword))
}

/**
 * Detect proxy usage
 */
function detectProxy(ip: string, geo: any): boolean {
  if (!geo) return false

  const proxyKeywords = ['proxy', 'anonymizer', 'privacy']
  const org = (geo.org || '').toLowerCase()

  return proxyKeywords.some(keyword => org.includes(keyword))
}

/**
 * Detect Tor exit nodes (basic check)
 */
function detectTor(ip: string): boolean {
  // Known Tor exit node IP ranges (simplified - in production use tor-exit-nodes API)
  // This is a placeholder - real implementation would check against Tor directory
  return false // TODO: Implement Tor detection via API
}

/**
 * Detect datacenter IPs (90% of bots come from datacenters)
 */
function detectDatacenter(org: string): boolean {
  const datacenterKeywords = [
    'datacenter', 'data center', 'hosting', 'cloud', 'server',
    'linode', 'digitalocean', 'hetzner', 'ovh', 'kimsufi'
  ]

  const orgLower = org.toLowerCase()
  return datacenterKeywords.some(keyword => orgLower.includes(keyword))
}

/**
 * Detect major cloud hosting providers
 */
function detectHosting(org: string): boolean {
  const hostingProviders = [
    'amazon', 'aws', 'amazon web services',
    'google cloud', 'gcp', 'google llc',
    'microsoft azure', 'microsoft corporation',
    'cloudflare', 'akamai', 'fastly'
  ]

  const orgLower = org.toLowerCase()
  return hostingProviders.some(provider => orgLower.includes(provider))
}

/**
 * Extract ASN from organization string
 */
function extractASN(org: string): number | null {
  // ASN format: "AS12345" or "AS 12345"
  const asnMatch = org.match(/AS\s?(\d+)/i)
  return asnMatch ? parseInt(asnMatch[1]) : null
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
  const speed = distance / hoursDiff // km/h

  // Flag if speed > 1000 km/h (impossible for most travel)
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
