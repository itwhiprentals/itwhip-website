// app/api/partner/session/route.ts
// Partner Session API - Check authentication and get partner data

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-here'
)

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('partner_token')?.value

    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: 'No session found' },
        { status: 401 }
      )
    }

    // Verify token
    let payload
    try {
      const verified = await jwtVerify(token, JWT_SECRET)
      payload = verified.payload
    } catch (error) {
      return NextResponse.json(
        { authenticated: false, error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    // Check if partner flag is set
    if (!payload.isPartner) {
      return NextResponse.json(
        { authenticated: false, error: 'Not a partner session' },
        { status: 403 }
      )
    }

    // Fetch partner data
    const partner = await prisma.rentalHost.findUnique({
      where: { id: payload.hostId as string },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        hostType: true,
        approvalStatus: true,
        active: true,
        partnerCompanyName: true,
        partnerSlug: true,
        partnerLogo: true,
        partnerBio: true,
        partnerSupportEmail: true,
        partnerSupportPhone: true,
        currentCommissionRate: true,
        partnerFleetSize: true,
        partnerTotalBookings: true,
        partnerTotalRevenue: true,
        partnerAvgRating: true,
        stripeConnectAccountId: true,
        createdAt: true
      }
    })

    if (!partner) {
      return NextResponse.json(
        { authenticated: false, error: 'Partner not found' },
        { status: 404 }
      )
    }

    // Check if partner is still approved and active
    if (partner.hostType !== 'FLEET_PARTNER' && partner.hostType !== 'PARTNER') {
      return NextResponse.json(
        { authenticated: false, error: 'Not a fleet partner account' },
        { status: 403 }
      )
    }

    if (partner.approvalStatus === 'SUSPENDED') {
      return NextResponse.json(
        { authenticated: false, error: 'Partner account suspended' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      partner
    })

  } catch (error: any) {
    console.error('[Partner Session] Error:', error)
    return NextResponse.json(
      { authenticated: false, error: 'Session check failed' },
      { status: 500 }
    )
  }
}
