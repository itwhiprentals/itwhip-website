// app/(guest)/rentals/tesla-near-me/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import prisma from '@/app/lib/database/prisma'
import {
  LocationAwareTitle,
  LocationAwareText,
  DynamicPageTitle,
  LocationIndicator
} from '@/app/components/LocationAwareContent'
import {
  IoFlashOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoShieldCheckmarkOutline,
  IoLeafOutline,
  IoBatteryChargingOutline,
  IoSpeedometerOutline,
  IoCarSportOutline
} from 'react-icons/io5'

export const revalidate = 60

// Static metadata (SEO fallback) - will be enhanced client-side
export const metadata: Metadata = {
  title: 'Tesla Rentals Near Me | Model 3, Model Y, Model S | ItWhip',
  description: 'Rent Tesla electric vehicles near you in Phoenix, Scottsdale, and Arizona. Model 3, Model Y, Model S, and Model X from local owners. Zero emissions, instant torque.',
  keywords: [
    'tesla rental near me',
    'tesla rental phoenix',
    'rent tesla scottsdale',
    'model 3 rental arizona',
    'model y rental phoenix',
    'electric car rental near me',
    'ev rental phoenix',
    'tesla model s rental'
  ],
  openGraph: {
    title: 'Tesla Rentals Near Me | Phoenix & Arizona',
    description: 'Experience electric driving. Rent Tesla Model 3, Y, S, or X from local owners in Arizona.',
    url: 'https://itwhip.com/rentals/tesla-near-me',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/rentals/tesla-near-me',
  },
}

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

// Tesla model categories
const TESLA_MODELS = {
  'Model 3': { range: '272-358 mi', acceleration: '3.1-5.8s 0-60', type: 'Sedan' },
  'Model Y': { range: '260-330 mi', acceleration: '3.5-5.0s 0-60', type: 'SUV' },
  'Model S': { range: '320-405 mi', acceleration: '1.99-3.1s 0-60', type: 'Luxury Sedan' },
  'Model X': { range: '269-348 mi', acceleration: '2.5-3.8s 0-60', type: 'Luxury SUV' },
  'Cybertruck': { range: '250-340 mi', acceleration: '2.6-6.5s 0-60', type: 'Truck' }
}

export default async function TeslaNearMePage() {
  // Fetch all Tesla vehicles
  const teslaCars = await prisma.rentalCar.findMany({
    where: {
      isActive: true,
      make: 'Tesla'
    },
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

  const totalCars = teslaCars.length
  const minPrice = teslaCars.length > 0 ? Math.min(...teslaCars.map(c => Number(c.dailyRate))) : 89
  const avgPrice = teslaCars.length > 0
    ? Math.round(teslaCars.reduce((sum, c) => sum + Number(c.dailyRate), 0) / teslaCars.length)
    : 120

  // Group by model
  const carsByModel = teslaCars.reduce((acc, car) => {
    const model = car.model
    if (!acc[model]) acc[model] = []
    acc[model].push(car)
    return acc
  }, {} as Record<string, typeof teslaCars>)

  // Get available cities (for testimonials/content)
  const availableCities = [...new Set(teslaCars.map(c => c.city).filter(Boolean))]
  const topCities = availableCities.slice(0, 6)

  const availableModels = Object.entries(carsByModel)
    .sort((a, b) => b[1].length - a[1].length)

  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        name: 'Tesla Rentals Near Me in Arizona',
        numberOfItems: totalCars,
        itemListElement: teslaCars.slice(0, 10).map((car, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: `${car.year} ${car.make} ${car.model}`,
            url: `https://itwhip.com/rentals/${car.id}`,
            description: `Tesla ${car.model} electric vehicle rental in ${car.city}`,
            image: car.photos?.[0]?.url || 'https://itwhip.com/Electric-Car.png',
            brand: { '@type': 'Brand', name: 'Tesla' },
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
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How much does it cost to rent a Tesla in Arizona?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Tesla rentals in Arizona start from $${minPrice}/day for Model 3. Average prices are around $${avgPrice}/day. Model S and Model X typically range $150-250/day.`
            }
          },
          {
            '@type': 'Question',
            name: 'Do Tesla rentals include charging?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Most Tesla rentals on ItWhip include access to the Tesla Supercharger network. Some hosts include charging credits, while others ask you to return with the same charge level. Check each listing for details.'
            }
          },
          {
            '@type': 'Question',
            name: 'Where can I charge a rental Tesla in Phoenix?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Phoenix has 50+ Tesla Supercharger stations and hundreds of destination chargers. Major locations include Scottsdale Fashion Square, Tempe Marketplace, Desert Ridge, and most Whole Foods stores.'
            }
          }
        ]
      }
    ]
  }

  return (
    <>
      <Script
        id="tesla-near-me-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Dynamic title updater - client component */}
      <DynamicPageTitle
        template="Tesla Rentals Near Me in {city}, AZ | ItWhip"
        fallbackCity="Phoenix"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        {/* Hero */}
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 text-white pt-8 sm:pt-10 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/30 rounded-full text-red-300 text-xs font-medium mb-3">
                <IoFlashOutline className="w-4 h-4" />
                Electric Vehicles
              </div>

              {/* Dynamic H1 - updates based on user location */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-white">
                <LocationAwareTitle
                  prefix="Tesla Rentals Near Me in "
                  suffix=", AZ"
                  fallbackCity="Phoenix"
                  as="span"
                />
              </h1>

              {/* Dynamic description */}
              <p className="text-lg text-gray-300 mb-6">
                <LocationAwareText
                  template="Experience electric driving in {city}. Rent Tesla Model 3, Model Y, Model S, or Model X from local owners. Zero emissions, instant torque, Autopilot included."
                  fallbackCity="Phoenix"
                  as="span"
                />
              </p>

              {/* Location indicator */}
              <div className="mb-4">
                <LocationIndicator className="text-gray-400" />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <IoCarSportOutline className="w-5 h-5 text-red-400" />
                  <span><strong>{totalCars}</strong> Teslas available</span>
                </div>
                <div className="flex items-center gap-2">
                  <IoLeafOutline className="w-5 h-5 text-green-400" />
                  <span>Zero emissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <IoShieldCheckmarkOutline className="w-5 h-5 text-red-400" />
                  <span><strong>$1M</strong> insurance</span>
                </div>
              </div>

              <div className="inline-flex items-baseline gap-2 bg-white/10 backdrop-blur rounded-lg px-4 py-2 mb-6">
                <span className="text-white/70 text-sm">From</span>
                <span className="text-3xl font-bold">${minPrice}</span>
                <span className="text-white/70">/day</span>
              </div>

              <div className="block">
                <Link
                  href="/rentals/makes/tesla"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <IoFlashOutline className="w-5 h-5" />
                  Browse All Teslas
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-xs text-gray-500">
              <li className="flex items-center gap-1.5">
                <Link href="/" className="hover:text-red-600 flex items-center gap-1">
                  <IoHomeOutline className="w-3.5 h-3.5" />
                  Home
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="flex items-center gap-1.5">
                <Link href="/rentals" className="hover:text-red-600">Rentals</Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-gray-800 dark:text-gray-200 font-medium">
                Tesla Near Me
              </li>
            </ol>
          </nav>
        </div>

        {/* Featured Teslas */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              <LocationAwareText
                template="Tesla Rentals in {city}"
                fallbackCity="Phoenix"
                as="span"
              />
            </h2>
            {teslaCars.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {teslaCars.slice(0, 10).map((car) => (
                  <CompactCarCard key={car.id} car={transformCarForCompactCard(car)} accentColor="purple" />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <IoFlashOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No Tesla vehicles currently available</p>
                <p className="text-sm text-gray-400 mb-4">Check back soon or browse electric alternatives</p>
                <Link href="/rentals/types/electric" className="text-red-600 hover:text-red-700 font-medium">
                  Browse Electric Cars
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* By Model */}
        {availableModels.length > 0 && (
          <section className="py-8 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Browse by Model
              </h2>
              <div className="space-y-8">
                {availableModels.map(([model, cars]) => {
                  const modelInfo = TESLA_MODELS[model as keyof typeof TESLA_MODELS]
                  return (
                    <div key={model}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <IoFlashOutline className="w-5 h-5 text-red-500" />
                          Tesla {model}
                          <span className="text-sm font-normal text-gray-500">({cars.length} available)</span>
                        </h3>
                        {modelInfo && (
                          <span className="text-xs text-gray-500 hidden sm:block">
                            {modelInfo.range} range • {modelInfo.acceleration}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {cars.slice(0, 5).map((car) => (
                          <CompactCarCard key={car.id} car={transformCarForCompactCard(car)} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Tesla Benefits */}
        <section className="py-8 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold mb-6 text-center">
              Why Rent a Tesla?
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { icon: IoFlashOutline, title: 'Instant Torque', desc: '0-60 in as fast as 1.99 seconds' },
                { icon: IoLeafOutline, title: 'Zero Emissions', desc: 'Drive green, guilt-free' },
                { icon: IoBatteryChargingOutline, title: 'Supercharger Network', desc: '50+ stations in Arizona' },
                { icon: IoSpeedometerOutline, title: 'Autopilot', desc: 'Advanced driver assistance' }
              ].map((item, i) => (
                <div key={i} className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
                  <item.icon className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Available Cities */}
        {topCities.length > 0 && (
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Tesla Rentals by City
              </h2>
              <div className="flex flex-wrap gap-3">
                {topCities.map((city) => (
                  <Link
                    key={city}
                    href={`/rentals/cities/${city?.toLowerCase().replace(/\s+/g, '-')}`}
                    className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:border-red-500 transition-colors"
                  >
                    Tesla in {city}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Model Comparison */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Tesla Model Comparison
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(TESLA_MODELS).slice(0, 4).map(([model, specs]) => (
                <Link
                  key={model}
                  href={`/rentals/makes/tesla/${model.toLowerCase().replace(' ', '-')}`}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-red-500 transition-colors group"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600">
                    Tesla {model}
                  </h3>
                  <p className="text-sm text-gray-500">{specs.type}</p>
                  <p className="text-xs text-gray-400 mt-1">{specs.range}</p>
                  <p className="text-xs text-gray-400">{specs.acceleration}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Tesla Rental FAQ
            </h2>
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  How do I charge a rental Tesla?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use the Tesla app or the car&apos;s built-in navigation to find Superchargers. Phoenix has 50+ locations. Most hosts include Supercharger access - just plug in and go.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  What&apos;s included with Autopilot?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Basic Autopilot includes adaptive cruise control and lane-keep assist. Some vehicles have Full Self-Driving (FSD) beta - check individual listings for details.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Do I need a special license to drive a Tesla?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No special license needed - a regular driver&apos;s license works. We recommend watching a quick tutorial on regenerative braking if you&apos;re new to EVs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Related Pages */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              More Electric & Premium Options
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/rentals/types/electric" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                All Electric Cars
              </Link>
              <Link href="/rentals/near-me" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                All Cars Near Me
              </Link>
              <Link href="/rentals/luxury-near-me" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                Luxury Near Me
              </Link>
              <Link href="/rentals/types/suv" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                SUVs
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
