// app/hotel-solutions/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import { 
  IoBusinessOutline,
  IoTrendingUpOutline,
  IoCashOutline,
  IoCarOutline,
  IoCheckmarkCircle,
  IoArrowForwardOutline,
  IoStatsChartOutline,
  IoRocketOutline,
  IoShieldCheckmarkOutline,
  IoFlashOutline,
  IoAirplaneOutline,
  IoTimeOutline,
  IoWarningOutline,
  IoSparklesOutline,
  IoAnalyticsOutline,
  IoInfiniteOutline,
  IoGlobeOutline,
  IoLockClosedOutline,
  IoCloudOutline,
  IoPhonePortraitOutline,
  IoDesktopOutline,
  IoDocumentTextOutline,
  IoPlayCircleOutline,
  IoStarOutline,
  IoTrophyOutline,
  IoPeopleOutline,
  IoChevronForwardOutline
} from 'react-icons/io5'

export default function HotelSolutionsPage() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [gdsCode, setGdsCode] = useState('')
  
  // Live metrics that update to create urgency
  const [liveMetrics, setLiveMetrics] = useState({
    activeHotels: 487,
    monthlyRides: 48293,
    avgRevenue: 24847,
    currentSurge: 2.8,
    missedRevenue: 2584739,
    activeRequests: 23
  })

  // Update metrics every few seconds for psychological impact
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        activeHotels: prev.activeHotels + (Math.random() > 0.8 ? 1 : 0),
        monthlyRides: prev.monthlyRides + Math.floor(Math.random() * 5) + 1,
        avgRevenue: prev.avgRevenue + Math.floor(Math.random() * 100) - 50,
        currentSurge: Math.max(1.5, Math.min(3.5, prev.currentSurge + (Math.random() - 0.5) * 0.2)),
        missedRevenue: prev.missedRevenue + Math.floor(Math.random() * 500) + 100,
        activeRequests: Math.max(10, Math.min(45, prev.activeRequests + Math.floor(Math.random() * 7) - 3))
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/portal/login')
  }

  const handlePortalAccess = (e: React.FormEvent) => {
    e.preventDefault()
    if (gdsCode.length >= 3) {
      router.push(`/portal/login?code=${gdsCode}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black">
      {/* Main Header Component - Shared Navigation */}
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleGetAppClick={handleGetAppClick}
        handleSearchClick={handleSearchClick}
      />

      {/* Page-Specific Header - Below Main Navigation */}
      <div className="mt-14 md:mt-16 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-14 md:top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <IoBusinessOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  Hotel Solutions
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Transform Guest Transportation Into Revenue
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/sdk" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                SDK Docs
              </Link>
              <Link href="/integrations" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Integrations
              </Link>
              <Link 
                href="/portal/login"
                className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg font-semibold hover:bg-amber-700"
              >
                Partner Portal
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section - The Hook */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-gray-50 dark:from-amber-950/10 dark:via-gray-950 dark:to-black" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            {/* Trust Badge */}
            <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-4 py-2 rounded-full mb-6">
              <IoCheckmarkCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Trusted by {liveMetrics.activeHotels} Hotels Nationwide</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6">
              Your Guests Are Taking<br />
              <span className="text-amber-600">
                {liveMetrics.monthlyRides.toLocaleString()} Rides Per Month
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
              You're earning <span className="text-red-600 font-bold">$0</span> from them.
              <br />
              Your competitors are earning <span className="text-green-600 font-bold">${liveMetrics.avgRevenue.toLocaleString()}/month</span>.
            </p>

            {/* Urgency Message */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-w-2xl mx-auto mb-8">
              <div className="flex items-center justify-center space-x-2">
                <IoWarningOutline className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-800 dark:text-red-300">
                  <strong>LIVE:</strong> {liveMetrics.activeRequests} guests requesting rides right now • 
                  Current surge: {liveMetrics.currentSurge.toFixed(1)}x • 
                  Lost revenue today: ${Math.floor(liveMetrics.missedRevenue / 30).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-bold text-lg hover:from-amber-700 hover:to-amber-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <span className="flex items-center justify-center space-x-2">
                  <IoRocketOutline className="w-6 h-6" />
                  <span>See Your Lost Revenue</span>
                </span>
              </button>
              <Link
                href="/demo"
                className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700 rounded-lg font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="flex items-center justify-center space-x-2">
                  <IoPlayCircleOutline className="w-6 h-6" />
                  <span>Watch 2-Min Demo</span>
                </span>
              </Link>
            </div>
          </div>

          {/* Live Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-amber-600">${(liveMetrics.missedRevenue / 1000).toFixed(0)}K</div>
              <div className="text-xs text-gray-500">Lost This Month</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-green-600">{liveMetrics.activeHotels}</div>
              <div className="text-xs text-gray-500">Hotels Earning</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-blue-600">{liveMetrics.activeRequests}</div>
              <div className="text-xs text-gray-500">Active Requests</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-red-600">{liveMetrics.currentSurge.toFixed(1)}x</div>
              <div className="text-xs text-gray-500">Current Surge</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem-Agitation Section */}
      <section className="py-12 md:py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              The Hidden Revenue Leak in Your Hotel
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Every day, your guests spend thousands on transportation. You capture 0% of it.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Problem 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoWarningOutline className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Guests Pay Surge Pricing
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your guests pay 2-5x normal rates during peak times, conferences, and events.
              </p>
              <div className="text-2xl font-bold text-red-600">
                Average: $78 per ride
              </div>
            </div>

            {/* Problem 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoCashOutline className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Zero Revenue Capture
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Uber and Lyft make millions from your guests. You make nothing.
              </p>
              <div className="text-2xl font-bold text-orange-600">
                Your share: $0
              </div>
            </div>

            {/* Problem 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoTrendingUpOutline className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Competitors Are Earning
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Hotels using ItWhip average ${liveMetrics.avgRevenue.toLocaleString()}/month in ride revenue.
              </p>
              <div className="text-2xl font-bold text-yellow-600">
                You're behind by ${(liveMetrics.avgRevenue * 12).toLocaleString()}/year
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution Section */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-amber-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 px-4 py-2 rounded-full mb-6">
              <IoSparklesOutline className="w-5 h-5" />
              <span className="text-sm font-medium">The ItWhip Solution</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Turn Every Guest Ride Into Revenue
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our Instant Ride SDK™ seamlessly integrates with your existing systems, 
              enabling complimentary rides for guests while generating revenue for your property.
            </p>
          </div>

          {/* How It Works */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-amber-600">1</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Guest Books</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Guest books your hotel through any channel - direct, OTA, or GDS.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-amber-600">2</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ride Activated</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Complimentary luxury rides automatically included with their stay.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-amber-600">3</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">You Earn</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Earn 30% revenue share on every ride, averaging ${liveMetrics.avgRevenue.toLocaleString()}/month.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <IoCheckmarkCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Zero Investment</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">No vehicles, drivers, or infrastructure needed</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <IoCheckmarkCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Instant Integration</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Works with Amadeus, Sabre, and all major PMS</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <IoCheckmarkCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Premium Fleet</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tesla, Mercedes, BMW vehicles only</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <IoCheckmarkCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">No Surge Pricing</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fixed rates for your guests, always</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <IoCheckmarkCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Flight Tracking</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Automatic adjustment for delays</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <IoCheckmarkCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">24/7 Support</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Dedicated hotel partner success team</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intelligence Dashboard Preview */}
      <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Real-Time Transportation Intelligence
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Make data-driven decisions with our advanced analytics dashboard
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-4">
              <h3 className="text-white font-bold text-lg">Hotel Command Center</h3>
            </div>
            
            <div className="p-6 grid md:grid-cols-3 gap-6">
              {/* Flight Tracker */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <IoAirplaneOutline className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Incoming Flights</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">AA523</span>
                    <span className="text-green-600">On Time - 147 pax</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">SW892</span>
                    <span className="text-yellow-600">Delayed 2hr - 189 pax</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">UA441</span>
                    <span className="text-red-600">CANCELLED - 201 pax</span>
                  </div>
                </div>
              </div>

              {/* Surge Predictor */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <IoTrendingUpOutline className="w-5 h-5 text-amber-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Surge Forecast</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">4PM</span>
                    <span className="text-green-600">Normal pricing</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">5PM</span>
                    <span className="text-yellow-600">2.1x surge predicted</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">6PM</span>
                    <span className="text-red-600">3.5x SURGE EVENT</span>
                  </div>
                </div>
              </div>

              {/* Revenue Calculator */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <IoCashOutline className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Your Opportunity</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Rides Needed</span>
                    <span className="font-semibold">{liveMetrics.activeRequests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Uber Revenue</span>
                    <span className="text-red-600">${(liveMetrics.activeRequests * 78).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Your Revenue</span>
                    <span className="text-green-600 font-bold">${(liveMetrics.activeRequests * 78 * 0.3).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-12 md:py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Hotels Already Winning
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Join {liveMetrics.activeHotels} properties earning from guest transportation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Success Story 1 */}
            <div className="bg-gradient-to-br from-amber-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center space-x-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <IoStarOutline key={i} className="w-5 h-5 text-amber-500 fill-current" />
                ))}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                Four Seasons Scottsdale
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                "We're earning $67,000/month without owning a single vehicle. 
                Our guests love the complimentary Tesla service."
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Monthly Revenue</span>
                <span className="font-bold text-green-600">$67,433</span>
              </div>
            </div>

            {/* Success Story 2 */}
            <div className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <IoStarOutline key={i} className="w-5 h-5 text-amber-500 fill-current" />
                ))}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                Fairmont Princess
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                "Replaced our shuttle service and now we're profitable on transportation. 
                Game changer for our bottom line."
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Monthly Revenue</span>
                <span className="font-bold text-green-600">$52,890</span>
              </div>
            </div>

            {/* Success Story 3 */}
            <div className="bg-gradient-to-br from-green-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <IoStarOutline key={i} className="w-5 h-5 text-amber-500 fill-current" />
                ))}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                The Phoenician
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                "Integration took 24 hours. We earned $8,400 in the first week. 
                Why didn't we do this sooner?"
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Monthly Revenue</span>
                <span className="font-bold text-green-600">$41,200</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator CTA */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-amber-600 to-amber-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Calculate Your Revenue Potential
          </h2>
          <p className="text-xl text-amber-100 mb-8">
            See exactly how much your property could be earning
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
            <div className="grid md:grid-cols-3 gap-4 text-white">
              <div>
                <div className="text-3xl font-bold">{liveMetrics.monthlyRides}</div>
                <div className="text-sm text-amber-200">Monthly Guest Rides</div>
              </div>
              <div>
                <div className="text-3xl font-bold">$78</div>
                <div className="text-sm text-amber-200">Average Ride Value</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-300">
                  ${(liveMetrics.monthlyRides * 78 * 0.3 / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-amber-200">Your Monthly Revenue</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/calculator"
              className="px-8 py-4 bg-white text-amber-700 rounded-lg font-bold text-lg hover:bg-amber-50 transition-colors"
            >
              Calculate My Revenue
            </Link>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-8 py-4 bg-amber-800 text-white rounded-lg font-bold text-lg hover:bg-amber-900 transition-colors"
            >
              Access Partner Portal
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-12 md:py-16 bg-gray-900 dark:bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-red-900/20 text-red-400 px-4 py-2 rounded-full mb-6">
            <IoTimeOutline className="w-5 h-5" />
            <span className="text-sm font-medium">Limited Integration Slots Available</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Every Day You Wait Costs You ${Math.floor(liveMetrics.avgRevenue / 30).toLocaleString()}
          </h2>
          
          <p className="text-xl text-gray-300 mb-8">
            While you're reading this, your competitors are earning from their guests' rides.
          </p>

          <button
            onClick={() => setShowAuthModal(true)}
            className="px-12 py-5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-bold text-xl hover:from-amber-700 hover:to-amber-800 transform hover:scale-105 transition-all duration-200 shadow-2xl"
          >
            Start Earning Today →
          </button>

          <p className="text-sm text-gray-500 mt-6">
            No investment required • Integration in 24 hours • Cancel anytime
          </p>
        </div>
      </section>

      {/* Authentication Modal - The Trap */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Access Your Revenue Dashboard
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter your property code to see your specific revenue potential
              </p>
            </div>

            <form onSubmit={handlePortalAccess} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  GDS/Amadeus Property Code
                </label>
                <input
                  type="text"
                  value={gdsCode}
                  onChange={(e) => setGdsCode(e.target.value.toUpperCase())}
                  placeholder="e.g., PHX1234, MAR5678"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                  minLength={3}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Your unique hotel identifier from Amadeus, Sabre, or Travelport
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-bold hover:from-amber-700 hover:to-amber-800 transition-colors"
              >
                View My Revenue Dashboard
              </button>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Don't have your code? 
                <Link href="/contact" className="text-amber-600 hover:text-amber-700 ml-1">
                  Contact our team
                </Link>
              </p>
            </form>

            <button
              onClick={() => setShowAuthModal(false)}
              className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}