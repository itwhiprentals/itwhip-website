// app/coverage/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import { 
  IoLocationOutline,
  IoAirplaneOutline,
  IoBusinessOutline,
  IoGolfOutline,
  IoRestaurantOutline,
  IoSparklesOutline,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoCarOutline,
  IoMapOutline,
  IoExpandOutline,
  IoTrendingUpOutline,
  IoInformationCircleOutline,
  IoArrowForwardOutline,
  IoStarOutline,
  IoNavigateOutline,
  IoGlobeOutline
} from 'react-icons/io5'

export default function CoveragePage() {
  const router = useRouter()
  const [selectedCity, setSelectedCity] = useState('phoenix')
  
  // Header state management for main nav
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers for main nav
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  const cities = {
    phoenix: {
      name: 'Phoenix',
      status: 'active',
      stats: {
        hotels: 142,
        drivers: 423,
        avgWait: '3.8 min',
        coverage: '98%'
      },
      areas: [
        'Downtown Phoenix',
        'Biltmore',
        'Arcadia',
        'Central Phoenix',
        'Phoenix Sky Harbor Airport',
        'Camelback Corridor'
      ],
      hotels: [
        'Arizona Biltmore',
        'The Camby',
        'Royal Palms Resort',
        'The Phoenician (via Scottsdale)',
        'Kimpton Hotel Palomar'
      ]
    },
    scottsdale: {
      name: 'Scottsdale',
      status: 'active',
      stats: {
        hotels: 198,
        drivers: 512,
        avgWait: '3.2 min',
        coverage: '99%'
      },
      areas: [
        'Old Town Scottsdale',
        'North Scottsdale',
        'Scottsdale Quarter',
        'Kierland Commons',
        'McCormick Ranch',
        'Gainey Ranch'
      ],
      hotels: [
        'Four Seasons Resort Scottsdale',
        'The Phoenician',
        'Fairmont Scottsdale Princess',
        'Omni Scottsdale Resort',
        'W Scottsdale'
      ]
    },
    tempe: {
      name: 'Tempe',
      status: 'active',
      stats: {
        hotels: 67,
        drivers: 189,
        avgWait: '4.5 min',
        coverage: '92%'
      },
      areas: [
        'Downtown Tempe',
        'ASU Campus',
        'Tempe Marketplace',
        'Mill Avenue District',
        'Tempe Town Lake',
        'South Tempe'
      ],
      hotels: [
        'Omni Tempe',
        'AC Hotel Phoenix Tempe',
        'Tempe Mission Palms',
        'Graduate Tempe',
        'Aloft Tempe'
      ]
    },
    chandler: {
      name: 'Chandler',
      status: 'active',
      stats: {
        hotels: 48,
        drivers: 134,
        avgWait: '5.2 min',
        coverage: '88%'
      },
      areas: [
        'Downtown Chandler',
        'Chandler Fashion Center',
        'Ocotillo',
        'South Chandler',
        'Price Corridor',
        'Ahwatukee Foothills'
      ],
      hotels: [
        'Sheraton Grand at Wild Horse Pass',
        'Hilton Phoenix Chandler',
        'Crowne Plaza San Marcos',
        'Staybridge Suites Chandler'
      ]
    },
    mesa: {
      name: 'Mesa',
      status: 'coming',
      launch: 'March 2025',
      areas: [
        'Downtown Mesa',
        'Mesa Gateway Airport',
        'Superstition Springs',
        'Red Mountain',
        'Las Sendas',
        'Mesa Riverview'
      ]
    },
    glendale: {
      name: 'Glendale',
      status: 'coming',
      launch: 'April 2025',
      areas: [
        'Westgate Entertainment',
        'Downtown Glendale',
        'Arrowhead',
        'State Farm Stadium Area',
        'Glendale Sports District'
      ]
    }
  }

  const popularRoutes = [
    {
      from: 'Phoenix Sky Harbor Airport',
      to: 'Old Town Scottsdale',
      time: '18-22 min',
      price: '$35-45',
      frequency: '450+ daily'
    },
    {
      from: 'Phoenix Sky Harbor Airport',
      to: 'Downtown Phoenix',
      time: '8-12 min',
      price: '$22-29',
      frequency: '320+ daily'
    },
    {
      from: 'Scottsdale Quarter',
      to: 'Phoenix Sky Harbor Airport',
      time: '20-25 min',
      price: '$38-48',
      frequency: '280+ daily'
    },
    {
      from: 'Downtown Phoenix',
      to: 'Old Town Scottsdale',
      time: '15-20 min',
      price: '$28-35',
      frequency: '190+ daily'
    },
    {
      from: 'Tempe/ASU',
      to: 'Phoenix Sky Harbor Airport',
      time: '10-15 min',
      price: '$24-32',
      frequency: '150+ daily'
    }
  ]

  const airports = [
    {
      name: 'Phoenix Sky Harbor International Airport',
      code: 'PHX',
      distance: 'Central Location',
      features: ['Dedicated pickup zones', 'Meet & greet available', 'Flight tracking', 'Fixed rates'],
      hotels: '10-25 min to most hotels'
    },
    {
      name: 'Phoenix-Mesa Gateway Airport',
      code: 'AZA',
      distance: '30 mi from Phoenix',
      features: ['Growing service area', 'Lower traffic', 'Easy pickups'],
      hotels: '35-45 min to Scottsdale'
    },
    {
      name: 'Scottsdale Airport',
      code: 'SCF',
      distance: 'North Scottsdale',
      features: ['Private jets', 'VIP service', 'Executive travelers'],
      hotels: '5-15 min to luxury resorts'
    }
  ]

  const currentCity = cities[selectedCity as keyof typeof cities]

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
              <IoMapOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Service Areas
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-green-600 bg-green-100 dark:bg-green-900/20 rounded">
                4 Cities Active
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <a href="#routes" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Popular Routes
              </a>
              <a href="#airports" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Airports
              </a>
              <Link href="/hotel-solutions" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Partner Hotels
              </Link>
              <Link 
                href="/"
                className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg font-semibold hover:bg-amber-700"
              >
                Book Now
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
                <IoNavigateOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Routes</span>
              </a>
              <a 
                href="#airports" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoAirplaneOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Airports</span>
              </a>
              <Link 
                href="/hotel-solutions" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoBusinessOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Hotels</span>
              </Link>
              <Link 
                href="/"
                className="flex items-center space-x-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold whitespace-nowrap min-w-fit"
              >
                <IoCarOutline className="w-4 h-4 flex-shrink-0" />
                <span>Book Now</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* City Selector - Fixed below headers */}
      <div className="fixed top-[146px] md:top-[112px] left-0 right-0 z-20 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-4 space-x-2 sm:space-x-4 scrollbar-hide">
            {Object.entries(cities).map(([key, city]) => (
              <button
                key={key}
                onClick={() => setSelectedCity(key)}
                className={`flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg whitespace-nowrap transition ${
                  selectedCity === key
                    ? 'bg-amber-600 text-white'
                    : city.status === 'active'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    : 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600'
                }`}
              >
                <IoLocationOutline className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-medium">{city.name}</span>
                {city.status === 'coming' && (
                  <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                    Coming Soon
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto mt-[226px] md:mt-[168px] pb-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-amber-50 to-white dark:from-gray-950 dark:to-gray-900 py-8 sm:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-100 dark:bg-green-900/20 rounded-full mb-4 sm:mb-6">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm text-green-800 dark:text-green-300 font-medium">
                  Now Serving 4 Cities • 455 Hotels • 1,258 Drivers
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Phoenix Metro Coverage
                <span className="block text-amber-600 mt-2">Expanding Daily</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400">
                Instant luxury rides from 455+ partner hotels across Phoenix, Scottsdale, Tempe, and Chandler. 
                Average pickup time under 4 minutes.
              </p>
            </div>
          </div>
        </section>

        {/* City Details */}
        <section className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {currentCity.status === 'active' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* City Stats */}
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sm:p-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      {currentCity.name} Service Area
                    </h2>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-amber-600">{currentCity.stats.hotels}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Partner Hotels</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-amber-600">{currentCity.stats.drivers}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Active Drivers</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-amber-600">{currentCity.stats.avgWait}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Avg Wait Time</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-amber-600">{currentCity.stats.coverage}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Coverage</div>
                      </div>
                    </div>

                    {/* Coverage Areas */}
                    <div className="mb-8">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Neighborhoods Covered
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {currentCity.areas.map((area) => (
                          <div key={area} className="flex items-center space-x-2">
                            <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{area}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Hotels */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Featured Partner Hotels
                      </h3>
                      <div className="space-y-3">
                        {currentCity.hotels.map((hotel) => (
                          <div key={hotel} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <IoBusinessOutline className="w-5 h-5 text-amber-600" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{hotel}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <IoStarOutline key={i} className="w-3 h-3 text-amber-500 fill-current" />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Features */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Service Features
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start space-x-3">
                        <IoTimeOutline className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">24/7 Availability</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Round-the-clock service</p>
                        </div>
                      </li>
                      <li className="flex items-start space-x-3">
                        <IoCarOutline className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Luxury Fleet</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Tesla, Mercedes, BMW</p>
                        </div>
                      </li>
                      <li className="flex items-start space-x-3">
                        <IoAirplaneOutline className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Airport Priority</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Dedicated pickup zones</p>
                        </div>
                      </li>
                      <li className="flex items-start space-x-3">
                        <IoSparklesOutline className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">No Surge Pricing</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Fixed rates always</p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-3">
                      Book from {currentCity.name}
                    </h3>
                    <p className="text-sm text-amber-800 dark:text-amber-400 mb-4">
                      Instant luxury rides available from all partner hotels in this area.
                    </p>
                    <Link href="/" className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition">
                      <span>Find Hotels</span>
                      <IoArrowForwardOutline className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              // Coming Soon City
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  <IoExpandOutline className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Coming to {currentCity.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  We're expanding to {currentCity.name} in {(currentCity as any).launch}. Partner hotels and drivers 
                  can pre-register now for priority onboarding.
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Planned Coverage Areas:
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {(currentCity as any).areas.map((area: string) => (
                      <div key={area} className="flex items-center space-x-2">
                        <IoLocationOutline className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{area}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <Link href="/hotel-solutions" className="px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition">
                    Hotels: Partner With Us
                  </Link>
                  <Link href="/drive" className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                    Drivers: Pre-Register
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Popular Routes */}
        <section id="routes" className="py-8 sm:py-12 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">
              Popular Routes
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularRoutes.map((route, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <IoLocationOutline className="w-4 h-4 text-amber-600" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">From</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{route.from}</p>
                    </div>
                    <IoArrowForwardOutline className="w-4 h-4 text-gray-400 mx-2 mt-6" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <IoLocationOutline className="w-4 h-4 text-amber-600" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">To</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{route.to}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white dark:bg-gray-800 rounded px-2 py-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Time</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{route.time}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded px-2 py-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Price</p>
                      <p className="text-sm font-semibold text-amber-600">{route.price}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded px-2 py-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Daily</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{route.frequency}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Airport Service */}
        <section id="airports" className="py-8 sm:py-12 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">
              Airport Service
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {airports.map((airport, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                      <IoAirplaneOutline className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{airport.name}</h3>
                      <p className="text-sm text-amber-600">{airport.code}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {airport.distance} • {airport.hotels}
                  </p>
                  
                  <ul className="space-y-2">
                    {airport.features.map((feature) => (
                      <li key={feature} className="flex items-center space-x-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-xs text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <IoInformationCircleOutline className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    Airport Pickup Instructions
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-400">
                    After landing at PHX, proceed to Terminal 4, Level 1 (Ground Transportation). 
                    Look for the "Ride Share" signs and head to the designated pickup zone. 
                    Your driver will meet you at the specified pickup point with your name on the app.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Expansion Plans */}
        <section className="py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Expanding Across America
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Coming to major cities nationwide throughout 2025
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['Las Vegas', 'Los Angeles', 'Miami', 'Dallas', 'Denver', 'Austin', 'Nashville', 'New York'].map((city) => (
                <div key={city} className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <IoTrendingUpOutline className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{city}</p>
                  <p className="text-xs text-gray-500">2025</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-8 sm:py-12 bg-gradient-to-r from-amber-600 to-amber-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Experience Instant Luxury Rides
            </h2>
            <p className="text-base sm:text-lg text-amber-100 mb-8">
              Available from 455+ hotels across Phoenix Metro
            </p>
            <Link href="/" className="inline-block px-6 sm:px-8 py-3 bg-white text-amber-600 rounded-lg font-bold hover:bg-amber-50 transition shadow-lg">
              Find Your Hotel
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-xs sm:text-sm text-gray-500">
              <p>© 2024 ItWhip Technologies, Inc. Service areas subject to availability.</p>
              <div className="mt-4 space-x-3 sm:space-x-4">
                <Link href="/about" className="hover:text-gray-700 dark:hover:text-gray-300">About</Link>
                <Link href="/contact" className="hover:text-gray-700 dark:hover:text-gray-300">Contact</Link>
                <Link href="/hotel-solutions" className="hover:text-gray-700 dark:hover:text-gray-300">Partner With Us</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}