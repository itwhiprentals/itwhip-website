// app/api/user/stats/route.ts
// User Statistics API - Returns user dashboard stats

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('access_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify the token
    const { payload } = await jwtVerify(token, JWT_SECRET)

    // Return mock stats for now
    // In production, this would query the database
    const stats = {
      totalSaved: 1247.50,
      ridesCompleted: 23,
      hotelsBooked: 3,
      carbonOffset: 45.2, // kg
      memberSince: '2024-01-15',
      tierStatus: 'Gold',
      pointsBalance: 3450,
      monthlySpend: 847.25,
      servicesUsed: {
        rides: true,
        hotels: true,
        food: true,
        rentals: false,
        flights: false,
        bundles: true
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}