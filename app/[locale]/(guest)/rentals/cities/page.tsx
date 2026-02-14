// app/(guest)/rentals/cities/page.tsx
import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import prisma from '@/app/lib/database/prisma'
import { getAlternateLanguages, getCanonicalUrl, getOgLocale } from '@/app/lib/seo/alternates'
import {
  IoLocationOutline,
  IoArrowForwardOutline,
  IoCarOutline,
  IoNavigateOutline
} from 'react-icons/io5'

// Add ISR - Revalidate every 60 seconds
export const revalidate = 60

// Generate dynamic metadata with actual car photos
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations('SeoMeta')
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
    title: t('citiesTitle'),
    description: t('citiesDescription'),
    openGraph: {
      title: t('citiesOgTitle'),
      description: t('citiesOgDescription'),
      images: [
        {
          url: primaryOgImage,
          width: 1200,
          height: 630,
          alt: 'ItWhip Car Rentals - Available Cars in Arizona'
        }
      ],
      type: 'website',
      locale: getOgLocale(locale),
      url: getCanonicalUrl('/rentals/cities', locale)
    },
    twitter: {
      card: 'summary_large_image',
      title: t('citiesOgTitle'),
      description: t('citiesOgDescription'),
      images: [primaryOgImage]
    },
    alternates: {
      canonical: getCanonicalUrl('/rentals/cities', locale),
      languages: getAlternateLanguages('/rentals/cities'),
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
  const t = await getTranslations('RentalCities')
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
        take: 4, // Get 4 for horizontal display
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
                <span className="text-sm font-semibold">{t('nearPhoenix')}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
                {t('browseByCity')}
              </h1>
              <p className="text-base sm:text-lg text-gray-200 max-w-2xl mx-auto">
                {t('subtitle', { count: sortedCities.reduce((sum, c) => sum + c.count, 0), cities: sortedCities.length })}
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
                    <div key={cityData.city}>
                      {/* City Header */}
                      <div className="mb-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          {t('cityAZ', { city: cityData.city })}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <IoLocationOutline className="w-4 h-4" />
                            {t('distance', { distance: cityData.distance })}
                          </span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('carCount', { count: cityData.count })}
                          </span>
                          {priceRange && (
                            <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                              {t('priceRange', { min: priceRange.min, max: priceRange.max })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Cars Grid - 4 cars horizontal */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        {cityData.cars.slice(0, 4).map((car) => (
                          <CompactCarCard key={car.id} car={transformCarForCompactCard(car)} />
                        ))}
                      </div>

                      {/* View All Button */}
                      <div className="mt-4 text-center">
                        <Link
                          href={`/rentals/cities/${citySlug}`}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                        >
                          {t('viewAllCars', { count: cityData.count, city: cityData.city })}
                          <IoArrowForwardOutline className="w-4 h-4" />
                        </Link>
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
                  {t('noCarsTitle')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t('noCarsDescription')}
                </p>
                <Link
                  href="/rentals/search"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium"
                >
                  {t('browseAllCars')}
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