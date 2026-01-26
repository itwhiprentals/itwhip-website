// app/api/smartcar/connect/route.ts
// Generate Smartcar Connect OAuth URL for vehicle linking

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Smartcar OAuth configuration
const SMARTCAR_CLIENT_ID = process.env.SMARTCAR_CLIENT_ID
const SMARTCAR_REDIRECT_URI = process.env.SMARTCAR_REDIRECT_URI || 'https://itwhip.com/api/smartcar/callback'
const SMARTCAR_MODE = process.env.SMARTCAR_MODE || 'test' // 'test' or 'live'

// Scopes we request from Smartcar
// See: https://smartcar.com/docs/api/#permissions
const SMARTCAR_SCOPES = [
  'read_vehicle_info',  // Make, model, year
  'read_vin',           // Vehicle identification number
  'read_odometer',      // Mileage
  'read_location',      // GPS coordinates
  'read_fuel',          // Fuel tank level (ICE vehicles)
  'read_battery',       // Battery level (EVs)
  'read_charge',        // Charging status (EVs)
  'control_security',   // Lock/unlock (premium feature)
].join(' ')

// Helper to get current host from auth
async function getCurrentHost() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value
    || cookieStore.get('hostAccessToken')?.value
    || cookieStore.get('accessToken')?.value

  if (!token) return null

  try {
    const decoded = verify(token, JWT_SECRET) as { hostId?: string }
    const hostId = decoded.hostId

    if (!hostId) return null

    return await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })
  } catch {
    return null
  }
}

// GET /api/smartcar/connect - Get OAuth URL for connecting a vehicle
export async function GET() {
  try {
    const host = await getCurrentHost()

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in as a host.' },
        { status: 401 }
      )
    }

    if (!SMARTCAR_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Smartcar is not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // Generate state parameter for CSRF protection
    // State includes hostId so we know who to associate the vehicle with
    const state = Buffer.from(JSON.stringify({
      hostId: host.id,
      timestamp: Date.now()
    })).toString('base64url')

    // Build Smartcar Connect URL
    // See: https://smartcar.com/docs/getting-started/tutorials/backend
    const connectUrl = new URL('https://connect.smartcar.com/oauth/authorize')
    connectUrl.searchParams.set('response_type', 'code')
    connectUrl.searchParams.set('client_id', SMARTCAR_CLIENT_ID)
    connectUrl.searchParams.set('redirect_uri', SMARTCAR_REDIRECT_URI)
    connectUrl.searchParams.set('scope', SMARTCAR_SCOPES)
    connectUrl.searchParams.set('mode', SMARTCAR_MODE)
    connectUrl.searchParams.set('state', state)
    // Allow single or multiple vehicle selection
    connectUrl.searchParams.set('single_select', 'false')

    return NextResponse.json({
      url: connectUrl.toString(),
      state,
      mode: SMARTCAR_MODE
    })
  } catch (error) {
    console.error('Error generating Smartcar connect URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate connect URL' },
      { status: 500 }
    )
  }
}

// POST /api/smartcar/connect - Same as GET but accepts body params
export async function POST(request: NextRequest) {
  try {
    const host = await getCurrentHost()

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in as a host.' },
        { status: 401 }
      )
    }

    if (!SMARTCAR_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Smartcar is not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // Parse optional body parameters
    const body = await request.json().catch(() => ({}))
    const singleSelect = body.singleSelect ?? false
    const customScopes = body.scopes || SMARTCAR_SCOPES

    // Generate state parameter
    const state = Buffer.from(JSON.stringify({
      hostId: host.id,
      timestamp: Date.now()
    })).toString('base64url')

    // Build Smartcar Connect URL
    const connectUrl = new URL('https://connect.smartcar.com/oauth/authorize')
    connectUrl.searchParams.set('response_type', 'code')
    connectUrl.searchParams.set('client_id', SMARTCAR_CLIENT_ID)
    connectUrl.searchParams.set('redirect_uri', SMARTCAR_REDIRECT_URI)
    connectUrl.searchParams.set('scope', customScopes)
    connectUrl.searchParams.set('mode', SMARTCAR_MODE)
    connectUrl.searchParams.set('state', state)
    connectUrl.searchParams.set('single_select', singleSelect ? 'true' : 'false')

    return NextResponse.json({
      url: connectUrl.toString(),
      state,
      mode: SMARTCAR_MODE
    })
  } catch (error) {
    console.error('Error generating Smartcar connect URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate connect URL' },
      { status: 500 }
    )
  }
}
