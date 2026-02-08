// app/lib/insurance/tier-calculator.ts

import { RentalHost } from '@prisma/client'

export type EarningsTier = 'BASIC' | 'STANDARD' | 'PREMIUM'

export interface TierCalculation {
  tier: EarningsTier
  hostEarnings: number
  platformCommission: number
  source: 'NONE' | 'P2P' | 'COMMERCIAL'
  status: string | null
}

/**
 * Calculate host's earnings tier based on ACTIVE insurance only
 * CRITICAL: Only 'ACTIVE' status grants tier benefits
 */
export function calculateHostTier(host: Partial<RentalHost>): TierCalculation {
  // Check for ACTIVE insurances only
  const hasActiveCommercial = host.commercialInsuranceStatus === 'ACTIVE'
  const hasActiveP2P = host.p2pInsuranceStatus === 'ACTIVE'
  
  // Handle legacy insurance fields
  const hasActiveLegacyP2P = host.usingLegacyInsurance && host.hostInsuranceStatus === 'ACTIVE'
  const effectiveP2PActive = hasActiveP2P || hasActiveLegacyP2P
  
  if (hasActiveCommercial) {
    return {
      tier: 'PREMIUM',
      hostEarnings: 0.90,
      platformCommission: 0.10,
      source: 'COMMERCIAL',
      status: 'ACTIVE'
    }
  } else if (effectiveP2PActive) {
    return {
      tier: 'STANDARD', 
      hostEarnings: 0.75,
      platformCommission: 0.25,
      source: 'P2P',
      status: 'ACTIVE'
    }
  } else {
    // ANY other status: PENDING, EXPIRED, DEACTIVATED, null
    // Always defaults to BASIC for safety
    return {
      tier: 'BASIC',
      hostEarnings: 0.40,
      platformCommission: 0.60,
      source: 'NONE',
      status: null
    }
  }
}

/**
 * Calculate what tier WOULD be after a specific action
 */
export function calculateTierAfterAction(
  host: Partial<RentalHost>,
  action: 'DELETE_P2P' | 'DELETE_COMMERCIAL' | 'TOGGLE_TO_P2P' | 'TOGGLE_TO_COMMERCIAL' | 'EXPIRE_P2P' | 'EXPIRE_COMMERCIAL'
): TierCalculation {
  // Create a copy to simulate the change
  const simulatedHost = { ...host }
  
  switch (action) {
    case 'DELETE_P2P':
      simulatedHost.p2pInsuranceStatus = null
      simulatedHost.hostInsuranceStatus = null as any // Handle legacy
      break
    
    case 'DELETE_COMMERCIAL':
      simulatedHost.commercialInsuranceStatus = null
      break
    
    case 'TOGGLE_TO_P2P':
      // Only works if P2P is ACTIVE
      if (host.p2pInsuranceStatus === 'ACTIVE' || (host.usingLegacyInsurance && host.hostInsuranceStatus === 'ACTIVE')) {
        simulatedHost.commercialInsuranceStatus = 'INACTIVE'
        simulatedHost.p2pInsuranceStatus = 'ACTIVE'
      }
      break
    
    case 'TOGGLE_TO_COMMERCIAL':
      // Only works if Commercial is ACTIVE
      if (host.commercialInsuranceStatus === 'ACTIVE') {
        simulatedHost.p2pInsuranceStatus = 'INACTIVE'
        simulatedHost.hostInsuranceStatus = 'INACTIVE' // Handle legacy
        simulatedHost.commercialInsuranceStatus = 'ACTIVE'
      }
      break
      
    case 'EXPIRE_P2P':
      simulatedHost.p2pInsuranceStatus = 'EXPIRED'
      simulatedHost.hostInsuranceStatus = 'EXPIRED' // Handle legacy
      break
      
    case 'EXPIRE_COMMERCIAL':
      simulatedHost.commercialInsuranceStatus = 'EXPIRED'
      break
  }
  
  return calculateHostTier(simulatedHost)
}

/**
 * Get warning message for tier change
 */
export function getTierChangeWarning(
  currentTier: TierCalculation,
  newTier: TierCalculation,
  action: string
): { 
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  showEarningsChange: boolean
} {
  const currentPercent = Math.round(currentTier.hostEarnings * 100)
  const newPercent = Math.round(newTier.hostEarnings * 100)
  
  // No change
  if (currentPercent === newPercent) {
    return {
      severity: 'info',
      title: 'No Earnings Impact',
      message: `This action will not affect your current ${currentPercent}% earnings rate.`,
      showEarningsChange: false
    }
  }
  
  // Dropping to BASIC (40%)
  if (newTier.tier === 'BASIC') {
    return {
      severity: 'critical',
      title: '⚠️ Critical: Major Earnings Reduction',
      message: `${action} will immediately reduce your earnings from ${currentPercent}% to ${newPercent}%. You will need admin approval to restore higher earnings.`,
      showEarningsChange: true
    }
  }
  
  // Downgrade but not to BASIC
  if (currentPercent > newPercent) {
    return {
      severity: 'warning', 
      title: '⚠️ Warning: Earnings Reduction',
      message: `${action} will reduce your earnings from ${currentPercent}% to ${newPercent}%.`,
      showEarningsChange: true
    }
  }
  
  // Upgrade
  return {
    severity: 'info',
    title: '✅ Earnings Upgrade',
    message: `${action} will increase your earnings from ${currentPercent}% to ${newPercent}%.`,
    showEarningsChange: true
  }
}

/**
 * Calculate financial impact for example booking amounts
 */
export function calculateFinancialImpact(
  currentTier: TierCalculation,
  newTier: TierCalculation,
  sampleBookingAmount: number = 1000
): {
  currentEarnings: number
  newEarnings: number
  difference: number
  percentChange: number
} {
  const currentEarnings = sampleBookingAmount * currentTier.hostEarnings
  const newEarnings = sampleBookingAmount * newTier.hostEarnings
  const difference = newEarnings - currentEarnings
  const percentChange = ((newEarnings - currentEarnings) / currentEarnings) * 100
  
  return {
    currentEarnings,
    newEarnings,
    difference,
    percentChange: Math.round(percentChange)
  }
}

/**
 * Check if an insurance type exists (regardless of status)
 */
export function hasInsuranceType(
  host: Partial<RentalHost>,
  type: 'P2P' | 'COMMERCIAL'
): boolean {
  if (type === 'P2P') {
    // Check both legacy and new fields
    return !!(
      host.p2pInsuranceProvider || 
      (host.usingLegacyInsurance && host.hostInsuranceProvider)
    )
  } else {
    return !!host.commercialInsuranceProvider
  }
}

/**
 * Get all insurance statuses for display
 */
export function getInsuranceStatuses(host: Partial<RentalHost>): {
  p2p: {
    exists: boolean
    status: string | null
    provider: string | null
    policyNumber: string | null
    expires: Date | null
  }
  commercial: {
    exists: boolean
    status: string | null
    provider: string | null
    policyNumber: string | null
    expires: Date | null
  }
} {
  // Handle legacy P2P fields
  const p2pProvider = host.usingLegacyInsurance 
    ? host.hostInsuranceProvider 
    : host.p2pInsuranceProvider
  
  const p2pStatus = host.usingLegacyInsurance
    ? host.hostInsuranceStatus
    : host.p2pInsuranceStatus
    
  const p2pPolicy = host.usingLegacyInsurance
    ? host.hostPolicyNumber
    : host.p2pPolicyNumber
    
  const p2pExpires = host.usingLegacyInsurance
    ? host.hostInsuranceExpires
    : host.p2pInsuranceExpires
  
  return {
    p2p: {
      exists: !!p2pProvider,
      status: p2pStatus || null,
      provider: p2pProvider || null,
      policyNumber: p2pPolicy || null,
      expires: p2pExpires ? new Date(p2pExpires) : null
    },
    commercial: {
      exists: !!host.commercialInsuranceProvider,
      status: host.commercialInsuranceStatus || null,
      provider: host.commercialInsuranceProvider || null,
      policyNumber: host.commercialPolicyNumber || null,
      expires: host.commercialInsuranceExpires ? new Date(host.commercialInsuranceExpires) : null
    }
  }
}