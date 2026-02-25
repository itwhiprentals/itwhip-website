// Shared Prisma select for host fields on car cards.
// Import this everywhere instead of inline selects — one change applies site-wide.

import { Prisma } from '@prisma/client'

/**
 * Standard host fields needed by car cards (CompactCarCard, CarCard, etc.)
 * Includes business host fields so company names display correctly.
 */
export const HOST_CARD_SELECT = {
  name: true,
  profilePhoto: true,
  isBusinessHost: true,
  partnerCompanyName: true,
  partnerLogo: true,
  partnerSlug: true,
  hostType: true,
} satisfies Prisma.RentalHostSelect

/**
 * Extended host select with verification and response metrics (for search results)
 */
export const HOST_SEARCH_SELECT = {
  ...HOST_CARD_SELECT,
  isVerified: true,
  responseRate: true,
  responseTime: true,
  requireDeposit: true,
  depositAmount: true,
  makeDeposits: true,
} satisfies Prisma.RentalHostSelect

/**
 * Transform raw host data from Prisma into the shape expected by card components.
 * Use this in server components / API routes when mapping query results to props.
 */
export function transformHostForCard(host: {
  name?: string | null
  profilePhoto?: string | null
  avatar?: string | null
  isBusinessHost?: boolean | null
  partnerCompanyName?: string | null
  partnerLogo?: string | null
  partnerSlug?: string | null
  hostType?: string | null
} | null | undefined) {
  if (!host) return null
  return {
    name: host.name ?? null,
    profilePhoto: host.profilePhoto || (host as any).avatar || null,
    isBusinessHost: host.isBusinessHost ?? false,
    partnerCompanyName: host.partnerCompanyName ?? null,
    partnerLogo: host.partnerLogo ?? null,
    partnerSlug: host.partnerSlug ?? null,
    hostType: host.hostType ?? null,
  }
}
