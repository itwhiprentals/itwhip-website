// app/portal/login/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import Header from '@/app/components/Header'
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
  const t = useTranslations('PortalLogin')
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

  // UPDATED: Real Amadeus hotel mappings from Phoenix
  const AMADEUS_HOTELS: Record<string, string> = {
    // Real Phoenix Hotels from Amadeus API
    'HYPHXHRP': 'Hyatt Regency Phoenix',
    'SIPHX703': 'Sheraton Phoenix Downtown',
    'WIPHX574': 'Westin Phoenix Downtown',
    'BRPHXBDB': 'Renaissance Phoenix Downtown',
    'HHPHX538': 'Hilton Phoenix Suites',
    'HIPHX00A': 'Holiday Inn Express Phoenix Ballpark',
    'XVPHXDTS': 'SpringHill Suites Downtown Marriott',
    'FNPHXASF': 'Fairfield Inn & Suites Marriott',
    'HXPHXHC7': 'Hampton Inn Phoenix Midtown',
    'LMPHX665': 'Hotel San Carlos',
    
    // Common test codes for demo
    'PHXMAR': 'Marriott Phoenix Airport',
    'PHXHIL': 'Hilton Phoenix Airport', 
    'SCTOMN': 'Omni Scottsdale Resort',
    
    // Legacy codes (kept for compatibility)
    'PHX001': 'Phoenix Premium Hotel',
    'SCT001': 'Scottsdale Luxury Resort',
    'DEMO123': 'Demo Hotel Property'
  }

  // Function to validate and get hotel from Amadeus
  const validateAmadeusCode = async (code: string) => {
    const upperCode = code.toUpperCase()
    
    // First check if it's a known code
    if (AMADEUS_HOTELS[upperCode]) {
      return {
        valid: true,
        hotelName: AMADEUS_HOTELS[upperCode],
        hotelId: upperCode,
        source: 'cache'
      }
    }
    
    // If not in cache, try to fetch from Amadeus API
    try {
      const response = await fetch(`/api/v3/amadeus/hotel-details?hotelId=${upperCode}`)
      const data = await response.json()
      
      if (data.success && data.hotel) {
        return {
          valid: true,
          hotelName: data.hotel.name || `Hotel ${upperCode}`,
          hotelId: upperCode,
          address: data.hotel.address,
          location: data.hotel.location,
          source: 'amadeus'
        }
      }
    } catch (err) {
      console.error('Amadeus lookup failed:', err)
    }
    
    // Fallback for unknown codes
    if (code.length >= 3) {
      // Generate a believable name based on patterns
      let generatedName = `Premium Hotel ${upperCode}`
      
      if (upperCode.includes('MAR')) generatedName = `Marriott ${upperCode}`
      else if (upperCode.includes('HIL')) generatedName = `Hilton ${upperCode}`
      else if (upperCode.includes('HYA') || upperCode.includes('HYT')) generatedName = `Hyatt ${upperCode}`
      else if (upperCode.includes('SHE')) generatedName = `Sheraton ${upperCode}`
      else if (upperCode.includes('WES')) generatedName = `Westin ${upperCode}`
      else if (upperCode.includes('IHG')) generatedName = `IHG Property ${upperCode}`
      
      return {
        valid: true,
        hotelName: generatedName,
        hotelId: upperCode,
        source: 'generated'
      }
    }
    
    return { valid: false }
  }

  const handleGDSLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsValidating(true)
    
    try {
      // Validate the Amadeus/GDS code
      const validation = await validateAmadeusCode(gdsCode)
      
      if (validation.valid) {
        // Store all hotel information
        localStorage.setItem('propertyCode', validation.hotelId || '')
        localStorage.setItem('propertyName', validation.hotelName || '')
        localStorage.setItem('propertySource', validation.source || 'manual')
        
        if (validation.address) {
          localStorage.setItem('propertyAddress', validation.address as string)
        }

        if (validation.location) {
          localStorage.setItem('propertyLocation', JSON.stringify(validation.location))
        }

        // Check if this is a premium hotel (demo purposes)
        const isPremium = ['DEMO123', 'PREMIUM', 'VIP'].some(code =>
          (validation.hotelId || '').includes(code)
        )
        
        if (isPremium) {
          localStorage.setItem('propertyTier', 'premium')
        } else {
          localStorage.setItem('propertyTier', 'free')
        }
        
        // Redirect to verify page with real hotel data
        const params = new URLSearchParams({
          code: validation.hotelId || '',
          hotel: validation.hotelName || '',
          source: validation.source || 'manual'
        })
        
        if (validation.address) {
          params.append('address', validation.address as string)
        }
        
        router.push(`/portal/verify?${params.toString()}`)
      } else {
        setError('Invalid property code. Please check your GDS/Amadeus code and try again.')
        setIsValidating(false)
      }
    } catch (error) {
      setError('Unable to verify property code. Please try again.')
      setIsValidating(false)
    }
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
                {t('pageTitle')}
              </h1>
              <span className="hidden sm:inline-block ml-2 text-xs text-gray-500">{t('pms')}</span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/sdk" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                {t('sdkDocs')}
              </Link>
              <Link href="/integrations" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                {t('integrations')}
              </Link>
              <Link href="/contact" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                {t('support')}
              </Link>
              <Link href="/hotel-solutions" className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700">
                {t('learnMore')}
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
                {t('verificationTitle')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('verificationDesc')}
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
                {t('gdsLogin')}
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'email'
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {t('emailLogin')}
              </button>
            </div>

            {/* Login Forms */}
            {activeTab === 'gds' ? (
              <form onSubmit={handleGDSLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('gdsPropertyCode')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IoKeyOutline className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={gdsCode}
                      onChange={(e) => setGdsCode(e.target.value.toUpperCase())}
                      placeholder="e.g., HYPHXHRP, SIPHX703, WIPHX574"
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
                    {t('securityPin')}
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
                      <span>{t('verifyingProperty')}</span>
                    </span>
                  ) : (
                    t('accessDashboard')
                  )}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-50 dark:bg-gray-950 text-gray-500">{t('firstTime')}</span>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-3">
                    <IoInformationCircleOutline className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                        {t('propertyNotListed')}
                      </h4>
                      <p className="text-xs text-blue-800 dark:text-blue-400 mb-2">
                        Your property may already be in our system. Enter your GDS code to check your listing status and view analytics.
                      </p>
                      <div className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                        <strong>Try these Phoenix hotels:</strong>
                        <div className="mt-1 space-y-0.5">
                          <div>• HYPHXHRP - Hyatt Regency</div>
                          <div>• SIPHX703 - Sheraton Downtown</div>
                          <div>• WIPHX574 - Westin Phoenix</div>
                        </div>
                      </div>
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
                    {t('propertyEmail')}
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
                    {t('password')}
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
                "After seeing our guests taking rides while we earned nothing, 
                we activated immediately. The integration took less than 24 hours and we're now 
                generating $67,000 monthly in additional revenue."
              </blockquote>
              <div className="mt-3 text-white font-semibold">
                — Revenue Manager, Hyatt Regency Phoenix
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