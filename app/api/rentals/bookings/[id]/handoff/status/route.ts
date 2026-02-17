import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { HANDOFF_STATUS, TRIP_CONSTANTS } from '@/app/lib/trip/constants'
import { sendEmail } from '@/app/lib/email/send-email'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

// Dual-auth: partner JWT checked first (so host sessions use the correct path),
// then guest JWT fallback
async function getAuthenticatedUser(request: NextRequest) {
  // Try partner auth first — avoids verifyRequest picking up the host's
  // accessToken and treating it as guest auth (which fails ownership check)
  const cookieStore = await cookies()
  const partnerToken = cookieStore.get('partner_token')?.value ||
                       cookieStore.get('hostAccessToken')?.value
  if (partnerToken) {
    try {
      const { payload } = await jwtVerify(partnerToken, JWT_SECRET)
      if (payload.hostId) {
        return { type: 'partner' as const, id: payload.hostId as string, email: '' }
      }
    } catch { /* fall through */ }
  }

  // Then try guest auth
  const guestUser = await verifyRequest(request)
  if (guestUser) {
    return { type: 'guest' as const, id: guestUser.id, email: guestUser.email }
  }

  return null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params
    const authUser = await getAuthenticatedUser(request)

    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Build ownership filter based on auth type
    const whereClause = authUser.type === 'partner'
      ? { id: bookingId, hostId: authUser.id }
      : { id: bookingId }

    const booking = await prisma.rentalBooking.findFirst({
      where: whereClause,
      select: {
        id: true,
        renterId: true,
        guestEmail: true,
        guestName: true,
        bookingCode: true,
        handoffStatus: true,
        guestGpsVerifiedAt: true,
        guestGpsDistance: true,
        hostHandoffVerifiedAt: true,
        keyInstructionsDeliveredAt: true,
        handoffAutoFallbackAt: true,
        guestLiveDistance: true,
        guestLiveUpdatedAt: true,
        guestEtaMessage: true,
        guestArrivalSummary: true,
        guestLocationTrust: true,
        car: {
          select: {
            instantBook: true,
            keyInstructions: true,
            year: true,
            make: true,
            model: true,
            host: {
              select: {
                id: true,
                businessName: true,
                name: true,
              }
            }
          }
        },
        // Get latest key instruction message if delivered
        messages: {
          where: { category: 'key_instructions' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { message: true, createdAt: true }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Verify guest ownership (partner already checked via whereClause)
    if (authUser.type === 'guest') {
      const isOwner = (authUser.id && booking.renterId === authUser.id) ||
                      (authUser.email && booking.guestEmail === authUser.email)
      if (!isOwner) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    // Lazy auto-fallback: if timeout passed + instant-book + still GUEST_VERIFIED
    let currentStatus = booking.handoffStatus
    if (
      currentStatus === HANDOFF_STATUS.GUEST_VERIFIED &&
      booking.car.instantBook &&
      booking.handoffAutoFallbackAt &&
      new Date() >= new Date(booking.handoffAutoFallbackAt)
    ) {
      // Auto-complete the handoff
      await prisma.rentalBooking.update({
        where: { id: bookingId },
        data: {
          handoffStatus: HANDOFF_STATUS.HANDOFF_COMPLETE,
          keyInstructionsDeliveredAt: new Date(),
        }
      })
      currentStatus = HANDOFF_STATUS.HANDOFF_COMPLETE

      // Auto-deliver key instructions for instant-book fallback
      const autoKeyInstructions = booking.car.keyInstructions
      if (autoKeyInstructions) {
        const hostName = booking.car.host?.businessName || booking.car.host?.name || 'Host'
        await prisma.rentalMessage.create({
          data: {
            id: crypto.randomUUID(),
            updatedAt: new Date(),
            bookingId,
            senderId: booking.car.host?.id || 'system',
            senderType: 'host',
            senderName: hostName,
            message: autoKeyInstructions,
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
              <p>Your handoff has been auto-completed for the <strong>${carLabel}</strong>.</p>
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 12px 0;">
                <p style="margin: 0 0 4px; font-weight: 600; color: #166534;">Key Instructions</p>
                <p style="margin: 0; color: #374151;">${autoKeyInstructions}</p>
              </div>
              <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/rentals/trip/start/${bookingId}" style="color: #22c55e;">Continue to vehicle inspection</a></p>
            `,
            text: `Key instructions for ${carLabel}: ${autoKeyInstructions}`,
          }).catch(err => console.error('[Handoff] Guest key email failed:', err))
        }
      }
    }

    // Check expiration (30min timeout)
    if (
      currentStatus === HANDOFF_STATUS.GUEST_VERIFIED &&
      booking.guestGpsVerifiedAt
    ) {
      const elapsed = Date.now() - new Date(booking.guestGpsVerifiedAt).getTime()
      const timeoutMs = TRIP_CONSTANTS.HANDOFF_TIMEOUT_MINUTES * 60 * 1000
      if (elapsed > timeoutMs) {
        await prisma.rentalBooking.update({
          where: { id: bookingId },
          data: { handoffStatus: HANDOFF_STATUS.EXPIRED }
        })
        currentStatus = HANDOFF_STATUS.EXPIRED
      }
    }

    // Build response
    const keyInstructions = currentStatus === HANDOFF_STATUS.HANDOFF_COMPLETE
      ? (booking.messages[0]?.message || booking.car.keyInstructions || null)
      : null

    const autoFallbackRemaining = booking.handoffAutoFallbackAt
      ? Math.max(0, new Date(booking.handoffAutoFallbackAt).getTime() - Date.now())
      : null

    // Query latest drop-off notification (trip_update message from guest)
    const dropoffMessage = await prisma.rentalMessage.findFirst({
      where: { bookingId, category: 'trip_update' },
      orderBy: { createdAt: 'desc' },
      select: { message: true, createdAt: true, metadata: true }
    })

    return NextResponse.json({
      handoffStatus: currentStatus || HANDOFF_STATUS.PENDING,
      guestVerifiedAt: booking.guestGpsVerifiedAt,
      guestDistance: booking.guestGpsDistance,
      hostVerifiedAt: booking.hostHandoffVerifiedAt,
      keyInstructionsDeliveredAt: booking.keyInstructionsDeliveredAt,
      keyInstructions,
      isInstantBook: booking.car.instantBook,
      autoFallbackRemainingMs: autoFallbackRemaining,
      // Live tracking data
      guestLiveDistance: booking.guestLiveDistance,
      guestLiveUpdatedAt: booking.guestLiveUpdatedAt,
      guestEtaMessage: booking.guestEtaMessage,
      guestArrivalSummary: booking.guestArrivalSummary,
      guestLocationTrust: booking.guestLocationTrust,
      // Drop-off notification
      dropoffNotification: dropoffMessage ? {
        message: dropoffMessage.message,
        notifiedAt: dropoffMessage.createdAt,
        metadata: dropoffMessage.metadata,
      } : null,
    })
  } catch (error) {
    console.error('[Handoff Status] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch handoff status' }, { status: 500 })
  }
}
