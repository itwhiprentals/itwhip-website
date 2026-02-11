// app/api/partner/claims/route.ts
// Partner Claims Management API

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

async function getPartnerFromToken(request?: NextRequest) {
  // Check Authorization header first (mobile app)
  const authHeader = request?.headers.get('authorization')
  let token: string | undefined
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }
  // Fall back to cookies (web)
  if (!token) {
    const cookieStore = await cookies()
    token = cookieStore.get('partner_token')?.value ||
            cookieStore.get('hostAccessToken')?.value
  }

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

export async function GET(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken(request)

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const vehicleId = searchParams.get('vehicleId')

    // Build where clause - claims associated with this host
    const where: any = {
      hostId: partner.id
    }

    if (status !== 'all') {
      where.status = status
    }

    // Get claims
    const claims = await prisma.claim.findMany({
      where,
      include: {
        ClaimDamagePhoto: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
          take: 1
        },
        ClaimMessage: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get vehicle and booking info for each claim
    const formattedClaims = await Promise.all(claims.map(async (claim) => {
      // Get booking and vehicle info
      const booking = await prisma.rentalBooking.findUnique({
        where: { id: claim.bookingId },
        include: {
          car: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              photos: {
                select: {
                  url: true
                },
                orderBy: [{ isHero: 'desc' }, { order: 'asc' }],
                take: 1
              }
            }
          },
          renter: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      return {
        id: claim.id,
        type: claim.type,
        status: claim.status,
        description: claim.description,
        incidentDate: claim.incidentDate.toISOString(),
        createdAt: claim.createdAt.toISOString(),
        estimatedCost: claim.estimatedCost ? Number(claim.estimatedCost) : null,
        approvedAmount: claim.approvedAmount ? Number(claim.approvedAmount) : null,
        paidAmount: claim.paidAmount ? Number(claim.paidAmount) : null,
        vehicleName: booking?.car
          ? `${booking.car.year} ${booking.car.make} ${booking.car.model}`
          : 'Unknown Vehicle',
        vehicleId: booking?.car?.id || null,
        vehiclePhoto: booking?.car?.photos?.[0]?.url || null,
        guestName: booking?.renter?.name || booking?.guestName || 'Unknown Guest',
        guestEmail: booking?.renter?.email || booking?.guestEmail || null,
        bookingId: claim.bookingId,
        photoUrl: claim.ClaimDamagePhoto[0]?.url || null,
        photoCount: claim.ClaimDamagePhoto.length,
        hasUnreadMessages: claim.ClaimMessage.some(m => !m.isRead && m.senderType !== 'HOST'),
        lastMessageAt: claim.ClaimMessage[0]?.createdAt?.toISOString() || null
      }
    }))

    // Filter by vehicle if specified
    let filteredClaims = formattedClaims
    if (vehicleId) {
      filteredClaims = formattedClaims.filter(c => c.vehicleId === vehicleId)
    }

    // Calculate stats
    const stats = {
      total: claims.length,
      pending: claims.filter(c => c.status === 'PENDING' || c.status === 'UNDER_REVIEW').length,
      approved: claims.filter(c => c.status === 'APPROVED' || c.status === 'PAID').length,
      disputed: claims.filter(c => c.status === 'DISPUTED').length,
      totalEstimated: claims.reduce((sum, c) => sum + (Number(c.estimatedCost) || 0), 0),
      totalPaid: claims.reduce((sum, c) => sum + (Number(c.paidAmount) || 0), 0)
    }

    return NextResponse.json({
      success: true,
      claims: filteredClaims,
      stats
    })

  } catch (error) {
    console.error('[Partner Claims] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 })
  }
}

// POST - Create new claim
export async function POST(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken(request)

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      bookingId,
      type,
      description,
      incidentDate,
      estimatedCost,
      photoUrls // Array of photo URLs
    } = body

    // Validate required fields
    if (!bookingId || !type || !description || !incidentDate) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingId, type, description, incidentDate' },
        { status: 400 }
      )
    }

    // Verify booking belongs to partner's vehicles
    const vehicles = await prisma.rentalCar.findMany({
      where: { hostId: partner.id },
      select: { id: true }
    })
    const vehicleIds = vehicles.map(v => v.id)

    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        carId: { in: vehicleIds }
      },
      include: {
        car: true,
        InsurancePolicy: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or does not belong to this partner' },
        { status: 404 }
      )
    }

    // Get or create a policy ID (using vehicle's policy if exists)
    const policyId = (booking as any).car?.InsurancePolicy?.id || `manual_${Date.now()}`

    // Create the claim
    const claim = await prisma.claim.create({
      data: {
        id: crypto.randomUUID(),
        policyId,
        bookingId,
        hostId: partner.id,
        type,
        reportedBy: partner.id,
        description,
        incidentDate: new Date(incidentDate),
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : 0,
        status: 'PENDING',
        updatedAt: new Date()
      }
    })

    // Add photos if provided
    if (photoUrls && photoUrls.length > 0) {
      await prisma.claimDamagePhoto.createMany({
        data: photoUrls.map((url: string, index: number) => ({
          claimId: claim.id,
          url,
          order: index,
          uploadedBy: 'HOST'
        }))
      })
    }

    return NextResponse.json({
      success: true,
      claim: {
        id: claim.id,
        type: claim.type,
        status: claim.status
      },
      message: 'Claim filed successfully'
    })

  } catch (error) {
    console.error('[Partner Claims] Create error:', error)
    return NextResponse.json({ error: 'Failed to create claim' }, { status: 500 })
  }
}
