// app/lib/booking/services/visitor-account.ts
// Service for converting visitors to accounts during booking
// Handles auto-account creation and data transfer

import { prisma } from '@/app/lib/database/prisma'
import { generateAutoLoginToken } from './auto-login'
import { randomBytes } from 'crypto'

// Types for visitor booking data
export interface VisitorBookingData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth?: string
  // DL verification data
  dlFrontUrl?: string
  dlBackUrl?: string
  selfieUrl?: string
  aiVerificationResult?: {
    confidence: number
    data?: {
      fullName: string
      licenseNumber: string
      expirationDate: string
      stateOrCountry: string
    }
    validation?: {
      isValid: boolean
      redFlags: string[]
    }
  }
}

export interface AccountCreationResult {
  success: boolean
  reviewerProfileId?: string
  autoLoginToken?: string
  autoLoginUrl?: string
  error?: string
}

/**
 * Create a guest account (ReviewerProfile) from visitor booking data
 * Called when visitor completes a booking
 */
export async function createGuestAccountFromVisitor(
  visitorData: VisitorBookingData
): Promise<AccountCreationResult> {
  try {
    // Check if account already exists with this email
    const existing = await prisma.reviewerProfile.findUnique({
      where: { email: visitorData.email },
      select: { id: true },
    })

    if (existing) {
      // Account exists - return existing profile
      return {
        success: true,
        reviewerProfileId: existing.id,
        // Don't generate auto-login for existing accounts - they should login normally
      }
    }

    // Generate secure access token for the account
    const accessToken = randomBytes(32).toString('hex')

    // Create new ReviewerProfile (guest account)
    const reviewerProfile = await prisma.reviewerProfile.create({
      data: {
        email: visitorData.email,
        phone: visitorData.phone,
        firstName: visitorData.firstName,
        lastName: visitorData.lastName,
        accessToken,
        // Mark as needing full verification (Stripe Identity during onboarding)
        emailVerified: false,
        phoneVerified: false,
        // Store DL info if provided (from AI verification)
        ...(visitorData.dateOfBirth && {
          dateOfBirth: new Date(visitorData.dateOfBirth),
        }),
        // Store DL photos for reference
        ...(visitorData.dlFrontUrl && {
          dlPhotoUrl: visitorData.dlFrontUrl,
        }),
        // AI verification status
        ...(visitorData.aiVerificationResult && {
          verificationStatus: visitorData.aiVerificationResult.validation?.isValid
            ? 'AI_VERIFIED'
            : 'PENDING',
        }),
        // Source tracking
        source: 'BOOKING_FLOW',
      },
    })

    return {
      success: true,
      reviewerProfileId: reviewerProfile.id,
    }
  } catch (error) {
    console.error('[visitor-account] Account creation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Account creation failed',
    }
  }
}

/**
 * Link a booking to a newly created guest account
 * Also creates booking documents for DL images
 */
export async function linkBookingToAccount(params: {
  bookingId: string
  reviewerProfileId: string
  visitorData: VisitorBookingData
}): Promise<{ success: boolean; autoLoginToken?: string; error?: string }> {
  try {
    // Update booking with reviewer profile link
    await prisma.rentalBooking.update({
      where: { id: params.bookingId },
      data: {
        reviewerProfileId: params.reviewerProfileId,
        guestEmail: params.visitorData.email,
        guestPhone: params.visitorData.phone,
        guestName: `${params.visitorData.firstName} ${params.visitorData.lastName}`,
        // Store verification source
        verificationSource: 'BOOKING_FLOW',
        // Store AI verification results
        ...(params.visitorData.aiVerificationResult && {
          aiLicenseVerified: params.visitorData.aiVerificationResult.validation?.isValid || false,
          aiLicenseConfidence: params.visitorData.aiVerificationResult.confidence,
          aiLicenseData: params.visitorData.aiVerificationResult.data || null,
          aiVerifiedAt: new Date(),
        }),
      },
    })

    // Create booking documents for DL images
    const documents = []

    if (params.visitorData.dlFrontUrl) {
      documents.push({
        bookingId: params.bookingId,
        type: 'LICENSE_FRONT',
        url: params.visitorData.dlFrontUrl,
        aiAnalysis: params.visitorData.aiVerificationResult || null,
      })
    }

    if (params.visitorData.dlBackUrl) {
      documents.push({
        bookingId: params.bookingId,
        type: 'LICENSE_BACK',
        url: params.visitorData.dlBackUrl,
      })
    }

    if (params.visitorData.selfieUrl) {
      documents.push({
        bookingId: params.bookingId,
        type: 'SELFIE',
        url: params.visitorData.selfieUrl,
      })
    }

    if (documents.length > 0) {
      await prisma.bookingDocument.createMany({
        data: documents,
      })
    }

    // Generate auto-login token for immediate dashboard access
    const autoLoginToken = await generateAutoLoginToken(params.bookingId)

    return {
      success: true,
      autoLoginToken,
    }
  } catch (error) {
    console.error('[visitor-account] Link booking error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to link booking',
    }
  }
}

/**
 * Complete visitor to account conversion
 * Main entry point for the booking flow
 */
export async function convertVisitorToAccount(params: {
  bookingId: string
  visitorData: VisitorBookingData
}): Promise<AccountCreationResult> {
  // Step 1: Create the guest account
  const accountResult = await createGuestAccountFromVisitor(params.visitorData)

  if (!accountResult.success || !accountResult.reviewerProfileId) {
    return accountResult
  }

  // Step 2: Link booking to account and create documents
  const linkResult = await linkBookingToAccount({
    bookingId: params.bookingId,
    reviewerProfileId: accountResult.reviewerProfileId,
    visitorData: params.visitorData,
  })

  if (!linkResult.success) {
    return {
      success: false,
      error: linkResult.error,
    }
  }

  // Step 3: Build auto-login URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://itwhip.com'
  const autoLoginUrl = linkResult.autoLoginToken
    ? `${baseUrl}/auth/auto-login?token=${linkResult.autoLoginToken}&booking=${params.bookingId}`
    : undefined

  return {
    success: true,
    reviewerProfileId: accountResult.reviewerProfileId,
    autoLoginToken: linkResult.autoLoginToken,
    autoLoginUrl,
  }
}

/**
 * Check if user should skip onboarding
 * Returns true if user was verified during booking flow
 */
export async function shouldSkipOnboarding(reviewerProfileId: string): Promise<boolean> {
  const profile = await prisma.reviewerProfile.findUnique({
    where: { id: reviewerProfileId },
    select: {
      source: true,
      verificationStatus: true,
    },
  })

  // Skip onboarding if:
  // 1. Came from booking flow
  // 2. Has AI verification
  return profile?.source === 'BOOKING_FLOW' && profile?.verificationStatus === 'AI_VERIFIED'
}

/**
 * Get onboarding requirements for a user
 * Returns what steps the user still needs to complete
 */
export async function getOnboardingRequirements(reviewerProfileId: string): Promise<{
  requiresDLUpload: boolean
  requiresStripeVerification: boolean
  requiresSelfie: boolean
  canUploadInsurance: boolean
}> {
  const profile = await prisma.reviewerProfile.findUnique({
    where: { id: reviewerProfileId },
    select: {
      source: true,
      verificationStatus: true,
      dlPhotoUrl: true,
      selfieUrl: true,
      stripeIdentityVerified: true,
    },
  })

  if (!profile) {
    return {
      requiresDLUpload: true,
      requiresStripeVerification: true,
      requiresSelfie: true,
      canUploadInsurance: false,
    }
  }

  const isFromBookingFlow = profile.source === 'BOOKING_FLOW'

  return {
    // Skip DL upload if came from booking flow (already uploaded)
    requiresDLUpload: !isFromBookingFlow && !profile.dlPhotoUrl,
    // Always require Stripe verification for full identity check
    requiresStripeVerification: !profile.stripeIdentityVerified,
    // Selfie optional if came from booking flow
    requiresSelfie: !isFromBookingFlow && !profile.selfieUrl,
    // Can upload insurance after Stripe verification
    canUploadInsurance: !!profile.stripeIdentityVerified,
  }
}
