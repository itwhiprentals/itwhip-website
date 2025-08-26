// app/api/user/active-services/route.ts
// Active Services API - Returns user's current active bookings/services

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

    // Return mock active services for now
    // In production, this would query the database for actual bookings
    const activeServices = [
      {
        id: '1',
        type: 'ride',
        status: 'scheduled',
        title: 'Airport Transfer',
        subtitle: 'PHX Sky Harbor → Downtown Hotel',
        time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        price: 47,
        driver: 'Marcus',
        vehicle: 'Toyota Camry',
        icon: 'car'
      },
      {
        id: '2',
        type: 'hotel',
        status: 'confirmed',
        title: 'Marriott Downtown',
        subtitle: 'Check-in tomorrow at 3:00 PM',
        time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        nights: 3,
        room: 'Deluxe King',
        price: 459,
        icon: 'bed'
      },
      {
        id: '3',
        type: 'food',
        status: 'preparing',
        title: 'Breakfast Order',
        subtitle: 'Room Service - Delivery in 25 min',
        time: new Date(Date.now() + 25 * 60 * 1000).toISOString(), // 25 minutes
        items: 3,
        price: 38.50,
        icon: 'restaurant'
      }
    ]

    return NextResponse.json(activeServices)
  } catch (error) {
    console.error('Active services fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch active services' },
      { status: 500 }
    )
  }
}