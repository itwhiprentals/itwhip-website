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
  timestamp: number
}

const CACHE_KEY = 'itwhip_user_location'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

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
      try {
        // Check cache first
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const cachedData: CachedLocation = JSON.parse(cached)
          const isExpired = Date.now() - cachedData.timestamp > CACHE_DURATION

          if (!isExpired) {
            const normalizedCity = normalizeCity(cachedData.city)
            const served = isServedCity(normalizedCity)

            setLocation({
              city: normalizedCity,
              state: cachedData.state,
              displayLocation: cachedData.isInArizona && served ? normalizedCity! : 'Arizona',
              displayLocationFull: cachedData.isInArizona && served
                ? `${normalizedCity}, AZ`
                : 'Arizona',
              isInArizona: cachedData.isInArizona,
              isServedCity: served,
              isLoading: false,
              error: null
            })
            return
          }
        }

        // Fetch location from our API
        const response = await fetch('/api/user-location', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to detect location')
        }

        const data = await response.json()

        const isInAZ = data.region === 'Arizona' || data.region === 'AZ'
        const normalizedCity = normalizeCity(data.city)
        const served = isServedCity(normalizedCity)

        // Cache the result
        const cacheData: CachedLocation = {
          city: normalizedCity,
          state: data.region,
          region: data.region,
          isInArizona: isInAZ,
          timestamp: Date.now()
        }
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))

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
        console.error('Location detection error:', error)
        // Default to Arizona on error
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
  }
}
