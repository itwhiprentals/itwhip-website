// app/(guest)/rentals/luxury-near-me/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import prisma from '@/app/lib/database/prisma'
import { LocationAwareTitle, DynamicPageTitle } from '@/app/components/LocationAwareContent'
import {
  IoLocationOutline,
  IoCarOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoShieldCheckmarkOutline,
  IoStarOutline,
  IoDiamondOutline,
  IoSparklesOutline
} from 'react-icons/io5'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Luxury Car Rentals Near Me | Phoenix & Scottsdale | ItWhip',
  description: 'Find luxury car rentals near you in Phoenix & Scottsdale. BMW, Mercedes, Porsche, and more. Premium vehicles from local owners with $1M insurance included.',
  keywords: [
    'luxury car rental near me',
    'luxury car rental phoenix',
    'luxury car rental scottsdale',
    'rent bmw phoenix',
    'rent mercedes arizona',
    'porsche rental phoenix',
    'premium car rental near me'
  ],
  openGraph: {
    title: 'Luxury Car Rentals Near Me | Phoenix & Arizona',
    description: 'Rent luxury vehicles from local owners. BMW, Mercedes, Porsche & more with free delivery.',
    url: 'https://itwhip.com/rentals/luxury-near-me',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/rentals/luxury-near-me',
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

const LUXURY_BRANDS = ['BMW', 'Mercedes', 'Mercedes-Benz', 'Porsche', 'Audi', 'Lexus', 'Cadillac', 'Lincoln', 'Genesis', 'Jaguar', 'Land Rover', 'Range Rover', 'Maserati', 'Alfa Romeo']

export default async function LuxuryNearMePage() {
  const luxuryCars = await prisma.rentalCar.findMany({
    where: {
      isActive: true,
      OR: [
        { carType: 'Luxury' },
        { make: { in: LUXURY_BRANDS } }
      ]
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

  const totalCars = luxuryCars.length
  const minPrice = luxuryCars.length > 0 ? Math.min(...luxuryCars.map(c => Number(c.dailyRate))) : 89
  const maxPrice = luxuryCars.length > 0 ? Math.max(...luxuryCars.map(c => Number(c.dailyRate))) : 599

  // Group by brand
  const carsByBrand = luxuryCars.reduce((acc, car) => {
    const brand = car.make
    if (!acc[brand]) acc[brand] = []
    acc[brand].push(car)
    return acc
  }, {} as Record<string, typeof luxuryCars>)

  const topBrands = Object.entries(carsByBrand)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 6)

  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        name: 'Luxury Car Rentals Near Me in Arizona',
        numberOfItems: totalCars,
        itemListElement: luxuryCars.slice(0, 10).map((car, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: `${car.year} ${car.make} ${car.model}`,
            url: `https://itwhip.com/rentals/${car.id}`,
            description: `Luxury ${car.year} ${car.make} ${car.model} rental in ${car.city}`,
            image: car.photos?.[0]?.url || 'https://itwhip.com/images/luxury-default.jpg',
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
                merchantReturnDays: 1,
                returnMethod: 'https://schema.org/ReturnByMail',
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
                    unitCode: 'D01'
                  },
                  transitTime: {
                    '@type': 'QuantitativeValue',
                    minValue: 0,
                    maxValue: 1,
                    unitCode: 'D01'
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
            name: 'How much does it cost to rent a luxury car in Phoenix?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Luxury car rentals in Phoenix start from $${minPrice}/day. Premium vehicles like Porsches and newer Mercedes models range from $150-$400/day depending on the model.`
            }
          },
          {
            '@type': 'Question',
            name: 'What luxury brands are available on ItWhip?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'ItWhip offers luxury rentals from BMW, Mercedes-Benz, Porsche, Audi, Lexus, Cadillac, Land Rover, and more from local owners in Phoenix and Scottsdale.'
            }
          }
        ]
      }
    ]
  }

  return (
    <>
      <Script
        id="luxury-near-me-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <DynamicPageTitle template="Luxury Car Rentals Near Me in {city}, AZ | ItWhip" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        {/* Hero */}
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white pt-8 sm:pt-10 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 rounded-full text-amber-400 text-xs font-medium mb-3">
                <IoDiamondOutline className="w-4 h-4" />
                Premium Selection
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-white">
                <LocationAwareTitle
                  prefix="Luxury Car Rentals Near Me in "
                  suffix=", AZ"
                  fallbackCity="Phoenix"
                  as="span"
                />
              </h1>
              <p className="text-lg text-gray-300 mb-6">
                Experience premium vehicles from BMW, Mercedes, Porsche and more. Rent from local owners in Phoenix & Scottsdale.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <IoCarOutline className="w-5 h-5 text-amber-400" />
                  <span><strong>{totalCars}</strong> luxury cars</span>
                </div>
                <div className="flex items-center gap-2">
                  <IoStarOutline className="w-5 h-5 text-amber-400" />
                  <span>From <strong>${minPrice}</strong>/day</span>
                </div>
                <div className="flex items-center gap-2">
                  <IoShieldCheckmarkOutline className="w-5 h-5 text-amber-400" />
                  <span><strong>$1M</strong> insurance</span>
                </div>
              </div>

              <Link
                href="/rentals/types/luxury"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
              >
                <IoSparklesOutline className="w-5 h-5" />
                Browse All Luxury
              </Link>
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
                Luxury Near Me
              </li>
            </ol>
          </nav>
        </div>

        {/* Featured Luxury */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Luxury Vehicles
            </h2>
            {luxuryCars.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {luxuryCars.slice(0, 10).map((car) => (
                  <CompactCarCard key={car.id} car={transformCarForCompactCard(car)} accentColor="amber" />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <IoDiamondOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No luxury cars available at the moment</p>
                <Link href="/rentals" className="text-amber-600 hover:text-amber-700 mt-2 inline-block">
                  Browse all cars
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* By Brand */}
        {topBrands.length > 0 && (
          <section className="py-8 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Browse by Brand
              </h2>
              <div className="space-y-8">
                {topBrands.map(([brand, cars]) => (
                  <div key={brand}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        {brand}
                        <span className="text-sm font-normal text-gray-500">({cars.length} available)</span>
                      </h3>
                      <Link
                        href={`/rentals/makes/${brand.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
                      >
                        View all <IoChevronForwardOutline className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {cars.slice(0, 5).map((car) => (
                        <CompactCarCard key={car.id} car={transformCarForCompactCard(car)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Related Pages */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              More Car Categories
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/rentals/near-me" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                All Cars Near Me
              </Link>
              <Link href="/rentals/exotic-near-me" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                Exotic Cars Near Me
              </Link>
              <Link href="/rentals/suv-near-me" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                SUVs Near Me
              </Link>
              <Link href="/rentals/types/sports" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                Sports Cars
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
