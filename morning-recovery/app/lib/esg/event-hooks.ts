// app/lib/esg/event-hooks.ts
/**
 * ESG Event Hooks System
 * Central event emitter and handler for ESG score updates
 */

import { logESGEvent } from './event-logger'
import { triggerESGUpdate } from './auto-update'

// ============================================================================
// EVENT TYPES
// ============================================================================

export type ESGEventType =
  | 'TRIP_COMPLETED'
  | 'CLAIM_FILED'
  | 'CLAIM_APPROVED'
  | 'CLAIM_DENIED'
  | 'VEHICLE_ADDED'
  | 'VEHICLE_REMOVED'
  | 'INSURANCE_UPDATED'
  | 'MAINTENANCE_LOGGED'
  | 'DOCUMENT_VERIFIED'
  | 'MANUAL_REFRESH'

export type ESGEventCategory =
  | 'SAFETY'
  | 'ENVIRONMENTAL'
  | 'COMPLIANCE'
  | 'DRIVING_IMPACT'
  | 'MAINTENANCE'
  | 'ADMINISTRATIVE'

// ============================================================================
// EVENT DATA INTERFACES
// ============================================================================

export interface ESGEventData {
  hostId: string
  eventType: ESGEventType
  category: ESGEventCategory
  description: string
  metadata?: Record<string, any>
  relatedTripId?: string
  relatedClaimId?: string
  relatedBookingId?: string
  triggeredBy?: string
}

export interface TripCompletedData {
  bookingId: string
  bookingCode: string
  carId: string
  startDate: Date
  endDate: Date
  totalMiles?: number
  fuelType: string
  wasIncidentFree: boolean
  guestRating?: number
}

export interface ClaimFiledData {
  claimId: string
  bookingId: string
  carId: string
  claimType: string
  estimatedCost: number
  incidentDate: Date
  description: string
}

export interface VehicleAddedData {
  carId: string
  make: string
  model: string
  year: number
  fuelType: string
  isElectric: boolean
  isHybrid: boolean
  estimatedValue?: number
  insuranceEligible?: boolean
}

export interface InsuranceUpdatedData {
  insuranceType: 'P2P' | 'COMMERCIAL' | 'NONE'
  provider: string
  policyNumber: string
  expiresAt: Date
  newTier: 'BASIC' | 'STANDARD' | 'PREMIUM'
  newEarningsRate: number
}

export interface ClaimApprovedData {
  claimId: string
  bookingId: string
  claimType: string
  approvedAmount: number
  wasAtFault: boolean
}

export interface ClaimDeniedData {
  claimId: string
  bookingId: string
  claimType: string
  denialReason: string
}

// ============================================================================
// EVENT CATEGORY MAPPING
// ============================================================================

const EVENT_CATEGORY_MAP: Record<ESGEventType, ESGEventCategory> = {
  TRIP_COMPLETED: 'DRIVING_IMPACT',
  CLAIM_FILED: 'SAFETY',
  CLAIM_APPROVED: 'SAFETY',
  CLAIM_DENIED: 'SAFETY',
  VEHICLE_ADDED: 'ENVIRONMENTAL',
  VEHICLE_REMOVED: 'ENVIRONMENTAL',
  INSURANCE_UPDATED: 'COMPLIANCE',
  MAINTENANCE_LOGGED: 'MAINTENANCE',
  DOCUMENT_VERIFIED: 'COMPLIANCE',
  MANUAL_REFRESH: 'ADMINISTRATIVE',
}

// ============================================================================
// MAIN EVENT EMITTER
// ============================================================================

/**
 * Emit an ESG event and trigger score recalculation
 */
export async function emitESGEvent(
  eventType: ESGEventType,
  hostId: string,
  metadata: Record<string, any> = {},
  options: {
    description?: string
    relatedTripId?: string
    relatedClaimId?: string
    relatedBookingId?: string
    triggeredBy?: string
  } = {}
): Promise<void> {
  try {
    console.log(`🎯 ESG Event Emitted: ${eventType} for host ${hostId}`)

    const category = EVENT_CATEGORY_MAP[eventType]
    const description = options.description || generateDescription(eventType, metadata)

    const eventData: ESGEventData = {
      hostId,
      eventType,
      category,
      description,
      metadata,
      relatedTripId: options.relatedTripId,
      relatedClaimId: options.relatedClaimId,
      relatedBookingId: options.relatedBookingId,
      triggeredBy: options.triggeredBy,
    }

    // Log the event to database
    await logESGEvent(eventData)

    // Trigger ESG score recalculation
    await triggerESGUpdate(hostId, eventType, eventData)

    console.log(`✅ ESG Event Processed: ${eventType} for host ${hostId}`)
  } catch (error) {
    console.error(`❌ Error emitting ESG event ${eventType}:`, error)
    // Don't throw - we don't want to break the main flow if ESG update fails
  }
}

// ============================================================================
// SPECIFIC EVENT HANDLERS
// ============================================================================

/**
 * Handle trip completion event
 */
export async function handleTripCompleted(
  hostId: string,
  tripData: TripCompletedData
): Promise<void> {
  const metadata = {
    bookingId: tripData.bookingId,
    bookingCode: tripData.bookingCode,
    carId: tripData.carId,
    totalMiles: tripData.totalMiles || 0,
    fuelType: tripData.fuelType,
    wasIncidentFree: tripData.wasIncidentFree,
    guestRating: tripData.guestRating,
    duration: Math.ceil(
      (tripData.endDate.getTime() - tripData.startDate.getTime()) / (1000 * 60 * 60 * 24)
    ),
  }

  await emitESGEvent('TRIP_COMPLETED', hostId, metadata, {
    description: `Trip ${tripData.bookingCode} completed ${
      tripData.wasIncidentFree ? 'without incidents' : 'with incident'
    }`,
    relatedBookingId: tripData.bookingId,
    triggeredBy: 'SYSTEM',
  })
}

/**
 * Handle claim filed event
 */
export async function handleClaimFiled(
  hostId: string,
  claimData: ClaimFiledData
): Promise<void> {
  const metadata = {
    claimId: claimData.claimId,
    bookingId: claimData.bookingId,
    carId: claimData.carId,
    claimType: claimData.claimType,
    estimatedCost: claimData.estimatedCost,
    incidentDate: claimData.incidentDate.toISOString(),
  }

  await emitESGEvent('CLAIM_FILED', hostId, metadata, {
    description: `${claimData.claimType} claim filed for $${claimData.estimatedCost}`,
    relatedClaimId: claimData.claimId,
    relatedBookingId: claimData.bookingId,
    triggeredBy: 'HOST',
  })
}

/**
 * Handle vehicle added event
 */
export async function handleVehicleAdded(
  hostId: string,
  vehicleData: VehicleAddedData
): Promise<void> {
  const metadata = {
    carId: vehicleData.carId,
    make: vehicleData.make,
    model: vehicleData.model,
    year: vehicleData.year,
    fuelType: vehicleData.fuelType,
    isElectric: vehicleData.isElectric,
    isHybrid: vehicleData.isHybrid,
    estimatedValue: vehicleData.estimatedValue,
    insuranceEligible: vehicleData.insuranceEligible,
  }

  const vehicleType = vehicleData.isElectric
    ? 'Electric'
    : vehicleData.isHybrid
    ? 'Hybrid'
    : 'Gas'

  await emitESGEvent('VEHICLE_ADDED', hostId, metadata, {
    description: `${vehicleType} vehicle added: ${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`,
    triggeredBy: 'HOST',
  })
}

/**
 * Handle insurance updated event
 */
export async function handleInsuranceUpdated(
  hostId: string,
  insuranceData: InsuranceUpdatedData
): Promise<void> {
  const metadata = {
    insuranceType: insuranceData.insuranceType,
    provider: insuranceData.provider,
    policyNumber: insuranceData.policyNumber,
    expiresAt: insuranceData.expiresAt.toISOString(),
    newTier: insuranceData.newTier,
    newEarningsRate: insuranceData.newEarningsRate,
  }

  await emitESGEvent('INSURANCE_UPDATED', hostId, metadata, {
    description: `Insurance updated to ${insuranceData.insuranceType} (${insuranceData.newTier} tier - ${Math.round(insuranceData.newEarningsRate * 100)}%)`,
    triggeredBy: 'HOST',
  })
}

/**
 * Handle claim approval event
 */
export async function handleClaimApproved(
  hostId: string,
  claimData: ClaimApprovedData
): Promise<void> {
  const metadata = {
    claimId: claimData.claimId,
    bookingId: claimData.bookingId,
    claimType: claimData.claimType,
    approvedAmount: claimData.approvedAmount,
    wasAtFault: claimData.wasAtFault,
  }

  await emitESGEvent('CLAIM_APPROVED', hostId, metadata, {
    description: `${claimData.claimType} claim approved for $${claimData.approvedAmount}`,
    relatedClaimId: claimData.claimId,
    relatedBookingId: claimData.bookingId,
    triggeredBy: 'FLEET_ADMIN',
  })
}

/**
 * Handle claim denial event
 */
export async function handleClaimDenied(
  hostId: string,
  claimData: ClaimDeniedData
): Promise<void> {
  const metadata = {
    claimId: claimData.claimId,
    bookingId: claimData.bookingId,
    claimType: claimData.claimType,
    denialReason: claimData.denialReason,
  }

  await emitESGEvent('CLAIM_DENIED', hostId, metadata, {
    description: `${claimData.claimType} claim denied: ${claimData.denialReason}`,
    relatedClaimId: claimData.claimId,
    relatedBookingId: claimData.bookingId,
    triggeredBy: 'FLEET_ADMIN',
  })
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate human-readable description for event
 */
function generateDescription(eventType: ESGEventType, metadata: Record<string, any>): string {
  switch (eventType) {
    case 'TRIP_COMPLETED':
      return `Trip completed (${metadata.bookingCode || 'Unknown'})`
    case 'CLAIM_FILED':
      return `Claim filed: ${metadata.claimType || 'Unknown type'}`
    case 'CLAIM_APPROVED':
      return `Claim approved for $${metadata.approvedAmount || 0}`
    case 'CLAIM_DENIED':
      return 'Claim denied'
    case 'VEHICLE_ADDED':
      return `Vehicle added: ${metadata.make || ''} ${metadata.model || ''}`
    case 'VEHICLE_REMOVED':
      return 'Vehicle removed from fleet'
    case 'INSURANCE_UPDATED':
      return `Insurance updated to ${metadata.newTier || 'new tier'}`
    case 'MAINTENANCE_LOGGED':
      return 'Maintenance logged'
    case 'DOCUMENT_VERIFIED':
      return 'Document verified'
    case 'MANUAL_REFRESH':
      return 'Manual ESG score refresh'
    default:
      return `ESG event: ${eventType}`
  }
}

/**
 * Get event category for an event type
 */
export function getEventCategory(eventType: ESGEventType): ESGEventCategory {
  return EVENT_CATEGORY_MAP[eventType]
}