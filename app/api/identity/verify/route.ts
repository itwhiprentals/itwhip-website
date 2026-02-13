// app/api/identity/verify/route.ts
// Stripe Identity Verification - Create session and handle verification

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import Stripe from 'stripe'
import { prisma } from '@/app/lib/database/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

// Support both platform and guest JWT secrets
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)
const GUEST_JWT_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_SECRET!
)

// Helper to get current user - tries both JWT secrets
async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('accessToken')?.value

  if (!token) return null

  // Try both secrets
  const secrets = [JWT_SECRET, GUEST_JWT_SECRET]

  for (const secret of secrets) {
    try {
      const { payload } = await jwtVerify(token, secret)
      if (!payload.userId) continue

      const user = await prisma.user.findUnique({
        where: { id: payload.userId as string },
        include: {
          reviewerProfile: true
        }
      })

      if (user) return user
    } catch {
      // Continue to next secret
      continue
    }
  }

  return null
}

// GET - Check verification status (polls Stripe directly if session is pending)
export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.reviewerProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let profile = user.reviewerProfile

    console.log(`[Identity Check] Profile ${profile.id}: sessionId=${profile.stripeIdentitySessionId}, status=${profile.stripeIdentityStatus}`)

    // If there's a pending session, check Stripe directly for updated status
    // This handles the case where user returns from Stripe before webhook fires
    if (profile.stripeIdentitySessionId && profile.stripeIdentityStatus === 'pending') {
      try {
        const session = await stripe.identity.verificationSessions.retrieve(
          profile.stripeIdentitySessionId
        )

        console.log(`[Identity Check] Stripe session ${session.id} status: ${session.status}, livemode: ${session.livemode}`)

        // Log last_error if present (for debugging failed verifications)
        if (session.last_error) {
          console.log(`[Identity Check] Session last_error: ${JSON.stringify(session.last_error)}`)
        }

        // If Stripe shows verified, update our DB
        if (session.status === 'verified') {
          console.log(`[Identity Check] Updating profile ${profile.id} to verified (webhook may be delayed)`)

          // Get verification report for extracted data
          let verifiedData: {
            firstName?: string
            lastName?: string
            dob?: Date
            idNumber?: string
            idExpiry?: Date
            docFrontFileId?: string
            docBackFileId?: string
            selfieFileId?: string
          } = {}

          if (session.last_verification_report) {
            try {
              const report = await stripe.identity.verificationReports.retrieve(
                session.last_verification_report as string
              )
              if (report.document) {
                const doc = report.document
                verifiedData = {
                  firstName: doc.first_name || undefined,
                  lastName: doc.last_name || undefined,
                  dob: doc.dob ? new Date(doc.dob.year!, doc.dob.month! - 1, doc.dob.day!) : undefined,
                  idNumber: doc.number || undefined,
                  idExpiry: doc.expiration_date
                    ? new Date(doc.expiration_date.year!, doc.expiration_date.month! - 1, doc.expiration_date.day!)
                    : undefined
                }
              }
              // Extract photo file IDs
              const reportAny = report as any
              if (reportAny.document?.files) {
                const files = reportAny.document.files as string[]
                verifiedData.docFrontFileId = files[0] || undefined
                verifiedData.docBackFileId = files[1] || undefined
              }
              if (reportAny.selfie?.selfie) {
                verifiedData.selfieFileId = reportAny.selfie.selfie
              }
            } catch (err) {
              console.error('[Identity Check] Error retrieving verification report:', err)
            }
          }

          // Update profile with verified status
          profile = await prisma.reviewerProfile.update({
            where: { id: profile.id },
            data: {
              stripeIdentityStatus: 'verified',
              stripeIdentityVerifiedAt: new Date(),
              stripeIdentityReportId: session.last_verification_report as string || null,
              stripeVerifiedFirstName: verifiedData.firstName,
              stripeVerifiedLastName: verifiedData.lastName,
              stripeVerifiedDob: verifiedData.dob,
              stripeVerifiedIdNumber: verifiedData.idNumber,
              stripeVerifiedIdExpiry: verifiedData.idExpiry,
              documentsVerified: true,
              documentVerifiedAt: new Date(),
              documentVerifiedBy: 'stripe-identity',
              fullyVerified: true,
              isVerified: true,
              driverLicenseNumber: verifiedData.idNumber,
              driverLicenseExpiry: verifiedData.idExpiry,
              stripeDocFrontFileId: verifiedData.docFrontFileId || null,
              stripeDocBackFileId: verifiedData.docBackFileId || null,
              stripeSelfieFileId: verifiedData.selfieFileId || null,
            }
          })
        } else if (session.status === 'requires_input') {
          // Verification failed or needs more input - update status
          profile = await prisma.reviewerProfile.update({
            where: { id: profile.id },
            data: { stripeIdentityStatus: 'requires_input' }
          })
        } else if (session.status === 'processing') {
          // Still processing - keep as pending but log it
          console.log(`[Identity Check] Session ${session.id} still processing, keeping status as pending`)
        }
      } catch (err) {
        console.error('[Identity Check] Error checking Stripe session:', err)
        // Continue with DB status if Stripe check fails
      }
    }

    // Check if verified via Stripe Identity OR admin override
    const isStripeVerified = profile.stripeIdentityStatus === 'verified'
    const isAdminOverride = profile.documentsVerified === true || profile.fullyVerified === true
    const isVerified = isStripeVerified || isAdminOverride

    // Determine effective status
    let effectiveStatus = profile.stripeIdentityStatus || 'not_started'
    if (isAdminOverride && !isStripeVerified) {
      effectiveStatus = 'admin_verified'
    }

    return NextResponse.json({
      status: effectiveStatus,
      verifiedAt: profile.stripeIdentityVerifiedAt || (isAdminOverride ? profile.documentVerifiedAt : null),
      isVerified,
      isAdminOverride,
      // Verified data (only return if verified via Stripe)
      verifiedData: isStripeVerified ? {
        firstName: profile.stripeVerifiedFirstName,
        lastName: profile.stripeVerifiedLastName,
        dob: profile.stripeVerifiedDob,
        idNumber: profile.stripeVerifiedIdNumber ? `***${profile.stripeVerifiedIdNumber.slice(-4)}` : null
      } : null
    })
  } catch (error) {
    console.error('Error checking identity status:', error)
    return NextResponse.json(
      { error: 'Failed to check verification status' },
      { status: 500 }
    )
  }
}

// POST - Create new verification session
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.reviewerProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = user.reviewerProfile

    // Check if already verified
    if (profile.stripeIdentityStatus === 'verified') {
      return NextResponse.json({
        error: 'Already verified',
        status: 'verified',
        verifiedAt: profile.stripeIdentityVerifiedAt
      }, { status: 400 })
    }

    // Check if there's an existing pending session
    if (profile.stripeIdentitySessionId && profile.stripeIdentityStatus === 'pending') {
      try {
        // Retrieve existing session
        const existingSession = await stripe.identity.verificationSessions.retrieve(
          profile.stripeIdentitySessionId
        )

        if (existingSession.status === 'requires_input') {
          // Session still active, return its URL
          return NextResponse.json({
            sessionId: existingSession.id,
            url: existingSession.url,
            status: 'requires_input'
          })
        }
      } catch {
        // Session not found or expired, create new one
      }
    }

    // Get return URL from request body
    const body = await request.json().catch(() => ({}))
    const returnUrl = body.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/profile?tab=documents&verified=true`

    // Create new verification session with document + selfie
    // Request all extractable fields: name, DOB, address, document number, expiry
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      provided_details: {
        email: user.email || undefined
      },
      options: {
        document: {
          require_matching_selfie: true,
          require_id_number: true,
          allowed_types: ['driving_license']
        }
      },
      return_url: returnUrl,
      metadata: {
        userId: user.id,
        profileId: profile.id,
        email: user.email || ''
      }
    })

    // Update profile with session ID
    await prisma.reviewerProfile.update({
      where: { id: profile.id },
      data: {
        stripeIdentitySessionId: verificationSession.id,
        stripeIdentityStatus: 'pending'
      }
    })

    return NextResponse.json({
      sessionId: verificationSession.id,
      url: verificationSession.url,
      status: 'pending'
    })
  } catch (error) {
    console.error('Error creating verification session:', error)
    return NextResponse.json(
      { error: 'Failed to create verification session' },
      { status: 500 }
    )
  }
}
