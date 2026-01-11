// app/sys-2847/fleet/types.ts

export enum CarCategory {
    LUXURY = 'LUXURY',
    SUV = 'SUV',
    SPORTS = 'SPORTS',
    ELECTRIC = 'ELECTRIC',
    EXOTIC = 'EXOTIC',
    CONVERTIBLE = 'CONVERTIBLE',
    SEDAN = 'SEDAN'
  }
  
  export enum CarStatus {
    AVAILABLE = 'AVAILABLE',
    BOOKED = 'BOOKED',
    MAINTENANCE = 'MAINTENANCE',
    PENDING_INSPECTION = 'PENDING_INSPECTION',
    UNLISTED = 'UNLISTED',
    RETIRED = 'RETIRED'
  }
  
  export enum TransmissionType {
    AUTOMATIC = 'AUTOMATIC',
    MANUAL = 'MANUAL',
    SEMI_AUTOMATIC = 'SEMI_AUTOMATIC',
    CVT = 'CVT'
  }

  export enum FuelType {
    PREMIUM = 'PREMIUM',
    REGULAR = 'REGULAR',
    ELECTRIC = 'ELECTRIC',
    HYBRID = 'HYBRID',
    PLUGIN_HYBRID = 'PLUGIN_HYBRID',
    DIESEL = 'DIESEL'
  }
  
  export interface CarFormData {
    // Host
    hostId: string
    
    // Basic Info
    make: string
    model: string
    year: number
    color?: string
    vin?: string
    licensePlate?: string
    
    // Category & Type
    category: CarCategory
    carType: string
    
    // Specs
    seats: number
    doors: number
    transmission: TransmissionType
    fuelType: FuelType
    mpgCity?: number
    mpgHighway?: number
    currentMileage?: number
    
    // Pricing
    dailyRate: number
    weeklyRate?: number
    monthlyRate?: number
    weeklyDiscount?: number
    monthlyDiscount?: number
    deliveryFee?: number
    insuranceDaily?: number
    
    // Location
    address: string
    city: string
    state: string
    zipCode: string
    latitude?: number
    longitude?: number
    
    // Features & Rules
    features?: string
    rules?: string
    
    // Availability
    minTripDuration?: number
    maxTripDuration?: number
    advanceNotice?: number
    instantBook?: boolean
    
    // Services
    airportPickup?: boolean
    hotelDelivery?: boolean
    homeDelivery?: boolean
    
    // Status
    isActive?: boolean
    status?: CarStatus
    
    // Photos
    photos?: string[]
    heroPhotoIndex?: number
  }
  
  export interface Car extends CarFormData {
    id: string
    source: string
    createdAt: Date
    updatedAt: Date
    totalTrips: number
    rating: number
    host?: Host
    photos?: CarPhoto[]
    badges?: string[]
  }
  
  export interface Host {
    id: string
    name: string
    email: string
    phone?: string
    responseTime?: number
    responseRate?: number
    profilePhoto?: string
    bio?: string
  }
  
  export interface CarPhoto {
    id: string
    url: string
    caption?: string
    order: number
    isHero?: boolean
  }
  
  export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
  }