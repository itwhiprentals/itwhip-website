// app/(guest)/rentals/suv-near-me/page.tsx
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
  IoPeopleOutline,
  IoNavigateOutline,
  IoMapOutline
} from 'react-icons/io5'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'SUV Rentals Near Me | Phoenix & Arizona | ItWhip',
  description: 'Find SUV rentals near you in Phoenix, Scottsdale & Arizona. Spacious vehicles for families and adventures. From local owners with $1M insurance.',
  keywords: [
    'suv rental near me',
    'suv rental phoenix',
    'rent suv arizona',
    'family car rental near me',
    '7 seater rental phoenix',
    'jeep rental near me',
    'large car rental arizona'
  ],
  openGraph: {
    title: 'SUV Rentals Near Me | Phoenix & Arizona',
    description: 'Rent spacious SUVs from local owners. Perfect for families, road trips, and Arizona adventures.',
    url: 'https://itwhip.com/rentals/suv-near-me',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/rentals/suv-near-me',
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

export default async function SUVNearMePage() {
  const suvCars = await prisma.rentalCar.findMany({
    where: {
      isActive: true,
      carType: 'SUV'
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

  const totalCars = suvCars.length
  const minPrice = suvCars.length > 0 ? Math.min(...suvCars.map(c => Number(c.dailyRate))) : 55
  const maxPrice = suvCars.length > 0 ? Math.max(...suvCars.map(c => Number(c.dailyRate))) : 299

  // Group by city
  const carsByCity = suvCars.reduce((acc, car) => {
    const city = car.city || 'Phoenix'
    if (!acc[city]) acc[city] = []
    acc[city].push(car)
    return acc
  }, {} as Record<string, typeof suvCars>)

  const topCities = Object.entries(carsByCity)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 4)

  // Group by seating capacity
  const largeSUVs = suvCars.filter(car => (car.seats || 5) >= 7)
  const midSUVs = suvCars.filter(car => (car.seats || 5) === 5 || (car.seats || 5) === 6)

  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        name: 'SUV Rentals Near Me in Arizona',
        numberOfItems: totalCars,
        itemListElement: suvCars.slice(0, 10).map((car, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: `${car.year} ${car.make} ${car.model}`,
            description: `${car.seats || 5}-passenger SUV rental in ${car.city}`,
            image: car.photos?.[0]?.url || 'https://itwhip.com/images/suv-default.jpg',
            offers: {
              '@type': 'Offer',
              price: car.dailyRate,
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              priceValidUntil
            }
          }
        }))
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How much does it cost to rent an SUV in Phoenix?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: `SUV rentals in Phoenix start from $${minPrice}/day on ItWhip. Larger 7-seat SUVs typically range from $75-$150/day.`
            }
          },
          {
            '@type': 'Question',
            name: 'Can I rent a 7-passenger SUV near me?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Yes! ItWhip has ${largeSUVs.length} large SUVs with 7+ seats available in Phoenix and Scottsdale, perfect for families and groups.`
            }
          }
        ]
      }
    ]
  }

  return (
    <>
      <Script
        id="suv-near-me-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <DynamicPageTitle template="SUV Rentals Near Me in {city}, AZ | ItWhip" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        {/* Hero */}
        <section className="bg-gradient-to-br from-green-800 via-green-700 to-emerald-800 text-white pt-8 sm:pt-10 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-white text-xs font-medium mb-3">
                <IoMapOutline className="w-4 h-4" />
                Adventure Ready
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-white">
                <LocationAwareTitle
                  prefix="SUV Rentals Near Me in "
                  suffix=", AZ"
                  fallbackCity="Phoenix"
                  as="span"
                />
              </h1>
              <p className="text-lg text-white/90 mb-6">
                Spacious SUVs perfect for families, road trips, and Arizona adventures. Rent from local owners.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <IoCarOutline className="w-5 h-5 text-green-300" />
                  <span><strong>{totalCars}</strong> SUVs available</span>
                </div>
                <div className="flex items-center gap-2">
                  <IoPeopleOutline className="w-5 h-5 text-green-300" />
                  <span><strong>{largeSUVs.length}</strong> with 7+ seats</span>
                </div>
                <div className="flex items-center gap-2">
                  <IoShieldCheckmarkOutline className="w-5 h-5 text-green-300" />
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
                  href="/rentals/types/suv"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-700 font-semibold rounded-lg hover:bg-green-50 transition-colors"
                >
                  <IoCarOutline className="w-5 h-5" />
                  Browse All SUVs
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
                SUV Near Me
              </li>
            </ol>
          </nav>
        </div>

        {/* Large SUVs Section */}
        {largeSUVs.length > 0 && (
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  7+ Passenger SUVs
                </h2>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                  Family Size
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Perfect for large families and groups
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {largeSUVs.slice(0, 5).map((car) => (
                  <CompactCarCard key={car.id} car={transformCarForCompactCard(car)} accentColor="emerald" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All SUVs */}
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              All SUVs Near You
            </h2>
            {suvCars.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {suvCars.slice(0, 15).map((car) => (
                  <CompactCarCard key={car.id} car={transformCarForCompactCard(car)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <IoCarOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No SUVs available at the moment</p>
                <Link href="/rentals" className="text-amber-600 hover:text-amber-700 mt-2 inline-block">
                  Browse all cars
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* By Location */}
        {topCities.length > 0 && (
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                SUVs by Location
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {topCities.map(([city, cars]) => (
                  <Link
                    key={city}
                    href={`/rentals/cities/${city.toLowerCase().replace(/\s+/g, '-')}`}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 transition-colors group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <IoLocationOutline className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600">
                        {city}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{cars.length} SUVs available</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Why SUV */}
        <section className="py-8 bg-green-50 dark:bg-green-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Why Rent an SUV in Arizona?
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { icon: IoPeopleOutline, title: 'Space for Everyone', desc: 'Room for family, friends, and luggage' },
                { icon: IoMapOutline, title: 'Adventure Ready', desc: 'Perfect for Sedona, Grand Canyon & beyond' },
                { icon: IoNavigateOutline, title: 'Delivery Available', desc: 'Pickup at airport, hotel, or home' },
                { icon: IoShieldCheckmarkOutline, title: 'Full Protection', desc: '$1M insurance included free' }
              ].map((item, i) => (
                <div key={i} className="text-center p-4">
                  <item.icon className="w-10 h-10 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Pages */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              More Categories
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/rentals/near-me" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                All Cars Near Me
              </Link>
              <Link href="/rentals/luxury-near-me" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                Luxury Near Me
              </Link>
              <Link href="/rentals/exotic-near-me" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                Exotic Near Me
              </Link>
              <Link href="/rentals/makes/jeep/wrangler" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                Jeep Wrangler
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
