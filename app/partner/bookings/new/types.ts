// app/partner/bookings/new/types.ts

export interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  photo: string | null
  isGuestOnly?: boolean // No User account created — guest info only on booking
  isPreviousCustomer?: boolean
  totalBookings?: number
  stripeIdentityStatus?: 'not_started' | 'pending' | 'verified' | 'failed' | null
  stripeIdentityVerifiedAt?: string | null
  stripeVerifiedFirstName?: string | null
  stripeVerifiedLastName?: string | null
}

export interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  trim?: string | null
  photo: string | null
  dailyRate: number
  weeklyRate: number | null
  monthlyRate: number | null
  vehicleType: string
  minTripDuration: number
  status: string
  carType: string
  currentMileage: number | null
  insuranceEligible?: boolean
  insuranceInfo?: {
    hasOwnInsurance: boolean
    provider: string | null
    policyNumber: string | null
    useForRentals: boolean
  } | null
}

export interface AvailabilityResult {
  available: boolean
  reason?: string
  conflicts?: any[]
  nextAvailable?: string
  tripDays?: number
}

export type Step = 'customer' | 'verify' | 'vehicle' | 'dates' | 'confirm'

export type InsuranceOption = 'vehicle' | 'guest' | 'partner' | 'none'

export interface PartnerAddress {
  address: string
  city: string
  state: string
  zipCode: string
}

export interface PartnerTier {
  tier: string
  commissionRate: number
  fleetSize: number
}

export interface PartnerInsurance {
  hasInsurance: boolean
  coversDuringRentals: boolean
  insuranceProvider: string | null
  rentalCoveredVehicleIds: string[]
}

export interface GuestInsurance {
  hasConfirmed: boolean
  provider: string
  policyNumber: string
}

// Arizona airports for dropdown
export const ARIZONA_AIRPORTS = [
  { code: 'PHX', name: 'Phoenix Sky Harbor International Airport' },
  { code: 'TUS', name: 'Tucson International Airport' },
  { code: 'AZA', name: 'Phoenix-Mesa Gateway Airport' },
  { code: 'SDL', name: 'Scottsdale Airport' },
  { code: 'GCN', name: 'Grand Canyon National Park Airport' },
  { code: 'FLG', name: 'Flagstaff Pulliam Airport' },
  { code: 'YUM', name: 'Yuma International Airport' },
  { code: 'PRC', name: 'Prescott Ernest A. Love Field' },
  { code: 'IWA', name: 'Phoenix-Mesa Gateway Airport (IWA)' },
  { code: 'DVT', name: 'Phoenix Deer Valley Airport' }
]

// Delivery/Airport fees
export const DELIVERY_FEES: Record<string, number> = {
  partner: 0,
  delivery: 35,
  airport: 25
}
