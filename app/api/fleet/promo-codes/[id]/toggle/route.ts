// app/api/fleet/promo-codes/[id]/toggle/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// POST - Toggle isActive for a promo code
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Find the current promo code
    const existing = await prisma.platform_promo_codes.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Promo code not found' },
        { status: 404 }
      )
    }

    // Toggle isActive
    const updated = await prisma.platform_promo_codes.update({
      where: { id },
      data: { isActive: !existing.isActive }
    })

    return NextResponse.json({ success: true, isActive: updated.isActive })
  } catch (error) {
    console.error('[Fleet Promo Codes] Toggle error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to toggle promo code' },
      { status: 500 }
    )
  }
}
