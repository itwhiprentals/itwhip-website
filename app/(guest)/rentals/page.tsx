// app/(guest)/rentals/page.tsx
// Main rental page - Landing page for car rentals

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import RentalSearchWidget from '@/app/(guest)/components/hero/RentalSearchWidget'
import CarTypeCarousel from './components/CarTypeCarousel'
import { 
  IoCarOutline, 
  IoShieldCheckmarkOutline, 
  IoSparklesOutline,
  IoFlashOutline,
  IoLocationOutline,
  IoPricetagOutline,
  IoStarOutline,
  IoCheckmarkCircleOutline,
  IoArrowForwardOutline,
  IoTrophyOutline,
  IoRocketOutline,
  IoPeopleOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoThumbsUpOutline,
  IoDocumentTextOutline,
  IoKeyOutline,
  IoSearchOutline,
  IoTrendingUpOutline,
  IoTimerOutline,
  IoBusinessOutline
} from 'react-icons/io5'

export default function RentalsPage() {
  const router = useRouter()
  const [featuredCars, setFeaturedCars] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCars: 350,
    averagePrice: 75,
    topRated: 4.8
  })

  // Fetch featured cars and stats on mount
  useEffect(() => {
    fetchFeaturedCars()
    fetchStats()
  }, [])

  const fetchFeaturedCars = async () => {
    try {
      const response = await fetch('/api/rentals/search?sortBy=recommended&limit=6')
      const data = await response.json()
      
      console.log('API Response structure:', data) // Debug to see actual structure
      
      // Handle different possible response structures
      let cars = []
      
      if (data?.success && data?.data?.cars) {
        // Expected: { success: true, data: { cars: [...] } }
        cars = data.data.cars
      } else if (data?.data && Array.isArray(data.data)) {
        // Alternative: { success: true, data: [...] }
        cars = data.data
      } else if (data?.cars && Array.isArray(data.cars)) {
        // Alternative: { cars: [...] }
        cars = data.cars
      } else if (Array.isArray(data)) {
        // Direct array response
        cars = data
      } else {
        // No valid structure found, use mock data
        console.log('Using mock data due to unexpected API structure')
        cars = [
          {
            id: '1',
            make: 'Tesla',
            model: 'Model 3',
            year: 2023,
            dailyRate: 89,
            rating: 4.9,
            totalTrips: 123,
            instantBook: true,
            source: 'p2p'
          },
          {
            id: '2',
            make: 'Jeep',
            model: 'Wrangler',
            year: 2022,
            dailyRate: 125,
            rating: 4.8,
            totalTrips: 89,
            instantBook: true
          },
          {
            id: '3',
            make: 'BMW',
            model: 'X5',
            year: 2023,
            dailyRate: 145,
            rating: 4.9,
            totalTrips: 67,
            instantBook: true
          }
        ]
      }
      
      setFeaturedCars(cars.slice(0, 6))
      
    } catch (error) {
      console.error('Error fetching featured cars:', error)
      // Set mock data if API fails
      setFeaturedCars([
        {
          id: '1',
          make: 'Tesla',
          model: 'Model 3',
          year: 2023,
          dailyRate: 89,
          rating: 4.9,
          totalTrips: 123,
          instantBook: true,
          source: 'p2p'
        },
        {
          id: '2',
          make: 'Jeep',
          model: 'Wrangler',
          year: 2022,
          dailyRate: 125,
          rating: 4.8,
          totalTrips: 89,
          instantBook: true
        },
        {
          id: '3',
          make: 'BMW',
          model: 'X5',
          year: 2023,
          dailyRate: 145,
          rating: 4.9,
          totalTrips: 67,
          instantBook: true
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/rentals/search?countOnly=true')
      const data = await response.json()
      if (data?.success) {
        setStats({
          totalCars: data.count || 350,
          averagePrice: data.averagePrice || 75,
          topRated: data.topRated || 4.8
        })
      }
    } catch (error) {
      // Keep default stats
    }
  }

  // Benefits
  const benefits = [
    {
      icon: IoWalletOutline,
      title: 'Best Prices',
      description: 'Save up to 35% compared to traditional rentals',
      stat: '35% savings'
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: 'Fully Insured',
      description: 'Comprehensive coverage included',
      stat: '$1M coverage'
    },
    {
      icon: IoFlashOutline,
      title: 'Instant Booking',
      description: 'Skip the counter, book online',
      stat: '2 min booking'
    },
    {
      icon: IoLocationOutline,
      title: 'Hotel Delivery',
      description: 'Free delivery to your hotel',
      stat: '200+ hotels'
    },
    {
      icon: IoPeopleOutline,
      title: 'Local Hosts',
      description: 'Real people, real service',
      stat: '500+ hosts'
    },
    {
      icon: IoThumbsUpOutline,
      title: '24/7 Support',
      description: 'Always here to help',
      stat: '24/7 available'
    }
  ]

  // How it works steps
  const steps = [
    {
      number: '1',
      title: 'Search',
      description: 'Find your perfect car',
      time: '2 min'
    },
    {
      number: '2',
      title: 'Book',
      description: 'Instant confirmation',
      time: '30 sec'
    },
    {
      number: '3',
      title: 'Pick Up',
      description: 'Airport or hotel',
      time: 'Flexible'
    },
    {
      number: '4',
      title: 'Drive',
      description: 'Enjoy your trip',
      time: 'Freedom'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section with Video Background - Mobile Optimized */}
      <section className="relative min-h-[70vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden bg-black">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video 
            className="w-full h-full object-cover opacity-40"
            autoPlay 
            muted 
            loop 
            playsInline
            poster="https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=1920&h=1080&fit=crop"
          >
            <source src="/itwhip-hero.webm" type="video/webm" />
            <source src="/itwhip-hero.mp4" type="video/mp4" />
          </video>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/60" />

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3 md:mb-4 tracking-tight">
            Your ride, your way
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 md:mb-12 max-w-2xl mx-auto px-4">
            Book directly from local Phoenix hosts and save big
          </p>

          {/* Enhanced Search Widget */}
          <div className="px-2 sm:px-0">
            <RentalSearchWidget variant="hero" />
          </div>
          
          {/* Stats Bar - Moved Below Search */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 mt-8 md:mt-10 text-white/80">
            <div className="flex items-center gap-2">
              <IoCarOutline className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="text-xs sm:text-sm"><strong>{stats.totalCars}+</strong> cars</span>
            </div>
            <div className="flex items-center gap-2">
              <IoStarOutline className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="text-xs sm:text-sm"><strong>{stats.topRated}</strong> rating</span>
            </div>
            <div className="flex items-center gap-2">
              <IoWalletOutline className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="text-xs sm:text-sm">From <strong>${stats.averagePrice}</strong>/day</span>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator - Keep the bounce */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Quick Actions Bar - Mobile Optimized */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 backdrop-blur-lg bg-white/90 dark:bg-gray-800/90">
        <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
              <Link 
                href="/rentals/search" 
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
              >
                <IoSearchOutline className="w-4 sm:w-5 h-4 sm:h-5" />
                <span>Browse</span>
              </Link>
              <Link 
                href="/rentals/manage" 
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
              >
                <IoDocumentTextOutline className="w-4 sm:w-5 h-4 sm:h-5" />
                <span>My Rentals</span>
              </Link>
            </div>
            <Link 
              href="/rentals/host" 
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
            >
              <IoKeyOutline className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="hidden sm:inline">List Your Car</span>
              <span className="sm:hidden">List</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Car Types Section - Using New CarTypeCarousel Component */}
      <CarTypeCarousel />

      {/* Featured Cars - Mobile Optimized */}
      {featuredCars.length > 0 && (
        <section className="py-12 sm:py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8 sm:mb-12">
              <div>
                <span className="text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">Popular Now</span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-1 sm:mb-2">
                  Featured Cars
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400">
                  Hand-picked for you
                </p>
              </div>
              <Link
                href="/rentals/search"
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium"
              >
                View all
                <IoArrowForwardOutline className="w-5 h-5" />
              </Link>
            </div>

            {/* Mobile: Single column, Desktop: Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {featuredCars.map((car, index) => (
                <Link
                  key={car.id || index}
                  href={`/rentals/${car.id}`}
                  className="group relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden"
                >
                  <div className="aspect-w-16 aspect-h-10 bg-gray-200 dark:bg-gray-700 relative overflow-hidden h-48 sm:h-56">
                    {car.photos && car.photos[0] ? (
                      <img
                        src={car.photos[0]}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                        <IoCarOutline className="w-16 sm:w-20 h-16 sm:h-20 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-2">
                      {car.source === 'p2p' && (
                        <span className="px-2 sm:px-3 py-1 bg-black/80 backdrop-blur text-white text-xs font-semibold rounded-full">
                          Local Host
                        </span>
                      )}
                      {car.instantBook && (
                        <span className="px-2 sm:px-3 py-1 bg-green-600/90 backdrop-blur text-white text-xs font-semibold rounded-full flex items-center gap-1">
                          <IoFlashOutline className="w-3 h-3" />
                          Instant
                        </span>
                      )}
                    </div>
                    
                    {/* Price Badge */}
                    <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4">
                      <div className="px-3 py-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur rounded-lg shadow-lg">
                        <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">${car.dailyRate}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">/day</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-5">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {car.year} {car.make} {car.model}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {car.rating && (
                          <div className="flex items-center gap-1">
                            <IoStarOutline className="w-4 h-4 text-amber-500 fill-current" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {car.rating}
                            </span>
                          </div>
                        )}
                        {car.totalTrips > 0 && (
                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {car.totalTrips} trips
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Quick Action - Mobile Optimized */}
                    <div className="flex items-center justify-center py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20 transition-colors">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                        View Details
                      </span>
                      <IoArrowForwardOutline className="w-4 h-4 ml-2 text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile View All Link */}
            <div className="mt-6 text-center sm:hidden">
              <Link
                href="/rentals/search"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium"
              >
                View all cars
                <IoArrowForwardOutline className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How It Works - Mobile Optimized */}
      <section className="py-12 sm:py-16 md:py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">Simple Process</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-2 sm:mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
              Book in minutes, not hours
            </p>
          </div>

          {/* Mobile: 2x2 Grid, Desktop: 1x4 */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative text-center group">
                {/* Desktop connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 dark:from-amber-600 dark:via-amber-500 dark:to-amber-600" />
                )}
                
                <div className="relative inline-flex items-center justify-center w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-full text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 shadow-xl group-hover:scale-110 transition-transform">
                  {step.number}
                </div>
                
                <span className="inline-block px-2 sm:px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-full mb-2 sm:mb-3">
                  {step.time}
                </span>
                
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-2">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits - Mobile Optimized */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">Why Choose Us</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-2 sm:mb-4">
              The ItWhip Advantage
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
              More than just car rental
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <benefit.icon className="w-6 sm:w-7 h-6 sm:h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                        {benefit.title}
                      </h3>
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                        {benefit.stat}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Mobile Optimized */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-600/20 backdrop-blur border border-amber-600/50 text-amber-400 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
            <IoTrendingUpOutline className="w-4 h-4" />
            <span>Join 10,000+ happy travelers</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Ready to Hit the Road?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
            Your perfect car is waiting. Book now and save big on your Phoenix adventure.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
            <Link
              href="/rentals/search"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl text-sm sm:text-base"
            >
              <IoCarOutline className="w-5 sm:w-6 h-5 sm:h-6" />
              Browse All Cars
            </Link>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-all transform hover:scale-105 shadow-2xl text-sm sm:text-base"
            >
              <IoRocketOutline className="w-5 sm:w-6 h-5 sm:h-6" />
              Start Your Search
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 text-gray-400 text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <IoCheckmarkCircleOutline className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
              <span>Free Cancellation</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <IoCheckmarkCircleOutline className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
              <span>No Hidden Fees</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <IoCheckmarkCircleOutline className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
              <span>Best Price</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}