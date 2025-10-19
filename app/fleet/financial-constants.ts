// app/fleet/financial-constants.ts

/**
 * Platform-wide financial configuration
 * Controls earnings rates, payouts, insurance, and subscription tiers
 * 
 * ✅ 3-TIER EARNINGS SYSTEM:
 * - BASIC (40%):    No insurance - Platform provides per-trip coverage
 * - STANDARD (75%): P2P Insurance - Host has verified P2P insurance
 * - PREMIUM (90%):  Commercial Insurance - Host has commercial insurance
 */

// ============================================================================
// 3-TIER EARNINGS STRUCTURE (Based on Insurance Type)
// ============================================================================

export const EARNINGS_TIERS = {
  // Tier 1: Basic (No Insurance)
  BASIC: {
    tier: 'BASIC',
    name: 'Basic',
    platformFee: 0.60,              // 60% platform fee
    hostEarnings: 0.40,             // 40% host earnings
    label: 'Earn 40%',
    fullLabel: 'Basic - Earn 40% per booking',
    description: 'Platform insurance included (per-trip coverage)',
    badgeColor: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
    accentColor: 'text-gray-600 dark:text-gray-400',
    nextTier: 'STANDARD',
    nextTierLabel: 'Add P2P Insurance to earn 75%'
  },
  
  // Tier 2: Standard (P2P Insurance)
  STANDARD: {
    tier: 'STANDARD',
    name: 'Standard',
    platformFee: 0.25,              // 25% platform fee
    hostEarnings: 0.75,             // 75% host earnings
    label: 'Earn 75%',
    fullLabel: 'Standard - Earn 75% per booking',
    description: 'Using your verified P2P insurance',
    badgeColor: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    accentColor: 'text-green-600 dark:text-green-400',
    nextTier: 'PREMIUM',
    nextTierLabel: 'Add Commercial Insurance to earn 90%'
  },
  
  // Tier 3: Premium (Commercial Insurance)
  PREMIUM: {
    tier: 'PREMIUM',
    name: 'Premium',
    platformFee: 0.10,              // 10% platform fee
    hostEarnings: 0.90,             // 90% host earnings
    label: 'Earn 90%',
    fullLabel: 'Premium - Earn 90% per booking',
    description: 'Using verified commercial insurance',
    badgeColor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
    accentColor: 'text-purple-600 dark:text-purple-400',
    nextTier: null,
    nextTierLabel: 'Maximum earnings tier!'
  },
  
  // Legacy/Chauffeur services (different model)
  CHAUFFEUR: {
    tier: 'CHAUFFEUR',
    name: 'Chauffeur',
    platformFee: 0.40,              // 40% platform fee
    driverEarnings: 0.60,           // 60% driver earnings
    label: 'Earn 60%',
    fullLabel: 'Chauffeur - Earn 60% per ride',
    description: 'Chauffeur services with driver + vehicle',
    badgeColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
    accentColor: 'text-blue-600 dark:text-blue-400',
    nextTier: null,
    nextTierLabel: null
  }
}

// ============================================================================
// LEGACY PLATFORM FEE (For Backward Compatibility)
// ============================================================================

export const PLATFORM_FEE = {
  WITH_OWN_INSURANCE: EARNINGS_TIERS.STANDARD,
  WITH_PLATFORM_INSURANCE: EARNINGS_TIERS.BASIC,
  CHAUFFEUR: EARNINGS_TIERS.CHAUFFEUR
}

// ============================================================================
// PAYOUT CONFIGURATION
// ============================================================================

export const PAYOUT_CONFIG = {
  STANDARD_DELAY_DAYS: 3,             // 3 days after trip completion
  NEW_HOST_HOLD_DAYS: 7,              // 7 days for new hosts
  MINIMUM_PAYOUT_AMOUNT: 50,          // $50 minimum
  
  // Processing fees charged to hosts (includes markup)
  PROCESSING_FEE_PERCENT: 0.035,      // 3.5%
  PROCESSING_FEE_FIXED: 0.50,         // $0.50 per transaction
  
  // Actual payment processor costs (Stripe)
  ACTUAL_PROCESSING_PERCENT: 0.029,   // 2.9%
  ACTUAL_PROCESSING_FIXED: 0.30,      // $0.30
  
  // Our markup on processing fees
  PROCESSING_FEE_MARKUP_PERCENT: 0.006, // 0.6%
  PROCESSING_FEE_MARKUP_FIXED: 0.20,    // $0.20
  
  // Instant payout option
  INSTANT_PAYOUT_FEE: 25,            // Extra $25 for same-day
  INSTANT_PAYOUT_AVAILABLE: false,    // Feature flag
  
  // Payout methods
  SUPPORTED_METHODS: ['bank_account', 'debit_card'],
  DEFAULT_METHOD: 'bank_account',
}

// ============================================================================
// INSURANCE TIERS (Per-Trip Coverage for Basic Tier Hosts)
// ============================================================================

export const PLATFORM_INSURANCE_TIERS = {
  BASIC: {
    name: 'Basic Coverage',
    guestDeductible: 2500,
    dailyRate: 25,                    // Guest pays $25/day for insurance
    liabilityCoverage: 750000,        // $750k liability
    collisionCoverage: 'Actual Cash Value',
    description: 'State minimum liability + collision',
    includedInHostEarnings: false     // Insurance cost separate
  },
  STANDARD: {
    name: 'Standard Coverage',
    guestDeductible: 1000,
    dailyRate: 45,                    // Guest pays $45/day
    liabilityCoverage: 1000000,       // $1M liability
    collisionCoverage: 'Replacement Cost',
    description: 'Enhanced liability + full collision',
    includedInHostEarnings: false
  },
  PREMIUM: {
    name: 'Premium Coverage',
    guestDeductible: 500,
    dailyRate: 65,                    // Guest pays $65/day
    liabilityCoverage: 2000000,       // $2M liability
    collisionCoverage: 'Replacement Cost + Diminished Value',
    description: 'Maximum coverage with low deductible',
    includedInHostEarnings: false
  }
}

// ============================================================================
// FLEET MANAGER SUBSCRIPTION TIERS
// ============================================================================

export const FLEET_MANAGER_TIERS = {
  STARTER: {
    name: 'Starter',
    price: 0,                          // First car free
    weeklyPrice: 0,
    maxCars: 1,
    allowedCarTypes: ['SEDAN', 'COMPACT', 'ECONOMY'],
    commissionSelfSourced: 0.35,      // FM gets 35% when they bring booking
    commissionPlatformSourced: 0.05,  // FM gets 5% when platform brings booking
    features: [
      'Basic dashboard',
      'Standard support',
      '1 standard vehicle',
      'Basic analytics'
    ]
  },
  PROFESSIONAL: {
    name: 'Professional',
    price: 19.99,                     // Per week
    weeklyPrice: 19.99,
    maxCars: 2,
    allowedCarTypes: ['SEDAN', 'COMPACT', 'ECONOMY'],
    commissionSelfSourced: 0.35,
    commissionPlatformSourced: 0.05,
    features: [
      'Advanced analytics',
      'Priority support',
      'Up to 2 standard vehicles',
      'Performance insights',
      'Custom booking link'
    ]
  },
  BUSINESS: {
    name: 'Business',
    price: 59.99,                     // Per week
    weeklyPrice: 59.99,
    maxCars: 3,
    allowedCarTypes: ['SEDAN', 'SUV', 'PREMIUM', 'ELECTRIC'],
    commissionSelfSourced: 0.38,      // Slightly higher commission
    commissionPlatformSourced: 0.07,  // Better platform commission too
    features: [
      'API access',
      'Bulk management tools',
      'Dedicated account support',
      'Up to 3 premium vehicles',
      'Revenue optimization tools',
      'White-label booking page'
    ]
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 99.99,                     // Per week
    weeklyPrice: 99.99,
    maxCars: 5,
    allowedCarTypes: ['ALL'],         // Access to all car types
    commissionSelfSourced: 0.40,      // Highest commission
    commissionPlatformSourced: 0.10,  // Best platform commission
    chauffeurRevenueShare: 0.05,      // 5% of chauffeur bookings
    features: [
      'White label platform',
      'Custom integrations',
      'Dedicated account manager',
      'Up to 5 luxury/exotic vehicles',
      'Chauffeur network revenue share',
      'Custom reporting',
      'Priority placement',
      'Bulk import tools'
    ]
  }
}

// ============================================================================
// CHAUFFEUR CONFIGURATION
// ============================================================================

export const CHAUFFEUR_CONFIG = {
  platformFee: 0.40,                 // 40% to platform
  driverEarnings: 0.60,              // 60% to driver
  minimumTripHours: 2,               // Minimum 2-hour booking
  hourlyRateMultiplier: 1.5,         // 1.5x the daily rate / 8 hours
  
  requirements: [
    'Valid CDL or chauffeur license',
    'Commercial insurance',
    'Background check',
    'Drug screening',
    '2+ years professional driving'
  ],
  
  serviceTypes: [
    'Airport transfer',
    'Hourly charter',
    'Event transportation',
    'Corporate travel',
    'Tours'
  ]
}

// ============================================================================
// TIER CALCULATION & HELPERS
// ============================================================================

/**
 * Get earnings tier configuration based on host's insurance status
 * @param earningsTier - Host's earnings tier from database
 * @returns Tier configuration object
 */
export const getTierConfig = (earningsTier: 'BASIC' | 'STANDARD' | 'PREMIUM') => {
  return EARNINGS_TIERS[earningsTier] || EARNINGS_TIERS.BASIC
}

/**
 * ✅ FIXED: Determine host's tier based on insurance status
 * 
 * PRIORITY ORDER:
 * 1. Explicit earningsTier field (if set in database)
 * 2. Commercial insurance status (PREMIUM - 90%)
 * 3. P2P insurance status (STANDARD - 75%)
 * 4. Legacy insurance (STANDARD - 75%) - ONLY if explicitly opted in
 * 5. Default to BASIC (40%) - no insurance
 * 
 * @param host - Host object with insurance fields
 * @returns Earnings tier
 */
export const determineHostTier = (host: {
  earningsTier?: string | null
  usingLegacyInsurance?: boolean | null
  hostInsuranceStatus?: string | null
  p2pInsuranceStatus?: string | null
  commercialInsuranceStatus?: string | null
}): 'BASIC' | 'STANDARD' | 'PREMIUM' => {
  
  // ✅ PRIORITY 1: If host has explicit tier set in database, use it
  if (host.earningsTier && ['BASIC', 'STANDARD', 'PREMIUM'].includes(host.earningsTier)) {
    return host.earningsTier as 'BASIC' | 'STANDARD' | 'PREMIUM'
  }
  
  // ✅ PRIORITY 2: Check commercial insurance first (highest tier - 90%)
  if (host.commercialInsuranceStatus === 'ACTIVE') {
    return 'PREMIUM'
  }
  
  // ✅ PRIORITY 3: Check P2P insurance (middle tier - 75%)
  if (host.p2pInsuranceStatus === 'ACTIVE') {
    return 'STANDARD'
  }
  
  // ✅ PRIORITY 4: Check legacy insurance (backward compatibility)
  // CRITICAL FIX: Check hostInsuranceStatus regardless of usingLegacyInsurance
  // This ensures migrated hosts (with usingLegacyInsurance: false) still get STANDARD tier
  if (host.hostInsuranceStatus === 'ACTIVE') {
    return 'STANDARD'  // 75%
  }
  
  // ✅ PRIORITY 5: Default to BASIC tier (40%) - no insurance
  // This is the correct default for new hosts
  return 'BASIC'
}

/**
 * Calculate host earnings based on tier
 * @param bookingTotal - Total booking amount
 * @param tier - Host's earnings tier
 * @param isNewHost - Is this a new host (affects payout delay)?
 * @returns Breakdown of earnings, fees, and payout schedule
 */
export const calculateHostEarnings = (
  bookingTotal: number,
  tier: 'BASIC' | 'STANDARD' | 'PREMIUM' = 'BASIC',
  isNewHost: boolean = false
) => {
  const tierConfig = getTierConfig(tier)
  
  const platformFee = tierConfig.platformFee
  const platformRevenue = bookingTotal * platformFee
  
  // Calculate processing fees
  const processingFee = (bookingTotal * PAYOUT_CONFIG.PROCESSING_FEE_PERCENT) + PAYOUT_CONFIG.PROCESSING_FEE_FIXED
  
  // Host earnings = Booking total * earnings percentage - Processing fee
  const hostEarnings = (bookingTotal * tierConfig.hostEarnings) - processingFee
  
  // Payout delay
  const payoutDelay = isNewHost 
    ? PAYOUT_CONFIG.NEW_HOST_HOLD_DAYS 
    : PAYOUT_CONFIG.STANDARD_DELAY_DAYS
  
  return {
    bookingTotal,
    tier: tierConfig.tier,
    tierName: tierConfig.name,
    platformFee,                       // Percentage (0.10, 0.25, or 0.60)
    platformRevenue,                   // Dollar amount
    processingFee,
    hostEarnings,
    hostEarningsPercentage: tierConfig.hostEarnings, // 0.40, 0.75, or 0.90
    payoutDelay,
    earningsLabel: tierConfig.label,
    tierDescription: tierConfig.description
  }
}

/**
 * Calculate chauffeur earnings
 */
export const calculateChauffeurEarnings = (
  bookingTotal: number,
  hours: number
) => {
  const platformFee = CHAUFFEUR_CONFIG.platformFee
  const platformRevenue = bookingTotal * platformFee
  const driverEarnings = bookingTotal * CHAUFFEUR_CONFIG.driverEarnings
  
  return {
    bookingTotal,
    platformRevenue,
    driverEarnings,
    hourlyRate: driverEarnings / hours,
    hours
  }
}

/**
 * Calculate fleet manager earnings
 */
export const calculateFleetManagerEarnings = (
  bookingTotal: number,
  tier: keyof typeof FLEET_MANAGER_TIERS,
  bookingSource: 'SELF' | 'PLATFORM'
) => {
  const tierConfig = FLEET_MANAGER_TIERS[tier]
  const platformFee = EARNINGS_TIERS.STANDARD.platformFee // Default 25%
  
  const fmCommission = bookingSource === 'SELF' 
    ? tierConfig.commissionSelfSourced 
    : tierConfig.commissionPlatformSourced
  
  const platformRevenue = bookingTotal * platformFee
  const afterPlatform = bookingTotal - platformRevenue
  const fleetManagerEarnings = afterPlatform * fmCommission
  const ownerEarnings = afterPlatform - fleetManagerEarnings
  
  return {
    bookingTotal,
    platformRevenue,
    fleetManagerEarnings,
    ownerEarnings,
    fleetManagerCommission: fmCommission
  }
}

/**
 * Get tier comparison data for UI display
 */
export const getTierComparison = () => {
  return [
    {
      ...EARNINGS_TIERS.BASIC,
      order: 1,
      insuranceRequired: 'None',
      insuranceType: 'Platform provides per-trip coverage'
    },
    {
      ...EARNINGS_TIERS.STANDARD,
      order: 2,
      insuranceRequired: 'P2P Insurance',
      insuranceType: 'Your verified P2P car sharing insurance'
    },
    {
      ...EARNINGS_TIERS.PREMIUM,
      order: 3,
      insuranceRequired: 'Commercial Insurance',
      insuranceType: 'Your verified commercial auto insurance'
    }
  ]
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

export const SUBSCRIPTION_CONFIG = {
  gracePeriodHours: 24,              // 24-hour grace period
  autoRenewal: true,                 // Default to auto-renewal
  
  // Protected earnings: If booking made during active subscription,
  // earnings are protected even if subscription lapses before trip
  protectActiveBookings: true,
  
  // Billing
  billingCycle: 'WEEKLY',
  paymentMethods: ['card', 'bank_account'],
  
  // Proration
  allowProration: true,              // Pro-rate when upgrading/downgrading
  refundDowngrades: false,           // No refunds for downgrades
}

// ============================================================================
// EARNING REPORT PERIODS
// ============================================================================

export const REPORT_PERIODS = {
  DAILY: { days: 1, label: 'Daily' },
  WEEKLY: { days: 7, label: 'Weekly' },
  MONTHLY: { days: 30, label: 'Monthly' },
  QUARTERLY: { days: 90, label: 'Quarterly' },
  YEARLY: { days: 365, label: 'Yearly' },
  ALL_TIME: { days: null, label: 'All Time' }
}

// ============================================================================
// PLATFORM FEES AND LIMITS
// ============================================================================

export const PLATFORM_LIMITS = {
  maxDailyRate: 5000,                // $5,000 max daily rate
  minDailyRate: 25,                  // $25 minimum daily rate
  maxTripDuration: 30,               // 30 days max
  minTripDuration: 1,                // 1 day minimum
  maxPhotosPerCar: 20,               // 20 photos max
  maxCarsPerHost: 10,                // 10 cars max for individual hosts
  maxFleetManagerCars: 5,            // Per subscription tier
}

// ============================================================================
// REVENUE DISTRIBUTION PRIORITY
// ============================================================================

export const REVENUE_PRIORITY = {
  // Order of payment distribution
  1: 'PROCESSING_FEES',              // Payment processor gets paid first
  2: 'PLATFORM_FEE',                 // Platform fee second (10%, 25%, or 60%)
  3: 'FLEET_MANAGER_CUT',           // Fleet manager (if applicable)
  4: 'HOST_EARNINGS',               // Host gets remainder
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  EARNINGS_TIERS,
  PLATFORM_FEE,
  PAYOUT_CONFIG,
  PLATFORM_INSURANCE_TIERS,
  FLEET_MANAGER_TIERS,
  CHAUFFEUR_CONFIG,
  SUBSCRIPTION_CONFIG,
  REPORT_PERIODS,
  PLATFORM_LIMITS,
  REVENUE_PRIORITY,
  getTierConfig,
  determineHostTier,
  calculateHostEarnings,
  calculateChauffeurEarnings,
  calculateFleetManagerEarnings,
  getTierComparison
}