// app/api/partner/verify/send-link/route.ts
// Partner sends Stripe Identity verification link to customer/driver

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import Stripe from 'stripe'
import { prisma } from '@/app/lib/database/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia'
})

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)

// Get partner from token
async function getPartner() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('host_access_token')?.value

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
        hostType: true,
        active: true
      }
    })

    return host
  } catch {
    return null
  }
}

// POST - Send verification link to customer/driver
export async function POST(request: NextRequest) {
  try {
    const partner = await getPartner()
    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      email,
      name,
      phone,
      purpose = 'rental',  // 'rental' | 'rideshare' | 'driver'
      bookingId  // Optional - link to specific booking
    } = body

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Check if there's already a guest profile
    let guestProfile = await prisma.reviewerProfile.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { user: { email: email.toLowerCase() } }
        ]
      }
    })

    // Create guest profile if doesn't exist
    if (!guestProfile) {
      // First check if user exists
      let user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      })

      if (!user) {
        // Create user first
        user = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            name,
            phone: phone || null
          }
        })
      }

      // Create reviewer profile
      guestProfile = await prisma.reviewerProfile.create({
        data: {
          userId: user.id,
          name, // Required field
          fullName: name,
          email: email.toLowerCase(),
          phone: phone || null,
          city: 'Not specified', // Required field - will be updated on verification
          stripeIdentityStatus: 'not_started'
        }
      })
    }

    // Check if already verified
    if (guestProfile.stripeIdentityStatus === 'verified') {
      return NextResponse.json({
        status: 'already_verified',
        message: 'Customer is already verified',
        verifiedAt: guestProfile.stripeIdentityVerifiedAt,
        verifiedName: guestProfile.stripeVerifiedFirstName && guestProfile.stripeVerifiedLastName
          ? `${guestProfile.stripeVerifiedFirstName} ${guestProfile.stripeVerifiedLastName}`
          : guestProfile.fullName
      })
    }

    // Create return URL based on purpose
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itwhip.com'
    const returnUrl = bookingId
      ? `${baseUrl}/booking/${bookingId}?verified=true`
      : `${baseUrl}/verification-complete?partner=${partner.id}`

    // Create verification session
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      provided_details: {
        email
      },
      options: {
        document: {
          require_matching_selfie: true,
          allowed_types: ['driving_license']
        }
      },
      return_url: returnUrl,
      metadata: {
        profileId: guestProfile.id,
        partnerId: partner.id,
        partnerName: partner.partnerCompanyName || partner.name || '',
        purpose,
        bookingId: bookingId || '',
        email,
        sentBy: 'partner'
      }
    })

    // Update guest profile with session
    await prisma.reviewerProfile.update({
      where: { id: guestProfile.id },
      data: {
        stripeIdentitySessionId: verificationSession.id,
        stripeIdentityStatus: 'pending'
      }
    })

    // Track the verification request
    await prisma.partnerVerificationRequest.create({
      data: {
        partnerId: partner.id,
        guestId: guestProfile.id,
        email,
        name,
        purpose,
        bookingId: bookingId || null,
        stripeSessionId: verificationSession.id,
        status: 'pending',
        verificationUrl: verificationSession.url!
      }
    }).catch(() => {
      // Table may not exist yet - that's okay
      console.log('[Partner Verify] PartnerVerificationRequest table not found, skipping tracking')
    })

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          action: 'VERIFICATION_LINK_SENT',
          entityType: 'PARTNER',
          entityId: partner.id,
          category: 'VERIFICATION',
          adminId: partner.id,
          newValue: JSON.stringify({ email, purpose, guestId: guestProfile.id })
        }
      })
    } catch (logError) {
      console.error('[Partner Verify] Activity log error:', logError)
    }

    return NextResponse.json({
      success: true,
      sessionId: verificationSession.id,
      verificationUrl: verificationSession.url,
      guestId: guestProfile.id,
      message: `Verification link generated for ${name}. Share this URL with the customer.`
    })

  } catch (error) {
    console.error('[Partner Verify] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create verification link' },
      { status: 500 }
    )
  }
}

// GET - Get verification requests for partner
export async function GET() {
  try {
    const partner = await getPartner()
    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all verification requests by this partner
    const requests = await prisma.partnerVerificationRequest.findMany({
      where: { partnerId: partner.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    }).catch(() => [])

    // Also get guest profiles this partner has interacted with
    const bookings = await prisma.rentalBooking.findMany({
      where: {
        car: {
          rentalHostId: partner.id
        }
      },
      include: {
        guest: {
          select: {
            id: true,
            fullName: true,
            email: true,
            stripeIdentityStatus: true,
            stripeIdentityVerifiedAt: true,
            stripeVerifiedFirstName: true,
            stripeVerifiedLastName: true
          }
        }
      },
      distinct: ['guestId'],
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    // Unique guests with their verification status
    const guestMap = new Map()
    for (const booking of bookings) {
      if (booking.guest && !guestMap.has(booking.guest.id)) {
        guestMap.set(booking.guest.id, {
          id: booking.guest.id,
          name: booking.guest.stripeVerifiedFirstName
            ? `${booking.guest.stripeVerifiedFirstName} ${booking.guest.stripeVerifiedLastName}`
            : booking.guest.fullName,
          email: booking.guest.email,
          verificationStatus: booking.guest.stripeIdentityStatus || 'not_started',
          verifiedAt: booking.guest.stripeIdentityVerifiedAt
        })
      }
    }

    const stats = {
      total: guestMap.size,
      verified: Array.from(guestMap.values()).filter(g => g.verificationStatus === 'verified').length,
      pending: Array.from(guestMap.values()).filter(g => g.verificationStatus === 'pending').length,
      notStarted: Array.from(guestMap.values()).filter(g => g.verificationStatus === 'not_started').length
    }

    return NextResponse.json({
      success: true,
      requests,
      guests: Array.from(guestMap.values()),
      stats
    })

  } catch (error) {
    console.error('[Partner Verify] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch verification data' },
      { status: 500 }
    )
  }
}
