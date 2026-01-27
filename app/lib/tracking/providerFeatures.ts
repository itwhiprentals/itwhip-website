// app/lib/tracking/providerFeatures.ts
// Provider feature configuration for vehicle tracking integration
// Reference: SMARTCAR_AUDIT.md and Bouncie OBD device capabilities

export type ProviderType = 'smartcar' | 'bouncie' | 'itwhip_plus'

export interface TrackingFeature {
  id: string
  name: string
  description: string
  icon: string // Icon name from react-icons/io5
  category: 'location' | 'vehicle_data' | 'control' | 'safety' | 'diagnostics'
  providers: ProviderType[]
  requiresHardware: boolean
  isPremium: boolean
  apiEndpoint?: string
  scopes?: string[] // Smartcar scopes required
}

// Complete feature catalog
export const TRACKING_FEATURES: TrackingFeature[] = [
  // ============================================
  // LOCATION FEATURES
  // ============================================
  {
    id: 'gps_location',
    name: 'GPS Location',
    description: 'View vehicle location on map',
    icon: 'IoLocationOutline',
    category: 'location',
    providers: ['smartcar', 'bouncie', 'itwhip_plus'],
    requiresHardware: false,
    isPremium: false,
    apiEndpoint: '/vehicles/{id}/location',
    scopes: ['read_location']
  },
  {
    id: 'location_history',
    name: 'Location History',
    description: 'View past trip routes and stops',
    icon: 'IoTimeOutline',
    category: 'location',
    providers: ['bouncie', 'itwhip_plus'],
    requiresHardware: true,
    isPremium: false
  },
  {
    id: 'geofencing',
    name: 'Geofencing',
    description: 'Set geographic boundaries with alerts',
    icon: 'IoRadioOutline',
    category: 'location',
    providers: ['bouncie', 'itwhip_plus'],
    requiresHardware: true,
    isPremium: false
  },
  {
    id: 'realtime_tracking',
    name: 'Real-Time Tracking',
    description: 'Live location updates every 15 seconds',
    icon: 'IoNavigateOutline',
    category: 'location',
    providers: ['bouncie', 'itwhip_plus'],
    requiresHardware: true,
    isPremium: false
  },

  // ============================================
  // VEHICLE DATA FEATURES
  // ============================================
  {
    id: 'vehicle_info',
    name: 'Vehicle Info',
    description: 'Make, model, year, and VIN',
    icon: 'IoCarOutline',
    category: 'vehicle_data',
    providers: ['smartcar', 'bouncie', 'itwhip_plus'],
    requiresHardware: false,
    isPremium: false,
    apiEndpoint: '/vehicles/{id}',
    scopes: ['read_vehicle_info', 'read_vin']
  },
  {
    id: 'odometer',
    name: 'Odometer',
    description: 'Current mileage reading',
    icon: 'IoSpeedometerOutline',
    category: 'vehicle_data',
    providers: ['smartcar', 'bouncie', 'itwhip_plus'],
    requiresHardware: false,
    isPremium: false,
    apiEndpoint: '/vehicles/{id}/odometer',
    scopes: ['read_odometer']
  },
  {
    id: 'fuel_level',
    name: 'Fuel Level',
    description: 'Fuel tank percentage (ICE vehicles)',
    icon: 'IoWaterOutline',
    category: 'vehicle_data',
    providers: ['smartcar', 'bouncie', 'itwhip_plus'],
    requiresHardware: false,
    isPremium: false,
    apiEndpoint: '/vehicles/{id}/fuel',
    scopes: ['read_fuel']
  },
  {
    id: 'battery_level',
    name: 'Battery Level',
    description: 'Battery state of charge (EVs)',
    icon: 'IoBatteryChargingOutline',
    category: 'vehicle_data',
    providers: ['smartcar', 'itwhip_plus'],
    requiresHardware: false,
    isPremium: false,
    apiEndpoint: '/vehicles/{id}/battery',
    scopes: ['read_battery']
  },
  {
    id: 'charging_status',
    name: 'Charging Status',
    description: 'EV charging state and progress',
    icon: 'IoFlashOutline',
    category: 'vehicle_data',
    providers: ['smartcar', 'itwhip_plus'],
    requiresHardware: false,
    isPremium: false,
    apiEndpoint: '/vehicles/{id}/charge',
    scopes: ['read_charge']
  },
  {
    id: 'tire_pressure',
    name: 'Tire Pressure',
    description: 'Individual tire pressure readings',
    icon: 'IoEllipseOutline',
    category: 'vehicle_data',
    providers: ['smartcar', 'itwhip_plus'],
    requiresHardware: false,
    isPremium: false,
    apiEndpoint: '/vehicles/{id}/tires/pressure',
    scopes: ['read_tires']
  },
  {
    id: 'oil_life',
    name: 'Oil Life',
    description: 'Engine oil life remaining',
    icon: 'IoWaterOutline',
    category: 'vehicle_data',
    providers: ['smartcar', 'itwhip_plus'],
    requiresHardware: false,
    isPremium: false,
    apiEndpoint: '/vehicles/{id}/engine/oil',
    scopes: ['read_engine_oil']
  },

  // ============================================
  // CONTROL FEATURES
  // ============================================
  {
    id: 'lock_unlock',
    name: 'Lock/Unlock',
    description: 'Remote door lock control',
    icon: 'IoLockClosedOutline',
    category: 'control',
    providers: ['smartcar', 'itwhip_plus'],
    requiresHardware: false,
    isPremium: true,
    apiEndpoint: '/vehicles/{id}/security',
    scopes: ['control_security']
  },
  {
    id: 'start_charging',
    name: 'Start/Stop Charging',
    description: 'Control EV charging remotely',
    icon: 'IoFlashOutline',
    category: 'control',
    providers: ['smartcar', 'itwhip_plus'],
    requiresHardware: false,
    isPremium: true,
    apiEndpoint: '/vehicles/{id}/charge',
    scopes: ['control_charge']
  },
  {
    id: 'engine_start',
    name: 'Remote Start',
    description: 'Start/stop engine remotely',
    icon: 'IoPowerOutline',
    category: 'control',
    providers: ['bouncie', 'itwhip_plus'],
    requiresHardware: true,
    isPremium: true
  },
  {
    id: 'climate_control',
    name: 'Climate Control',
    description: 'Pre-heat or pre-cool vehicle',
    icon: 'IoSnowOutline',
    category: 'control',
    providers: ['bouncie', 'itwhip_plus'],
    requiresHardware: true,
    isPremium: true
  },
  {
    id: 'horn_lights',
    name: 'Horn & Lights',
    description: 'Activate horn and flash lights',
    icon: 'IoVolumeHighOutline',
    category: 'control',
    providers: ['bouncie', 'itwhip_plus'],
    requiresHardware: true,
    isPremium: false
  },
  {
    id: 'kill_switch',
    name: 'Kill Switch',
    description: 'Disable engine start (anti-theft)',
    icon: 'IoBanOutline',
    category: 'control',
    providers: ['bouncie', 'itwhip_plus'],
    requiresHardware: true,
    isPremium: true
  },

  // ============================================
  // SAFETY FEATURES
  // ============================================
  {
    id: 'speed_alerts',
    name: 'Speed Alerts',
    description: 'Notifications when speed limit exceeded',
    icon: 'IoAlertCircleOutline',
    category: 'safety',
    providers: ['bouncie', 'itwhip_plus'],
    requiresHardware: true,
    isPremium: false
  },
  {
    id: 'harsh_driving',
    name: 'Harsh Driving Alerts',
    description: 'Detect hard braking and acceleration',
    icon: 'IoWarningOutline',
    category: 'safety',
    providers: ['bouncie', 'itwhip_plus'],
    requiresHardware: true,
    isPremium: false
  },
  {
    id: 'crash_detection',
    name: 'Crash Detection',
    description: 'Automatic accident detection and alerts',
    icon: 'IoMedkitOutline',
    category: 'safety',
    providers: ['bouncie', 'itwhip_plus'],
    requiresHardware: true,
    isPremium: true
  },
  {
    id: 'curfew_alerts',
    name: 'Curfew Alerts',
    description: 'Notifications for after-hours usage',
    icon: 'IoMoonOutline',
    category: 'safety',
    providers: ['bouncie', 'itwhip_plus'],
    requiresHardware: true,
    isPremium: false
  },
  {
    id: 'low_battery_alert',
    name: 'Low Battery Alert',
    description: 'Vehicle battery health monitoring',
    icon: 'IoBatteryDeadOutline',
    category: 'safety',
    providers: ['bouncie', 'itwhip_plus'],
    requiresHardware: true,
    isPremium: false
  },

  // ============================================
  // DIAGNOSTICS FEATURES
  // ============================================
  {
    id: 'dtc_codes',
    name: 'Diagnostic Codes',
    description: 'Read engine diagnostic trouble codes',
    icon: 'IoConstructOutline',
    category: 'diagnostics',
    providers: ['bouncie', 'itwhip_plus'],
    requiresHardware: true,
    isPremium: false
  },
  {
    id: 'maintenance_alerts',
    name: 'Maintenance Alerts',
    description: 'Oil change and service reminders',
    icon: 'IoCalendarOutline',
    category: 'diagnostics',
    providers: ['bouncie', 'itwhip_plus'],
    requiresHardware: true,
    isPremium: false
  },
  {
    id: 'trip_history',
    name: 'Trip History',
    description: 'Detailed logs of all trips taken',
    icon: 'IoListOutline',
    category: 'diagnostics',
    providers: ['bouncie', 'itwhip_plus'],
    requiresHardware: true,
    isPremium: false
  },
  {
    id: 'idle_time',
    name: 'Idle Time Tracking',
    description: 'Monitor engine idle duration',
    icon: 'IoHourglassOutline',
    category: 'diagnostics',
    providers: ['bouncie', 'itwhip_plus'],
    requiresHardware: true,
    isPremium: false
  }
]

// Provider metadata
export const PROVIDERS = {
  smartcar: {
    id: 'smartcar',
    name: 'Smartcar',
    tagline: 'API-Only Integration',
    description: 'Connect vehicles via manufacturer accounts. No hardware required.',
    logo: '/images/providers/smartcar.svg',
    color: '#1A56DB',
    requiresHardware: false,
    setupTime: 'Instant',
    monthlyFee: null,
    supportedBrands: 37,
    features: TRACKING_FEATURES.filter(f => f.providers.includes('smartcar'))
  },
  bouncie: {
    id: 'bouncie',
    name: 'Bouncie',
    tagline: 'OBD Device Integration',
    description: 'Plug-in OBD device for real-time tracking and advanced diagnostics.',
    logo: '/images/providers/bouncie.svg',
    color: '#059669',
    requiresHardware: true,
    setupTime: '3-5 days (shipping)',
    monthlyFee: '$8.35/month per device (fleet)',
    deviceCost: '$89.99 one-time',
    supportedBrands: 'Any OBD-II vehicle (1996+)',
    features: TRACKING_FEATURES.filter(f => f.providers.includes('bouncie'))
  },
  itwhip_plus: {
    id: 'itwhip_plus',
    name: 'ItWhip+',
    tagline: 'Complete Fleet Solution',
    description: 'Combine Smartcar and Bouncie for the ultimate tracking experience.',
    logo: '/images/itwhip-logo.svg',
    color: '#7C3AED',
    requiresHardware: 'Optional',
    setupTime: 'Varies',
    monthlyFee: 'Custom pricing',
    supportedBrands: 'All vehicles',
    features: TRACKING_FEATURES.filter(f => f.providers.includes('itwhip_plus'))
  }
}

// Helper functions
export function getFeaturesByProvider(provider: ProviderType): TrackingFeature[] {
  return TRACKING_FEATURES.filter(f => f.providers.includes(provider))
}

export function getFeaturesByCategory(category: TrackingFeature['category']): TrackingFeature[] {
  return TRACKING_FEATURES.filter(f => f.category === category)
}

export function getProviderExclusiveFeatures(provider: ProviderType): TrackingFeature[] {
  // Features only this provider has (not shared with others except itwhip_plus)
  return TRACKING_FEATURES.filter(f => {
    const otherProviders = f.providers.filter(p => p !== 'itwhip_plus')
    return otherProviders.length === 1 && otherProviders[0] === provider
  })
}

export function getSmartcarOnlyFeatures(): TrackingFeature[] {
  return getProviderExclusiveFeatures('smartcar')
}

export function getBouncieOnlyFeatures(): TrackingFeature[] {
  return getProviderExclusiveFeatures('bouncie')
}

export function getSharedFeatures(): TrackingFeature[] {
  // Features available from both Smartcar and Bouncie
  return TRACKING_FEATURES.filter(f =>
    f.providers.includes('smartcar') && f.providers.includes('bouncie')
  )
}

// Feature availability summary for UI
export function getProviderFeatureSummary(provider: ProviderType) {
  const features = getFeaturesByProvider(provider)
  return {
    total: features.length,
    location: features.filter(f => f.category === 'location').length,
    vehicle_data: features.filter(f => f.category === 'vehicle_data').length,
    control: features.filter(f => f.category === 'control').length,
    safety: features.filter(f => f.category === 'safety').length,
    diagnostics: features.filter(f => f.category === 'diagnostics').length,
    premium: features.filter(f => f.isPremium).length,
    requiresHardware: features.filter(f => f.requiresHardware).length
  }
}

// What each provider brings to ItWhip+
export const PROVIDER_CONTRIBUTIONS = {
  smartcar: {
    name: 'Smartcar',
    uniqueValue: [
      'No hardware installation required',
      'Instant vehicle connection via OAuth',
      'Direct manufacturer data (most accurate)',
      'EV battery and charging data',
      'Remote lock/unlock capability',
      'Tire pressure monitoring'
    ],
    limitations: [
      'No real-time 15-second updates',
      'No geofencing capability',
      'No speed or harsh driving alerts',
      'No engine start/stop control',
      'No diagnostic trouble codes',
      'Requires compatible connected vehicle'
    ]
  },
  bouncie: {
    name: 'Bouncie',
    uniqueValue: [
      'Real-time GPS tracking (15-second updates)',
      'Works on any OBD-II vehicle (1996+)',
      'Geofencing with unlimited zones',
      'Speed and harsh driving alerts',
      'Diagnostic trouble codes (DTCs)',
      'Crash detection and notification',
      'Remote engine start/stop',
      'Kill switch for anti-theft',
      'Trip history and reporting'
    ],
    limitations: [
      'Requires OBD device installation',
      'Monthly subscription per device',
      'Shipping time for device',
      'May not work with some EVs'
    ]
  }
}
