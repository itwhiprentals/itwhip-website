// app/types/rental.ts
// TypeScript types for the rental system

import { 
    RentalCar, 
    RentalHost, 
    RentalBooking, 
    RentalCarPhoto,
    RentalAvailability,
    RentalReview,
    User,
    RentalBookingStatus
  } from '@/app/lib/dal/types'
  
  // ============================================================================
  // ENUMS & CONSTANTS
  // ============================================================================
  
  export type CarType = 
    | 'economy' 
    | 'compact' 
    | 'midsize' 
    | 'fullsize' 
    | 'suv' 
    | 'luxury' 
    | 'convertible' 
    | 'minivan'
    | 'pickup'
    | 'electric'
    | 'exotic'
  
  export type TransmissionType = 'automatic' | 'manual'
  export type FuelType = 'gas' | 'electric' | 'hybrid' | 'diesel'
  export type DeliveryType = 'airport' | 'hotel' | 'address' | 'pickup'
  export type CarSource = 'p2p' | 'amadeus' | 'partner'
  
  // ============================================================================
  // SEARCH & FILTER TYPES
  // ============================================================================
  
  export interface RentalSearchParams {
    // Location
    location: string
    latitude?: number
    longitude?: number
    radius?: number // miles
    
    // Dates
    pickupDate: Date | string
    pickupTime?: string
    returnDate: Date | string
    returnTime?: string
    
    // Filters
    carType?: CarType[]
    minPrice?: number
    maxPrice?: number
    features?: string[]
    instantBook?: boolean
    deliveryType?: DeliveryType
    seats?: number
    transmission?: TransmissionType
    fuelType?: FuelType
    
    // Pagination
    page?: number
    limit?: number
    sortBy?: 'price' | 'distance' | 'rating' | 'recommended'
    sortOrder?: 'asc' | 'desc'
  }
  
  export interface AvailableFilters {
    carTypes: Array<{ type: CarType; count: number; minPrice: number }>
    priceRange: { min: number; max: number }
    features: Array<{ name: string; count: number }>
    deliveryOptions: Array<{ type: DeliveryType; count: number }>
    transmissionTypes: Array<{ type: TransmissionType; count: number }>
    fuelTypes: Array<{ type: FuelType; count: number }>
    seatOptions: number[]
  }
  
  // ============================================================================
  // CAR & HOST TYPES
  // ============================================================================
  
  export interface RentalCarWithDetails extends RentalCar {
    host: RentalHost
    photos: RentalCarPhoto[]
    availability?: RentalAvailability[]
    reviews?: RentalReview[]
    distance?: number // Miles from search location
    totalPrice?: number // Calculated for the rental period
    discountedPrice?: number // After applying discounts
    amadeusData?: AmadeusCarData // If from Amadeus
  }
  
  export interface RentalSearchResult {
    cars: RentalCarWithDetails[]
    totalCount: number
    filters: AvailableFilters
    page: number
    totalPages: number
    searchId?: string // For analytics
  }
  
  export interface HostWithStats extends RentalHost {
    cars?: RentalCar[]
    averageResponseTime?: string
    totalEarnings?: number
    upcomingBookings?: number
    completedTrips?: number
    cancellationRate?: number
  }
  
  // ============================================================================
  // BOOKING TYPES
  // ============================================================================
  
  export interface CreateRentalBookingInput {
    carId: string
    startDate: Date | string
    endDate: Date | string
    startTime: string
    endTime: string
    pickupLocation: string
    pickupType: DeliveryType
    deliveryAddress?: string
    returnLocation?: string
    extras?: string[]
    notes?: string
    hotelBookingId?: string // Link to hotel booking if applicable
  }
  
  export interface RentalBookingWithDetails extends RentalBooking {
    car: RentalCarWithDetails
    host: RentalHost
    renter: User
    messages?: any[] // RentalMessage[]
    review?: RentalReview
  }
  
  export interface BookingPriceBreakdown {
    dailyRate: number
    numberOfDays: number
    subtotal: number
    weeklyDiscount?: number
    monthlyDiscount?: number
    deliveryFee: number
    insuranceFee: number
    serviceFee: number
    taxes: number
    totalAmount: number
    depositAmount: number
  }
  
  // ============================================================================
  // AVAILABILITY TYPES
  // ============================================================================
  
  export interface AvailabilityCheck {
    carId: string
    startDate: Date | string
    endDate: Date | string
  }
  
  export interface AvailabilityResponse {
    available: boolean
    conflicts?: Array<{
      date: string
      reason: string
    }>
    customPricing?: Array<{
      date: string
      price: number
    }>
    totalPrice: number
  }
  
  // ============================================================================
  // AMADEUS INTEGRATION TYPES
  // ============================================================================
  
  export interface AmadeusCarData {
    provider: string
    vehicleCode: string
    vehicleCategory: string
    vehicleClass: string
    doors: number
    seats: number
    transmission: string
    fuelType: string
    airConditioning: boolean
    mileage?: {
      unlimited: boolean
      included?: number
      unit?: string
    }
    pricing: {
      daily: number
      weekly?: number
      currency: string
    }
    location: {
      code: string
      name: string
      address: string
      latitude: number
      longitude: number
    }
  }
  
  export interface AmadeusSearchParams {
    pickupLocationCode: string
    pickupDate: string
    returnDate: string
    pickupTime?: string
    returnTime?: string
    vehicleClass?: string
    providers?: string[]
  }
  
  // ============================================================================
  // P2P INVENTORY TYPES
  // ============================================================================
  
  export interface P2PCarListing {
    hostName: string
    hostEmail: string
    hostPhone: string
    make: string
    model: string
    year: number
    color: string
    licensePlate?: string // Partial
    carType: CarType
    seats: number
    transmission: TransmissionType
    fuelType: FuelType
    features: string[]
    dailyRate: number
    weeklyRate?: number
    monthlyRate?: number
    address: string
    city: string
    state: string
    zipCode: string
    photos: string[] // URLs
    rules?: string[]
    instantBook: boolean
    minTripDuration: number
    maxTripDuration: number
    deliveryOptions: {
      airport: boolean
      hotel: boolean
      address: boolean
      fee: number
    }
  }
  
  // ============================================================================
  // PRICING TYPES
  // ============================================================================
  
  export interface PricingCalculation {
    basePrice: number
    numberOfDays: number
    weeklyDiscount?: {
      applicable: boolean
      percentage: number
      amount: number
    }
    monthlyDiscount?: {
      applicable: boolean
      percentage: number
      amount: number
    }
    deliveryFee: number
    insuranceDaily: number
    insuranceTotal: number
    serviceFeePercentage: number
    serviceFeeAmount: number
    taxRate: number
    taxAmount: number
    totalBeforeTax: number
    totalAmount: number
    depositAmount: number
    amadeusMarkup?: number // Your markup on Amadeus cars
  }
  
  // ============================================================================
  // REVIEW TYPES
  // ============================================================================
  
  export interface CreateReviewInput {
    bookingId: string
    rating: number
    cleanliness?: number
    accuracy?: number
    communication?: number
    convenience?: number
    value?: number
    comment?: string
  }
  
  export interface ReviewWithDetails extends RentalReview {
    car: RentalCar
    host: RentalHost
    renterName?: string
    hostResponse?: string
    helpfulVotes?: number
  }
  
  // ============================================================================
  // PHOTO TYPES
  // ============================================================================
  
  export interface CarPhotoUpload {
    carId: string
    file: File
    caption?: string
    isHero?: boolean
  }
  
  export interface PhotoWithMetadata extends RentalCarPhoto {
    width?: number
    height?: number
    size?: number
    uploadedBy?: string
  }
  
  // ============================================================================
  // STATS & ANALYTICS TYPES
  // ============================================================================
  
  export interface RentalStats {
    totalCars: number
    availableCars: number
    totalBookings: number
    activeBookings: number
    averageRating: number
    totalRevenue: number
    popularCarTypes: Array<{
      type: CarType
      count: number
      percentage: number
    }>
    bookingTrends: Array<{
      date: string
      bookings: number
      revenue: number
    }>
  }
  
  export interface HostDashboard {
    host: HostWithStats
    cars: RentalCarWithDetails[]
    upcomingBookings: RentalBookingWithDetails[]
    recentBookings: RentalBookingWithDetails[]
    earnings: {
      thisMonth: number
      lastMonth: number
      total: number
      pending: number
    }
    performance: {
      responseRate: number
      acceptanceRate: number
      averageRating: number
      totalReviews: number
    }
  }
  
  // ============================================================================
  // RESPONSE TYPES
  // ============================================================================
  
  export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
    message?: string
  }
  
  export interface PaginatedResponse<T> {
    items: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
  
  // ============================================================================
  // FORM TYPES
  // ============================================================================
  
  export interface RentalSearchForm {
    location: string
    pickupDate: string
    pickupTime: string
    returnDate: string
    returnTime: string
    carType?: CarType
  }
  
  export interface DriverVerificationForm {
    licenseNumber: string
    licenseState: string
    licenseExpiry: string
    dateOfBirth: string
    licensePhoto?: File
    selfiePhoto?: File
  }
  
  // ============================================================================
  // CACHE TYPES
  // ============================================================================
  
  export interface CachedSearch {
    id: string
    params: RentalSearchParams
    results: RentalSearchResult
    timestamp: Date
    expiresAt: Date
  }
  
  // ============================================================================
  // EXPORT ALL TYPES
  // ============================================================================
  
  export type {
    RentalCar,
    RentalHost,
    RentalBooking,
    RentalCarPhoto,
    RentalAvailability,
    RentalReview,
    RentalBookingStatus
  }