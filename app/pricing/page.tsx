// app/pricing/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import { 
  IoCarSportOutline,
  IoAirplaneOutline,
  IoBusinessOutline,
  IoLocationOutline,
  IoCheckmarkCircle,
  IoCloseCircleOutline,
  IoSparklesOutline,
  IoFlashOutline,
  IoShieldCheckmarkOutline,
  IoInformationCircleOutline,
  IoTrendingUpOutline,
  IoWalletOutline,
  IoTimeOutline,
  IoStarOutline,
  IoArrowForwardOutline,
  IoWarningOutline,
  IoCalculatorOutline,
  IoReceiptOutline
} from 'react-icons/io5'

export default function PricingPage() {
  const router = useRouter()
  const [selectedRoute, setSelectedRoute] = useState('airport')
  const [showSurgeComparison, setShowSurgeComparison] = useState(false)
  
  // Header state management for main nav
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers for main nav
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  const routes = [
    { id: 'airport', name: 'Airport', icon: IoAirplaneOutline },
    { id: 'local', name: 'Local', icon: IoLocationOutline },
    { id: 'downtown', name: 'Downtown', icon: IoBusinessOutline }
  ]

  const pricing = {
    airport: {
      standard: { base: 29, surge: 78, savings: 49 },
      luxury: { base: 45, surge: 125, savings: 80 },
      premium: { base: 65, surge: 180, savings: 115 }
    },
    local: {
      standard: { base: 15, surge: 42, savings: 27 },
      luxury: { base: 25, surge: 68, savings: 43 },
      premium: { base: 35, surge: 95, savings: 60 }
    },
    downtown: {
      standard: { base: 22, surge: 58, savings: 36 },
      luxury: { base: 35, surge: 92, savings: 57 },
      premium: { base: 48, surge: 125, savings: 77 }
    }
  }

  const vehicleClasses = [
    {
      name: 'Standard',
      description: 'Tesla Model 3, BMW 3 Series',
      features: ['Professional driver', 'Water & mints', 'Phone chargers', 'WiFi available'],
      image: '/api/placeholder/400/200'
    },
    {
      name: 'Luxury',
      description: 'Tesla Model S, Mercedes E-Class',
      features: ['Premium driver', 'Refreshments', 'All amenities', 'Leather interior'],
      image: '/api/placeholder/400/200'
    },
    {
      name: 'Premium',
      description: 'Mercedes S-Class, BMW 7 Series',
      features: ['VIP driver', 'Full bar service', 'Privacy glass', 'Executive comfort'],
      image: '/api/placeholder/400/200'
    }
  ]

  const currentPricing = pricing[selectedRoute as keyof typeof pricing]

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
              <IoWalletOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Member Pricing
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-green-600 bg-green-100 dark:bg-green-900/20 rounded">
                No Surge Ever
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <a href="#routes" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Routes
              </a>
              <a href="#comparison" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Compare
              </a>
              <a href="#fees" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Fees
              </a>
              <Link 
                href="/"
                className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg font-semibold hover:bg-amber-700"
              >
                Book Hotel
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Quick Navigation - Fixed */}
      <div className="md:hidden fixed top-[106px] left-0 right-0 z-30 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <div className="flex-1 overflow-x-auto">
            <div className="flex">
              <a 
                href="#routes" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoLocationOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Routes</span>
              </a>
              <a 
                href="#comparison" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoCalculatorOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Compare</span>
              </a>
              <a 
                href="#fees" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoReceiptOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Fees</span>
              </a>
              <Link 
                href="/"
                className="flex items-center space-x-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold whitespace-nowrap min-w-fit"
              >
                <IoBusinessOutline className="w-4 h-4 flex-shrink-0" />
                <span>Book Hotel</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto mt-[150px] md:mt-[112px] pb-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-amber-50 to-white dark:from-gray-950 dark:to-gray-900 py-8 sm:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-100 dark:bg-green-900/20 rounded-full mb-4 sm:mb-6">
                <IoShieldCheckmarkOutline className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span className="text-xs sm:text-sm text-green-800 dark:text-green-300 font-medium">
                  No Surge Pricing • Ever
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Fixed Member Rates
                <span className="block text-amber-600 mt-2">Save Up to 70% vs Surge</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
                As a guest at our partner hotels, you enjoy guaranteed fixed rates with no surge pricing. 
                Your luxury ride costs the same at 6 AM or 6 PM, rain or shine.
              </p>

              {/* Live Surge Alert */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800 max-w-2xl mx-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <IoWarningOutline className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                        Current Uber/Lyft Surge: 2.8x
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-400">
                        Airport rides costing $78-125 right now
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSurgeComparison(!showSurgeComparison)}
                    className="text-xs text-red-600 underline"
                  >
                    {showSurgeComparison ? 'Hide' : 'Compare'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Route Selector */}
        <section id="routes" className="py-6 sm:py-8 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1">
                {routes.map((route) => (
                  <button
                    key={route.id}
                    onClick={() => setSelectedRoute(route.id)}
                    className={`flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition ${
                      selectedRoute === route.id
                        ? 'bg-amber-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <route.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base font-medium">{route.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedRoute === 'airport' ? 'Airport Transfer' : selectedRoute === 'local' ? 'Local Rides' : 'Downtown Phoenix'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                All prices are fixed - no surge, no surprises
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {vehicleClasses.map((vehicle, idx) => {
                const priceData = idx === 0 ? currentPricing.standard : idx === 1 ? currentPricing.luxury : currentPricing.premium
                
                return (
                  <div key={idx} className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden ${
                    idx === 1 ? 'border-2 border-amber-500 relative' : ''
                  }`}>
                    {idx === 1 && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <span className="px-4 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                          MOST POPULAR
                        </span>
                      </div>
                    )}
                    
                    <div className="p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {vehicle.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {vehicle.description}
                      </p>
                      
                      {/* Price Display */}
                      <div className="mb-6">
                        <div className="flex items-baseline space-x-2">
                          <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                            ${priceData.base}
                          </span>
                          <span className="text-sm text-gray-500">fixed rate</span>
                        </div>
                        
                        {showSurgeComparison && (
                          <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-red-700 dark:text-red-300">Uber/Lyft now:</span>
                              <span className="font-semibold text-red-800 dark:text-red-200 line-through">
                                ${priceData.surge}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-1">
                              <span className="text-green-700 dark:text-green-300">You save:</span>
                              <span className="font-bold text-green-800 dark:text-green-200">
                                ${priceData.savings}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Features */}
                      <ul className="space-y-2 mb-6">
                        {vehicle.features.map((feature, fidx) => (
                          <li key={fidx} className="flex items-start space-x-2">
                            <IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <button className={`w-full py-2.5 sm:py-3 rounded-lg font-semibold transition ${
                        idx === 1
                          ? 'bg-amber-600 text-white hover:bg-amber-700'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}>
                        Select {vehicle.name}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Additional Fees */}
        <section id="fees" className="py-8 sm:py-12 bg-white dark:bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Transparent Pricing
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2" />
                  Included in Your Rate
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• All taxes and fees</li>
                  <li>• Driver gratuity (20%)</li>
                  <li>• Airport pickup fees</li>
                  <li>• Wait time (up to 15 min)</li>
                  <li>• WiFi & amenities</li>
                  <li>• Flight tracking (airport rides)</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <IoInformationCircleOutline className="w-5 h-5 text-gray-500 mr-2" />
                  Additional Services
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Extra stops: $5 per stop</li>
                  <li>• Car seat: Complimentary</li>
                  <li>• Extended wait: $1/min after 15 min</li>
                  <li>• Meet & greet: $10 (international)</li>
                  <li>• Pet friendly: No extra charge</li>
                  <li>• Hourly service: $85-120/hour</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section id="comparison" className="py-8 sm:py-12 lg:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">
              ItWhip vs. Others
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Feature</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-amber-600">ItWhip</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Uber/Lyft</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Taxi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  <tr>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Surge Pricing</td>
                    <td className="text-center py-3 px-4">
                      <IoCloseCircleOutline className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <IoCheckmarkCircle className="w-5 h-5 text-red-500 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <IoCheckmarkCircle className="w-5 h-5 text-red-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Luxury Vehicles</td>
                    <td className="text-center py-3 px-4">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-xs text-gray-500">Sometimes</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <IoCloseCircleOutline className="w-5 h-5 text-red-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Room Charging</td>
                    <td className="text-center py-3 px-4">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <IoCloseCircleOutline className="w-5 h-5 text-red-500 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <IoCloseCircleOutline className="w-5 h-5 text-red-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Average Wait Time</td>
                    <td className="text-center py-3 px-4 text-sm font-semibold text-amber-600">4 min</td>
                    <td className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">8-12 min</td>
                    <td className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">15-20 min</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Airport Fixed Rate</td>
                    <td className="text-center py-3 px-4 text-sm font-semibold text-amber-600">$29-65</td>
                    <td className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">$35-180</td>
                    <td className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">$45-75</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-r from-amber-600 to-amber-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
              Ready to Skip the Surge?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-amber-100 mb-6 sm:mb-8">
              Book your stay at a partner hotel and enjoy fixed-rate luxury rides
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link href="/" className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-white text-amber-600 rounded-lg font-bold hover:bg-amber-50 transition shadow-lg">
                View Partner Hotels
              </Link>
              <Link href="/how-it-works" className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-white/10 backdrop-blur border border-white/20 text-white rounded-lg font-semibold hover:bg-white/20 transition">
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-xs sm:text-sm text-gray-500">
              <p>All prices in USD. Subject to availability. Hotel booking required.</p>
              <div className="mt-3 sm:mt-4 space-x-3 sm:space-x-4">
                <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300">Terms</Link>
                <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy</Link>
                <Link href="/contact" className="hover:text-gray-700 dark:hover:text-gray-300">Contact</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}