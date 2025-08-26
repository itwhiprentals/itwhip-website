/**
 * Hotel Types for ItWhip Platform
 * Defines hotels, bookings, rides, revenue, and ghost ride system
 */

import { UserRole, CertificationTier, Permission } from './auth'

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

/**
 * Hotel property types
 */
export enum PropertyType {
  HOTEL = 'hotel',
  RESORT = 'resort',
  MOTEL = 'motel',
  BNB = 'bnb',
  BOUTIQUE = 'boutique',
  CHAIN = 'chain',
  INDEPENDENT = 'independent'
}

/**
 * Hotel size categories
 */
export enum HotelSize {
  SMALL = 'small',           // < 50 rooms
  MEDIUM = 'medium',         // 50-200 rooms
  LARGE = 'large',           // 200-500 rooms
  ENTERPRISE = 'enterprise'  // 500+ rooms
}

/**
 * Booking status
 */
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

/**
 * Booking sources
 */
export enum BookingSource {
  DIRECT = 'direct',         // ItWhip platform
  EXPEDIA = 'expedia',
  BOOKING = 'booking.com',
  AIRBNB = 'airbnb',
  AMADEUS = 'amadeus',
  SABRE = 'sabre',
  WEBSITE = 'hotel_website',
  PHONE = 'phone',
  WALK_IN = 'walk_in'
}

/**
 * Ride status
 */
export enum RideStatus {
  REQUESTED = 'requested',
  SEARCHING = 'searching',
  DRIVER_ASSIGNED = 'driver_assigned',
  DRIVER_ARRIVED = 'driver_arrived',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  GHOST = 'ghost'  // Fake rides for FOMO
}

/**
 * Revenue status
 */
export enum RevenueStatus {
  PENDING = 'pending',
  AVAILABLE = 'available',
  PROCESSING = 'processing',
  WITHDRAWN = 'withdrawn',
  HELD = 'held'
}

/**
 * Dashboard view types
 */
export enum DashboardView {
  ANONYMOUS = 'anonymous',     // Ghost data only
  CLAIMED = 'claimed',         // Real bookings + ghost rides
  CERTIFIED = 'certified'      // Full access
}

// ============================================================================
// HOTEL INTERFACES
// ============================================================================

/**
 * Base hotel information
 */
export interface Hotel {
  id: string
  gdsCode: string              // Amadeus/Sabre code
  name: string
  type: PropertyType
  size: HotelSize
  
  // Location
  address: {
    street: string
    city: string
    state: string
    zip: string
    country: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  
  // Property details
  rooms: number
  amenities: string[]
  stars?: number
  chain?: string
  
  // Platform status
  status: {
    claimed: boolean
    claimedBy?: string         // Manager email
    claimedAt?: Date
    certified: boolean
    certificationTier?: CertificationTier
    certifiedAt?: Date
    active: boolean
  }
  
  // Integration
  integrations?: {
    pms?: string               // Property Management System
    channelManager?: string
    gds?: string[]
  }
  
  // Metrics
  metrics?: HotelMetrics
  
  createdAt: Date
  updatedAt: Date
}

/**
 * Hotel performance metrics
 */
export interface HotelMetrics {
  hotelId: string
  period: 'day' | 'week' | 'month' | 'year'
  
  // Occupancy
  occupancy: {
    rate: number               // Percentage
    rooms: number
    available: number
  }
  
  // Revenue metrics
  revenue: {
    rooms: number              // Room revenue
    rides: number              // Ride commission
    total: number
    currency: string
  }
  
  // Ride metrics
  rides: {
    total: number
    completed: number
    cancelled: number
    averageValue: number
    commission: number
  }
  
  // Booking metrics
  bookings: {
    total: number
    direct: number             // Through ItWhip
    ota: number               // Other channels
    averageStay: number       // Days
    cancellationRate: number
  }
  
  // Guest satisfaction
  satisfaction: {
    rating: number            // 1-5
    reviews: number
    rideRating?: number
  }
  
  calculatedAt: Date
}

// ============================================================================
// BOOKING INTERFACES
// ============================================================================

/**
 * Guest information
 */
export interface Guest {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  country?: string
  
  // Preferences
  preferences?: {
    roomType?: string
    floor?: string
    transportation?: boolean
  }
  
  // History
  history?: {
    stays: number
    totalSpent: number
    lastStay?: Date
  }
}

/**
 * Hotel booking
 */
export interface Booking {
  id: string
  confirmationNumber: string
  hotelId: string
  guestId: string
  guest: Guest
  
  // Dates
  checkIn: Date
  checkOut: Date
  nights: number
  
  // Room details
  room: {
    type: string
    number?: string
    rate: number
    currency: string
  }
  
  // Booking details
  source: BookingSource
  status: BookingStatus
  
  // Financial
  charges: {
    room: number
    taxes: number
    fees: number
    total: number
  }
  
  // Transportation
  transportation?: {
    airportPickup?: boolean
    airportDropoff?: boolean
    ridesIncluded?: number
    ridesUsed?: number
  }
  
  // Management
  canModify: boolean          // Based on user role
  canCancel: boolean
  notes?: string
  
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// RIDE INTERFACES
// ============================================================================

/**
 * Driver information
 */
export interface Driver {
  id: string
  name: string
  photo?: string
  rating: number
  trips: number
  vehicle: {
    make: string
    model: string
    year: number
    color: string
    plate: string
    type: 'sedan' | 'suv' | 'luxury' | 'van'
  }
  phone?: string
  available: boolean
}

/**
 * Ride request/trip
 */
export interface Ride {
  id: string
  hotelId: string
  bookingId?: string
  guestId?: string
  
  // Trip details
  pickup: {
    address: string
    coordinates?: { lat: number; lng: number }
    time: Date
    type: 'hotel' | 'airport' | 'location'
  }
  
  dropoff: {
    address: string
    coordinates?: { lat: number; lng: number }
    estimatedTime?: Date
    type: 'hotel' | 'airport' | 'location'
  }
  
  // Status
  status: RideStatus
  
  // Driver
  driver?: Driver
  
  // Pricing
  pricing: {
    base: number
    distance: number
    time: number
    surge?: number
    total: number
    currency: string
    hotelCommission: number    // 30% typically
    driverEarnings: number     // 70% typically
  }
  
  // Tracking
  tracking?: {
    url: string
    eta?: number               // Minutes
    distance?: number          // Miles/KM
  }
  
  // Metadata
  isGhost: boolean            // Is this a fake ride?
  
  requestedAt: Date
  completedAt?: Date
}

/**
 * Ghost ride for FOMO generation
 */
export interface GhostRide extends Omit<Ride, 'guestId' | 'bookingId'> {
  isGhost: true
  
  // Fake but realistic data
  displayData: {
    hotelName: string          // "Similar hotel in your area"
    guestType: string          // "Business traveler"
    revenue: number            // What they're "earning"
    frequency: string          // "3rd ride today"
  }
  
  // Control visibility
  visibility: {
    showToAnonymous: boolean
    showToClaimed: boolean
    label: string              // "Industry benchmark"
  }
}

// ============================================================================
// REVENUE INTERFACES
// ============================================================================

/**
 * Revenue tracking
 */
export interface Revenue {
  hotelId: string
  period: 'day' | 'week' | 'month' | 'total'
  
  // Ride revenue
  rides: {
    count: number
    gross: number              // Total ride value
    commission: number         // Hotel's 30%
    platformFee: number        // ItWhip fee
    net: number               // Hotel receives
  }
  
  // Booking revenue (0% commission)
  bookings: {
    count: number
    value: number
    savedCommission: number    // vs OTAs
  }
  
  // Status
  status: RevenueStatus
  
  // Payout info
  payout?: {
    available: number
    pending: number
    nextDate?: Date
    method?: 'bank' | 'stripe' | 'check'
  }
  
  currency: string
  calculatedAt: Date
}

/**
 * Commission structure
 */
export interface Commission {
  type: 'ride' | 'booking'
  
  // Ride commission
  ride?: {
    hotelPercentage: number    // 30%
    driverPercentage: number   // 70%
    platformFee?: number       // Optional platform fee
  }
  
  // Booking commission
  booking?: {
    percentage: number         // 0% for ItWhip bookings
    compareToOTA: {
      expedia: number         // 15-25%
      booking: number         // 15-20%
      savings: number
    }
  }
}

/**
 * Financial transaction
 */
export interface Transaction {
  id: string
  hotelId: string
  type: 'ride_commission' | 'booking' | 'withdrawal' | 'fee' | 'refund'
  
  amount: number
  currency: string
  
  status: 'pending' | 'completed' | 'failed'
  
  reference?: {
    rideId?: string
    bookingId?: string
    withdrawalId?: string
  }
  
  description: string
  
  createdAt: Date
  processedAt?: Date
}

// ============================================================================
// DASHBOARD INTERFACES
// ============================================================================

/**
 * Dashboard data based on view type
 */
export interface DashboardData {
  view: DashboardView
  hotel: Partial<Hotel>
  
  // What they can see
  metrics?: Partial<HotelMetrics>
  bookings?: Booking[]
  rides?: (Ride | GhostRide)[]
  revenue?: Partial<Revenue>
  
  // UI state
  ui: {
    showClaimButton: boolean
    showCertifyButton: boolean
    showGhostRides: boolean
    showRevenue: boolean
    canManageBookings: boolean
    canProcessRides: boolean
  }
  
  // Messages/prompts
  prompts?: {
    type: 'info' | 'warning' | 'success' | 'upgrade'
    message: string
    action?: string
  }[]
}

/**
 * Anonymous dashboard view
 */
export interface AnonymousDashboard extends DashboardData {
  view: DashboardView.ANONYMOUS
  
  // Limited hotel info
  hotel: Pick<Hotel, 'name' | 'gdsCode' | 'type' | 'rooms'>
  
  // Ghost data only
  rides: GhostRide[]
  
  // Projected metrics
  projectedRevenue: {
    daily: number
    monthly: number
    yearly: number
    message: string           // "Hotels like yours earn..."
  }
  
  ui: {
    showClaimButton: true
    showCertifyButton: false
    showGhostRides: true
    showRevenue: false
    canManageBookings: false
    canProcessRides: false
  }
}

/**
 * Claimed dashboard view
 */
export interface ClaimedDashboard extends DashboardData {
  view: DashboardView.CLAIMED
  
  // Full hotel info
  hotel: Hotel
  
  // Real bookings + ghost rides
  bookings: Booking[]
  rides: GhostRide[]          // Still ghost, but labeled differently
  
  // Show missed opportunity
  missedRevenue: {
    amount: number
    rides: number
    message: string           // "Activate to capture this revenue"
  }
  
  ui: {
    showClaimButton: false
    showCertifyButton: true
    showGhostRides: true
    showRevenue: false        // Show potential, not actual
    canManageBookings: true
    canProcessRides: false
  }
}

/**
 * Certified dashboard view
 */
export interface CertifiedDashboard extends DashboardData {
  view: DashboardView.CERTIFIED
  
  // Everything
  hotel: Hotel
  metrics: HotelMetrics
  bookings: Booking[]
  rides: Ride[]               // Real rides!
  revenue: Revenue
  
  ui: {
    showClaimButton: false
    showCertifyButton: false
    showGhostRides: false
    showRevenue: true
    canManageBookings: true
    canProcessRides: true
  }
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Hotel search filters
 */
export interface HotelSearchFilters {
  city?: string
  state?: string
  type?: PropertyType
  size?: HotelSize
  certified?: boolean
  amenities?: string[]
  minRooms?: number
  maxRooms?: number
}

/**
 * Hotel verification
 */
export interface HotelVerification {
  method: 'gds' | 'email' | 'phone' | 'document'
  verified: boolean
  verifiedAt?: Date
  evidence?: {
    gdsCode?: string
    email?: string
    document?: string
  }
}

/**
 * Integration status
 */
export interface IntegrationStatus {
  type: 'pms' | 'channel_manager' | 'gds' | 'payment'
  name: string
  connected: boolean
  lastSync?: Date
  status: 'active' | 'error' | 'disconnected'
  error?: string
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if ride is ghost
 */
export function isGhostRide(ride: Ride | GhostRide): ride is GhostRide {
  return ride.isGhost === true
}

/**
 * Check if hotel is claimed
 */
export function isHotelClaimed(hotel: Hotel): boolean {
  return hotel.status.claimed === true
}

/**
 * Check if hotel is certified
 */
export function isHotelCertified(hotel: Hotel): boolean {
  return hotel.status.certified === true
}

/**
 * Check if booking can be modified
 */
export function canModifyBooking(booking: Booking, userRole: UserRole): boolean {
  if (booking.status === BookingStatus.CANCELLED) return false
  if (booking.status === BookingStatus.CHECKED_OUT) return false
  
  return userRole !== UserRole.ANONYMOUS
}

/**
 * Calculate hotel tier recommendation
 */
export function recommendTier(hotel: Hotel): CertificationTier {
  if (hotel.rooms >= 200) return CertificationTier.TU_1_A
  if (hotel.rooms >= 50) return CertificationTier.TU_2_B
  return CertificationTier.TU_3_C
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Commission rates
 */
export const COMMISSION_RATES = {
  RIDE: {
    HOTEL: 0.30,              // 30% to hotel
    DRIVER: 0.70,             // 70% to driver
    PLATFORM: 0.00            // No platform fee (included in hotel's 30%)
  },
  BOOKING: {
    ITWHIP: 0.00,            // 0% commission
    EXPEDIA: 0.20,           // 20% typical
    BOOKING: 0.18,           // 18% typical
    AIRBNB: 0.15             // 15% typical
  }
} as const

/**
 * Ghost ride generation settings
 */
export const GHOST_RIDE_CONFIG = {
  FREQUENCY: {
    MIN_PER_HOUR: 2,
    MAX_PER_HOUR: 8
  },
  REVENUE: {
    MIN_PER_RIDE: 15,
    MAX_PER_RIDE: 85,
    COMMISSION: 0.30
  },
  MESSAGES: [
    "Business traveler to Airport",
    "Guest to Downtown Meeting",
    "VIP to Restaurant",
    "Family to Tourist Attraction",
    "Conference Attendee to Venue"
  ]
} as const

/**
 * Dashboard refresh rates
 */
export const DASHBOARD_REFRESH = {
  ANONYMOUS: 30000,          // 30 seconds
  CLAIMED: 15000,            // 15 seconds
  CERTIFIED: 5000            // 5 seconds (real-time)
} as const

export default {
  PropertyType,
  HotelSize,
  BookingStatus,
  BookingSource,
  RideStatus,
  RevenueStatus,
  DashboardView,
  COMMISSION_RATES,
  GHOST_RIDE_CONFIG,
  DASHBOARD_REFRESH
}