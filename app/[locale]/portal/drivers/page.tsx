// app/portal/drivers/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import dynamic from 'next/dynamic'
import Header from '@/app/components/Header'
import {
  IoArrowBackOutline,
  IoCarSportOutline,
  IoLocationOutline,
  IoPersonCircleOutline,
  IoTimeOutline,
  IoStarOutline,
  IoCallOutline,
  IoMailOutline,
  IoBanOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoFlashOutline,
  IoMapOutline,
  IoListOutline,
  IoGridOutline,
  IoSearchOutline,
  IoRefreshOutline,
  IoSendOutline,
  IoNotificationsOutline,
  IoSettingsOutline,
  IoCarOutline,
  IoRadioButtonOnOutline,
  IoRadioButtonOffOutline,
  IoNavigateOutline,
  IoSparklesOutline,
  IoPersonAddOutline,
  IoTrophyOutline,
  IoSwapHorizontalOutline,
  IoEyeOutline,
  IoBusinessOutline,
  IoWalletOutline,
  IoShieldCheckmarkOutline,
  IoWarningOutline,
  IoPeopleOutline,
  IoThunderstormOutline,
  IoAnalyticsOutline,
  IoCashOutline,
  IoTrendingUpOutline,
  IoAlertCircleOutline,
  IoRocketOutline,
  IoDocumentTextOutline,
  IoCalendarOutline,
  IoSpeedometerOutline,
  IoChevronForwardOutline
} from 'react-icons/io5'

// Dynamically import map component to avoid SSR issues
const DriverMapComponent = dynamic(
  () => import('../components/DriverMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[600px] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-b-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
        </div>
      </div>
    )
  }
)

// Mock driver data generator
const generateDrivers = () => {
  const firstNames = ['Marcus', 'Sarah', 'David', 'Jennifer', 'Michael', 'Lisa', 'James', 'Mary', 'Robert', 'Patricia']
  const lastNames = ['Thompson', 'Williams', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson']
  const vehicles = [
    { make: 'Tesla', model: 'Model S', type: 'Luxury EV' },
    { make: 'Mercedes', model: 'S-Class', type: 'Luxury' },
    { make: 'BMW', model: '7 Series', type: 'Luxury' },
    { make: 'Tesla', model: 'Model X', type: 'Luxury SUV' },
    { make: 'Cadillac', model: 'Escalade', type: 'Premium SUV' },
    { make: 'Lincoln', model: 'Navigator', type: 'Premium SUV' },
    { make: 'Audi', model: 'A8', type: 'Luxury' },
    { make: 'Lexus', model: 'LS', type: 'Luxury' },
    { make: 'Genesis', model: 'G90', type: 'Luxury' },
    { make: 'Porsche', model: 'Panamera', type: 'Sport Luxury' }
  ]
  
  const drivers = []
  for (let i = 0; i < 50; i++) {
    const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)]
    const status = Math.random() > 0.7 ? 'online' : Math.random() > 0.4 ? 'busy' : Math.random() > 0.2 ? 'offline' : 'break'
    const lat = 33.4484 + (Math.random() - 0.5) * 0.1
    const lng = -112.0740 + (Math.random() - 0.5) * 0.1
    
    drivers.push({
      id: `DRV${(1000 + i).toString()}`,
      name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)].charAt(0)}.`,
      photo: null,
      vehicle: `${vehicle.make} ${vehicle.model}`,
      vehicleType: vehicle.type,
      vehicleColor: ['Black', 'White', 'Silver', 'Blue', 'Gray'][Math.floor(Math.random() * 5)],
      licensePlate: `AZ${Math.floor(Math.random() * 9000) + 1000}`,
      rating: (4.5 + Math.random() * 0.5).toFixed(1),
      trips: Math.floor(Math.random() * 2000) + 100,
      earnings: Math.floor(Math.random() * 50000) + 10000,
      status,
      location: { lat, lng },
      distance: (Math.random() * 5 + 0.5).toFixed(1),
      eta: Math.floor(Math.random() * 15) + 2,
      responseTime: Math.floor(Math.random() * 30) + 10,
      acceptanceRate: Math.floor(Math.random() * 20) + 80,
      cancellationRate: Math.floor(Math.random() * 5),
      onlineHours: Math.floor(Math.random() * 60) + 20,
      peakHours: Math.floor(Math.random() * 30) + 10,
      preferredZones: ['Airport', 'Downtown', 'Scottsdale'][Math.floor(Math.random() * 3)],
      languages: ['English', 'Spanish', 'English, Spanish'][Math.floor(Math.random() * 3)],
      specializations: Math.random() > 0.7 ? ['Airport', 'VIP'] : ['Standard'],
      insurance: 'Active',
      background: 'Clear',
      vehicleInspection: 'Passed',
      documentsExpiry: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      joinedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastActive: Math.random() > 0.5 ? 'Now' : `${Math.floor(Math.random() * 60)} min ago`,
      phone: `(602) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      email: `driver${i}@example.com`,
      currentRide: status === 'busy' ? {
        pickup: 'Marriott Phoenix Resort',
        dropoff: 'Phoenix Sky Harbor Airport',
        passenger: 'Guest',
        fare: Math.floor(Math.random() * 50) + 20
      } : null
    })
  }
  return drivers
}

// Generate ride requests
const generateRideRequests = () => {
  const requests = []
  const locations = [
    'Fairmont Scottsdale Princess',
    'Four Seasons Resort Scottsdale',
    'The Phoenician',
    'Arizona Biltmore',
    'The Camby Hotel',
    'Mountain Shadows Resort'
  ]
  
  for (let i = 0; i < 8; i++) {
    requests.push({
      id: `REQ${(1000 + i).toString()}`,
      guest: `Guest ${Math.floor(Math.random() * 900) + 100}`,
      pickup: locations[Math.floor(Math.random() * locations.length)],
      dropoff: Math.random() > 0.5 ? 'Phoenix Sky Harbor Airport' : 'Downtown Phoenix',
      requestTime: `${Math.floor(Math.random() * 10)} min ago`,
      estimatedFare: Math.floor(Math.random() * 60) + 25,
      distance: (Math.random() * 15 + 2).toFixed(1),
      vip: Math.random() > 0.8,
      priority: Math.random() > 0.7 ? 'high' : 'normal',
      status: 'pending'
    })
  }
  return requests
}

export default function DriverCommandCenterPage() {
  const t = useTranslations('PortalDrivers')
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'map' | 'grid' | 'list'>('map')
  const [drivers, setDrivers] = useState<any[]>([])
  const [rideRequests, setRideRequests] = useState<any[]>([])
  const [selectedDriver, setSelectedDriver] = useState<any>(null)
  const [showDispatchModal, setShowDispatchModal] = useState(false)
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [showRecruitmentModal, setShowRecruitmentModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [mapCenter, setMapCenter] = useState({ lat: 33.4484, lng: -112.0740 })
  const [mapStyle, setMapStyle] = useState<'streets' | 'dark' | 'satellite' | 'navigation'>('dark')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  // Live metrics
  const [metrics, setMetrics] = useState({
    totalDrivers: 247,
    onlineDrivers: 47,
    activeRides: 12,
    offlineDrivers: 180,
    breakDrivers: 20,
    avgWaitTime: 6,
    avgResponseTime: 18,
    utilizationRate: 82,
    surgeMultiplier: 1.0,
    uberSurge: 2.8,
    guestSavings: 4238,
    marketShare: 34,
    peakPrediction: { time: '6:00 PM', needed: 65 },
    revenue: {
      today: 12847,
      week: 89234,
      month: 384729,
      lastMonth: 342891
    }
  })

  // Generate data only on client side
  useEffect(() => {
    setDrivers(generateDrivers())
    setRideRequests(generateRideRequests())
    setIsLoading(false)
  }, [])

  // Update metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        onlineDrivers: Math.floor(45 + Math.random() * 10),
        activeRides: Math.floor(8 + Math.random() * 8),
        avgWaitTime: Math.floor(4 + Math.random() * 4),
        utilizationRate: Math.floor(75 + Math.random() * 20),
        guestSavings: prev.guestSavings + Math.floor(Math.random() * 100),
        revenue: {
          ...prev.revenue,
          today: prev.revenue.today + Math.floor(Math.random() * 500)
        }
      }))
      
      // Randomly update driver positions
      setDrivers(prevDrivers => 
        prevDrivers.map(driver => ({
          ...driver,
          location: {
            lat: driver.location.lat + (Math.random() - 0.5) * 0.001,
            lng: driver.location.lng + (Math.random() - 0.5) * 0.001
          },
          distance: (Math.random() * 5 + 0.5).toFixed(1)
        }))
      )
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/portal/login')
  }

  // Filter drivers based on search and status
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         driver.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         driver.id.includes(searchQuery)
    const matchesFilter = filterStatus === 'all' || driver.status === filterStatus
    return matchesSearch && matchesFilter
  })

  // Dispatch ride to driver
  const handleDispatch = (driverId: string, requestId: string) => {
    const driver = drivers.find(d => d.id === driverId)
    const request = rideRequests.find(r => r.id === requestId)
    
    if (driver && request) {
      // Update driver status
      setDrivers(prev => prev.map(d => 
        d.id === driverId ? { ...d, status: 'busy', currentRide: request } : d
      ))
      
      // Remove request from queue
      setRideRequests(prev => prev.filter(r => r.id !== requestId))
      
      setShowDispatchModal(false)
      setSelectedRequest(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleGetAppClick={handleGetAppClick}
          handleSearchClick={handleSearchClick}
        />
      </div>

      {/* Page Header with Controls */}
      <div className="fixed top-14 md:top-16 left-0 right-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                href="/portal/dashboard"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <IoArrowBackOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <IoCarSportOutline className="w-6 h-6 text-amber-600" />
                  <span>{t('pageTitle')}</span>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('fleetManagement')}
                </p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => setShowDispatchModal(true)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition flex items-center space-x-2"
              >
                <IoFlashOutline className="w-5 h-5" />
                <span>{t('quickDispatch')}</span>
              </button>
              <button
                onClick={() => setShowBroadcastModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center space-x-2"
              >
                <IoSendOutline className="w-5 h-5" />
                <span>{t('broadcast')}</span>
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
                <IoNotificationsOutline className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
                <IoSettingsOutline className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8 py-3 border-t border-gray-200 dark:border-gray-800">
          <div className="overflow-x-auto">
            <div className="flex space-x-6 min-w-max">
              {/* Driver Status Breakdown */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <IoRadioButtonOnOutline className="w-4 h-4 text-green-600 animate-pulse" />
                  <div>
                    <div className="text-lg font-bold text-green-600">{metrics.onlineDrivers}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{t('online')}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <IoCarOutline className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-lg font-bold text-blue-600">{metrics.activeRides}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{t('active')}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <IoRadioButtonOffOutline className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-lg font-bold text-gray-600">{metrics.offlineDrivers}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{t('offline')}</div>
                  </div>
                </div>
              </div>

              <div className="h-12 w-px bg-gray-300 dark:bg-gray-700"></div>

              {/* Performance Metrics */}
              <div className="flex items-center space-x-4">
                <div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{metrics.avgWaitTime} min</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{t('avgWait')}</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{metrics.avgResponseTime}s</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{t('response')}</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{metrics.utilizationRate}%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{t('utilization')}</div>
                </div>
              </div>

              <div className="h-12 w-px bg-gray-300 dark:bg-gray-700"></div>

              {/* Surge Comparison */}
              <div className="flex items-center space-x-4">
                <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <div className="text-xs text-gray-600 dark:text-gray-400">{t('yourSurge')}</div>
                  <div className="text-lg font-bold text-green-600">{metrics.surgeMultiplier}x</div>
                </div>
                <div className="px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <div className="text-xs text-gray-600 dark:text-gray-400">{t('uberSurge')}</div>
                  <div className="text-lg font-bold text-red-600">{metrics.uberSurge}x</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">${metrics.guestSavings}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{t('savedToday')}</div>
                </div>
              </div>

              <div className="h-12 w-px bg-gray-300 dark:bg-gray-700"></div>

              {/* Revenue & Market Share */}
              <div className="flex items-center space-x-4">
                <div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">${(metrics.revenue.today / 1000).toFixed(1)}K</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Today</div>
                </div>
                <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Market Share</div>
                  <div className="text-lg font-bold text-purple-600">{metrics.marketShare}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Increased padding to clear sticky header */}
      <div className="pt-48 md:pt-52 lg:pt-48 px-2 sm:px-4 lg:px-8 pb-20">
        <div className="max-w-[1800px] mx-auto">
          {/* Controls Bar - Enhanced for mobile */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 md:mb-6 p-3 md:p-4">
            <div className="flex flex-col space-y-3">
              {/* Search - Full width on mobile */}
              <div className="w-full">
                <div className="relative">
                  <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 md:py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white text-sm md:text-base"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <IoCloseCircleOutline className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filters & View Mode - Responsive grid */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-3">
                {/* Left side - Status Filter */}
                <div className="flex items-center space-x-2 flex-1">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="flex-1 sm:flex-none px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="all">All Status</option>
                    <option value="online">Online ({drivers.filter(d => d.status === 'online').length})</option>
                    <option value="busy">Busy ({drivers.filter(d => d.status === 'busy').length})</option>
                    <option value="break">On Break ({drivers.filter(d => d.status === 'break').length})</option>
                    <option value="offline">Offline ({drivers.filter(d => d.status === 'offline').length})</option>
                  </select>

                  {/* Mobile-only quick filters */}
                  <div className="flex sm:hidden space-x-1">
                    <button
                      onClick={() => setFilterStatus('online')}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        filterStatus === 'online' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      Online
                    </button>
                    <button
                      onClick={() => setFilterStatus('busy')}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        filterStatus === 'busy' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      Active
                    </button>
                  </div>
                </div>

                {/* Right side - View toggles and refresh */}
                <div className="flex items-center justify-between sm:justify-end space-x-2">
                  {/* View Mode Toggles - Enhanced for mobile */}
                  <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('map')}
                      className={`px-2 sm:px-3 py-1.5 rounded flex items-center justify-center ${
                        viewMode === 'map' ? 'bg-white dark:bg-gray-900 shadow' : ''
                      } transition-all duration-200`}
                      title="Map View"
                      aria-label="Map View"
                    >
                      <IoMapOutline className="w-4 h-4" />
                      <span className="hidden sm:inline ml-1 text-sm">Map</span>
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-2 sm:px-3 py-1.5 rounded flex items-center justify-center ${
                        viewMode === 'grid' ? 'bg-white dark:bg-gray-900 shadow' : ''
                      } transition-all duration-200`}
                      title="Grid View"
                      aria-label="Grid View"
                    >
                      <IoGridOutline className="w-4 h-4" />
                      <span className="hidden sm:inline ml-1 text-sm">Grid</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-2 sm:px-3 py-1.5 rounded flex items-center justify-center ${
                        viewMode === 'list' ? 'bg-white dark:bg-gray-900 shadow' : ''
                      } transition-all duration-200`}
                      title="List View"
                      aria-label="List View"
                    >
                      <IoListOutline className="w-4 h-4" />
                      <span className="hidden sm:inline ml-1 text-sm">List</span>
                    </button>
                  </div>

                  {/* Action buttons */}
                  <button 
                    onClick={() => {
                      setDrivers(generateDrivers())
                      setRideRequests(generateRideRequests())
                    }}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Refresh Data"
                    aria-label="Refresh Data"
                  >
                    <IoRefreshOutline className="w-5 h-5" />
                  </button>

                  {/* Mobile menu for additional actions */}
                  <div className="sm:hidden">
                    <button
                      onClick={() => setShowDispatchModal(true)}
                      className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                      title="Quick Actions"
                      aria-label="Quick Actions"
                    >
                      <IoFlashOutline className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Results count and stats - Mobile optimized */}
              {filteredDrivers.length > 0 && (
                <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>
                    Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{filteredDrivers.length}</span> of {drivers.length} drivers
                  </span>
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      {drivers.filter(d => d.status === 'online').length} available
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                      {drivers.filter(d => d.status === 'busy').length} active
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading driver data...</p>
              </div>
            </div>
          )}

          {/* Map View - Mobile Optimized */}
          {viewMode === 'map' && !isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
              {/* Map Container - Full width on mobile */}
              <div className="lg:col-span-3 order-2 lg:order-1">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                  <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">{t('liveDriverMap')}</h2>
                      
                      {/* Map Controls - Mobile Optimized */}
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={mapStyle}
                          onChange={(e) => setMapStyle(e.target.value as any)}
                          className="px-2 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs md:text-sm"
                        >
                          <option value="streets">Streets</option>
                          <option value="dark">Dark</option>
                          <option value="satellite">Satellite</option>
                          <option value="navigation">Navigation</option>
                        </select>
                        
                        <button className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-xs md:text-sm flex items-center">
                          <IoThunderstormOutline className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          <span className="hidden sm:inline">Surge</span>
                          <span className="sm:hidden">Surge</span>
                        </button>
                        
                        <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-xs md:text-sm flex items-center">
                          <IoLocationOutline className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          <span className="hidden sm:inline">Zones</span>
                          <span className="sm:hidden">Zone</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mapbox Map - Responsive height */}
                  <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-b-lg">
                    <DriverMapComponent 
                      drivers={filteredDrivers}
                      onDriverSelect={setSelectedDriver}
                      selectedDriver={selectedDriver}
                      showSurgeZones={true}
                      showTraffic={false}
                      mapStyle={mapStyle}
                    />
                  </div>
                </div>
              </div>

              {/* Ride Queue Panel - Above map on mobile */}
              <div className="order-1 lg:order-2 space-y-4 lg:space-y-6">
                {/* Pending Requests - Mobile Optimized */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
                  <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">{t('rideQueue')}</h3>
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-semibold">
                        {rideRequests.length} pending
                      </span>
                    </div>
                  </div>
                  
                  <div className="max-h-[300px] lg:max-h-[400px] overflow-y-auto">
                    {rideRequests.length > 0 ? (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {rideRequests.map(request => (
                          <div key={request.id} className="p-3 md:p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                                    {request.guest}
                                  </span>
                                  {request.vip && (
                                    <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">VIP</span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {request.requestTime}
                                </div>
                              </div>
                              <span className="text-sm font-bold text-green-600">
                                ${request.estimatedFare}
                              </span>
                            </div>
                            
                            <div className="space-y-1 text-xs">
                              <div className="flex items-start space-x-1">
                                <IoLocationOutline className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-400 truncate">{request.pickup}</span>
                              </div>
                              <div className="flex items-start space-x-1">
                                <IoNavigateOutline className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-400 truncate">{request.dropoff}</span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => {
                                setSelectedRequest(request)
                                setShowDispatchModal(true)
                              }}
                              className="w-full mt-3 px-3 py-1.5 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700 transition active:scale-95"
                            >
                              Assign Driver
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 md:p-8 text-center">
                        <IoCheckmarkCircleOutline className="w-10 md:w-12 h-10 md:h-12 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">All rides assigned!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats - Mobile Optimized */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg shadow p-3 md:p-4 border border-amber-200 dark:border-amber-800">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('fleetPerformance')}</h3>
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{t('acceptanceRate')}</span>
                      <span className="text-xs md:text-sm font-bold text-green-600">94%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{t('avgTripTime')}</span>
                      <span className="text-xs md:text-sm font-bold text-gray-900 dark:text-white">18 min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{t('peakHourAlert')}</span>
                      <span className="text-xs md:text-sm font-bold text-orange-600">6 PM</span>
                    </div>
                    <div className="pt-3 border-t border-amber-200 dark:border-amber-700">
                      <button
                        onClick={() => setShowRecruitmentModal(true)}
                        className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition text-xs md:text-sm active:scale-95"
                      >
                        <IoPersonAddOutline className="w-4 h-4 inline mr-1" />
                        Recruit More Drivers
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid View - Mobile Optimized */}
          {viewMode === 'grid' && !isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {filteredDrivers.map(driver => (
                <div key={driver.id} className="bg-white dark:bg-gray-900 rounded-lg shadow hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                  <div className="p-3 md:p-4">
                    {/* Driver Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <IoPersonCircleOutline className="w-10 md:w-12 h-10 md:h-12 text-gray-400" />
                          <div className={`absolute bottom-0 right-0 w-2.5 md:w-3 h-2.5 md:h-3 rounded-full border-2 border-white dark:border-gray-900 ${
                            driver.status === 'online' ? 'bg-green-500' :
                            driver.status === 'busy' ? 'bg-blue-500' :
                            driver.status === 'break' ? 'bg-yellow-500' :
                            'bg-gray-400'
                          }`}></div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base truncate">{driver.name}</h4>
                          <p className="text-xs text-gray-500">{driver.id}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        driver.status === 'online' ? 'bg-green-100 text-green-700' :
                        driver.status === 'busy' ? 'bg-blue-100 text-blue-700' :
                        driver.status === 'break' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {driver.status}
                      </span>
                    </div>

                    {/* Vehicle Info */}
                    <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {driver.vehicle}
                      </div>
                      <div className="text-xs text-gray-500">
                        {driver.vehicleColor} • {driver.licensePlate}
                      </div>
                    </div>

                    {/* Stats Grid - Mobile Responsive */}
                    <div className="grid grid-cols-3 gap-1.5 md:gap-2 mb-3 text-center">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded p-1.5 md:p-2">
                        <div className="flex items-center justify-center space-x-1">
                          <IoStarOutline className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs md:text-sm font-bold text-gray-900 dark:text-white">{driver.rating}</span>
                        </div>
                        <div className="text-xs text-gray-500">Rating</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded p-1.5 md:p-2">
                        <div className="text-xs md:text-sm font-bold text-gray-900 dark:text-white">{driver.trips}</div>
                        <div className="text-xs text-gray-500">Trips</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded p-1.5 md:p-2">
                        <div className="text-xs md:text-sm font-bold text-green-600">${(driver.earnings / 1000).toFixed(0)}K</div>
                        <div className="text-xs text-gray-500">Earned</div>
                      </div>
                    </div>

                    {/* Current Activity */}
                    {driver.currentRide && (
                      <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                        <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Current Ride</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <div className="truncate">{driver.currentRide.pickup}</div>
                          <div className="truncate">→ {driver.currentRide.dropoff}</div>
                          <div className="font-semibold text-blue-600 mt-1">${driver.currentRide.fare}</div>
                        </div>
                      </div>
                    )}

                    {/* Location & Distance */}
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <IoLocationOutline className="w-3 h-3 flex-shrink-0" />
                        <span>{driver.distance} mi away</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <IoTimeOutline className="w-3 h-3 flex-shrink-0" />
                        <span>{driver.eta} min ETA</span>
                      </div>
                    </div>

                    {/* Action Buttons - Mobile Optimized */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedDriver(driver)}
                        className="flex-1 px-3 py-2 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700 transition-colors active:scale-95"
                        aria-label={`View details for ${driver.name}`}
                      >
                        View Details
                      </button>
                      <button 
                        className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors active:scale-95"
                        aria-label={`Call ${driver.name}`}
                      >
                        <IoCallOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button 
                        className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors active:scale-95"
                        aria-label={`Message ${driver.name}`}
                      >
                        <IoMailOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && !isLoading && (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">{t('driver')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">{t('vehicle')}</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">{t('status')}</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">{t('rating')}</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">{t('trips')}</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">{t('earnings')}</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">{t('response')}</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">{t('distance')}</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">{t('lastActive')}</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredDrivers.map(driver => (
                      <tr key={driver.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <IoPersonCircleOutline className="w-8 h-8 text-gray-400" />
                              <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white dark:border-gray-900 ${
                                driver.status === 'online' ? 'bg-green-500' :
                                driver.status === 'busy' ? 'bg-blue-500' :
                                driver.status === 'break' ? 'bg-yellow-500' :
                                'bg-gray-400'
                              }`}></div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{driver.name}</div>
                              <div className="text-xs text-gray-500">{driver.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900 dark:text-white">{driver.vehicle}</div>
                          <div className="text-xs text-gray-500">{driver.vehicleColor} • {driver.licensePlate}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            driver.status === 'online' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            driver.status === 'busy' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            driver.status === 'break' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {driver.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <IoStarOutline className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-semibold text-gray-900 dark:text-white">{driver.rating}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                          {driver.trips}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-green-600">
                          ${(driver.earnings / 1000).toFixed(1)}K
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                          {driver.responseTime}s
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                          {driver.distance} mi
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                          {driver.lastActive}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => setSelectedDriver(driver)}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                              title="View Details"
                            >
                              <IoEyeOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition" title="Call">
                              <IoCallOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition" title="Message">
                              <IoMailOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition" title="Block">
                              <IoBanOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bottom Stats Dashboard - Mobile Optimized */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {/* Performance Gauge */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-3 md:p-4">
              <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 md:mb-3">{t('fleetPerformance')}</h4>
              <div className="space-y-2 md:space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Acceptance</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">94%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 md:h-2">
                    <div className="bg-green-600 h-1.5 md:h-2 rounded-full transition-all duration-300" style={{ width: '94%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Completion</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">98%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 md:h-2">
                    <div className="bg-blue-600 h-1.5 md:h-2 rounded-full transition-all duration-300" style={{ width: '98%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Impact */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg shadow p-3 md:p-4 border border-green-200 dark:border-green-800">
              <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 md:mb-3">{t('revenueImpact')}</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Today</span>
                  <span className="text-base md:text-lg font-bold text-green-600">${(metrics.revenue.today / 1000).toFixed(1)}K</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">vs Yesterday</span>
                  <span className="text-xs md:text-sm font-bold text-green-600">+12%</span>
                </div>
                <div className="text-xs text-gray-500 pt-2 border-t border-green-200 dark:border-green-700">
                  Revenue share to hotel
                </div>
              </div>
            </div>

            {/* Competition Tracker */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg shadow p-3 md:p-4 border border-red-200 dark:border-red-800">
              <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 md:mb-3">vs Competition</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Uber Surge</span>
                  <span className="text-base md:text-lg font-bold text-red-600">{metrics.uberSurge}x</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Guest Savings</span>
                  <span className="text-xs md:text-sm font-bold text-green-600">${metrics.guestSavings}</span>
                </div>
                <div className="text-xs text-gray-500 pt-2 border-t border-red-200 dark:border-red-700">
                  Beating market by 64%
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg shadow p-3 md:p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white">{t('aiInsights')}</h4>
                <IoSparklesOutline className="w-4 h-4 text-purple-600 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="text-xs">
                  <div className="font-semibold text-purple-700 dark:text-purple-400">Peak Alert</div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Need {metrics.peakPrediction.needed - metrics.onlineDrivers} more drivers at {metrics.peakPrediction.time}
                  </div>
                </div>
                <button className="w-full mt-2 px-3 py-1.5 bg-purple-600 text-white rounded text-xs font-semibold hover:bg-purple-700 transition-colors active:scale-95">
                  Alert All Drivers
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Details Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 p-6 border-b border-gray-200 dark:border-gray-700 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <IoPersonCircleOutline className="w-16 h-16 text-gray-400" />
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${
                      selectedDriver.status === 'online' ? 'bg-green-500' :
                      selectedDriver.status === 'busy' ? 'bg-blue-500' :
                      selectedDriver.status === 'break' ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`}></div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedDriver.name}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedDriver.id} • {selectedDriver.vehicle}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDriver(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <IoCloseCircleOutline className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Performance Stats */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <IoStarOutline className="w-5 h-5 text-yellow-500 fill-current" />
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">{selectedDriver.rating}</span>
                        </div>
                        <p className="text-xs text-gray-500">Rating</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedDriver.trips}</div>
                        <p className="text-xs text-gray-500">Total Trips</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">${(selectedDriver.earnings / 1000).toFixed(0)}K</div>
                        <p className="text-xs text-gray-500">Earnings</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedDriver.acceptanceRate}%</div>
                        <p className="text-xs text-gray-500">Accept Rate</p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vehicle Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Vehicle</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedDriver.vehicle}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Type</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedDriver.vehicleType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Color</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedDriver.vehicleColor}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">License Plate</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedDriver.licensePlate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Inspection</p>
                        <p className="font-medium text-green-600">{selectedDriver.vehicleInspection}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Documents Expire</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedDriver.documentsExpiry}</p>
                      </div>
                    </div>
                  </div>

                  {/* Activity Stats */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Online Hours (This Week)</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{selectedDriver.onlineHours} hrs</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Peak Hours Worked</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{selectedDriver.peakHours} hrs</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{selectedDriver.responseTime}s avg</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Cancellation Rate</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{selectedDriver.cancellationRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                  {/* Contact Info */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedDriver.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{selectedDriver.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Languages</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedDriver.languages}</p>
                      </div>
                    </div>
                  </div>

                  {/* Compliance Status */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compliance</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Insurance</span>
                        <span className="flex items-center space-x-1">
                          <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-green-600">{selectedDriver.insurance}</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Background</span>
                        <span className="flex items-center space-x-1">
                          <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-green-600">{selectedDriver.background}</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Member Since</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedDriver.joinedDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center space-x-2">
                      <IoCallOutline className="w-5 h-5" />
                      <span>Call Driver</span>
                    </button>
                    <button className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center justify-center space-x-2">
                      <IoMailOutline className="w-5 h-5" />
                      <span>Send Message</span>
                    </button>
                    <button className="w-full px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition flex items-center justify-center space-x-2">
                      <IoBanOutline className="w-5 h-5" />
                      <span>Suspend Driver</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Dispatch</h2>
                <button
                  onClick={() => {
                    setShowDispatchModal(false)
                    setSelectedRequest(null)
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <IoCloseCircleOutline className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {selectedRequest && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Selected Request</h3>
                  <div className="text-sm">
                    <p className="text-gray-600 dark:text-gray-400">Guest: {selectedRequest.guest}</p>
                    <p className="text-gray-600 dark:text-gray-400">From: {selectedRequest.pickup}</p>
                    <p className="text-gray-600 dark:text-gray-400">To: {selectedRequest.dropoff}</p>
                    <p className="font-semibold text-green-600 mt-1">Fare: ${selectedRequest.estimatedFare}</p>
                  </div>
                </div>
              )}

              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Available Drivers</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredDrivers.filter(d => d.status === 'online').slice(0, 10).map(driver => (
                  <div key={driver.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <IoPersonCircleOutline className="w-10 h-10 text-gray-400" />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white dark:border-gray-800"></div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{driver.name}</p>
                        <p className="text-xs text-gray-500">{driver.vehicle} • {driver.distance} mi away</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <IoStarOutline className="w-3 h-3 text-yellow-500" />
                          <span className="text-sm font-semibold">{driver.rating}</span>
                        </div>
                        <p className="text-xs text-gray-500">{driver.eta} min ETA</p>
                      </div>
                      <button
                        onClick={() => {
                          if (selectedRequest) {
                            handleDispatch(driver.id, selectedRequest.id)
                          }
                        }}
                        className="px-3 py-1.5 bg-amber-600 text-white rounded text-sm font-semibold hover:bg-amber-700 transition"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Broadcast Message</h2>
                <button
                  onClick={() => setShowBroadcastModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <IoCloseCircleOutline className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Audience
                </label>
                <select className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <option>All Drivers</option>
                  <option>Online Drivers</option>
                  <option>Offline Drivers</option>
                  <option>Top Performers</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                    <IoNotificationsOutline className="w-4 h-4 inline mr-1" />
                    Alert
                  </button>
                  <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold">
                    <IoRocketOutline className="w-4 h-4 inline mr-1" />
                    Incentive
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg h-32 resize-none"
                  placeholder="Type your message here..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowBroadcastModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                  <IoSendOutline className="w-5 h-5 inline mr-1" />
                  Send Broadcast
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recruitment Modal */}
      {showRecruitmentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Driver Recruitment Campaign</h2>
                <button
                  onClick={() => setShowRecruitmentModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <IoCloseCircleOutline className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Current Need</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Based on demand analysis, you need <span className="font-bold text-amber-600">18 more drivers</span> for optimal coverage.
                </p>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Campaign Options</h3>
              <div className="space-y-3">
                <label className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  <input type="radio" name="campaign" className="mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Sign-up Bonus Campaign</p>
                    <p className="text-sm text-gray-500">$500 bonus for first 20 drivers</p>
                  </div>
                </label>
                <label className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  <input type="radio" name="campaign" className="mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Referral Program</p>
                    <p className="text-sm text-gray-500">$200 for each successful referral</p>
                  </div>
                </label>
                <label className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  <input type="radio" name="campaign" className="mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Social Media Campaign</p>
                    <p className="text-sm text-gray-500">Targeted ads on Facebook & Instagram</p>
                  </div>
                </label>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setShowRecruitmentModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition">
                  <IoPersonAddOutline className="w-5 h-5 inline mr-1" />
                  Launch Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}