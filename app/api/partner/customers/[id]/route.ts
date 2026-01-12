// app/api/partner/customers/[id]/route.ts
// Partner Customer Detail API

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: customerId } = await params

    // Get user with all related data
    const user = await prisma.user.findUnique({
      where: { id: customerId },
      include: {
        reviewerProfile: {
          select: {
            id: true,
            profilePhotoUrl: true,
            city: true,
            state: true,
            phoneNumber: true,
            bio: true,
            memberSince: true,
            address: true,
            emergencyContactName: true,
            emergencyContactPhone: true,
            emergencyContactRelation: true,
            stripeIdentityStatus: true,
            stripeIdentityVerifiedAt: true,
            stripeVerifiedFirstName: true,
            stripeVerifiedLastName: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Get partner's vehicles
    const vehicles = await prisma.rentalCar.findMany({
      where: { hostId: partner.id },
      select: { id: true }
    })
    const vehicleIds = vehicles.map(v => v.id)

    // Get all bookings with this partner
    const bookings = await prisma.booking.findMany({
      where: {
        userId: customerId,
        rentalCarId: { in: vehicleIds }
      },
      include: {
        rentalCar: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            primaryPhotoUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate stats
    const totalSpent = bookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0)
    const completedTrips = bookings.filter(b => b.status === 'COMPLETED').length
    const now = new Date()
    const activeBookings = bookings.filter(b =>
      (b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS') &&
      new Date(b.endDate) >= now
    )

    // Format customer data
    const customer = {
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Guest',
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phoneNumber || user.reviewerProfile?.phoneNumber || null,
      photo: user.reviewerProfile?.profilePhotoUrl || user.profileImageUrl || null,
      reviewerProfileId: user.reviewerProfile?.id || null,
      location: user.reviewerProfile?.city && user.reviewerProfile?.state
        ? `${user.reviewerProfile.city}, ${user.reviewerProfile.state}`
        : null,
      address: user.reviewerProfile?.address || null,
      bio: user.reviewerProfile?.bio || null,
      memberSince: user.reviewerProfile?.memberSince?.toISOString() || user.createdAt.toISOString(),
      emergencyContact: user.reviewerProfile?.emergencyContactName ? {
        name: user.reviewerProfile.emergencyContactName,
        phone: user.reviewerProfile.emergencyContactPhone,
        relation: user.reviewerProfile.emergencyContactRelation
      } : null,
      verification: {
        status: user.reviewerProfile?.stripeIdentityStatus || 'not_started',
        verifiedAt: user.reviewerProfile?.stripeIdentityVerifiedAt?.toISOString() || null,
        verifiedFirstName: user.reviewerProfile?.stripeVerifiedFirstName || null,
        verifiedLastName: user.reviewerProfile?.stripeVerifiedLastName || null
      },
      stats: {
        totalSpent,
        tripCount: bookings.length,
        completedTrips,
        activeBookings: activeBookings.length
      }
    }

    // Format bookings
    const formattedBookings = bookings.map(b => ({
      id: b.id,
      vehicle: b.rentalCar
        ? `${b.rentalCar.year} ${b.rentalCar.make} ${b.rentalCar.model}`
        : 'Unknown',
      vehicleId: b.rentalCarId,
      vehiclePhoto: b.rentalCar?.primaryPhotoUrl || null,
      startDate: b.startDate.toISOString(),
      endDate: b.endDate.toISOString(),
      status: b.status,
      total: Number(b.totalPrice) || 0,
      createdAt: b.createdAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      customer,
      bookings: formattedBookings
    })

  } catch (error) {
    console.error('[Partner Customer Detail] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
  }
}

// PUT - Update customer contact info
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: customerId } = await params
    const body = await request.json()

    // Verify customer has bookings with this partner
    const vehicles = await prisma.rentalCar.findMany({
      where: { hostId: partner.id },
      select: { id: true }
    })
    const vehicleIds = vehicles.map(v => v.id)

    const hasBooking = await prisma.booking.findFirst({
      where: {
        userId: customerId,
        rentalCarId: { in: vehicleIds }
      }
    })

    if (!hasBooking) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Update user info
    const updateData: any = {}
    if (body.firstName !== undefined) updateData.firstName = body.firstName
    if (body.lastName !== undefined) updateData.lastName = body.lastName
    if (body.phone !== undefined) updateData.phoneNumber = body.phone

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: customerId },
        data: updateData
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[Partner Customer Update] Error:', error)
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
  }
}
