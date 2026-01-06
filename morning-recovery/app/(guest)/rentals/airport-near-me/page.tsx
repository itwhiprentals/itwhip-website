// app/(guest)/rentals/airport-near-me/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import prisma from '@/app/lib/database/prisma'
import { LocationAwareTitle, DynamicPageTitle } from '@/app/components/LocationAwareContent'
import {
  IoAirplaneOutline,
  IoCarOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoShieldCheckmarkOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoNavigateOutline
} from 'react-icons/io5'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Airport Car Rentals Near Me | Phoenix PHX, Mesa AZA | ItWhip',
  description: 'Find airport car rentals near you in Phoenix. Skip the counter at PHX Sky Harbor, Mesa Gateway, and Scottsdale Airport. Curbside delivery, free pickup available.',
  keywords: [
    'airport car rental near me',
    'airport car rental phoenix',
    'phx airport car rental',
    'mesa gateway car rental',
    'sky harbor car rental',
    'airport pickup car rental arizona'
  ],
  openGraph: {
    title: 'Airport Car Rentals Near Me | Phoenix Airports',
    description: 'Skip the rental counter. Get your car delivered curbside at Phoenix airports. Free delivery from many hosts.',
    url: 'https://itwhip.com/rentals/airport-near-me',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/rentals/airport-near-me',
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

export default async function AirportNearMePage() {
  const airportCars = await prisma.rentalCar.findMany({
    where: {
      isActive: true,
      airportPickup: true
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

  const totalCars = airportCars.length
  const minPrice = airportCars.length > 0 ? Math.min(...airportCars.map(c => Number(c.dailyRate))) : 39
  const maxPrice = airportCars.length > 0 ? Math.max(...airportCars.map(c => Number(c.dailyRate))) : 299

  // Group by car type
  const suvCars = airportCars.filter(car => car.carType === 'SUV')
  const sedanCars = airportCars.filter(car => car.carType === 'SEDAN')
  const luxuryCars = airportCars.filter(car => car.carType === 'LUXURY' || car.carType === 'EXOTIC')

  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        name: 'Airport Car Rentals Near Me in Phoenix',
        numberOfItems: totalCars,
        itemListElement: airportCars.slice(0, 10).map((car, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: `${car.year} ${car.make} ${car.model}`,
            url: `https://itwhip.com/rentals/${car.id}`,
            description: `Airport pickup available - ${car.year} ${car.make} ${car.model} in ${car.city}`,
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
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How does airport car rental work on ItWhip?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'When you land, text your host through the ItWhip app. They\'ll meet you curbside at arrivals, usually within 10-15 minutes. Quick vehicle walkthrough, sign digitally, and you\'re on your way.'
            }
          },
          {
            '@type': 'Question',
            name: 'Which Phoenix airports have car delivery?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Most hosts offer pickup at Phoenix Sky Harbor (PHX), Mesa Gateway (AZA), and Scottsdale Airport (SDL). Free delivery is available from many hosts.'
            }
          }
        ]
      }
    ]
  }

  const airports = [
    {
      name: 'Phoenix Sky Harbor',
      code: 'PHX',
      slug: 'phoenix-sky-harbor',
      description: 'Arizona\'s largest airport. Curbside pickup at Terminal 3 & 4.'
    },
    {
      name: 'Mesa Gateway',
      code: 'AZA',
      slug: 'mesa-gateway',
      description: 'Growing east valley airport. Less crowds, easy pickup.'
    },
    {
      name: 'Scottsdale Airport',
      code: 'SDL',
      slug: 'scottsdale-airport',
      description: 'Private aviation hub. Executive car service available.'
    }
  ]

  return (
    <>
      <Script
        id="airport-near-me-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <DynamicPageTitle template="Airport Car Rentals Near Me in {city}, AZ | ItWhip" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white pt-8 sm:pt-10 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/30 rounded-full text-blue-200 text-xs font-medium mb-3">
                <IoAirplaneOutline className="w-4 h-4" />
                Skip the Counter
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-white">
                <LocationAwareTitle
                  prefix="Airport Car Rentals Near Me in "
                  suffix=", AZ"
                  fallbackCity="Phoenix"
                  as="span"
                />
              </h1>
              <p className="text-lg text-blue-100 mb-6">
                Skip the rental counter lines. Get your car delivered curbside at Phoenix airports.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <IoCarOutline className="w-5 h-5 text-blue-300" />
                  <span><strong>{totalCars}</strong> cars with airport pickup</span>
                </div>
                <div className="flex items-center gap-2">
                  <IoTimeOutline className="w-5 h-5 text-blue-300" />
                  <span><strong>10-15 min</strong> curbside pickup</span>
                </div>
                <div className="flex items-center gap-2">
                  <IoShieldCheckmarkOutline className="w-5 h-5 text-blue-300" />
                  <span><strong>$1M</strong> insurance</span>
                </div>
              </div>

              <div className="inline-flex items-baseline gap-2 bg-white/10 backdrop-blur rounded-lg px-4 py-2 mb-6">
                <span className="text-blue-200 text-sm">From</span>
                <span className="text-3xl font-bold">${minPrice}</span>
                <span className="text-blue-200">/day</span>
              </div>

              <div className="block">
                <Link
                  href="/rentals/search?airportPickup=true"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <IoAirplaneOutline className="w-5 h-5" />
                  Browse Airport Cars
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
                <Link href="/" className="hover:text-amber-600 flex items-center gap-1">
                  <IoHomeOutline className="w-3.5 h-3.5" />
                  Home
                </Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="flex items-center gap-1.5">
                <Link href="/rentals" className="hover:text-amber-600">Rentals</Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-gray-800 dark:text-gray-200 font-medium">
                Airport Near Me
              </li>
            </ol>
          </nav>
        </div>

        {/* Phoenix Airports */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Phoenix Area Airports
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {airports.map((airport) => (
                <Link
                  key={airport.code}
                  href={`/rentals/airports/${airport.slug}`}
                  className="p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <IoAirplaneOutline className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600">
                        {airport.name}
                      </span>
                      <span className="text-gray-500 text-sm ml-2">({airport.code})</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {airport.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* All Airport Cars */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Available for Airport Pickup
            </h2>
            {airportCars.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {airportCars.slice(0, 15).map((car) => (
                  <CompactCarCard key={car.id} car={transformCarForCompactCard(car)} accentColor="blue" />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <IoCarOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No cars with airport pickup available at the moment</p>
                <Link href="/rentals" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
                  Browse all cars
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              How Airport Pickup Works
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: '1', title: 'Book Your Car', desc: 'Reserve a car with airport pickup enabled', icon: IoCarOutline },
                { step: '2', title: 'Land & Text', desc: 'Text your host when you land via the app', icon: IoAirplaneOutline },
                { step: '3', title: 'Meet Curbside', desc: 'Meet your host at arrivals (10-15 min)', icon: IoLocationOutline },
                { step: '4', title: 'Drive Away', desc: 'Quick walkthrough and you\'re on your way', icon: IoNavigateOutline }
              ].map((item, i) => (
                <div key={i} className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <item.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Pages */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              More Rental Options
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/rentals/near-me" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                All Cars Near Me
              </Link>
              <Link href="/rentals/airport-delivery" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                Airport Delivery
              </Link>
              <Link href="/rentals/hotel-delivery" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                Hotel Delivery
              </Link>
              <Link href="/rentals/luxury-near-me" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                Luxury Near Me
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
