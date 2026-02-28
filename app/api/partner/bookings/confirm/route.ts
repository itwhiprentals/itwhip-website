// app/api/partner/bookings/confirm/route.ts
// Confirm a pending pre-booking (change status from PENDING to CONFIRMED)

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'
import { capturePayment } from '@/app/lib/booking/services/payment-service'
import { generateAgreementToken, getTokenExpiryDate, generateSigningUrl } from '@/app/lib/agreements/tokens'
import { sendEmail } from '@/app/lib/email/send-email'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value
    || cookieStore.get('hostAccessToken')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    if (!partner || !['FLEET_PARTNER', 'PARTNER', 'EXTERNAL'].includes(partner.hostType || '')) {
      return null
    }

    return partner
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    // Find the booking and verify it belongs to this partner
    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        hostId: partner.id
      },
      include: {
        renter: {
          select: {
            name: true,
            email: true
          }
        },
        car: {
          select: {
            make: true,
            model: true,
            year: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if booking is in PENDING status
    if (booking.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Booking cannot be confirmed - current status is ${booking.status}` },
        { status: 400 }
      )
    }

    // Check for conflicts again (in case dates changed or another booking was made)
    const conflicts = await prisma.rentalBooking.findFirst({
      where: {
        carId: booking.carId,
        id: { not: bookingId }, // Exclude this booking
        status: {
          in: ['CONFIRMED', 'ACTIVE']
        },
        startDate: { lte: booking.endDate },
        endDate: { gte: booking.startDate }
      }
    })

    if (conflicts) {
      return NextResponse.json(
        { error: 'Vehicle is no longer available for these dates' },
        { status: 409 }
      )
    }

    // For card bookings with authorized payment: capture before confirming
    if (booking.paymentIntentId && booking.paymentStatus === 'AUTHORIZED') {
      const captureResult = await capturePayment({
        bookingId,
        paymentIntentId: booking.paymentIntentId,
      })
      if (!captureResult.success) {
        console.error(`[Confirm Booking] Payment capture failed for ${bookingId}:`, captureResult.error)
        return NextResponse.json(
          { error: `Payment capture failed: ${captureResult.error}` },
          { status: 400 }
        )
      }
      console.log(`[Confirm Booking] Payment captured for ${bookingId}: ${captureResult.chargeId}`)
    }

    // Update booking to CONFIRMED
    const updatedBooking = await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        notes: booking.notes?.replace('[Partner Manual Booking - Sent for customer review]', '[Partner Manual Booking - Confirmed]') || '[Partner Manual Booking - Confirmed]'
      }
    })

    console.log(`[Confirm Booking] Booking ${bookingId} confirmed by partner ${partner.id}`)

    // ═══════════════════════════════════════════════════════════════════
    // Auto-send rental agreement for MANUAL bookings
    // ═══════════════════════════════════════════════════════════════════
    if (booking.bookingType === 'MANUAL' && booking.agreementStatus !== 'signed') {
      try {
        const customerEmail = booking.renter?.email || booking.guestEmail
        const customerName = booking.renter?.name || booking.guestName || 'Customer'

        if (customerEmail) {
          const agreementToken = generateAgreementToken()
          const expiresAt = getTokenExpiryDate(7)

          // Get agreement preference from prospect
          const prospect = await prisma.hostProspect.findFirst({
            where: { convertedHostId: partner.id },
            select: { agreementPreference: true, hostAgreementUrl: true }
          })

          const agreementType = prospect?.agreementPreference || 'ITWHIP'
          const hostAgreementUrl = prospect?.hostAgreementUrl || null

          await prisma.rentalBooking.update({
            where: { id: bookingId },
            data: {
              agreementToken,
              agreementStatus: 'sent',
              agreementSentAt: new Date(),
              agreementExpiresAt: expiresAt,
              signerEmail: customerEmail,
              agreementType,
              hostAgreementUrl
            }
          })

          const signingUrl = generateSigningUrl(agreementToken)
          const partnerName = partner.partnerCompanyName || partner.name || 'Your Host'
          const vehicleName = `${booking.car?.year} ${booking.car?.make} ${booking.car?.model}`

          await sendEmail({
            to: customerEmail,
            subject: `Please Sign Your Rental Agreement - ${partnerName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">Rental Agreement Ready</h1>
                </div>
                <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                  <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">Hi ${customerName},</p>
                  <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                    <strong>${partnerName}</strong> has confirmed your booking and prepared your rental agreement:
                  </p>
                  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="color: #111827; font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">${vehicleName}</p>
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">
                      ${new Date(booking.startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      to ${new Date(booking.endDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p style="color: #374151; font-size: 16px; margin: 10px 0 0 0;">
                      Total: <strong>$${Number(booking.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                    </p>
                  </div>
                  <p style="color: #374151; font-size: 16px; margin-bottom: 30px;">
                    Please review and sign the agreement to complete your booking.
                  </p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${signingUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Review & Sign Agreement
                    </a>
                  </div>
                  <p style="color: #dc2626; font-size: 12px; margin-top: 20px;"><strong>This link expires in 7 days.</strong></p>
                  <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    If you have questions, contact ${partnerName} at ${partner.partnerSupportEmail || partner.email}.
                  </p>
                </div>
                <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">Powered by <a href="https://itwhip.com" style="color: #f97316;">ItWhip</a></p>
                </div>
              </div>
            `,
            text: `Hi ${customerName},\n\n${partnerName} has confirmed your booking and prepared your rental agreement.\n\n${vehicleName}\n${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}\nTotal: $${Number(booking.totalAmount).toFixed(2)}\n\nReview and sign: ${signingUrl}\n\nThis link expires in 7 days.`
          })

          console.log(`[Confirm Booking] Agreement auto-sent to ${customerEmail} for manual booking ${bookingId}`)
        }
      } catch (agreementErr) {
        // Non-blocking: log but don't fail the confirm
        console.error('[Confirm Booking] Agreement auto-send failed:', agreementErr)
      }
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: updatedBooking.id,
        status: 'CONFIRMED',
        guestName: booking.renter?.name || booking.guestName,
        guestEmail: booking.renter?.email || booking.guestEmail,
        vehicleName: `${booking.car?.year} ${booking.car?.make} ${booking.car?.model}`,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        totalAmount: Number(booking.totalAmount)
      },
      message: 'Booking confirmed successfully'
    })

  } catch (error) {
    console.error('[Confirm Booking] Error:', error)
    return NextResponse.json({ error: 'Failed to confirm booking' }, { status: 500 })
  }
}
