// app/api/agreements/view/[bookingId]/route.ts
// Get agreement info for viewing — handles all states:
//   signed   → returns signed PDF URL
//   draft    → normal booking, agreement viewable as unsigned preview
//   pending  → manual/cash booking, waiting for guest to sign

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params

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
        isManualBooking: true,
        paymentType: true,
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

    const vehicleName = booking.car
      ? `${booking.car.year} ${booking.car.make} ${booking.car.model}`
      : 'Vehicle'

    const base = {
      bookingCode: booking.bookingCode,
      vehicle: vehicleName,
      guestName: booking.signerName || booking.guestName || 'Guest',
      hostName: booking.host?.partnerCompanyName || booking.host?.name || 'Provider',
    }

    // 1) Signed — return the signed PDF
    if (booking.agreementStatus === 'signed' && booking.agreementSignedPdfUrl) {
      return NextResponse.json({
        success: true,
        status: 'signed',
        agreement: {
          ...base,
          signedAt: booking.agreementSignedAt?.toISOString(),
          pdfUrl: booking.agreementSignedPdfUrl,
        }
      })
    }

    // 2) Manual/cash booking — agreement pending guest signature
    const isCashFlow = booking.isManualBooking || booking.paymentType === 'CASH'
    if (isCashFlow) {
      const agStatus = (booking.agreementStatus ?? '').toLowerCase()
      return NextResponse.json({
        success: true,
        status: agStatus === 'sent' || agStatus === 'viewed' ? 'pending_signature' : 'not_sent',
        agreement: base,
      })
    }

    // 3) Normal booking — agreement always viewable as unsigned draft
    return NextResponse.json({
      success: true,
      status: 'draft',
      agreement: {
        ...base,
        previewUrl: `/api/agreements/view/${bookingId}/preview`,
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
