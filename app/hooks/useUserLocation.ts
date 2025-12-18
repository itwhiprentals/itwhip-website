// app/hooks/useUserLocation.ts
'use client'

import { useState, useEffect } from 'react'

// Arizona cities we serve (where we have inventory)
export const ARIZONA_CITIES = [
  'Phoenix',
  'Scottsdale',
  'Tempe',
  'Mesa',
  'Chandler',
  'Gilbert',
  'Glendale',
  'Peoria',
  'Surprise',
  'Goodyear',
  'Tucson',
  'Flagstaff',
  'Cave Creek',
  'Paradise Valley',
  'Fountain Hills',
  'Queen Creek',
  'Avondale',
  'Buckeye',
  'Maricopa',
  'Casa Grande'
]

interface UserLocation {
  city: string | null
  state: string | null
  displayLocation: string // For headlines: "Phoenix" or "Arizona"
  displayLocationFull: string // For sections: "Phoenix, AZ" or "Arizona"
  isInArizona: boolean
  isServedCity: boolean
  isLoading: boolean
  error: string | null
}

interface CachedLocation {
  city: string | null
  state: string | null
  region: string | null
  isInArizona: boolean
  isServedCity: boolean
  timestamp: number
}

const CACHE_KEY = 'itwhip_user_location'
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

// Check if a city is in our served list (case-insensitive)
function isServedCity(city: string | null): boolean {
  if (!city) return false
  return ARIZONA_CITIES.some(
    servedCity => servedCity.toLowerCase() === city.toLowerCase()
  )
}

// Normalize city name to match our list
function normalizeCity(city: string | null): string | null {
  if (!city) return null
  const matched = ARIZONA_CITIES.find(
    servedCity => servedCity.toLowerCase() === city.toLowerCase()
  )
  return matched || city
}

// Safe localStorage getter
function getCachedLocation(): CachedLocation | null {
  if (typeof window === 'undefined') return null
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) {
      console.log('[Location] No cached location found')
      return null
    }
    const data = JSON.parse(cached) as CachedLocation
    console.log('[Location] Loaded from cache:', data)
    return data
  } catch (e) {
    console.error('[Location] Failed to parse cached location:', e)
    return null
  }
}

// Safe localStorage setter
function setCachedLocation(data: CachedLocation): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    console.log('[Location] Saved to cache:', data)
  } catch (e) {
    console.error('[Location] Failed to save location to cache:', e)
  }
}

export function useUserLocation(): UserLocation {
  const [location, setLocation] = useState<UserLocation>({
    city: null,
    state: null,
    displayLocation: 'Arizona',
    displayLocationFull: 'Arizona',
    isInArizona: false,
    isServedCity: false,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    const detectLocation = async () => {
      // Step 1: Check cache first
      const cached = getCachedLocation()

      if (cached) {
        const age = Date.now() - cached.timestamp
        const isExpired = age > CACHE_DURATION
        const daysOld = Math.floor(age / (24 * 60 * 60 * 1000))

        console.log(`[Location] Cache age: ${daysOld} days, expired: ${isExpired}`)

        // Use cached value if not expired
        if (!isExpired) {
          const normalizedCity = normalizeCity(cached.city)
          const served = cached.isServedCity || isServedCity(normalizedCity)

          console.log('[Location] Using cached location:', {
            city: normalizedCity,
            isServedCity: served,
            isInArizona: cached.isInArizona
          })

          setLocation({
            city: normalizedCity,
            state: cached.state,
            displayLocation: cached.isInArizona && served ? normalizedCity! : 'Arizona',
            displayLocationFull: cached.isInArizona && served
              ? `${normalizedCity}, AZ`
              : 'Arizona',
            isInArizona: cached.isInArizona,
            isServedCity: served,
            isLoading: false,
            error: null
          })
          return
        }

        console.log('[Location] Cache expired, will refresh from API')
      }

      // Step 2: Fetch fresh location from API
      try {
        console.log('[Location] Fetching from API...')

        const response = await fetch('/api/user-location', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`)
        }

        const data = await response.json()
        console.log('[Location] API response:', data)

        const isInAZ = data.region === 'Arizona' || data.region === 'AZ'
        const normalizedCity = normalizeCity(data.city)
        const served = isServedCity(normalizedCity)

        console.log('[Location] Processed API data:', {
          city: normalizedCity,
          isInAZ,
          served
        })

        // Cache the result
        const cacheData: CachedLocation = {
          city: normalizedCity,
          state: data.region,
          region: data.region,
          isInArizona: isInAZ,
          isServedCity: served,
          timestamp: Date.now()
        }
        setCachedLocation(cacheData)

        setLocation({
          city: normalizedCity,
          state: data.region,
          displayLocation: isInAZ && served ? normalizedCity! : 'Arizona',
          displayLocationFull: isInAZ && served ? `${normalizedCity}, AZ` : 'Arizona',
          isInArizona: isInAZ,
          isServedCity: served,
          isLoading: false,
          error: null
        })

      } catch (error) {
        console.error('[Location] API error:', error)

        // Step 3: On API failure, use cached value even if expired
        if (cached && cached.city && cached.isServedCity) {
          console.log('[Location] API failed, using expired cache as fallback')

          const normalizedCity = normalizeCity(cached.city)
          const served = cached.isServedCity || isServedCity(normalizedCity)

          setLocation({
            city: normalizedCity,
            state: cached.state,
            displayLocation: cached.isInArizona && served ? normalizedCity! : 'Arizona',
            displayLocationFull: cached.isInArizona && served
              ? `${normalizedCity}, AZ`
              : 'Arizona',
            isInArizona: cached.isInArizona,
            isServedCity: served,
            isLoading: false,
            error: 'Using cached location (API failed)'
          })
          return
        }

        // Step 4: No cache available, default to Arizona
        console.log('[Location] No cache available, defaulting to Arizona')
        setLocation({
          city: null,
          state: null,
          displayLocation: 'Arizona',
          displayLocationFull: 'Arizona',
          isInArizona: false,
          isServedCity: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    detectLocation()
  }, [])

  return location
}

// Helper to clear location cache (useful for testing)
export function clearLocationCache(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CACHE_KEY)
    console.log('[Location] Cache cleared')
  }
}

// Helper to force refresh location (clears cache and triggers re-fetch)
export function forceRefreshLocation(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CACHE_KEY)
    console.log('[Location] Cache cleared, reload page to refresh location')
  }
}
