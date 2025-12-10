// app/(guest)/rentals/cities/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import prisma from '@/app/lib/database/prisma'
import styles from './cities.module.css'
import {
  IoLocationOutline,
  IoArrowForwardOutline,
  IoCarOutline,
  IoNavigateOutline
} from 'react-icons/io5'

// Add ISR - Revalidate every 60 seconds
export const revalidate = 60

// Generate dynamic metadata with actual car photos
export async function generateMetadata(): Promise<Metadata> {
  // Get the first 4 cars with photos for a collage effect
  const carsWithPhotos = await prisma.rentalCar.findMany({
    where: {
      isActive: true,
      photos: {
        some: {}
      }
    },
    select: {
      photos: {
        where: { isHero: true },
        select: { url: true },
        take: 1
      }
    },
    take: 4
  })

  // Get the first available photo or use a default
  const ogImages = carsWithPhotos
    .map(car => car.photos[0]?.url)
    .filter(Boolean)
  
  // If we have photos, use the first one; otherwise use a default
  const primaryOgImage = ogImages[0] || 'https://itwhip.com/default-og-image.jpg'

  return {
    title: 'Car Rentals by City | Phoenix Metro Areas | ItWhip',
    description: 'Browse car rentals in Phoenix, Scottsdale, Tempe, Mesa, and more Arizona cities. Find the perfect rental car near you with instant booking available.',
    openGraph: {
      title: 'Arizona Car Rentals by City - ItWhip',
      description: 'Explore rental cars across Phoenix metro cities. From luxury to economy, find your perfect ride.',
      images: [
        {
          url: primaryOgImage,
          width: 1200,
          height: 630,
          alt: 'ItWhip Car Rentals - Available Cars in Arizona'
        }
      ],
      type: 'website',
      url: 'https://itwhip.com/rentals/cities'
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Arizona Car Rentals by City - ItWhip',
      description: 'Explore rental cars across Phoenix metro cities.',
      images: [primaryOgImage]
    }
  }
}

// City coordinates for distance calculation
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'Phoenix': { lat: 33.4484, lng: -112.0740 },
  'Scottsdale': { lat: 33.4942, lng: -111.9261 },
  'Tempe': { lat: 33.4255, lng: -111.9400 },
  'Mesa': { lat: 33.4152, lng: -111.8315 },
  'Chandler': { lat: 33.3062, lng: -111.8413 },
  'Glendale': { lat: 33.5387, lng: -112.1859 },
  'Gilbert': { lat: 33.3528, lng: -111.7890 },
  'Peoria': { lat: 33.5806, lng: -112.2374 },
  'Paradise Valley': { lat: 33.5417, lng: -111.9437 },
  'Avondale': { lat: 33.4356, lng: -112.3496 },
  'Anthem': { lat: 33.8675, lng: -112.1184 },
  'Tucson': { lat: 32.2226, lng: -110.9747 },
  'Flagstaff': { lat: 35.1983, lng: -111.6513 },
  'Laveen': { lat: 33.3628, lng: -112.1691 }
}

// Calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Transform car data for CompactCarCard
function transformCarForCompactCard(car: any) {
  return {
    id: car.id,
    make: car.make,
    model: car.model,
    year: car.year,
    dailyRate: Number(car.dailyRate),
    carType: car.carType,
    seats: car.seats || 5,
    city: car.city,
    rating: car.rating ? Number(car.rating) : null,
    totalTrips: car.totalTrips,
    instantBook: car.instantBook,
    photos: car.photos || [],
    host: car.host ? {
      name: car.host.name,
      profilePhoto: car.host.profilePhoto
    } : null
  }
}

export default async function CitiesPage() {
  // Fetch all active cars grouped by city
  const carsByCity = await prisma.rentalCar.groupBy({
    by: ['city'],
    where: { 
      isActive: true,
      city: {
        not: ''  // Changed from null to empty string
      }
    },
    _count: {
      _all: true
    }
  })

  // Fetch sample cars for each city (5 per city for preview)
  const citiesWithCars = await Promise.all(
    carsByCity.map(async (cityGroup) => {
      const cars = await prisma.rentalCar.findMany({
        where: { 
          city: cityGroup.city,
          isActive: true
        },
        take: 6, // Get 6 for scrolling
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          dailyRate: true,
          city: true,
          rating: true,
          totalTrips: true,
          instantBook: true,
          carType: true,
          seats: true,
          photos: {
            select: {
              url: true,
              caption: true
            },
            orderBy: { order: 'asc' },
            take: 1
          },
          host: {
            select: {
              name: true,
              isVerified: true,
              profilePhoto: true
            }
          }
        },
        orderBy: [
          { rating: 'desc' },
          { totalTrips: 'desc' }
        ]
      })

      // Calculate distance from Phoenix (default location)
      const cityCoords = CITY_COORDS[cityGroup.city || ''] || CITY_COORDS['Phoenix']
      const distance = calculateDistance(
        CITY_COORDS['Phoenix'].lat,
        CITY_COORDS['Phoenix'].lng,
        cityCoords.lat,
        cityCoords.lng
      )

      return {
        city: cityGroup.city,
        count: cityGroup._count._all,
        distance: Math.round(distance),
        cars: cars
      }
    })
  )

  // Sort cities by distance from Phoenix (closest first)
  const sortedCities = citiesWithCars.sort((a, b) => a.distance - b.distance)

  // Calculate price ranges for each city
  const cityPriceRanges = await Promise.all(
    carsByCity.map(async (cityGroup) => {
      const prices = await prisma.rentalCar.aggregate({
        where: { 
          city: cityGroup.city,
          isActive: true
        },
        _min: { dailyRate: true },
        _max: { dailyRate: true },
        _avg: { dailyRate: true }
      })
      return {
        city: cityGroup.city,
        min: prices._min.dailyRate || 0,
        max: prices._max.dailyRate || 0,
        avg: Math.round(prices._avg.dailyRate || 0)
      }
    })
  )

  const priceMap = Object.fromEntries(
    cityPriceRanges.map(p => [p.city, p])
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* Main content wrapper to match [city]/page.tsx structure */}
      <div>
        {/* Hero Section */}
        <section className="relative h-[300px] sm:h-[350px] md:h-[400px] overflow-hidden">
          {/* Video Background */}
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/hero-video.webm" type="video/webm" />
              <source src="/hero-video.mp4" type="video/mp4" />
            </video>
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/50" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="flex items-center justify-center gap-2 text-amber-400 mb-3">
                <IoNavigateOutline className="w-5 h-5" />
                <span className="text-sm font-semibold">Near Phoenix, AZ</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
                Browse Cars by City
              </h1>
              <p className="text-base sm:text-lg text-gray-200 max-w-2xl mx-auto">
                Find the perfect rental car in your area. {sortedCities.reduce((sum, c) => sum + c.count, 0)} cars available across {sortedCities.length} cities.
              </p>
            </div>
          </div>
        </section>

        {/* Cities List Section - matching [city]/page.tsx structure */}
        <section className="py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {sortedCities.length > 0 ? (
              <div className="space-y-8 sm:space-y-12">
                {sortedCities.map((cityData) => {
                  const priceRange = priceMap[cityData.city || '']
                  const citySlug = (cityData.city || '').toLowerCase().replace(/\s+/g, '-')
                  
                  return (
                    <div key={cityData.city} className="rounded-lg overflow-hidden">
                      {/* City Header - Consistent with [city]/page.tsx */}
                      <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                {cityData.city}, AZ
                              </h2>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                  <IoLocationOutline className="w-4 h-4" />
                                  {cityData.distance} miles away
                                </span>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {cityData.count} {cityData.count === 1 ? 'car' : 'cars'} available
                                </span>
                                {priceRange && (
                                  <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                                    ${priceRange.min}-${priceRange.max}/day
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* View All Link */}
                          <Link
                            href={`/rentals/cities/${citySlug}`}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium text-sm"
                          >
                            View all
                            <IoArrowForwardOutline className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>

                      {/* Cars Preview - Horizontal Scroll */}
                      <div className="relative pt-4">
                        <div className={`flex gap-3 sm:gap-4 pb-4 ${styles.scrollbarHide}`}>
                          {cityData.cars.map((car) => (
                            <div key={car.id} className="flex-shrink-0 w-64 sm:w-72 overflow-visible">
                              <CompactCarCard car={transformCarForCompactCard(car)} />
                            </div>
                          ))}
                          
                          {/* Show More Card */}
                          {cityData.count > cityData.cars.length && (
                            <Link
                              href={`/rentals/cities/${citySlug}`}
                              className="flex-shrink-0 w-64 sm:w-72 bg-white dark:bg-gray-800 rounded-xl flex flex-col items-center justify-center h-[164px] sm:h-[176px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-lg border border-gray-200 dark:border-gray-700 group"
                            >
                              <IoCarOutline className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2 group-hover:scale-110 transition-transform" />
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                +{cityData.count - cityData.cars.length} more
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                View all →
                              </span>
                            </Link>
                          )}
                        </div>
                        
                        {/* Mobile View All Button */}
                        <div className="sm:hidden pt-2">
                          <Link
                            href={`/rentals/cities/${citySlug}`}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium text-sm"
                          >
                            View all {cityData.city} cars
                            <IoArrowForwardOutline className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              // Empty State
              <div className="text-center py-16">
                <IoCarOutline className="w-20 h-20 mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No Cars Available
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Check back soon for available rentals in your area.
                </p>
                <Link
                  href="/rentals/search"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium"
                >
                  Browse All Cars
                  <IoArrowForwardOutline className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  )
}