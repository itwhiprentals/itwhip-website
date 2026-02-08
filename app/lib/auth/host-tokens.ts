// app/lib/auth/host-tokens.ts
// Token utilities for recruited host passwordless access

import { nanoid } from 'nanoid'
import { prisma } from '@/app/lib/database/prisma'

// Token expiry duration (7 days)
const HOST_TOKEN_EXPIRY_DAYS = 7

/**
 * Generate a new host access token
 * Used for passwordless access for recruited hosts
 */
export function generateHostAccessToken(): string {
  return nanoid(32)
}

/**
 * Calculate token expiry date
 */
export function getTokenExpiry(days: number = HOST_TOKEN_EXPIRY_DAYS): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}

/**
 * Create and store a host access token
 */
export async function createHostAccessToken(
  hostId: string,
  ip?: string
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateHostAccessToken()
  const expiresAt = getTokenExpiry()

  await prisma.rentalHost.update({
    where: { id: hostId },
    data: {
      hostAccessToken: token,
      hostAccessTokenExp: expiresAt,
      hostTokenLastUsedAt: new Date(),
      hostTokenUsedFromIp: ip || null
    }
  })

  return { token, expiresAt }
}

/**
 * Validate a host access token
 * Returns the host if valid, null if invalid/expired
 */
export async function validateHostAccessToken(token: string): Promise<{
  valid: boolean
  host?: any
  error?: 'INVALID' | 'EXPIRED' | 'NOT_FOUND'
}> {
  if (!token || token.length !== 32) {
    return { valid: false, error: 'INVALID' }
  }

  const host = await prisma.rentalHost.findUnique({
    where: { hostAccessToken: token },
    include: {
      convertedFromProspect: {
        select: {
          id: true,
          requestId: true,
          request: {
            select: {
              id: true,
              status: true
            }
          }
        }
      }
    }
  })

  if (!host) {
    return { valid: false, error: 'NOT_FOUND' }
  }

  // Check expiry
  if (host.hostAccessTokenExp && new Date() > host.hostAccessTokenExp) {
    return { valid: false, error: 'EXPIRED', host }
  }

  return { valid: true, host }
}

/**
 * Refresh host access token usage timestamp
 */
export async function refreshHostTokenUsage(
  hostId: string,
  ip?: string
): Promise<void> {
  await prisma.rentalHost.update({
    where: { id: hostId },
    data: {
      hostTokenLastUsedAt: new Date(),
      hostTokenUsedFromIp: ip || undefined
    }
  })
}

/**
 * Extend token expiry (when host is active)
 */
export async function extendTokenExpiry(
  hostId: string,
  days: number = HOST_TOKEN_EXPIRY_DAYS
): Promise<Date> {
  const newExpiry = getTokenExpiry(days)

  await prisma.rentalHost.update({
    where: { id: hostId },
    data: {
      hostAccessTokenExp: newExpiry
    }
  })

  return newExpiry
}

/**
 * Invalidate host access token (e.g., when password is set)
 */
export async function invalidateHostAccessToken(hostId: string): Promise<void> {
  await prisma.rentalHost.update({
    where: { id: hostId },
    data: {
      hostAccessToken: null,
      hostAccessTokenExp: null,
      hostTokenLastUsedAt: null,
      hostTokenUsedFromIp: null
    }
  })
}

/**
 * Log prospect activity
 */
export async function logProspectActivity(
  prospectId: string,
  activityType: string,
  metadata?: Record<string, any>
): Promise<void> {
  await prisma.prospectActivity.create({
    data: {
      prospectId,
      activityType,
      metadata: (metadata || null) as any
    }
  })
}

// Activity type constants
export const ACTIVITY_TYPES = {
  EMAIL_OPENED: 'EMAIL_OPENED',
  LINK_CLICKED: 'LINK_CLICKED',
  DASHBOARD_VIEWED: 'DASHBOARD_VIEWED',
  REQUEST_PAGE_VIEWED: 'REQUEST_PAGE_VIEWED',
  ONBOARDING_STARTED: 'ONBOARDING_STARTED',
  PHOTO_UPLOADED: 'PHOTO_UPLOADED',
  RATE_SET: 'RATE_SET',
  PAYOUT_CONNECTED: 'PAYOUT_CONNECTED',
  COUNTER_OFFER_SUBMITTED: 'COUNTER_OFFER_SUBMITTED',
  COMPLETED: 'COMPLETED',
  DECLINED: 'DECLINED'
} as const
