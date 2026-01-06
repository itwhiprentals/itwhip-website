// app/lib/dual-role/sync-profile.ts
// Utility functions to sync email and phone across User, RentalHost, and ReviewerProfile tables
// Ensures data consistency for dual-role accounts following Turo/Airbnb/Uber best practices

import { prisma } from '@/app/lib/database/prisma'

/**
 * Syncs email change across all user profiles (User, RentalHost, ReviewerProfile)
 * Resets email verification flags to require re-verification
 * Uses transaction to ensure atomicity
 *
 * ✅ FIXED: Uses findFirst + update instead of updateMany to avoid unique constraint violations
 */
export async function syncEmailAcrossProfiles(
  userId: string,
  newEmail: string,
  oldEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Sync Email] Starting sync:', { userId, oldEmail, newEmail })

    // Find profiles first to avoid unique constraint violations
    const host = await prisma.rentalHost.findFirst({
      where: { userId: userId },
      select: { id: true }
    })

    const reviewerProfile = await prisma.reviewerProfile.findFirst({
      where: { userId: userId },
      select: { id: true }
    })

    // Build transaction operations dynamically
    const operations: any[] = [
      // Update User table
      prisma.user.update({
        where: { id: userId },
        data: {
          email: newEmail,
          emailVerified: false // Require re-verification for security
        }
      })
    ]

    // Add RentalHost update if exists
    if (host) {
      operations.push(
        prisma.rentalHost.update({
          where: { id: host.id },
          data: { email: newEmail }
        })
      )
    }

    // Add ReviewerProfile update if exists
    if (reviewerProfile) {
      operations.push(
        prisma.reviewerProfile.update({
          where: { id: reviewerProfile.id },
          data: {
            email: newEmail,
            emailVerified: false // Require re-verification
          }
        })
      )
    }

    await prisma.$transaction(operations)

    console.log('[Sync Email] ✅ Successfully synced email across all profiles')
    return { success: true }
  } catch (error) {
    console.error('[Sync Email] ❌ Error syncing email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync email'
    }
  }
}

/**
 * Syncs phone number change across all user profiles
 * Resets phone verification flags to require re-verification
 * Uses transaction to ensure atomicity
 */
export async function syncPhoneAcrossProfiles(
  userId: string,
  newPhone: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Sync Phone] Starting sync:', { userId, newPhone })

    await prisma.$transaction([
      // Update User table
      prisma.user.update({
        where: { id: userId },
        data: {
          phone: newPhone,
          phoneVerified: false // Require re-verification for security
        }
      }),

      // Update RentalHost if exists
      prisma.rentalHost.updateMany({
        where: { userId: userId },
        data: { phone: newPhone }
      }),

      // Update ReviewerProfile if exists
      // Note: ReviewerProfile uses phoneNumber field, not phone
      prisma.reviewerProfile.updateMany({
        where: { userId: userId },
        data: {
          phoneNumber: newPhone,
          phoneVerified: false // Require re-verification
        }
      })
    ])

    console.log('[Sync Phone] ✅ Successfully synced phone across all profiles')
    return { success: true }
  } catch (error) {
    console.error('[Sync Phone] ❌ Error syncing phone:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync phone'
    }
  }
}
