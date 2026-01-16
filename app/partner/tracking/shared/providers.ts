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
  IoFlashOffOutline,
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
    label: 'Pre-Cool (MaxAC)',
    description: 'Cool car before guest pickup',
    providers: ['Smartcar'],
    color: 'cyan'
  },
  {
    id: 'geofence',
    icon: IoEllipseOutline,
    label: 'Geofencing',
    description: 'Alerts when car leaves area',
    providers: ['Bouncie', 'Smartcar', 'Zubie', 'MooveTrax', 'Trackimo'],
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
  {
    id: 'killswitch',
    icon: IoFlashOffOutline,
    label: 'Kill Switch',
    description: 'Disable vehicle remotely',
    providers: ['MooveTrax'],
    color: 'red'
  },
  {
    id: 'honk',
    icon: IoVolumeHighOutline,
    label: 'Honk Horn',
    description: 'Locate car in parking lot',
    providers: ['Smartcar', 'MooveTrax'],
    color: 'yellow'
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
    description: 'Popular OBD-II GPS tracker with 15-second updates and comprehensive trip history.',
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
      '1-second GPS updates during trips',
      'Comprehensive trip history and replay',
      'Unlimited geo-zones',
      'DTC code reading',
      'Low monthly cost'
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
    monthlyPrice: 'API',
    pricingNote: 'Volume-based pricing',
    website: 'https://smartcar.com',
    description: 'API platform connecting to 39+ car brands through existing vehicle telematics.',
    deviceType: 'api',
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
      'No speed alerts',
      'Vehicle must have active data plan',
      'API pricing can vary'
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
    description: 'Advanced GPS tracker with kill switch capability and worldwide coverage.',
    deviceType: 'hybrid',
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
    description: 'Portable GPS tracker with multiple locating technologies.',
    deviceType: 'gps-tracker',
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
      'Works without OBD port'
    ],
    limitations: [
      'No remote vehicle control',
      'Battery or wired power required',
      'No engine data access'
    ]
  }
]

// ============================================================================
// ITWhip+ Configuration
// ============================================================================

/**
 * ITWhip+ service - fills gaps between providers
 */
export const ITWHIP_PLUS: ITWhipPlusConfig = {
  name: 'ITWhip+',
  monthlyPrice: '$9.99/mo',
  description: 'Extends any provider with missing features through smart aggregation.',
  valueProposition: 'Get ALL features regardless of which tracking provider you use.',
  features: {
    gps: true,
    lock: true,
    start: true,
    precool: true,
    geofence: true,
    speed: true,
    killswitch: true,
    honk: true
  },
  benefits: [
    'Fill feature gaps from any provider',
    'Unified dashboard for all vehicles',
    'Mix providers across your fleet',
    'Smart alerts across all vehicles',
    'Premium support'
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
    honk: false
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

  return combined
}

/**
 * Get features that ITWhip+ would add on top of selected providers
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
 * Get feature coverage with ITWhip+ included
 */
export function getFeatureCoverageWithITWhipPlus(
  selectedProviders: ProviderId[]
): number {
  // ITWhip+ provides all features
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
