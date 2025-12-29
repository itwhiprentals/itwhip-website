// app/(guest)/rentals/near-me/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import prisma from '@/app/lib/database/prisma'
import { CITY_SEO_DATA } from '@/app/lib/data/city-seo-data'
import { AIRPORT_DATA } from '@/app/lib/data/airports'
import { LocationAwareTitle, DynamicPageTitle } from '@/app/components/LocationAwareContent'
import {
  IoLocationOutline,
  IoCarOutline,
  IoNavigateOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoShieldCheckmarkOutline,
  IoCashOutline,
  IoFlashOutline,
  IoAirplaneOutline,
  IoBusinessOutline,
  IoMapOutline
} from 'react-icons/io5'

// ISR - Revalidate every 60 seconds
export const revalidate = 60

// ============================================
// METADATA
// ============================================
export const metadata: Metadata = {
  title: 'Car Rentals Near Me | Phoenix & Arizona | ItWhip',
  description: 'Find rental cars near your location in Phoenix, Scottsdale, Tempe, Mesa, and across Arizona. Peer-to-peer car rentals with delivery. From $45/day with $1M insurance.',
  keywords: [
    'car rental near me',
    'car rental phoenix',
    'rent a car near me',
    'cheap car rental near me',
    'car rental arizona',
    'car rental scottsdale',
    'car rental tempe',
    'car rental mesa',
    'peer to peer car rental',
    'turo alternative phoenix'
  ],
  openGraph: {
    title: 'Car Rentals Near Me | Phoenix & Arizona | ItWhip',
    description: 'Find the perfect rental car near your location in Arizona. Browse peer-to-peer car rentals with instant booking and free delivery.',
    url: 'https://itwhip.com/rentals/near-me',
    images: [{
      url: 'https://itwhip.com/og/near-me.png',
      width: 1200,
      height: 630,
      alt: 'Car rentals near me in Arizona'
    }],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Car Rentals Near Me | Arizona',
    description: 'Find rental cars near you in Phoenix, Scottsdale, and across Arizona.',
    images: ['https://itwhip.com/og/near-me.png']
  },
  alternates: {
    canonical: 'https://itwhip.com/rentals/near-me',
  },
}

// ============================================
// HELPER FUNCTION
// ============================================
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

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default async function NearMePage() {
  // Fetch all active cars
  const allCars = await prisma.rentalCar.findMany({
    where: { isActive: true },
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      carType: true,
      seats: true,
      dailyRate: true,
      city: true,
      rating: true,
      totalTrips: true,
      instantBook: true,
      airportPickup: true,
      homeDelivery: true,
      hotelDelivery: true,
      photos: {
        select: { url: true },
        orderBy: { order: 'asc' },
        take: 1
      },
      host: {
        select: { name: true, profilePhoto: true }
      }
    },
    orderBy: [
      { instantBook: 'desc' },
      { rating: 'desc' }
    ]
  })

  const totalCars = allCars.length
  const minPrice = allCars.length > 0 ? Math.min(...allCars.map(c => Number(c.dailyRate))) : 45
  const maxPrice = allCars.length > 0 ? Math.max(...allCars.map(c => Number(c.dailyRate))) : 999

  // Group cars by city
  const carsByCity = allCars.reduce((acc, car) => {
    const city = car.city || 'Phoenix'
    if (!acc[city]) acc[city] = []
    acc[city].push(car)
    return acc
  }, {} as Record<string, typeof allCars>)

  // Get top cities by car count
  const topCities = Object.entries(carsByCity)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 6)

  // Cars with delivery
  const carsWithDelivery = allCars.filter(car => car.homeDelivery || car.hotelDelivery || car.airportPickup)

  // Popular city data from SEO
  const popularCities = Object.entries(CITY_SEO_DATA).slice(0, 12)

  // Airports
  const airports = Object.entries(AIRPORT_DATA)

  // Calculate priceValidUntil for structured data
  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': 'https://itwhip.com/rentals/near-me#business',
        name: 'ItWhip Car Rentals - Arizona',
        description: 'Peer-to-peer car rentals in Phoenix, Scottsdale, and across Arizona. Rent from local owners with $1M insurance included.',
        url: 'https://itwhip.com/rentals/near-me',
        telephone: '+1-480-555-0100',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Phoenix',
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
        priceRange: `$${minPrice}-$${maxPrice}/day`,
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '00:00',
          closes: '23:59'
        }
      },
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://itwhip.com/rentals/near-me#breadcrumb',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://itwhip.com' },
          { '@type': 'ListItem', position: 2, name: 'Rentals', item: 'https://itwhip.com/rentals' },
          { '@type': 'ListItem', position: 3, name: 'Near Me', item: 'https://itwhip.com/rentals/near-me' }
        ]
      },
      {
        '@type': 'ItemList',
        '@id': 'https://itwhip.com/rentals/near-me#carlist',
        name: 'Car Rentals Near Me in Arizona',
        numberOfItems: totalCars,
        itemListElement: allCars.slice(0, 10).map((car, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: `${car.year} ${car.make} ${car.model}`,
            url: `https://itwhip.com/rentals/${car.id}`,
            description: `Rent this ${car.year} ${car.make} ${car.model} in ${car.city}, AZ`,
            image: car.photos?.[0]?.url || 'https://itwhip.com/images/placeholder-car.jpg',
            ...(car.rating && car.totalTrips > 0 ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: car.rating,
                reviewCount: car.totalTrips,
                bestRating: 5,
                worstRating: 1
              }
            } : {}),
            offers: {
              '@type': 'Offer',
              price: car.dailyRate,
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              priceValidUntil,
              hasMerchantReturnPolicy: {
                '@type': 'MerchantReturnPolicy',
                applicableCountry: 'US',
                returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                merchantReturnDays: 3,
                returnMethod: 'https://schema.org/ReturnAtKiosk',
                returnFees: 'https://schema.org/FreeReturn'
              },
              shippingDetails: {
                '@type': 'OfferShippingDetails',
                shippingDestination: {
                  '@type': 'DefinedRegion',
                  addressCountry: 'US',
                  addressRegion: 'AZ'
                },
                deliveryTime: {
                  '@type': 'ShippingDeliveryTime',
                  handlingTime: {
                    '@type': 'QuantitativeValue',
                    minValue: 0,
                    maxValue: 1,
                    unitCode: 'd'
                  },
                  transitTime: {
                    '@type': 'QuantitativeValue',
                    minValue: 0,
                    maxValue: 1,
                    unitCode: 'd'
                  }
                },
                shippingRate: {
                  '@type': 'MonetaryAmount',
                  value: 0,
                  currency: 'USD'
                }
              }
            }
          }
        }))
      }
    ]
  }

  return (
    <>
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <DynamicPageTitle template="Car Rentals Near Me in {city}, AZ | ItWhip" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        {/* Hero Section */}
        <section className="relative h-[280px] sm:h-[320px] lg:h-[380px] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/images/hero/arizona-hero.jpg)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-xs font-medium mb-3">
                <IoLocationOutline className="w-3.5 h-3.5" />
                Phoenix Metro & Arizona
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
                <LocationAwareTitle
                  prefix="Car Rentals Near Me in "
                  suffix=", AZ"
                  fallbackCity="Phoenix"
                  as="span"
                />
              </h1>

              <p className="text-sm sm:text-base text-white/80 mb-4 max-w-xl">
                Find rental cars near your location across Phoenix, Scottsdale, Tempe, and all of Arizona. Delivery available to your door.
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/90 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5">
                  <IoCarOutline className="w-4 h-4 text-amber-400" />
                  <span><strong>{totalCars}</strong> cars available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <IoCashOutline className="w-4 h-4 text-emerald-400" />
                  <span>From <strong>${minPrice}</strong>/day</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <IoShieldCheckmarkOutline className="w-4 h-4 text-blue-400" />
                  <span><strong>$1M</strong> insurance</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <IoNavigateOutline className="w-4 h-4 text-purple-400" />
                  <span>Free delivery</span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/rentals/search"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  <IoCarOutline className="w-4 h-4" />
                  Browse All Cars
                </Link>
                <a
                  href="#browse-by-city"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors text-sm backdrop-blur-sm"
                >
                  <IoMapOutline className="w-4 h-4" />
                  Browse by City
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
              <li className="flex items-center gap-1.5">
                <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1">
                  <IoHomeOutline className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="flex items-center gap-1.5">
                <Link href="/rentals" className="hover:text-amber-600 dark:hover:text-amber-400">
                  Rentals
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-gray-800 dark:text-gray-200 font-medium">
                Near Me
              </li>
            </ol>
          </nav>
        </div>

        {/* Cars with Delivery */}
        {carsWithDelivery.length > 0 && (
          <section className="py-4 sm:py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Cars with Delivery
                </h2>
                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full">
                  {carsWithDelivery.length} available
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                These cars can be delivered to your home, hotel, or the airport
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {carsWithDelivery.slice(0, 10).map((car) => (
                  <CompactCarCard key={car.id} car={transformCarForCompactCard(car)} accentColor="emerald" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Top Cities */}
        {topCities.length > 0 && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700" />
            {topCities.map(([city, cars], index) => (
              <section key={city} className="py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        Cars in {city}
                      </h2>
                      <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full">
                        {cars.length} cars
                      </span>
                    </div>
                    <Link
                      href={`/rentals/cities/${city.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                    >
                      View all <IoChevronForwardOutline className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {cars.slice(0, 5).map((car) => (
                      <CompactCarCard key={car.id} car={transformCarForCompactCard(car)} />
                    ))}
                  </div>
                </div>
                {index < topCities.length - 1 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 mt-6" />
                )}
              </section>
            ))}
          </>
        )}

        {/* Browse by City */}
        <section id="browse-by-city" className="py-6 sm:py-8 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <IoBusinessOutline className="w-5 h-5 text-amber-600" />
              Browse Cars by City
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {popularCities.map(([slug, data]) => (
                <Link
                  key={slug}
                  href={`/rentals/cities/${slug}`}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors group border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <IoLocationOutline className="w-4 h-4 text-amber-600" />
                    <span className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-amber-600">
                      {data.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                    {data.airport || 'Car rentals available'}
                  </p>
                </Link>
              ))}
            </div>
            <div className="mt-4">
              <Link
                href="/rentals/cities"
                className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                View all Arizona cities
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Airports Section */}
        <section className="py-6 sm:py-8 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <IoAirplaneOutline className="w-5 h-5 text-amber-600" />
              Airport Car Rentals
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {airports.map(([slug, data]) => (
                <Link
                  key={slug}
                  href={`/rentals/airports/${slug}`}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow group border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <IoAirplaneOutline className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors">
                        {data.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {data.code} - {data.fullName}
                      </p>
                      <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                        Curbside pickup available
                        <IoChevronForwardOutline className="w-3 h-3" />
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why ItWhip Section */}
        <section className="py-6 sm:py-8 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              Why Rent with ItWhip?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IoCashOutline className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">Save up to 35%</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">vs. traditional rental companies</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IoShieldCheckmarkOutline className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">$1M Insurance</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Included with every rental</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IoFlashOutline className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">Instant Booking</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Book in minutes, not hours</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IoNavigateOutline className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">Free Delivery</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">To your door or airport</p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
