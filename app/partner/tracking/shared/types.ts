// app/partner/tracking/shared/types.ts
// Shared TypeScript interfaces for tracking components
// Used by both /partner/tracking/demo and /partner/dashboard tracking components

import type { IconType } from 'react-icons'

// ============================================================================
// Vehicle Types
// ============================================================================

/**
 * Coordinates for GPS positioning
 */
export interface Coordinates {
  lat: number
  lng: number
}

/**
 * Vehicle status indicators
 */
export type VehicleStatus = 'moving' | 'parked' | 'offline' | 'disabled'

/**
 * Demo vehicle data structure - matches real vehicle data shape
 * for seamless transition between demo and live tracking
 */
export interface DemoVehicle {
  id: string
  make: string
  model: string
  year: number
  licensePlate: string
  vin: string
  status: VehicleStatus
  location: string
  coordinates: Coordinates
  speed: number
  heading: string | null
  lastUpdate: string
  provider: string | null
  guest: {
    name: string
    phone: string
  } | null
  tripStarted: string | null
  tripEndsAt: string | null
  fuelLevel: number
  batteryLevel: number | null
  odometer: number
  isElectric: boolean
  isLocked: boolean
  engineRunning: boolean
  acOn: boolean
  interiorTemp: number
  exteriorTemp: number
  route: Coordinates[]
  isDisabled: boolean
}

/**
 * Simplified vehicle for dashboard card display
 */
export interface DashboardVehicle {
  id: string
  make: string
  model: string
  year: number
  licensePlate: string
  photo: string | null
}

// ============================================================================
// Feature Types
// ============================================================================

/**
 * Feature identifiers for tracking capabilities
 */
export type FeatureId =
  | 'gps'
  | 'lock'
  | 'start'
  | 'precool'
  | 'geofence'
  | 'speed'
  | 'killswitch'
  | 'honk'
  | 'mileage' // ItWhip+ exclusive: Mileage Forensics™

/**
 * Feature definition for showcase cards
 */
export interface ProviderFeature {
  id: FeatureId
  icon: IconType
  label: string
  description: string
  providers: string[]
  color: 'blue' | 'green' | 'purple' | 'cyan' | 'yellow' | 'red' | 'orange'
}

/**
 * Feature availability map for a provider
 */
export interface FeatureAvailability {
  gps: boolean
  lock: boolean
  start: boolean
  precool: boolean
  geofence: boolean
  speed: boolean
  killswitch: boolean
  honk: boolean
  mileage?: boolean // ItWhip+ exclusive: Mileage Forensics™
}

// ============================================================================
// Provider Types
// ============================================================================

/**
 * Provider identifiers
 */
export type ProviderId = 'bouncie' | 'smartcar' | 'zubie' | 'moovetrax' | 'trackimo'

/**
 * Provider capability definition
 */
export interface ProviderCapability {
  id: ProviderId
  name: string
  logo?: string
  monthlyPrice: string
  pricingNote?: string
  website: string
  apiDocsUrl?: string
  description: string
  features: FeatureAvailability
  deviceType: 'obd' | 'api' | 'gps-tracker' | 'hybrid'
  isPrimary?: boolean // Bouncie + Smartcar recommended combo
  apiCost?: string // Cost to ItWhip for API access
  affiliateUrl?: string // Affiliate program URL for commission tracking
  affiliateCommission?: string // Commission rate (e.g., "20%")
  hasApiIntegration?: boolean // Whether ItWhip can integrate via API
  strengths: string[]
  limitations: string[]
}

/**
 * ItWhip+ service definition
 */
export interface ITWhipPlusConfig {
  name: string
  monthlyPrice: string
  description: string
  valueProposition: string
  features: FeatureAvailability
  benefits: string[]
}

// ============================================================================
// Alert Types
// ============================================================================

/**
 * Alert severity levels
 */
export type AlertSeverity = 'info' | 'warning' | 'critical'

/**
 * Alert type categories
 */
export type AlertType = 'speed' | 'geofence' | 'temp' | 'killswitch' | 'info' | 'lock' | 'start'

/**
 * Tracking alert structure
 */
export interface TrackingAlert {
  id: string
  type: AlertType
  message: string
  timestamp: string
  vehicle: string
  severity: AlertSeverity
}

/**
 * Alert provider support definition
 */
export interface AlertProviderSupport {
  providers: string[]
  description: string
}

// ============================================================================
// Geofence Types
// ============================================================================

/**
 * Geofence zone definition
 */
export interface GeofenceZone {
  id: string
  name: string
  center: Coordinates
  radius: number // in miles or km
  color: string
  alertOnEntry?: boolean
  alertOnExit?: boolean
  activeHours?: {
    start: string // HH:mm format
    end: string
  }
}

// ============================================================================
// Demo State Types
// ============================================================================

/**
 * Demo mode configuration
 */
export interface DemoModeConfig {
  selectedProviders: ProviderId[]
  showITWhipPlus: boolean
  animationSpeed: 'slow' | 'normal' | 'fast'
}

/**
 * GPS trail point with timestamp
 */
export interface GpsTrailPoint extends Coordinates {
  time: string
  speed?: number
  accuracy?: number
}

/**
 * Trip data for replay
 */
export interface TripData {
  id: string
  vehicleId: string
  startTime: string
  endTime: string
  startLocation: string
  endLocation: string
  distance: number
  duration: number
  route: GpsTrailPoint[]
  maxSpeed: number
  avgSpeed: number
  alerts: TrackingAlert[]
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Props for feature demo components
 */
export interface FeatureDemoProps {
  vehicle?: DemoVehicle
  onAction?: () => void
  isCompact?: boolean // For dashboard card display
}

/**
 * Props for provider selector component
 */
export interface ProviderSelectorProps {
  selectedProviders: ProviderId[]
  onSelectionChange: (providers: ProviderId[]) => void
  showPricing?: boolean
  className?: string
}

/**
 * Props for feature matrix component
 */
export interface FeatureMatrixProps {
  selectedProviders: ProviderId[]
  onFeatureClick?: (featureId: FeatureId) => void
  showITWhipPlus?: boolean
  className?: string
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Direction heading options
 */
export type HeadingDirection =
  | 'North' | 'NE' | 'East' | 'SE'
  | 'South' | 'SW' | 'West' | 'NW'

/**
 * Map style options
 */
export type MapStyle = 'satellite' | 'roadmap' | 'terrain' | 'dark'

/**
 * Signal strength levels
 */
export type SignalStrength = 'excellent' | 'good' | 'fair' | 'poor' | 'none'

/**
 * Get signal strength from numeric value
 */
export function getSignalStrength(value: number): SignalStrength {
  if (value >= 90) return 'excellent'
  if (value >= 70) return 'good'
  if (value >= 50) return 'fair'
  if (value >= 20) return 'poor'
  return 'none'
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(coords: Coordinates, precision: number = 4): string {
  return `${coords.lat.toFixed(precision)}, ${coords.lng.toFixed(precision)}`
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(from: Coordinates, to: Coordinates): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRadians(to.lat - from.lat)
  const dLng = toRadians(to.lng - from.lng)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Get heading direction from degrees
 */
export function getHeadingDirection(degrees: number): HeadingDirection {
  const directions: HeadingDirection[] = [
    'North', 'NE', 'East', 'SE', 'South', 'SW', 'West', 'NW'
  ]
  const index = Math.round(degrees / 45) % 8
  return directions[index]
}
