// app/api/partner/customers/[id]/route.ts
// Partner Customer Detail API

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  // Accept both partner_token AND hostAccessToken for unified portal
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('hostAccessToken')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    // Allow all host types since we've unified the portals
    if (!partner) {
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

    // Build OR condition for matching bookings by renterId or guestEmail
    const guestMatchCondition = [
      { renterId: customerId },
      ...(user.email ? [{ guestEmail: user.email }] : [])
    ]

    // Fetch ALL bookings for this guest across the entire platform + bookings with this host
    const [allBookings, reviews] = await Promise.all([
      prisma.rentalBooking.findMany({
        where: {
          OR: guestMatchCondition
        },
        include: {
          car: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              photos: {
                select: { url: true },
                orderBy: [{ isHero: 'desc' }, { order: 'asc' }],
                take: 1
              }
            }
          },
          host: {
            select: {
              id: true,
              name: true,
              businessName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      // Reviews by this guest for this host
      prisma.rentalReview.findMany({
        where: {
          renterId: customerId,
          hostId: partner.id,
          isVisible: true
        },
        select: {
          id: true,
          rating: true,
          title: true,
          comment: true,
          createdAt: true,
          car: {
            select: { make: true, model: true, year: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ])

    // Split: bookings with this host vs all bookings
    const hostBookings = allBookings.filter(b => b.hostId === partner.id)
    const now = new Date()

    // Stats: with this host (including pending)
    const spentWithHost = hostBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0)
    const completedWithHost = hostBookings.filter(b => b.status === 'COMPLETED').length
    const activeWithHost = hostBookings.filter(b =>
      (b.status === 'CONFIRMED' || b.status === 'ACTIVE') &&
      new Date(b.endDate) >= now
    )

    // Stats: platform-wide
    const totalPlatformBookings = allBookings.length
    const totalPlatformSpent = allBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0)

    // Format customer data
    const customer = {
      id: user.id,
      name: user.name || 'Guest',
      email: user.email,
      phone: user.phone || user.reviewerProfile?.phoneNumber || null,
      photo: user.reviewerProfile?.profilePhotoUrl || user.image || null,
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
        // With this host
        spentWithHost,
        bookingsWithHost: hostBookings.length,
        completedWithHost,
        activeWithHost: activeWithHost.length,
        // Platform-wide
        totalPlatformBookings,
        totalPlatformSpent
      }
    }

    // Format ALL bookings (full platform history)
    const formattedBookings = allBookings.map(b => ({
      id: b.id,
      vehicle: b.car
        ? `${b.car.year} ${b.car.make} ${b.car.model}`
        : 'Unknown',
      vehicleYear: b.car?.year || null,
      vehicleMake: b.car?.make || null,
      vehicleModel: b.car?.model || null,
      vehicleId: b.carId,
      vehiclePhoto: b.car?.photos?.[0]?.url || null,
      startDate: b.startDate.toISOString(),
      endDate: b.endDate.toISOString(),
      status: b.status,
      total: Number(b.totalAmount) || 0,
      createdAt: b.createdAt.toISOString(),
      isWithYou: b.hostId === partner.id,
      hostName: b.host?.businessName || b.host?.name || null
    }))

    const formattedReviews = reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      vehicle: r.car ? `${r.car.year} ${r.car.make} ${r.car.model}` : 'Vehicle',
      createdAt: r.createdAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      customer,
      bookings: formattedBookings,
      reviews: formattedReviews
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
    const hasBooking = await prisma.rentalBooking.findFirst({
      where: {
        renterId: customerId,
        hostId: partner.id
      }
    })

    if (!hasBooking) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Update user info
    const updateData: any = {}
    // Handle name - can be sent as name or firstName/lastName
    if (body.name !== undefined) {
      updateData.name = body.name
    } else if (body.firstName !== undefined || body.lastName !== undefined) {
      const firstName = body.firstName || ''
      const lastName = body.lastName || ''
      updateData.name = `${firstName} ${lastName}`.trim()
    }
    if (body.phone !== undefined) updateData.phone = body.phone

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
