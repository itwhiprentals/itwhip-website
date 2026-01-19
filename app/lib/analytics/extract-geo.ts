// app/lib/analytics/extract-geo.ts
// Extract geographic data from request headers
// Works with Vercel, Cloudflare, and other CDN headers

import { headers } from 'next/headers'

interface GeoData {
  country: string | null
  region: string | null
  city: string | null
}

export async function extractGeoFromHeaders(): Promise<GeoData> {
  const headersList = await headers()

  // Try Vercel headers first (most common for Next.js deployments)
  let country = headersList.get('x-vercel-ip-country')
  let region = headersList.get('x-vercel-ip-country-region')
  let city = headersList.get('x-vercel-ip-city')

  // Fallback to Cloudflare headers
  if (!country) {
    country = headersList.get('cf-ipcountry')
  }
  if (!city) {
    city = headersList.get('cf-ipcity')
  }
  if (!region) {
    region = headersList.get('cf-region')
  }

  // Decode URL-encoded city names (common with Vercel)
  if (city) {
    try {
      city = decodeURIComponent(city)
    } catch {
      // Keep original if decode fails
    }
  }

  return {
    country: country || null,
    region: region || null,
    city: city || null
  }
}

export function getClientIP(headersList: Headers): string | null {
  // Try various headers in order of preference
  const ipHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',
    'x-vercel-forwarded-for'
  ]

  for (const header of ipHeaders) {
    const value = headersList.get(header)
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first
      const ip = value.split(',')[0].trim()
      // Basic validation - not localhost
      if (ip && ip !== '127.0.0.1' && ip !== '::1') {
        return ip
      }
    }
  }

  return null
}
