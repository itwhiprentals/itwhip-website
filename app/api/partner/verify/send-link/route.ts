// app/api/partner/verify/send-link/route.ts
// Partner sends Stripe Identity verification link to customer/driver

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { nanoid } from 'nanoid'
import Stripe from 'stripe'
import { prisma } from '@/app/lib/database/prisma'
import { sendEmail } from '@/app/lib/email/send-email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)

// Get partner from token
async function getPartner() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('hostAccessToken')?.value

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
            id: nanoid(),
            email: email.toLowerCase(),
            name,
            phone: phone || null
          }
        })
      }

      // Create reviewer profile
      guestProfile = await prisma.reviewerProfile.create({
        data: {
          user: { connect: { id: user.id } },
          name, // Required field
          email: email.toLowerCase(),
          phoneNumber: phone || null,
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
          : guestProfile.name
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
    try {
      if (prisma.partnerVerificationRequest) {
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
        })
      }
    } catch {
      // Table may not exist yet - that's okay
      console.log('[Partner Verify] PartnerVerificationRequest table not found, skipping tracking')
    }

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

    // Send verification link via email
    let emailSent = false
    try {
      const partnerName = partner.partnerCompanyName || partner.name || 'Your rental provider'
      const purposeText = purpose === 'rideshare' ? 'rideshare rental' :
                          purpose === 'driver' ? 'driver verification' : 'car rental'

      await sendEmail({
        to: email,
        subject: `Complete Your Identity Verification - ${partnerName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Identity Verification Required</h1>
            </div>

            <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                Hi ${name},
              </p>

              <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                <strong>${partnerName}</strong> has requested identity verification for your ${purposeText}.
              </p>

              <p style="color: #374151; font-size: 16px; margin-bottom: 30px;">
                This secure process helps protect both you and the rental provider. You'll need to provide a photo of your driver's license and a selfie.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationSession.url}"
                   style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Complete Verification
                </a>
              </div>

              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                <strong>What you'll need:</strong>
              </p>
              <ul style="color: #6b7280; font-size: 14px; padding-left: 20px;">
                <li>Valid driver's license</li>
                <li>Good lighting for the selfie</li>
                <li>About 2 minutes of your time</li>
              </ul>

              <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                This verification is powered by Stripe Identity, a secure and trusted verification service used by thousands of businesses worldwide.
              </p>

              <p style="color: #9ca3af; font-size: 12px;">
                If you didn't request this verification, please ignore this email or contact ${partnerName} directly.
              </p>
            </div>

            <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Powered by <a href="https://itwhip.com" style="color: #f97316;">ItWhip</a> - The trusted car rental marketplace
              </p>
            </div>
          </div>
        `,
        text: `Hi ${name},\n\n${partnerName} has requested identity verification for your ${purposeText}.\n\nPlease complete your verification by visiting this link:\n${verificationSession.url}\n\nYou'll need your driver's license and about 2 minutes to complete this process.\n\nIf you didn't request this verification, please ignore this email.\n\nPowered by ItWhip`
      })
      emailSent = true
      console.log(`[Partner Verify] Email sent to ${email}`)
    } catch (emailError) {
      console.error('[Partner Verify] Email send error:', emailError)
    }

    return NextResponse.json({
      success: true,
      sessionId: verificationSession.id,
      verificationUrl: verificationSession.url,
      guestId: guestProfile.id,
      emailSent,
      message: emailSent
        ? `Verification link sent to ${email}`
        : `Verification link generated for ${name}. Share this URL with the customer.`
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
    // Use try-catch for model that may not be available until prisma regenerates
    let requests: Array<{ id: string; email: string; status: string; createdAt: Date }> = []
    try {
      if (prisma.partnerVerificationRequest) {
        requests = await prisma.partnerVerificationRequest.findMany({
          where: { partnerId: partner.id },
          orderBy: { createdAt: 'desc' },
          take: 50
        })
      }
    } catch {
      // Model may not exist yet
    }

    // Also get guest profiles this partner has interacted with
    const bookings = await prisma.rentalBooking.findMany({
      where: {
        car: {
          hostId: partner.id
        },
        reviewerProfileId: { not: null }
      },
      include: {
        reviewerProfile: {
          select: {
            id: true,
            name: true,
            email: true,
            stripeIdentityStatus: true,
            stripeIdentityVerifiedAt: true,
            stripeVerifiedFirstName: true,
            stripeVerifiedLastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 200
    })

    // Unique guests with their verification status
    const guestMap = new Map()
    for (const booking of bookings) {
      const profile = booking.reviewerProfile
      if (profile && !guestMap.has(profile.id)) {
        guestMap.set(profile.id, {
          id: profile.id,
          name: profile.stripeVerifiedFirstName
            ? `${profile.stripeVerifiedFirstName} ${profile.stripeVerifiedLastName}`
            : profile.name,
          email: profile.email,
          verificationStatus: profile.stripeIdentityStatus || 'not_started',
          verifiedAt: profile.stripeIdentityVerifiedAt
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
