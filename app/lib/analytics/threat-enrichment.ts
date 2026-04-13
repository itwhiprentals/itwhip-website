// app/lib/analytics/threat-enrichment.ts
// Orchestrates geo + threat intel enrichment for page views.
// Pure data — no DB access. Returns flat object matching PageView fields.

import { getEnhancedLocation } from '@/app/lib/security/geolocation'
import { reverseGeocode } from './reverse-geocode'

export interface ThreatEnrichment {
  ip: string | null
  country: string | null
  region: string | null
  city: string | null
  isp: string | null
  asn: string | null
  org: string | null
  isVpn: boolean
  isProxy: boolean
  isTor: boolean
  isHosting: boolean
  riskScore: number
  latitude: number | null
  longitude: number | null
  address: string | null
}

const EMPTY: ThreatEnrichment = {
  ip: null, country: null, region: null, city: null,
  isp: null, asn: null, org: null,
  isVpn: false, isProxy: false, isTor: false, isHosting: false,
  riskScore: 0, latitude: null, longitude: null, address: null,
}

// reverseGeocode imported from ./reverse-geocode.ts (shared with GPS enrichment)

/**
 * Enrich an IP address with full geo + threat intel.
 * Uses getEnhancedLocation (geoip-lite → ip-api fallback → ProxyCheck).
 * Cached at the ProxyCheck layer (5-min TTL per IP).
 * Safe to call on every page view — returns EMPTY for private/missing IPs.
 */
export async function enrichIp(ip: string | null): Promise<ThreatEnrichment> {
  if (!ip || ip === '127.0.0.1' || ip === '::1') return EMPTY

  try {
    const loc = await getEnhancedLocation(ip)

    // Reverse geocode for physical address (non-blocking, cached)
    let address: string | null = null
    if (loc.latitude != null && loc.longitude != null) {
      address = await reverseGeocode(loc.latitude, loc.longitude)
    }

    return {
      ip: loc.ip,
      country: loc.country,
      region: loc.region,
      city: loc.city,
      isp: loc.isp,
      asn: loc.asn != null ? String(loc.asn) : null,
      org: loc.organization,
      isVpn: loc.isVpn,
      isProxy: loc.isProxy,
      isTor: loc.isTor,
      isHosting: loc.isDatacenter,
      riskScore: Math.min(loc.riskScore, 100),
      latitude: loc.latitude,
      longitude: loc.longitude,
      address,
    }
  } catch (err) {
    console.error('[ThreatEnrichment] Failed for', ip, err)
    return { ...EMPTY, ip }
  }
}
