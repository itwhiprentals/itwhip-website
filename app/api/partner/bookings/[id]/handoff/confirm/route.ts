import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'
import { calculateDistance } from '@/lib/utils/distance'
import { HANDOFF_STATUS, TRIP_CONSTANTS } from '@/app/lib/trip/constants'
import { sendEmail } from '@/app/lib/email/send-email'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('hostAccessToken')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return await prisma.rentalHost.findUnique({
      where: { id: payload.hostId as string }
    })
  } catch {
    return null
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await getPartnerFromToken()
    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: bookingId } = await params
    const body = await request.json()
    const { latitude, longitude, keyInstructions, saveKeyInstructions } = body

    // Fetch booking with ownership check
    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        hostId: partner.id,
      },
      select: {
        id: true,
        handoffStatus: true,
        guestName: true,
        guestEmail: true,
        bookingCode: true,
        car: {
          select: {
            id: true,
            year: true,
            make: true,
            model: true,
            latitude: true,
            longitude: true,
            instantBook: true,
            keyInstructions: true,
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Guest must have verified first
    if (booking.handoffStatus !== HANDOFF_STATUS.GUEST_VERIFIED) {
      return NextResponse.json({
        error: 'Guest must verify their location first',
        currentStatus: booking.handoffStatus,
      }, { status: 400 })
    }

    // Silently check host GPS (soft requirement — logged but doesn't block)
    let hostDistanceMeters: number | null = null
    let hostWithinRange = true
    if (typeof latitude === 'number' && typeof longitude === 'number' &&
        !(latitude === 0 && longitude === 0) &&
        booking.car.latitude && booking.car.longitude) {
      const distanceMiles = calculateDistance(
        { latitude, longitude },
        { latitude: booking.car.latitude, longitude: booking.car.longitude }
      )
      hostDistanceMeters = Math.round(distanceMiles * 1609.34)
      hostWithinRange = hostDistanceMeters <= TRIP_CONSTANTS.HOST_HANDOFF_RADIUS_METERS

      if (!hostWithinRange) {
        console.log(`[Handoff] Host GPS soft-fail: ${hostDistanceMeters}m from car (limit: ${TRIP_CONSTANTS.HOST_HANDOFF_RADIUS_METERS}m)`)
      }
    }

    // Atomic update: handoff complete in one operation
    const updateData: any = {
      handoffStatus: HANDOFF_STATUS.HANDOFF_COMPLETE,
      hostHandoffVerifiedAt: new Date(),
      hostHandoffLatitude: typeof latitude === 'number' ? latitude : null,
      hostHandoffLongitude: typeof longitude === 'number' ? longitude : null,
      hostHandoffDistance: hostDistanceMeters,
    }

    // Resolve effective key instructions: host-typed > saved on car
    const effectiveKeyInstructions =
      (typeof keyInstructions === 'string' && keyInstructions.trim())
        ? keyInstructions.trim()
        : (booking.car.keyInstructions || null)

    if (effectiveKeyInstructions) {
      updateData.keyInstructionsDeliveredAt = new Date()
    }

    await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: updateData,
    })

    // Create a message for guest with key instructions (idempotent — skip if already sent)
    if (effectiveKeyInstructions) {
      const existingKeyMsg = await prisma.rentalMessage.findFirst({
        where: { bookingId, category: 'key_instructions' },
        select: { id: true },
      })

      if (!existingKeyMsg) {
        await prisma.rentalMessage.create({
          data: {
            id: crypto.randomUUID(),
            updatedAt: new Date(),
            bookingId,
            senderId: partner.id,
            senderType: 'host',
            senderName: partner.businessName || partner.name || 'Host',
            message: effectiveKeyInstructions,
            category: 'key_instructions',
          }
        })

        // Email guest with key instructions
        if (booking.guestEmail) {
          const carLabel = `${booking.car.year || ''} ${booking.car.make || ''} ${booking.car.model || ''}`.trim()
          await sendEmail({
            to: booking.guestEmail,
            subject: `Key instructions — ${booking.bookingCode || bookingId}`,
            html: `
              <p>Your host has confirmed the handoff for the <strong>${carLabel}</strong>.</p>
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 12px 0;">
                <p style="margin: 0 0 4px; font-weight: 600; color: #166534;">Key Instructions</p>
                <p style="margin: 0; color: #374151;">${effectiveKeyInstructions}</p>
              </div>
              <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/rentals/trip/start/${bookingId}" style="color: #22c55e;">Continue to vehicle inspection</a></p>
            `,
            text: `Key instructions for ${carLabel}: ${effectiveKeyInstructions}`,
          }).catch(err => console.error('[Handoff] Guest key email failed:', err))
        }
      }
    }

    // Optionally save key instructions to car for reuse
    if (saveKeyInstructions && typeof keyInstructions === 'string' && keyInstructions.trim()) {
      await prisma.rentalCar.update({
        where: { id: booking.car.id },
        data: { keyInstructions: keyInstructions.trim() }
      })
    }

    return NextResponse.json({
      success: true,
      handoffStatus: HANDOFF_STATUS.HANDOFF_COMPLETE,
      hostDistance: hostDistanceMeters,
      hostWithinRange,
    })
  } catch (error) {
    console.error('[Handoff Confirm] Error:', error)
    return NextResponse.json({ error: 'Failed to confirm handoff' }, { status: 500 })
  }
}
