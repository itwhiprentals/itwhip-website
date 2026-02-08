// app/lib/esg/hooks/on-vehicle-added.ts
/**
 * On Vehicle Added Event Hook
 * Automatically calculates initial ESG scores and updates fleet composition
 */

import prisma from '@/app/lib/database/prisma'
import { updateVehicleESGScores } from '../calculate-vehicle-esg'
import { updateHostESGProfile } from '../calculate-host-esg'
import { analyzeFleetComposition } from '../fleet-composition'
import { getVehicleCategory, getEnvironmentalBaselineScore } from '../esg-helpers'

// ============================================================================
// TYPES
// ============================================================================

export interface VehicleAddedEventData {
  carId: string
  hostId: string
  make: string
  model: string
  year: number
  fuelType: string
  isFirstVehicle: boolean
}

export interface VehicleAddedResult {
  success: boolean
  vehicleESGCalculated: boolean
  hostESGUpdated: boolean
  fleetCompositionChanged: boolean
  initialESGScore: number
  badgesAwarded: string[]
  environmentalImpact: {
    category: 'EV' | 'HYBRID' | 'GAS'
    baselineScore: number
    fleetEVPercentage: number
  }
  errors: string[]
}

// ============================================================================
// MAIN HOOK FUNCTION
// ============================================================================

/**
 * Execute all ESG calculations when a new vehicle is added
 * This should be called from the vehicle creation API endpoint
 */
export async function onVehicleAdded(
  data: VehicleAddedEventData
): Promise<VehicleAddedResult> {
  const result: VehicleAddedResult = {
    success: true,
    vehicleESGCalculated: false,
    hostESGUpdated: false,
    fleetCompositionChanged: false,
    initialESGScore: 50,
    badgesAwarded: [],
    environmentalImpact: {
      category: getVehicleCategory(data.fuelType),
      baselineScore: getEnvironmentalBaselineScore(data.fuelType),
      fleetEVPercentage: 0,
    },
    errors: [],
  }

  console.log('🚗 ESG Hook: Vehicle Added', {
    carId: data.carId,
    hostId: data.hostId,
    make: data.make,
    model: data.model,
    fuelType: data.fuelType,
    isFirstVehicle: data.isFirstVehicle,
  })

  try {
    // ========================================================================
    // STEP 1: Set Initial Vehicle ESG Scores
    // ========================================================================
    try {
      await setInitialVehicleESGScores(data)
      console.log('✅ Initial vehicle ESG scores set')
    } catch (error) {
      console.error('❌ Error setting initial scores:', error)
      result.errors.push(`Initial score setting failed: ${error}`)
    }

    // ========================================================================
    // STEP 2: Calculate Full Vehicle ESG Profile
    // ========================================================================
    try {
      await updateVehicleESGScores(data.carId)
      result.vehicleESGCalculated = true
      console.log('✅ Vehicle ESG profile calculated')

      // Get the calculated score
      const car = await prisma.rentalCar.findUnique({
        where: { id: data.carId },
        select: { esgScore: true },
      })
      result.initialESGScore = car?.esgScore || 50
    } catch (error) {
      console.error('❌ Error calculating vehicle ESG:', error)
      result.errors.push(`Vehicle ESG calculation failed: ${error}`)
    }

    // ========================================================================
    // STEP 3: Update Fleet Composition
    // ========================================================================
    try {
      const fleetComposition = await analyzeFleetComposition(data.hostId)
      result.fleetCompositionChanged = true
      result.environmentalImpact.fleetEVPercentage =
        fleetComposition.composition.electric.percentage

      console.log('✅ Fleet composition updated:', {
        totalVehicles: fleetComposition.totalVehicles,
        evPercentage: fleetComposition.composition.electric.percentage,
        hybridPercentage: fleetComposition.composition.hybrid.percentage,
        gasPercentage: fleetComposition.composition.gas.percentage,
      })
    } catch (error) {
      console.error('❌ Error updating fleet composition:', error)
      result.errors.push(`Fleet composition update failed: ${error}`)
    }

    // ========================================================================
    // STEP 4: Update Host-Level ESG Profile
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
    // STEP 5: Update Host Vehicle Counters
    // ========================================================================
    try {
      await updateHostVehicleCounters(data.hostId, data.fuelType)
      console.log('✅ Host vehicle counters updated')
    } catch (error) {
      console.error('❌ Error updating vehicle counters:', error)
      result.errors.push(`Vehicle counter update failed: ${error}`)
    }

    // ========================================================================
    // STEP 6: Check for Badge Achievements
    // ========================================================================
    try {
      const newBadges = await checkVehicleAdditionBadges(data)
      result.badgesAwarded = newBadges
      if (newBadges.length > 0) {
        console.log('🏆 Badges awarded:', newBadges)
      }
    } catch (error) {
      console.error('❌ Error checking badges:', error)
      result.errors.push(`Badge check failed: ${error}`)
    }

    // ========================================================================
    // STEP 7: Create ESG Event Log
    // ========================================================================
    try {
      await logESGEvent({
        hostId: data.hostId,
        eventType: 'VEHICLE_ADDED',
        eventCategory: 'ENVIRONMENTAL',
        description: `New vehicle added: ${data.year} ${data.make} ${data.model} (${result.environmentalImpact.category})`,
        metadata: {
          carId: data.carId,
          make: data.make,
          model: data.model,
          year: data.year,
          fuelType: data.fuelType,
          category: result.environmentalImpact.category,
          baselineScore: result.environmentalImpact.baselineScore,
          isFirstVehicle: data.isFirstVehicle,
        },
      })
      console.log('✅ ESG event logged')
    } catch (error) {
      console.error('❌ Error logging ESG event:', error)
      result.errors.push(`Event logging failed: ${error}`)
    }

    // ========================================================================
    // STEP 8: Send Welcome/Guidance Notification (if first vehicle)
    // ========================================================================
    if (data.isFirstVehicle) {
      try {
        await sendFirstVehicleGuidance(data.hostId, result.environmentalImpact.category)
        console.log('✅ First vehicle guidance sent')
      } catch (error) {
        console.error('❌ Error sending guidance:', error)
        result.errors.push(`Guidance notification failed: ${error}`)
      }
    }

    // ========================================================================
    // FINAL STATUS
    // ========================================================================
    result.success = result.errors.length === 0

    if (result.success) {
      console.log('✅ Vehicle added hook executed successfully')
      console.log('📊 Initial ESG Score:', result.initialESGScore)
    } else {
      console.warn('⚠️ Vehicle added hook completed with errors:', result.errors)
    }

    return result
  } catch (error) {
    console.error('❌ Fatal error in vehicle added hook:', error)
    result.success = false
    result.errors.push(`Fatal error: ${error}`)
    return result
  }
}

// ============================================================================
// HELPER: SET INITIAL VEHICLE ESG SCORES
// ============================================================================

async function setInitialVehicleESGScores(data: VehicleAddedEventData): Promise<void> {
  // Set initial neutral scores
  const environmentalBaselineScore = getEnvironmentalBaselineScore(data.fuelType)

  await prisma.rentalCar.update({
    where: { id: data.carId },
    data: {
      esgScore: 50, // Neutral composite score
      esgEnvironmentalScore: environmentalBaselineScore, // Fair baseline for fuel type
      esgSafetyScore: 50, // Neutral safety (no history yet)
      esgMaintenanceScore: 100, // Start with perfect maintenance
      esgLastCalculated: new Date(),
      avgMilesPerTrip: 0,
      guestRatingAvg: 5.0,
      maintenanceCadence: 90, // Default: every 90 days
      claimFreeMonths: 0,
    },
  })
}

// ============================================================================
// HELPER: UPDATE HOST VEHICLE COUNTERS
// ============================================================================

async function updateHostVehicleCounters(
  hostId: string,
  fuelType: string
): Promise<void> {
  const profile = await prisma.hostESGProfile.findUnique({
    where: { hostId },
    select: {
      totalVehicles: true,
      activeVehicles: true,
      evVehicleCount: true,
    },
  })

  if (!profile) {
    // Create initial profile if doesn't exist
    await prisma.hostESGProfile.create({
      data: {
        id: `esg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        hostId,
        totalVehicles: 1,
        activeVehicles: 1,
        evVehicleCount: getVehicleCategory(fuelType) === 'EV' ? 1 : 0,
        lastCalculatedAt: new Date(),
        updatedAt: new Date(),
      } as any,
    })
  } else {
    // Update existing profile
    const isEV = getVehicleCategory(fuelType) === 'EV'

    await prisma.hostESGProfile.update({
      where: { hostId },
      data: {
        totalVehicles: profile.totalVehicles + 1,
        activeVehicles: profile.activeVehicles + 1,
        evVehicleCount: isEV ? profile.evVehicleCount + 1 : profile.evVehicleCount,
      },
    })
  }
}

// ============================================================================
// HELPER: CHECK BADGE ACHIEVEMENTS
// ============================================================================

async function checkVehicleAdditionBadges(
  data: VehicleAddedEventData
): Promise<string[]> {
  const profile = await prisma.hostESGProfile.findUnique({
    where: { hostId: data.hostId },
    select: {
      totalVehicles: true,
      evVehicleCount: true,
      achievedBadges: true,
    },
  })

  if (!profile) return []

  const newBadges: string[] = []
  const isEV = getVehicleCategory(data.fuelType) === 'EV'

  // Badge checks
  const badgeChecks = [
    {
      badge: 'FIRST_VEHICLE',
      condition: data.isFirstVehicle,
    },
    {
      badge: 'ECO_WARRIOR',
      condition: isEV && profile.evVehicleCount === 1,
    },
    {
      badge: 'GREEN_FLEET_PIONEER',
      condition: isEV && profile.evVehicleCount >= 2,
    },
    {
      badge: 'FLEET_BUILDER_5',
      condition: profile.totalVehicles >= 5,
    },
    {
      badge: 'FLEET_BUILDER_10',
      condition: profile.totalVehicles >= 10,
    },
    {
      badge: 'ALL_ELECTRIC_FLEET',
      condition: profile.evVehicleCount === profile.totalVehicles && profile.evVehicleCount >= 3,
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
      where: { hostId: data.hostId },
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
  metadata?: any
}): Promise<void> {
  // Get current ESG scores for tracking
  const profile = await prisma.hostESGProfile.findUnique({
    where: { hostId: data.hostId },
    select: { compositeScore: true },
  })

  await prisma.eSGEvent.create({
    data: {
      id: `esg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      hostId: data.hostId,
      eventType: data.eventType,
      eventCategory: data.eventCategory,
      description: data.description,
      scoreAfter: profile?.compositeScore || null,
      metadata: data.metadata || {},
    },
  })
}

// ============================================================================
// HELPER: SEND FIRST VEHICLE GUIDANCE
// ============================================================================

async function sendFirstVehicleGuidance(
  hostId: string,
  vehicleCategory: 'EV' | 'HYBRID' | 'GAS'
): Promise<void> {
  // This would integrate with your notification system
  // For now, just log it

  const guidanceMessages = {
    EV: 'Great choice! Your electric vehicle will boost your environmental score. Keep it well-maintained to maximize your ESG rating.',
    HYBRID: 'Excellent start! Hybrid vehicles balance efficiency and practicality. Consider adding more eco-friendly vehicles to improve your fleet composition.',
    GAS: 'Welcome to ItWhip! Keep your vehicle well-maintained and incident-free to build a strong safety record. Consider adding hybrid or electric vehicles to boost your environmental score.',
  }

  console.log('📧 First Vehicle Guidance:', guidanceMessages[vehicleCategory])

  // TODO: Integrate with email/notification system
  // await sendEmail({
  //   to: host.email,
  //   subject: 'Welcome to ItWhip - Your ESG Journey Begins',
  //   body: guidanceMessages[vehicleCategory],
  // })
}

// ============================================================================
// CONVENIENCE FUNCTION FOR API ENDPOINTS
// ============================================================================

/**
 * Quick helper to trigger ESG updates from vehicle creation endpoint
 */
export async function triggerVehicleAddedESG(carId: string): Promise<VehicleAddedResult> {
  // Fetch car data
  const car = await prisma.rentalCar.findUnique({
    where: { id: carId },
    select: {
      id: true,
      hostId: true,
      make: true,
      model: true,
      year: true,
      fuelType: true,
      host: {
        select: {
          cars: {
            select: { id: true },
          },
        },
      },
    },
  })

  if (!car) {
    throw new Error(`Vehicle not found: ${carId}`)
  }

  // Check if this is the first vehicle
  const isFirstVehicle = car.host.cars.length === 1

  return await onVehicleAdded({
    carId: car.id,
    hostId: car.hostId,
    make: car.make,
    model: car.model,
    year: car.year,
    fuelType: car.fuelType,
    isFirstVehicle,
  })
}