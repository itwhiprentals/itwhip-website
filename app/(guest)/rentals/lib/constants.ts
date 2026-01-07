// app/(guest)/rentals/lib/constants.ts
// Constants and configuration for the rental system

import { CarType, TransmissionType, FuelType, DeliveryType } from '@/app/types/rental'

// ============================================================================
// BUSINESS RULES
// ============================================================================

export const RENTAL_RULES = {
  MIN_AGE: 18,
  MIN_AGE_LUXURY: 25,
  MIN_AGE_EXOTIC: 25,
  INSURANCE_REQUIRED_UNDER: 25,
  MIN_RENTAL_DAYS: 1,
  MAX_RENTAL_DAYS: 30,
  ADVANCE_NOTICE_HOURS: 2,
  CANCELLATION_HOURS: 24,
  LATE_RETURN_GRACE_MINUTES: 30,
  DEFAULT_PICKUP_TIME: '10:00',
  DEFAULT_RETURN_TIME: '10:00',
} as const

// ============================================================================
// PRICING CONFIGURATION
// ============================================================================

export const PRICING_CONFIG = {
  // Platform fees
  SERVICE_FEE_PERCENTAGE: 0.15, // 15% service fee
  PLATFORM_COMMISSION: 0.20, // 20% from hosts
  AMADEUS_MARKUP: 0.35, // 35% markup on Amadeus
  
  // Discounts
  WEEKLY_DISCOUNT: 0.15, // 15% off for 7+ days
  MONTHLY_DISCOUNT: 0.30, // 30% off for 28+ days
  WEEKLY_THRESHOLD_DAYS: 7,
  MONTHLY_THRESHOLD_DAYS: 28,
  
  // Insurance
  BASIC_INSURANCE_DAILY: 15,
  PREMIUM_INSURANCE_DAILY: 25,
  INSURANCE_REQUIRED_UNDER_AGE: 25,
  
  // Deposits
  DEFAULT_DEPOSIT: 500,
  LUXURY_DEPOSIT: 1000,
  EXOTIC_DEPOSIT: 2500,
  
  // Delivery fees
  AIRPORT_DELIVERY_FEE: 0, // Free at airport
  HOTEL_DELIVERY_FEE: 35,
  ADDRESS_DELIVERY_BASE: 25,
  ADDRESS_DELIVERY_PER_MILE: 2,
  FREE_DELIVERY_RADIUS_MILES: 10,
  
  // Taxes (Arizona) - Use getTaxRate() from arizona-taxes.ts for city-specific rates
  // These are fallback values only - always prefer city-specific calculation
  TAX_RATE: 0.084, // ~8.4% Phoenix default (5.6% state + 2.8% city)
  RENTAL_TAX_RATE: 0.084, // Same as TAX_RATE - no special rental surcharge for P2P
} as const

// ============================================================================
// CAR TYPES & CATEGORIES
// ============================================================================

export const CAR_TYPES: Record<CarType, {
  label: string
  seats: string
  description: string
  priceRange: string
  deposit: number
  icon: string
}> = {
  economy: {
    label: 'Economy',
    seats: '4',
    description: 'Great gas mileage, perfect for city driving',
    priceRange: '$25-40',
    deposit: 500,
    icon: '🚗'
  },
  compact: {
    label: 'Compact',
    seats: '4-5',
    description: 'Easy to park, efficient on gas',
    priceRange: '$30-45',
    deposit: 500,
    icon: '🚙'
  },
  midsize: {
    label: 'Midsize',
    seats: '5',
    description: 'Comfortable for longer trips',
    priceRange: '$40-60',
    deposit: 500,
    icon: '🚗'
  },
  fullsize: {
    label: 'Full-Size',
    seats: '5',
    description: 'Spacious and comfortable',
    priceRange: '$50-75',
    deposit: 500,
    icon: '🚙'
  },
  suv: {
    label: 'SUV',
    seats: '5-7',
    description: 'Great for families and adventures',
    priceRange: '$60-100',
    deposit: 750,
    icon: '🚙'
  },
  luxury: {
    label: 'Luxury',
    seats: '4-5',
    description: 'Premium comfort and features',
    priceRange: '$100-200',
    deposit: 1000,
    icon: '🏎️'
  },
  convertible: {
    label: 'Convertible',
    seats: '2-4',
    description: 'Perfect for scenic drives',
    priceRange: '$80-150',
    deposit: 1000,
    icon: '🚗'
  },
  minivan: {
    label: 'Minivan',
    seats: '7-8',
    description: 'Maximum space for groups',
    priceRange: '$70-120',
    deposit: 750,
    icon: '🚐'
  },
  pickup: {
    label: 'Pickup Truck',
    seats: '2-5',
    description: 'Great for hauling and work',
    priceRange: '$60-100',
    deposit: 750,
    icon: '🛻'
  },
  electric: {
    label: 'Electric',
    seats: '4-5',
    description: 'Zero emissions, cutting-edge tech',
    priceRange: '$70-150',
    deposit: 1000,
    icon: '⚡'
  },
  exotic: {
    label: 'Exotic',
    seats: '2',
    description: 'High-performance dream cars',
    priceRange: '$300-1000',
    deposit: 2500,
    icon: '🏎️'
  }
} as const

// ============================================================================
// FEATURES
// ============================================================================

export const CAR_FEATURES = [
  'Bluetooth',
  'Apple CarPlay',
  'Android Auto',
  'Backup Camera',
  'Blind Spot Monitoring',
  'Adaptive Cruise Control',
  'Lane Keep Assist',
  'Navigation System',
  'Heated Seats',
  'Cooled Seats',
  'Sunroof/Moonroof',
  'Leather Seats',
  'Third Row Seating',
  'AWD/4WD',
  'USB Chargers',
  'Wireless Charging',
  'Premium Sound System',
  'Satellite Radio',
  'Keyless Entry',
  'Remote Start',
  'Tow Hitch',
  'Roof Rack',
  'Bike Rack',
  'Ski Rack',
  'Child Seat Available',
  'Pet Friendly',
  'Smoking Allowed',
] as const

// ============================================================================
// LOCATIONS
// ============================================================================

export const PHOENIX_LOCATIONS = {
  AIRPORT: {
    name: 'Phoenix Sky Harbor International Airport',
    code: 'PHX',
    address: '3400 E Sky Harbor Blvd, Phoenix, AZ 85034',
    latitude: 33.4342,
    longitude: -112.0080
  },
  DOWNTOWN: {
    name: 'Downtown Phoenix',
    address: 'Downtown Phoenix, AZ 85004',
    latitude: 33.4484,
    longitude: -112.0740
  },
  SCOTTSDALE: {
    name: 'Scottsdale',
    address: 'Scottsdale, AZ 85251',
    latitude: 33.4942,
    longitude: -111.9261
  },
  TEMPE: {
    name: 'Tempe',
    address: 'Tempe, AZ 85281',
    latitude: 33.4255,
    longitude: -111.9400
  },
  MESA: {
    name: 'Mesa',
    address: 'Mesa, AZ 85201',
    latitude: 33.4152,
    longitude: -111.8315
  }
} as const

export const OTHER_CITIES = [
  { city: 'Los Angeles', state: 'CA', latitude: 34.0522, longitude: -118.2437 },
  { city: 'Las Vegas', state: 'NV', latitude: 36.1699, longitude: -115.1398 },
  { city: 'San Diego', state: 'CA', latitude: 32.7157, longitude: -117.1611 },
  { city: 'Denver', state: 'CO', latitude: 39.7392, longitude: -104.9903 },
  { city: 'Dallas', state: 'TX', latitude: 32.7767, longitude: -96.7970 },
  { city: 'Austin', state: 'TX', latitude: 30.2672, longitude: -97.7431 },
  { city: 'Seattle', state: 'WA', latitude: 47.6062, longitude: -122.3321 },
  { city: 'Portland', state: 'OR', latitude: 45.5152, longitude: -122.6784 },
  { city: 'San Francisco', state: 'CA', latitude: 37.7749, longitude: -122.4194 },
  { city: 'Salt Lake City', state: 'UT', latitude: 40.7608, longitude: -111.8910 },
] as const

// ============================================================================
// DELIVERY OPTIONS
// ============================================================================

export const DELIVERY_OPTIONS: Record<DeliveryType, {
  label: string
  description: string
  baseFee: number
  available: boolean
}> = {
  airport: {
    label: 'Airport Pickup',
    description: 'Meet at airport rental center',
    baseFee: 0,
    available: true
  },
  hotel: {
    label: 'Hotel Delivery',
    description: 'Delivered to your hotel',
    baseFee: 35,
    available: true
  },
  address: {
    label: 'Address Delivery',
    description: 'Delivered to your location',
    baseFee: 25,
    available: true
  },
  pickup: {
    label: 'Host Location',
    description: 'Pick up from host',
    baseFee: 0,
    available: true
  }
} as const

// ============================================================================
// SORT OPTIONS
// ============================================================================

export const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'distance', label: 'Distance: Nearest' },
  { value: 'rating', label: 'Rating: Highest' },
  { value: 'trips', label: 'Most Trips' }
] as const

// ============================================================================
// TIME OPTIONS
// ============================================================================

export const TIME_OPTIONS = [
  '12:00 AM', '12:30 AM', '1:00 AM', '1:30 AM',
  '2:00 AM', '2:30 AM', '3:00 AM', '3:30 AM',
  '4:00 AM', '4:30 AM', '5:00 AM', '5:30 AM',
  '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM',
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
  '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM',
  '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM'
] as const

// ============================================================================
// RULES & GUIDELINES
// ============================================================================

export const DEFAULT_CAR_RULES = [
  'No smoking',
  'Return with same fuel level',
  'Report any damage immediately',
  'Keep the car clean',
  'No illegal activities',
  'Follow all traffic laws',
  'Return on time or communicate delays'
] as const

export const HOST_GUIDELINES = [
  'Respond to inquiries within 1 hour',
  'Keep car clean and maintained',
  'Provide accurate photos and descriptions',
  'Be available for pickup/dropoff',
  'Communicate any changes promptly',
  'Maintain insurance and registration',
  'Rate guests fairly'
] as const

// ============================================================================
// EXTRAS & ADD-ONS
// ============================================================================

export const RENTAL_EXTRAS = [
  { id: 'gps', name: 'GPS Navigation', price: 10, perDay: true },
  { id: 'child_seat', name: 'Child Car Seat', price: 15, perDay: true },
  { id: 'booster_seat', name: 'Booster Seat', price: 10, perDay: true },
  { id: 'toll_pass', name: 'Toll Pass', price: 8, perDay: true },
  { id: 'roadside', name: 'Premium Roadside Assistance', price: 5, perDay: true },
  { id: 'wifi', name: 'Mobile WiFi Hotspot', price: 12, perDay: true },
  { id: 'cooler', name: 'Cooler', price: 20, perDay: false },
  { id: 'bike_rack', name: 'Bike Rack', price: 25, perDay: false },
  { id: 'ski_rack', name: 'Ski/Snowboard Rack', price: 30, perDay: false },
  { id: 'camping_gear', name: 'Camping Gear Package', price: 50, perDay: false }
] as const

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  CAR_NOT_AVAILABLE: 'This car is not available for the selected dates',
  MINIMUM_AGE: 'You must be at least 18 years old to rent a car',
  MINIMUM_AGE_LUXURY: 'You must be at least 25 years old to rent luxury or exotic cars',
  LICENSE_REQUIRED: 'A valid driver\'s license is required',
  INSURANCE_REQUIRED: 'Insurance is required for drivers under 25',
  INVALID_DATES: 'Please select valid rental dates',
  BOOKING_TOO_SHORT: 'Minimum rental period is 1 day',
  BOOKING_TOO_LONG: 'Maximum rental period is 30 days',
  ADVANCE_NOTICE: 'Bookings require at least 2 hours advance notice',
  LOCATION_REQUIRED: 'Please select a pickup location',
  PAYMENT_FAILED: 'Payment processing failed. Please try again.',
  VERIFICATION_FAILED: 'License verification failed. Please upload clear photos.',
} as const

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  BOOKING_CONFIRMED: 'Your rental has been confirmed!',
  PAYMENT_SUCCESS: 'Payment processed successfully',
  VERIFICATION_SUCCESS: 'Your driver\'s license has been verified',
  CAR_ADDED: 'Car added successfully',
  CAR_UPDATED: 'Car information updated',
  REVIEW_SUBMITTED: 'Thank you for your review!',
  MESSAGE_SENT: 'Message sent to host',
  CANCELLATION_SUCCESS: 'Booking cancelled successfully'
} as const

// ============================================================================
// AMADEUS CONFIGURATION
// ============================================================================

export const AMADEUS_CONFIG = {
  CACHE_DURATION_MINUTES: 15,
  MAX_RESULTS: 50,
  DEFAULT_RADIUS_MILES: 25,
  SUPPORTED_PROVIDERS: ['ZE', 'ZI', 'ZT', 'ZR', 'ET', 'HZ', 'AV', 'BU'],
  VEHICLE_CATEGORIES: {
    MINI: 'economy',
    ECONOMY: 'economy',
    COMPACT: 'compact',
    INTERMEDIATE: 'midsize',
    STANDARD: 'fullsize',
    FULLSIZE: 'fullsize',
    PREMIUM: 'luxury',
    LUXURY: 'luxury',
    SUV: 'suv',
    MINIVAN: 'minivan',
    CONVERTIBLE: 'convertible'
  }
} as const