// app/api/partner/claims/[id]/route.ts
// Partner Claims Detail API - Get, update, or manage individual claim

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
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

    const { id: claimId } = await params

    // Get claim with all related data
    const claim = await prisma.claim.findFirst({
      where: {
        id: claimId,
        hostId: partner.id
      },
      include: {
        ClaimDamagePhoto: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' }
        },
        ClaimMessage: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

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
            licensePlate: true,
            vin: true,
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
            email: true,
            phone: true,
            image: true,
            reviewerProfile: {
              select: {
                id: true,
                profilePhotoUrl: true
              }
            }
          }
        }
      }
    })

    // Format response
    const response = {
      success: true,
      claim: {
        id: claim.id,
        type: claim.type,
        status: claim.status,
        description: claim.description,
        incidentDate: claim.incidentDate.toISOString(),
        createdAt: claim.createdAt.toISOString(),
        updatedAt: claim.updatedAt.toISOString(),
        estimatedCost: claim.estimatedCost ? Number(claim.estimatedCost) : null,
        approvedAmount: claim.approvedAmount ? Number(claim.approvedAmount) : null,
        paidAmount: claim.paidAmount ? Number(claim.paidAmount) : null,
        photos: claim.ClaimDamagePhoto.map(p => ({
          id: p.id,
          url: p.url,
          order: p.order,
          uploadedBy: p.uploadedBy,
          createdAt: p.createdAt.toISOString()
        })),
        messages: claim.ClaimMessage.map(m => ({
          id: m.id,
          senderType: m.senderType,
          senderName: m.senderName,
          message: m.message,
          isRead: m.isRead,
          createdAt: m.createdAt.toISOString()
        }))
      },
      booking: booking ? {
        id: booking.id,
        bookingCode: booking.bookingCode,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        status: booking.status,
        totalAmount: Number(booking.totalAmount)
      } : null,
      vehicle: booking?.car ? {
        id: booking.car.id,
        name: `${booking.car.year} ${booking.car.make} ${booking.car.model}`,
        make: booking.car.make,
        model: booking.car.model,
        year: booking.car.year,
        licensePlate: booking.car.licensePlate,
        vin: booking.car.vin,
        photo: booking.car.photos?.[0]?.url || null
      } : null,
      renter: booking?.renter ? {
        id: booking.renter.id,
        name: booking.renter.name,
        email: booking.renter.email,
        phone: booking.renter.phone,
        photo: booking.renter.reviewerProfile?.profilePhotoUrl || booking.renter.image || null
      } : null
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('[Partner Claim Detail] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch claim' }, { status: 500 })
  }
}

// PUT - Update claim status or details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: claimId } = await params
    const body = await request.json()

    // Verify claim belongs to partner
    const claim = await prisma.claim.findFirst({
      where: {
        id: claimId,
        hostId: partner.id
      }
    })

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    const { status, notes } = body

    const updateData: any = {}
    if (status) updateData.status = status
    if (notes !== undefined) updateData.description = notes

    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      claim: {
        id: updatedClaim.id,
        status: updatedClaim.status
      },
      message: 'Claim updated successfully'
    })

  } catch (error) {
    console.error('[Partner Claim Update] Error:', error)
    return NextResponse.json({ error: 'Failed to update claim' }, { status: 500 })
  }
}
