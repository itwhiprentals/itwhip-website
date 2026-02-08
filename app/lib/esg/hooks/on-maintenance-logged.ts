// app/lib/esg/hooks/on-maintenance-logged.ts
/**
 * On Maintenance Logged Event Hook
 * Automatically updates ESG scores when maintenance is completed
 */

import prisma from '@/app/lib/database/prisma'
import { updateVehicleESGScores } from '../calculate-vehicle-esg'
import { updateHostESGProfile } from '../calculate-host-esg'
import { updateVehicleMaintenanceStatus } from '../maintenance-tracker'

// ============================================================================
// TYPES
// ============================================================================

export interface MaintenanceLoggedEventData {
  carId: string
  hostId: string
  maintenanceType: 'OIL_CHANGE' | 'INSPECTION' | 'TIRE_ROTATION' | 'BRAKE_SERVICE' | 'REPAIR' | 'OTHER'
  currentMileage: number
  cost?: number
  notes?: string
  wasOnTime: boolean
  daysOverdue?: number
}

export interface MaintenanceLoggedResult {
  success: boolean
  vehicleESGUpdated: boolean
  hostESGUpdated: boolean
  maintenanceScoreImpact: number
  badgesAwarded: string[]
  vehicleReactivated: boolean
  errors: string[]
}

// ============================================================================
// MAIN HOOK FUNCTION
// ============================================================================

/**
 * Execute all ESG updates when maintenance is logged
 * This should be called from maintenance logging API endpoint
 */
export async function onMaintenanceLogged(
  data: MaintenanceLoggedEventData
): Promise<MaintenanceLoggedResult> {
  const result: MaintenanceLoggedResult = {
    success: true,
    vehicleESGUpdated: false,
    hostESGUpdated: false,
    maintenanceScoreImpact: 0,
    badgesAwarded: [],
    vehicleReactivated: false,
    errors: [],
  }

  console.log('🔧 ESG Hook: Maintenance Logged', {
    carId: data.carId,
    hostId: data.hostId,
    type: data.maintenanceType,
    wasOnTime: data.wasOnTime,
  })

  try {
    // ========================================================================
    // STEP 1: Get Baseline Maintenance Score (Before)
    // ========================================================================
    const vehicleBefore = await prisma.rentalCar.findUnique({
      where: { id: data.carId },
      select: {
        esgMaintenanceScore: true,
        requiresInspection: true,
        safetyHold: true,
      },
    })

    const baselineMaintenanceScore = vehicleBefore?.esgMaintenanceScore || 50

    // ========================================================================
    // STEP 2: Update Vehicle Maintenance Record
    // ========================================================================
    try {
      await updateVehicleMaintenanceRecord(data)
      console.log('✅ Vehicle maintenance record updated')
    } catch (error) {
      console.error('❌ Error updating maintenance record:', error)
      result.errors.push(`Maintenance record update failed: ${error}`)
    }

    // ========================================================================
    // STEP 3: Clear Overdue Flags
    // ========================================================================
    try {
      await clearOverdueFlags(data.carId)
      console.log('✅ Overdue flags cleared')
    } catch (error) {
      console.error('❌ Error clearing flags:', error)
      result.errors.push(`Flag clearing failed: ${error}`)
    }

    // ========================================================================
    // STEP 4: Update Maintenance Status
    // ========================================================================
    try {
      await updateVehicleMaintenanceStatus(data.carId)
      console.log('✅ Maintenance status updated')
    } catch (error) {
      console.error('❌ Error updating maintenance status:', error)
      result.errors.push(`Maintenance status update failed: ${error}`)
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
    // STEP 6: Calculate Maintenance Score Impact
    // ========================================================================
    const vehicleAfter = await prisma.rentalCar.findUnique({
      where: { id: data.carId },
      select: { esgMaintenanceScore: true },
    })

    const newMaintenanceScore = vehicleAfter?.esgMaintenanceScore || 50
    result.maintenanceScoreImpact = newMaintenanceScore - baselineMaintenanceScore

    console.log('📊 Maintenance score impact:', result.maintenanceScoreImpact)

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
    // STEP 8: Check for Badge Achievements
    // ========================================================================
    try {
      const newBadges = await checkMaintenanceBadges(data.hostId)
      result.badgesAwarded = newBadges
      if (newBadges.length > 0) {
        console.log('🏆 Badges awarded:', newBadges)
      }
    } catch (error) {
      console.error('❌ Error checking badges:', error)
      result.errors.push(`Badge check failed: ${error}`)
    }

    // ========================================================================
    // STEP 9: Check if Vehicle Can Be Reactivated
    // ========================================================================
    try {
      const reactivated = await checkVehicleReactivation(
        data.carId,
        data.maintenanceType,
        vehicleBefore
      )
      result.vehicleReactivated = reactivated
      if (reactivated) {
        console.log('✅ Vehicle reactivated after maintenance')
      }
    } catch (error) {
      console.error('❌ Error checking reactivation:', error)
      result.errors.push(`Reactivation check failed: ${error}`)
    }

    // ========================================================================
    // STEP 10: Create ESG Event Log
    // ========================================================================
    try {
      await logESGEvent({
        hostId: data.hostId,
        eventType: 'MAINTENANCE_LOGGED',
        eventCategory: 'COMPLIANCE',
        description: `Maintenance completed - ${data.maintenanceType}${
          data.wasOnTime ? ' (on time)' : ` (${data.daysOverdue} days overdue)`
        }`,
        scoreChange: result.maintenanceScoreImpact,
        metadata: {
          carId: data.carId,
          maintenanceType: data.maintenanceType,
          currentMileage: data.currentMileage,
          cost: data.cost,
          wasOnTime: data.wasOnTime,
          daysOverdue: data.daysOverdue || 0,
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
      console.log('✅ Maintenance logged hook executed successfully')
    } else {
      console.warn('⚠️ Maintenance logged hook completed with errors:', result.errors)
    }

    return result
  } catch (error) {
    console.error('❌ Fatal error in maintenance logged hook:', error)
    result.success = false
    result.errors.push(`Fatal error: ${error}`)
    return result
  }
}

// ============================================================================
// HELPER: UPDATE VEHICLE MAINTENANCE RECORD
// ============================================================================

async function updateVehicleMaintenanceRecord(
  data: MaintenanceLoggedEventData
): Promise<void> {
  await prisma.rentalCar.update({
    where: { id: data.carId },
    data: {
      lastOdometerCheck: new Date(),
      currentMileage: data.currentMileage,
    },
  })
}

// ============================================================================
// HELPER: CLEAR OVERDUE FLAGS
// ============================================================================

async function clearOverdueFlags(carId: string): Promise<void> {
  const car = await prisma.rentalCar.findUnique({
    where: { id: carId },
    select: { requiresInspection: true, safetyHold: true },
  })

  if (!car) return

  // Only clear flags if they were set for maintenance reasons
  // (not for claims or other issues)
  const updateData: any = {}

  if (car.requiresInspection) {
    updateData.requiresInspection = false
  }

  // Don't automatically clear safety hold - requires manual review
  // unless it was ONLY set for maintenance

  if (Object.keys(updateData).length > 0) {
    await prisma.rentalCar.update({
      where: { id: carId },
      data: updateData,
    })
  }
}

// ============================================================================
// HELPER: CHECK MAINTENANCE BADGES
// ============================================================================

async function checkMaintenanceBadges(hostId: string): Promise<string[]> {
  const profile = await prisma.hostESGProfile.findUnique({
    where: { hostId },
    select: {
      maintenanceScore: true,
      maintenanceOnTime: true,
      achievedBadges: true,
    },
  })

  if (!profile) return []

  const newBadges: string[] = []

  // Check for new badge achievements
  const badgeChecks = [
    {
      badge: 'MAINTENANCE_PRO',
      condition: profile.maintenanceScore >= 90,
    },
    {
      badge: 'MAINTENANCE_MASTER',
      condition: profile.maintenanceScore >= 95,
    },
    {
      badge: 'ALWAYS_ON_TIME',
      condition: profile.maintenanceOnTime === true && profile.maintenanceScore >= 85,
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
// HELPER: CHECK VEHICLE REACTIVATION
// ============================================================================

async function checkVehicleReactivation(
  carId: string,
  maintenanceType: string,
  vehicleBefore: any
): Promise<boolean> {
  // Only attempt reactivation if vehicle was previously inactive
  const car = await prisma.rentalCar.findUnique({
    where: { id: carId },
    select: {
      isActive: true,
      safetyHold: true,
      hasActiveClaim: true,
      requiresInspection: true,
    },
  })

  if (!car || car.isActive) return false

  // Don't reactivate if there are other issues
  if (car.hasActiveClaim) {
    console.log('⚠️ Cannot reactivate: Active claim exists')
    return false
  }

  if (car.safetyHold) {
    console.log('⚠️ Cannot reactivate: Safety hold active')
    return false
  }

  if (car.requiresInspection) {
    console.log('⚠️ Cannot reactivate: Inspection required')
    return false
  }

  // If maintenance was an INSPECTION or REPAIR, consider reactivation
  if (maintenanceType === 'INSPECTION' || maintenanceType === 'REPAIR') {
    await prisma.rentalCar.update({
      where: { id: carId },
      data: {
        isActive: true,
        repairVerified: true,
      },
    })

    console.log('✅ Vehicle reactivated after', maintenanceType)
    return true
  }

  return false
}

// ============================================================================
// HELPER: LOG ESG EVENT
// ============================================================================

async function logESGEvent(data: {
  hostId: string
  eventType: string
  eventCategory: string
  description: string
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
      scoreAfter: profile?.compositeScore || null,
      scoreChange: data.scoreChange || null,
      metadata: data.metadata || {},
    },
  })
}

// ============================================================================
// CONVENIENCE FUNCTION FOR API ENDPOINTS
// ============================================================================

/**
 * Quick helper to trigger ESG updates from maintenance logging endpoint
 */
export async function triggerMaintenanceLoggedESG(
  carId: string,
  maintenanceData: {
    type: string
    mileage: number
    cost?: number
    notes?: string
  }
): Promise<MaintenanceLoggedResult> {
  // Fetch car and host data
  const car = await prisma.rentalCar.findUnique({
    where: { id: carId },
    select: {
      id: true,
      hostId: true,
      lastOdometerCheck: true,
      maintenanceCadence: true,
    },
  })

  if (!car) {
    throw new Error(`Vehicle not found: ${carId}`)
  }

  // Determine if maintenance was on time
  const lastServiceDate = car.lastOdometerCheck || new Date(0)
  const daysSinceService = Math.floor(
    (Date.now() - lastServiceDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  const cadence = car.maintenanceCadence || 90
  const wasOnTime = daysSinceService <= cadence
  const daysOverdue = Math.max(0, daysSinceService - cadence)

  return await onMaintenanceLogged({
    carId: car.id,
    hostId: car.hostId,
    maintenanceType: maintenanceData.type as any,
    currentMileage: maintenanceData.mileage,
    cost: maintenanceData.cost,
    notes: maintenanceData.notes,
    wasOnTime,
    daysOverdue: wasOnTime ? undefined : daysOverdue,
  })
}