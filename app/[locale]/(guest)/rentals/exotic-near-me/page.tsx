// app/(guest)/rentals/exotic-near-me/page.tsx
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import Script from 'next/script'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import prisma from '@/app/lib/database/prisma'
import { HOST_CARD_SELECT } from '@/app/lib/database/host-select'
import { LocationAwareTitle, DynamicPageTitle } from '@/app/components/LocationAwareContent'
import {
  IoCarSportOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoShieldCheckmarkOutline,
  IoSpeedometerOutline,
  IoFlameOutline,
  IoStarOutline,
  IoRocketOutline
} from 'react-icons/io5'
import { capitalizeCarMake, normalizeModelName } from '@/app/lib/utils/formatters'

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('rentalsExoticNearMeTitle'),
    description: t('rentalsExoticNearMeDescription'),
    keywords: [
      'exotic car rental near me',
      'supercar rental phoenix',
      'lamborghini rental phoenix',
      'ferrari rental scottsdale',
      'exotic car rental arizona',
      'rent lamborghini near me',
      'mclaren rental phoenix'
    ],
    openGraph: {
      title: t('rentalsExoticNearMeTitle'),
      description: t('rentalsExoticNearMeDescription'),
      url: 'https://itwhip.com/rentals/exotic-near-me',
      type: 'website'
    },
    alternates: {
      canonical: 'https://itwhip.com/rentals/exotic-near-me',
    },
  }
}

function transformCarForCompactCard(car: any) {
  return {
    id: car.id,
    make: car.make,
    model: car.model,
    year: car.year,
    dailyRate: Number(car.dailyRate),
    carType: car.carType,
    seats: car.seats || 2,
    city: car.city,
    rating: car.rating ? Number(car.rating) : null,
    totalTrips: car.totalTrips,
    instantBook: car.instantBook,
    photos: car.photos || [],
    host: car.host ? {
      name: car.host.name,
      profilePhoto: car.host.profilePhoto,
      isBusinessHost: car.host.isBusinessHost,
      partnerCompanyName: car.host.partnerCompanyName,
      hostType: car.host.hostType
    } : null
  }
}

const EXOTIC_BRANDS = ['Lamborghini', 'Ferrari', 'McLaren', 'Aston Martin', 'Bentley', 'Rolls-Royce', 'Bugatti', 'Pagani', 'Koenigsegg']

export default async function ExoticNearMePage() {
  const exoticCars = await prisma.rentalCar.findMany({
    where: {
      isActive: true,
      OR: [
        { carType: 'Exotic' },
        { make: { in: EXOTIC_BRANDS } }
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
      host: { select: HOST_CARD_SELECT }
    },
    orderBy: [
      { rating: 'desc' },
      { dailyRate: 'desc' }
    ]
  })

  const totalCars = exoticCars.length
  const minPrice = exoticCars.length > 0 ? Math.min(...exoticCars.map(c => Number(c.dailyRate))) : 499
  const maxPrice = exoticCars.length > 0 ? Math.max(...exoticCars.map(c => Number(c.dailyRate))) : 2999

  // Group by brand
  const carsByBrand = exoticCars.reduce((acc, car) => {
    const brand = car.make
    if (!acc[brand]) acc[brand] = []
    acc[brand].push(car)
    return acc
  }, {} as Record<string, typeof exoticCars>)

  const availableBrands = Object.entries(carsByBrand)
    .sort((a, b) => b[1].length - a[1].length)

  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        name: 'Exotic Car Rentals Near Me in Arizona',
        numberOfItems: totalCars,
        itemListElement: exoticCars.slice(0, 10).map((car, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: `${car.year} ${capitalizeCarMake(car.make)} ${normalizeModelName(car.model, car.make)}`,
            url: `https://itwhip.com/rentals/${car.id}`,
            description: `Exotic ${car.year} ${capitalizeCarMake(car.make)} ${normalizeModelName(car.model, car.make)} supercar rental in ${car.city}`,
            image: car.photos?.[0]?.url || 'https://itwhip.com/Luxury-car.png',
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
            name: 'How much does it cost to rent an exotic car in Phoenix?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Exotic car rentals in Phoenix typically start from $${minPrice}/day for entry-level supercars like Porsche 911. Lamborghinis and Ferraris range from $999-$2,500/day.`
            }
          },
          {
            '@type': 'Question',
            name: 'What do I need to rent an exotic car?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'To rent an exotic car, you typically need to be 25+, have a clean driving record, valid license, full coverage insurance, and a substantial security deposit ($2,500-$10,000 depending on vehicle).'
            }
          }
        ]
      }
    ]
  }

  return (
    <>
      <Script
        id="exotic-near-me-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <DynamicPageTitle template="Exotic Car Rentals Near Me in {city}, AZ | ItWhip" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        {/* Hero */}
        <section className="bg-gradient-to-br from-red-900 via-red-800 to-black text-white pt-8 sm:pt-10 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/30 rounded-full text-red-300 text-xs font-medium mb-3">
                <IoRocketOutline className="w-4 h-4" />
                Supercar Experience
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-white">
                <LocationAwareTitle
                  prefix="Exotic Car Rentals Near Me in "
                  suffix=", AZ"
                  fallbackCity="Phoenix"
                  as="span"
                />
              </h1>
              <p className="text-lg text-gray-300 mb-6">
                Drive your dream car. Lamborghini, Ferrari, McLaren and more exotic supercars from local owners in Phoenix & Scottsdale.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <IoCarSportOutline className="w-5 h-5 text-red-400" />
                  <span><strong>{totalCars}</strong> exotics available</span>
                </div>
                <div className="flex items-center gap-2">
                  <IoSpeedometerOutline className="w-5 h-5 text-red-400" />
                  <span>500+ HP supercars</span>
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
                  href="/rentals/types/exotic"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <IoFlameOutline className="w-5 h-5" />
                  Browse All Exotics
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
                Exotic Near Me
              </li>
            </ol>
          </nav>
        </div>

        {/* Featured Exotics */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Exotic Cars
            </h2>
            {exoticCars.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {exoticCars.slice(0, 10).map((car) => (
                  <CompactCarCard key={car.id} car={transformCarForCompactCard(car)} accentColor="purple" />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <IoCarSportOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No exotic cars currently available</p>
                <p className="text-sm text-gray-400 mb-4">Check back soon or browse luxury alternatives</p>
                <Link href="/rentals/luxury-near-me" className="text-red-600 hover:text-red-700 font-medium">
                  Browse Luxury Cars
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* By Brand */}
        {availableBrands.length > 0 && (
          <section className="py-8 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Browse by Brand
              </h2>
              <div className="space-y-8">
                {availableBrands.map(([brand, cars]) => (
                  <div key={brand}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <IoStarOutline className="w-5 h-5 text-red-500" />
                        {brand}
                        <span className="text-sm font-normal text-gray-500">({cars.length} available)</span>
                      </h3>
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

        {/* Requirements */}
        <section className="py-8 bg-red-50 dark:bg-red-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Exotic Car Rental Requirements
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { title: 'Age 25+', desc: 'Minimum age for most exotic rentals' },
                { title: 'Clean Record', desc: 'No major violations in past 3 years' },
                { title: 'Full Insurance', desc: 'Personal coverage or our premium plan' },
                { title: 'Security Deposit', desc: '$2,500-$10,000 depending on vehicle' }
              ].map((item, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Models */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Popular Exotic Models
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link
                href="/rentals/makes/lamborghini/huracan"
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-red-500 transition-colors group"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600">Lamborghini Huracán</h3>
                <p className="text-sm text-gray-500">V10 • 630 HP • AWD</p>
              </Link>
              <Link
                href="/rentals/makes/ferrari/488"
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-red-500 transition-colors group"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600">Ferrari 488</h3>
                <p className="text-sm text-gray-500">Twin-Turbo V8 • 661 HP</p>
              </Link>
              <Link
                href="/rentals/makes/bentley/bentayga"
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-red-500 transition-colors group"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600">Bentley Bentayga</h3>
                <p className="text-sm text-gray-500">W12 • Ultra Luxury SUV</p>
              </Link>
              <Link
                href="/rentals/makes/porsche/cayenne"
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-red-500 transition-colors group"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600">Porsche Cayenne</h3>
                <p className="text-sm text-gray-500">Twin-Turbo • Sports SUV</p>
              </Link>
            </div>
          </div>
        </section>

        {/* Related Pages */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              More Categories
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/rentals/near-me" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                All Cars Near Me
              </Link>
              <Link href="/rentals/luxury-near-me" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                Luxury Near Me
              </Link>
              <Link href="/rentals/types/sports" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                Sports Cars
              </Link>
              <Link href="/rentals/types/convertible" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                Convertibles
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
