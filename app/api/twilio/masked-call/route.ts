// app/api/twilio/masked-call/route.ts
// Masked calling API — guest↔host calls through ItWhip number
// Neither party sees the other's real phone number
//
// POST: Initiate a masked call (guest→host or host→guest)
// GET: Check if masked calling is available for a booking

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'
import { twilioClient, TWILIO_LOCAL_NUMBER, WEBHOOK_BASE_URL } from '@/app/lib/twilio/client'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

type Role = 'guest' | 'host'

interface AuthResult {
  role: Role
  userId: string
  hostId?: string
}

async function authenticateUser(): Promise<AuthResult | null> {
  const cookieStore = await cookies()

  // Check guest token
  const guestToken = cookieStore.get('accessToken')?.value
  if (guestToken) {
    try {
      const { payload } = await jwtVerify(guestToken, JWT_SECRET)
      return { role: 'guest', userId: payload.userId as string }
    } catch {}
  }

  // Check host token
  const hostToken = cookieStore.get('partner_token')?.value || cookieStore.get('hostAccessToken')?.value
  if (hostToken) {
    try {
      const { payload } = await jwtVerify(hostToken, JWT_SECRET)
      return { role: 'host', userId: payload.userId as string, hostId: payload.hostId as string }
    } catch {}
  }

  return null
}

// Check if booking is eligible for masked calling
function isBookingCallable(booking: {
  status: string
  tripStatus: string | null
  startDate: Date
  endDate: Date
}): boolean {
  // Booking must be confirmed
  if (booking.status !== 'CONFIRMED') return false

  // Trip must not be completed
  if (booking.tripStatus === 'COMPLETED') return false

  // Allow during active trip
  if (booking.tripStatus === 'IN_PROGRESS' || booking.tripStatus === 'NOT_STARTED' || !booking.tripStatus) {
    return true
  }

  // Allow within 24h of pickup or return
  const now = Date.now()
  const pickupTime = new Date(booking.startDate).getTime()
  const returnTime = new Date(booking.endDate).getTime()
  const twentyFourHours = 24 * 60 * 60 * 1000

  if (Math.abs(now - pickupTime) < twentyFourHours) return true
  if (Math.abs(now - returnTime) < twentyFourHours) return true

  return false
}

// GET — Check if masked calling is available for a booking
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const bookingId = request.nextUrl.searchParams.get('bookingId')
    if (!bookingId) return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })

    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        status: true,
        tripStatus: true,
        startDate: true,
        endDate: true,
        hostId: true,
        renterId: true,
        guestPhone: true,
        host: { select: { phone: true } },
        renter: { select: { phoneNumber: true } },
      },
    })

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    // Verify ownership
    if (user.role === 'guest' && booking.renterId !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    if (user.role === 'host' && booking.hostId !== user.hostId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const callable = isBookingCallable(booking)
    const hasGuestPhone = !!(booking.guestPhone || booking.renter?.phoneNumber)
    const hasHostPhone = !!booking.host?.phone

    return NextResponse.json({
      available: callable && hasGuestPhone && hasHostPhone,
      reason: !callable ? 'Booking is not active' : !hasGuestPhone ? 'Guest phone not available' : !hasHostPhone ? 'Host phone not available' : null,
    })
  } catch (error) {
    console.error('[Masked Call] GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST — Initiate a masked call
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!twilioClient) {
      return NextResponse.json({ error: 'Phone system unavailable' }, { status: 503 })
    }

    const body = await request.json()
    const { bookingId } = body
    if (!bookingId) return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })

    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        bookingCode: true,
        status: true,
        tripStatus: true,
        startDate: true,
        endDate: true,
        hostId: true,
        renterId: true,
        guestPhone: true,
        host: { select: { id: true, phone: true, name: true } },
        renter: { select: { id: true, phoneNumber: true } },
      },
    })

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    // Verify ownership
    if (user.role === 'guest' && booking.renterId !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    if (user.role === 'host' && booking.hostId !== user.hostId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if booking is callable
    if (!isBookingCallable(booking)) {
      return NextResponse.json({ error: 'No active booking found' }, { status: 400 })
    }

    // Get phone numbers
    const guestPhone = booking.guestPhone || booking.renter?.phoneNumber
    const hostPhone = booking.host?.phone

    if (!guestPhone || !hostPhone) {
      return NextResponse.json({ error: 'Phone numbers not available' }, { status: 400 })
    }

    // Determine caller and target
    const callerPhone = user.role === 'guest' ? guestPhone : hostPhone
    const targetPhone = user.role === 'guest' ? hostPhone : guestPhone
    const targetLabel = user.role === 'guest' ? 'host' : 'guest'

    // Create unique conference room
    const roomName = `masked-${booking.bookingCode}-${Date.now()}`

    // Dial the caller back (their phone rings from ItWhip number)
    const callerCall = await twilioClient.calls.create({
      to: callerPhone,
      from: TWILIO_LOCAL_NUMBER,
      url: `${WEBHOOK_BASE_URL}/api/webhooks/twilio/voice/masked-caller?room=${encodeURIComponent(roomName)}&target=${targetLabel}`,
      method: 'POST',
      timeout: 30,
      statusCallback: `${WEBHOOK_BASE_URL}/api/webhooks/twilio/voice/masked-status?room=${encodeURIComponent(roomName)}&otherLeg=${targetLabel}`,
      statusCallbackEvent: ['completed', 'busy', 'no-answer', 'failed', 'canceled'],
      statusCallbackMethod: 'POST',
    })

    // Dial the target (they see ItWhip number, not real caller number)
    const targetCall = await twilioClient.calls.create({
      to: targetPhone,
      from: TWILIO_LOCAL_NUMBER,
      url: `${WEBHOOK_BASE_URL}/api/webhooks/twilio/voice/masked-caller?room=${encodeURIComponent(roomName)}&target=${user.role}`,
      method: 'POST',
      timeout: 30,
      machineDetection: 'Enable',
      statusCallback: `${WEBHOOK_BASE_URL}/api/webhooks/twilio/voice/masked-status?room=${encodeURIComponent(roomName)}&otherLeg=${user.role}`,
      statusCallbackEvent: ['completed', 'busy', 'no-answer', 'failed', 'canceled'],
      statusCallbackMethod: 'POST',
    })

    // Log to CallLog
    prisma.callLog.create({
      data: {
        callSid: callerCall.sid,
        direction: 'OUTBOUND',
        from: TWILIO_LOCAL_NUMBER,
        to: callerPhone,
        status: 'initiated',
        callerType: user.role,
        menuPath: `masked-call/${user.role}-to-${targetLabel}`,
        bookingId: booking.id,
        language: 'en',
      },
    }).catch(e => console.error('[Masked Call] Log error:', e))

    console.log(`[Masked Call] ${user.role} → ${targetLabel} | Room: ${roomName} | Caller: ${callerCall.sid} | Target: ${targetCall.sid}`)

    return NextResponse.json({
      success: true,
      roomName,
      callerCallSid: callerCall.sid,
      targetCallSid: targetCall.sid,
    })
  } catch (error) {
    console.error('[Masked Call] POST error:', error)
    return NextResponse.json({ error: 'Failed to initiate call' }, { status: 500 })
  }
}
