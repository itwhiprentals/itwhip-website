// app/lib/esg/hooks/on-trip-complete.ts
/**
 * On Trip Complete Event Hook
 * Automatically updates ESG scores when a trip ends
 */

import prisma from '@/app/lib/database/prisma'
import { updateVehicleESGScores } from '../calculate-vehicle-esg'
import { updateHostESGProfile } from '../calculate-host-esg'
import { updateVehicleMileageAnalysis } from '../trip-mileage-analyzer'
import { updateVehicleMaintenanceStatus } from '../maintenance-tracker'

// ============================================================================
// TYPES
// ============================================================================

export interface TripCompleteEventData {
  bookingId: string
  carId: string
  hostId: string
  wasIncidentFree: boolean
  totalMiles: number
  tripDurationDays: number
  guestRating?: number
}

export interface TripCompleteResult {
  success: boolean
  vehicleESGUpdated: boolean
  hostESGUpdated: boolean
  mileageAnalyzed: boolean
  maintenanceChecked: boolean
  badgesAwarded: string[]
  errors: string[]
}

// ============================================================================
// MAIN HOOK FUNCTION
// ============================================================================

/**
 * Execute all ESG updates when a trip completes
 * This should be called from the trip completion API endpoint
 */
export async function onTripComplete(
  data: TripCompleteEventData
): Promise<TripCompleteResult> {
  const result: TripCompleteResult = {
    success: true,
    vehicleESGUpdated: false,
    hostESGUpdated: false,
    mileageAnalyzed: false,
    maintenanceChecked: false,
    badgesAwarded: [],
    errors: [],
  }

  console.log('🎯 ESG Hook: Trip Complete', {
    bookingId: data.bookingId,
    carId: data.carId,
    hostId: data.hostId,
  })

  try {
    // ========================================================================
    // STEP 1: Update Vehicle-Level Mileage Analysis
    // ========================================================================
    try {
      await updateVehicleMileageAnalysis(data.carId)
      result.mileageAnalyzed = true
      console.log('✅ Mileage analysis updated for vehicle:', data.carId)
    } catch (error) {
      console.error('❌ Error updating mileage analysis:', error)
      result.errors.push(`Mileage analysis failed: ${error}`)
    }

    // ========================================================================
    // STEP 2: Check Maintenance Status
    // ========================================================================
    try {
      await updateVehicleMaintenanceStatus(data.carId)
      result.maintenanceChecked = true
      console.log('✅ Maintenance status checked for vehicle:', data.carId)
    } catch (error) {
      console.error('❌ Error checking maintenance:', error)
      result.errors.push(`Maintenance check failed: ${error}`)
    }

    // ========================================================================
    // STEP 3: Update Vehicle-Level ESG Scores
    // ========================================================================
    try {
      await updateVehicleESGScores(data.carId)
      result.vehicleESGUpdated = true
      console.log('✅ Vehicle ESG scores updated:', data.carId)
    } catch (error) {
      console.error('❌ Error updating vehicle ESG:', error)
      result.errors.push(`Vehicle ESG update failed: ${error}`)
    }

    // ========================================================================
    // STEP 4: Update Host-Level ESG Profile
    // ========================================================================
    try {
      await updateHostESGProfile(data.hostId)
      result.hostESGUpdated = true
      console.log('✅ Host ESG profile updated:', data.hostId)
    } catch (error) {
      console.error('❌ Error updating host ESG:', error)
      result.errors.push(`Host ESG update failed: ${error}`)
    }

    // ========================================================================
    // STEP 5: Update Vehicle Trip Counter
    // ========================================================================
    try {
      await incrementVehicleTripCount(data.carId, data.wasIncidentFree)
      console.log('✅ Vehicle trip count incremented')
    } catch (error) {
      console.error('❌ Error incrementing trip count:', error)
      result.errors.push(`Trip count update failed: ${error}`)
    }

    // ========================================================================
    // STEP 6: Update Host Trip Counter & Streak
    // ========================================================================
    try {
      await updateHostTripMetrics(data.hostId, data.wasIncidentFree)
      console.log('✅ Host trip metrics updated')
    } catch (error) {
      console.error('❌ Error updating host metrics:', error)
      result.errors.push(`Host metrics update failed: ${error}`)
    }

    // ========================================================================
    // STEP 7: Check for Badge Achievements
    // ========================================================================
    try {
      const newBadges = await checkBadgeAchievements(data.hostId)
      result.badgesAwarded = newBadges
      if (newBadges.length > 0) {
        console.log('🏆 Badges awarded:', newBadges)
      }
    } catch (error) {
      console.error('❌ Error checking badges:', error)
      result.errors.push(`Badge check failed: ${error}`)
    }

    // ========================================================================
    // STEP 8: Create ESG Event Log
    // ========================================================================
    try {
      await logESGEvent({
        hostId: data.hostId,
        eventType: 'TRIP_COMPLETED',
        eventCategory: 'USAGE',
        description: `Trip completed - ${data.totalMiles} miles, ${
          data.wasIncidentFree ? 'incident-free' : 'with incident'
        }`,
        relatedTripId: data.bookingId,
        metadata: {
          carId: data.carId,
          miles: data.totalMiles,
          incidentFree: data.wasIncidentFree,
          durationDays: data.tripDurationDays,
        },
      })
      console.log('✅ ESG event logged')
    } catch (error) {
      console.error('❌ Error logging ESG event:', error)
      result.errors.push(`Event logging failed: ${error}`)
    }

    // ========================================================================
    // FINAL STATUS
    // ========================================================================
    result.success = result.errors.length === 0

    if (result.success) {
      console.log('✅ Trip complete hook executed successfully')
    } else {
      console.warn('⚠️ Trip complete hook completed with errors:', result.errors)
    }

    return result
  } catch (error) {
    console.error('❌ Fatal error in trip complete hook:', error)
    result.success = false
    result.errors.push(`Fatal error: ${error}`)
    return result
  }
}

// ============================================================================
// HELPER: INCREMENT VEHICLE TRIP COUNT
// ============================================================================

async function incrementVehicleTripCount(
  carId: string,
  wasIncidentFree: boolean
): Promise<void> {
  const car = await prisma.rentalCar.findUnique({
    where: { id: carId },
    select: { totalTrips: true, claimFreeMonths: true },
  })

  if (!car) return

  // Update trip count
  await prisma.rentalCar.update({
    where: { id: carId },
    data: {
      totalTrips: car.totalTrips + 1,
      // If incident-free, increment streak (simplified)
      claimFreeMonths: wasIncidentFree
        ? (car.claimFreeMonths || 0) + 1
        : 0,
    },
  })
}

// ============================================================================
// HELPER: UPDATE HOST TRIP METRICS
// ============================================================================

async function updateHostTripMetrics(
  hostId: string,
  wasIncidentFree: boolean
): Promise<void> {
  const host = await prisma.rentalHost.findUnique({
    where: { id: hostId },
    select: { totalTrips: true },
  })

  if (!host) return

  await prisma.rentalHost.update({
    where: { id: hostId },
    data: {
      totalTrips: host.totalTrips + 1,
    },
  })

  // Update ESG profile incident streak
  const profile = await prisma.hostESGProfile.findUnique({
    where: { hostId },
    select: {
      currentIncidentStreak: true,
      longestIncidentStreak: true,
    },
  })

  if (profile) {
    const newStreak = wasIncidentFree ? profile.currentIncidentStreak + 1 : 0
    const longestStreak = Math.max(newStreak, profile.longestIncidentStreak)

    await prisma.hostESGProfile.update({
      where: { hostId },
      data: {
        currentIncidentStreak: newStreak,
        longestIncidentStreak: longestStreak,
      },
    })
  }
}

// ============================================================================
// HELPER: CHECK BADGE ACHIEVEMENTS
// ============================================================================

async function checkBadgeAchievements(hostId: string): Promise<string[]> {
  const profile = await prisma.hostESGProfile.findUnique({
    where: { hostId },
    select: {
      totalTrips: true,
      currentIncidentStreak: true,
      safetyScore: true,
      evVehicleCount: true,
      achievedBadges: true,
    },
  })

  if (!profile) return []

  const newBadges: string[] = []

  // Check for new badge achievements
  const badgeChecks = [
    {
      badge: '50_TRIPS_MILESTONE',
      condition: profile.totalTrips >= 50,
    },
    {
      badge: '100_TRIPS_MILESTONE',
      condition: profile.totalTrips >= 100,
    },
    {
      badge: '500_TRIPS_MILESTONE',
      condition: profile.totalTrips >= 500,
    },
    {
      badge: 'INCIDENT_FREE_25',
      condition: profile.currentIncidentStreak >= 25,
    },
    {
      badge: 'INCIDENT_FREE_50',
      condition: profile.currentIncidentStreak >= 50,
    },
    {
      badge: 'INCIDENT_FREE_100',
      condition: profile.currentIncidentStreak >= 100,
    },
    {
      badge: 'SAFETY_CHAMPION',
      condition: profile.safetyScore >= 90,
    },
    {
      badge: 'SAFETY_MASTER',
      condition: profile.safetyScore >= 95,
    },
  ]

  for (const check of badgeChecks) {
    if (check.condition && !profile.achievedBadges.includes(check.badge)) {
      newBadges.push(check.badge)
    }
  }

  // Update profile with new badges
  if (newBadges.length > 0) {
    await prisma.hostESGProfile.update({
      where: { hostId },
      data: {
        achievedBadges: [...profile.achievedBadges, ...newBadges],
      },
    })
  }

  return newBadges
}

// ============================================================================
// HELPER: LOG ESG EVENT
// ============================================================================

async function logESGEvent(data: {
  hostId: string
  eventType: string
  eventCategory: string
  description: string
  relatedTripId?: string
  metadata?: any
}): Promise<void> {
  // Get current ESG scores for before/after tracking
  const profile = await prisma.hostESGProfile.findUnique({
    where: { hostId: data.hostId },
    select: { compositeScore: true },
  })

  await prisma.eSGEvent.create({
    data: {
      hostId: data.hostId,
      eventType: data.eventType,
      eventCategory: data.eventCategory,
      description: data.description,
      relatedTripId: data.relatedTripId,
      scoreAfter: profile?.compositeScore || null,
      metadata: data.metadata || {},
    },
  })
}

// ============================================================================
// CONVENIENCE FUNCTION FOR API ENDPOINTS
// ============================================================================

/**
 * Quick helper to trigger ESG updates from trip completion endpoint
 */
export async function triggerTripCompleteESG(bookingId: string): Promise<TripCompleteResult> {
  // Fetch booking data
  const booking = await prisma.rentalBooking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      carId: true,
      hostId: true,
      startMileage: true,
      endMileage: true,
      tripStartedAt: true,
      tripEndedAt: true,
      damageReported: true,
      car: {
        select: {
          hasActiveClaim: true,
        },
      },
    },
  })

  if (!booking) {
    throw new Error(`Booking not found: ${bookingId}`)
  }

  const totalMiles = (booking.endMileage || 0) - (booking.startMileage || 0)
  const tripDurationDays = booking.tripStartedAt && booking.tripEndedAt
    ? Math.ceil(
        (new Date(booking.tripEndedAt).getTime() -
          new Date(booking.tripStartedAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 1

  const wasIncidentFree = !booking.damageReported && !booking.car.hasActiveClaim

  return await onTripComplete({
    bookingId: booking.id,
    carId: booking.carId,
    hostId: booking.hostId,
    wasIncidentFree,
    totalMiles,
    tripDurationDays,
  })
}