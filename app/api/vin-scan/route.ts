// app/api/vin-scan/route.ts
// API for storing and retrieving VINs scanned from phone

import { NextRequest, NextResponse } from 'next/server'

// In-memory store with TTL (in production, use Redis)
const vinStore = new Map<string, { vin: string; timestamp: number }>()

// Clean up expired entries (older than 5 minutes)
function cleanupExpired() {
  const now = Date.now()
  const TTL = 5 * 60 * 1000 // 5 minutes
  for (const [key, value] of vinStore.entries()) {
    if (now - value.timestamp > TTL) {
      vinStore.delete(key)
    }
  }
}

// GET - Poll for scanned VIN
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId')

  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'Missing sessionId' }, { status: 400 })
  }

  cleanupExpired()

  const entry = vinStore.get(sessionId)

  if (entry) {
    // Remove after retrieval (one-time use)
    vinStore.delete(sessionId)
    return NextResponse.json({ success: true, vin: entry.vin })
  }

  return NextResponse.json({ success: true, vin: null })
}

// POST - Store scanned VIN from phone
export async function POST(request: NextRequest) {
  try {
    const { sessionId, vin } = await request.json()

    if (!sessionId || !vin) {
      return NextResponse.json({ success: false, error: 'Missing sessionId or vin' }, { status: 400 })
    }

    // Validate VIN format
    const cleanVin = vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '')
    if (cleanVin.length !== 17) {
      return NextResponse.json({ success: false, error: 'Invalid VIN format' }, { status: 400 })
    }

    cleanupExpired()

    vinStore.set(sessionId, {
      vin: cleanVin,
      timestamp: Date.now()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('VIN scan POST error:', error)
    return NextResponse.json({ success: false, error: 'Failed to store VIN' }, { status: 500 })
  }
}
