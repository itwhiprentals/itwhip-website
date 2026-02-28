// app/api/agreements/preview/route.ts
// Generate an unsigned agreement PDF preview for a booking

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'
import { generateAgreementPDFBuffer } from '@/app/lib/agreements/generator'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

async function getPartner() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('host_access_token')?.value ||
                cookieStore.get('hostAccessToken')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
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
      }
    })

    return host
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const partner = await getPartner()
    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookingId = request.nextUrl.searchParams.get('bookingId')
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        hostId: partner.id
      },
      include: {
        car: {
          select: {
            year: true,
            make: true,
            model: true,
            vin: true,
            licensePlate: true,
            color: true
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
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // If already signed and has PDF, redirect to the signed PDF
    if (booking.agreementStatus === 'signed' && booking.agreementSignedPdfUrl) {
      return NextResponse.redirect(
        new URL(`/api/agreements/view/${bookingId}/pdf`, request.url)
      )
    }

    // Generate unsigned preview PDF
    const pdfBuffer = await generateAgreementPDFBuffer({
      booking: {
        id: booking.id,
        bookingCode: booking.bookingCode || booking.id.slice(0, 8).toUpperCase(),
        startDate: new Date(booking.startDate),
        endDate: new Date(booking.endDate),
        startTime: booking.startTime || '10:00',
        endTime: booking.endTime || '10:00',
        numberOfDays: booking.numberOfDays,
        dailyRate: booking.dailyRate,
        totalAmount: booking.totalAmount,
        securityDeposit: booking.securityDeposit || 0,
        pickupLocation: booking.pickupLocation || `${partner.city || 'Phoenix'}, ${partner.state || 'AZ'}`,
        pickupType: booking.pickupType || 'pickup'
      },
      vehicle: {
        year: booking.car?.year || 0,
        make: booking.car?.make || '',
        model: booking.car?.model || '',
        vin: booking.car?.vin || undefined,
        licensePlate: booking.car?.licensePlate || undefined,
        color: booking.car?.color || undefined
      },
      partner: {
        companyName: partner.partnerCompanyName || partner.name,
        name: partner.name,
        email: partner.partnerSupportEmail || partner.email,
        phone: partner.partnerSupportPhone || undefined,
        city: partner.city || undefined,
        state: partner.state || undefined,
        zipCode: partner.zipCode || undefined
      },
      customer: {
        name: booking.renter?.name || booking.guestName || 'Guest',
        email: booking.renter?.email || booking.guestEmail || '',
        phone: booking.renter?.phone || booking.guestPhone || undefined
      }
    })

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="agreement-preview-${booking.bookingCode || booking.id.slice(0, 8)}.pdf"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('[Agreement Preview] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    )
  }
}
