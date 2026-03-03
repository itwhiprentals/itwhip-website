// app/api/fleet/bookings/[id]/no-show/route.ts
// Fleet admin manually marks a booking as no-show

import { NextRequest, NextResponse } from 'next/server'
import { processNoShow } from '@/app/lib/bookings/no-show'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Fleet admin auth is handled by middleware
    const { id: bookingId } = await params

    const result = await processNoShow(bookingId, 'ADMIN')

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      feeCharged: result.feeCharged,
      feeStatus: result.feeStatus,
    })
  } catch (error) {
    console.error('[Fleet No-Show] Error:', error)
    return NextResponse.json({ error: 'Failed to process no-show' }, { status: 500 })
  }
}
