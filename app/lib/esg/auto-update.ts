// app/lib/esg/auto-update.ts
/**
 * ESG Auto-Update System
 * Automatically recalculates ESG scores when events are triggered
 */

import prisma from '@/app/lib/database/prisma'
import { calculateESGScore } from './scoring'
import { getHostBadges, checkAndAwardBadges } from './badges'
import { updateEventWithScores } from './event-logger'
import { ESGEventType, ESGEventData } from './event-hooks'

// ============================================================================
// MAIN AUTO-UPDATE TRIGGER
// ============================================================================

/**
 * Trigger ESG score recalculation based on an event
 */
export async function triggerESGUpdate(
  hostId: string,
  eventType: ESGEventType,
  eventData: ESGEventData
): Promise<void> {
  try {
    console.log(`🔄 Triggering ESG Update for host ${hostId} (Event: ${eventType})`)

    // Get current ESG profile (before update)
    const currentProfile = await prisma.hostESGProfile.findUnique({
      where: { hostId },
    })

    const scoreBefore = currentProfile?.compositeScore || 50

    // Recalculate ESG scores
    const calculation = await calculateESGScore(hostId)

    // Update or create ESG profile
    const updatedProfile = await upsertESGProfile(hostId, calculation)

    const scoreAfter = updatedProfile.compositeScore

    console.log(
      `📊 ESG Score Updated: ${scoreBefore} → ${scoreAfter} (${scoreAfter >= scoreBefore ? '+' : ''}${scoreAfter - scoreBefore})`
    )

    // Create snapshot for history tracking
    await createSnapshot(updatedProfile.id, eventType, eventData)

    // Update the event log with score changes (if event was logged)
    // Note: The event was logged in event-logger.ts, we just need to find it and update it
    const recentEvent = await prisma.eSGEvent.findFirst({
      where: {
        hostId,
        eventType,
        createdAt: {
          gte: new Date(Date.now() - 10000), // Within last 10 seconds
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (recentEvent) {
      await updateEventWithScores(recentEvent.id, scoreBefore, scoreAfter)
    }

    // Check and award badges if thresholds met
    await checkAndAwardNewBadges(hostId, updatedProfile, calculation)

    // Send notification if score changed significantly (optional)
    if (Math.abs(scoreAfter - scoreBefore) >= 10) {
      await notifyHostOfScoreChange(hostId, scoreBefore, scoreAfter, eventType)
    }

    console.log(`✅ ESG Update Complete for host ${hostId}`)
  } catch (error) {
    console.error(`❌ Error in triggerESGUpdate:`, error)
    // Don't throw - we don't want to break the main flow
  }
}

// ============================================================================
// UPSERT ESG PROFILE
// ============================================================================

/**
 * Update existing ESG profile or create new one
 */
async function upsertESGProfile(hostId: string, calculation: any) {
  try {
    const profileData = {
      compositeScore: calculation.scores.compositeScore,
      drivingImpactScore: calculation.scores.drivingImpactScore,
      emissionsScore: calculation.scores.emissionsScore,
      maintenanceScore: calculation.scores.maintenanceScore,
      safetyScore: calculation.scores.safetyScore,
      complianceScore: calculation.scores.complianceScore,
      totalTrips: calculation.scores.totalTrips,
      incidentFreeTrips: calculation.scores.incidentFreeTrips,
      totalClaimsFiled: calculation.scores.totalClaimsFiled,
      currentIncidentStreak: calculation.scores.currentIncidentStreak,
      longestIncidentStreak: calculation.scores.longestIncidentStreak,
      lastIncidentDate: calculation.scores.lastIncidentDate,
      totalEVTrips: calculation.scores.totalEVTrips,
      evTripPercentage: calculation.scores.evTripPercentage,
      estimatedCO2Saved: calculation.scores.estimatedCO2Saved,
      fuelEfficiencyRating: calculation.scores.fuelEfficiencyRating,
      maintenanceOnTime: calculation.scores.maintenanceOnTime,
      lastMaintenanceDate: calculation.scores.lastMaintenanceDate,
      overdueMaintenanceCount: calculation.scores.overdueMaintenanceCount,
      fnolCompletionRate: calculation.scores.claimResponseRate,
      avgResponseTimeHours: calculation.scores.avgResponseTimeHours,
      unauthorizedMileage: calculation.scores.unauthorizedMileage,
      suspiciousActivityCount: calculation.scores.suspiciousActivityCount,
      verificationFailures: calculation.scores.verificationFailures,
      fraudRiskLevel: calculation.scores.fraudRiskLevel,
      totalMilesDriven: calculation.scores.totalMilesDriven,
      avgMilesPerTrip: calculation.scores.avgMilesPerTrip,
      tripCompletionRate: calculation.scores.tripCompletionRate,
      idleTimeEfficiency: calculation.scores.idleTimeEfficiency,
      tripCancellationRate: calculation.scores.tripCancellationRate,
      lateReturnCount: calculation.scores.lateReturnCount,
      earlyReturnCount: calculation.scores.earlyReturnCount,
      guestRatingAverage: calculation.scores.guestRatingAverage,
      totalVehicles: calculation.scores.totalVehicles,
      activeVehicles: calculation.scores.activeVehicles,
      evVehicleCount: calculation.scores.evVehicleCount,
      avgVehicleAge: calculation.scores.avgVehicleAge,
      hasCommercialInsurance: calculation.scores.hasCommercialInsurance,
      hasP2PInsurance: calculation.scores.hasP2PInsurance,
      insuranceTier: calculation.scores.insuranceTier,
      claimApprovalRate: calculation.scores.claimApprovalRate,
      avgClaimProcessingDays: calculation.scores.avgClaimProcessingDays,
      achievedBadges: calculation.scores.achievedBadges,
      milestoneReached: calculation.scores.milestoneReached,
      nextMilestone: calculation.scores.nextMilestone,
      calculationVersion: calculation.scores.calculationVersion,
      dataConfidence: calculation.scores.dataConfidence,
    }

    const profile = await prisma.hostESGProfile.upsert({
      where: { hostId },
      create: {
        id: `esg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        hostId,
        ...profileData,
        lastCalculatedAt: new Date(),
        updatedAt: new Date(),
      } as any,
      update: profileData,
    })

    return profile
  } catch (error) {
    console.error(`❌ Error upserting ESG profile:`, error)
    throw error
  }
}

// ============================================================================
// CREATE SNAPSHOT
// ============================================================================

/**
 * Create ESG snapshot for historical tracking
 */
async function createSnapshot(
  profileId: string,
  eventType: ESGEventType,
  eventData: ESGEventData
): Promise<void> {
  try {
    const profile = await prisma.hostESGProfile.findUnique({
      where: { id: profileId },
    })

    if (!profile) {
      console.error('❌ Profile not found for snapshot')
      return
    }

    await prisma.eSGSnapshot.create({
      data: {
        id: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        profileId,
        compositeScore: profile.compositeScore,
        drivingImpactScore: profile.drivingImpactScore,
        emissionsScore: profile.emissionsScore,
        maintenanceScore: profile.maintenanceScore,
        safetyScore: profile.safetyScore,
        complianceScore: profile.complianceScore,
        snapshotReason: mapEventTypeToSnapshotReason(eventType),
        triggerEventId: eventData.relatedBookingId || eventData.relatedClaimId || undefined,
      },
    })

    console.log(`📸 Snapshot created for profile ${profileId}`)
  } catch (error) {
    console.error(`❌ Error creating snapshot:`, error)
  }
}

// ============================================================================
// CHECK AND AWARD BADGES
// ============================================================================

/**
 * Check if host earned new badges and award them
 */
async function checkAndAwardNewBadges(
  hostId: string,
  profile: any,
  calculation: any
): Promise<void> {
  try {
    const newBadges = await checkAndAwardBadges(hostId, profile)

    if (newBadges && newBadges.length > 0) {
      console.log(`🏆 New badges awarded: ${newBadges.map((b) => b.badgeName).join(', ')}`)

      // Optional: Send notification about new badges
      // await notifyHostOfNewBadges(hostId, newBadges)
    }
  } catch (error) {
    console.error(`❌ Error checking/awarding badges:`, error)
  }
}

// ============================================================================
// NOTIFICATION SYSTEM (OPTIONAL)
// ============================================================================

/**
 * Notify host of significant score change
 */
async function notifyHostOfScoreChange(
  hostId: string,
  oldScore: number,
  newScore: number,
  eventType: ESGEventType
): Promise<void> {
  try {
    // Optional: Implement notification logic here
    // This could send an email, create an in-app notification, etc.

    const scoreChange = newScore - oldScore
    const direction = scoreChange > 0 ? 'increased' : 'decreased'

    console.log(
      `📧 [NOTIFICATION] Host ${hostId}: ESG score ${direction} by ${Math.abs(scoreChange)} points (Event: ${eventType})`
    )

    // Example: Create in-app notification
    // await prisma.hostNotification.create({
    //   data: {
    //     hostId,
    //     type: 'ESG_SCORE_CHANGE',
    //     category: 'PERFORMANCE',
    //     subject: `Your ESG Score ${direction === 'increased' ? '📈' : '📉'}`,
    //     message: `Your ESG Trust Score ${direction} from ${oldScore} to ${newScore} (${scoreChange >= 0 ? '+' : ''}${scoreChange} points)`,
    //     priority: Math.abs(scoreChange) >= 15 ? 'high' : 'normal',
    //   },
    // })
  } catch (error) {
    console.error(`❌ Error sending score change notification:`, error)
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Map event type to snapshot reason
 */
function mapEventTypeToSnapshotReason(eventType: ESGEventType): string {
  const mapping: Record<ESGEventType, string> = {
    TRIP_COMPLETED: 'TRIP_COMPLETED',
    CLAIM_FILED: 'CLAIM_FILED',
    CLAIM_APPROVED: 'CLAIM_APPROVED',
    CLAIM_DENIED: 'CLAIM_DENIED',
    VEHICLE_ADDED: 'VEHICLE_ADDED',
    VEHICLE_REMOVED: 'VEHICLE_REMOVED',
    INSURANCE_UPDATED: 'INSURANCE_UPDATED',
    MAINTENANCE_LOGGED: 'MAINTENANCE_LOGGED',
    DOCUMENT_VERIFIED: 'DOCUMENT_VERIFIED',
    MANUAL_REFRESH: 'MANUAL_REFRESH',
  }

  return mapping[eventType] || 'AUTO_UPDATE'
}

// ============================================================================
// BATCH UPDATE (FOR MAINTENANCE)
// ============================================================================

/**
 * Recalculate ESG scores for all hosts (maintenance job)
 * This can be run as a scheduled job
 */
export async function batchUpdateAllHosts(): Promise<void> {
  try {
    console.log('🔄 Starting batch ESG update for all hosts...')

    const hosts = await prisma.rentalHost.findMany({
      where: {
        active: true,
      },
      select: {
        id: true,
        name: true,
      },
    })

    console.log(`📊 Found ${hosts.length} active hosts to update`)

    let successCount = 0
    let errorCount = 0

    for (const host of hosts) {
      try {
        await triggerESGUpdate(host.id, 'MANUAL_REFRESH', {
          hostId: host.id,
          eventType: 'MANUAL_REFRESH',
          category: 'ADMINISTRATIVE',
          description: 'Scheduled batch update',
          triggeredBy: 'SYSTEM',
        })
        successCount++
      } catch (error) {
        console.error(`❌ Error updating host ${host.id}:`, error)
        errorCount++
      }
    }

    console.log(`✅ Batch update complete: ${successCount} success, ${errorCount} errors`)
  } catch (error) {
    console.error(`❌ Error in batch update:`, error)
  }
}