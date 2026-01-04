// app/lib/claims/account-hold.ts

import { prisma } from '@/app/lib/database/prisma'

export interface AccountHoldStatus {
  hasHold: boolean
  holdReason: string | null
  claimId: string | null
  appliedAt: Date | null
  canBook: boolean
  message: string | null
}

/**
 * Check if a guest has an active account hold that prevents booking
 * @param guestEmail - Email of the guest
 * @param userId - Optional user ID if authenticated
 * @returns AccountHoldStatus
 */
export async function checkAccountHold(
  guestEmail: string,
  userId?: string | null
): Promise<AccountHoldStatus> {
  try {
    // Find the guest's ReviewerProfile
    const profile = await prisma.reviewerProfile.findFirst({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          { email: guestEmail.toLowerCase() }
        ]
      },
      select: {
        id: true,
        accountOnHold: true,
        accountHoldReason: true,
        accountHoldClaimId: true,
        accountHoldAppliedAt: true,
        suspendedAt: true,
        suspensionExpiresAt: true,
        bannedAt: true
      }
    })

    // If no profile, guest can book (new guest)
    if (!profile) {
      return {
        hasHold: false,
        holdReason: null,
        claimId: null,
        appliedAt: null,
        canBook: true,
        message: null
      }
    }

    // Check if guest is banned
    if (profile.bannedAt) {
      return {
        hasHold: true,
        holdReason: 'Account permanently banned',
        claimId: null,
        appliedAt: profile.bannedAt,
        canBook: false,
        message: 'Your account has been permanently banned. Please contact support if you believe this is an error.'
      }
    }

    // Check if guest is suspended
    if (profile.suspendedAt && profile.suspensionExpiresAt) {
      const now = new Date()
      if (now < profile.suspensionExpiresAt) {
        const expiresAt = profile.suspensionExpiresAt.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
        return {
          hasHold: true,
          holdReason: 'Account suspended',
          claimId: null,
          appliedAt: profile.suspendedAt,
          canBook: false,
          message: `Your account is suspended until ${expiresAt}. Please contact support for more information.`
        }
      }
    }

    // Check for claim-related account hold
    if (profile.accountOnHold && profile.accountHoldClaimId) {
      // Verify the claim is still active and needs response
      const claim = await prisma.claim.findUnique({
        where: { id: profile.accountHoldClaimId },
        select: {
          id: true,
          status: true,
          guestResponseDeadline: true,
          guestResponseText: true
        }
      })

      // If claim is resolved or response submitted, the hold should be lifted
      if (claim) {
        const isResolved = ['APPROVED', 'DENIED', 'CLOSED', 'RESOLVED'].includes(claim.status)
        const hasResponded = !!claim.guestResponseText

        if (isResolved || hasResponded) {
          // Auto-clear the hold since it's no longer valid
          await prisma.reviewerProfile.update({
            where: { id: profile.id },
            data: {
              accountOnHold: false,
              accountHoldReason: null,
              accountHoldClaimId: null,
              accountHoldAppliedAt: null
            }
          })

          return {
            hasHold: false,
            holdReason: null,
            claimId: null,
            appliedAt: null,
            canBook: true,
            message: null
          }
        }

        // Hold is still active
        return {
          hasHold: true,
          holdReason: profile.accountHoldReason,
          claimId: profile.accountHoldClaimId,
          appliedAt: profile.accountHoldAppliedAt,
          canBook: false,
          message: `Your account is on hold due to an unresolved claim. Please respond to the claim to restore full account access.`
        }
      }
    }

    // No active hold
    return {
      hasHold: false,
      holdReason: null,
      claimId: null,
      appliedAt: null,
      canBook: true,
      message: null
    }
  } catch (error) {
    console.error('Error checking account hold:', error)
    // On error, allow booking to proceed (fail open)
    return {
      hasHold: false,
      holdReason: null,
      claimId: null,
      appliedAt: null,
      canBook: true,
      message: null
    }
  }
}

/**
 * Apply an account hold to a guest due to a claim
 * @param guestEmail - Email of the guest
 * @param claimId - ID of the claim causing the hold
 * @param reason - Reason for the hold
 */
export async function applyAccountHold(
  guestEmail: string,
  claimId: string,
  reason: string = 'Unresolved insurance claim requires response'
): Promise<boolean> {
  try {
    // Find the guest's ReviewerProfile
    const profile = await prisma.reviewerProfile.findUnique({
      where: { email: guestEmail.toLowerCase() },
      select: { id: true }
    })

    if (!profile) {
      console.log('No ReviewerProfile found for guest:', guestEmail)
      return false
    }

    // Apply the hold
    await prisma.reviewerProfile.update({
      where: { id: profile.id },
      data: {
        accountOnHold: true,
        accountHoldReason: reason,
        accountHoldClaimId: claimId,
        accountHoldAppliedAt: new Date()
      }
    })

    // Update the claim to mark hold as applied
    await prisma.claim.update({
      where: { id: claimId },
      data: {
        accountHoldApplied: true
      }
    })

    console.log(`Account hold applied for guest ${guestEmail} due to claim ${claimId}`)
    return true
  } catch (error) {
    console.error('Error applying account hold:', error)
    return false
  }
}

/**
 * Remove an account hold from a guest (e.g., after responding to claim)
 * @param guestEmail - Email of the guest
 * @param claimId - Optional claim ID to verify it matches
 */
export async function removeAccountHold(
  guestEmail: string,
  claimId?: string
): Promise<boolean> {
  try {
    // Find the guest's ReviewerProfile
    const profile = await prisma.reviewerProfile.findUnique({
      where: { email: guestEmail.toLowerCase() },
      select: {
        id: true,
        accountHoldClaimId: true
      }
    })

    if (!profile) {
      return false
    }

    // If claimId provided, verify it matches
    if (claimId && profile.accountHoldClaimId !== claimId) {
      console.log('Claim ID mismatch for hold removal')
      return false
    }

    // Remove the hold
    await prisma.reviewerProfile.update({
      where: { id: profile.id },
      data: {
        accountOnHold: false,
        accountHoldReason: null,
        accountHoldClaimId: null,
        accountHoldAppliedAt: null
      }
    })

    console.log(`Account hold removed for guest ${guestEmail}`)
    return true
  } catch (error) {
    console.error('Error removing account hold:', error)
    return false
  }
}

/**
 * Get all guests with active account holds
 * Used for admin dashboards and cron jobs
 */
export async function getGuestsWithActiveHolds() {
  try {
    const profiles = await prisma.reviewerProfile.findMany({
      where: {
        accountOnHold: true,
        accountHoldClaimId: { not: null }
      },
      select: {
        id: true,
        name: true,
        email: true,
        accountHoldReason: true,
        accountHoldClaimId: true,
        accountHoldAppliedAt: true
      }
    })

    return profiles
  } catch (error) {
    console.error('Error fetching guests with holds:', error)
    return []
  }
}
