// app/api/partner/customers/search/route.ts
// Two-tier customer search for manual booking:
// Tier 1: "Your Customers" — users who have booked with this host (full info)
// Tier 2: "Other Members" — other platform users (limited info, only if Tier 1 < 3)

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value
    || cookieStore.get('hostAccessToken')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    if (!partner || !['FLEET_PARTNER', 'PARTNER', 'EXTERNAL'].includes(partner.hostType || '')) {
      return null
    }

    return partner
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        customers: [],
        yourCustomers: [],
        otherMembers: [],
        message: 'Enter at least 2 characters to search'
      })
    }

    // ─── Tier 1: Your Customers ──────────────────────────
    // Users who have a booking with this host (by hostId directly)
    const previousBookings = await prisma.rentalBooking.findMany({
      where: {
        hostId: partner.id,
        renterId: { not: null }
      },
      select: { renterId: true },
      distinct: ['renterId']
    })
    const previousCustomerIds = previousBookings.map(b => b.renterId).filter(Boolean) as string[]

    // Search within your customers first
    const yourCustomerUsers = previousCustomerIds.length > 0
      ? await prisma.user.findMany({
          where: {
            id: { in: previousCustomerIds },
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { name: { contains: query, mode: 'insensitive' } },
              { phone: { contains: query } }
            ]
          },
          include: {
            reviewerProfile: {
              select: {
                id: true,
                profilePhotoUrl: true,
                stripeIdentityStatus: true,
                stripeIdentityVerifiedAt: true,
                stripeVerifiedFirstName: true,
                stripeVerifiedLastName: true,
              }
            },
            _count: {
              select: { rentalBookings: true }
            }
          },
          take: 10,
          orderBy: { name: 'asc' }
        })
      : []

    const yourCustomers = yourCustomerUsers.map(user => ({
      id: user.id,
      name: user.name || 'Guest',
      email: user.email || '',
      phone: user.phone || null,
      photo: user.reviewerProfile?.profilePhotoUrl || user.image || null,
      totalBookings: (user._count as any).rentalBookings,
      isPreviousCustomer: true,
      stripeIdentityStatus: user.reviewerProfile?.stripeIdentityStatus || null,
      stripeIdentityVerifiedAt: user.reviewerProfile?.stripeIdentityVerifiedAt?.toISOString() || null,
      stripeVerifiedFirstName: user.reviewerProfile?.stripeVerifiedFirstName || null,
      stripeVerifiedLastName: user.reviewerProfile?.stripeVerifiedLastName || null,
    }))

    // ─── Tier 2: Other Members ───────────────────────────
    // Only search if Tier 1 has fewer than 3 results
    let otherMembers: any[] = []

    if (yourCustomers.length < 3) {
      const otherUsers = await prisma.user.findMany({
        where: {
          id: { notIn: previousCustomerIds.length > 0 ? previousCustomerIds : ['__none__'] },
          OR: [
            { email: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query } }
          ]
        },
        include: {
          reviewerProfile: {
            select: {
              id: true,
              profilePhotoUrl: true,
              stripeIdentityStatus: true,
            }
          },
          _count: {
            select: { rentalBookings: true }
          }
        },
        take: 5,
        orderBy: { name: 'asc' }
      })

      // Privacy: don't expose email/phone for non-customers
      otherMembers = otherUsers.map(user => ({
        id: user.id,
        name: user.name || 'Guest',
        email: null,       // Hidden until selected
        phone: null,       // Hidden until selected
        photo: user.reviewerProfile?.profilePhotoUrl || user.image || null,
        totalBookings: (user._count as any).rentalBookings,
        isPreviousCustomer: false,
        stripeIdentityStatus: user.reviewerProfile?.stripeIdentityStatus || null,
      }))
    }

    // Combined list for backward compatibility (yourCustomers first, then otherMembers)
    const customers = [...yourCustomers, ...otherMembers]

    return NextResponse.json({
      success: true,
      customers,
      yourCustomers,
      otherMembers
    })

  } catch (error) {
    console.error('[Partner Customer Search] Error:', error)
    return NextResponse.json({ error: 'Failed to search customers' }, { status: 500 })
  }
}
