// app/api/partner/customers/search/route.ts
// Search customers for manual booking - includes both partner's previous customers and all users

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
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
    const previousBookings = await prisma.booking.findMany({
      where: {
        rentalCarId: { in: vehicleIds },
        userId: { not: null }
      },
      select: {
        userId: true
      },
      distinct: ['userId']
    })
    const previousCustomerIds = previousBookings.map(b => b.userId).filter(Boolean) as string[]

    // Search users
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { phoneNumber: { contains: query } }
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
            bookings: true
          }
        }
      },
      take: 10,
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    })

    // Format results with "previous customer" flag
    const customers = users.map(user => ({
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Guest',
      email: user.email || '',
      phone: user.phoneNumber || null,
      photo: user.reviewerProfile?.profilePhotoUrl || user.profileImageUrl || null,
      reviewerProfileId: user.reviewerProfile?.id || null,
      location: user.reviewerProfile?.city && user.reviewerProfile?.state
        ? `${user.reviewerProfile.city}, ${user.reviewerProfile.state}`
        : null,
      totalBookings: user._count.bookings,
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
