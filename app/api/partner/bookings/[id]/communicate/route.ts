// app/api/partner/bookings/[id]/communicate/route.ts
// Host sends communication to guest via platform (no direct email/phone exposure)
// Rate limited: 2 sends per type per booking

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'
import { sendEmail } from '@/app/lib/email/sender'
import { escapeHtml } from '@/app/lib/email/sanitize'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

const VALID_TYPES = ['pickup_instructions', 'keys_instructions'] as const
type CommunicationType = typeof VALID_TYPES[number]

const MAX_SENDS_PER_TYPE = 2

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('hostAccessToken')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    if (!partner) return null
    return partner
  } catch {
    return null
  }
}

function getEmailTemplate(type: CommunicationType, data: {
  guestName: string
  hostName: string
  carDetails: string
  pickupDate: string
  pickupTime: string
  pickupLocation: string
  bookingCode: string
  message: string
}) {
  const safe = {
    guestName: escapeHtml(data.guestName),
    hostName: escapeHtml(data.hostName),
    carDetails: escapeHtml(data.carDetails),
    pickupDate: escapeHtml(data.pickupDate),
    pickupTime: escapeHtml(data.pickupTime),
    pickupLocation: escapeHtml(data.pickupLocation),
    bookingCode: escapeHtml(data.bookingCode),
    message: escapeHtml(data.message),
  }

  if (type === 'pickup_instructions') {
    return {
      subject: `Pickup Instructions for Your ${safe.carDetails} Rental`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #5D3FD3; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">ItWhip</h1>
          </div>
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #1a1a1a;">Pickup Instructions</h2>
            <p>Hi ${safe.guestName},</p>
            <p>Your host <strong>${safe.hostName}</strong> has sent you pickup instructions for your upcoming rental:</p>

            <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 4px 0;"><strong>Vehicle:</strong> ${safe.carDetails}</p>
              <p style="margin: 4px 0;"><strong>Pickup Date:</strong> ${safe.pickupDate}</p>
              <p style="margin: 4px 0;"><strong>Pickup Time:</strong> ${safe.pickupTime}</p>
              <p style="margin: 4px 0;"><strong>Location:</strong> ${safe.pickupLocation}</p>
              <p style="margin: 4px 0;"><strong>Booking:</strong> ${safe.bookingCode}</p>
            </div>

            <div style="background: #f0f9ff; border-left: 4px solid #5D3FD3; padding: 16px; margin: 16px 0;">
              <p style="margin: 0; font-weight: bold; color: #5D3FD3;">Instructions from your host:</p>
              <p style="margin: 8px 0 0 0; white-space: pre-wrap;">${safe.message}</p>
            </div>

            <p style="color: #666; font-size: 13px; margin-top: 24px;">
              This message was sent through the ItWhip platform. Do not reply to this email.
              If you need to contact your host, use the messaging feature in your dashboard.
            </p>
          </div>
        </div>
      `,
      text: `Pickup Instructions for ${data.carDetails}\n\nHi ${data.guestName},\n\nYour host ${data.hostName} has sent pickup instructions:\n\nVehicle: ${data.carDetails}\nPickup: ${data.pickupDate} at ${data.pickupTime}\nLocation: ${data.pickupLocation}\nBooking: ${data.bookingCode}\n\nInstructions:\n${data.message}\n\nThis message was sent through the ItWhip platform.`
    }
  }

  // keys_instructions
  return {
    subject: `Key & Access Instructions for Your ${safe.carDetails} Rental`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #5D3FD3; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">ItWhip</h1>
        </div>
        <div style="padding: 30px; background: #ffffff;">
          <h2 style="color: #1a1a1a;">Key & Access Instructions</h2>
          <p>Hi ${safe.guestName},</p>
          <p>Your host <strong>${safe.hostName}</strong> has sent you key and access instructions for your rental:</p>

          <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Vehicle:</strong> ${safe.carDetails}</p>
            <p style="margin: 4px 0;"><strong>Booking:</strong> ${safe.bookingCode}</p>
          </div>

          <div style="background: #fefce8; border-left: 4px solid #eab308; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; font-weight: bold; color: #854d0e;">🔑 Key & Access Instructions:</p>
            <p style="margin: 8px 0 0 0; white-space: pre-wrap;">${safe.message}</p>
          </div>

          <p style="color: #666; font-size: 13px; margin-top: 24px;">
            This message was sent through the ItWhip platform. Do not reply to this email.
            If you need to contact your host, use the messaging feature in your dashboard.
          </p>
        </div>
      </div>
    `,
    text: `Key & Access Instructions for ${data.carDetails}\n\nHi ${data.guestName},\n\nYour host ${data.hostName} has sent key instructions:\n\nVehicle: ${data.carDetails}\nBooking: ${data.bookingCode}\n\nInstructions:\n${data.message}\n\nThis message was sent through the ItWhip platform.`
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
    const { type, message } = body as { type: string; message: string }

    // Validate type
    if (!type || !VALID_TYPES.includes(type as CommunicationType)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message too long (max 2000 characters)' }, { status: 400 })
    }

    // Fetch booking with car and guest
    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        car: { hostId: partner.id }
      },
      include: {
        car: true,
        renter: { include: { user: true } }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check rate limit: count previous sends of this type for this booking
    const previousSends = await prisma.activityLog.count({
      where: {
        bookingId: bookingId,
        action: `host_communicate_${type}`,
        performedBy: partner.id
      }
    })

    if (previousSends >= MAX_SENDS_PER_TYPE) {
      return NextResponse.json(
        { error: `You can only send ${type.replace('_', ' ')} ${MAX_SENDS_PER_TYPE} times per booking` },
        { status: 429 }
      )
    }

    // Get guest email
    const guestEmail = booking.renter?.user?.email || booking.guestEmail
    const guestName = booking.renter?.user?.name || booking.guestName || 'Guest'

    if (!guestEmail) {
      return NextResponse.json({ error: 'Guest email not found' }, { status: 400 })
    }

    // Build email
    const carDetails = booking.car
      ? `${booking.car.year} ${booking.car.make} ${booking.car.model}`
      : 'Vehicle'

    const template = getEmailTemplate(type as CommunicationType, {
      guestName,
      hostName: partner.name || partner.companyName || 'Your host',
      carDetails,
      pickupDate: new Date(booking.startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      pickupTime: booking.startTime || 'TBD',
      pickupLocation: booking.pickupLocation || 'See booking details',
      bookingCode: booking.bookingCode || bookingId.slice(0, 8).toUpperCase(),
      message: message.trim()
    })

    // Send email (guest never sees host email — sent from platform)
    const result = await sendEmail(guestEmail, template.subject, template.html, template.text)

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    // Log the send for rate limiting
    await prisma.activityLog.create({
      data: {
        action: `host_communicate_${type}`,
        bookingId: bookingId,
        performedBy: partner.id,
        details: JSON.stringify({
          type,
          messageLength: message.trim().length,
          sentTo: guestEmail,
          sendCount: previousSends + 1
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: `${type === 'pickup_instructions' ? 'Pickup instructions' : 'Key instructions'} sent to guest`,
      remaining: MAX_SENDS_PER_TYPE - previousSends - 1
    })
  } catch (error) {
    console.error('[Partner Communicate] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET: Check send counts for rate limit display
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await getPartnerFromToken()
    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: bookingId } = await params

    const counts: Record<string, number> = {}
    for (const type of VALID_TYPES) {
      counts[type] = await prisma.activityLog.count({
        where: {
          bookingId,
          action: `host_communicate_${type}`,
          performedBy: partner.id
        }
      })
    }

    return NextResponse.json({
      success: true,
      counts,
      maxPerType: MAX_SENDS_PER_TYPE
    })
  } catch (error) {
    console.error('[Partner Communicate] GET Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
