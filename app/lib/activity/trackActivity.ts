// app/lib/activity/trackActivity.ts
import { prisma } from '@/app/lib/database/prisma'

/**
 * Track user activity for timeline/audit purposes
 * Used for guest profile activity tracking
 */
export async function trackActivity(
  reviewerProfileId: string,
  activityType: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // Check if ReviewerProfile has an activity/timeline table
    // If not, just log it for now
    console.log(`[Activity Tracker] ${activityType} for profile: ${reviewerProfileId}`, metadata)

    // Optional: Store in database if you have an Activity table
    // Uncomment and adjust based on your schema:
    /*
    await prisma.activity.create({
      data: {
        reviewerProfileId,
        type: activityType,
        metadata: metadata || {},
        createdAt: new Date()
      }
    })
    */

    // Alternative: Update ReviewerProfile with last activity
    await prisma.reviewerProfile.update({
      where: { id: reviewerProfileId },
      data: {
        updatedAt: new Date()
      }
    })

  } catch (error) {
    // Don't throw - activity tracking should never break the main flow
    console.error('[Activity Tracker] Failed to track activity:', error)
  }
}

/**
 * Activity types enum for reference
 */
export const ActivityTypes = {
  // Auth activities
  PASSWORD_CHANGED: 'password_changed',
  EMAIL_VERIFIED: 'email_verified',
  PHONE_VERIFIED: 'phone_verified',
  
  // Booking activities
  BOOKING_CREATED: 'booking_created',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_COMPLETED: 'booking_completed',
  
  // Profile activities
  PROFILE_UPDATED: 'profile_updated',
  DOCUMENT_UPLOADED: 'document_uploaded',
  INSURANCE_ADDED: 'insurance_added',
  
  // Payment activities
  PAYMENT_METHOD_ADDED: 'payment_method_added',
  PAYMENT_PROCESSED: 'payment_processed',
  
  // Review activities
  REVIEW_SUBMITTED: 'review_submitted',
  
  // Other
  LOGIN: 'login',
  LOGOUT: 'logout',
} as const

export type ActivityType = typeof ActivityTypes[keyof typeof ActivityTypes]