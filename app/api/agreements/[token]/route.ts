// app/api/agreements/[token]/route.ts
// Retrieve agreement details for signing (public - no auth required)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { isTokenExpired, isValidTokenFormat } from '@/app/lib/agreements/tokens'

// GET - Retrieve agreement for signing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Validate token format
    if (!isValidTokenFormat(token)) {
      return NextResponse.json(
        { error: 'Invalid agreement link' },
        { status: 400 }
      )
    }

    // Find booking by token
    const booking = await prisma.rentalBooking.findFirst({
      where: {
        agreementToken: token
      },
      include: {
        car: {
          select: {
            year: true,
            make: true,
            model: true,
            vin: true,
            licensePlate: true,
            color: true,
            photos: {
              select: { url: true },
              where: { isHero: true },
              take: 1
            }
          }
        },
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            partnerCompanyName: true,
            partnerSupportEmail: true,
            partnerSupportPhone: true,
            city: true,
            state: true,
            zipCode: true,
            agreementTemplateCustom: true
          }
        },
        renter: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Agreement not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // Check if already signed
    if (booking.agreementStatus === 'signed') {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itwhip.com'
      return NextResponse.json({
        status: 'already_signed',
        message: 'This agreement has already been signed',
        signedAt: booking.agreementSignedAt?.toISOString(),
        signerName: booking.signerName,
        pdfUrl: booking.agreementSignedPdfUrl,
        viewerUrl: `${baseUrl}/agreements/view/${booking.id}`
      })
    }

    // Check if expired
    if (isTokenExpired(booking.agreementExpiresAt)) {
      return NextResponse.json({
        status: 'expired',
        message: 'This agreement link has expired. Please contact the rental provider for a new link.',
        partnerEmail: booking.host?.partnerSupportEmail || booking.host?.email
      }, { status: 410 })
    }

    // Update agreement status to viewed (if first view)
    if (booking.agreementStatus !== 'viewed') {
      await prisma.rentalBooking.update({
        where: { id: booking.id },
        data: {
          agreementStatus: 'viewed',
          agreementViewedAt: new Date()
        }
      })
    }

    // Get custom clauses from partner
    let customClauses: string[] = []
    if (booking.host?.agreementTemplateCustom) {
      const templateData = booking.host.agreementTemplateCustom as { customClauses?: string[] }
      customClauses = templateData.customClauses || []
    }

    // Format response
    const response = {
      success: true,
      status: 'ready_to_sign',

      booking: {
        id: booking.id,
        bookingCode: booking.bookingCode,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        startTime: booking.startTime,
        endTime: booking.endTime,
        numberOfDays: booking.numberOfDays,
        dailyRate: Number(booking.dailyRate),
        totalAmount: Number(booking.totalAmount),
        securityDeposit: Number(booking.securityDeposit),
        pickupLocation: booking.pickupLocation,
        pickupType: booking.pickupType
      },

      vehicle: booking.car ? {
        year: booking.car.year,
        make: booking.car.make,
        model: booking.car.model,
        vin: booking.car.vin,
        licensePlate: booking.car.licensePlate,
        color: booking.car.color,
        photo: booking.car.photos?.[0]?.url || null
      } : null,

      partner: booking.host ? {
        companyName: booking.host.partnerCompanyName || booking.host.name,
        name: booking.host.name,
        email: booking.host.partnerSupportEmail || booking.host.email,
        phone: booking.host.partnerSupportPhone,
        city: booking.host.city,
        state: booking.host.state
      } : null,

      customer: {
        name: booking.renter?.name || booking.guestName || 'Guest',
        email: booking.renter?.email || booking.guestEmail || booking.signerEmail,
        phone: booking.renter?.phone || booking.guestPhone
      },

      customClauses,

      expiresAt: booking.agreementExpiresAt?.toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('[Agreement Get] Error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve agreement' },
      { status: 500 }
    )
  }
}
