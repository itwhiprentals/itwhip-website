// app/api/v3/amadeus/hotel-details/route.ts

import { NextResponse } from 'next/server'
import { amadeusRequest, cachedAmadeusRequest } from '@/app/lib/amadeus-auth'

// Type definitions for Amadeus hotel data
interface AmadeusHotelData {
  hotelId: string
  name: string
  iataCode?: string
  dupeId?: number
  chainCode?: string
  brandCode?: string
  address: {
    lines?: string[]
    postalCode?: string
    cityName?: string
    countryCode?: string
    stateCode?: string
  }
  geoCode?: {
    latitude: number
    longitude: number
  }
  amenities?: string[]
  description?: {
    lang: string
    text: string
  }
  contact?: {
    phone?: string
    fax?: string
    email?: string
  }
  media?: Array<{
    uri: string
    category: string
  }>
}

/**
 * GET /api/v3/amadeus/hotel-details
 * Fetches real hotel information from Amadeus API
 * 
 * Query params:
 * - hotelId: Amadeus hotel code (e.g., "PHXMAR", "PHXHILTON")
 * - details: Include detailed information (optional)
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const hotelId = url.searchParams.get('hotelId')
    const includeDetails = url.searchParams.get('details') === 'true'
    
    // Validate hotel ID
    if (!hotelId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Hotel ID is required',
          message: 'Please provide a hotelId parameter'
        },
        { status: 400 }
      )
    }
    
    // Clean and validate hotel ID format
    const cleanHotelId = hotelId.toUpperCase().trim()
    if (!/^[A-Z0-9]{3,10}$/.test(cleanHotelId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid hotel ID format',
          message: 'Hotel ID should be 3-10 alphanumeric characters'
        },
        { status: 400 }
      )
    }
    
    console.log(`Fetching hotel details for: ${cleanHotelId}`)
    
    // Try to get hotel reference data first (basic info)
    try {
      const referenceData = await cachedAmadeusRequest(
        `/v1/reference-data/locations/hotels/by-hotels?hotelIds=${cleanHotelId}`,
        `hotel-ref-${cleanHotelId}`,
        3600000 // Cache for 1 hour
      )
      
      if (!referenceData?.data || referenceData.data.length === 0) {
        // Hotel not found
        return NextResponse.json(
          {
            success: false,
            error: 'Hotel not found',
            message: `No hotel found with ID: ${cleanHotelId}`,
            suggestion: 'Try common codes like PHXMAR (Marriott Phoenix) or PHXHILTON (Hilton Phoenix)'
          },
          { status: 404 }
        )
      }
      
      const hotelData: AmadeusHotelData = referenceData.data[0]
      
      // Build response with hotel information
      const response: any = {
        success: true,
        hotel: {
          hotelId: hotelData.hotelId,
          name: formatHotelName(hotelData.name),
          chainCode: hotelData.chainCode,
          brandCode: hotelData.brandCode,
          address: formatAddress(hotelData.address),
          location: hotelData.geoCode ? {
            latitude: hotelData.geoCode.latitude,
            longitude: hotelData.geoCode.longitude
          } : null,
          contact: hotelData.contact || {},
          amenities: hotelData.amenities || []
        },
        timestamp: new Date().toISOString()
      }
      
      // If details requested, try to get hotel offers for availability
      if (includeDetails) {
        try {
          // Get current date for checking availability
          const today = new Date().toISOString().split('T')[0]
          const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
          
          const offersData = await cachedAmadeusRequest(
            `/v3/shopping/hotel-offers?hotelIds=${cleanHotelId}&checkInDate=${today}&checkOutDate=${tomorrow}&adults=1`,
            `hotel-offers-${cleanHotelId}-${today}`,
            1800000 // Cache for 30 minutes (availability changes more frequently)
          )
          
          if (offersData?.data && offersData.data.length > 0) {
            const hotelOffer = offersData.data[0]
            
            // Add availability and pricing information
            response.availability = {
              available: hotelOffer.available || false,
              offersCount: hotelOffer.offers?.length || 0,
              checkIn: today,
              checkOut: tomorrow
            }
            
            // Add room information if available
            if (hotelOffer.offers && hotelOffer.offers.length > 0) {
              const lowestOffer = hotelOffer.offers.reduce((min: any, offer: any) => 
                (!min || parseFloat(offer.price?.total) < parseFloat(min.price?.total)) ? offer : min
              )
              
              response.availability.lowestPrice = {
                amount: lowestOffer.price?.total,
                currency: lowestOffer.price?.currency || 'USD'
              }
              
              response.availability.roomTypes = hotelOffer.offers.map((offer: any) => ({
                type: offer.room?.typeEstimated?.category || 'STANDARD',
                bedType: offer.room?.typeEstimated?.bedType || 'UNKNOWN',
                price: offer.price?.total,
                currency: offer.price?.currency || 'USD'
              }))
            }
            
            // Add hotel description if available
            if (hotelOffer.hotel?.description) {
              response.hotel.description = hotelOffer.hotel.description.text
            }
            
            // Add media/images if available
            if (hotelOffer.hotel?.media) {
              response.hotel.images = hotelOffer.hotel.media.slice(0, 5) // Limit to 5 images
            }
          }
        } catch (offersError) {
          console.log('Could not fetch hotel offers, continuing with basic data')
          response.availability = {
            available: null,
            message: 'Availability data not available'
          }
        }
      }
      
      // Calculate metrics for torture dashboard
      response.metrics = calculateHotelMetrics(response.hotel, response.availability)
      
      return NextResponse.json(response, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=3600', // Cache for 1 hour
          'X-Hotel-Id': cleanHotelId
        }
      })
      
    } catch (amadeusError: any) {
      console.error('Amadeus API error:', amadeusError)
      
      // Handle specific Amadeus errors
      if (amadeusError.message?.includes('Rate limited')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.',
            retryAfter: 60
          },
          { status: 429 }
        )
      }
      
      // Return mock data for demo purposes if Amadeus fails
      return NextResponse.json({
        success: true,
        demo: true,
        hotel: getMockHotelData(cleanHotelId),
        message: 'Using demo data (Amadeus API temporarily unavailable)',
        timestamp: new Date().toISOString()
      })
    }
    
  } catch (error) {
    console.error('Hotel details endpoint error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch hotel details'
      },
      { status: 500 }
    )
  }
}

/**
 * Format hotel name from Amadeus (often in ALL CAPS)
 */
function formatHotelName(name: string): string {
  if (!name) return 'Unknown Hotel'
  
  // Convert from ALL CAPS to Title Case
  return name
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase())
    .replace(/\bPhx\b/gi, 'PHX') // Keep airport codes uppercase
    .replace(/\bAz\b/gi, 'AZ')
    .replace(/\bUsa\b/gi, 'USA')
}

/**
 * Format address for display
 */
function formatAddress(address: any): string {
  if (!address) return 'Address not available'
  
  const parts = []
  
  if (address.lines && address.lines.length > 0) {
    parts.push(address.lines.join(', '))
  }
  
  if (address.cityName) {
    parts.push(address.cityName)
  }
  
  if (address.stateCode) {
    parts.push(address.stateCode)
  }
  
  if (address.postalCode) {
    parts.push(address.postalCode)
  }
  
  if (address.countryCode) {
    parts.push(address.countryCode)
  }
  
  return parts.join(', ') || 'Address not available'
}

/**
 * Calculate torture metrics based on hotel data
 */
function calculateHotelMetrics(hotel: any, availability: any): any {
  // Estimate room count based on hotel name/brand
  let estimatedRooms = 150 // Default
  
  if (hotel.name?.toLowerCase().includes('resort')) {
    estimatedRooms = 400
  } else if (hotel.name?.toLowerCase().includes('suites')) {
    estimatedRooms = 200
  } else if (hotel.chainCode === 'HI' || hotel.chainCode === 'MC') { // Hilton, Marriott
    estimatedRooms = 250
  }
  
  // Calculate potential missed revenue
  const occupancyRate = availability?.available === false ? 0.95 : 0.75
  const occupiedRooms = Math.floor(estimatedRooms * occupancyRate)
  const ridesPerDay = Math.floor(occupiedRooms * 0.3) // 30% of guests need rides
  const avgFareToAirport = 45
  const commissionRate = 0.30
  
  return {
    estimatedRooms,
    estimatedOccupancy: Math.round(occupancyRate * 100),
    potentialRidesPerDay: ridesPerDay,
    potentialDailyRevenue: Math.round(ridesPerDay * avgFareToAirport * commissionRate),
    potentialMonthlyRevenue: Math.round(ridesPerDay * avgFareToAirport * commissionRate * 30),
    potentialAnnualRevenue: Math.round(ridesPerDay * avgFareToAirport * commissionRate * 365)
  }
}

/**
 * Get mock hotel data for demo/fallback
 */
function getMockHotelData(hotelId: string): any {
  const mockHotels: Record<string, any> = {
    'PHXMAR': {
      hotelId: 'PHXMAR',
      name: 'Phoenix Airport Marriott',
      chainCode: 'MC',
      address: '1101 North 44th Street, Phoenix, AZ, 85008',
      location: { latitude: 33.4567, longitude: -112.0736 },
      amenities: ['POOL', 'FITNESS_CENTER', 'RESTAURANT', 'PARKING', 'WIFI']
    },
    'PHXHILTON': {
      hotelId: 'PHXHILTON',
      name: 'Hilton Phoenix Airport',
      chainCode: 'HI',
      address: '2435 South 47th Street, Phoenix, AZ, 85034',
      location: { latitude: 33.4234, longitude: -112.0234 },
      amenities: ['POOL', 'FITNESS_CENTER', 'RESTAURANT', 'SHUTTLE', 'WIFI']
    },
    'DEFAULT': {
      hotelId: hotelId,
      name: `Hotel ${hotelId}`,
      chainCode: 'XX',
      address: 'Phoenix, AZ',
      location: { latitude: 33.4484, longitude: -112.0740 },
      amenities: ['WIFI', 'PARKING']
    }
  }
  
  return mockHotels[hotelId] || mockHotels['DEFAULT']
}

// OPTIONS endpoint for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  })
}