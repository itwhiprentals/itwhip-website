// app/api/agreements/view/[bookingId]/preview/route.ts
// Public endpoint: generates unsigned agreement PDF preview for guests
// Normal bookings always have a viewable (unsigned) agreement

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { generateAgreementPDFBuffer } from '@/app/lib/agreements/generator'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params

    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      include: {
        car: {
          select: {
            year: true,
            make: true,
            model: true,
            vin: true,
            licensePlate: true,
            color: true,
          }
        },
        host: {
          select: {
            name: true,
            email: true,
            partnerCompanyName: true,
            partnerSupportEmail: true,
            partnerSupportPhone: true,
            city: true,
            state: true,
            zipCode: true,
          }
        },
        renter: {
          select: {
            name: true,
            email: true,
            phone: true,
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // If already signed, redirect to signed PDF
    if (booking.agreementStatus === 'signed' && booking.agreementSignedPdfUrl) {
      return NextResponse.redirect(
        new URL(`/api/agreements/view/${bookingId}/pdf`, _request.url)
      )
    }

    const partner = booking.host

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
        pickupLocation: booking.pickupLocation || `${partner?.city || 'Phoenix'}, ${partner?.state || 'AZ'}`,
        pickupType: booking.pickupType || 'pickup',
      },
      vehicle: {
        year: booking.car?.year || 0,
        make: booking.car?.make || '',
        model: booking.car?.model || '',
        vin: booking.car?.vin || undefined,
        licensePlate: booking.car?.licensePlate || undefined,
        color: booking.car?.color || undefined,
      },
      partner: {
        companyName: partner?.partnerCompanyName || partner?.name || 'ITWhip',
        name: partner?.name || 'ITWhip',
        email: partner?.partnerSupportEmail || partner?.email || '',
        phone: partner?.partnerSupportPhone || undefined,
        city: partner?.city || undefined,
        state: partner?.state || undefined,
        zipCode: partner?.zipCode || undefined,
      },
      customer: {
        name: booking.renter?.name || booking.guestName || 'Guest',
        email: booking.renter?.email || booking.guestEmail || '',
        phone: booking.renter?.phone || booking.guestPhone || undefined,
      },
    })

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="agreement-${booking.bookingCode || booking.id.slice(0, 8)}.pdf"`,
        'Cache-Control': 'public, max-age=300',
      }
    })

  } catch (error) {
    console.error('[Agreement Preview] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate agreement preview' },
      { status: 500 }
    )
  }
}
