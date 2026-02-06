// app/api/bookings/[id]/reject/route.ts
// Fleet API: Reject a booking
// POST /api/bookings/[id]/reject

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/app/lib/database/prisma'
import { rejectBooking } from '@/app/lib/booking/services/fleet-approval'

// Verify Fleet admin access
async function verifyFleetAccess(request: NextRequest): Promise<{ valid: boolean; adminId?: string; error?: string }> {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get('admin_token')?.value

  if (!adminToken) {
    return { valid: false, error: 'Not authenticated' }
  }

  // Verify admin has fleet access
  const admin = await prisma.user.findFirst({
    where: {
      accessToken: adminToken,
      role: { in: ['admin', 'fleet_admin', 'super_admin'] },
    },
    select: { id: true, name: true, email: true },
  })

  if (!admin) {
    return { valid: false, error: 'Unauthorized - Fleet access required' }
  }

  return { valid: true, adminId: admin.id }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params

    // Verify Fleet access
    const auth = await verifyFleetAccess(request)
    if (!auth.valid) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { reason, notes } = body

    if (!reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    // Reject the booking
    const result = await rejectBooking({
      bookingId,
      reviewedBy: auth.adminId!,
      reason,
      notes,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      bookingId: result.bookingId,
      status: result.newStatus,
      message: 'Booking rejected. Payment authorization cancelled. Guest notified.',
    })
  } catch (error) {
    console.error('[API] Reject booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
