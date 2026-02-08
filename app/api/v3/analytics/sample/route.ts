// app/api/v3/analytics/sample/route.ts

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Types for analytics data
interface RideMetrics {
  total: number
  completed: number
  cancelled: number
  averageDuration: number
  averageDistance: number
  averageRating: number
  peakHours: string[]
}

interface RevenueMetrics {
  total: number
  average: number
  projectedMonthly: number
  vsLastMonth: string
  vsLastYear: string
  topRoutes: Array<{
    route: string
    revenue: number
    trips: number
  }>
}

interface DriverMetrics {
  totalActive: number
  averageRating: number
  topPerformers: number
  utilizationRate: number
  averageEarnings: number
}

interface GuestMetrics {
  totalServed: number
  repeatRiders: number
  satisfactionScore: number
  averageWaitTime: number
  preferredDestinations: string[]
}

// Generate realistic time-based variations
function getTimeBasedMultiplier(): number {
  const hour = new Date().getHours()
  // Peak hours: 7-9 AM, 5-7 PM
  if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
    return 1.5 + Math.random() * 0.3
  }
  // Night hours: lower activity
  if (hour >= 22 || hour <= 5) {
    return 0.3 + Math.random() * 0.2
  }
  // Regular hours
  return 0.8 + Math.random() * 0.4
}

// Generate ride metrics with realistic variations
function generateRideMetrics(period: string): RideMetrics {
  const multiplier = getTimeBasedMultiplier()
  const baseRides = period === 'today' ? 127 : period === 'week' ? 892 : 3847
  
  const total = Math.floor(baseRides * multiplier + Math.random() * 50)
  const cancelRate = 0.03 + Math.random() * 0.02 // 3-5% cancellation
  const cancelled = Math.floor(total * cancelRate)
  
  return {
    total,
    completed: total - cancelled,
    cancelled,
    averageDuration: Math.floor(18 + Math.random() * 12), // 18-30 minutes
    averageDistance: parseFloat((8.5 + Math.random() * 7).toFixed(1)), // 8.5-15.5 miles
    averageRating: parseFloat((4.7 + Math.random() * 0.2).toFixed(2)), // 4.7-4.9
    peakHours: ['7:00 AM - 9:00 AM', '5:00 PM - 7:00 PM', '10:00 PM - 12:00 AM']
  }
}

// Generate revenue metrics
function generateRevenueMetrics(period: string): RevenueMetrics {
  const multiplier = getTimeBasedMultiplier()
  const baseRevenue = period === 'today' ? 3847 : period === 'week' ? 26929 : 116237
  
  const total = Math.floor(baseRevenue * multiplier + Math.random() * 1000)
  const rides = period === 'today' ? 127 : period === 'week' ? 892 : 3847
  
  return {
    total,
    average: parseFloat((total / rides).toFixed(2)),
    projectedMonthly: Math.floor(total * 30 / (period === 'today' ? 1 : period === 'week' ? 7 : 30)),
    vsLastMonth: `+${(12 + Math.random() * 8).toFixed(1)}%`,
    vsLastYear: `+${(47 + Math.random() * 15).toFixed(1)}%`,
    topRoutes: [
      { route: 'Hotel → Airport (PHX)', revenue: Math.floor(total * 0.35), trips: Math.floor(rides * 0.3) },
      { route: 'Hotel → Downtown', revenue: Math.floor(total * 0.25), trips: Math.floor(rides * 0.28) },
      { route: 'Hotel → Convention Center', revenue: Math.floor(total * 0.15), trips: Math.floor(rides * 0.18) },
      { route: 'Hotel → Scottsdale', revenue: Math.floor(total * 0.13), trips: Math.floor(rides * 0.12) },
      { route: 'Hotel → Other', revenue: Math.floor(total * 0.12), trips: Math.floor(rides * 0.12) }
    ]
  }
}

// Generate driver metrics
function generateDriverMetrics(): DriverMetrics {
  const multiplier = getTimeBasedMultiplier()
  
  return {
    totalActive: Math.floor(47 * multiplier),
    averageRating: parseFloat((4.8 + Math.random() * 0.15).toFixed(2)),
    topPerformers: Math.floor(12 + Math.random() * 5),
    utilizationRate: parseFloat((68 + Math.random() * 12).toFixed(1)),
    averageEarnings: Math.floor(287 + Math.random() * 50)
  }
}

// Generate guest metrics
function generateGuestMetrics(period: string): GuestMetrics {
  const baseGuests = period === 'today' ? 98 : period === 'week' ? 687 : 2963
  const multiplier = getTimeBasedMultiplier()
  
  return {
    totalServed: Math.floor(baseGuests * multiplier),
    repeatRiders: Math.floor(baseGuests * multiplier * 0.34), // 34% repeat
    satisfactionScore: parseFloat((4.6 + Math.random() * 0.3).toFixed(2)),
    averageWaitTime: Math.floor(3 + Math.random() * 4), // 3-7 minutes
    preferredDestinations: [
      'Phoenix Sky Harbor Airport',
      'Downtown Phoenix',
      'Scottsdale Fashion Square',
      'Phoenix Convention Center',
      'Arizona State University'
    ]
  }
}

// Generate competitor comparison data
function generateCompetitorComparison() {
  return {
    vsUber: {
      priceDifference: '-32%',
      averageSavings: 18.50,
      surgeAvoidance: '94%',
      guestPreference: '78%'
    },
    vsLyft: {
      priceDifference: '-28%',
      averageSavings: 15.75,
      surgeAvoidance: '92%',
      guestPreference: '76%'
    },
    vsTaxi: {
      priceDifference: '-45%',
      averageSavings: 24.00,
      reliability: '+47%',
      guestPreference: '89%'
    }
  }
}

// Generate surge pricing data
function generateSurgeData() {
  const hour = new Date().getHours()
  const day = new Date().getDay()
  
  // Weekend nights have higher surge
  const isWeekendNight = (day === 5 || day === 6) && (hour >= 20 || hour <= 2)
  const baseSurge = isWeekendNight ? 2.8 : 1.4
  
  return {
    currentMarketSurge: parseFloat((baseSurge + Math.random() * 0.5).toFixed(1)),
    avgCompetitorSurge: parseFloat((baseSurge + 0.3 + Math.random() * 0.7).toFixed(1)),
    surgeHoursSaved: Math.floor(147 + Math.random() * 30),
    estimatedSavings: Math.floor(8934 + Math.random() * 2000),
    peakSurgeTimes: [
      { time: 'Friday 10 PM - 2 AM', typical: '3.2x', yourCost: '1.0x' },
      { time: 'Saturday 11 PM - 3 AM', typical: '3.5x', yourCost: '1.0x' },
      { time: 'Sunday 6 AM - 8 AM', typical: '2.1x', yourCost: '1.0x' },
      { time: 'Events & Concerts', typical: '4.0x+', yourCost: '1.0x' }
    ]
  }
}

// Check if request has valid authentication
async function isAuthenticated(request: Request): Promise<{ authenticated: boolean; tier?: string }> {
  const headersList = await headers()
  
  // Check for API key
  const apiKey = headersList.get('x-api-key')
  if (apiKey) {
    // List of valid API keys (in production, check database)
    const validKeys = [
      'sk_live_hotel_hilton_phx_2024',
      'sk_live_hotel_marriott_phx_2024',
      'sk_test_developer_demo_2024',
      'sk_partner_booking_platform_2024'
    ]
    
    if (validKeys.includes(apiKey)) {
      return { authenticated: true, tier: apiKey.includes('test') ? 'test' : 'premium' }
    }
  }
  
  // Check for Bearer token
  const authHeader = headersList.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    // In production, validate JWT properly
    return { authenticated: true, tier: 'premium' }
  }
  
  return { authenticated: false }
}

export async function GET(request: Request) {
  try {
    // Check authentication
    const { authenticated, tier } = await isAuthenticated(request)
    
    if (!authenticated) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          message: 'Please provide a valid API key or Bearer token',
          documentation: 'https://docs.itwhip.com/api/v3/authentication',
          timestamp: new Date().toISOString()
        },
        { 
          status: 401,
          headers: {
            'WWW-Authenticate': 'Bearer realm="ItWhip API", charset="UTF-8"',
            'Content-Type': 'application/json'
          }
        }
      )
    }
    
    // Parse query parameters
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'week'
    const format = url.searchParams.get('format') || 'summary'
    
    // Generate analytics data
    const rideMetrics = generateRideMetrics(period)
    const revenueMetrics = generateRevenueMetrics(period)
    const driverMetrics = generateDriverMetrics()
    const guestMetrics = generateGuestMetrics(period)
    const competitorComparison = generateCompetitorComparison()
    const surgeData = generateSurgeData()
    
    // Calculate potential missed revenue (the hook!)
    const missedRevenue = {
      withoutItWhip: Math.floor(revenueMetrics.total * 0.4), // They're missing 40% potential
      surgeCharges: Math.floor(revenueMetrics.total * 0.15),
      cancelledRides: Math.floor(revenueMetrics.total * 0.08),
      total: Math.floor(revenueMetrics.total * 0.63),
      message: tier === 'test' 
        ? 'Upgrade to see your full revenue potential' 
        : `You could be earning $${Math.floor(revenueMetrics.total * 1.63).toLocaleString()} with full optimization`
    }
    
    // Build response based on format
    let responseData: any = {
      period,
      dateRange: {
        start: period === 'today' 
          ? new Date().toISOString().split('T')[0]
          : period === 'week'
          ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      rides: rideMetrics,
      revenue: revenueMetrics,
      drivers: driverMetrics,
      guests: guestMetrics,
      competitorComparison,
      surgeAnalysis: surgeData,
      missedOpportunity: missedRevenue
    }
    
    // Add performance indicators
    responseData.kpi = {
      revenuePerRide: parseFloat((revenueMetrics.total / rideMetrics.total).toFixed(2)),
      guestSatisfaction: guestMetrics.satisfactionScore,
      driverUtilization: `${driverMetrics.utilizationRate}%`,
      marketShare: tier === 'test' ? 'Upgrade to unlock' : '23.4%',
      growthRate: revenueMetrics.vsLastMonth,
      efficiency: {
        score: 87,
        rating: 'Excellent',
        improvements: [
          'Enable surge-free pricing to capture 15% more rides',
          'Add 5 more drivers during peak hours',
          'Optimize route algorithms for 8% faster trips'
        ]
      }
    }
    
    // Add insights and recommendations
    responseData.insights = {
      trends: [
        'Airport rides increased 18% this week',
        'Guest satisfaction highest during morning hours',
        'Friday nights show 3x normal demand'
      ],
      opportunities: [
        `Capture additional $${missedRevenue.surgeCharges.toLocaleString()} by eliminating surge pricing`,
        'Add pre-booking feature for 20% more reservations',
        'Partner with local events for exclusive transportation'
      ],
      alerts: tier === 'test' 
        ? ['Upgrade to see real-time alerts']
        : [
          'High demand expected tonight (Concert at Footprint Center)',
          'Driver availability low for tomorrow morning',
          'Competitor surge pricing active in your area'
        ]
    }
    
    // Add metadata
    responseData.metadata = {
      generated: new Date().toISOString(),
      dataQuality: 'high',
      confidenceLevel: 0.95,
      nextUpdate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      tier,
      rateLimit: {
        remaining: tier === 'test' ? 10 : 4999,
        reset: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      }
    }
    
    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=60',
        'X-Data-Period': period,
        'X-Data-Quality': 'high',
        'X-RateLimit-Remaining': tier === 'test' ? '10' : '4999',
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    console.error('Analytics error:', error)
    
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to generate analytics data',
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