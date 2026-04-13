// app/lib/analytics/reverse-geocode.ts
// Shared Nominatim reverse geocoding — used by IP enrichment and GPS enrichment.
// 24h in-memory cache by rounded lat/lng. Rate: 1 req/sec (Nominatim policy).

const addressCache = new Map<string, { address: string; expires: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Reverse geocode lat/lng to a human-readable address via OpenStreetMap Nominatim.
 * Returns null on failure. Cached for 24h per ~100m precision grid cell.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  // Round to 3 decimals (~100m precision) for cache key
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`
  const cached = addressCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) return cached.address

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'en', 'User-Agent': 'ITWhip/1.0 (info@itwhip.com)' },
        signal: AbortSignal.timeout(3000),
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    const address = data.display_name || null
    if (address) {
      addressCache.set(cacheKey, { address, expires: Date.now() + CACHE_TTL })
      // Cap cache size
      if (addressCache.size > 500) {
        const oldest = addressCache.keys().next().value
        if (oldest) addressCache.delete(oldest)
      }
    }
    return address
  } catch {
    return null
  }
}
