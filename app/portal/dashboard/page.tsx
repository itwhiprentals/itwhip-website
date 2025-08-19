// app/portal/dashboard/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '../../components/Header'
import { 
  IoWarningOutline,
  IoTrendingDownOutline,
  IoTrendingUpOutline,
  IoCarOutline,
  IoPeopleOutline,
  IoCashOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircle,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoAirplaneOutline,
  IoBusinessOutline,
  IoStatsChartOutline,
  IoArrowUpOutline,
  IoArrowDownOutline,
  IoSparklesOutline,
  IoRocketOutline,
  IoFlashOutline,
  IoNotificationsOutline,
  IoSettingsOutline,
  IoLogOutOutline,
  IoDownloadOutline,
  IoMailOutline,
  IoCallOutline,
  IoChevronForwardOutline,
  IoStarOutline,
  IoInformationCircleOutline,
  IoMenuOutline,
  IoCloseOutline,
  IoGridOutline,
  IoAnalyticsOutline,
  IoDocumentTextOutline,
  IoLocationOutline,
  IoShieldCheckmarkOutline,
  IoBanOutline,
  IoPersonAddOutline,
  IoSendOutline,
  IoWalletOutline,
  IoThunderstormOutline,
  IoMapOutline,
  IoCarSportOutline,
  IoPersonCircleOutline,
  IoSwapHorizontalOutline,
  IoEyeOutline,
  IoPulseOutline,
  IoBedOutline,
  IoTodayOutline,
  IoTrendingUpSharp,
  IoCalendarOutline,
  IoRefreshOutline,
  IoSearchOutline,
  IoAddCircleOutline,
  IoRemoveCircleOutline,
  IoReorderThreeOutline,
  IoKeyOutline,
  IoWifiOutline,
  IoPricetagsOutline
} from 'react-icons/io5'
import { arizonaHotels, getHotelByCode, generateMetrics, getRandomComplaint } from '@/app/data/hotel-database'
import { 
  generateCompleteDashboardMetrics, 
  generateUrgencyMessage,
  generateComplaintTime,
  generateHourlyLoss
} from '@/app/lib/generators'

export default function PortalDashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showDriverModal, setShowDriverModal] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<any>(null)
  
  // Header state management for main nav
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers for main nav
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    window.location.href = '/portal/login'
  }
  
  // Get hotel data from verification or URL params
  const [hotelData, setHotelData] = useState<any>(null)
  const [propertyCode, setPropertyCode] = useState('')
  const [timeRange, setTimeRange] = useState('30d')
  
  // Check if property is verified and load hotel data
  useEffect(() => {
    // Try to get from localStorage first
    let code = localStorage.getItem('propertyCode')
    const verified = localStorage.getItem('propertyVerified')
    
    // Or get from URL params (from verify page)
    const urlCode = searchParams.get('code')
    if (urlCode) {
      code = urlCode
      localStorage.setItem('propertyCode', urlCode)
      localStorage.setItem('propertyVerified', 'true')
    }
    
    if (!code || !verified) {
      router.push('/portal/login')
      return
    }
    
    // Load hotel data from database
    const hotel = getHotelByCode(code)
    if (hotel) {
      setHotelData(hotel)
      setPropertyCode(code)
    } else {
      // If not in database, create mock data
      setHotelData({
        name: searchParams.get('hotel') || 'Your Property',
        address: '123 Main St, Phoenix, AZ',
        tier: 'BASIC',
        status: 'LOSING_MONEY',
        monthlyPotential: 67433,
        monthlyRevenue: 0,
        missedBookings: 847,
        competitors: ['SCF0001PH', 'SCF0002FS', 'SCF0003FM'],
        guestComplaints: [
          'Other hotels offer instant rides',
          'Paid $150 on surge pricing',
          'Why no Tesla service like Four Seasons?'
        ]
      })
      setPropertyCode(code)
    }
  }, [router, searchParams])

  // Generate dynamic metrics for this hotel
  const [dynamicMetrics, setDynamicMetrics] = useState<any>(null)
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null)
  
  useEffect(() => {
    if (propertyCode && hotelData) {
      const metrics = generateMetrics(propertyCode)
      setDynamicMetrics(metrics)
      
      // Generate complete dashboard metrics
      const fullMetrics = generateCompleteDashboardMetrics(propertyCode, hotelData)
      setDashboardMetrics(fullMetrics)
    }
  }, [propertyCode, hotelData])

  // Live metrics that update to create urgency
  const [liveMetrics, setLiveMetrics] = useState({
    missedRevenue: 0,
    guestRequests: 234,
    competitorAdvantage: 89,
    currentHourRequests: 12,
    airportSurge: 2.8,
    urgencyMessage: '',
    hourlyLoss: 0
  })

  // Reservation metrics
  const [reservationMetrics, setReservationMetrics] = useState({
    todayArrivals: 34,
    todayDepartures: 28,
    currentOccupancy: 87,
    weeklyRevenue: 142847,
    averageRate: 289,
    walkIns: 3,
    cancellations: 2,
    noShows: 1,
    vipGuests: 5,
    groupBookings: 2,
    recentBookings: [
      { guest: 'Michael Chen', room: '412', checkIn: 'Today 3PM', nights: 3, rate: '$459', source: 'Direct', vip: true },
      { guest: 'Sarah Williams', room: '218', checkIn: 'Today 4PM', nights: 2, rate: '$329', source: 'ItWhip', vip: false },
      { guest: 'David Martinez', room: '806', checkIn: 'Today 5PM', nights: 1, rate: '$589', source: 'Expedia', vip: false },
      { guest: 'Jennifer Lee', room: '1012', checkIn: 'Tomorrow 2PM', nights: 4, rate: '$689', source: 'ItWhip', vip: true }
    ],
    upcomingArrivals: [
      { time: '2:00 PM', count: 5, rooms: ['412', '218', '307', '509', '612'] },
      { time: '3:00 PM', count: 8, rooms: ['806', '912', '1012', '1105', '203', '405', '608', '710'] },
      { time: '4:00 PM', count: 12, rooms: ['Multiple'] },
      { time: '5:00 PM', count: 9, rooms: ['Multiple'] }
    ]
  })

  // Driver metrics
  const [driverMetrics, setDriverMetrics] = useState({
    availableDrivers: 47,
    activeRides: 12,
    avgWaitTime: 6,
    peakDriversNeeded: 65,
    currentUtilization: 82,
    topDrivers: [
      { name: 'Marcus T.', vehicle: 'Tesla Model S', rating: 4.9, rides: 847, earnings: '$12,847', status: 'active' },
      { name: 'Sarah L.', vehicle: 'Mercedes S-Class', rating: 4.8, rides: 692, earnings: '$9,234', status: 'active' },
      { name: 'David K.', vehicle: 'BMW 7 Series', rating: 4.9, rides: 581, earnings: '$8,442', status: 'offline' },
      { name: 'Jessica M.', vehicle: 'Tesla Model X', rating: 5.0, rides: 523, earnings: '$7,892', status: 'active' }
    ]
  })

  // Set initial metrics based on hotel data
  useEffect(() => {
    if (hotelData && dashboardMetrics) {
      setLiveMetrics(prev => ({
        ...prev,
        missedRevenue: hotelData.status === 'ALREADY_EARNING' 
          ? hotelData.monthlyRevenue 
          : hotelData.monthlyPotential || 67433,
        guestRequests: hotelData.missedBookings || dashboardMetrics.activeRequests || 234,
        airportSurge: dashboardMetrics.currentSurge || 2.8,
        currentHourRequests: dashboardMetrics.activeRequests || 12,
        urgencyMessage: dashboardMetrics.urgencyMessage || generateUrgencyMessage(),
        hourlyLoss: dashboardMetrics.hourlyLoss || 0
      }))
    }
  }, [hotelData, dashboardMetrics])

  // Update metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Regenerate dashboard metrics every 5 seconds
      if (hotelData) {
        const newMetrics = generateCompleteDashboardMetrics(propertyCode, hotelData)
        setDashboardMetrics(newMetrics)
        
        setLiveMetrics(prev => ({
          missedRevenue: prev.missedRevenue + (hotelData?.status === 'ALREADY_EARNING' ? 0 : generateHourlyLoss(prev.missedRevenue / 720)), // Hourly increment
          guestRequests: prev.guestRequests + (Math.random() > 0.7 ? 1 : 0),
          competitorAdvantage: newMetrics.marketPosition?.marketShare || 89,
          currentHourRequests: newMetrics.activeRequests,
          airportSurge: newMetrics.currentSurge,
          urgencyMessage: newMetrics.urgencyMessage,
          hourlyLoss: newMetrics.hourlyLoss
        }))

        // Update driver metrics
        setDriverMetrics(prev => ({
          ...prev,
          availableDrivers: Math.floor(45 + Math.random() * 10),
          activeRides: Math.floor(8 + Math.random() * 8),
          avgWaitTime: Math.floor(4 + Math.random() * 4),
          currentUtilization: Math.floor(75 + Math.random() * 20)
        }))
      }
    }, 5000)
    
    return () => clearInterval(interval)
  }, [hotelData, propertyCode])

  const handleLogout = () => {
    localStorage.removeItem('propertyCode')
    localStorage.removeItem('propertyVerified')
    localStorage.removeItem('verifiedHotel')
    router.push('/portal/login')
  }

  // Get competitor data
  const competitors = hotelData?.competitors?.map((code: string) => {
    const competitor = arizonaHotels[code]
    return competitor ? {
      name: competitor.name,
      tier: competitor.tier,
      revenue: competitor.status === 'ALREADY_EARNING' 
        ? `$${(competitor.monthlyRevenue / 1000).toFixed(0)}K/mo`
        : '$0/mo',
      feature: competitor.tier === 'PREMIUM' 
        ? ['Tesla fleet', 'Free airport', 'VIP service'][Math.floor(Math.random() * 3)]
        : 'Standard service'
    } : null
  }).filter(Boolean) || []

  // Mock data for charts
  const revenueData = [
    { month: 'Oct', yourRevenue: hotelData?.status === 'ALREADY_EARNING' ? 45000 : 0, competitors: 52000 },
    { month: 'Nov', yourRevenue: hotelData?.status === 'ALREADY_EARNING' ? 52000 : 0, competitors: 58000 },
    { month: 'Dec', yourRevenue: hotelData?.status === 'ALREADY_EARNING' ? 61000 : 0, competitors: 67000 },
    { month: 'Jan', yourRevenue: hotelData?.status === 'ALREADY_EARNING' ? hotelData.monthlyRevenue : 0, competitors: 71000 }
  ]

  const requestsData = [
    { time: '6 AM', requests: 18 },
    { time: '8 AM', requests: 34 },
    { time: '10 AM', requests: 22 },
    { time: '12 PM', requests: 28 },
    { time: '2 PM', requests: 19 },
    { time: '4 PM', requests: 31 },
    { time: '6 PM', requests: 45 },
    { time: '8 PM', requests: 37 }
  ]

  if (!hotelData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const isEarning = hotelData.status === 'ALREADY_EARNING'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Main Header Component with Full Navigation - Fixed */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleGetAppClick={handleGetAppClick}
          handleSearchClick={handleSearchClick}
        />
      </div>

      {/* Page Title Section - Fixed below main header */}
      <div className="fixed top-14 md:top-16 left-0 right-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IoBusinessOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Property Dashboard
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 rounded">
                {propertyCode}
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                href="/portal/reservations" 
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors font-semibold text-sm"
              >
                <IoGridOutline className="w-4 h-4" />
                <span>Reservations</span>
                <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">247</span>
              </Link>
              <Link 
                href="/portal/drivers" 
                className="flex items-center space-x-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors font-semibold text-sm"
              >
                <IoCarSportOutline className="w-4 h-4" />
                <span>Drivers</span>
                <span className="px-1.5 py-0.5 bg-amber-600 text-white text-xs rounded-full">47</span>
              </Link>
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
              <Link href="/portal/analytics" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Analytics
              </Link>
              <Link href="/portal/reports" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Reports
              </Link>
              <Link href="/portal/settings" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Settings
              </Link>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Quick Navigation - Fixed */}
      <div className="md:hidden fixed top-[106px] left-0 right-0 z-30 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <div className="flex-1 overflow-x-auto">
            <div className="flex">
              <Link 
                href="/portal/analytics" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoAnalyticsOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Analytics</span>
              </Link>
              <Link 
                href="/portal/reports" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoDocumentTextOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Reports</span>
              </Link>
              <Link 
                href="/portal/settings" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoSettingsOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Settings</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-1 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs font-semibold whitespace-nowrap min-w-fit"
              >
                <IoLogOutOutline className="w-4 h-4 flex-shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto mt-[150px] md:mt-[120px] pb-20">
        {/* CRITICAL ALERT BANNER */}
        <div className={`${isEarning ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-start sm:items-center space-x-2 sm:space-x-3">
                {isEarning ? (
                  <IoCheckmarkCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5 sm:mt-0" />
                ) : (
                  <IoWarningOutline className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5 sm:mt-0" />
                )}
                <div className="text-sm sm:text-base">
                  <div className="font-semibold">
                    {isEarning 
                      ? `Earning $${(liveMetrics.missedRevenue / 1000).toFixed(0)}K/mo`
                      : `Losing $${(liveMetrics.missedRevenue / 1000).toFixed(0)}K/mo`
                    }
                  </div>
                  <div className="text-xs sm:text-sm text-white/90">
                    {isEarning 
                      ? `${liveMetrics.guestRequests} successful rides this month`
                      : `${liveMetrics.guestRequests} guests requested rides`
                    }
                  </div>
                </div>
              </div>
              {!isEarning && (
                <button 
                  onClick={() => setShowUpgradeModal(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50 transition text-sm"
                >
                  Fix This Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live Activity Bar */}
        <div className="bg-amber-500 text-white overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2">
            <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm whitespace-nowrap">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
                <span>{dashboardMetrics?.activeRequests || liveMetrics.currentHourRequests} rides/hr</span>
              </div>
              <span>•</span>
              <span>Surge: {typeof liveMetrics.airportSurge === 'number' ? liveMetrics.airportSurge.toFixed(1) : parseFloat(liveMetrics.airportSurge).toFixed(1)}x</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">
                {liveMetrics.urgencyMessage || (isEarning ? 'Capturing surge revenue' : 'Guests paying premium')}
              </span>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Property Status Card */}
          <div className={`bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-8 border-2 ${
            isEarning ? 'border-green-400' : 'border-orange-400'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{hotelData.name}</h2>
                  <span className={`inline-block mt-1 sm:mt-0 px-2 py-1 text-white text-xs font-bold rounded ${
                    hotelData.tier === 'PREMIUM' 
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                      : hotelData.tier === 'STANDARD'
                      ? 'bg-gray-500'
                      : 'bg-gray-400'
                  }`}>
                    {hotelData.tier} TIER
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {hotelData.address}
                </p>
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
                  {isEarning ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Instant rides active</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Surge protection on</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Revenue sharing active</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2">
                        <IoCloseCircleOutline className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">No instant rides</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <IoCloseCircleOutline className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">No surge protection</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <IoCloseCircleOutline className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">No revenue share</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {!isEarning && (
                <button 
                  onClick={() => setShowUpgradeModal(true)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition shadow-lg text-sm sm:text-base"
                >
                  Upgrade to Premium
                </button>
              )}
            </div>
          </div>

          {/* RESERVATION INTELLIGENCE CENTER - NEW WOW MOMENT */}
          <div className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl shadow-lg mb-4 sm:mb-8 overflow-hidden border-2 border-blue-400 dark:border-blue-600">
            {/* Section Header with Live Status */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold flex items-center space-x-2">
                    <IoBedOutline className="w-6 h-6" />
                    <span>Reservation Intelligence Center</span>
                    <span className="px-2 py-0.5 bg-white/20 backdrop-blur text-xs rounded-full">BETA</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-100 mt-1">
                    Real-time booking management powered by ItWhip integration
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-bold">{reservationMetrics.currentOccupancy}%</div>
                  <div className="text-xs sm:text-sm text-blue-100">occupancy</div>
                </div>
              </div>
              
              {/* Quick Stats Bar */}
              <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-blue-500">
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold">{reservationMetrics.todayArrivals}</div>
                  <div className="text-xs text-blue-200">Arrivals</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold">{reservationMetrics.todayDepartures}</div>
                  <div className="text-xs text-blue-200">Departures</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold">${reservationMetrics.averageRate}</div>
                  <div className="text-xs text-blue-200">ADR</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold">${(reservationMetrics.weeklyRevenue / 1000).toFixed(0)}K</div>
                  <div className="text-xs text-blue-200">This Week</div>
                </div>
              </div>
            </div>

            {/* Live Booking Feed */}
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span>Live Booking Feed</span>
                </h4>
                <Link href="/portal/reservations" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">
                  View All Reservations →
                </Link>
              </div>
              
              <div className="space-y-2">
                {reservationMetrics.recentBookings.slice(0, 3).map((booking, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <IoPersonCircleOutline className="w-10 h-10 text-gray-400" />
                        {booking.vip && (
                          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-yellow-500 text-white text-[8px] font-bold rounded">VIP</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{booking.guest}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Room {booking.room} • {booking.checkIn} • {booking.nights} nights
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white">{booking.rate}</div>
                      <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                        booking.source === 'ItWhip' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : booking.source === 'Direct'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {booking.source}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrival Timeline */}
            <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 border-b border-gray-200 dark:border-gray-700">
              {/* Today's Timeline */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                  <IoTodayOutline className="w-4 h-4" />
                  <span>Today's Arrival Timeline</span>
                </h4>
                <div className="space-y-2">
                  {reservationMetrics.upcomingArrivals.map((slot, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 w-20">{slot.time}</span>
                      <div className="flex-1 mx-3">
                        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center"
                            style={{ width: `${(slot.count / 12) * 100}%` }}
                          >
                            <span className="text-[10px] text-white font-semibold px-1">{slot.count}</span>
                          </div>
                        </div>
                      </div>
                      <button className="text-xs text-blue-600 hover:text-blue-700 font-semibold">
                        Assign
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                  <IoFlashOutline className="w-4 h-4" />
                  <span>Quick Actions</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <IoKeyOutline className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-1" />
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Room Keys</div>
                    <div className="text-[10px] text-gray-500">12 ready</div>
                  </button>
                  <button className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <IoWifiOutline className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-1" />
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">WiFi Codes</div>
                    <div className="text-[10px] text-gray-500">Generate</div>
                  </button>
                  <button className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <IoPricetagsOutline className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-1" />
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Rate Update</div>
                    <div className="text-[10px] text-gray-500">$289 ADR</div>
                  </button>
                  <button className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <IoCarOutline className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-1" />
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Pre-Assign</div>
                    <div className="text-[10px] text-gray-500">Rides</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Revenue Intelligence */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Revenue Intelligence</h4>
                <span className="text-xs text-gray-500">Powered by ItWhip Analytics</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <IoTrendingUpSharp className="w-4 h-4 text-green-600" />
                    <span className="text-[10px] text-green-600 font-semibold">+12%</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">${(reservationMetrics.weeklyRevenue / 7 / 1000).toFixed(1)}K</div>
                  <p className="text-[10px] text-gray-600 dark:text-gray-400">Daily Revenue</p>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <IoCalendarOutline className="w-4 h-4 text-blue-600" />
                    <span className="text-[10px] text-blue-600 font-semibold">PEAK</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">94%</div>
                  <p className="text-[10px] text-gray-600 dark:text-gray-400">Weekend Occ</p>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <IoAddCircleOutline className="w-4 h-4 text-purple-600" />
                    <span className="text-[10px] text-purple-600 font-semibold">NEW</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{reservationMetrics.walkIns}</div>
                  <p className="text-[10px] text-gray-600 dark:text-gray-400">Walk-ins</p>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <IoRemoveCircleOutline className="w-4 h-4 text-red-600" />
                    <span className="text-[10px] text-red-600 font-semibold">ALERT</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{reservationMetrics.cancellations + reservationMetrics.noShows}</div>
                  <p className="text-[10px] text-gray-600 dark:text-gray-400">Cancel/NS</p>
                </div>
              </div>

              {/* CTA to Full Manager */}
              <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      Full Reservation Management Available
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Access complete PMS features, channel manager, and revenue optimization
                    </p>
                  </div>
                  <Link 
                    href="/portal/reservations"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm whitespace-nowrap"
                  >
                    Open Manager
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* DRIVER MANAGEMENT SECTION - EXISTING */}
          <div className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl shadow-lg mb-4 sm:mb-8 overflow-hidden">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold flex items-center space-x-2">
                    <IoCarSportOutline className="w-6 h-6" />
                    <span>Driver Operations Center</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-100 mt-1">
                    Real-time fleet management and dispatch control
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-bold">{driverMetrics.availableDrivers}</div>
                  <div className="text-xs sm:text-sm text-amber-100">drivers online</div>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <button className="flex flex-col items-center justify-center p-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors group">
                  <IoThunderstormOutline className="w-6 h-6 text-red-600 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-red-700 dark:text-red-400">Request Drivers</span>
                  <span className="text-[10px] text-red-600 dark:text-red-500">URGENT</span>
                </button>
                
                <button className="flex flex-col items-center justify-center p-3 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors group">
                  <IoFlashOutline className="w-6 h-6 text-orange-600 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-orange-700 dark:text-orange-400">Surge Alert</span>
                  <span className="text-[10px] text-orange-600 dark:text-orange-500">2.8x Active</span>
                </button>
                
                <button className="flex flex-col items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors group">
                  <IoLocationOutline className="w-6 h-6 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Set Zones</span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-500">3 Active</span>
                </button>
                
                <button className="flex flex-col items-center justify-center p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors group">
                  <IoSendOutline className="w-6 h-6 text-green-600 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-green-700 dark:text-green-400">Broadcast</span>
                  <span className="text-[10px] text-green-600 dark:text-green-500">All Drivers</span>
                </button>
              </div>
            </div>

            {/* Driver Metrics Grid */}
            <div className="p-4 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 border-b border-gray-200 dark:border-gray-700">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <IoPulseOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-xs text-green-600 font-semibold">LIVE</span>
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{driverMetrics.activeRides}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Active Rides</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <IoTimeOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-xs text-amber-600 font-semibold">{driverMetrics.avgWaitTime} MIN</span>
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{driverMetrics.avgWaitTime}m</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Avg Wait</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <IoStatsChartOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-xs text-blue-600 font-semibold">{driverMetrics.currentUtilization}%</span>
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{driverMetrics.currentUtilization}%</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Utilization</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <IoWarningOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-xs text-red-600 font-semibold">PEAK</span>
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{driverMetrics.peakDriversNeeded}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Needed at 6PM</p>
              </div>
            </div>

            {/* Top Drivers Table */}
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Top Performing Drivers</h4>
                <button className="text-xs text-amber-600 hover:text-amber-700 font-semibold">View All</button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left pb-2">Driver</th>
                      <th className="text-left pb-2">Vehicle</th>
                      <th className="text-center pb-2">Rating</th>
                      <th className="text-center pb-2">Rides</th>
                      <th className="text-right pb-2">Earnings</th>
                      <th className="text-center pb-2">Status</th>
                      <th className="text-right pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {driverMetrics.topDrivers.map((driver, idx) => (
                      <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            <IoPersonCircleOutline className="w-6 h-6 text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">{driver.name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">{driver.vehicle}</td>
                        <td className="py-3 text-center">
                          <span className="inline-flex items-center space-x-1">
                            <IoStarOutline className="w-4 h-4 text-amber-500 fill-current" />
                            <span className="font-semibold text-gray-900 dark:text-white">{driver.rating}</span>
                          </span>
                        </td>
                        <td className="py-3 text-center text-gray-900 dark:text-white">{driver.rides}</td>
                        <td className="py-3 text-right font-semibold text-green-600">{driver.earnings}</td>
                        <td className="py-3 text-center">
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                            driver.status === 'active' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {driver.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button 
                              onClick={() => {
                                setSelectedDriver(driver)
                                setShowDriverModal(true)
                              }}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                              title="Assign"
                            >
                              <IoSwapHorizontalOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" title="Message">
                              <IoMailOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" title="Block">
                              <IoBanOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Secondary Action Buttons */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                    <IoPersonAddOutline className="w-4 h-4 inline mr-1" />
                    Recruit Drivers
                  </button>
                  <button className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                    <IoMapOutline className="w-4 h-4 inline mr-1" />
                    Heat Map
                  </button>
                  <button className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                    <IoWalletOutline className="w-4 h-4 inline mr-1" />
                    Payouts
                  </button>
                  <button className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                    <IoShieldCheckmarkOutline className="w-4 h-4 inline mr-1" />
                    Compliance
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-8">
            {/* Revenue Metric */}
            <div className={`${isEarning ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'} rounded-lg sm:rounded-xl p-3 sm:p-6 border ${isEarning ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}`}>
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                {isEarning ? (
                  <IoTrendingUpOutline className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                ) : (
                  <IoTrendingDownOutline className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                )}
                <span className={`text-[10px] sm:text-xs ${isEarning ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                  {isEarning ? 'EARNING' : 'LOSING'}
                </span>
              </div>
              <div className={`text-xl sm:text-3xl font-bold ${isEarning ? 'text-green-600' : 'text-red-600'}`}>
                ${(liveMetrics.missedRevenue / 1000).toFixed(0)}K
              </div>
              <p className={`text-xs sm:text-sm ${isEarning ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'} mt-0.5 sm:mt-1`}>
                Monthly {isEarning ? 'revenue' : 'loss'}
              </p>
            </div>

            {/* Guest Requests */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <IoPeopleOutline className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                <span className="text-[10px] sm:text-xs text-orange-600 font-semibold">DEMAND</span>
              </div>
              <div className="text-xl sm:text-3xl font-bold text-orange-600">
                {liveMetrics.guestRequests}
              </div>
              <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-400 mt-0.5 sm:mt-1">
                {isEarning ? 'Rides completed' : 'Ride requests'}
              </p>
            </div>

            {/* Competitor Advantage */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <IoBusinessOutline className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                <span className="text-[10px] sm:text-xs text-yellow-600 font-semibold">
                  {isEarning ? 'LEADING' : 'BEHIND'}
                </span>
              </div>
              <div className="text-xl sm:text-3xl font-bold text-yellow-600">
                {isEarning ? '11%' : '89%'}
              </div>
              <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-400 mt-0.5 sm:mt-1">
                {isEarning ? 'Market share' : 'Have rides'}
              </p>
            </div>

            {/* Lost/Gained Bookings */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <IoAlertCircleOutline className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                <span className="text-[10px] sm:text-xs text-purple-600 font-semibold">
                  {isEarning ? 'GAINED' : 'AT RISK'}
                </span>
              </div>
              <div className="text-xl sm:text-3xl font-bold text-purple-600">
                {isEarning ? '+23%' : '17%'}
              </div>
              <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-400 mt-0.5 sm:mt-1">
                {isEarning ? 'New bookings' : 'Lost bookings'}
              </p>
            </div>
          </div>

          {/* Competitor Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8">
            {/* Revenue Comparison Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Revenue Comparison
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {revenueData.slice(-2).map((month) => (
                  <div key={month.month}>
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{month.month}</span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                        ${(month.competitors / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <div className="relative h-6 sm:h-8 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                        style={{ width: `${(month.competitors / 71000) * 100}%` }}
                      >
                        <span className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 text-[10px] sm:text-xs text-white font-semibold">
                          Others
                        </span>
                      </div>
                      {isEarning && month.yourRevenue > 0 && (
                        <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                          style={{ width: `${(month.yourRevenue / 71000) * 100}%` }}
                        >
                          <span className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 text-[10px] sm:text-xs text-white font-semibold">
                            You
                          </span>
                        </div>
                      )}
                      {!isEarning && (
                        <div className="absolute top-1/2 left-1 sm:left-2 transform -translate-y-1/2 text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 font-semibold">
                          You: $0
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className={`mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg ${
                isEarning 
                  ? 'bg-green-50 dark:bg-green-900/20' 
                  : 'bg-red-50 dark:bg-red-900/20'
              }`}>
                <p className={`text-xs sm:text-sm ${
                  isEarning 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  <strong>{isEarning ? 'Total earned:' : 'Total lost:'}</strong> ${
                    isEarning 
                      ? (revenueData.reduce((sum, m) => sum + m.yourRevenue, 0) / 1000).toFixed(0) 
                      : '248'
                  }K
                </p>
              </div>
            </div>

            {/* Guest Request Patterns */}
            <div className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Today's Ride Requests
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {requestsData.filter((_, i) => i % 2 === 0).map((data) => (
                  <div key={data.time} className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 w-12 sm:w-16">{data.time}</span>
                    <div className="flex-1 mx-2 sm:mx-3">
                      <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                          style={{ width: `${(data.requests / 45) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white w-6 sm:w-8 text-right">
                      {data.requests}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-300">
                  <strong>Peak:</strong> 6PM • {isEarning ? 'All captured' : 'All to Uber'}
                </p>
              </div>
            </div>
          </div>

          {/* Competitor Properties */}
          <div className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-8">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                {isEarning ? 'Market Competition' : 'Competitors Earning'}
              </h3>
            </div>
            
            <div className="space-y-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0">
              {competitors.map((competitor: any, idx: number) => (
                <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate pr-2">
                      {competitor.name.split(' ').slice(0, 2).join(' ')}
                    </h4>
                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-white text-[10px] sm:text-xs font-bold rounded ${
                      competitor.tier === 'PREMIUM'
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                        : 'bg-gray-500'
                    }`}>
                      {competitor.tier}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Revenue:</span>
                      <span className="text-xs sm:text-sm font-semibold text-green-600">{competitor.revenue}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Feature:</span>
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{competitor.feature}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guest Complaints */}
          <div className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Recent Guest Feedback
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {(hotelData.guestComplaints || []).slice(0, 2).map((complaint: string, idx: number) => (
                <div key={idx} className={`border-l-4 ${isEarning ? 'border-green-500' : 'border-red-500'} pl-3 sm:pl-4 py-2`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] sm:text-xs text-gray-500">
                      {generateComplaintTime()}
                    </span>
                    <div className="flex space-x-0.5 sm:space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <IoStarOutline 
                          key={i}
                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                            isEarning 
                              ? i < 4 ? 'text-green-500 fill-current' : 'text-gray-300'
                              : i < 2 ? 'text-red-500 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    {isEarning 
                      ? complaint.replace('Others have', 'We have').replace("doesn't", "has")
                      : complaint
                    }
                  </p>
                </div>
              ))}
              {!isEarning && dynamicMetrics?.lastGuestComplaint && (
                <div className="border-l-4 border-orange-500 pl-3 sm:pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] sm:text-xs text-gray-500">{generateComplaintTime()}</span>
                    <div className="flex space-x-0.5 sm:space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <IoStarOutline 
                          key={i}
                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${i < 1 ? 'text-orange-500 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    {dynamicMetrics.lastGuestComplaint}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Flight Arrivals & Traffic Intelligence - Only for non-earning hotels */}
          {!isEarning && dashboardMetrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Incoming Flights */}
              <div className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    Incoming Flights
                  </h3>
                  <IoAirplaneOutline className="w-5 h-5 text-amber-600" />
                </div>
                <div className="space-y-2">
                  {dashboardMetrics.flightArrivals?.slice(0, 4).map((flight: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center space-x-2">
                        <span className={`font-mono font-semibold ${flight.status === 'Delayed' ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                          {flight.flight}
                        </span>
                        <span className="text-gray-500">from {flight.from}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600 dark:text-gray-400">{flight.passengers} pax</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-semibold ${
                          flight.status === 'Delayed' 
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {flight.eta}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-xs text-orange-700 dark:text-orange-300">
                  <strong>{dashboardMetrics.flightArrivals?.reduce((sum: number, f: any) => sum + f.passengers, 0) || 0}</strong> potential guests arriving soon
                </div>
              </div>

              {/* Traffic Conditions */}
              <div className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    Traffic to Hotel
                  </h3>
                  <IoCarOutline className="w-5 h-5 text-amber-600" />
                </div>
                <div className="space-y-2">
                  {dashboardMetrics.trafficConditions?.slice(0, 4).map((route: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{route.route}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`font-semibold ${
                          route.status === 'Heavy' ? 'text-red-600' : 
                          route.status === 'Moderate' ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {route.current} min
                        </span>
                        {route.delay > 0 && (
                          <span className="text-[10px] sm:text-xs text-red-500">
                            +{route.delay}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {dashboardMetrics.surgeEvents && (
                  <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-300">
                    <strong>{dashboardMetrics.surgeEvents.type}</strong> at {dashboardMetrics.surgeEvents.time} - 
                    <span className="font-bold"> {dashboardMetrics.surgeEvents.surge}x surge expected</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Driver Modal */}
      {showDriverModal && selectedDriver && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Driver Assignment</h3>
              <button 
                onClick={() => setShowDriverModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <IoCloseOutline className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <IoPersonCircleOutline className="w-12 h-12 text-gray-400" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{selectedDriver.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedDriver.vehicle}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                  <div className="text-xs text-gray-500">Rating</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{selectedDriver.rating}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                  <div className="text-xs text-gray-500">Rides</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{selectedDriver.rides}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                  <div className="text-xs text-gray-500">Status</div>
                  <div className="font-semibold text-green-600">{selectedDriver.status}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition">
                Assign to VIP Guest
              </button>
              <button className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                Schedule for Event
              </button>
              <button 
                onClick={() => setShowDriverModal(false)}
                className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky CTA Bar */}
      <div className={`fixed bottom-0 left-0 right-0 ${
        isEarning 
          ? 'bg-gradient-to-r from-green-600 to-green-700' 
          : 'bg-gradient-to-r from-amber-600 to-amber-700'
      } text-white p-1.5 sm:p-2 shadow-2xl z-40`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-xs sm:text-sm font-semibold">
                {isEarning 
                  ? `Earning ${(liveMetrics.missedRevenue / 1000).toFixed(0)}K/mo`
                  : `Stop losing ${(liveMetrics.missedRevenue / 1000).toFixed(0)}K/mo`
                }
              </h4>
              <p className="text-[10px] sm:text-xs text-white/80 hidden sm:block">
                {isEarning 
                  ? 'Dashboard active'
                  : '127 properties earning'
                }
              </p>
            </div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              {isEarning ? (
                <>
                  <button className="px-2 py-1 bg-white/10 backdrop-blur border border-white/20 rounded font-medium hover:bg-white/20 transition text-[10px] sm:text-xs">
                    Reports
                  </button>
                  <button className="px-2 py-1 bg-white text-green-600 rounded font-semibold hover:bg-green-50 transition shadow text-[10px] sm:text-xs">
                    Settings
                  </button>
                </>
              ) : (
                <>
                  <button className="px-2 py-1 bg-white/10 backdrop-blur border border-white/20 rounded font-medium hover:bg-white/20 transition text-[10px] sm:text-xs">
                    Demo
                  </button>
                  <button 
                    onClick={() => setShowUpgradeModal(true)}
                    className="px-2 py-1 bg-white text-amber-600 rounded font-semibold hover:bg-amber-50 transition shadow text-[10px] sm:text-xs"
                  >
                    Upgrade →
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && !isEarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
            <div className="text-center mb-4 sm:mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full mb-3 sm:mb-4">
                <IoRocketOutline className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Start Earning ${(liveMetrics.missedRevenue / 1000).toFixed(0)}K Monthly
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Integration in 24 hours. Start earning immediately.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">Current (Basic)</h3>
                <ul className="space-y-1.5 sm:space-y-2">
                  <li className="flex items-center space-x-2">
                    <IoCloseCircleOutline className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">No instant rides</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <IoCloseCircleOutline className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">$0 revenue</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <IoCloseCircleOutline className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Guests pay surge</span>
                  </li>
                </ul>
              </div>

              <div className="border-2 border-amber-500 rounded-lg p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">Premium Partner</h3>
                <ul className="space-y-1.5 sm:space-y-2">
                  <li className="flex items-center space-x-2">
                    <IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Instant rides</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">~${(hotelData.monthlyPotential / 1000).toFixed(0)}K/mo revenue</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">No surge pricing</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <IoInformationCircleOutline className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">
                    <strong>Zero investment.</strong> Our drivers, insurance, technology. You collect revenue.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="order-2 sm:order-1 px-4 sm:px-6 py-2 sm:py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition text-sm sm:text-base"
              >
                Maybe Later
              </button>
              <div className="order-1 sm:order-2 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <button className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm">
                  <IoCallOutline className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>(480) 555-0199</span>
                </button>
                <button className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-bold hover:from-amber-600 hover:to-amber-700 transition shadow-lg text-sm">
                  <IoMailOutline className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Contact Sales</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}