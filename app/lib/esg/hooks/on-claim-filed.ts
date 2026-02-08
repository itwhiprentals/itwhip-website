// app/lib/esg/hooks/on-claim-filed.ts
/**
 * On Claim Filed Event Hook
 * Automatically updates ESG scores when a claim is filed
 */

import prisma from '@/app/lib/database/prisma'
import { updateVehicleESGScores } from '../calculate-vehicle-esg'
import { updateHostESGProfile } from '../calculate-host-esg'

// ============================================================================
// TYPES
// ============================================================================

export interface ClaimFiledEventData {
  claimId: string
  bookingId: string
  carId: string
  hostId: string
  claimType: string
  estimatedCost: number
  severity: 'MINOR' | 'MAJOR' | 'TOTAL_LOSS' | 'INJURY'
}

export interface ClaimFiledResult {
  success: boolean
  vehicleESGUpdated: boolean
  hostESGUpdated: boolean
  vehicleFlagged: boolean
  safetyScoreImpact: number
  errors: string[]
}

// ============================================================================
// MAIN HOOK FUNCTION
// ============================================================================

/**
 * Execute all ESG updates when a claim is filed
 * This should be called from the claim creation API endpoint
 */
export async function onClaimFiled(
  data: ClaimFiledEventData
): Promise<ClaimFiledResult> {
  const result: ClaimFiledResult = {
    success: true,
    vehicleESGUpdated: false,
    hostESGUpdated: false,
    vehicleFlagged: false,
    safetyScoreImpact: 0,
    errors: [],
  }

  console.log('🚨 ESG Hook: Claim Filed', {
    claimId: data.claimId,
    carId: data.carId,
    hostId: data.hostId,
    severity: data.severity,
  })

  try {
    // ========================================================================
    // STEP 1: Get Baseline Scores (Before Claim)
    // ========================================================================
    const vehicleBefore = await prisma.rentalCar.findUnique({
      where: { id: data.carId },
      select: { esgSafetyScore: true },
    })

    const baselineSafetyScore = vehicleBefore?.esgSafetyScore || 50

    // ========================================================================
    // STEP 2: Update Vehicle Claim Counters
    // ========================================================================
    try {
      await updateVehicleClaimCounters(data.carId)
      console.log('✅ Vehicle claim counters updated')
    } catch (error) {
      console.error('❌ Error updating claim counters:', error)
      result.errors.push(`Claim counter update failed: ${error}`)
    }

    // ========================================================================
    // STEP 3: Flag Vehicle for Review
    // ========================================================================
    try {
      await flagVehicleForReview(data.carId, data.claimId, data.severity)
      result.vehicleFlagged = true
      console.log('✅ Vehicle flagged for review')
    } catch (error) {
      console.error('❌ Error flagging vehicle:', error)
      result.errors.push(`Vehicle flagging failed: ${error}`)
    }

    // ========================================================================
    // STEP 4: Reset Vehicle Incident-Free Streak
    // ========================================================================
    try {
      await resetVehicleStreak(data.carId)
      console.log('✅ Vehicle incident-free streak reset')
    } catch (error) {
      console.error('❌ Error resetting streak:', error)
      result.errors.push(`Streak reset failed: ${error}`)
    }

    // ========================================================================
    // STEP 5: Update Vehicle-Level ESG Scores
    // ========================================================================
    try {
      await updateVehicleESGScores(data.carId)
      result.vehicleESGUpdated = true
      console.log('✅ Vehicle ESG scores updated')
    } catch (error) {
      console.error('❌ Error updating vehicle ESG:', error)
      result.errors.push(`Vehicle ESG update failed: ${error}`)
    }

    // ========================================================================
    // STEP 6: Calculate Safety Score Impact
    // ========================================================================
    const vehicleAfter = await prisma.rentalCar.findUnique({
      where: { id: data.carId },
      select: { esgSafetyScore: true },
    })

    const newSafetyScore = vehicleAfter?.esgSafetyScore || 50
    result.safetyScoreImpact = newSafetyScore - baselineSafetyScore

    console.log('📊 Safety score impact:', result.safetyScoreImpact)

    // ========================================================================
    // STEP 7: Update Host-Level ESG Profile
    // ========================================================================
    try {
      await updateHostESGProfile(data.hostId)
      result.hostESGUpdated = true
      console.log('✅ Host ESG profile updated')
    } catch (error) {
      console.error('❌ Error updating host ESG:', error)
      result.errors.push(`Host ESG update failed: ${error}`)
    }

    // ========================================================================
    // STEP 8: Reset Host Incident-Free Streak
    // ========================================================================
    try {
      await resetHostIncidentStreak(data.hostId)
      console.log('✅ Host incident-free streak reset')
    } catch (error) {
      console.error('❌ Error resetting host streak:', error)
      result.errors.push(`Host streak reset failed: ${error}`)
    }

    // ========================================================================
    // STEP 9: Create ESG Event Log
    // ========================================================================
    try {
      await logESGEvent({
        hostId: data.hostId,
        eventType: 'CLAIM_FILED',
        eventCategory: 'SAFETY',
        description: `Claim filed - ${data.claimType}, estimated cost: $${data.estimatedCost}`,
        relatedClaimId: data.claimId,
        scoreChange: result.safetyScoreImpact,
        metadata: {
          carId: data.carId,
          claimType: data.claimType,
          estimatedCost: data.estimatedCost,
          severity: data.severity,
        },
      })
      console.log('✅ ESG event logged')
    } catch (error) {
      console.error('❌ Error logging ESG event:', error)
      result.errors.push(`Event logging failed: ${error}`)
    }

    // ========================================================================
    // STEP 10: Check if Vehicle Should Be Auto-Deactivated
    // ========================================================================
    try {
      await checkAutoDeactivation(data.carId, data.severity)
      console.log('✅ Auto-deactivation check complete')
    } catch (error) {
      console.error('❌ Error checking auto-deactivation:', error)
      result.errors.push(`Auto-deactivation check failed: ${error}`)
    }

    // ========================================================================
    // FINAL STATUS
    // ========================================================================
    result.success = result.errors.length === 0

    if (result.success) {
      console.log('✅ Claim filed hook executed successfully')
    } else {
      console.warn('⚠️ Claim filed hook completed with errors:', result.errors)
    }

    return result
  } catch (error) {
    console.error('❌ Fatal error in claim filed hook:', error)
    result.success = false
    result.errors.push(`Fatal error: ${error}`)
    return result
  }
}

// ============================================================================
// HELPER: UPDATE VEHICLE CLAIM COUNTERS
// ============================================================================

async function updateVehicleClaimCounters(carId: string): Promise<void> {
  const car = await prisma.rentalCar.findUnique({
    where: { id: carId },
    select: { totalClaimsCount: true },
  })

  if (!car) return

  await prisma.rentalCar.update({
    where: { id: carId },
    data: {
      totalClaimsCount: car.totalClaimsCount + 1,
      lastClaimDate: new Date(),
      hasActiveClaim: true,
    },
  })
}

// ============================================================================
// HELPER: FLAG VEHICLE FOR REVIEW
// ============================================================================

async function flagVehicleForReview(
  carId: string,
  claimId: string,
  severity: string
): Promise<void> {
  const updateData: any = {
    activeClaimId: claimId,
    claimDeactivatedAt: new Date(),
  }

  // For severe claims, require inspection
  if (severity === 'MAJOR' || severity === 'TOTAL_LOSS' || severity === 'INJURY') {
    updateData.requiresInspection = true
    updateData.safetyHold = true
    updateData.safetyHoldReason = `${severity} severity claim filed - requires inspection`
  }

  await prisma.rentalCar.update({
    where: { id: carId },
    data: updateData,
  })
}

// ============================================================================
// HELPER: RESET VEHICLE STREAK
// ============================================================================

async function resetVehicleStreak(carId: string): Promise<void> {
  await prisma.rentalCar.update({
    where: { id: carId },
    data: {
      claimFreeMonths: 0, // Reset streak to 0
    },
  })
}

// ============================================================================
// HELPER: RESET HOST INCIDENT STREAK
// ============================================================================

async function resetHostIncidentStreak(hostId: string): Promise<void> {
  const profile = await prisma.hostESGProfile.findUnique({
    where: { hostId },
    select: { currentIncidentStreak: true, longestIncidentStreak: true },
  })

  if (!profile) return

  // Save longest streak if current was longer
  const longestStreak = Math.max(
    profile.currentIncidentStreak,
    profile.longestIncidentStreak
  )

  await prisma.hostESGProfile.update({
    where: { hostId },
    data: {
      currentIncidentStreak: 0,
      longestIncidentStreak: longestStreak,
      lastIncidentDate: new Date(),
      totalClaimsFiled: { increment: 1 },
    },
  })
}

// ============================================================================
// HELPER: LOG ESG EVENT
// ============================================================================

async function logESGEvent(data: {
  hostId: string
  eventType: string
  eventCategory: string
  description: string
  relatedClaimId?: string
  scoreChange?: number
  metadata?: any
}): Promise<void> {
  // Get current ESG scores for tracking
  const profile = await prisma.hostESGProfile.findUnique({
    where: { hostId: data.hostId },
    select: { compositeScore: true },
  })

  await prisma.eSGEvent.create({
    data: {
      id: crypto.randomUUID(),
      hostId: data.hostId,
      eventType: data.eventType,
      eventCategory: data.eventCategory,
      description: data.description,
      relatedClaimId: data.relatedClaimId,
      scoreAfter: profile?.compositeScore || null,
      scoreChange: data.scoreChange || null,
      metadata: data.metadata || {},
    },
  })
}

// ============================================================================
// HELPER: CHECK AUTO-DEACTIVATION
// ============================================================================

async function checkAutoDeactivation(carId: string, severity: string): Promise<void> {
  // Get vehicle claim history
  const car = await prisma.rentalCar.findUnique({
    where: { id: carId },
    select: {
      totalClaimsCount: true,
      isActive: true,
      esgSafetyScore: true,
    },
  })

  if (!car) return

  let shouldDeactivate = false
  let deactivationReason = ''

  // Auto-deactivate for critical severity
  if (severity === 'TOTAL_LOSS' || severity === 'INJURY') {
    shouldDeactivate = true
    deactivationReason = `Auto-deactivated: ${severity} severity claim`
  }

  // Auto-deactivate if too many claims
  if (car.totalClaimsCount >= 5) {
    shouldDeactivate = true
    deactivationReason = 'Auto-deactivated: 5+ claims filed'
  }

  // Auto-deactivate if safety score is critically low
  if (car.esgSafetyScore !== null && car.esgSafetyScore < 30) {
    shouldDeactivate = true
    deactivationReason = 'Auto-deactivated: Safety score below 30'
  }

  if (shouldDeactivate && car.isActive) {
    await prisma.rentalCar.update({
      where: { id: carId },
      data: {
        isActive: false,
        safetyHold: true,
        safetyHoldReason: deactivationReason,
      },
    })

    console.log('🚫 Vehicle auto-deactivated:', deactivationReason)
  }
}

// ============================================================================
// CONVENIENCE FUNCTION FOR API ENDPOINTS
// ============================================================================

/**
 * Quick helper to trigger ESG updates from claim creation endpoint
 */
export async function triggerClaimFiledESG(claimId: string): Promise<ClaimFiledResult> {
  // Fetch claim data
  const claim = await prisma.claim.findUnique({
    where: { id: claimId },
    select: {
      id: true,
      bookingId: true,
      hostId: true,
      type: true,
      estimatedCost: true,
      booking: {
        select: {
          carId: true,
        },
      },
    },
  })

  if (!claim) {
    throw new Error(`Claim not found: ${claimId}`)
  }

  // Determine severity based on cost
  let severity: 'MINOR' | 'MAJOR' | 'TOTAL_LOSS' | 'INJURY'
  if (claim.estimatedCost >= 10000) {
    severity = 'TOTAL_LOSS'
  } else if (claim.estimatedCost >= 3000) {
    severity = 'MAJOR'
  } else {
    severity = 'MINOR'
  }

  // If injury claim type, always mark as INJURY
  if (claim.type === 'ACCIDENT' && claim.estimatedCost > 0) {
    // Could add additional logic to detect injury claims
  }

  return await onClaimFiled({
    claimId: claim.id,
    bookingId: claim.bookingId,
    carId: claim.booking.carId,
    hostId: claim.hostId,
    claimType: claim.type,
    estimatedCost: claim.estimatedCost,
    severity,
  })
}