// app/(guest)/dashboard/orchestrator.ts
// 🎯 MASTER ORCHESTRATOR - Central hub for all dashboard components
// This file imports and exports everything for clean organization
// Version: 1.0.0 - MVP Build

// ========== TYPES & INTERFACES ==========
export interface DashboardConfig {
  user: any
  isAtHotel: boolean
  hasReservation: boolean
  hotelId?: string
  location?: {
    lat: number
    lng: number
  }
}

export interface ServiceStatus {
  rides: { available: number; nearby: boolean }
  hotels: { count: number; lowestPrice: number }
  food: { restaurants: number; delivering: boolean }
  rentals: { cars: number; nearestDistance: number }
  flights: { todayCount: number }
  bundles: { activeDeals: number }
}

// ========== COMPONENT REGISTRY ==========
// Lazy loading for performance
export const ComponentRegistry = {
  // Core Layout Components
  layout: {
    Header: () => import('@/app/components/Header'), // FIXED: Added /app to path
    SmartSidebar: () => import('./components/SmartSidebar'),
  },
  
  // Main Dashboard Sections
  sections: {
    AICommandStrip: () => import('./components/AICommandStrip'),
    ServiceGrid: () => import('./components/ServiceGrid'),
    HotelMiniStore: () => import('./components/HotelMiniStore'),
    ActiveServices: () => import('./components/ActiveServices'),
    TripTimeline: () => import('./components/TripTimeline'),
  },
  
  // Service Cards (6 main services + hotel specific)
  services: {
    ride: () => import('./services/RideCard'),
    hotel: () => import('./services/HotelCard'),
    food: () => import('./services/FoodCard'),
    rental: () => import('./services/RentalCard'),
    flight: () => import('./services/FlightCard'),
    bundle: () => import('./services/BundleCard'),
    // Hotel-specific services
    roomService: () => import('./services/RoomServiceCard'),
    amenities: () => import('./services/AmenitiesCard'),
    spa: () => import('./services/SpaCard'),
    hotelTransport: () => import('./services/HotelTransportCard'),
  },
  
  // Widgets
  widgets: {
    cart: () => import('./widgets/Cart'),
    liveFeed: () => import('./widgets/LiveFeed'),
    stats: () => import('./widgets/StatsWidget'),
    notifications: () => import('./widgets/NotificationCenter'),
    roomCharge: () => import('./widgets/RoomChargeWidget'),
    hotelMap: () => import('./widgets/HotelMapWidget'),
  },
  
  // Modals
  modals: {
    booking: () => import('./modals/BookingModal'),
    checkout: () => import('./modals/CheckoutModal'),
    profile: () => import('./modals/ProfileModal'),
  },
  
  // Utilities
  utils: {
    orchestrationEngine: () => import('./utils/OrchestrationEngine'),
    stateManager: () => import('./utils/StateManager'),
    reservationManager: () => import('./utils/ReservationManager'),
    geofenceDetector: () => import('./utils/GeofenceDetector'),
    hotelInventoryManager: () => import('./utils/HotelInventoryManager'),
  }
}

// ========== STATIC IMPORTS (Always needed) ==========
// These are imported immediately as they're used everywhere

// Context & Hooks
export { HotelContext, useHotel } from './components/HotelContext'

// ========== SERVICE CONFIGURATION ==========
export const SERVICES = {
  ride: {
    id: 'ride',
    name: 'Book Ride',
    icon: 'car',
    color: '#059669',
    gradient: ['#059669', '#10B981'],
    description: 'Instant rides, no surge pricing',
    enabled: true,
  },
  hotel: {
    id: 'hotel',
    name: 'Find Hotel',
    icon: 'bed',
    color: '#3B82F6',
    gradient: ['#3B82F6', '#60A5FA'],
    description: 'Best rates, no commission',
    enabled: true,
  },
  food: {
    id: 'food',
    name: 'Order Food',
    icon: 'restaurant',
    color: '#F59E0B',
    gradient: ['#F59E0B', '#FBB040'],
    description: 'Delivery or pickup',
    enabled: true,
  },
  rental: {
    id: 'rental',
    name: 'Rent Car',
    icon: 'car-sport',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#A78BFA'],
    description: 'Best selection & prices',
    enabled: true,
  },
  flight: {
    id: 'flight',
    name: 'Flights',
    icon: 'airplane',
    color: '#EC4899',
    gradient: ['#EC4899', '#F472B6'],
    description: 'Compare all airlines',
    enabled: true,
  },
  bundle: {
    id: 'bundle',
    name: 'Bundle',
    icon: 'gift',
    color: '#EF4444',
    gradient: ['#EF4444', '#F87171'],
    description: 'Save with packages',
    enabled: true,
  },
} as const

// ========== HOTEL MINI STORE CONFIG ==========
export const HOTEL_STORE_CATEGORIES = {
  roomService: {
    id: 'room-service',
    name: 'Room Service',
    icon: 'restaurant',
    enabled: true,
  },
  amenities: {
    id: 'amenities',
    name: 'Amenities',
    icon: 'basket',
    enabled: true,
  },
  spa: {
    id: 'spa',
    name: 'Spa & Wellness',
    icon: 'flower',
    enabled: true,
  },
  transport: {
    id: 'transport',
    name: 'Transportation',
    icon: 'car',
    enabled: true,
  },
} as const

// ========== SECURITY CONFIGURATION ==========
export const SECURITY = {
  rateLimits: {
    guest: 100,    // requests per hour
    member: 500,
    premium: 1000,
    hotel: 5000,
  },
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  requireMFA: false, // Phase 2
  encryptionEnabled: true,
}

// ========== THEME CONFIGURATION ==========
export const THEME = {
  colors: {
    primary: '#059669',
    secondary: '#10B981',
    accent: '#3B82F6',
    warning: '#F59E0B',
    danger: '#EF4444',
    text: '#1F2937',
    subtext: '#6B7280',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    border: '#E5E7EB',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
}

// ========== API ENDPOINTS ==========
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    verify: '/api/auth/verify',
  },
  
  // Services
  rides: {
    book: '/api/rides/book',
    estimate: '/api/rides/estimate',
    track: '/api/rides/track',
    history: '/api/rides/history',
  },
  
  hotels: {
    search: '/api/hotels/search',
    availability: '/api/hotels/availability',
    book: '/api/hotels/book',
    amenities: '/api/hotels/amenities',
  },
  
  // Hotel Mini Store
  hotelStore: {
    inventory: '/api/hotel-store/inventory',
    order: '/api/hotel-store/order',
    roomCharge: '/api/hotel-store/room-charge',
  },
  
  // Analytics
  analytics: {
    track: '/api/analytics/track',
    revenue: '/api/analytics/revenue',
  },
}

// ========== HELPER FUNCTIONS ==========

/**
 * Load a component dynamically from the registry
 */
export async function loadComponent(path: string) {
  const parts = path.split('.')
  let component: any = ComponentRegistry
  
  for (const part of parts) {
    component = component[part]
    if (typeof component === 'function') {
      component = await component()
    }
  }
  
  return component.default || component
}

/**
 * Check if user is at their hotel - SIMPLIFIED VERSION
 * The dynamic loading was causing issues, so we'll use a simpler approach
 */
export async function checkHotelContext(): Promise<{
  isAtHotel: boolean
  hotelId?: string
  hotelName?: string
}> {
  try {
    // For now, return mock data since the dynamic imports are failing
    // This prevents the app from crashing
    
    // In production, this would:
    // 1. Get user's current location
    // 2. Check if they have an active hotel reservation
    // 3. Compare location with hotel coordinates
    
    // Mock implementation for development
    const mockHotelContext = {
      isAtHotel: false,
      hotelId: undefined,
      hotelName: undefined,
    }
    
    // Try to get actual data if available
    if (typeof window !== 'undefined') {
      // Check localStorage for any saved hotel context
      const savedContext = localStorage.getItem('hotelContext')
      if (savedContext) {
        return JSON.parse(savedContext)
      }
    }
    
    return mockHotelContext
    
  } catch (error) {
    console.warn('Hotel context check failed, using defaults:', error)
    return { 
      isAtHotel: false,
      hotelId: undefined,
      hotelName: undefined,
    }
  }
}

/**
 * Get service availability status
 */
export async function getServiceStatus(): Promise<ServiceStatus> {
  // This would normally call APIs
  // For now, return mock data
  return {
    rides: { available: 3, nearby: true },
    hotels: { count: 47, lowestPrice: 89 },
    food: { restaurants: 23, delivering: true },
    rentals: { cars: 12, nearestDistance: 0.5 },
    flights: { todayCount: 156 },
    bundles: { activeDeals: 8 },
  }
}

/**
 * Format currency consistently
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Get time-based greeting
 */
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

/**
 * Calculate hotel commission for rides
 */
export function calculateHotelCommission(rideAmount: number): {
  driver: number
  hotel: number
  platform: number
  total: number
} {
  const driver = rideAmount * 0.67
  const hotel = rideAmount * 0.15
  const platform = rideAmount * 0.15
  const processing = rideAmount * 0.03
  
  return {
    driver: Math.round(driver * 100) / 100,
    hotel: Math.round(hotel * 100) / 100,
    platform: Math.round(platform * 100) / 100,
    total: rideAmount,
  }
}

// ========== EXPORT AGGREGATION ==========
// This allows importing everything from orchestrator
export * from './components/HotelContext'

// Default export for easy importing
export default {
  ComponentRegistry,
  SERVICES,
  HOTEL_STORE_CATEGORIES,
  SECURITY,
  THEME,
  API_ENDPOINTS,
  loadComponent,
  checkHotelContext,
  getServiceStatus,
  formatCurrency,
  getGreeting,
  calculateHotelCommission,
}