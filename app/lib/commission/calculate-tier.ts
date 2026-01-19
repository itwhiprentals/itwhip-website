// app/lib/commission/calculate-tier.ts
// Commission Tier Calculator for Fleet Partners

import { prisma } from '@/app/lib/database/prisma'

/**
 * Tier Thresholds (customizable per partner)
 * Default values used if partner doesn't have custom thresholds
 */
export const DEFAULT_TIER_THRESHOLDS = {
  tier1: { minVehicles: 10, rate: 0.20, name: 'Gold' },
  tier2: { minVehicles: 50, rate: 0.15, name: 'Platinum' },
  tier3: { minVehicles: 100, rate: 0.10, name: 'Diamond' },
  base: { minVehicles: 0, rate: 0.25, name: 'Standard' }
}

/**
 * Calculate the commission rate based on fleet size
 * Uses partner's custom thresholds if set, otherwise uses defaults
 */
export function calculatePartnerCommission(partner: {
  partnerFleetSize?: number | null
  tier1VehicleCount?: number | null
  tier1CommissionRate?: number | null
  tier2VehicleCount?: number | null
  tier2CommissionRate?: number | null
  tier3VehicleCount?: number | null
  tier3CommissionRate?: number | null
  commissionRate?: number | null
}): number {
  const vehicleCount = partner.partnerFleetSize || 0

  // Use partner's custom thresholds or defaults
  const tier1Min = partner.tier1VehicleCount || DEFAULT_TIER_THRESHOLDS.tier1.minVehicles
  const tier2Min = partner.tier2VehicleCount || DEFAULT_TIER_THRESHOLDS.tier2.minVehicles
  const tier3Min = partner.tier3VehicleCount || DEFAULT_TIER_THRESHOLDS.tier3.minVehicles

  const tier1Rate = partner.tier1CommissionRate || DEFAULT_TIER_THRESHOLDS.tier1.rate
  const tier2Rate = partner.tier2CommissionRate || DEFAULT_TIER_THRESHOLDS.tier2.rate
  const tier3Rate = partner.tier3CommissionRate || DEFAULT_TIER_THRESHOLDS.tier3.rate
  const baseRate = partner.commissionRate || DEFAULT_TIER_THRESHOLDS.base.rate

  if (vehicleCount >= tier3Min) return tier3Rate // Diamond
  if (vehicleCount >= tier2Min) return tier2Rate // Platinum
  if (vehicleCount >= tier1Min) return tier1Rate // Gold
  return baseRate // Standard
}

/**
 * Get tier information for display
 */
export function getTierInfo(partner: {
  partnerFleetSize?: number | null
  currentCommissionRate?: number | null
  tier1VehicleCount?: number | null
  tier2VehicleCount?: number | null
  tier3VehicleCount?: number | null
}): {
  currentTier: string
  currentRate: number
  nextTier: string | null
  nextRate: number | null
  vehiclesToNextTier: number | null
  progress: number // 0-100
} {
  const vehicleCount = partner.partnerFleetSize || 0
  const currentRate = partner.currentCommissionRate || 0.25

  const tier1Min = partner.tier1VehicleCount || DEFAULT_TIER_THRESHOLDS.tier1.minVehicles
  const tier2Min = partner.tier2VehicleCount || DEFAULT_TIER_THRESHOLDS.tier2.minVehicles
  const tier3Min = partner.tier3VehicleCount || DEFAULT_TIER_THRESHOLDS.tier3.minVehicles

  if (vehicleCount >= tier3Min) {
    return {
      currentTier: 'Diamond',
      currentRate,
      nextTier: null,
      nextRate: null,
      vehiclesToNextTier: null,
      progress: 100
    }
  }

  if (vehicleCount >= tier2Min) {
    return {
      currentTier: 'Platinum',
      currentRate,
      nextTier: 'Diamond',
      nextRate: 0.10,
      vehiclesToNextTier: tier3Min - vehicleCount,
      progress: Math.round(((vehicleCount - tier2Min) / (tier3Min - tier2Min)) * 100)
    }
  }

  if (vehicleCount >= tier1Min) {
    return {
      currentTier: 'Gold',
      currentRate,
      nextTier: 'Platinum',
      nextRate: 0.15,
      vehiclesToNextTier: tier2Min - vehicleCount,
      progress: Math.round(((vehicleCount - tier1Min) / (tier2Min - tier1Min)) * 100)
    }
  }

  return {
    currentTier: 'Standard',
    currentRate,
    nextTier: 'Gold',
    nextRate: 0.20,
    vehiclesToNextTier: tier1Min - vehicleCount,
    progress: Math.round((vehicleCount / tier1Min) * 100)
  }
}

/**
 * Update partner's commission rate based on current fleet size
 * Called after vehicle add/remove operations
 */
export async function updatePartnerCommissionRate(partnerId: string): Promise<{
  updated: boolean
  oldRate: number | null
  newRate: number | null
  tierChange: string | null
}> {
  try {
    const partner = await prisma.rentalHost.findUnique({
      where: { id: partnerId },
      select: {
        id: true,
        hostType: true,
        partnerFleetSize: true,
        partnerCompanyName: true,
        currentCommissionRate: true,
        commissionRate: true,
        tier1VehicleCount: true,
        tier1CommissionRate: true,
        tier2VehicleCount: true,
        tier2CommissionRate: true,
        tier3VehicleCount: true,
        tier3CommissionRate: true
      }
    })

    if (!partner) {
      console.log(`[Commission] Partner not found: ${partnerId}`)
      return { updated: false, oldRate: null, newRate: null, tierChange: null }
    }

    // Only process fleet partners
    if (partner.hostType !== 'FLEET_PARTNER' && partner.hostType !== 'PARTNER') {
      return { updated: false, oldRate: null, newRate: null, tierChange: null }
    }

    const oldRate = partner.currentCommissionRate || 0.25
    const newRate = calculatePartnerCommission(partner)

    // No change needed
    if (newRate === oldRate) {
      return { updated: false, oldRate, newRate, tierChange: null }
    }

    // Get tier names for logging
    const oldTierInfo = getTierInfo({ ...partner, currentCommissionRate: oldRate })
    const newTierInfo = getTierInfo({ ...partner, currentCommissionRate: newRate })

    // Update the rate
    await prisma.rentalHost.update({
      where: { id: partnerId },
      data: {
        currentCommissionRate: newRate
      }
    })

    // Log the change to commission history
    await prisma.partner_commission_history.create({
      data: {
        hostId: partnerId,
        oldRate: oldRate,
        newRate: newRate,
        reason: `Automatic tier adjustment: ${oldTierInfo.currentTier} → ${newTierInfo.currentTier} (${partner.partnerFleetSize} vehicles)`,
        changedBy: 'SYSTEM'
      }
    })

    console.log(`[Commission] Updated partner ${partner.partnerCompanyName}:`, {
      oldRate: `${Math.round(oldRate * 100)}%`,
      newRate: `${Math.round(newRate * 100)}%`,
      tier: `${oldTierInfo.currentTier} → ${newTierInfo.currentTier}`,
      fleetSize: partner.partnerFleetSize
    })

    return {
      updated: true,
      oldRate,
      newRate,
      tierChange: `${oldTierInfo.currentTier} → ${newTierInfo.currentTier}`
    }

  } catch (error) {
    console.error(`[Commission] Error updating partner ${partnerId}:`, error)
    return { updated: false, oldRate: null, newRate: null, tierChange: null }
  }
}

/**
 * Recalculate fleet size and update commission for a partner
 * Call this after any vehicle changes
 */
export async function recalculatePartnerFleetSize(partnerId: string): Promise<number> {
  try {
    // Count active vehicles
    const vehicleCount = await prisma.rentalCar.count({
      where: {
        hostId: partnerId,
        active: true
      }
    })

    // Update fleet size
    await prisma.rentalHost.update({
      where: { id: partnerId },
      data: {
        partnerFleetSize: vehicleCount
      }
    })

    // Update commission rate based on new fleet size
    await updatePartnerCommissionRate(partnerId)

    return vehicleCount
  } catch (error) {
    console.error(`[Commission] Error recalculating fleet size for ${partnerId}:`, error)
    return 0
  }
}
