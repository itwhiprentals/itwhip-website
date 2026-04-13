// app/lib/analytics/gps-collector.ts
// Standalone GPS collection — no React dependency.
// Caches result in module-level variable (one prompt per session).
// Silent failure if user denies or browser doesn't support geolocation.

export interface GpsData {
  lat: number
  lng: number
  accuracy: number // meters
}

let cachedGps: GpsData | null = null
let requested = false

/**
 * Request browser GPS. Returns cached result on subsequent calls.
 * First call triggers the browser permission prompt.
 * Returns null if denied, unavailable, or timed out.
 */
export function requestGps(): Promise<GpsData | null> {
  // Return cache immediately if we already have it
  if (cachedGps) return Promise.resolve(cachedGps)

  // Only prompt once per session
  if (requested) return Promise.resolve(null)
  requested = true

  // No geolocation API (e.g. older browser, non-secure context)
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve(null)
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        cachedGps = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }
        resolve(cachedGps)
      },
      () => {
        // User denied or error — resolve null, don't reject
        resolve(null)
      },
      {
        enableHighAccuracy: false, // WiFi/cell triangulation — faster, less battery
        timeout: 5000,            // Give up after 5s
        maximumAge: 300000,       // Accept 5-min-old cached position
      }
    )
  })
}

/** Get cached GPS without triggering a new request */
export function getCachedGps(): GpsData | null {
  return cachedGps
}
