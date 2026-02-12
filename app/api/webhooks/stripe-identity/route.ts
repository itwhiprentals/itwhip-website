// app/api/webhooks/stripe-identity/route.ts
// Webhook handler for Stripe Identity verification events

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { nanoid } from 'nanoid'
import { prisma } from '@/app/lib/database/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

const webhookSecret = process.env.STRIPE_IDENTITY_WEBHOOK_SECRET!.trim()

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log(`[Stripe Identity] Received event: ${event.type}`)

    switch (event.type) {
      case 'identity.verification_session.verified': {
        const session = event.data.object as Stripe.Identity.VerificationSession
        await handleVerificationSuccess(session)
        break
      }

      case 'identity.verification_session.requires_input': {
        const session = event.data.object as Stripe.Identity.VerificationSession
        await handleRequiresInput(session)
        break
      }

      case 'identity.verification_session.canceled': {
        const session = event.data.object as Stripe.Identity.VerificationSession
        await handleCanceled(session)
        break
      }

      default:
        console.log(`[Stripe Identity] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Stripe Identity] Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleVerificationSuccess(session: Stripe.Identity.VerificationSession) {
  console.log(`[Stripe Identity] Verification success for session: ${session.id}`)

  let profileId = session.metadata?.profileId
  const email = session.metadata?.email || (session as any).provided_details?.email
  const partnerId = session.metadata?.partnerId  // For partner-sent verifications
  const sentBy = session.metadata?.sentBy  // 'partner' or undefined

  // ========== AUTO-CREATE ACCOUNT IF NO PROFILE ==========
  // If no profileId but we have email, auto-create guest account
  if (!profileId && email) {
    console.log(`[Stripe Identity] No profileId, attempting to create/find account for: ${email}`)

    try {
      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email },
        include: { reviewerProfile: true }
      })

      if (!user) {
        // Create new user with CLAIMED role (verified guest)
        console.log(`[Stripe Identity] Creating new user for: ${email}`)
        user = await prisma.user.create({
          data: {
            id: nanoid(),
            email,
            role: 'CLAIMED' as any,
            emailVerified: true,
            status: 'ACTIVE' as any,
            updatedAt: new Date()
          } as any,
          include: { reviewerProfile: true }
        })
      }

      if (!user.reviewerProfile) {
        // Create guest profile
        console.log(`[Stripe Identity] Creating ReviewerProfile for user: ${user.id}`)
        const newProfile = await prisma.reviewerProfile.create({
          data: {
            userId: user.id,
            email: email,
            name: user.name || email.split('@')[0] || 'Guest',
            city: 'Not Set',
            emailVerified: true,
            stripeIdentitySessionId: session.id,
            stripeIdentityStatus: 'pending',
            memberSince: new Date(),
            updatedAt: new Date()
          } as any
        })
        profileId = newProfile.id
      } else {
        profileId = user.reviewerProfile.id
      }

      console.log(`[Stripe Identity] Auto-created/linked profileId: ${profileId}`)
    } catch (err) {
      console.error('[Stripe Identity] Error auto-creating account:', err)
      return
    }
  }

  if (!profileId) {
    console.error('[Stripe Identity] No profileId and no email in session metadata')
    return
  }

  // Update partner verification request if sent by partner
  if (sentBy === 'partner' && partnerId) {
    try {
      await prisma.partnerVerificationRequest.updateMany({
        where: {
          stripeSessionId: session.id
        },
        data: {
          status: 'verified',
          verifiedAt: new Date()
        }
      })
      console.log(`[Stripe Identity] Updated partner verification request for session: ${session.id}`)
    } catch (e) {
      // Table may not exist
      console.log('[Stripe Identity] PartnerVerificationRequest update skipped')
    }
  }

  // Get the verification report to extract verified data
  let verifiedData: {
    firstName?: string
    lastName?: string
    dob?: Date
    idNumber?: string
    idExpiry?: Date
    issuedDate?: Date
    address?: string
    issuingCountry?: string
    documentType?: string
  } = {}

  if (session.last_verification_report) {
    try {
      const report = await stripe.identity.verificationReports.retrieve(
        session.last_verification_report as string
      )

      // Extract data from the report
      if (report.document) {
        const doc = report.document as any
        verifiedData = {
          firstName: doc.first_name || undefined,
          lastName: doc.last_name || undefined,
          dob: doc.dob ? new Date(doc.dob.year!, doc.dob.month! - 1, doc.dob.day!) : undefined,
          idNumber: doc.number || undefined,
          idExpiry: doc.expiration_date
            ? new Date(doc.expiration_date.year!, doc.expiration_date.month! - 1, doc.expiration_date.day!)
            : undefined,
          issuedDate: doc.issued_date
            ? new Date(doc.issued_date.year!, doc.issued_date.month! - 1, doc.issued_date.day!)
            : undefined,
          address: doc.address
            ? [doc.address.line1, doc.address.line2, doc.address.city, doc.address.state, doc.address.postal_code].filter(Boolean).join(', ')
            : undefined,
          issuingCountry: doc.issuing_country || undefined,
          documentType: doc.type || undefined,
        }

        console.log(`[Stripe Identity] Extracted from report: firstName=${verifiedData.firstName}, lastName=${verifiedData.lastName}, dob=${verifiedData.dob}, idNumber=${verifiedData.idNumber ? '***' : 'none'}, idExpiry=${verifiedData.idExpiry}, issuedDate=${verifiedData.issuedDate}, address=${verifiedData.address ? 'yes' : 'none'}`)
      }
    } catch (err) {
      console.error('[Stripe Identity] Error retrieving verification report:', err)
    }
  }

  // Build the verified name
  const verifiedName = verifiedData.firstName && verifiedData.lastName
    ? `${verifiedData.firstName} ${verifiedData.lastName}`
    : undefined

  // Update the profile with verification data
  const updatedProfile = await prisma.reviewerProfile.update({
    where: { id: profileId },
    data: {
      stripeIdentityStatus: 'verified',
      stripeIdentityVerifiedAt: new Date(),
      stripeIdentityReportId: (session.last_verification_report as string) || null,
      stripeVerifiedFirstName: verifiedData.firstName,
      stripeVerifiedLastName: verifiedData.lastName,
      stripeVerifiedDob: verifiedData.dob,
      stripeVerifiedIdNumber: verifiedData.idNumber,
      stripeVerifiedIdExpiry: verifiedData.idExpiry,
      stripeVerifiedAddress: verifiedData.address,
      // Set name from ID if profile doesn't have one
      ...(verifiedName && { name: verifiedName }),
      // Set DOB from ID
      ...(verifiedData.dob && { dateOfBirth: verifiedData.dob }),
      // Also update legacy fields for compatibility
      documentsVerified: true,
      documentVerifiedAt: new Date(),
      documentVerifiedBy: 'stripe-identity',
      fullyVerified: true,
      // Update driver license info for FNOL
      driverLicenseNumber: verifiedData.idNumber,
      driverLicenseExpiry: verifiedData.idExpiry
    } as any
  })

  console.log(`[Stripe Identity] Profile ${profileId} verified successfully`)

  // Check if guest has active payment method and grant signup bonus
  await grantSignupBonusIfEligible(updatedProfile, session.id)
}

// Grant signup bonus if: verified via Stripe + has active payment method + hasn't received bonus yet
async function grantSignupBonusIfEligible(profile: any, _sessionId: string) {
  try {
    // Check if already received bonus
    if (profile.bonusBalance > 0 || profile.depositWalletBalance > 0) {
      console.log(`[Stripe Identity] Profile ${profile.id} already has balance, skipping bonus`)
      return
    }

    // Get signup bonus amount from platform settings
    const settings = await prisma.platformSettings.findFirst({
      where: { id: 'global' }
    })

    const bonusAmount = settings?.guestSignupBonus || 0
    if (bonusAmount <= 0) {
      console.log('[Stripe Identity] Guest signup bonus is 0 or not set')
      return
    }

    // Check if guest has active payment method via Stripe
    if (!profile.stripeCustomerId) {
      console.log(`[Stripe Identity] Profile ${profile.id} has no Stripe customer ID, skipping bonus`)
      return
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: profile.stripeCustomerId,
      type: 'card'
    })

    if (paymentMethods.data.length === 0) {
      console.log(`[Stripe Identity] Profile ${profile.id} has no active payment methods, skipping bonus`)
      return
    }

    // Guest is verified and has active payment method - grant bonus
    const newBalance = (profile.depositWalletBalance || 0) + bonusAmount

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.$transaction(async (tx: any) => {
      // Add the bonus to deposit wallet (since it's for deposits)
      await tx.reviewerProfile.update({
        where: { id: profile.id },
        data: {
          depositWalletBalance: { increment: bonusAmount }
        }
      })

      // Create a transaction record
      await tx.depositTransaction.create({
        data: {
          guestId: profile.id,
          amount: bonusAmount,
          type: 'LOAD',
          balanceAfter: newBalance,
          description: 'ItWhip signup bonus - Identity verified with active payment'
        }
      })
    })

    console.log(`[Stripe Identity] Granted $${bonusAmount} signup bonus to profile ${profile.id}`)
  } catch (error) {
    console.error('[Stripe Identity] Error granting signup bonus:', error)
    // Don't throw - this is optional bonus, verification still succeeded
  }
}

async function handleRequiresInput(session: Stripe.Identity.VerificationSession) {
  console.log(`[Stripe Identity] Verification requires input for session: ${session.id}`)

  const profileId = session.metadata?.profileId
  const email = session.metadata?.email || (session as any).provided_details?.email
  const source = session.metadata?.source

  // If we have a profileId, update it
  if (profileId) {
    await prisma.reviewerProfile.update({
      where: { id: profileId },
      data: {
        stripeIdentityStatus: 'requires_input'
      }
    })
  } else if (email) {
    // If no profileId but have email, try to find existing profile
    const profile = await prisma.reviewerProfile.findFirst({
      where: { email }
    })

    if (profile) {
      await prisma.reviewerProfile.update({
        where: { id: profile.id },
        data: {
          stripeIdentityStatus: 'requires_input',
          stripeIdentitySessionId: session.id
        }
      })
    }
  }

  // Freeze user for 7 days if this was a booking-fallback verification attempt
  if (source === 'booking-fallback' && email) {
    try {
      const normalizedEmail = email.toLowerCase().trim()
      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

      // Upsert to handle potential existing record
      await prisma.suspendedIdentifier.upsert({
        where: {
          identifierType_identifierValue: {
            identifierType: 'email',
            identifierValue: normalizedEmail
          }
        },
        create: {
          identifierType: 'email',
          identifierValue: normalizedEmail,
          reason: 'Stripe Identity verification failed after DL fallback',
          suspendedBy: 'system',
          expiresAt: sevenDaysFromNow
        },
        update: {
          reason: 'Stripe Identity verification failed after DL fallback',
          suspendedAt: new Date(),
          expiresAt: sevenDaysFromNow
        }
      })

      console.log(`[Stripe Identity] Froze email ${normalizedEmail} for 7 days after booking-fallback failure`)
    } catch (freezeError) {
      console.error('[Stripe Identity] Error freezing user:', freezeError)
    }
  }
}

async function handleCanceled(session: Stripe.Identity.VerificationSession) {
  console.log(`[Stripe Identity] Verification canceled for session: ${session.id}`)

  const profileId = session.metadata?.profileId
  const email = session.metadata?.email || (session as any).provided_details?.email

  // If we have a profileId, update it
  if (profileId) {
    await prisma.reviewerProfile.update({
      where: { id: profileId },
      data: {
        stripeIdentityStatus: 'canceled',
        stripeIdentitySessionId: null
      }
    })
    return
  }

  // If no profileId but have email, try to find existing profile
  if (email) {
    const profile = await prisma.reviewerProfile.findFirst({
      where: { email }
    })

    if (profile) {
      await prisma.reviewerProfile.update({
        where: { id: profile.id },
        data: {
          stripeIdentityStatus: 'canceled',
          stripeIdentitySessionId: null
        }
      })
    }
  }
}
