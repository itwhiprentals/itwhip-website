// app/lib/analytics/extract-geo.ts
// Extract geographic data from client IP using geoip-lite

import { headers } from 'next/headers'

interface GeoData {
  country: string | null
  region: string | null
  city: string | null
}

// In-memory cache to avoid hammering the API for repeat IPs
const geoCache = new Map<string, { data: GeoData; expires: number }>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

export async function extractGeoFromHeaders(): Promise<GeoData> {
  const headersList = await headers()
  const ip = getClientIP(headersList)

  if (!ip) return { country: null, region: null, city: null }

  // Check cache first
  const cached = geoCache.get(ip)
  if (cached && cached.expires > Date.now()) return cached.data

  // Try geoip-lite first (local DB, no network call)
  try {
    const geoip = require('geoip-lite')
    const geo = geoip.lookup(ip)
    if (geo?.country) {
      const data = { country: geo.country, region: geo.region || null, city: geo.city || null }
      geoCache.set(ip, { data, expires: Date.now() + CACHE_TTL })
      return data
    }
  } catch {}

  // Fallback: ip-api.com (free, no key needed, 45 req/min)
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,countryCode,regionName,city`, {
      signal: AbortSignal.timeout(2000),
    })
    if (res.ok) {
      const json = await res.json()
      if (json.status === 'success') {
        const data = { country: json.countryCode || null, region: json.regionName || null, city: json.city || null }
        geoCache.set(ip, { data, expires: Date.now() + CACHE_TTL })
        return data
      }
    }
  } catch {}

  return { country: null, region: null, city: null }
}

export function getClientIP(headersList: Headers): string | null {
  const ipHeaders = ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip']

  for (const header of ipHeaders) {
    const value = headersList.get(header)
    if (value) {
      const ip = value.split(',')[0].trim()
      if (ip && ip !== '127.0.0.1' && ip !== '::1') return ip
    }
  }

  return null
}
