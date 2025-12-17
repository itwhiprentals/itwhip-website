// app/api/user-location/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { extractIpAddress } from '@/app/utils/ip-lookup'

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
  query: string
}

export async function GET(request: NextRequest) {
  try {
    // Extract real IP from headers
    const ipAddress = extractIpAddress(request.headers)

    // For local development, use a default Phoenix location
    if (ipAddress === '127.0.0.1' || ipAddress.startsWith('192.168') || ipAddress.startsWith('10.')) {
      return NextResponse.json({
        success: true,
        city: 'Phoenix',
        region: 'Arizona',
        country: 'United States',
        countryCode: 'US',
        latitude: 33.4484,
        longitude: -112.0740,
        isLocal: true
      })
    }

    // Use ip-api.com for geolocation (free, 45 requests per minute)
    const response = await fetch(
      `http://ip-api.com/json/${ipAddress}?fields=status,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,query`,
      {
        signal: AbortSignal.timeout(5000), // 5 second timeout
        headers: {
          'Accept': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`IP API request failed: ${response.status}`)
    }

    const data: IpApiResponse = await response.json()

    if (data.status !== 'success') {
      // Return default Arizona location on failure
      return NextResponse.json({
        success: false,
        city: null,
        region: null,
        country: null,
        countryCode: null,
        latitude: null,
        longitude: null,
        error: 'Location lookup failed'
      })
    }

    return NextResponse.json({
      success: true,
      city: data.city,
      region: data.regionName,
      country: data.country,
      countryCode: data.countryCode,
      latitude: data.lat,
      longitude: data.lon,
      timezone: data.timezone
    })

  } catch (error) {
    console.error('[User Location API] Error:', error)

    // Return default Arizona on error
    return NextResponse.json({
      success: false,
      city: null,
      region: null,
      country: null,
      countryCode: null,
      latitude: null,
      longitude: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
