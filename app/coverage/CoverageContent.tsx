// app/coverage/CoverageContent.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'
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

export default function CoverageContent() {
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

  // Arizona cities with car rental availability
  const cities = {
    phoenix: {
      name: 'Phoenix',
      status: 'active',
      stats: {
        cars: 45,
        hosts: 32,
        avgRate: '$65/day',
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
      popularCars: [
        'Tesla Model 3',
        'BMW 3 Series',
        'Jeep Wrangler',
        'Toyota Camry',
        'Mercedes C-Class'
      ]
    },
    scottsdale: {
      name: 'Scottsdale',
      status: 'active',
      stats: {
        cars: 32,
        hosts: 24,
        avgRate: '$85/day',
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
      popularCars: [
        'Tesla Model Y',
        'Porsche 911',
        'Range Rover',
        'Mercedes E-Class',
        'Audi Q7'
      ]
    },
    tempe: {
      name: 'Tempe',
      status: 'active',
      stats: {
        cars: 28,
        hosts: 18,
        avgRate: '$55/day',
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
      popularCars: [
        'Honda Civic',
        'Toyota RAV4',
        'Tesla Model 3',
        'Mazda CX-5',
        'Hyundai Tucson'
      ]
    },
    chandler: {
      name: 'Chandler',
      status: 'active',
      stats: {
        cars: 19,
        hosts: 14,
        avgRate: '$58/day',
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
      popularCars: [
        'Toyota Camry',
        'Honda Accord',
        'Jeep Grand Cherokee',
        'Ford Mustang',
        'Chevrolet Tahoe'
      ]
    },
    mesa: {
      name: 'Mesa',
      status: 'active',
      stats: {
        cars: 22,
        hosts: 15,
        avgRate: '$52/day',
        coverage: '85%'
      },
      areas: [
        'Downtown Mesa',
        'Mesa Gateway Airport',
        'Superstition Springs',
        'Red Mountain',
        'Las Sendas',
        'Mesa Riverview'
      ],
      popularCars: [
        'Ford F-150',
        'Chevrolet Silverado',
        'Toyota Tacoma',
        'Jeep Wrangler',
        'Honda CR-V'
      ]
    },
    gilbert: {
      name: 'Gilbert',
      status: 'active',
      stats: {
        cars: 15,
        hosts: 11,
        avgRate: '$60/day',
        coverage: '82%'
      },
      areas: [
        'Downtown Gilbert',
        'SanTan Village',
        'Val Vista Lakes',
        'Agritopia',
        'Power Ranch',
        'Morrison Ranch'
      ],
      popularCars: [
        'Tesla Model Y',
        'BMW X5',
        'Lexus RX',
        'Audi Q5',
        'Mercedes GLC'
      ]
    }
  }

  const airports = [
    {
      name: 'Phoenix Sky Harbor International Airport',
      code: 'PHX',
      distance: 'Central Location',
      features: ['Airport delivery available', 'Meet at terminal', 'Flight tracking', 'Flexible pickup'],
      note: 'Most hosts offer airport delivery for $25-50'
    },
    {
      name: 'Phoenix-Mesa Gateway Airport',
      code: 'AZA',
      distance: '30 mi from Phoenix',
      features: ['Growing service area', 'Lower traffic', 'Easy pickups'],
      note: 'Several hosts available in Mesa area'
    },
    {
      name: 'Scottsdale Airport',
      code: 'SCF',
      distance: 'North Scottsdale',
      features: ['Private jets', 'Executive travelers', 'Luxury vehicles'],
      note: 'Premium vehicles available nearby'
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
                6 Cities Active
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <a href="#airports" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Airports
              </a>
              <Link href="/rentals" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Browse Cars
              </Link>
              <Link
                href="/rentals"
                className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg font-semibold hover:bg-amber-700"
              >
                Find a Car
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
                href="#airports"
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoAirplaneOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Airports</span>
              </a>
              <Link
                href="/rentals"
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoCarOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Browse Cars</span>
              </Link>
              <Link
                href="/rentals"
                className="flex items-center space-x-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold whitespace-nowrap min-w-fit"
              >
                <IoCarOutline className="w-4 h-4 flex-shrink-0" />
                <span>Find a Car</span>
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
                  Now Serving 6 Cities • 161+ Cars • 114 Hosts
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Phoenix Metro Coverage
                <span className="block text-amber-600 mt-2">Peer-to-Peer Car Rentals</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400">
                Rent cars from local owners across Phoenix, Scottsdale, Tempe, Mesa, Chandler, and Gilbert.
                From $45/day with $1M insurance included.
              </p>
            </div>
          </div>
        </section>

        {/* City Details */}
        <section className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                      <div className="text-2xl font-bold text-amber-600">{currentCity.stats.cars}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Available Cars</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-amber-600">{currentCity.stats.hosts}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Local Hosts</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-amber-600">{currentCity.stats.avgRate}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Avg Daily Rate</div>
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

                  {/* Popular Cars */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Popular Cars in {currentCity.name}
                    </h3>
                    <div className="space-y-3">
                      {currentCity.popularCars.map((car) => (
                        <div key={car} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <IoCarOutline className="w-5 h-5 text-amber-600" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{car}</span>
                          </div>
                          <Link href="/rentals" className="text-xs text-amber-600 hover:text-amber-700">
                            View Available →
                          </Link>
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
                    Why ItWhip?
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <IoCarOutline className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Local Cars</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Rent from neighbors, not corporations</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <IoSparklesOutline className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">$1M Insurance</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Liability coverage included</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <IoAirplaneOutline className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Airport Delivery</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Many hosts deliver to PHX</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <IoTimeOutline className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Flexible Pickup</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Meet at location or delivery</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-3">
                    Find Cars in {currentCity.name}
                  </h3>
                  <p className="text-sm text-amber-800 dark:text-amber-400 mb-4">
                    Browse {currentCity.stats.cars}+ cars from local hosts in this area.
                  </p>
                  <Link href={`/rentals/cities/${currentCity.name.toLowerCase()}`} className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition">
                    <span>Browse Cars</span>
                    <IoArrowForwardOutline className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Airport Service */}
        <section id="airports" className="py-8 sm:py-12 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">
              Airport Car Rental
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
                    {airport.distance}
                  </p>

                  <ul className="space-y-2 mb-4">
                    {airport.features.map((feature) => (
                      <li key={feature} className="flex items-center space-x-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-xs text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    {airport.note}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <IoInformationCircleOutline className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    Airport Pickup Tips
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-400">
                    Many ItWhip hosts offer airport delivery at PHX. When booking, check if your host
                    can meet you at the terminal or arrange a convenient pickup location. Delivery fees
                    typically range from $25-50.
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
              Expanding Across Arizona
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Coming to more Arizona cities in 2025
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['Tucson', 'Flagstaff', 'Sedona', 'Peoria', 'Surprise', 'Glendale', 'Goodyear', 'Queen Creek'].map((city) => (
                <div key={city} className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <IoTrendingUpOutline className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{city}</p>
                  <p className="text-xs text-gray-500">Coming Soon</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-8 sm:py-12 bg-gradient-to-r from-amber-600 to-amber-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Find Your Perfect Rental
            </h2>
            <p className="text-base sm:text-lg text-amber-100 mb-8">
              Browse 161+ cars from local Arizona hosts
            </p>
            <Link href="/rentals" className="inline-block px-6 sm:px-8 py-3 bg-white text-amber-600 rounded-lg font-bold hover:bg-amber-50 transition shadow-lg">
              Browse All Cars
            </Link>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  )
}
