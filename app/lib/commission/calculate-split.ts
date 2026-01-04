// app/lib/commission/calculate-split.ts
// Commission calculator for Fleet Manager & Vehicle Owner system
//
// BUSINESS RULES:
// 1. Platform ALWAYS takes 10% first on managed cars (non-negotiable)
// 2. Remaining 90% is split between owner and manager per their agreement
// 3. Default split: 70% owner / 30% manager (of the 90%)
// 4. Manager can negotiate 10-50%, Owner gets 50-90%

import {
  ManagedCarCommission,
  PLATFORM_CUT_PERCENT,
  DEFAULT_OWNER_PERCENT,
  DEFAULT_MANAGER_PERCENT,
  MIN_MANAGER_PERCENT,
  MAX_MANAGER_PERCENT,
  MIN_OWNER_PERCENT,
  MAX_OWNER_PERCENT
} from '@/app/types/fleet-management'

/**
 * Calculate commission split for a managed vehicle
 * Platform takes 10% first, then remaining 90% is split per agreement
 *
 * Example:
 *   Booking: $100/day
 *   Platform takes 10%: $10
 *   Remaining 90%: $90
 *   If agreement is 70% owner / 30% manager:
 *   ├── Owner gets: 70% of $90 = $63
 *   └── Manager gets: 30% of $90 = $27
 */
export function calculateManagedCarCommission(
  totalRevenue: number,
  ownerPercent: number = DEFAULT_OWNER_PERCENT,
  managerPercent: number = DEFAULT_MANAGER_PERCENT
): ManagedCarCommission {
  // Validate percentages add up to 100
  if (Math.abs(ownerPercent + managerPercent - 100) > 0.01) {
    throw new Error(`Owner (${ownerPercent}%) and manager (${managerPercent}%) percentages must sum to 100`)
  }

  // Validate percentage ranges
  if (managerPercent < MIN_MANAGER_PERCENT || managerPercent > MAX_MANAGER_PERCENT) {
    throw new Error(`Manager percentage must be between ${MIN_MANAGER_PERCENT}% and ${MAX_MANAGER_PERCENT}%`)
  }

  if (ownerPercent < MIN_OWNER_PERCENT || ownerPercent > MAX_OWNER_PERCENT) {
    throw new Error(`Owner percentage must be between ${MIN_OWNER_PERCENT}% and ${MAX_OWNER_PERCENT}%`)
  }

  // Platform always takes 10%
  const platformCut = totalRevenue * (PLATFORM_CUT_PERCENT / 100)
  const remainingRevenue = totalRevenue - platformCut

  // Split remaining 90% per agreement
  const ownerEarnings = remainingRevenue * (ownerPercent / 100)
  const managerEarnings = remainingRevenue * (managerPercent / 100)

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    platformCut: Math.round(platformCut * 100) / 100,
    ownerEarnings: Math.round(ownerEarnings * 100) / 100,
    managerEarnings: Math.round(managerEarnings * 100) / 100,
    ownerPercent,
    managerPercent
  }
}

/**
 * Calculate owner's effective total percentage of gross revenue
 * e.g., 70% of 90% = 63% of total revenue
 */
export function getEffectiveOwnerPercent(ownerPercent: number): number {
  return ownerPercent * (100 - PLATFORM_CUT_PERCENT) / 100
}

/**
 * Calculate manager's effective total percentage of gross revenue
 * e.g., 30% of 90% = 27% of total revenue
 */
export function getEffectiveManagerPercent(managerPercent: number): number {
  return managerPercent * (100 - PLATFORM_CUT_PERCENT) / 100
}

/**
 * Calculate what a specific revenue amount would yield for each party
 * Useful for showing "If this car earns $X, you'll get $Y"
 */
export function calculateEarningsPreview(
  monthlyRevenue: number,
  ownerPercent: number = DEFAULT_OWNER_PERCENT,
  managerPercent: number = DEFAULT_MANAGER_PERCENT
): {
  owner: { monthly: number; yearly: number }
  manager: { monthly: number; yearly: number }
  platform: { monthly: number; yearly: number }
} {
  const commission = calculateManagedCarCommission(monthlyRevenue, ownerPercent, managerPercent)

  return {
    owner: {
      monthly: commission.ownerEarnings,
      yearly: commission.ownerEarnings * 12
    },
    manager: {
      monthly: commission.managerEarnings,
      yearly: commission.managerEarnings * 12
    },
    platform: {
      monthly: commission.platformCut,
      yearly: commission.platformCut * 12
    }
  }
}

/**
 * Validate commission split percentages
 * Returns null if valid, error message if invalid
 */
export function validateCommissionSplit(
  ownerPercent: number,
  managerPercent: number
): string | null {
  // Check sum equals 100
  if (Math.abs(ownerPercent + managerPercent - 100) > 0.01) {
    return `Percentages must sum to 100% (currently ${ownerPercent + managerPercent}%)`
  }

  // Check manager range
  if (managerPercent < MIN_MANAGER_PERCENT) {
    return `Manager percentage cannot be less than ${MIN_MANAGER_PERCENT}%`
  }
  if (managerPercent > MAX_MANAGER_PERCENT) {
    return `Manager percentage cannot exceed ${MAX_MANAGER_PERCENT}%`
  }

  // Check owner range
  if (ownerPercent < MIN_OWNER_PERCENT) {
    return `Owner percentage cannot be less than ${MIN_OWNER_PERCENT}%`
  }
  if (ownerPercent > MAX_OWNER_PERCENT) {
    return `Owner percentage cannot exceed ${MAX_OWNER_PERCENT}%`
  }

  return null
}

/**
 * Format commission as a display string
 * e.g., "70/30" or "Owner 70% / Manager 30%"
 */
export function formatCommissionSplit(
  ownerPercent: number,
  managerPercent: number,
  verbose: boolean = false
): string {
  if (verbose) {
    return `Owner ${ownerPercent}% / Manager ${managerPercent}%`
  }
  return `${ownerPercent}/${managerPercent}`
}

/**
 * Calculate the adjustment needed when changing commission split
 * Useful for showing impact of counter-offers
 */
export function calculateSplitDifference(
  currentOwnerPercent: number,
  currentManagerPercent: number,
  newOwnerPercent: number,
  newManagerPercent: number,
  monthlyRevenue: number
): {
  ownerChange: number
  managerChange: number
  direction: 'owner_gains' | 'manager_gains' | 'no_change'
} {
  const current = calculateManagedCarCommission(monthlyRevenue, currentOwnerPercent, currentManagerPercent)
  const proposed = calculateManagedCarCommission(monthlyRevenue, newOwnerPercent, newManagerPercent)

  const ownerChange = proposed.ownerEarnings - current.ownerEarnings
  const managerChange = proposed.managerEarnings - current.managerEarnings

  let direction: 'owner_gains' | 'manager_gains' | 'no_change' = 'no_change'
  if (ownerChange > 0) direction = 'owner_gains'
  else if (managerChange > 0) direction = 'manager_gains'

  return {
    ownerChange: Math.round(ownerChange * 100) / 100,
    managerChange: Math.round(managerChange * 100) / 100,
    direction
  }
}
