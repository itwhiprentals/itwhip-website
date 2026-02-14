// app/(guest)/rentals/search/page.tsx
// SERVER-SIDE RENDERED for SEO - Google can see all car listings
import { Suspense } from 'react'
import { Metadata } from 'next'
import Image from 'next/image'
import { IoCarOutline, IoLocationOutline, IoStarOutline, IoChevronForwardOutline } from 'react-icons/io5'
import prisma from '@/app/lib/database/prisma'
import { calculateDistance, getBoundingBox } from '@/lib/utils/distance'
import { getLocationByName, ALL_ARIZONA_LOCATIONS } from '@/lib/data/arizona-locations'
import { format, addDays } from 'date-fns'
import SearchResultsClient from './SearchResultsClient'
import Footer from '@/app/components/Footer'
import { capitalizeCarMake, normalizeModelName } from '@/app/lib/utils/formatters'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { getAlternateLanguages, getCanonicalUrl, getOgLocale } from '@/app/lib/seo/alternates'

// Dynamic metadata based on search params
export async function generateMetadata({ params: localeParams, searchParams }: { params: Promise<{ locale: string }>, searchParams: Promise<{ [key: string]: string | undefined }> }): Promise<Metadata> {
  const { locale } = await localeParams
  const t = await getTranslations('SeoMeta')
  const params = await searchParams
  const location = params.location || 'Phoenix, AZ'
  const cityName = location.split(',')[0].trim()

  return {
    title: t('searchTitle', { city: cityName }),
    description: t('searchDescription', { city: cityName }),
    keywords: `${cityName} car rental, rent a car ${cityName}, peer to peer car rental, local car rental ${cityName}, cheap car rental Arizona, airport car rental ${cityName}`,
    openGraph: {
      title: t('searchOgTitle', { city: cityName }),
      description: t('searchOgDescription', { city: cityName }),
      type: 'website',
      locale: getOgLocale(locale),
      siteName: 'ItWhip Rentals',
    },
    alternates: {
      canonical: getCanonicalUrl(`/rentals/search?location=${encodeURIComponent(location)}`, locale),
      languages: getAlternateLanguages('/rentals/search'),
    }
  }
}

// Server-side data fetching
async function getInitialCars(location: string, pickupDate: string, returnDate: string, carType?: string | null, sortBy: string = 'recommended') {
  const DEFAULT_RADIUS_MILES = 25

  // Determine search coordinates
  let searchCoordinates: { latitude: number; longitude: number } | null = null
  const locationData = getLocationByName(location)

  if (locationData) {
    searchCoordinates = {
      latitude: locationData.latitude,
      longitude: locationData.longitude
    }
  } else {
    const cityName = location.split(',')[0].trim()
    const matchedLocation = ALL_ARIZONA_LOCATIONS.find(
      loc => loc.city.toLowerCase() === cityName.toLowerCase()
    )

    if (matchedLocation) {
      searchCoordinates = {
        latitude: matchedLocation.latitude,
        longitude: matchedLocation.longitude
      }
    } else {
      searchCoordinates = {
        latitude: 33.4484,
        longitude: -112.0740
      }
    }
  }

  // Build query with bounding box
  const boundingBox = getBoundingBox(searchCoordinates, DEFAULT_RADIUS_MILES)

  // Build carType filter - special handling for electric, luxury, sports
  const luxuryMakes = ['Mercedes-Benz', 'BMW', 'Audi', 'Porsche', 'Lexus', 'Cadillac', 'Bentley', 'Rolls-Royce', 'Maserati', 'Jaguar', 'Land Rover', 'Range Rover', 'Infiniti', 'Acura', 'Genesis', 'Lincoln']
  const sportsMakes = ['Porsche', 'Ferrari', 'Lamborghini', 'McLaren', 'Aston Martin', 'Lotus', 'Corvette']

  let carTypeFilter: any = {}
  if (carType && carType !== 'all') {
    if (carType.toLowerCase() === 'electric') {
      carTypeFilter = {
        OR: [
          { carType: { equals: 'ELECTRIC', mode: 'insensitive' as const } },
          { fuelType: { in: ['electric', 'ELECTRIC', 'Electric'] } }
        ]
      }
    } else if (carType.toLowerCase() === 'luxury') {
      carTypeFilter = {
        OR: luxuryMakes.map(make => ({ make: { equals: make, mode: 'insensitive' as const } }))
      }
    } else if (carType.toLowerCase() === 'sports') {
      carTypeFilter = {
        OR: [
          { carType: { equals: 'SPORTS', mode: 'insensitive' as const } },
          { carType: { equals: 'COUPE', mode: 'insensitive' as const } },
          { carType: { equals: 'EXOTIC', mode: 'insensitive' as const } },
          ...sportsMakes.map(make => ({ make: { equals: make, mode: 'insensitive' as const } }))
        ]
      }
    } else {
      carTypeFilter = { carType: { equals: carType.toUpperCase(), mode: 'insensitive' as const } }
    }
  }

  const cars = await prisma.rentalCar.findMany({
    where: {
      isActive: true,
      // CRITICAL: Only show cars from APPROVED hosts
      host: {
        approvalStatus: 'APPROVED'
      },
      AND: [
        { latitude: { gte: boundingBox.minLat, lte: boundingBox.maxLat } },
        { longitude: { gte: boundingBox.minLng, lte: boundingBox.maxLng } }
      ],
      ...carTypeFilter
    },
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      carType: true,
      transmission: true,
      seats: true,
      dailyRate: true,
      weeklyRate: true,
      monthlyRate: true,
      features: true,
      instantBook: true,
      fuelType: true,
      esgScore: true,
      city: true,
      state: true,
      latitude: true,
      longitude: true,
      airportPickup: true,
      hotelDelivery: true,
      homeDelivery: true,
      rating: true,
      totalTrips: true,
      host: {
        select: {
          name: true,
          profilePhoto: true,
          isVerified: true,
          responseRate: true,
          responseTime: true
        }
      },
      photos: {
        select: {
          url: true,
          caption: true,
          order: true
        },
        orderBy: { order: 'asc' },
        take: 5
      },
      _count: {
        select: {
          bookings: {
            where: {
              status: { in: ['COMPLETED', 'ACTIVE'] }
            }
          },
          reviews: {
            where: { isVisible: true }
          }
        }
      }
    },
    take: 50 // Limit for initial load
  })

  // Process and filter by actual distance
  const processedCars = cars
    .map(car => {
      if (!car.latitude || !car.longitude || !searchCoordinates) return null

      const distance = calculateDistance(
        searchCoordinates,
        { latitude: car.latitude, longitude: car.longitude }
      )

      if (distance > DEFAULT_RADIUS_MILES) return null

      // Parse features
      let parsedFeatures: string[] = []
      try {
        if (typeof car.features === 'string') {
          parsedFeatures = JSON.parse(car.features)
        } else if (Array.isArray(car.features)) {
          parsedFeatures = car.features as string[]
        }
      } catch {
        parsedFeatures = []
      }

      const actualTripCount = car.totalTrips ?? car._count.bookings ?? 0

      return {
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        type: car.carType,
        transmission: car.transmission,
        seats: car.seats,
        dailyRate: Number(car.dailyRate),
        weeklyRate: car.weeklyRate ? Number(car.weeklyRate) : null,
        monthlyRate: car.monthlyRate ? Number(car.monthlyRate) : null,
        features: parsedFeatures.slice(0, 5),
        instantBook: car.instantBook,
        fuelType: car.fuelType,
        esgScore: car.esgScore,
        location: {
          city: car.city,
          state: car.state,
          lat: car.latitude,
          lng: car.longitude,
          distance: parseFloat(distance.toFixed(1)),
          airport: car.airportPickup,
          hotelDelivery: car.hotelDelivery,
          homeDelivery: car.homeDelivery
        },
        host: {
          name: car.host.name,
          avatar: car.host.profilePhoto || '/default-avatar.svg',
          verified: car.host.isVerified,
          responseRate: car.host.responseRate || 95,
          responseTime: car.host.responseTime || 60,
          totalTrips: actualTripCount
        },
        photos: car.photos.map((photo: any) => ({
          url: photo.url,
          alt: photo.caption || `${capitalizeCarMake(car.make)} ${normalizeModelName(car.model, car.make)}`
        })),
        rating: {
          average: car.rating ? parseFloat(Number(car.rating).toFixed(1)) : 5.0,
          count: car._count.reviews
        },
        trips: actualTripCount,
        totalTrips: actualTripCount
      }
    })
    .filter(Boolean)
    .sort((a, b) => {
      // Apply sorting based on sortBy parameter
      switch (sortBy) {
        case 'price_low':
          return (a!.dailyRate || 0) - (b!.dailyRate || 0)
        case 'price_high':
          return (b!.dailyRate || 0) - (a!.dailyRate || 0)
        case 'rating':
          return (b!.rating.average || 0) - (a!.rating.average || 0)
        case 'distance':
          return (a!.location?.distance || 0) - (b!.location?.distance || 0)
        case 'recommended':
        default:
          // Sort by rating then trips
          const ratingDiff = (b!.rating.average || 0) - (a!.rating.average || 0)
          if (Math.abs(ratingDiff) > 0.5) return ratingDiff
          return (b!.trips || 0) - (a!.trips || 0)
      }
    })

  // Calculate price range
  const prices = processedCars.map(c => c!.dailyRate).filter(p => p > 0)
  const minPrice = prices.length > 0 ? Math.min(...prices) : 59
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 499

  // Extract searched city name for grouping
  const searchedCity = location.split(',')[0].trim()

  // Separate cars by city
  const carsInCity = processedCars.filter(car =>
    car!.location?.city?.toLowerCase() === searchedCity.toLowerCase()
  )
  const nearbyCars = processedCars.filter(car =>
    car!.location?.city?.toLowerCase() !== searchedCity.toLowerCase()
  )

  // If carType filter returned 0 results, fetch all cars and set noResultsForType flag
  let noResultsForType: string | null = null
  let finalProcessedCars = processedCars
  let finalCarsInCity = carsInCity
  let finalNearbyCars = nearbyCars

  if (carType && processedCars.length === 0) {
    noResultsForType = carType
    // Fetch all cars without the carType filter
    const allCarsResult = await getInitialCars(location, pickupDate, returnDate, null)
    finalProcessedCars = allCarsResult.cars
    finalCarsInCity = allCarsResult.carsInCity
    finalNearbyCars = allCarsResult.nearbyCars
  }

  // Recalculate price range with final cars
  const finalPrices = finalProcessedCars.map(c => c!.dailyRate).filter(p => p > 0)
  const finalMinPrice = finalPrices.length > 0 ? Math.min(...finalPrices) : 59
  const finalMaxPrice = finalPrices.length > 0 ? Math.max(...finalPrices) : 499

  return {
    cars: finalProcessedCars,
    carsInCity: finalCarsInCity,
    nearbyCars: finalNearbyCars,
    searchedCity,
    total: finalProcessedCars.length,
    searchCoordinates,
    priceRange: { min: finalMinPrice, max: finalMaxPrice },
    noResultsForType,
    metadata: {
      totalResults: finalProcessedCars.length,
      inCityCount: finalCarsInCity.length,
      nearbyCount: finalNearbyCars.length,
      fullyAvailable: finalProcessedCars.length,
      partiallyAvailable: 0,
      unavailable: 0,
      searchCoordinates
    }
  }
}

// JSON-LD Structured Data Components
function ItemListSchema({ cars, location }: { cars: any[], location: string }) {
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Car Rentals in ${location}`,
    description: `Browse ${cars.length} cars available for rent from local owners in ${location}`,
    numberOfItems: cars.length,
    itemListElement: cars.slice(0, 20).map((car, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Car',
        name: `${car.year} ${capitalizeCarMake(car.make)} ${normalizeModelName(car.model, car.make)}`,
        vehicleConfiguration: car.type,
        numberOfDoors: 4,
        vehicleSeatingCapacity: car.seats,
        fuelType: car.fuelType || 'Gasoline',
        image: car.photos?.[0]?.url,
        offers: {
          '@type': 'Offer',
          price: car.dailyRate,
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: car.dailyRate,
            priceCurrency: 'USD',
            unitText: 'DAY'
          },
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'Person',
            name: car.host?.name || 'Local Owner'
          }
        },
        aggregateRating: car.rating?.count > 0 ? {
          '@type': 'AggregateRating',
          ratingValue: car.rating.average,
          reviewCount: car.rating.count,
          bestRating: 5,
          worstRating: 1
        } : undefined
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
    />
  )
}

async function FAQSchema() {
  const t = await getTranslations('SearchResults')

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: t('costToRent'),
        acceptedAnswer: {
          '@type': 'Answer',
          text: t('costToRentAnswer')
        }
      },
      {
        '@type': 'Question',
        name: t('airportDelivery'),
        acceptedAnswer: {
          '@type': 'Answer',
          text: t('airportDeliveryAnswer')
        }
      },
      {
        '@type': 'Question',
        name: t('insuranceIncluded'),
        acceptedAnswer: {
          '@type': 'Answer',
          text: t('insuranceIncludedAnswer')
        }
      },
      {
        '@type': 'Question',
        name: t('minimumAge'),
        acceptedAnswer: {
          '@type': 'Answer',
          text: t('minimumAgeAnswer')
        }
      },
      {
        '@type': 'Question',
        name: t('instantBooking'),
        acceptedAnswer: {
          '@type': 'Answer',
          text: t('instantBookingAnswer')
        }
      }
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  )
}

function LocalBusinessSchema({ location }: { location: string }) {
  const businessSchema = {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    name: 'ItWhip Car Rentals',
    description: `Peer-to-peer car rental marketplace in ${location}. Rent cars directly from local owners at competitive prices.`,
    url: 'https://itwhip.com',
    telephone: '+1-480-555-0123',
    address: {
      '@type': 'PostalAddress',
      addressLocality: location.split(',')[0].trim(),
      addressRegion: 'AZ',
      addressCountry: 'US'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 33.4484,
      longitude: -112.0740
    },
    areaServed: {
      '@type': 'State',
      name: 'Arizona'
    },
    priceRange: '$59 - $499/day',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59'
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
    />
  )
}

// SSR Car Card for static HTML (visible to Google)
async function SSRCarCard({ car }: { car: any }) {
  const t = await getTranslations('SearchResults')

  return (
    <Link
      href={`/rentals/cars/${car.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="relative h-32 sm:h-36 bg-gray-100">
        {car.photos?.[0]?.url ? (
          <Image
            src={car.photos[0].url}
            alt={`${car.year} ${capitalizeCarMake(car.make)} ${normalizeModelName(car.model, car.make)} for rent in ${car.location?.city || 'Phoenix'}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <IoCarOutline className="w-12 h-12 text-gray-400" />
          </div>
        )}
        {car.instantBook && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
            {t('instantBadge')}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
          {car.year} {capitalizeCarMake(car.make)} {normalizeModelName(car.model, car.make)}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
          <IoLocationOutline className="w-3 h-3 mr-1" />
          {car.location?.city || 'Phoenix'}, AZ
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-amber-600 font-bold">${car.dailyRate}/day</span>
          {car.rating?.average > 0 && (
            <span className="flex items-center text-xs text-gray-600">
              <IoStarOutline className="w-3 h-3 mr-0.5 text-yellow-500" />
              {car.rating.average.toFixed(1)}
              {car.trips > 0 && <span className="ml-1">({car.trips})</span>}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

// SEO Content Sections - Matching cities/[city] page typography
async function SEOContent({ location, priceRange }: { location: string; priceRange: { min: number; max: number } }) {
  const t = await getTranslations('SearchResults')
  const cityName = location.split(',')[0].trim()

  const popularAreas = [
    { name: 'Phoenix', slug: 'Phoenix, AZ' },
    { name: 'Scottsdale', slug: 'Scottsdale, AZ' },
    { name: 'Tempe', slug: 'Tempe, AZ' },
    { name: 'Mesa', slug: 'Mesa, AZ' },
    { name: 'Chandler', slug: 'Chandler, AZ' },
    { name: 'Gilbert', slug: 'Gilbert, AZ' }
  ]

  const vehicleTypes = [
    { name: 'SUVs', slug: 'suv' },
    { name: 'Luxury', slug: 'luxury' },
    { name: 'Electric', slug: 'electric' },
    { name: 'Convertibles', slug: 'convertible' },
    { name: 'Trucks', slug: 'truck' },
    { name: 'Economy', slug: 'sedan' }
  ]

  return (
    <section className="bg-white dark:bg-gray-800 py-8 sm:py-12 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Heading & Intro */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Car Rentals in {cityName}, AZ
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
            Browse available cars from local owners. Vehicles from ${priceRange.min}/day with airport delivery and instant booking.
            <Link href="/rentals" className="text-amber-600 hover:underline ml-1">{t('browseAllRentals')}</Link>
          </p>
        </div>

        {/* Popular Areas & Vehicle Types Grid */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-8">
          {/* Popular Areas */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <IoLocationOutline className="w-5 h-5 text-amber-600" />
              {t('popularAreas')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularAreas.map(area => (
                <Link
                  key={area.name}
                  href={`/rentals/search?location=${encodeURIComponent(area.slug)}`}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                >
                  {area.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Vehicle Types */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <IoCarOutline className="w-5 h-5 text-amber-600" />
              {t('vehicleTypes')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {vehicleTypes.map(type => (
                <Link
                  key={type.name}
                  href={`/rentals/search?location=${encodeURIComponent(location)}&carType=${type.slug}`}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                >
                  {type.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-8">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">{t('frequentlyAskedQuestions')}</h3>
          <div className="space-y-2 max-w-2xl">
            <details className="group bg-gray-50 dark:bg-gray-700 rounded-lg">
              <summary className="flex items-center justify-between p-3 sm:p-4 cursor-pointer text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                {t('costQuestion')}
                <IoChevronForwardOutline className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
              </summary>
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Rentals start at ${priceRange.min}/day for economy cars. <Link href={`/rentals/search?location=${encodeURIComponent(location)}&sortBy=price_low`} className="text-amber-600 hover:underline">View cheapest options →</Link>
              </div>
            </details>

            <details className="group bg-gray-50 dark:bg-gray-700 rounded-lg">
              <summary className="flex items-center justify-between p-3 sm:p-4 cursor-pointer text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                {t('airportQuestion')}
                <IoChevronForwardOutline className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
              </summary>
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t('airportAnswer')} <Link href={`/rentals/search?location=${encodeURIComponent(location)}&delivery=airport`} className="text-amber-600 hover:underline">{t('filterByAirportPickup')}</Link>
              </div>
            </details>

            <details className="group bg-gray-50 dark:bg-gray-700 rounded-lg">
              <summary className="flex items-center justify-between p-3 sm:p-4 cursor-pointer text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                {t('insuranceQuestion')}
                <IoChevronForwardOutline className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
              </summary>
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t('insuranceAnswer')} <Link href="/insurance" className="text-amber-600 hover:underline">{t('learnAboutCoverage')}</Link>
              </div>
            </details>
          </div>
        </div>

        {/* Why Rent */}
        <div className="max-w-2xl">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">{t('whyRentFromLocalOwners')}</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            {t('whyRentDescription')} <Link href="/how-it-works" className="text-amber-600 hover:underline">{t('learnHowItWorks')}</Link>
          </p>
        </div>
      </div>
    </section>
  )
}

// Loading fallback
async function SearchLoadingFallback() {
  const t = await getTranslations('SearchResults')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <IoCarOutline className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-pulse" />
        <p className="text-gray-600 dark:text-gray-400">{t('loadingCars')}</p>
      </div>
    </div>
  )
}

// Main Page Component (Server-Side Rendered)
export default async function SearchResultsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams

  // Parse search params with defaults
  const location = params.location || 'Phoenix, AZ'
  const pickupDate = params.pickupDate || format(new Date(), 'yyyy-MM-dd')
  const returnDate = params.returnDate || format(addDays(new Date(), 3), 'yyyy-MM-dd')
  const pickupTime = params.pickupTime || '10:00'
  const returnTime = params.returnTime || '10:00'
  const carType = params.carType || null
  const sortBy = params.sortBy || 'recommended'

  const cityName = location.split(',')[0].trim()

  // Fetch initial cars on the server (with optional carType filter and sorting)
  const { cars, carsInCity, nearbyCars, searchedCity, total, metadata, priceRange, noResultsForType } = await getInitialCars(location, pickupDate, returnDate, carType, sortBy)

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <ItemListSchema cars={cars as any[]} location={location} />
      <FAQSchema />
      <LocalBusinessSchema location={location} />

      {/* SEO-Visible Header (in static HTML) */}
      <div className="sr-only">
        <h1>Car Rentals in {cityName}, AZ from Local Owners</h1>
        <p>
          Browse {total} cars available for rent starting at ${priceRange.min}/day.
          {cityName} peer-to-peer car rentals with airport delivery, instant booking, and full insurance.
        </p>
      </div>

      {/* SSR Car Listings (visible to Google in HTML source) */}
      <noscript>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Car Rentals in {cityName}, AZ</h1>
          <p className="mb-4">{total} cars available from ${priceRange.min}/day to ${priceRange.max}/day</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(cars as any[]).slice(0, 20).map((car: any) => (
              <SSRCarCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      </noscript>

      {/* Hidden but crawlable car data for SEO */}
      <div className="hidden" aria-hidden="true">
        <ul>
          {(cars as any[]).slice(0, 30).map((car: any) => (
            <li key={car.id}>
              <a href={`/rentals/cars/${car.id}`}>
                {car.year} {capitalizeCarMake(car.make)} {normalizeModelName(car.model, car.make)} - ${car.dailyRate}/day in {car.location?.city || 'Phoenix'}, AZ
                {car.rating?.average > 0 && ` - ${car.rating.average} stars (${car.trips} trips)`}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Interactive Client Component */}
      <Suspense fallback={<SearchLoadingFallback />}>
        <SearchResultsClient
          key={`${location}-${pickupDate}-${returnDate}-${carType || 'all'}-${sortBy}`}
          initialCars={cars as any[]}
          initialCarsInCity={carsInCity as any[]}
          initialNearbyCars={nearbyCars as any[]}
          initialSearchedCity={searchedCity}
          initialTotal={total}
          initialMetadata={metadata}
          initialLocation={location}
          initialPickupDate={pickupDate}
          initialReturnDate={returnDate}
          initialPickupTime={pickupTime}
          initialReturnTime={returnTime}
          initialCarType={carType}
          initialSortBy={sortBy}
          noResultsForType={noResultsForType}
        />
      </Suspense>

      {/* SEO Content Sections (always visible, server-rendered) */}
      <SEOContent
        location={location}
        priceRange={priceRange}
      />

      <Footer />
    </>
  )
}
