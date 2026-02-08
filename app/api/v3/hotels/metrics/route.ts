// app/api/v3/hotels/metrics/route.ts

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Types
interface HotelRanking {
  rank: number
  hotelName: string
  monthlyRevenue: number
  status: 'activated' | 'pending' | 'inactive'
  activationDate?: string
  percentageGrowth?: number
}

interface RevenueOpportunity {
  period: string
  missed: number
  potential: number
  captured: number
  efficiency: number
}

interface CompetitorMetric {
  name: string
  revenue: number
  rides: number
  avgFare: number
  marketShare: number
}

interface ActivationEvent {
  timestamp: string
  hotelName: string
  location: string
  roomCount: number
  projectedRevenue: number
}

// Generate hotel rankings
function generateRankings(hotelId: string, tier: string): HotelRanking[] {
  const topHotels = [
    { name: 'Four Seasons Scottsdale', revenue: 127850, growth: 47 },
    { name: 'The Phoenician', revenue: 98340, growth: 38 },
    { name: 'Fairmont Princess', revenue: 89433, growth: 31 },
    { name: 'JW Marriott Camelback', revenue: 78920, growth: 28 },
    { name: 'Hyatt Regency Phoenix', revenue: 67800, growth: 24 },
    { name: 'Westin Kierland', revenue: 61250, growth: 22 },
    { name: 'Arizona Biltmore', revenue: 58900, growth: 19 },
    { name: 'Omni Scottsdale', revenue: 54300, growth: 17 },
    { name: 'Renaissance Phoenix', revenue: 48750, growth: 15 },
    { name: 'Sheraton Grand Phoenix', revenue: 41200, growth: 12 }
  ]

  const rankings: HotelRanking[] = topHotels.map((hotel, index) => ({
    rank: index + 1,
    hotelName: hotel.name,
    monthlyRevenue: hotel.revenue,
    status: 'activated' as const,
    activationDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    percentageGrowth: hotel.growth
  }))

  // Add some middle-tier hotels
  const middleTier = [
    'Hilton Phoenix Airport',
    'Embassy Suites Biltmore',
    'Crowne Plaza Phoenix',
    'DoubleTree Paradise Valley'
  ]

  middleTier.forEach((name, i) => {
    rankings.push({
      rank: 15 + i,
      hotelName: name,
      monthlyRevenue: 25000 - (i * 3000),
      status: 'activated',
      activationDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      percentageGrowth: 10 - i
    })
  })

  // Add YOUR hotel based on tier
  if (tier === 'premium') {
    // Premium hotels are in top 5
    rankings.splice(2, 0, {
      rank: 3,
      hotelName: 'YOUR PROPERTY',
      monthlyRevenue: 94500,
      status: 'activated',
      activationDate: new Date().toISOString(),
      percentageGrowth: 35
    })
    // Adjust other ranks
    for (let i = 3; i < rankings.length; i++) {
      rankings[i].rank = i + 1
    }
  } else {
    // Free tier hotels are near bottom
    const yourRank = 35 + Math.floor(Math.random() * 10)
    rankings.push({
      rank: yourRank,
      hotelName: 'YOUR PROPERTY',
      monthlyRevenue: 0,
      status: 'inactive',
      percentageGrowth: -100
    })

    // Add some hotels below
    for (let i = 1; i <= 5; i++) {
      rankings.push({
        rank: yourRank + i,
        hotelName: `Hotel ${yourRank + i}`,
        monthlyRevenue: 0,
        status: 'inactive'
      })
    }
  }

  return rankings.sort((a, b) => a.rank - b.rank)
}

// Generate revenue opportunities
function generateOpportunities(hotelId: string, tier: string): RevenueOpportunity[] {
  const multiplier = tier === 'premium' ? 1 : 0
  const missedMultiplier = tier === 'premium' ? 0 : 1

  return [
    {
      period: 'Today',
      missed: Math.round(1394 * missedMultiplier),
      potential: 1394,
      captured: Math.round(1394 * multiplier),
      efficiency: multiplier * 100
    },
    {
      period: 'This Week',
      missed: Math.round(9758 * missedMultiplier),
      potential: 9758,
      captured: Math.round(9758 * multiplier),
      efficiency: multiplier * 100
    },
    {
      period: 'This Month',
      missed: Math.round(41820 * missedMultiplier),
      potential: 41820,
      captured: Math.round(41820 * multiplier),
      efficiency: multiplier * 100
    },
    {
      period: 'This Quarter',
      missed: Math.round(125460 * missedMultiplier),
      potential: 125460,
      captured: Math.round(125460 * multiplier),
      efficiency: multiplier * 100
    },
    {
      period: 'Annual Projection',
      missed: Math.round(501840 * missedMultiplier),
      potential: 501840,
      captured: Math.round(501840 * multiplier),
      efficiency: multiplier * 100
    }
  ]
}

// Generate competitor metrics
function generateCompetitors(hotelId: string): CompetitorMetric[] {
  const competitors = [
    { name: 'Direct Competitor A', base: 89000 },
    { name: 'Direct Competitor B', base: 76000 },
    { name: 'Market Leader', base: 127000 },
    { name: 'Regional Average', base: 54000 }
  ]

  return competitors.map(comp => ({
    name: comp.name,
    revenue: comp.base + Math.floor(Math.random() * 10000),
    rides: Math.floor(comp.base / 35),
    avgFare: 35 + Math.random() * 10,
    marketShare: Math.round((comp.base / 400000) * 100)
  }))
}

// Generate recent activations (FOMO)
function generateActivations(): ActivationEvent[] {
  const hotels = [
    { name: 'Hilton Downtown Phoenix', rooms: 234, location: 'Phoenix' },
    { name: 'Marriott Scottsdale', rooms: 318, location: 'Scottsdale' },
    { name: 'Hyatt Place Tempe', rooms: 156, location: 'Tempe' },
    { name: 'Hampton Inn Airport', rooms: 189, location: 'Phoenix' },
    { name: 'Courtyard Old Town', rooms: 201, location: 'Scottsdale' }
  ]

  const now = Date.now()
  return hotels.map((hotel, i) => ({
    timestamp: new Date(now - (i * 3600000 + Math.random() * 1800000)).toISOString(),
    hotelName: hotel.name,
    location: hotel.location,
    roomCount: hotel.rooms,
    projectedRevenue: hotel.rooms * 280
  }))
}

// Check authentication tier
async function checkAuthTier(request: Request): Promise<{ authenticated: boolean; tier: string }> {
  const headersList = await headers()
  const apiKey = headersList.get('x-api-key')
  
  if (!apiKey) {
    return { authenticated: false, tier: 'free' }
  }
  
  if (apiKey.startsWith('sk_test_')) {
    return { authenticated: true, tier: 'free' }
  } else if (apiKey.startsWith('sk_live_')) {
    return { authenticated: true, tier: 'premium' }
  }
  
  return { authenticated: false, tier: 'free' }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const hotelId = url.searchParams.get('hotelId') || url.searchParams.get('amadeus') || 'DEMO'
    const { authenticated, tier } = await checkAuthTier(request)
    
    // Generate all metrics
    const rankings = generateRankings(hotelId, tier)
    const opportunities = generateOpportunities(hotelId, tier)
    const competitors = generateCompetitors(hotelId)
    const recentActivations = generateActivations()
    
    // Find user's ranking
    const userRanking = rankings.find(r => r.hotelName === 'YOUR PROPERTY')
    const topPerformers = rankings.filter(r => r.status === 'activated').slice(0, 5)
    
    // Build response
    const response: any = {
      success: true,
      hotelId: hotelId,
      timestamp: new Date().toISOString(),
      tier: tier,
      authenticated: authenticated
    }

    if (tier === 'free') {
      // FREE TIER - Show the pain
      response.message = 'ACTIVATE TO CAPTURE YOUR REVENUE OPPORTUNITY'
      response.rankings = {
        yourPosition: userRanking,
        topPerformers: topPerformers,
        totalHotels: 50,
        activatedHotels: 28,
        percentile: Math.round((userRanking?.rank || 45) / 50 * 100)
      }
      response.opportunities = opportunities
      response.competitors = competitors
      response.recentActivations = recentActivations
      response.insights = [
        'You are in the bottom 30% of hotels in your market',
        `Missing $${opportunities[2].missed.toLocaleString()} in monthly revenue`,
        'Competitors capturing 100% of transportation revenue',
        '3 hotels in your area activated this week'
      ]
      response.callToAction = {
        message: 'Join the top performers',
        buttonText: 'ACTIVATE NOW',
        urgency: 'Limited spots remaining in Phoenix market',
        url: '/portal/upgrade'
      }
    } else if (tier === 'premium') {
      // PREMIUM TIER - Show success
      response.message = 'PERFORMANCE LEADER - TOP 10%'
      response.rankings = {
        yourPosition: userRanking,
        topPerformers: topPerformers,
        totalHotels: 50,
        activatedHotels: 28,
        percentile: 6 // Top 6%
      }
      response.opportunities = opportunities.map(opp => ({
        ...opp,
        status: 'CAPTURING',
        trend: 'up'
      }))
      response.competitors = competitors.map(comp => ({
        ...comp,
        comparison: 'OUTPERFORMING',
        advantage: '+' + Math.round(Math.random() * 20 + 10) + '%'
      }))
      response.growth = {
        monthOverMonth: '+31%',
        quarterOverQuarter: '+47%',
        yearOverYear: 'First Year',
        projectedAnnual: '$501,840'
      }
      response.achievements = [
        'Ranked #3 in Phoenix Market',
        'Zero surge complaints this month',
        '4.9★ average guest rating',
        '2.3 minute average pickup time'
      ]
    } else {
      // NO AUTH - Teaser
      response.message = 'ENTER YOUR AMADEUS CODE TO SEE YOUR METRICS'
      response.demo = true
      response.teaser = {
        avgHotelRevenue: '$67,433/month',
        topPerformer: '$127,850/month',
        marketGrowth: '+47% YoY',
        activeHotels: 28
      }
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Hotel-ID': hotelId,
        'X-Tier': tier,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
      }
    })
    
  } catch (error) {
    console.error('Hotel metrics error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch hotel metrics',
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