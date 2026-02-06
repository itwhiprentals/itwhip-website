// app/lib/booking/services/auto-login.ts
// Generates and validates auto-login tokens for visitors after booking

import { prisma } from '@/app/lib/database/prisma'
import { randomBytes } from 'crypto'

const TOKEN_EXPIRY_HOURS = 72 // 3 days

/**
 * Generate a secure auto-login token for a booking
 * Used when visitors complete a booking and need immediate dashboard access
 */
export async function generateAutoLoginToken(bookingId: string): Promise<string> {
  // Generate a cryptographically secure token
  const token = randomBytes(32).toString('hex')

  // Set expiry to 72 hours from now
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS)

  // Store token on the booking
  await prisma.rentalBooking.update({
    where: { id: bookingId },
    data: {
      autoLoginToken: token,
      autoLoginExpiresAt: expiresAt,
    },
  })

  return token
}

/**
 * Validate an auto-login token and get the associated booking
 * Returns the booking if valid, null if expired or invalid
 */
export async function validateAutoLoginToken(token: string): Promise<{
  valid: boolean
  bookingId?: string
  guestEmail?: string
  reviewerProfileId?: string
  error?: string
}> {
  if (!token || token.length !== 64) {
    return { valid: false, error: 'Invalid token format' }
  }

  const booking = await prisma.rentalBooking.findUnique({
    where: { autoLoginToken: token },
    select: {
      id: true,
      guestEmail: true,
      reviewerProfileId: true,
      autoLoginExpiresAt: true,
    },
  })

  if (!booking) {
    return { valid: false, error: 'Token not found' }
  }

  if (!booking.autoLoginExpiresAt || new Date() > booking.autoLoginExpiresAt) {
    // Token expired - clear it
    await prisma.rentalBooking.update({
      where: { id: booking.id },
      data: {
        autoLoginToken: null,
        autoLoginExpiresAt: null,
      },
    })
    return { valid: false, error: 'Token expired' }
  }

  return {
    valid: true,
    bookingId: booking.id,
    guestEmail: booking.guestEmail || undefined,
    reviewerProfileId: booking.reviewerProfileId || undefined,
  }
}

/**
 * Consume an auto-login token (use it and invalidate)
 * Returns the reviewer profile for setting the session cookie
 */
export async function consumeAutoLoginToken(token: string): Promise<{
  success: boolean
  reviewerProfileId?: string
  error?: string
}> {
  const validation = await validateAutoLoginToken(token)

  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  // Clear the token after use (single use)
  await prisma.rentalBooking.update({
    where: { autoLoginToken: token },
    data: {
      autoLoginToken: null,
      autoLoginExpiresAt: null,
    },
  })

  return {
    success: true,
    reviewerProfileId: validation.reviewerProfileId,
  }
}

/**
 * Build the auto-login URL for email/redirect
 */
export function buildAutoLoginUrl(token: string, bookingId?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://itwhip.com'
  const url = new URL('/auth/auto-login', baseUrl)
  url.searchParams.set('token', token)
  if (bookingId) {
    url.searchParams.set('booking', bookingId)
  }
  return url.toString()
}
