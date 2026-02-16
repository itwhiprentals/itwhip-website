import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { HANDOFF_STATUS, TRIP_CONSTANTS } from '@/app/lib/trip/constants'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

// Dual-auth: guest JWT or partner JWT
async function getAuthenticatedUser(request: NextRequest) {
  // Try guest auth first
  const guestUser = await verifyRequest(request)
  if (guestUser) {
    return { type: 'guest' as const, id: guestUser.id, email: guestUser.email }
  }

  // Try partner auth
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('hostAccessToken')?.value
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      return { type: 'partner' as const, id: payload.hostId as string, email: '' }
    } catch { /* fall through */ }
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
        handoffStatus: true,
        guestGpsVerifiedAt: true,
        guestGpsDistance: true,
        hostHandoffVerifiedAt: true,
        keyInstructionsDeliveredAt: true,
        handoffAutoFallbackAt: true,
        car: {
          select: {
            instantBook: true,
            keyInstructions: true,
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

    return NextResponse.json({
      handoffStatus: currentStatus || HANDOFF_STATUS.PENDING,
      guestVerifiedAt: booking.guestGpsVerifiedAt,
      guestDistance: booking.guestGpsDistance,
      hostVerifiedAt: booking.hostHandoffVerifiedAt,
      keyInstructionsDeliveredAt: booking.keyInstructionsDeliveredAt,
      keyInstructions,
      isInstantBook: booking.car.instantBook,
      autoFallbackRemainingMs: autoFallbackRemaining,
    })
  } catch (error) {
    console.error('[Handoff Status] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch handoff status' }, { status: 500 })
  }
}
