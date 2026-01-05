// app/types/fleet-management.ts
// Types for Fleet Manager & Vehicle Owner system

// ============================================================================
// COMMISSION TYPES
// ============================================================================

export interface ManagedCarCommission {
  totalRevenue: number
  platformCut: number        // Always 10%
  ownerEarnings: number      // Owner's share of remaining 90%
  managerEarnings: number    // Manager's share of remaining 90%
  ownerPercent: number       // e.g., 70
  managerPercent: number     // e.g., 30
}

// ============================================================================
// INVITATION TYPES
// ============================================================================

export type InvitationType = 'OWNER_INVITES_MANAGER' | 'MANAGER_INVITES_OWNER'

export type InvitationStatus =
  | 'PENDING'
  | 'COUNTER_OFFERED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'CANCELLED'

export interface ManagementPermissions {
  canEditListing: boolean
  canAdjustPricing: boolean
  canCommunicateGuests: boolean
  canApproveBookings: boolean
  canHandleIssues: boolean
}

export interface CreateInvitationPayload {
  type: InvitationType
  recipientEmail: string
  vehicleIds?: string[]
  proposedOwnerPercent?: number
  proposedManagerPercent?: number
  permissions?: ManagementPermissions
}

export interface NegotiationHistoryEntry {
  round: number
  proposedBy: 'OWNER' | 'MANAGER'
  ownerPercent: number
  managerPercent: number
  message?: string
  timestamp: string
}

export interface InvitationDetails {
  id: string
  token: string
  type: InvitationType
  sender: {
    id: string
    name: string
    email: string
    profilePhoto?: string
  }
  recipientEmail: string
  recipient?: {
    id: string
    name: string
    email: string
  }
  vehicles?: {
    id: string
    make: string
    model: string
    year: number
    photos?: string[]
  }[]
  proposedOwnerPercent: number
  proposedManagerPercent: number
  counterOfferOwnerPercent?: number
  counterOfferManagerPercent?: number
  negotiationRounds: number
  negotiationHistory: NegotiationHistoryEntry[]
  permissions: ManagementPermissions
  status: InvitationStatus
  expiresAt: string
  createdAt: string
}

// ============================================================================
// VEHICLE MANAGEMENT TYPES
// ============================================================================

export type VehicleManagementStatus = 'PENDING' | 'ACTIVE' | 'PAUSED' | 'TERMINATED'

export interface VehicleManagementRecord {
  id: string
  vehicleId: string
  vehicle: {
    id: string
    make: string
    model: string
    year: number
    photos?: { url: string }[]
    dailyRate: number
  }
  ownerId: string
  owner: {
    id: string
    name: string
    email: string
    profilePhoto?: string
  }
  managerId: string
  manager: {
    id: string
    name: string
    email: string
    profilePhoto?: string
  }
  ownerCommissionPercent: number
  managerCommissionPercent: number
  permissions: ManagementPermissions
  status: VehicleManagementStatus
  agreementNotes?: string
  agreementSignedAt?: string
  createdAt: string
  updatedAt: string
}

// ============================================================================
// DASHBOARD VIEW TYPES
// ============================================================================

export interface ManagedVehicleSummary {
  vehicleId: string
  vehicleName: string
  vehiclePhoto?: string
  ownerName: string
  ownerId: string
  status: VehicleManagementStatus
  ownerCommissionPercent: number
  managerCommissionPercent: number
  totalEarningsThisMonth: number
  managerEarningsThisMonth: number
  activeBookings: number
  totalTrips: number
}

export interface OwnedVehicleSummary {
  vehicleId: string
  vehicleName: string
  vehiclePhoto?: string
  managerName: string
  managerId: string
  status: VehicleManagementStatus
  ownerCommissionPercent: number
  managerCommissionPercent: number
  totalEarningsThisMonth: number
  ownerEarningsThisMonth: number
  activeBookings: number
  totalTrips: number
}

export interface FleetManagerDashboard {
  isHostManager: boolean
  isVehicleOwner: boolean
  hostManagerSlug?: string

  // Own vehicles (uses insurance tier earnings)
  ownVehicles: {
    count: number
    activeBookings: number
    thisMonthEarnings: number
  }

  // Managed vehicles (uses commission split)
  managedVehicles: {
    count: number
    activeBookings: number
    thisMonthEarnings: number // Manager's cut
  }

  // Owned vehicles managed by others
  ownedManagedVehicles: {
    count: number
    activeBookings: number
    thisMonthEarnings: number // Owner's cut
  }

  // Combined totals
  totalVehicles: number
  totalActiveBookings: number
  totalThisMonthEarnings: number
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface AccountTypeResponse {
  isGuest: boolean
  isHost: boolean
  isHostManager: boolean
  isVehicleOwner: boolean
  isPartner: boolean
  managesOwnCars: boolean  // false = Fleet Manager only (manages others' cars)

  ownedVehicleCount: number
  managedVehicleCount: number
  ownedManagedVehicleCount: number

  fleetPageUrl?: string  // /fleet/[slug]
  partnerPageUrl?: string  // /rideshare/[partnerSlug]
}

export interface InvitationResponse {
  success: boolean
  invitation?: InvitationDetails
  error?: string
}

export interface AcceptInvitationResponse {
  success: boolean
  vehicleManagement?: VehicleManagementRecord
  error?: string
}

export interface CounterOfferResponse {
  success: boolean
  invitation?: InvitationDetails
  error?: string
  roundsRemaining?: number
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface InviteOwnerFormData {
  recipientEmail: string
  proposedManagerPercent: number
  proposedOwnerPercent: number
  permissions: ManagementPermissions
  message?: string
}

export interface InviteManagerFormData {
  recipientEmail: string
  vehicleIds: string[]
  proposedOwnerPercent: number
  proposedManagerPercent: number
  permissions: ManagementPermissions
  message?: string
}

export interface FleetManagerSettingsFormData {
  isHostManager: boolean
  hostManagerSlug: string
  hostManagerName: string
  hostManagerBio: string
  hostManagerLogo?: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const PLATFORM_CUT_PERCENT = 10  // Platform always takes 10%

export const DEFAULT_OWNER_PERCENT = 70
export const DEFAULT_MANAGER_PERCENT = 30

export const MIN_MANAGER_PERCENT = 10
export const MAX_MANAGER_PERCENT = 50
export const MIN_OWNER_PERCENT = 50
export const MAX_OWNER_PERCENT = 90

export const MAX_NEGOTIATION_ROUNDS = 5
export const INVITATION_EXPIRY_DAYS = 7
export const COUNTER_OFFER_EXTENSION_DAYS = 3

export const DEFAULT_PERMISSIONS: ManagementPermissions = {
  canEditListing: true,
  canAdjustPricing: true,
  canCommunicateGuests: true,
  canApproveBookings: true,
  canHandleIssues: true
}
