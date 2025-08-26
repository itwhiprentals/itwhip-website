// app/api/v3/amadeus/search/route.ts

import { NextResponse } from 'next/server'
import { cachedAmadeusRequest } from '@/app/lib/amadeus-auth'

/**
 * GET /api/v3/amadeus/search
 * Search for hotels in Phoenix to see what's available in Amadeus test data
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const cityCode = url.searchParams.get('city') || 'PHX'
    const radius = url.searchParams.get('radius') || '50'
    
    console.log(`Searching for hotels in ${cityCode}...`)
    
    // Search by city code
    const hotelsData = await cachedAmadeusRequest(
      `/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}&radius=${radius}&radiusUnit=KM`,
      `search-${cityCode}-${radius}`,
      3600000
    )
    
    if (!hotelsData?.data || hotelsData.data.length === 0) {
      return NextResponse.json({
        success: false,
        message: `No hotels found in ${cityCode}`,
        suggestion: 'Try cityCode=NYC or LON or PAR'
      })
    }
    
    // Format the results
    const hotels = hotelsData.data.slice(0, 20).map((hotel: any) => ({
      hotelId: hotel.hotelId,
      name: hotel.name,
      iataCode: hotel.iataCode,
      address: {
        cityName: hotel.address?.cityName,
        stateCode: hotel.address?.stateCode,
        countryCode: hotel.address?.countryCode
      },
      distance: hotel.distance ? `${hotel.distance.value} ${hotel.distance.unit}` : 'N/A',
      geoCode: hotel.geoCode
    }))
    
    return NextResponse.json({
      success: true,
      city: cityCode,
      totalFound: hotelsData.data.length,
      showing: hotels.length,
      hotels: hotels,
      note: 'These are the hotels available in Amadeus test environment',
      howToUse: 'Use any of these hotelIds in the hotel-details endpoint'
    })
    
  } catch (error: any) {
    console.error('Search error:', error)
    
    // Try different cities if PHX fails
    if (error.message?.includes('No hotels found')) {
      return NextResponse.json({
        success: false,
        message: 'Phoenix might not have test data',
        suggestion: 'Trying alternative cities...',
        alternativeCities: ['NYC', 'LON', 'PAR', 'LAX', 'CHI', 'MIA'],
        example: '/api/v3/amadeus/search?city=NYC'
      })
    }
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Search failed'
    }, { status: 500 })
  }
}