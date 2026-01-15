// app/api/agreements/view/[bookingId]/route.ts
// Get signed agreement info for viewing

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params

    // Find booking with signed agreement
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        bookingCode: true,
        agreementStatus: true,
        agreementSignedAt: true,
        agreementSignedPdfUrl: true,
        signerName: true,
        guestName: true,
        car: {
          select: {
            year: true,
            make: true,
            model: true
          }
        },
        host: {
          select: {
            name: true,
            partnerCompanyName: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if agreement is signed
    if (booking.agreementStatus !== 'signed' || !booking.agreementSignedPdfUrl) {
      return NextResponse.json(
        { error: 'Agreement not signed or PDF not available' },
        { status: 404 }
      )
    }

    const vehicleName = booking.car
      ? `${booking.car.year} ${booking.car.make} ${booking.car.model}`
      : 'Vehicle'

    return NextResponse.json({
      success: true,
      agreement: {
        bookingCode: booking.bookingCode,
        vehicle: vehicleName,
        guestName: booking.signerName || booking.guestName || 'Guest',
        hostName: booking.host?.partnerCompanyName || booking.host?.name || 'Provider',
        signedAt: booking.agreementSignedAt?.toISOString(),
        pdfUrl: booking.agreementSignedPdfUrl
      }
    })

  } catch (error) {
    console.error('[Agreement View] Error:', error)
    return NextResponse.json(
      { error: 'Failed to load agreement' },
      { status: 500 }
    )
  }
}
