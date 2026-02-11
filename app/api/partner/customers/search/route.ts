// app/api/partner/customers/search/route.ts
// Search customers for manual booking - includes both partner's previous customers and all users

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

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    if (!partner || (partner.hostType !== 'FLEET_PARTNER' && partner.hostType !== 'PARTNER')) {
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
        message: 'Enter at least 2 characters to search'
      })
    }

    // Get partner's vehicles for checking previous customers
    const vehicles = await prisma.rentalCar.findMany({
      where: { hostId: partner.id },
      select: { id: true }
    })
    const vehicleIds = vehicles.map(v => v.id)

    // Get previous customers (users who have booked with this partner)
    const previousBookings = await prisma.rentalBooking.findMany({
      where: {
        carId: { in: vehicleIds },
        renterId: { not: null }
      },
      select: {
        renterId: true
      },
      distinct: ['renterId']
    })
    const previousCustomerIds = previousBookings.map(b => b.renterId).filter(Boolean) as string[]

    // Search users
    const users = await prisma.user.findMany({
      where: {
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
            city: true,
            state: true
          }
        },
        _count: {
          select: {
            rentalBookings: true
          }
        }
      },
      take: 10,
      orderBy: { name: 'asc' }
    })

    // Format results with "previous customer" flag
    const customers = users.map(user => ({
      id: user.id,
      name: user.name || 'Guest',
      email: user.email || '',
      phone: user.phone || null,
      photo: user.reviewerProfile?.profilePhotoUrl || user.image || null,
      reviewerProfileId: user.reviewerProfile?.id || null,
      location: user.reviewerProfile?.city && user.reviewerProfile?.state
        ? `${user.reviewerProfile.city}, ${user.reviewerProfile.state}`
        : null,
      totalBookings: (user._count as any).rentalBookings,
      isPreviousCustomer: previousCustomerIds.includes(user.id)
    }))

    // Sort: previous customers first, then by name
    customers.sort((a, b) => {
      if (a.isPreviousCustomer && !b.isPreviousCustomer) return -1
      if (!a.isPreviousCustomer && b.isPreviousCustomer) return 1
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json({
      success: true,
      customers
    })

  } catch (error) {
    console.error('[Partner Customer Search] Error:', error)
    return NextResponse.json({ error: 'Failed to search customers' }, { status: 500 })
  }
}
