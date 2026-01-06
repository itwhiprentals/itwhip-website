// app/lib/constants/declarations.ts

/**
 * DECLARATION-BASED INTEGRITY SYSTEM
 * 
 * This system separates:
 * - EARNINGS TIER (40%, 75%, 90%) - based on HOST'S insurance level
 * - USAGE DECLARATION (Rental/Personal/Business) - what host declares to insurer
 * 
 * Key Innovation: Declaration only affects CLAIMS, not EARNINGS.
 * Earnings are fixed based on insurance type. Misuse only affects claim approval.
 */

export interface DeclarationConfig {
    value: 'Rental' | 'Personal' | 'Business'
    label: string
    maxGap: number // Maximum allowed mileage gap between trips
    criticalGap: number // Threshold for critical violations
    description: string
    insuranceNote: string
    taxImplication: string
    revenueImpact: string
    insuranceBenefit: string
    claimImpact: string
  }
  
  /**
   * DECLARATION CONFIGURATIONS
   * 
   * These are what hosts declare to insurance carriers about how they use their vehicle.
   * The platform verifies actual usage against declared usage using mileage forensics.
   */
  export const DECLARATION_CONFIGS: Record<string, DeclarationConfig> = {
    'Rental': {
      value: 'Rental',
      label: 'Rental Only',
      maxGap: 15, // Max 15 miles between trips (cleaning, inspection, delivery)
      criticalGap: 50, // Over 50 miles = critical violation
      description: 'Vehicle used ONLY for rental business - no personal use',
      insuranceNote: 'Personal use voids coverage. All mileage must be rental-related (cleaning, delivery, inspection only).',
      taxImplication: '100% business deduction eligible - all expenses fully deductible',
      revenueImpact: 'No impact on earnings tier - declaration affects claims only',
      insuranceBenefit: 'Best insurance rates (20-30% cheaper) due to controlled usage',
      claimImpact: 'Non-compliance may result in claim denial during personal use periods'
    },
    'Personal': {
      value: 'Personal',
      label: 'Rental + Personal',
      maxGap: 500, // Max 500 miles between trips (allows personal driving)
      criticalGap: 1000, // Over 1000 miles = critical violation
      description: 'Mixed use - vehicle used for both rentals AND personal driving',
      insuranceNote: 'Coverage applies to both rental and personal use up to 500 miles between rentals. Personal use is expected and insured.',
      taxImplication: 'Partial business deduction based on rental vs personal mileage ratio',
      revenueImpact: 'No impact on earnings tier - declaration affects claims only',
      insuranceBenefit: 'Standard P2P insurance rates',
      claimImpact: 'Non-compliance (>500 mi gaps) may trigger additional claim scrutiny'
    },
    'Business': {
      value: 'Business',
      label: 'Commercial Use',
      maxGap: 300, // Max 300 miles between trips (business errands allowed)
      criticalGap: 750, // Over 750 miles = critical violation
      description: 'Commercial business use - rentals plus business operations',
      insuranceNote: 'Business mileage allowed for car maintenance, cleaning, delivery, and documented business operations between rentals.',
      taxImplication: '100% business deduction for all documented business miles',
      revenueImpact: 'No impact on earnings tier - declaration affects claims only',
      insuranceBenefit: 'Commercial insurance rates with business use coverage',
      claimImpact: 'Non-compliance may result in claim denial if business use not documented'
    }
  }
  
  /**
   * EARNINGS TIERS (Separate from Declaration)
   * 
   * Based on HOST'S INSURANCE LEVEL - NOT declaration
   * These percentages are FIXED and never change based on usage.
   */
  export const EARNINGS_TIERS = {
    BASIC: {
      percentage: 40,
      label: '40% Tier',
      description: 'Platform Insurance Only',
      insuranceType: 'none',
      primaryCoverage: 'Platform insurance',
      hostInsurance: 'None',
      notes: 'Platform insurance handles all claims as primary coverage'
    },
    STANDARD: {
      percentage: 75,
      label: '75% Tier',
      description: 'P2P Insurance',
      insuranceType: 'p2p',
      primaryCoverage: 'Host P2P insurance',
      hostInsurance: 'Personal P2P policy',
      notes: "Host's P2P insurance is primary, platform is backup"
    },
    PREMIUM: {
      percentage: 90,
      label: '90% Tier',
      description: 'Commercial Insurance',
      insuranceType: 'commercial',
      primaryCoverage: 'Host commercial insurance',
      hostInsurance: 'Commercial policy',
      notes: "Host's commercial insurance is primary, platform is backup"
    }
  } as const
  
  /**
   * SEVERITY LEVELS for Mileage Gaps
   */
  export type SeverityLevel = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'VIOLATION'
  
  export interface SeverityConfig {
    level: SeverityLevel
    color: string
    textColor: string
    bgColor: string
    borderColor: string
    icon: string
    message: string
  }
  
  /**
   * Get declaration configuration by type
   */
  export function getDeclarationConfig(declarationType: string): DeclarationConfig {
    return DECLARATION_CONFIGS[declarationType] || DECLARATION_CONFIGS['Rental']
  }
  
  /**
   * Get earnings tier info by insurance type
   */
  export function getEarningsTierInfo(insuranceType: string) {
    if (insuranceType === 'commercial') return EARNINGS_TIERS.PREMIUM
    if (insuranceType === 'p2p') return EARNINGS_TIERS.STANDARD
    return EARNINGS_TIERS.BASIC
  }
  
  /**
   * Get earnings tier info by percentage
   */
  export function getEarningsTierByPercentage(percentage: number) {
    if (percentage >= 90) return EARNINGS_TIERS.PREMIUM
    if (percentage >= 75) return EARNINGS_TIERS.STANDARD
    return EARNINGS_TIERS.BASIC
  }
  
  /**
   * CRITICAL BUSINESS RULES
   */
  export const BUSINESS_RULES = {
    // Earnings rules
    EARNINGS_NEVER_CHANGE: 'Earnings tier is fixed based on insurance level and never changes due to usage compliance',
    PAST_EARNINGS_PROTECTED: 'Past payouts are never clawed back regardless of compliance issues',
    
    // Declaration rules
    DECLARATION_CHANGES_ANYTIME: 'Hosts can change their usage declaration at any time without restriction',
    DECLARATION_AFFECTS_CLAIMS_ONLY: 'Declaration compliance only affects claim approval, not earnings',
    
    // Compliance rules
    PLATFORM_IS_NEUTRAL: 'Platform logs truth and provides data to insurers - does not arbitrate coverage',
    OUTSIDE_TRIPS_NOT_COVERED: 'Trip-only insurance - no coverage for use outside of rental trips',
    
    // Integrity scoring
    INTEGRITY_AFFECTS_CLAIMS: 'Low integrity score may slow claim processing or affect approval likelihood',
    INTEGRITY_DOES_NOT_AFFECT_EARNINGS: 'Integrity score does not change past or future booking earnings'
  } as const
  
  /**
   * Helper: Check if gap is compliant for declaration
   */
  export function isGapCompliant(gap: number, declarationType: string): boolean {
    const config = getDeclarationConfig(declarationType)
    return gap <= config.maxGap
  }
  
  /**
   * Helper: Get severity level for gap
   */
  export function getGapSeverity(gap: number, declarationType: string): SeverityLevel {
    const config = getDeclarationConfig(declarationType)
    
    if (gap <= config.maxGap) return 'NORMAL'
    if (gap <= config.criticalGap) return 'WARNING'
    if (gap <= config.criticalGap * 2) return 'CRITICAL'
    return 'VIOLATION'
  }
  
  /**
   * Helper: Get recommendation based on usage pattern
   */
  export function getDeclarationRecommendation(
    currentDeclaration: string,
    averageGap: number
  ): string | null {
    // If currently "Rental" but avg gap suggests personal use
    if (currentDeclaration === 'Rental' && averageGap > 50) {
      return 'Your average mileage gap suggests personal use. Consider switching to "Rental + Personal" for better compliance and cheaper insurance than getting claims denied.'
    }
    
    // If currently "Personal" but avg gap qualifies for rental-only
    if (currentDeclaration === 'Personal' && averageGap < 15) {
      return 'Your low mileage gaps qualify for "Rental Only" mode, which offers 20-30% better insurance rates.'
    }
    
    // If currently "Business" but excessive gaps
    if (currentDeclaration === 'Business' && averageGap > 500) {
      return 'High mileage gaps detected. Ensure all miles are business-related and properly documented for tax and insurance purposes.'
    }
    
    return null
  }