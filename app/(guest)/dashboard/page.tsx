// app/(guest)/dashboard/page.tsx
// Consumer-friendly dashboard with professional icons - no emojis

'use client'

import { useState, useEffect, Suspense, lazy } from 'react'
import { useRouter } from 'next/navigation'
import { useHotel } from './components/HotelContext'
import orchestrator from './orchestrator'

// Simple inline SVG icons - replace after installing lucide-react
const Car = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
const Hotel = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)
const MapPin = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)
const TrendingUp = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)
const Leaf = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)
const RefreshCw = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)
const Bell = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
)
const CreditCard = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
)
const AlertCircle = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
const Settings = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)
const Sparkles = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)
const Package = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
)
const Activity = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)
const HelpCircle = ({ className = "w-5 h-5" }: any) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

// Lazy load components
const HotelMiniStore = lazy(() => import('./components/HotelMiniStore'))
const ActiveServices = lazy(() => import('./components/ActiveServices'))
const Cart = lazy(() => import('./widgets/Cart'))
const LiveFeed = lazy(() => import('./widgets/LiveFeed'))
const StatsWidget = lazy(() => import('./widgets/StatsWidget'))
const BookingModal = lazy(() => import('./modals/BookingModal'))
import RentalBookingsSection from './components/RentalBookingsSection'

// Types
interface DashboardStats {
  totalSaved: number
  ridesBooked: number
  hotelNights: number
  mealsOrdered: number
  carbonOffset: number
  rentalsActive: number
}

interface ActiveService {
  id: string
  type: 'ride' | 'hotel' | 'rental'
  status: 'pending' | 'active' | 'completed'
  title: string
  subtitle: string
  time: string
  icon: React.ComponentType<any>
}

interface RideBooking {
  id: string
  pickupAddress: string
  dropoffAddress: string
  pickupTime: string
  status: string
  driverName?: string
  vehicleInfo?: string
  price: number
  estimatedArrival?: string
}

interface RentalBooking {
  id: string
  bookingCode: string
  car: {
    make: string
    model: string
    year: number
    photos?: any[]
  }
  startDate: string
  endDate: string
  status: string
  verificationStatus?: string
  totalAmount: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { isAtHotel, hotelId, hotelName, reservation, user } = useHotel()
  
  // State management
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(false)
  const [authenticatedUser, setAuthenticatedUser] = useState<any>(null)
  
  const [stats, setStats] = useState<DashboardStats>({
    totalSaved: 0,
    ridesBooked: 0,
    hotelNights: 0,
    mealsOrdered: 0,
    carbonOffset: 0,
    rentalsActive: 0
  })
  
  const [notificationCount, setNotificationCount] = useState(0)
  
  // Bookings state
  const [rideBookings, setRideBookings] = useState<RideBooking[]>([])
  const [loadingRides, setLoadingRides] = useState(false)
  const [rentalBookings, setRentalBookings] = useState<RentalBooking[]>([])
  const [loadingRentals, setLoadingRentals] = useState(false)
  const [rentalKey, setRentalKey] = useState(0) // Force re-render key
  
  const [activeServices, setActiveServices] = useState<ActiveService[]>([])
  const [cartItems, setCartItems] = useState<any[]>([])
  const [showCart, setShowCart] = useState(false)
  const [serviceStatus, setServiceStatus] = useState<any>(null)
  
  // Modal state
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedService, setSelectedService] = useState<'ride' | 'hotel' | 'rental' | null>(null)
  const [bookingInitialData, setBookingInitialData] = useState<any>(null)

  // Core services configuration
  const CORE_SERVICES = [
    { 
      id: 'ride', 
      name: 'Book Ride', 
      icon: Car,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50 text-blue-700'
    },
    { 
      id: 'hotel', 
      name: 'Find Hotels', 
      icon: Hotel,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50 text-purple-700'
    },
    { 
      id: 'rental', 
      name: 'Rent a Car', 
      icon: Car,
      color: 'bg-green-500',
      lightColor: 'bg-green-50 text-green-700'
    }
  ]

  // Check authentication and load data
  useEffect(() => {
    checkAuth()
    loadDashboardData()
    loadDashboardStats()
    loadServiceStatus()
    loadAllBookings()
  }, [])

  // Force re-render when rentalBookings changes
  useEffect(() => {
    console.log('rentalBookings state updated:', rentalBookings.length, 'bookings');
    if (rentalBookings.length > 0) {
      console.log('First booking:', rentalBookings[0]);
    }
  }, [rentalBookings]);

  // Add a manual trigger for testing
  useEffect(() => {
    // If rentals are supposed to be there but aren't showing, try reloading after a delay
    if (stats.rentalsActive > 0 && rentalBookings.length === 0) {
      console.log('Stats show rentals but state is empty, reloading...')
      const timer = setTimeout(() => {
        loadRentalBookings()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [stats.rentalsActive])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify')
      if (response.ok) {
        const data = await response.json()
        setAuthenticatedUser(data.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    }
  }

  // Load ride bookings
  const loadRideBookings = async () => {
    setLoadingRides(true)
    try {
      const response = await fetch('/api/rides/user-bookings')
      if (response.ok) {
        const data = await response.json()
        if (data.bookings) {
          setRideBookings(data.bookings)
          
          const activeRides = data.bookings
            .filter((b: any) => ['REQUESTED', 'DRIVER_ASSIGNED', 'IN_PROGRESS'].includes(b.status))
            .map((booking: any) => ({
              id: `ride-${booking.id}`,
              type: 'ride' as const,
              status: booking.status === 'IN_PROGRESS' ? 'active' : 'pending',
              title: `Ride to ${booking.dropoffAddress.split(',')[0]}`,
              subtitle: booking.driverName || 'Finding driver...',
              time: booking.pickupTime,
              icon: Car
            }))
          
          return activeRides
        }
      }
      return []
    } catch (error) {
      console.error('Failed to load ride bookings:', error)
      return []
    } finally {
      setLoadingRides(false)
    }
  }

  // Load rental bookings - completely rewritten
  const loadRentalBookings = async () => {
    setLoadingRentals(true)
    console.log('Loading rentals...')
    
    try {
      const response = await fetch('/api/rentals/user-bookings')
      const data = await response.json()
      
      console.log('API returned:', data)
      
      if (data.success && data.bookings && data.bookings.length > 0) {
        console.log(`Found ${data.bookings.length} bookings, updating state...`)
        
        // Force React to recognize this as a new array
        setRentalBookings(() => {
          const newBookings = JSON.parse(JSON.stringify(data.bookings))
          console.log('Setting state with:', newBookings)
          return newBookings
        })
        
        // Force component re-render with key change
        setRentalKey(prev => prev + 1)
        
        // Update stats
        const activeCount = data.bookings.filter((b: any) => 
          ['PENDING', 'CONFIRMED', 'ACTIVE'].includes(b.status)
        ).length
        
        setStats(prev => ({
          ...prev,
          rentalsActive: activeCount
        }))
        
        // Return active rentals for services
        return data.bookings
          .filter((b: any) => ['PENDING', 'CONFIRMED', 'ACTIVE'].includes(b.status))
          .map((booking: any) => ({
            id: `rental-${booking.id}`,
            type: 'rental' as const,
            status: booking.status === 'ACTIVE' ? 'active' : 'pending',
            title: `${booking.car.make} ${booking.car.model}`,
            subtitle: booking.bookingCode,
            time: new Date(booking.startDate).toLocaleDateString(),
            icon: Car
          }))
      }
      
      setRentalBookings([])
      return []
    } catch (error) {
      console.error('Error loading rentals:', error)
      setRentalBookings([])
      return []
    } finally {
      setLoadingRentals(false)
    }
  }

  // Load all bookings and combine active services
  const loadAllBookings = async () => {
    const [rides, rentals] = await Promise.all([
      loadRideBookings(),
      loadRentalBookings()
    ])
    
    setActiveServices([...rides, ...rentals])
  }

  // Load dashboard stats from API
  const loadDashboardStats = async () => {
    try {
      const response = await fetch('/api/user/dashboard-stats')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.stats) {
          setStats({
            totalSaved: data.stats.totalSaved,
            ridesBooked: data.stats.ridesBooked,
            hotelNights: data.stats.hotelNights,
            mealsOrdered: data.stats.mealsOrdered,
            carbonOffset: data.stats.carbonOffset,
            rentalsActive: data.stats.rentalsActive
          })
          setNotificationCount(data.stats.notificationCount || 0)
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    }
  }

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const savedCart = localStorage.getItem('itwhip_cart')
      if (savedCart) {
        setCartItems(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadServiceStatus = async () => {
    try {
      const status = await orchestrator.getServiceStatus()
      setServiceStatus(status)
    } catch (error) {
      console.error('Failed to load service status:', error)
    }
  }

  const handleServiceClick = (serviceId: string) => {
    if (serviceId === 'rental') {
      router.push('/rentals/search')
      return
    }
    
    setSelectedService(serviceId as any)
    
    if (isAtHotel && serviceId === 'ride') {
      setBookingInitialData({
        pickup: hotelName,
        isHotelPickup: true
      })
    } else {
      setBookingInitialData(null)
    }
    
    setShowBookingModal(true)
  }

  const handleBookingConfirm = async (bookingData: any) => {
    console.log('Booking confirmed:', bookingData)
    loadAllBookings()
  }

  const handleAddToCart = (item: any) => {
    const newCart = [...cartItems, { ...item, id: Date.now().toString() }]
    setCartItems(newCart)
    localStorage.setItem('itwhip_cart', JSON.stringify(newCart))
    setShowCart(true)
  }

  const handleRemoveFromCart = (itemId: string) => {
    const newCart = cartItems.filter(item => item.id !== itemId)
    setCartItems(newCart)
    localStorage.setItem('itwhip_cart', JSON.stringify(newCart))
  }

  const handleCheckout = () => {
    router.push('/checkout')
  }

  const handleRefresh = () => {
    console.log('Refreshing dashboard data...')
    loadDashboardData()
    loadDashboardStats()
    loadServiceStatus()
    loadAllBookings()
  }

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    </div>
  )

  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const userName = authenticatedUser?.name || user?.name || 'Guest'

  return (
    <div className="dashboard-container">
      {/* Top Action Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4 p-3 md:p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 md:space-x-4">
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
              Your Dashboard
            </h1>
            {activeServices.length > 0 && (
              <span className="inline-flex items-center px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                {activeServices.length} active
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-3">
            <button
              onClick={handleRefresh}
              className="p-1.5 md:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="hidden md:block p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg transition-colors"
              title="Toggle View"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative p-1.5 md:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg transition-colors"
              title="Cart"
            >
              <CreditCard className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => router.push('/notifications')}
              className="relative p-1.5 md:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Welcome Strip */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start sm:items-center space-x-2 sm:space-x-3">
            <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400 mt-1 sm:mt-0" />
            <div className="flex-1">
              <p className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">
                <span className="font-semibold">{orchestrator.getGreeting()}!</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{getCurrentTime()}</span>
              </p>
              <p className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mt-1">
                {userName}, explore services available near you
                <span className="ml-2 inline-flex items-center font-medium text-gray-700 dark:text-gray-300">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">Phoenix, AZ</span>
                </span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Quick Actions - 3 Core Services */}
        <div className="mt-4 flex flex-wrap gap-2">
          {CORE_SERVICES.map(service => (
            <button 
              key={service.id}
              onClick={() => handleServiceClick(service.id)} 
              className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-all text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <service.icon className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span>{service.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Ride Alert */}
      {rideBookings.filter(r => ['REQUESTED', 'DRIVER_ASSIGNED', 'IN_PROGRESS'].includes(r.status)).length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Car className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Active Ride
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Your ride is {rideBookings[0].status === 'IN_PROGRESS' ? 'in progress' : 'on the way'}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/rides/tracking')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              Track Ride
            </button>
          </div>
        </div>
      )}

      {/* Rental Verification Alert */}
      {rentalBookings.some(b => b.verificationStatus === 'pending' || b.verificationStatus === 'submitted') && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3" />
              <div>
                <p className="font-medium text-yellow-900 dark:text-yellow-100">
                  Verification Required
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  You have rental bookings that require document verification
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/rentals/dashboard/bookings')}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors"
            >
              View Bookings
            </button>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Saved</p>
              <p className="text-lg md:text-xl font-bold text-green-600 dark:text-green-400 mt-0.5">
                ${stats.totalSaved.toFixed(0)}
              </p>
            </div>
            <TrendingUp className="w-6 h-6 text-gray-400 opacity-60" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Rides</p>
              <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {stats.ridesBooked}
              </p>
            </div>
            <Car className="w-6 h-6 text-gray-400 opacity-60" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Nights</p>
              <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {stats.hotelNights}
              </p>
            </div>
            <Hotel className="w-6 h-6 text-gray-400 opacity-60" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Meals</p>
              <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {stats.mealsOrdered}
              </p>
            </div>
            <Package className="w-6 h-6 text-gray-400 opacity-60" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Rentals</p>
              <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {stats.rentalsActive}
              </p>
            </div>
            <Car className="w-6 h-6 text-gray-400 opacity-60" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">CO2 Saved</p>
              <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {stats.carbonOffset}kg
              </p>
            </div>
            <Leaf className="w-6 h-6 text-gray-400 opacity-60" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Services Section */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          {/* Active Services */}
          {activeServices.length > 0 && (
            <div className="mb-4">
              <Suspense fallback={<LoadingSpinner />}>
                <ActiveServices 
                  services={activeServices}
                  onServiceClick={(id) => {
                    if (id.startsWith('rental-')) {
                      const bookingId = id.replace('rental-', '')
                      router.push(`/rentals/dashboard/bookings/${bookingId}`)
                    } else if (id.startsWith('ride-')) {
                      router.push('/rides/tracking')
                    } else {
                      console.log('Service clicked:', id)
                    }
                  }}
                />
              </Suspense>
            </div>
          )}

          {/* Ride Bookings Section */}
          {rideBookings.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                  Your Rides
                </h2>
                <button
                  onClick={() => router.push('/rides/history')}
                  className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                >
                  View All
                </button>
              </div>
              
              <div className="space-y-3">
                {rideBookings.slice(0, 3).map(booking => (
                  <div 
                    key={booking.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => router.push('/rides/tracking')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Car className="w-6 h-6 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {booking.dropoffAddress.split(',')[0]}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {booking.pickupTime} • {booking.status}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          ${booking.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rental Bookings Section - Using separate component */}
          <RentalBookingsSection />

          {/* Hotel Mini Store or Empty State */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {isAtHotel ? 'Hotel Services' : 'Quick Booking'}
            </h2>
            
            <Suspense fallback={<LoadingSpinner />}>
              {isAtHotel && hotelId ? (
                <HotelMiniStore 
                  hotelId={hotelId}
                  roomNumber={reservation?.roomNumber}
                  onAddToCart={handleAddToCart}
                />
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start your journey with our services
                  </p>
                  <div className="flex justify-center gap-3">
                    {CORE_SERVICES.map(service => (
                      <button
                        key={service.id}
                        onClick={() => handleServiceClick(service.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                      >
                        {service.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Suspense>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 order-1 lg:order-2">
          {/* Cart Widget */}
          {showCart && cartItems.length > 0 && (
            <Suspense fallback={<LoadingSpinner />}>
              <Cart 
                items={cartItems}
                onRemoveItem={handleRemoveFromCart}
                onCheckout={handleCheckout}
                isCompact={true}
              />
            </Suspense>
          )}

          {/* Stats Widget - Hidden on mobile */}
          <div className="hidden lg:block">
            <Suspense fallback={<LoadingSpinner />}>
              <StatsWidget stats={stats} />
            </Suspense>
          </div>

          {/* Live Feed */}
          <Suspense fallback={<LoadingSpinner />}>
            <LiveFeed 
              city="Phoenix"
              limit={5}
            />
          </Suspense>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="mt-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Need help?</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Our support team is available 24/7
            </p>
          </div>
          <button
            onClick={() => router.push('/support')}
            className="bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm w-full sm:w-auto flex items-center justify-center space-x-2"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Contact Support</span>
          </button>
        </div>
      </div>

      {/* Booking Modal */}
      <Suspense fallback={null}>
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false)
            setSelectedService(null)
            setBookingInitialData(null)
          }}
          serviceType={selectedService}
          initialData={bookingInitialData}
          onConfirm={handleBookingConfirm}
        />
      </Suspense>
    </div>
  )
}