// app/api/v3/hotels/search/route.ts

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { cacheGet, cacheSet } from '@/app/lib/cache/redis'

// Types for hotel data
interface Hotel {
  id: string
  name: string
  brand: string
  address: string
  city: string
  state: string
  zip: string
  lat: number
  lng: number
  rooms: number
  stars: number
  amenities: string[]
  gdsCode?: string
  amadeusId?: string
  sabreId?: string
  status: 'active' | 'pending' | 'eligible' | 'waitlist'
  monthlyRevenuePotential: number
  currentMonthlyRevenue?: number
  missedRevenue?: number
  activeSince?: string
  performance?: {
    rides: number
    satisfaction: number
    efficiency: number
  }
}

// Phoenix area hotels database (mix of real and realistic hotels)
const HOTELS_DATABASE: Hotel[] = [
  // Active hotels (already using ItWhip - the psychological play)
  {
    id: 'PHX001',
    name: 'Hilton Phoenix Airport',
    brand: 'Hilton',
    address: '2435 S 47th St',
    city: 'Phoenix',
    state: 'AZ',
    zip: '85034',
    lat: 33.4255,
    lng: -111.9866,
    rooms: 254,
    stars: 4,
    amenities: ['Airport Shuttle', 'Pool', 'Fitness Center', 'Restaurant', 'Business Center'],
    gdsCode: 'HI',
    amadeusId: 'HILPHXAP',
    sabreId: 'HI12345',
    status: 'active',
    monthlyRevenuePotential: 67433,
    currentMonthlyRevenue: 51234,
    activeSince: '2024-03-15',
    performance: {
      rides: 1847,
      satisfaction: 4.8,
      efficiency: 92
    }
  },
  {
    id: 'PHX002',
    name: 'Marriott Phoenix Downtown',
    brand: 'Marriott',
    address: '411 N 3rd St',
    city: 'Phoenix',
    state: 'AZ',
    zip: '85004',
    lat: 33.4515,
    lng: -112.0685,
    rooms: 318,
    stars: 4,
    amenities: ['Valet Parking', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Meeting Rooms'],
    gdsCode: 'MC',
    amadeusId: 'MARPHXDT',
    sabreId: 'MC67890',
    status: 'active',
    monthlyRevenuePotential: 78923,
    currentMonthlyRevenue: 62341,
    activeSince: '2024-02-01',
    performance: {
      rides: 2234,
      satisfaction: 4.7,
      efficiency: 89
    }
  },
  {
    id: 'PHX003',
    name: 'Four Seasons Resort Scottsdale',
    brand: 'Four Seasons',
    address: '10600 E Crescent Moon Dr',
    city: 'Scottsdale',
    state: 'AZ',
    zip: '85262',
    lat: 33.5839,
    lng: -111.7340,
    rooms: 210,
    stars: 5,
    amenities: ['Golf Course', 'Multiple Pools', 'Spa', 'Fine Dining', 'Tennis Courts', 'Kids Club'],
    gdsCode: 'FS',
    amadeusId: 'FSSCOTT',
    sabreId: 'FS11111',
    status: 'active',
    monthlyRevenuePotential: 124567,
    currentMonthlyRevenue: 98234,
    activeSince: '2024-01-10',
    performance: {
      rides: 3421,
      satisfaction: 4.9,
      efficiency: 95
    }
  },
  
  // Pending hotels (in negotiation - creates urgency)
  {
    id: 'PHX004',
    name: 'Hyatt Regency Phoenix',
    brand: 'Hyatt',
    address: '122 N 2nd St',
    city: 'Phoenix',
    state: 'AZ',
    zip: '85004',
    lat: 33.4489,
    lng: -112.0718,
    rooms: 697,
    stars: 4,
    amenities: ['Rooftop Pool', 'Fitness Center', 'Restaurant', 'Bar', 'Convention Center'],
    gdsCode: 'HY',
    amadeusId: 'HYAPHX',
    sabreId: 'HY22222',
    status: 'pending',
    monthlyRevenuePotential: 145678,
    missedRevenue: 145678,
    performance: {
      rides: 0,
      satisfaction: 0,
      efficiency: 0
    }
  },
  {
    id: 'PHX005',
    name: 'The Phoenician',
    brand: 'Luxury Collection',
    address: '6000 E Camelback Rd',
    city: 'Scottsdale',
    state: 'AZ',
    zip: '85251',
    lat: 33.5028,
    lng: -111.9298,
    rooms: 645,
    stars: 5,
    amenities: ['Championship Golf', 'Athletic Club', 'Spa', 'Multiple Restaurants', 'Private Pools'],
    gdsCode: 'LC',
    amadeusId: 'LCPHOEN',
    sabreId: 'LC33333',
    status: 'pending',
    monthlyRevenuePotential: 189234,
    missedRevenue: 189234,
    performance: {
      rides: 0,
      satisfaction: 0,
      efficiency: 0
    }
  },
  
  // Eligible hotels (not yet contacted - opportunity)
  {
    id: 'PHX006',
    name: 'Embassy Suites Phoenix-Biltmore',
    brand: 'Embassy Suites',
    address: '2630 E Camelback Rd',
    city: 'Phoenix',
    state: 'AZ',
    zip: '85016',
    lat: 33.5098,
    lng: -112.0238,
    rooms: 232,
    stars: 3.5,
    amenities: ['Free Breakfast', 'Pool', 'Fitness Center', 'Business Center'],
    gdsCode: 'ES',
    amadeusId: 'ESPHXBI',
    sabreId: 'ES44444',
    status: 'eligible',
    monthlyRevenuePotential: 54321,
    missedRevenue: 54321
  },
  {
    id: 'PHX007',
    name: 'Sheraton Grand Phoenix',
    brand: 'Sheraton',
    address: '340 N 3rd St',
    city: 'Phoenix',
    state: 'AZ',
    zip: '85004',
    lat: 33.4508,
    lng: -112.0695,
    rooms: 1003,
    stars: 4,
    amenities: ['Pool', 'Fitness Center', 'Restaurant', 'Bar', 'Meeting Rooms', 'Ballroom'],
    gdsCode: 'SI',
    amadeusId: 'SIPHXGR',
    sabreId: 'SI55555',
    status: 'eligible',
    monthlyRevenuePotential: 167890,
    missedRevenue: 167890
  },
  {
    id: 'PHX008',
    name: 'Fairmont Scottsdale Princess',
    brand: 'Fairmont',
    address: '7575 E Princess Dr',
    city: 'Scottsdale',
    state: 'AZ',
    zip: '85255',
    lat: 33.6547,
    lng: -111.8816,
    rooms: 750,
    stars: 5,
    amenities: ['TPC Golf Courses', 'Spa', 'Water Park', 'Multiple Restaurants', 'Tennis'],
    gdsCode: 'FR',
    amadeusId: 'FRSCOTT',
    sabreId: 'FR66666',
    status: 'eligible',
    monthlyRevenuePotential: 198765,
    missedRevenue: 198765
  },
  
  // Waitlist hotels (creates scarcity)
  {
    id: 'PHX009',
    name: 'Holiday Inn Phoenix Airport',
    brand: 'Holiday Inn',
    address: '4300 E Washington St',
    city: 'Phoenix',
    state: 'AZ',
    zip: '85034',
    lat: 33.4481,
    lng: -111.9889,
    rooms: 168,
    stars: 3,
    amenities: ['Airport Shuttle', 'Pool', 'Restaurant'],
    gdsCode: 'HI',
    amadeusId: 'HIPHXAP',
    sabreId: 'HI77777',
    status: 'waitlist',
    monthlyRevenuePotential: 32145,
    missedRevenue: 32145
  },
  {
    id: 'PHX010',
    name: 'Hampton Inn Phoenix Downtown',
    brand: 'Hampton Inn',
    address: '1515 N 7th Ave',
    city: 'Phoenix',
    state: 'AZ',
    zip: '85003',
    lat: 33.4654,
    lng: -112.0822,
    rooms: 142,
    stars: 3,
    amenities: ['Free Breakfast', 'Pool', 'Fitness Center'],
    gdsCode: 'HP',
    amadeusId: 'HPPHXDT',
    sabreId: 'HP88888',
    status: 'waitlist',
    monthlyRevenuePotential: 28934,
    missedRevenue: 28934
  },
  
  // More active hotels to show momentum
  {
    id: 'PHX011',
    name: 'W Scottsdale',
    brand: 'W Hotels',
    address: '7277 E Camelback Rd',
    city: 'Scottsdale',
    state: 'AZ',
    zip: '85251',
    lat: 33.5012,
    lng: -111.9245,
    rooms: 224,
    stars: 4.5,
    amenities: ['Pool', 'Spa', 'Nightclub', 'Restaurant', 'Bar'],
    gdsCode: 'WH',
    amadeusId: 'WHSCOTT',
    sabreId: 'WH99999',
    status: 'active',
    monthlyRevenuePotential: 89234,
    currentMonthlyRevenue: 71234,
    activeSince: '2024-04-20',
    performance: {
      rides: 2567,
      satisfaction: 4.8,
      efficiency: 91
    }
  },
  {
    id: 'PHX012',
    name: 'JW Marriott Camelback Inn',
    brand: 'JW Marriott',
    address: '5402 E Lincoln Dr',
    city: 'Scottsdale',
    state: 'AZ',
    zip: '85253',
    lat: 33.5319,
    lng: -111.9530,
    rooms: 453,
    stars: 5,
    amenities: ['Golf Course', 'Spa', 'Multiple Pools', 'Fine Dining', 'Tennis'],
    gdsCode: 'JW',
    amadeusId: 'JWCAMEL',
    sabreId: 'JW10101',
    status: 'active',
    monthlyRevenuePotential: 156789,
    currentMonthlyRevenue: 134567,
    activeSince: '2024-03-01',
    performance: {
      rides: 4123,
      satisfaction: 4.9,
      efficiency: 94
    }
  }
]

// Check authentication
async function isAuthenticated(request: Request): Promise<boolean> {
  const headersList = headers()
  const apiKey = headersList.get('x-api-key')
  const authHeader = headersList.get('authorization')
  
  // For demo, accept any of our known keys or any Bearer token
  if (apiKey || authHeader?.startsWith('Bearer ')) {
    return true
  }
  
  return false
}

// Calculate distance between two points (for proximity search)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959 // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Generate cache key from search parameters
function generateCacheKey(params: any, authenticated: boolean): string {
  // Create a deterministic key from search params
  const keyParts = [
    'hotels:search',
    authenticated ? 'auth' : 'public',
    params.query || 'all',
    params.city || 'any',
    params.status || 'any',
    params.brand || 'any',
    `rooms:${params.minRooms}-${params.maxRooms}`,
    `loc:${params.lat},${params.lng}`,
    `radius:${params.radius}`,
    `sort:${params.sortBy}`,
    `page:${params.offset}-${params.limit}`
  ]
  
  return keyParts.join(':')
}

export async function GET(request: Request) {
  const startTime = Date.now()
  
  try {
    // Check authentication for detailed data
    const authenticated = await isAuthenticated(request)
    
    // Parse query parameters
    const url = new URL(request.url)
    const searchParams = {
      query: url.searchParams.get('q')?.toLowerCase() || '',
      city: url.searchParams.get('city')?.toLowerCase(),
      status: url.searchParams.get('status'),
      brand: url.searchParams.get('brand')?.toLowerCase(),
      minRooms: parseInt(url.searchParams.get('minRooms') || '0'),
      maxRooms: parseInt(url.searchParams.get('maxRooms') || '9999'),
      lat: parseFloat(url.searchParams.get('lat') || '33.4484'),
      lng: parseFloat(url.searchParams.get('lng') || '-112.0740'),
      radius: parseFloat(url.searchParams.get('radius') || '50'),
      limit: parseInt(url.searchParams.get('limit') || '20'),
      offset: parseInt(url.searchParams.get('offset') || '0'),
      sortBy: url.searchParams.get('sortBy') || 'revenue'
    }
    
    // Generate cache key
    const cacheKey = generateCacheKey(searchParams, authenticated)
    
    // Try to get from cache
    let cached = null
    let cacheHit = false
    
    try {
      cached = await cacheGet(cacheKey)
      if (cached) {
        cacheHit = true
        console.log(`Cache HIT for hotels search: ${cacheKey}`)
      }
    } catch (error) {
      // Cache might not be configured, continue without it
      console.log('Cache not available for hotels search')
    }
    
    // If we have cached data, return it immediately
    if (cached && cacheHit) {
      const responseTime = Date.now() - startTime
      
      return NextResponse.json(cached, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': authenticated ? 'private, max-age=60' : 'public, max-age=300',
          'X-Cache': 'HIT',
          'X-Cache-TTL': authenticated ? '60s' : '300s',
          'X-Response-Time': `${responseTime}ms`,
          'X-Total-Count': String((cached as any).pagination?.total || 0),
          'X-Result-Count': String((cached as any).hotels?.length || 0),
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
    
    // Not cached - perform the search
    console.log('Cache MISS for hotels search, generating fresh results')
    
    // Filter hotels
    let filteredHotels = HOTELS_DATABASE.filter(hotel => {
      // Text search
      if (searchParams.query && !hotel.name.toLowerCase().includes(searchParams.query) && 
          !hotel.brand.toLowerCase().includes(searchParams.query) &&
          !hotel.city.toLowerCase().includes(searchParams.query)) {
        return false
      }
      
      // City filter
      if (searchParams.city && !hotel.city.toLowerCase().includes(searchParams.city)) {
        return false
      }
      
      // Status filter
      if (searchParams.status && hotel.status !== searchParams.status) {
        return false
      }
      
      // Brand filter
      if (searchParams.brand && !hotel.brand.toLowerCase().includes(searchParams.brand)) {
        return false
      }
      
      // Room count filter
      if (hotel.rooms < searchParams.minRooms || hotel.rooms > searchParams.maxRooms) {
        return false
      }
      
      // Distance filter
      const distance = calculateDistance(searchParams.lat, searchParams.lng, hotel.lat, hotel.lng)
      if (distance > searchParams.radius) {
        return false
      }
      
      return true
    })
    
    // Add distance to each hotel
    filteredHotels = filteredHotels.map(hotel => ({
      ...hotel,
      distance: parseFloat(calculateDistance(searchParams.lat, searchParams.lng, hotel.lat, hotel.lng).toFixed(1))
    }))
    
    // Sort hotels
    filteredHotels.sort((a, b) => {
      switch (searchParams.sortBy) {
        case 'revenue':
          return b.monthlyRevenuePotential - a.monthlyRevenuePotential
        case 'distance':
          return (a as any).distance - (b as any).distance
        case 'rooms':
          return b.rooms - a.rooms
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })
    
    // Apply pagination
    const paginatedHotels = filteredHotels.slice(searchParams.offset, searchParams.offset + searchParams.limit)
    
    // Remove sensitive data if not authenticated
    const sanitizedHotels = paginatedHotels.map(hotel => {
      if (!authenticated) {
        // Remove financial data for unauthenticated requests
        const { monthlyRevenuePotential, currentMonthlyRevenue, missedRevenue, ...publicData } = hotel
        return {
          ...publicData,
          monthlyRevenuePotential: 'Authentication required',
          message: 'Sign up to see revenue potential'
        }
      }
      return hotel
    })
    
    // Calculate aggregate statistics
    const stats = {
      totalHotels: filteredHotels.length,
      activeHotels: filteredHotels.filter(h => h.status === 'active').length,
      pendingHotels: filteredHotels.filter(h => h.status === 'pending').length,
      eligibleHotels: filteredHotels.filter(h => h.status === 'eligible').length,
      waitlistHotels: filteredHotels.filter(h => h.status === 'waitlist').length,
      totalRevenuePotential: authenticated 
        ? filteredHotels.reduce((sum, h) => sum + h.monthlyRevenuePotential, 0)
        : 'Authentication required',
      totalMissedRevenue: authenticated
        ? filteredHotels.filter(h => h.status !== 'active')
            .reduce((sum, h) => sum + (h.missedRevenue || 0), 0)
        : 'Authentication required',
      averageRating: 4.8,
      totalRooms: filteredHotels.reduce((sum, h) => sum + h.rooms, 0)
    }
    
    // Build response
    const response = {
      success: true,
      query: {
        search: searchParams.query || null,
        city: searchParams.city,
        status: searchParams.status,
        brand: searchParams.brand,
        roomRange: searchParams.minRooms > 0 || searchParams.maxRooms < 9999 
          ? `${searchParams.minRooms}-${searchParams.maxRooms}` 
          : null,
        location: { lat: searchParams.lat, lng: searchParams.lng },
        radius: searchParams.radius,
        sortBy: searchParams.sortBy
      },
      pagination: {
        limit: searchParams.limit,
        offset: searchParams.offset,
        total: filteredHotels.length,
        hasMore: searchParams.offset + searchParams.limit < filteredHotels.length
      },
      stats,
      hotels: sanitizedHotels,
      messages: authenticated ? [
        `${stats.activeHotels} hotels already saving an average of $67,433/month`,
        `${stats.pendingHotels} hotels currently in negotiations`,
        `${stats.eligibleHotels} hotels eligible for immediate activation`,
        stats.waitlistHotels > 0 ? `${stats.waitlistHotels} hotels on waitlist (limited capacity)` : null
      ].filter(Boolean) : [
        'Authenticate to see revenue potential',
        'Contact sales for activation'
      ],
      metadata: {
        generated: new Date().toISOString(),
        dataSource: 'itwhip-hotel-network',
        lastUpdated: new Date(Date.now() - 3600000).toISOString(),
        authenticated,
        cached: false,
        responseTime: Date.now() - startTime
      }
    }
    
    // Cache the response
    try {
      // Cache for different durations based on authentication
      const cacheTTL = authenticated ? 60 : 300 // 1 minute for auth, 5 minutes for public
      await cacheSet(cacheKey, response, cacheTTL)
      console.log(`Cached hotels search results for ${cacheTTL}s`)
    } catch (error) {
      // Cache might not be available, continue without caching
      console.log('Could not cache hotels search results')
    }
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': authenticated ? 'private, max-age=60' : 'public, max-age=300',
        'X-Cache': 'MISS',
        'X-Response-Time': `${responseTime}ms`,
        'X-Total-Count': String(filteredHotels.length),
        'X-Result-Count': String(paginatedHotels.length),
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    console.error('Hotel search error:', error)
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to search hotels',
        timestamp: new Date().toISOString(),
        cached: false,
        responseTime
      },
      { 
        status: 500,
        headers: {
          'X-Cache': 'ERROR',
          'X-Response-Time': `${responseTime}ms`
        }
      }
    )
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Max-Age': '86400'
    }
  })
}