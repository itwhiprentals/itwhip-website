// app/api/v3/rides/live/route.ts

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Types
interface LiveRide {
  id: string
  timestamp: string
  guestName: string // Partially hidden
  pickup: string
  destination: string
  fare: number
  potentialCommission: number
  driverName: string
  eta: string
  status: 'dispatched' | 'arrived' | 'in_progress' | 'completed'
  vehicleType: string
}

interface TortureMetrics {
  totalRidesToday: number
  totalRevenueToday: number
  missedCommissionToday: number
  competitorEarnings: number
  ranking: number
  totalHotels: number
}

// Generate realistic guest names (partially hidden)
function generateGuestName(): string {
  const firstNames = ['John', 'Sarah', 'Michael', 'Jennifer', 'Robert', 'Maria', 'David', 'Lisa', 'James', 'Emma']
  const lastInitials = ['S', 'M', 'J', 'K', 'L', 'B', 'W', 'D', 'R', 'T']
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastInitial = lastInitials[Math.floor(Math.random() * lastInitials.length)]
  return `${firstName} ${lastInitial}***`
}

// Generate realistic destinations
function generateDestination(): string {
  const destinations = [
    'Sky Harbor Airport - Terminal 4',
    'Sky Harbor Airport - Terminal 3', 
    'Downtown Phoenix',
    'Scottsdale Fashion Square',
    'Phoenix Convention Center',
    'Chase Field',
    'Talking Stick Resort Arena',
    'Old Town Scottsdale',
    'Biltmore Fashion Park',
    'Arizona State University',
    'Phoenix Zoo',
    'Desert Botanical Garden'
  ]
  return destinations[Math.floor(Math.random() * destinations.length)]
}

// Generate driver names
function generateDriverName(): string {
  const names = ['Carlos M.', 'Ahmed K.', 'Tony S.', 'Maria L.', 'John D.', 'Sarah P.', 'Mike R.', 'Lisa T.']
  return names[Math.floor(Math.random() * names.length)]
}

// Generate vehicle type
function generateVehicleType(): string {
  const types = ['Tesla Model 3', 'BMW 5 Series', 'Mercedes E-Class', 'Audi A6', 'Lexus ES', 'Cadillac CT6']
  return types[Math.floor(Math.random() * types.length)]
}

// Calculate fare based on destination
function calculateFare(destination: string): number {
  if (destination.includes('Airport')) {
    return 45 + Math.random() * 25 // $45-70 for airport
  } else if (destination.includes('Scottsdale')) {
    return 25 + Math.random() * 20 // $25-45 for Scottsdale
  } else {
    return 15 + Math.random() * 25 // $15-40 for other
  }
}

// Generate live rides for torture
function generateLiveRides(hotelId: string, count: number = 5): LiveRide[] {
  const rides: LiveRide[] = []
  const now = new Date()
  
  for (let i = 0; i < count; i++) {
    const minutesAgo = Math.floor(Math.random() * 60)
    const rideTime = new Date(now.getTime() - minutesAgo * 60000)
    const destination = generateDestination()
    const fare = calculateFare(destination)
    
    rides.push({
      id: `RIDE-${Date.now()}-${i}`,
      timestamp: rideTime.toISOString(),
      guestName: generateGuestName(),
      pickup: hotelId === 'DEMO' ? 'Your Hotel Lobby' : 'Main Entrance',
      destination: destination,
      fare: Math.round(fare * 100) / 100,
      potentialCommission: Math.round(fare * 0.3 * 100) / 100, // 30% commission
      driverName: generateDriverName(),
      eta: `${Math.floor(Math.random() * 5) + 1} min`,
      status: minutesAgo < 10 ? 'in_progress' : minutesAgo < 20 ? 'arrived' : 'completed',
      vehicleType: generateVehicleType()
    })
  }
  
  return rides.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Generate torture metrics
function generateTortureMetrics(hotelId: string): TortureMetrics {
  const baseMultiplier = hotelId === 'DEMO' ? 1 : Math.random() + 0.5
  
  return {
    totalRidesToday: Math.floor(47 * baseMultiplier),
    totalRevenueToday: Math.round(3271 * baseMultiplier),
    missedCommissionToday: Math.round(981 * baseMultiplier),
    competitorEarnings: Math.round(89433 * baseMultiplier),
    ranking: Math.floor(Math.random() * 30) + 20, // Rank 20-50 (bad)
    totalHotels: 50
  }
}

// Extract hotel ID from request
function extractHotelId(request: Request): string {
  const url = new URL(request.url)
  const hotelId = url.searchParams.get('hotelId')
  const amadeus = url.searchParams.get('amadeus')
  
  return hotelId || amadeus || 'DEMO'
}

// Check if user is authenticated and tier
async function checkAuthTier(request: Request): Promise<{ authenticated: boolean; tier: string }> {
  const headersList = headers()
  const apiKey = headersList.get('x-api-key')
  const authHeader = headersList.get('authorization')
  
  if (!apiKey && !authHeader) {
    return { authenticated: false, tier: 'free' }
  }
  
  // Check API key tier
  if (apiKey) {
    if (apiKey.startsWith('sk_test_')) {
      return { authenticated: true, tier: 'free' }
    } else if (apiKey.startsWith('sk_live_')) {
      return { authenticated: true, tier: 'premium' }
    }
  }
  
  return { authenticated: false, tier: 'free' }
}

export async function GET(request: Request) {
  try {
    const hotelId = extractHotelId(request)
    const { authenticated, tier } = await checkAuthTier(request)
    
    // Generate torture data
    const liveRides = generateLiveRides(hotelId, tier === 'premium' ? 10 : 5)
    const metrics = generateTortureMetrics(hotelId)
    
    // Build response based on tier
    const response: any = {
      success: true,
      hotelId: hotelId,
      timestamp: new Date().toISOString(),
      tier: tier
    }
    
    if (tier === 'free') {
      // FREE TIER - Maximum torture, no control
      response.message = 'UPGRADE TO ACTIVATE AND EARN FROM THESE RIDES'
      response.rides = liveRides
      response.metrics = metrics
      response.torture = {
        missedEarningsLive: `$${metrics.missedCommissionToday}`,
        competitorStatus: 'EARNING',
        yourStatus: 'LOSING MONEY',
        activateUrl: '/portal/upgrade'
      }
      response.warnings = [
        `You've lost $${metrics.missedCommissionToday} today`,
        `Your competitors earned $${metrics.competitorEarnings} this month`,
        `You rank #${metrics.ranking} out of ${metrics.totalHotels} hotels`
      ]
    } else if (tier === 'premium') {
      // PREMIUM TIER - Full data and control
      response.message = 'PREMIUM ACCESS - FULL CONTROL'
      response.rides = liveRides.map(ride => ({
        ...ride,
        guestName: ride.guestName.replace('***', 'son'), // Show full names
        actualCommission: ride.potentialCommission,
        dispatchControl: true,
        driverPhone: '+1-602-555-0' + Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      }))
      response.metrics = {
        ...metrics,
        actualEarningsToday: metrics.missedCommissionToday,
        projectedMonthly: metrics.missedCommissionToday * 30,
        ranking: 3 // Top 3!
      }
      response.control = {
        canDispatch: true,
        canModifyRates: true,
        canBlockDrivers: true,
        canSetPriority: true
      }
    } else {
      // NO AUTH - Just teaser
      response.message = 'ENTER YOUR AMADEUS CODE TO SEE YOUR HOTEL DATA'
      response.demo = true
      response.rides = liveRides.slice(0, 2) // Just 2 rides
      response.teaser = 'Hotels using ItWhip earn $67,433/month average'
    }
    
    // Add cache headers for real-time feel
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Hotel-ID': hotelId,
        'X-Tier': tier,
        'X-Rides-Count': liveRides.length.toString(),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
      }
    })
    
  } catch (error) {
    console.error('Live rides error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch live rides',
        message: 'Please try again or contact support',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
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