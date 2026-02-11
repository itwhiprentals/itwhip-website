// app/api/rentals/book/guest/route.ts
// SECURITY FIX: Legacy guest booking route REMOVED
// This route bypassed ALL security controls (no DL verification, no fraud detection,
// no self-booking prevention, no rate limiting, no suspended identifier check).
// All bookings must go through the main /api/rentals/book endpoint.

import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'This endpoint has been deprecated. Please use /api/rentals/book instead.',
      code: 'ENDPOINT_DEPRECATED'
    },
    { status: 410 } // 410 Gone
  )
}
