// app/lib/analytics/extract-geo.ts
// Extract geographic data from client IP using geoip-lite

import { headers } from 'next/headers'

interface GeoData {
  country: string | null
  region: string | null
  city: string | null
}

export async function extractGeoFromHeaders(): Promise<GeoData> {
  const headersList = await headers()
  const ip = getClientIP(headersList)

  if (!ip) return { country: null, region: null, city: null }

  try {
    const geoip = require('geoip-lite')
    const geo = geoip.lookup(ip)
    if (geo) {
      return {
        country: geo.country || null,
        region: geo.region || null,
        city: geo.city || null,
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
