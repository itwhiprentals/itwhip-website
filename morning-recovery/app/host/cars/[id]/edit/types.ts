// app/host/cars/[id]/edit/types.ts
// Shared types and constants for the car edit page and its components

export interface CarPhoto {
  id: string
  url: string
  isHero: boolean
  order: number
}

export interface CarDetails {
  id: string
  make: string
  model: string
  year: number
  trim?: string
  color: string
  licensePlate?: string
  vin?: string

  // Specifications
  carType: string
  seats: number
  doors: number
  transmission: string
  fuelType: string
  driveType?: string  // AWD, FWD, RWD, 4WD
  mpgCity?: number
  mpgHighway?: number
  currentMileage?: number

  // Pricing
  dailyRate: number
  weeklyRate?: number
  monthlyRate?: number
  weeklyDiscount?: number
  monthlyDiscount?: number
  deliveryFee: number

  // Features
  features: string[]

  // Location
  address: string
  city: string
  state: string
  zipCode: string
  latitude?: number
  longitude?: number

  // Delivery options
  airportPickup: boolean
  hotelDelivery: boolean
  homeDelivery: boolean

  // Availability
  isActive: boolean
  instantBook: boolean
  advanceNotice: number
  minTripDuration: number
  maxTripDuration: number

  // Rules
  rules?: string[]

  // Insurance
  insuranceIncluded: boolean
  insuranceDaily: number

  // Photos
  photos: CarPhoto[]

  // Stats
  totalTrips: number
  rating: number

  // Description
  description?: string

  // Registration & Documentation Fields
  registeredOwner?: string
  registrationState?: string
  registrationExpiryDate?: string
  titleStatus?: string
  garageAddress?: string
  garageCity?: string
  garageState?: string
  garageZip?: string
  estimatedValue?: number
  hasLien?: boolean
  lienholderName?: string
  lienholderAddress?: string
  hasAlarm?: boolean
  hasTracking?: boolean
  hasImmobilizer?: boolean
  isModified?: boolean
  modifications?: string
  annualMileage?: number
  primaryUse?: string

  // Claim information
  hasActiveClaim?: boolean
  activeClaimCount?: number
  activeClaim?: {
    id: string
    type: string
    status: string
    createdAt: string
    bookingCode: string
  }

  // Status (for approval state)
  status?: string
  isApproved?: boolean
}

export interface CarFormData {
  // Basic details
  make: string
  model: string
  year: number
  trim: string
  color: string
  licensePlate: string
  vin: string

  // Specifications
  carType: string
  seats: number
  doors: number
  transmission: string
  fuelType: string
  driveType: string
  mpgCity: number
  mpgHighway: number
  currentMileage: number

  // Pricing
  dailyRate: number
  weeklyRate: number
  monthlyRate: number
  weeklyDiscount: number
  monthlyDiscount: number
  deliveryFee: number

  // Features
  features: string[]

  // Location
  address: string
  city: string
  state: string
  zipCode: string
  latitude: number
  longitude: number

  // Delivery
  airportPickup: boolean
  hotelDelivery: boolean
  homeDelivery: boolean

  // Availability
  isActive: boolean
  instantBook: boolean
  advanceNotice: number
  minTripDuration: number
  maxTripDuration: number

  // Rules
  rules: string[]

  // Insurance
  insuranceIncluded: boolean
  insuranceDaily: number

  // Description
  description: string

  // Registration & Documentation Fields
  registeredOwner: string
  registrationState: string
  registrationExpiryDate: string
  titleStatus: string
  garageAddress: string
  garageCity: string
  garageState: string
  garageZip: string
  estimatedValue: number
  hasLien: boolean
  lienholderName: string
  lienholderAddress: string
  hasAlarm: boolean
  hasTracking: boolean
  hasImmobilizer: boolean
  isModified: boolean
  modifications: string
  annualMileage: number
  primaryUse: string
}

export interface EffectiveSpecs {
  seats: number | null
  doors: number | null
  carType: string | null
  fuelType: string | null
  transmission: string | null
  driveType: string | null
}

// Props interface for tab components
export interface TabComponentProps {
  formData: CarFormData
  setFormData: React.Dispatch<React.SetStateAction<CarFormData>>
  car: CarDetails | null
  isLocked: boolean
  isApproved: boolean
  isFieldLocked: (fieldName: string) => boolean
  isVinVerified: (fieldName: string) => boolean
  validationErrors: Record<string, string>
  setValidationErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
}

// Props for vehicle details tab (has additional VIN-related props)
export interface VehicleDetailsTabProps extends TabComponentProps {
  availableModels: string[]
  setAvailableModels: React.Dispatch<React.SetStateAction<string[]>>
  availableTrims: string[]
  setAvailableTrims: React.Dispatch<React.SetStateAction<string[]>>
  vinDecoding: boolean
  vinError: string
  vinDecoded: boolean
  effectiveSpecs: EffectiveSpecs
  handleVinDecode: () => Promise<void>
  handleMakeChange: (make: string) => void
  handleModelChange: (model: string) => void
  handleYearChange: (year: number) => void
}

// Props for photos tab
export interface PhotosTabProps extends TabComponentProps {
  photos: CarPhoto[]
  setPhotos: React.Dispatch<React.SetStateAction<CarPhoto[]>>
  uploadingPhoto: boolean
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSetHeroPhoto: (photoId: string) => void
  handleDeletePhoto: (photoId: string) => void
  carId: string
}

// Props for features tab
export interface FeaturesTabProps extends TabComponentProps {
  effectiveSpecs: EffectiveSpecs
  toggleFeature: (feature: string) => void
  toggleRule: (rule: string) => void
}

// Props for service tab
export interface ServiceTabProps {
  carId: string
  showAddServiceModal: boolean
  setShowAddServiceModal: React.Dispatch<React.SetStateAction<boolean>>
}

// Props for availability tab
export interface AvailabilityTabProps extends TabComponentProps {
  carId: string
}

// Constants
export const CAR_TYPES = [
  { value: 'economy', label: 'Economy' },
  { value: 'compact', label: 'Compact' },
  { value: 'midsize', label: 'Midsize' },
  { value: 'fullsize', label: 'Full Size' },
  { value: 'suv', label: 'SUV' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'convertible', label: 'Convertible' },
  { value: 'minivan', label: 'Minivan' },
  { value: 'truck', label: 'Truck' },
  { value: 'exotic', label: 'Exotic' }
] as const

export const TITLE_STATUSES = [
  { value: 'Clean', label: 'Clean Title' },
  { value: 'Salvage', label: 'Salvage Title' },
  { value: 'Rebuilt', label: 'Rebuilt Title' },
  { value: 'Lemon', label: 'Lemon Law Buyback' },
  { value: 'Flood', label: 'Flood Damage' }
] as const

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
] as const

export const CAR_FEATURES = [
  'Bluetooth',
  'Backup Camera',
  'Apple CarPlay',
  'Android Auto',
  'USB Charger',
  'Aux Input',
  'GPS Navigation',
  'Cruise Control',
  'Heated Seats',
  'Leather Seats',
  'Sunroof',
  'All-Wheel Drive',
  'Keyless Entry',
  'Remote Start',
  'Third Row Seating',
  'Bike Rack',
  'Roof Rack',
  'Tow Hitch',
  'Pet Friendly',
  'Child Seat'
] as const

export const CAR_RULES = [
  'No smoking',
  'No pets',
  'Return with same fuel level',
  'Clean return required',
  'No off-roading',
  'Valid license required',
  'Insurance required',
  'Age 21+ only',
  'Age 25+ only',
  'Local renters only',
  'Maximum 500 miles per day',
  'No commercial use'
] as const

export const CAR_COLORS = [
  'Black', 'White', 'Silver', 'Gray', 'Red', 'Blue',
  'Navy Blue', 'Brown', 'Beige', 'Green', 'Gold',
  'Orange', 'Yellow', 'Purple', 'Burgundy', 'Champagne',
  'Pearl White', 'Midnight Blue', 'Other'
] as const

// Initial form data state
export const INITIAL_FORM_DATA: CarFormData = {
  // Basic details
  make: '',
  model: '',
  year: new Date().getFullYear(),
  trim: '',
  color: '',
  licensePlate: '',
  vin: '',

  // Specifications
  carType: 'midsize',
  seats: 5,
  doors: 4,
  transmission: 'automatic',
  fuelType: 'gas',
  driveType: '',
  mpgCity: 0,
  mpgHighway: 0,
  currentMileage: 0,

  // Pricing
  dailyRate: 0,
  weeklyRate: 0,
  monthlyRate: 0,
  weeklyDiscount: 15,
  monthlyDiscount: 30,
  deliveryFee: 35,

  // Features
  features: [],

  // Location
  address: '',
  city: 'Phoenix',
  state: 'AZ',
  zipCode: '',
  latitude: 0,
  longitude: 0,

  // Delivery
  airportPickup: false,
  hotelDelivery: true,
  homeDelivery: false,

  // Availability
  isActive: true,
  instantBook: true,
  advanceNotice: 2,
  minTripDuration: 1,
  maxTripDuration: 30,

  // Rules
  rules: [],

  // Insurance
  insuranceIncluded: false,
  insuranceDaily: 25,

  // Description
  description: '',

  // Registration & Documentation Fields
  registeredOwner: '',
  registrationState: 'AZ',
  registrationExpiryDate: '',
  titleStatus: 'Clean',
  garageAddress: '',
  garageCity: '',
  garageState: 'AZ',
  garageZip: '',
  estimatedValue: 0,
  hasLien: false,
  lienholderName: '',
  lienholderAddress: '',
  hasAlarm: false,
  hasTracking: false,
  hasImmobilizer: false,
  isModified: false,
  modifications: '',
  annualMileage: 12000,
  primaryUse: 'Rental'
}
