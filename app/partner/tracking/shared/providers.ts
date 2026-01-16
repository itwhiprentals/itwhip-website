// app/partner/tracking/shared/providers.ts
// Provider data, capabilities, and feature definitions
// Single source of truth for all tracking provider information

import {
  IoLocationOutline,
  IoLockClosedOutline,
  IoPowerOutline,
  IoSnowOutline,
  IoEllipseOutline,
  IoSpeedometerOutline,
  IoVolumeHighOutline
} from 'react-icons/io5'

import type {
  ProviderFeature,
  ProviderCapability,
  ITWhipPlusConfig,
  FeatureId,
  ProviderId,
  AlertProviderSupport,
  FeatureAvailability
} from './types'

// ============================================================================
// Provider Features - Feature showcase data
// ============================================================================

/**
 * All tracking features with their provider support
 * Used for feature cards, demo modals, and capability displays
 */
export const PROVIDER_FEATURES: ProviderFeature[] = [
  {
    id: 'gps',
    icon: IoLocationOutline,
    label: 'Real-time GPS',
    description: 'Live location updates every 10 seconds',
    providers: ['Bouncie', 'Smartcar', 'Zubie', 'MooveTrax', 'Trackimo'],
    color: 'blue'
  },
  {
    id: 'lock',
    icon: IoLockClosedOutline,
    label: 'Lock/Unlock',
    description: 'Remote door lock control',
    providers: ['Smartcar', 'MooveTrax'],
    color: 'green'
  },
  {
    id: 'start',
    icon: IoPowerOutline,
    label: 'Remote Start',
    description: 'Start engine remotely',
    providers: ['Smartcar', 'MooveTrax'],
    color: 'purple'
  },
  {
    id: 'precool',
    icon: IoSnowOutline,
    label: 'MaxAC™',
    description: 'Climate preconditioning before pickup',
    providers: ['Smartcar'],
    color: 'cyan'
  },
  {
    id: 'geofence',
    icon: IoEllipseOutline,
    label: 'Geofencing',
    description: 'Enhanced boundary alerts via ItWhip+',
    providers: ['Bouncie', 'Smartcar', 'Zubie', 'MooveTrax', 'Trackimo', 'ItWhip+'],
    color: 'yellow'
  },
  {
    id: 'speed',
    icon: IoSpeedometerOutline,
    label: 'Speed Alerts',
    description: 'Notifications for speeding',
    providers: ['Bouncie', 'Zubie', 'MooveTrax', 'Trackimo'],
    color: 'red'
  },
  // NOTE: Kill Switch removed from feature showcase - it's NOT available via ItWhip+
  // Hosts who need kill switch should use MooveTrax directly (listed in "Other Provider Options")
  // The feature still exists in provider capabilities data for reference
  {
    id: 'honk',
    icon: IoVolumeHighOutline,
    label: 'Honk Horn',
    description: 'Locate car in parking lot',
    providers: ['Smartcar', 'MooveTrax'],
    color: 'yellow'
  },
  {
    id: 'mileage',
    icon: IoSpeedometerOutline,
    label: 'Mileage Forensics™',
    description: 'Cross-verify OBD vs GPS mileage',
    providers: ['ItWhip+'],
    color: 'orange'
  }
]

// ============================================================================
// Provider Capabilities - Detailed provider information
// ============================================================================

/**
 * Comprehensive provider capability definitions
 * Research-based data from industry analysis (January 2025)
 */
export const PROVIDER_CAPABILITIES: ProviderCapability[] = [
  {
    id: 'bouncie',
    name: 'Bouncie',
    monthlyPrice: '$8/mo',
    website: 'https://bouncie.com',
    apiDocsUrl: 'https://docs.bouncie.dev',
    description: 'Popular OBD-II GPS tracker with 15-second updates and comprehensive trip history.',
    deviceType: 'obd',
    isPrimary: true,
    apiCost: 'FREE', // Bouncie API is free via OAuth2
    features: {
      gps: true,
      lock: false,
      start: false,
      precool: false,
      geofence: true,
      speed: true,
      killswitch: false,
      honk: false
    },
    strengths: [
      '1-second GPS updates during trips',
      'Comprehensive trip history and replay',
      'Unlimited geo-zones',
      'DTC code reading',
      'FREE API for ItWhip integration'
    ],
    limitations: [
      'No remote vehicle control',
      'OBD-II port required',
      'Cellular coverage dependent'
    ]
  },
  {
    id: 'smartcar',
    name: 'Smartcar',
    monthlyPrice: '$1.99/mo',
    pricingNote: 'per vehicle',
    website: 'https://smartcar.com',
    apiDocsUrl: 'https://smartcar.com/docs',
    description: 'API platform connecting to 39+ car brands through existing vehicle telematics.',
    deviceType: 'api',
    isPrimary: true,
    apiCost: '$1.99/vehicle/mo', // Build tier pricing
    features: {
      gps: true,
      lock: true,
      start: true,
      precool: true,
      geofence: true,
      speed: false,
      killswitch: false,
      honk: true
    },
    strengths: [
      'No hardware required - uses built-in car connectivity',
      'Supports 39+ car brands (2015+)',
      'Full climate control for EVs',
      'OAuth2 secure consent flow',
      'Lock/unlock and remote start'
    ],
    limitations: [
      'Requires compatible vehicle (2015+)',
      'No speed alerts (no OBD connection)',
      'Vehicle must have active data plan'
    ]
  },
  {
    id: 'zubie',
    name: 'Zubie',
    monthlyPrice: '$15/mo',
    website: 'https://zubie.com',
    description: 'Fleet-focused OBD-II tracker with driver scoring and maintenance alerts.',
    deviceType: 'obd',
    features: {
      gps: true,
      lock: false,
      start: false,
      precool: false,
      geofence: true,
      speed: true,
      killswitch: false,
      honk: false
    },
    strengths: [
      'Always-on tracking with detailed maps',
      'Driver behavior scoring',
      'Instant alerts for speeding/harsh driving',
      'Predictive maintenance alerts',
      'Fleet management features'
    ],
    limitations: [
      'No remote vehicle control',
      'Higher monthly cost than Bouncie',
      'OBD-II port required'
    ]
  },
  {
    id: 'moovetrax',
    name: 'MooveTrax',
    monthlyPrice: '$12/mo',
    website: 'https://moovetrax.com',
    description: 'Advanced GPS tracker with kill switch. No ItWhip+ integration - use MooveTrax app separately.',
    deviceType: 'hybrid',
    hasApiIntegration: false, // No public API - standalone only
    features: {
      gps: true,
      lock: true,
      start: true,
      precool: false,
      geofence: true,
      speed: true,
      killswitch: true,
      honk: true
    },
    strengths: [
      'Kill switch / starter interrupt',
      'Bluetooth proximity auto-lock',
      'Tamper detection',
      'Worldwide coverage with auto network switching',
      'Remote lock/unlock and horn'
    ],
    limitations: [
      'No ItWhip+ integration - use MooveTrax app',
      'Requires professional installation for kill switch',
      'No climate control',
      'Hardware relay installation needed'
    ]
  },
  {
    id: 'trackimo',
    name: 'Trackimo',
    monthlyPrice: '$10/mo',
    website: 'https://trackimo.com',
    description: 'Portable GPS tracker with multiple locating technologies. No ItWhip integration - use Trackimo app separately.',
    deviceType: 'gps-tracker',
    hasApiIntegration: false, // No API available - standalone only
    affiliateUrl: 'https://trackimo.com/become-affiliate/',
    affiliateCommission: '20%', // 7-day cookie via Affiliatly.com
    features: {
      gps: true,
      lock: false,
      start: false,
      precool: false,
      geofence: true,
      speed: true,
      killswitch: false,
      honk: false
    },
    strengths: [
      'GPS + Wi-Fi + Bluetooth + GSM triangulation',
      'Portable - can be hidden anywhere',
      'Customizable speed thresholds',
      'Multi-channel alerts (SMS, email, push)',
      'Works without OBD port',
      'Bulk pricing available at tracki.com'
    ],
    limitations: [
      'No ItWhip integration - use Trackimo app separately',
      'No API available for dashboard unification',
      'No remote vehicle control',
      'Battery or wired power required',
      'No engine data access'
    ]
  }
]

// ============================================================================
// ItWhip+ Configuration
// ============================================================================

/**
 * ItWhip+ service - fills gaps between providers
 * Pricing undercuts FleetBold ($8.99) by 44%
 */
export const ITWHIP_PLUS: ITWhipPlusConfig = {
  name: 'ItWhip+',
  monthlyPrice: '$4.99/mo',
  description: 'Unified dashboard with Mileage Forensics™ cross-verification.',
  valueProposition: 'Combines Bouncie + Smartcar into one powerful dashboard.',
  features: {
    gps: true,
    lock: true,
    start: true,
    precool: true,
    geofence: true,
    speed: true,
    killswitch: false, // Requires MooveTrax hardware - not available via ItWhip+
    honk: true,
    mileage: true // Exclusive to ItWhip+
  },
  benefits: [
    'Mileage Forensics™ - Cross-verify OBD odometer vs GPS trips',
    'Unified dashboard for Bouncie + Smartcar',
    'All 8 core features from two providers',
    'Smart alerts aggregated from all sources',
    'Trip reports for insurance & disputes'
  ]
}

// ============================================================================
// Alert Provider Support
// ============================================================================

/**
 * Which providers support each alert type
 */
export const ALERT_PROVIDER_SUPPORT: Record<string, AlertProviderSupport> = {
  speed: {
    providers: ['Bouncie', 'Zubie', 'MooveTrax', 'Trackimo'],
    description: 'Real-time speed monitoring with customizable thresholds'
  },
  geofence: {
    providers: ['Bouncie', 'Smartcar', 'Zubie', 'MooveTrax', 'Trackimo'],
    description: 'Virtual boundary alerts when vehicle enters/exits zones'
  },
  temp: {
    providers: ['Smartcar', 'MooveTrax'],
    description: 'Interior temperature monitoring for climate control'
  },
  killswitch: {
    providers: ['MooveTrax'],
    description: 'Remote vehicle disable for theft prevention'
  },
  lock: {
    providers: ['Smartcar', 'MooveTrax'],
    description: 'Door lock/unlock status and remote control'
  },
  start: {
    providers: ['Smartcar', 'MooveTrax'],
    description: 'Remote engine start capabilities'
  },
  info: {
    providers: ['Bouncie', 'Smartcar', 'Zubie', 'MooveTrax', 'Trackimo'],
    description: 'General vehicle status notifications'
  }
}

/**
 * All providers that support real-time alerts
 */
export const LIVE_ALERT_PROVIDERS = ['Bouncie', 'Smartcar', 'Zubie', 'MooveTrax', 'Trackimo']

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get provider by ID
 */
export function getProvider(id: ProviderId): ProviderCapability | undefined {
  return PROVIDER_CAPABILITIES.find(p => p.id === id)
}

/**
 * Get feature by ID
 */
export function getFeature(id: FeatureId): ProviderFeature | undefined {
  return PROVIDER_FEATURES.find(f => f.id === id)
}

/**
 * Check if a feature is available from selected providers
 */
export function isFeatureAvailable(
  featureId: FeatureId,
  selectedProviders: ProviderId[]
): boolean {
  return selectedProviders.some(providerId => {
    const provider = getProvider(providerId)
    return provider?.features[featureId] ?? false
  })
}

/**
 * Get combined feature availability from multiple providers
 */
export function getCombinedFeatures(selectedProviders: ProviderId[]): FeatureAvailability {
  const combined: FeatureAvailability = {
    gps: false,
    lock: false,
    start: false,
    precool: false,
    geofence: false,
    speed: false,
    killswitch: false,
    honk: false,
    mileage: false // ItWhip+ exclusive - requires both Bouncie + Smartcar
  }

  for (const providerId of selectedProviders) {
    const provider = getProvider(providerId)
    if (provider) {
      for (const featureKey of Object.keys(combined) as FeatureId[]) {
        if (provider.features[featureKey]) {
          combined[featureKey] = true
        }
      }
    }
  }

  // Mileage Forensics™ is enabled when both Bouncie and Smartcar are connected
  if (selectedProviders.includes('bouncie') && selectedProviders.includes('smartcar')) {
    combined.mileage = true
  }

  return combined
}

/**
 * Get features that ItWhip+ would add on top of selected providers
 */
export function getITWhipPlusAddedFeatures(
  selectedProviders: ProviderId[]
): FeatureId[] {
  const combined = getCombinedFeatures(selectedProviders)
  const addedFeatures: FeatureId[] = []

  for (const featureKey of Object.keys(ITWHIP_PLUS.features) as FeatureId[]) {
    if (ITWHIP_PLUS.features[featureKey] && !combined[featureKey]) {
      addedFeatures.push(featureKey)
    }
  }

  return addedFeatures
}

/**
 * Get all providers that support a specific feature
 */
export function getProvidersForFeature(featureId: FeatureId): ProviderCapability[] {
  return PROVIDER_CAPABILITIES.filter(p => p.features[featureId])
}

/**
 * Calculate feature coverage percentage for selected providers
 */
export function getFeatureCoverage(selectedProviders: ProviderId[]): number {
  const combined = getCombinedFeatures(selectedProviders)
  const totalFeatures = Object.keys(combined).length
  const enabledFeatures = Object.values(combined).filter(Boolean).length
  return Math.round((enabledFeatures / totalFeatures) * 100)
}

/**
 * Get feature coverage with ItWhip+ included
 */
export function getFeatureCoverageWithITWhipPlus(
  selectedProviders: ProviderId[]
): number {
  // ItWhip+ provides all features
  return 100
}

/**
 * Get provider recommendations based on desired features
 */
export function getProviderRecommendations(
  desiredFeatures: FeatureId[]
): { provider: ProviderCapability; matchedFeatures: FeatureId[]; missingFeatures: FeatureId[] }[] {
  return PROVIDER_CAPABILITIES.map(provider => {
    const matchedFeatures = desiredFeatures.filter(f => provider.features[f])
    const missingFeatures = desiredFeatures.filter(f => !provider.features[f])
    return { provider, matchedFeatures, missingFeatures }
  }).sort((a, b) => b.matchedFeatures.length - a.matchedFeatures.length)
}

/**
 * Format price for display
 */
export function formatProviderPrice(provider: ProviderCapability): string {
  if (provider.pricingNote) {
    return `${provider.monthlyPrice} (${provider.pricingNote})`
  }
  return provider.monthlyPrice
}

/**
 * Get primary/recommended providers (Bouncie + Smartcar)
 */
export function getPrimaryProviders(): ProviderCapability[] {
  return PROVIDER_CAPABILITIES.filter(p => p.isPrimary)
}

/**
 * Get secondary/alternative providers
 */
export function getSecondaryProviders(): ProviderCapability[] {
  return PROVIDER_CAPABILITIES.filter(p => !p.isPrimary)
}

/**
 * Calculate total monthly cost for the recommended setup
 * Bouncie device ($8) + Smartcar API ($1.99) + ItWhip+ ($4.99) = ~$15/mo
 */
export function getRecommendedSetupCost(): {
  bouncieCost: string
  smartcarCost: string
  itwhipPlusCost: string
  totalCost: string
  competitorPrice: string
  savingsPercent: number
} {
  return {
    bouncieCost: '$8/mo',
    smartcarCost: '$1.99/mo',
    itwhipPlusCost: ITWHIP_PLUS.monthlyPrice,
    totalCost: '~$15/mo',
    competitorPrice: '$8.99/mo (FleetBold)',
    savingsPercent: 44 // ItWhip+ undercuts FleetBold by 44%
  }
}

// ============================================================================
// Mileage Forensics™ Configuration
// ============================================================================

/**
 * Mileage Forensics™ - ItWhip's unique cross-verification feature
 * Cross-verifies OBD odometer readings with GPS trip distances
 */
export const MILEAGE_FORENSICS = {
  name: 'Mileage Forensics™',
  tagline: 'Cross-verify OBD odometer vs GPS trips',
  description: 'Automatically detects discrepancies between reported odometer readings and actual GPS-tracked trip distances. Catches tampering, unreported trips, and billing disputes before they become problems.',
  benefits: [
    'Detect odometer tampering or rollback',
    'Identify unreported personal trips',
    'Auto-generate dispute evidence',
    'Insurance claim documentation',
    'Guest usage verification'
  ],
  requiresProviders: ['bouncie', 'smartcar'] as ProviderId[], // Works best with both
  howItWorks: [
    'Bouncie OBD reads actual odometer from vehicle ECU',
    'Smartcar/GPS tracks trip distances independently',
    'ItWhip+ compares both sources in real-time',
    'Discrepancies flagged with detailed reports'
  ],
  accuracyNote: 'GPS distance may vary ±2% from odometer due to tire wear, calibration, and signal quality. Significant discrepancies (>5%) trigger alerts.'
}

// ============================================================================
// Phoenix Area Demo Data
// ============================================================================

/**
 * Phoenix area coordinates for demo simulations
 */
export const PHOENIX_LOCATIONS = {
  PHOENIX_CENTER: { lat: 33.4484, lng: -112.0740 },
  SCOTTSDALE: { lat: 33.4942, lng: -111.9261 },
  SKY_HARBOR: { lat: 33.4373, lng: -112.0078 },
  TEMPE: { lat: 33.4255, lng: -111.9400 },
  MESA: { lat: 33.4152, lng: -111.8315 },
  GLENDALE: { lat: 33.5387, lng: -112.1859 },
  CHANDLER: { lat: 33.3062, lng: -111.8413 },
  PEORIA: { lat: 33.5806, lng: -112.2374 }
}

/**
 * Generate random coordinates within Phoenix metro area
 */
export function generatePhoenixCoordinates(): { lat: number; lng: number } {
  const { PHOENIX_CENTER } = PHOENIX_LOCATIONS
  // Random offset within ~20 miles
  const latOffset = (Math.random() - 0.5) * 0.4
  const lngOffset = (Math.random() - 0.5) * 0.4
  return {
    lat: PHOENIX_CENTER.lat + latOffset,
    lng: PHOENIX_CENTER.lng + lngOffset
  }
}

/**
 * Generate a realistic route between two points
 */
export function generateRoute(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  points: number = 10
): { lat: number; lng: number }[] {
  const route: { lat: number; lng: number }[] = []
  for (let i = 0; i <= points; i++) {
    const t = i / points
    // Add slight curve to route
    const curve = Math.sin(t * Math.PI) * 0.01
    route.push({
      lat: start.lat + (end.lat - start.lat) * t + curve,
      lng: start.lng + (end.lng - start.lng) * t
    })
  }
  return route
}
