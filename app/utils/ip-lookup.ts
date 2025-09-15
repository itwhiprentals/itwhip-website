// app/utils/ip-lookup.ts

interface IpLookupResult {
  success: boolean
  ipAddress: string
  country?: string
  countryCode?: string
  region?: string
  city?: string
  latitude?: number
  longitude?: number
  timezone?: string
  isp?: string
  org?: string
  asn?: string
  mobile?: boolean
  proxy?: boolean
  hosting?: boolean
  vpn?: boolean
  tor?: boolean
  riskScore?: number
  riskFactors?: string[]
  vpnDetected?: boolean
  proxyDetected?: boolean
  torDetected?: boolean
}

interface IpApiResponse {
  status: string
  country: string
  countryCode: string
  region: string
  regionName: string
  city: string
  zip: string
  lat: number
  lon: number
  timezone: string
  isp: string
  org: string
  as: string
  mobile: boolean
  proxy: boolean
  hosting: boolean
  query: string
}

// Extract real IP from various headers
export function extractIpAddress(headers: Headers): string {
  // Check various headers in order of preference
  const headerNames = [
    'cf-connecting-ip',     // Cloudflare
    'x-real-ip',           // Nginx proxy
    'x-forwarded-for',     // Standard proxy
    'x-client-ip',         // Apache
    'true-client-ip',      // Akamai, Cloudflare Enterprise
    'x-cluster-client-ip', // Rackspace
    'forwarded',           // RFC 7239
    'fastly-client-ip',    // Fastly CDN
    'x-forwarded',         // General
    'x-original-forwarded-for'
  ]
  
  for (const headerName of headerNames) {
    const value = headers.get(headerName)
    if (value) {
      // X-Forwarded-For can contain multiple IPs
      const ips = value.split(',').map(ip => ip.trim())
      const validIp = ips.find(ip => isValidIp(ip) && !isPrivateIp(ip))
      if (validIp) return validIp
    }
  }
  
  // Fallback - might be local/private
  return '127.0.0.1'
}

// Export alias for backward compatibility
export { extractIpAddress as extractIpFromHeaders }

// Validate IP address format
function isValidIp(ip: string): boolean {
  // IPv4
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.')
    return parts.every(part => {
      const num = parseInt(part, 10)
      return num >= 0 && num <= 255
    })
  }
  
  // IPv6 (simplified check)
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
  return ipv6Regex.test(ip)
}

// Check if IP is private/local
function isPrivateIp(ip: string): boolean {
  const privateRanges = [
    /^10\./,                    // 10.0.0.0 - 10.255.255.255
    /^172\.(1[6-9]|2[0-9]|3[01])\./, // 172.16.0.0 - 172.31.255.255
    /^192\.168\./,              // 192.168.0.0 - 192.168.255.255
    /^127\./,                   // 127.0.0.0 - 127.255.255.255 (loopback)
    /^169\.254\./,              // 169.254.0.0 - 169.254.255.255 (link-local)
    /^::1$/,                    // IPv6 loopback
    /^fc00:/,                   // IPv6 private
    /^fe80:/                    // IPv6 link-local
  ]
  
  return privateRanges.some(range => range.test(ip))
}

// Main IP lookup function using free ip-api.com
export async function lookupIp(ipAddress: string): Promise<IpLookupResult> {
  // Don't lookup private IPs
  if (isPrivateIp(ipAddress)) {
    return {
      success: false,
      ipAddress,
      riskScore: 0,
      riskFactors: ['private_ip']
    }
  }
  
  try {
    // Use ip-api.com (free, 45 requests per minute)
    const response = await fetch(
      `http://ip-api.com/json/${ipAddress}?fields=status,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting,query`,
      { 
        signal: AbortSignal.timeout(5000) // 5 second timeout
      }
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data: IpApiResponse = await response.json()
    
    if (data.status !== 'success') {
      return {
        success: false,
        ipAddress,
        riskScore: 0
      }
    }
    
    // Detect VPN/Proxy
    const vpnDetected = detectVpn(data.isp, data.org, data.as)
    const torDetected = detectTor(ipAddress, data.isp)
    
    // Calculate risk score
    const riskFactors: string[] = []
    let riskScore = 0
    
    if (data.proxy) {
      riskFactors.push('proxy_detected')
      riskScore += 30
    }
    
    if (data.hosting) {
      riskFactors.push('datacenter_ip')
      riskScore += 25
    }
    
    if (vpnDetected) {
      riskFactors.push('vpn_detected')
      riskScore += 20
    }
    
    if (torDetected) {
      riskFactors.push('tor_exit_node')
      riskScore += 40
    }
    
    // High-risk countries (customize based on your needs)
    const highRiskCountries = ['RU', 'CN', 'NG', 'PK', 'VN', 'UA', 'RO']
    if (highRiskCountries.includes(data.countryCode)) {
      riskFactors.push('high_risk_country')
      riskScore += 15
    }
    
    // Check for incomplete location data (suspicious)
    if (!data.city || !data.region) {
      riskFactors.push('incomplete_location')
      riskScore += 10
    }
    
    return {
      success: true,
      ipAddress,
      country: data.country,
      countryCode: data.countryCode,
      region: data.regionName,
      city: data.city,
      latitude: data.lat,
      longitude: data.lon,
      timezone: data.timezone,
      isp: data.isp,
      org: data.org,
      asn: data.as,
      mobile: data.mobile,
      proxy: data.proxy,
      hosting: data.hosting,
      vpn: vpnDetected,
      tor: torDetected,
      vpnDetected: vpnDetected,
      proxyDetected: data.proxy,
      torDetected: torDetected,
      riskScore: Math.min(100, riskScore),
      riskFactors
    }
    
  } catch (error) {
    console.error('IP lookup failed:', error)
    return {
      success: false,
      ipAddress,
      riskScore: 0,
      riskFactors: ['lookup_failed']
    }
  }
}

// Detect VPN providers
function detectVpn(isp: string, org: string, asn: string): boolean {
  const vpnProviders = [
    'nordvpn', 'expressvpn', 'surfshark', 'cyberghost',
    'privateinternetaccess', 'pia', 'ipvanish', 'vyprvpn',
    'tunnelbear', 'windscribe', 'mullvad', 'protonvpn',
    'hide.me', 'hotspot shield', 'purevpn', 'zenmate',
    'privatevpn', 'ivpn', 'trust.zone', 'vpn unlimited',
    'strongvpn', 'safervpn', 'hidemy.name', 'perfect privacy',
    'air vpn', 'astrill', 'ovpn', 'securevpn',
    'datapacket', 'leaseweb', 'choopa', 'vultr',
    'digitalocean', 'ovh', 'hetzner', 'm247'
  ]
  
  const combined = `${isp} ${org} ${asn}`.toLowerCase()
  return vpnProviders.some(provider => combined.includes(provider))
}

// Detect Tor exit nodes
function detectTor(ip: string, isp: string): boolean {
  // Known Tor exit node ISPs
  const torIndicators = [
    'tor exit', 'torservers', 'tor-exit', 'tor node',
    'foundation for applied privacy', 'torproject'
  ]
  
  const ispLower = isp.toLowerCase()
  return torIndicators.some(indicator => ispLower.includes(indicator))
}

// Calculate distance between two coordinates (in miles)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

// Check for location mismatch
export function checkLocationMismatch(
  bookingLat: number,
  bookingLon: number,
  pickupLat: number,
  pickupLon: number,
  thresholdMiles: number = 500
): { mismatch: boolean; distance: number } {
  const distance = calculateDistance(bookingLat, bookingLon, pickupLat, pickupLon)
  return {
    mismatch: distance > thresholdMiles,
    distance
  }
}

// Check if IP is from same subnet (potential same network)
export function isSameSubnet(ip1: string, ip2: string): boolean {
  if (!isValidIp(ip1) || !isValidIp(ip2)) return false
  
  const parts1 = ip1.split('.')
  const parts2 = ip2.split('.')
  
  // Check if first 3 octets match (same /24 subnet)
  return parts1[0] === parts2[0] && 
         parts1[1] === parts2[1] && 
         parts1[2] === parts2[2]
}

// Batch IP analysis for pattern detection
export async function analyzeIpPattern(ips: string[]): Promise<{
  uniqueCountries: number
  uniqueCities: number
  vpnCount: number
  proxyCount: number
  datacenterCount: number
  suspiciousPattern: boolean
}> {
  const results = await Promise.all(ips.map(ip => lookupIp(ip)))
  
  const countries = new Set(results.filter(r => r.success).map(r => r.countryCode))
  const cities = new Set(results.filter(r => r.success).map(r => r.city))
  
  const vpnCount = results.filter(r => r.vpn).length
  const proxyCount = results.filter(r => r.proxy).length
  const datacenterCount = results.filter(r => r.hosting).length
  
  // Suspicious if all from VPN/proxy/datacenter
  const suspiciousPattern = 
    (vpnCount + proxyCount + datacenterCount) / ips.length > 0.7
  
  return {
    uniqueCountries: countries.size,
    uniqueCities: cities.size,
    vpnCount,
    proxyCount,
    datacenterCount,
    suspiciousPattern
  }
}

// Get location string for display
export function formatLocation(result: IpLookupResult): string {
  if (!result.success) return 'Unknown'
  
  const parts = []
  if (result.city) parts.push(result.city)
  if (result.region && result.region !== result.city) parts.push(result.region)
  if (result.country) parts.push(result.country)
  
  return parts.join(', ') || 'Unknown'
}

// Export types
export type { IpLookupResult, IpApiResponse }