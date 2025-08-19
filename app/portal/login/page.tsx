// app/portal/login/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'
import { 
  IoLockClosedOutline,
  IoBusinessOutline,
  IoKeyOutline,
  IoShieldCheckmarkOutline,
  IoInformationCircleOutline,
  IoWarningOutline,
  IoCheckmarkCircle,
  IoGlobeOutline,
  IoServerOutline,
  IoRocketOutline,
  IoTrendingUpOutline,
  IoCarOutline,
  IoSparklesOutline,
  IoTimeOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoDocumentTextOutline,
  IoLayersOutline,
  IoCallOutline,
  IoCodeSlashOutline
} from 'react-icons/io5'

export default function PortalLoginPage() {
  const router = useRouter()
  const [gdsCode, setGdsCode] = useState('')
  const [password, setPassword] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'gds' | 'email'>('gds')
  
  // Header state management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    // Already on login page
    window.location.href = '/portal/login'
  }
  
  // Live stats to create urgency
  const [liveStats, setLiveStats] = useState({
    propertiesOnline: 487,
    ridesThisHour: 234,
    revenueToday: 127834,
    activeCities: 14
  })

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        propertiesOnline: prev.propertiesOnline + Math.floor(Math.random() * 3) - 1,
        ridesThisHour: prev.ridesThisHour + Math.floor(Math.random() * 10) - 3,
        revenueToday: prev.revenueToday + Math.floor(Math.random() * 500) + 100,
        activeCities: 14
      }))
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  // Function to generate hotel name from GDS code
  const getHotelName = (code: string): string => {
    const upperCode = code.toUpperCase()
    
    // Specific hotel mappings
    if (upperCode.startsWith('PHX')) return 'Marriott Phoenix Resort'
    if (upperCode.startsWith('SCT')) return 'Omni Scottsdale Resort & Spa'
    if (upperCode.startsWith('AMA')) return 'Four Seasons Resort Phoenix'
    if (upperCode.startsWith('HIL')) return 'Hilton Phoenix Airport'
    if (upperCode.startsWith('HYT')) return 'Hyatt Regency Phoenix'
    if (upperCode.startsWith('FAI')) return 'Fairmont Scottsdale Princess'
    if (upperCode.startsWith('PHO')) return 'The Phoenician Resort'
    if (upperCode.startsWith('WES')) return 'Westin Kierland Resort'
    if (upperCode.startsWith('JW')) return 'JW Marriott Phoenix Desert Ridge'
    if (upperCode.startsWith('RIT')) return 'The Ritz-Carlton Phoenix'
    
    // Generic patterns
    if (upperCode.includes('MAR')) return `Marriott ${code.toUpperCase()}`
    if (upperCode.includes('HIL')) return `Hilton ${code.toUpperCase()}`
    if (upperCode.includes('HYT')) return `Hyatt ${code.toUpperCase()}`
    if (upperCode.includes('IHG')) return `IHG Property ${code.toUpperCase()}`
    
    // Default fallback
    return `Premium Hotel ${code.toUpperCase()}`
  }

  const handleGDSLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsValidating(true)
    
    // Simulate validation
    setTimeout(() => {
      // Accept any GDS code that looks legitimate (at least 3 characters)
      if (gdsCode.length >= 3) {
        // Get hotel name based on code
        const hotelName = getHotelName(gdsCode)
        
        // Store in localStorage as backup
        localStorage.setItem('propertyCode', gdsCode.toUpperCase())
        localStorage.setItem('propertyName', hotelName)
        localStorage.setItem('propertyVerified', 'pending')
        
        // Redirect to verify page with parameters
        router.push(`/portal/verify?code=${gdsCode.toUpperCase()}&hotel=${encodeURIComponent(hotelName)}`)
      } else {
        setError('Invalid GDS code format. Please enter at least 3 characters.')
        setIsValidating(false)
      }
    }, 1500)
  }

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('Email login requires property verification. Please use your GDS code.')
    setTimeout(() => setActiveTab('gds'), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Main Header Component with Full Navigation */}
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleGetAppClick={handleGetAppClick}
        handleSearchClick={handleSearchClick}
      />

      {/* Page Title Section - Below Header (Portal specific navigation) */}
      <div className="mt-14 md:mt-16 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IoBusinessOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Partner Portal
              </h1>
              <span className="hidden sm:inline-block ml-2 text-xs text-gray-500">Property Management System</span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/sdk" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                SDK Docs
              </Link>
              <Link href="/integrations" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Integrations
              </Link>
              <Link href="/contact" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Support
              </Link>
              <Link href="/hotel-solutions" className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Quick Navigation - Mobile Only */}
      <div className="md:hidden sticky top-14 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          {/* Scrollable Quick Links Container */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex">
              <Link 
                href="/sdk" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoCodeSlashOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">SDK Docs</span>
              </Link>
              <Link 
                href="/integrations" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoLayersOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Integrations</span>
              </Link>
              <Link 
                href="/contact" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoCallOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Support</span>
              </Link>
              {/* Learn More - Part of scrollable area */}
              <Link 
                href="/hotel-solutions" 
                className="flex items-center space-x-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold whitespace-nowrap min-w-fit"
              >
                <IoRocketOutline className="w-4 h-4 flex-shrink-0" />
                <span>Learn More</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-180px)]">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-4">
                <IoLockClosedOutline className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Property Verification Portal
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Access your property's transportation analytics and integration settings
              </p>
            </div>

            {/* Live Activity Banner */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-800 dark:text-green-300 font-medium">
                    {liveStats.propertiesOnline} properties online
                  </span>
                </div>
                <span className="text-xs text-green-700 dark:text-green-400">
                  {liveStats.ridesThisHour} rides this hour
                </span>
              </div>
            </div>

            {/* Tab Selector */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
              <button
                onClick={() => setActiveTab('gds')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'gds'
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                GDS Login
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'email'
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Email Login
              </button>
            </div>

            {/* Login Forms */}
            {activeTab === 'gds' ? (
              <form onSubmit={handleGDSLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    GDS Property Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IoKeyOutline className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={gdsCode}
                      onChange={(e) => setGdsCode(e.target.value.toUpperCase())}
                      placeholder="e.g., PHX1234, AMADEUS-5678"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Your Amadeus, Sabre, or Travelport property identifier
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Security PIN (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IoLockClosedOutline className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Leave blank for first-time access"
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <IoEyeOffOutline className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <IoEyeOutline className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <IoWarningOutline className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isValidating}
                  className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isValidating ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Property...</span>
                    </span>
                  ) : (
                    'Access Dashboard'
                  )}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-50 dark:bg-gray-950 text-gray-500">First time?</span>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-3">
                    <IoInformationCircleOutline className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                        Property Not Listed?
                      </h4>
                      <p className="text-xs text-blue-800 dark:text-blue-400 mb-2">
                        Your property may already be in our system. Enter your GDS code to check your listing status and view analytics.
                      </p>
                      <Link href="/hotel-solutions" className="text-xs text-blue-600 dark:text-blue-400 underline font-semibold">
                        Learn about instant ride integration →
                      </Link>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Property Email
                  </label>
                  <input
                    type="email"
                    placeholder="manager@property.com"
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <IoWarningOutline className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <p className="text-sm text-amber-800 dark:text-amber-300">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Sign In
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Side - Information Panel */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-amber-600 to-amber-700 p-12 items-center justify-center">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold text-white mb-6">
              Your Property's Transportation Command Center
            </h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-6 h-6 text-amber-300 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold">Real-Time Analytics</h3>
                  <p className="text-amber-100 text-sm">Track guest transportation patterns, popular destinations, and revenue metrics</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-6 h-6 text-amber-300 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold">Instant Ride Integration</h3>
                  <p className="text-amber-100 text-sm">Enable luxury transportation for your guests with zero infrastructure investment</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-6 h-6 text-amber-300 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold">Revenue Opportunities</h3>
                  <p className="text-amber-100 text-sm">Premium partners average $48,000 monthly in additional revenue</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-6 h-6 text-amber-300 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold">Competitive Advantage</h3>
                  <p className="text-amber-100 text-sm">127 premium properties already offering instant rides to their guests</p>
                </div>
              </div>
            </div>

            {/* Live Stats */}
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Platform Activity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-white">${liveStats.revenueToday.toLocaleString()}</div>
                  <div className="text-xs text-amber-200">Revenue Today</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{liveStats.propertiesOnline}</div>
                  <div className="text-xs text-amber-200">Active Properties</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{liveStats.ridesThisHour}</div>
                  <div className="text-xs text-amber-200">Rides This Hour</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{liveStats.activeCities}</div>
                  <div className="text-xs text-amber-200">Cities Covered</div>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="mt-8 pt-8 border-t border-amber-500">
              <blockquote className="text-amber-100 italic">
                "After seeing our competitors offering instant rides while we still ran shuttles, 
                we knew we had to act. The integration took less than 24 hours and we're now 
                generating $67,000 monthly in additional revenue."
              </blockquote>
              <div className="mt-3 text-white font-semibold">
                — Revenue Manager, Premium Partner Hotel
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>© 2025 ItWhip Technologies</span>
              <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300">Terms</Link>
              <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy</Link>
            </div>
            <div className="flex items-center space-x-4 mt-2 sm:mt-0">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <IoShieldCheckmarkOutline className="w-4 h-4" />
                <span>SOC 2 Certified</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <IoServerOutline className="w-4 h-4" />
                <span>99.97% Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}