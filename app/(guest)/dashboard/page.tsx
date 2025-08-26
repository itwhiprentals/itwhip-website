// app/(guest)/dashboard/page.tsx
// Main Dashboard Page - Fixed stats boxes and integrated booking modal

'use client'

import { useState, useEffect, Suspense, lazy } from 'react'
import { useRouter } from 'next/navigation'
import { 
  IoCarOutline,
  IoBedOutline,
  IoRestaurantOutline,
  IoAirplaneOutline,
  IoCarSportOutline,
  IoGiftOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoTrendingUp,
  IoWalletOutline,
  IoNotificationsOutline,
  IoSearchOutline,
  IoGridOutline,
  IoListOutline,
  IoRefreshOutline,
  IoSparklesOutline
} from 'react-icons/io5'
import { useHotel } from './components/HotelContext'
import orchestrator from './orchestrator'

// Lazy load components for better performance
const ServiceGrid = lazy(() => import('./components/ServiceGrid'))
const HotelMiniStore = lazy(() => import('./components/HotelMiniStore'))
const AICommandStrip = lazy(() => import('./components/AICommandStrip'))
const ActiveServices = lazy(() => import('./components/ActiveServices'))
const Cart = lazy(() => import('./widgets/Cart'))
const LiveFeed = lazy(() => import('./widgets/LiveFeed'))
const StatsWidget = lazy(() => import('./widgets/StatsWidget'))
const BookingModal = lazy(() => import('./modals/BookingModal'))

// Types
interface DashboardStats {
  totalSaved: number
  ridesBooked: number
  hotelNights: number
  mealsOrdered: number
  carbonOffset: number
}

interface ActiveService {
  id: string
  type: 'ride' | 'hotel' | 'food' | 'rental'
  status: 'pending' | 'active' | 'completed'
  title: string
  subtitle: string
  time: string
  icon: any
}

export default function DashboardPage() {
  const router = useRouter()
  const { isAtHotel, hotelId, hotelName, reservation, user } = useHotel()
  
  // State management
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    totalSaved: 1247.50,
    ridesBooked: 23,
    hotelNights: 7,
    mealsOrdered: 15,
    carbonOffset: 45.2,
  })
  const [activeServices, setActiveServices] = useState<ActiveService[]>([
    {
      id: '1',
      type: 'ride',
      status: 'active',
      title: 'Airport Transfer',
      subtitle: 'PHX Sky Harbor → Downtown Hotel',
      time: 'Tomorrow 10:00 AM',
      icon: IoCarOutline
    },
    {
      id: '2',
      type: 'hotel',
      status: 'pending',
      title: 'Marriott Downtown',
      subtitle: 'Check-in pending',
      time: 'Today 3:00 PM',
      icon: IoBedOutline
    },
    {
      id: '3',
      type: 'food',
      status: 'completed',
      title: 'Room Service',
      subtitle: 'Delivered to Room 412',
      time: '2 hours ago',
      icon: IoRestaurantOutline
    }
  ])
  const [cartItems, setCartItems] = useState<any[]>([])
  const [showCart, setShowCart] = useState(false)
  const [serviceStatus, setServiceStatus] = useState<any>(null)
  
  // Modal state
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedService, setSelectedService] = useState<'ride' | 'hotel' | 'food' | 'rental' | 'flight' | 'bundle' | null>(null)
  const [bookingInitialData, setBookingInitialData] = useState<any>(null)

  // Load dashboard data
  useEffect(() => {
    loadDashboardData()
    loadServiceStatus()
  }, [])

  // Load user stats and active services
  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Mock API calls - replace with actual API calls
      // const statsResponse = await fetch('/api/user/stats')
      // const servicesResponse = await fetch('/api/user/active-services')
      
      // Load cart from localStorage
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

  // Load service availability
  const loadServiceStatus = async () => {
    try {
      const status = await orchestrator.getServiceStatus()
      setServiceStatus(status)
    } catch (error) {
      console.error('Failed to load service status:', error)
    }
  }

  // Handle service selection - Now opens modal instead of routing
  const handleServiceClick = (serviceId: string) => {
    setSelectedService(serviceId as any)
    
    // Set initial data based on context
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

  // Handle booking confirmation
  const handleBookingConfirm = async (bookingData: any) => {
    console.log('Booking confirmed:', bookingData)
    
    // Add to active services
    const newService: ActiveService = {
      id: Date.now().toString(),
      type: bookingData.serviceType,
      status: 'pending',
      title: `${bookingData.serviceType.charAt(0).toUpperCase() + bookingData.serviceType.slice(1)} Booking`,
      subtitle: 'Processing...',
      time: 'Just now',
      icon: getServiceIcon(bookingData.serviceType)
    }
    
    setActiveServices([newService, ...activeServices])
    
    // Show success notification
    // You can add a toast notification here
  }

  // Get service icon
  const getServiceIcon = (serviceType: string) => {
    const iconMap: Record<string, any> = {
      ride: IoCarOutline,
      hotel: IoBedOutline,
      food: IoRestaurantOutline,
      rental: IoCarSportOutline,
      flight: IoAirplaneOutline,
      bundle: IoGiftOutline
    }
    return iconMap[serviceType] || IoCheckmarkCircle
  }

  // Handle cart actions
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

  // Refresh dashboard
  const handleRefresh = () => {
    loadDashboardData()
    loadServiceStatus()
  }

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    </div>
  )

  // Get current time
  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

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
              <IoRefreshOutline className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="hidden md:block p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg transition-colors"
              title="Toggle View"
            >
              {viewMode === 'grid' ? <IoListOutline className="w-5 h-5" /> : <IoGridOutline className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative p-1.5 md:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg transition-colors"
              title="Cart"
            >
              <IoWalletOutline className="w-4 h-4 md:w-5 md:h-5" />
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
              <IoNotificationsOutline className="w-4 h-4 md:w-5 md:h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Command Strip */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start sm:items-center space-x-2 sm:space-x-3">
            <IoSparklesOutline className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 sm:mt-0" />
            <div className="flex-1">
              <p className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">
                <span className="font-semibold">{orchestrator.getGreeting()}!</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{getCurrentTime()}</span>
              </p>
              <p className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mt-1">
                {user?.name || 'Guest'}, explore services available near you
                <span className="ml-2 inline-flex items-center font-medium text-gray-700 dark:text-gray-300">
                  <IoLocationOutline className="w-4 h-4 mr-1" />
                  <span className="text-sm">Phoenix, AZ</span>
                </span>
              </p>
            </div>
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
            Take Action
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">Quick actions:</span>
          <button onClick={() => handleServiceClick('ride')} className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium">
            Book ride
          </button>
          <span className="text-gray-400 dark:text-gray-500">•</span>
          <button onClick={() => handleServiceClick('food')} className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium">
            Order food
          </button>
          <span className="text-gray-400 dark:text-gray-500">•</span>
          <button onClick={() => handleServiceClick('hotel')} className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium">
            Find hotel
          </button>
        </div>
      </div>

      {/* Stats Overview - FIXED: Removed aspect-square for compact boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Saved</p>
              <p className="text-lg md:text-xl font-bold text-green-600 dark:text-green-400 mt-0.5">
                ${stats.totalSaved.toFixed(0)}
              </p>
            </div>
            <IoTrendingUp className="w-5 h-5 text-green-500 dark:text-green-400 opacity-60" />
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
            <IoCarOutline className="w-5 h-5 text-blue-500 dark:text-blue-400 opacity-60" />
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
            <IoBedOutline className="w-5 h-5 text-purple-500 dark:text-purple-400 opacity-60" />
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
            <IoRestaurantOutline className="w-5 h-5 text-orange-500 dark:text-orange-400 opacity-60" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 p-3 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">CO2 Saved</p>
              <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {stats.carbonOffset}kg
              </p>
            </div>
            <IoCheckmarkCircle className="w-5 h-5 text-green-500 dark:text-green-400 opacity-60" />
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
                  onServiceClick={(id) => console.log('Service clicked:', id)}
                />
              </Suspense>
            </div>
          )}

          {/* Service Grid or Hotel Mini Store */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {isAtHotel ? 'Hotel Services' : 'Book Services'}
            </h2>
            
            <Suspense fallback={<LoadingSpinner />}>
              {isAtHotel && hotelId ? (
                <HotelMiniStore 
                  hotelId={hotelId}
                  roomNumber={reservation?.roomNumber}
                  onAddToCart={handleAddToCart}
                />
              ) : (
                <ServiceGrid 
                  services={orchestrator.SERVICES}
                  onServiceClick={handleServiceClick}
                  viewMode={viewMode}
                  serviceStatus={serviceStatus}
                />
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
            className="bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm w-full sm:w-auto"
          >
            Contact Support
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