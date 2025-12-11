// app/(guest)/reviews/cars/page.tsx
import { Metadata } from 'next'
import Script from 'next/script'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/app/lib/database/prisma'
import {
  IoStar,
  IoCheckmarkCircleOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoCarOutline,
  IoLocationOutline,
  IoSpeedometerOutline
} from 'react-icons/io5'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Top-Rated Cars in Phoenix | Vehicle Reviews | ItWhip',
  description: 'Browse reviews for the highest-rated rental cars in Phoenix and Scottsdale. Real guest feedback on sedans, SUVs, luxury cars, and more.',
  keywords: ['car rental reviews phoenix', 'best rental cars scottsdale', 'top rated cars turo', 'phoenix car reviews', 'rental vehicle ratings'],
  openGraph: {
    title: 'Top-Rated Cars in Phoenix | ItWhip',
    description: 'Real guest reviews for the best rental cars in the Phoenix area.',
    url: 'https://itwhip.com/reviews/cars',
    type: 'website',
  },
  alternates: {
    canonical: 'https://itwhip.com/reviews/cars',
  },
}

export default async function CarReviewsPage() {
  // Fetch top-rated cars with reviews
  const cars = await prisma.rentalCar.findMany({
    where: {
      isActive: true,
      rating: { gte: 4.5 },
      reviewCount: { gt: 0 }
    },
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      type: true,
      rating: true,
      reviewCount: true,
      totalTrips: true,
      dailyRate: true,
      city: true,
      state: true,
      photos: {
        where: { isHero: true },
        take: 1,
        select: { url: true }
      },
      host: {
        select: {
          name: true,
          isSuperhost: true,
          isVerified: true
        }
      },
      reviews: {
        where: { isVisible: true },
        take: 1,
        orderBy: { createdAt: 'desc' },
        select: {
          rating: true,
          comment: true,
          createdAt: true,
          reviewerProfile: {
            select: { name: true }
          }
        }
      }
    },
    orderBy: [
      { rating: 'desc' },
      { reviewCount: 'desc' }
    ],
    take: 30
  })

  // Get overall stats
  const stats = await prisma.rentalCar.aggregate({
    where: { isActive: true, reviewCount: { gt: 0 } },
    _avg: { rating: true },
    _sum: { reviewCount: true },
    _count: true
  })

  const avgRating = stats._avg.rating?.toFixed(1) || '4.8'
  const totalReviews = stats._sum.reviewCount || 0
  const totalCars = stats._count || 0

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Top-Rated Cars in Phoenix',
    description: 'Highest-rated rental cars with verified guest reviews',
    numberOfItems: cars.length,
    itemListElement: cars.slice(0, 10).map((car, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: `${car.year} ${car.make} ${car.model}`,
        image: car.photos[0]?.url,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: car.rating,
          reviewCount: car.reviewCount,
          bestRating: 5,
          worstRating: 1
        },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: car.dailyRate,
          availability: 'https://schema.org/InStock',
          url: `https://itwhip.com/rentals/${car.id}`
        }
      }
    }))
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      SEDAN: 'Sedan',
      SUV: 'SUV',
      TRUCK: 'Truck',
      SPORTS: 'Sports',
      LUXURY: 'Luxury',
      CONVERTIBLE: 'Convertible',
      VAN: 'Van',
      COUPE: 'Coupe',
      HATCHBACK: 'Hatchback',
      EXOTIC: 'Exotic'
    }
    return labels[type] || type
  }

  return (
    <>
      <Script
        id="cars-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Hero */}
        <section className="bg-gradient-to-br from-amber-600 via-orange-600 to-amber-600 text-white pt-20 sm:pt-24 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/30 rounded-full text-amber-100 text-xs font-medium mb-4">
                <IoCarOutline className="w-4 h-4" />
                Car Reviews
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Top-Rated Cars in Phoenix
              </h1>
              <p className="text-xl text-amber-100 mb-6">
                Browse our highest-rated vehicles with real guest reviews. From economy sedans to luxury SUVs, find the perfect car for your trip.
              </p>
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <IoStar key={star} className="w-5 h-5 text-white" />
                    ))}
                  </div>
                  <span className="font-bold text-lg">{avgRating}</span>
                  <span className="text-amber-100">average</span>
                </div>
                <div className="text-amber-100">
                  <span className="font-semibold text-white">{totalCars}</span> reviewed cars
                </div>
                <div className="text-amber-100">
                  <span className="font-semibold text-white">{totalReviews.toLocaleString()}</span> total reviews
                </div>
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
                <Link href="/reviews" className="hover:text-amber-600">Reviews</Link>
                <IoChevronForwardOutline className="w-2.5 h-2.5" />
              </li>
              <li className="text-gray-800 dark:text-gray-200 font-medium">
                Cars
              </li>
            </ol>
          </nav>
        </div>

        {/* Category Quick Links */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Browse by Category
            </h2>
            <div className="flex flex-wrap gap-3">
              {['SUV', 'Sedan', 'Luxury', 'Sports', 'Truck', 'Convertible'].map((category) => (
                <Link
                  key={category}
                  href={`/rentals/types/${category.toLowerCase()}`}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-amber-500 hover:text-amber-600 transition"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Cars Grid */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Highest-Rated Vehicles
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <Link
                  key={car.id}
                  href={`/rentals/${car.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {/* Car Image */}
                  <div className="relative aspect-[4/3] bg-gray-200 dark:bg-gray-700">
                    {car.photos[0]?.url ? (
                      <Image
                        src={car.photos[0].url}
                        alt={`${car.year} ${car.make} ${car.model}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IoCarOutline className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    {/* Rating Badge */}
                    <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center gap-1">
                      <IoStar className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-semibold">{car.rating?.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({car.reviewCount})</span>
                    </div>
                    {/* Type Badge */}
                    <div className="absolute top-3 right-3 px-2 py-1 bg-gray-900/70 text-white text-xs font-medium rounded">
                      {getTypeLabel(car.type)}
                    </div>
                  </div>

                  {/* Car Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {car.year} {car.make} {car.model}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <IoLocationOutline className="w-3.5 h-3.5" />
                      <span>{car.city}, {car.state}</span>
                      {car.totalTrips && car.totalTrips > 0 && (
                        <>
                          <span>•</span>
                          <IoSpeedometerOutline className="w-3.5 h-3.5" />
                          <span>{car.totalTrips} trips</span>
                        </>
                      )}
                    </div>

                    {/* Host Info */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-gray-500">by {car.host.name}</span>
                      {car.host.isSuperhost && (
                        <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-medium rounded">
                          Superhost
                        </span>
                      )}
                      {car.host.isVerified && (
                        <IoCheckmarkCircleOutline className="w-3.5 h-3.5 text-blue-500" />
                      )}
                    </div>

                    {/* Latest Review Preview */}
                    {car.reviews[0] && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          &ldquo;{car.reviews[0].comment}&rdquo;
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          — {car.reviews[0].reviewerProfile?.name || 'Guest'}
                        </p>
                      </div>
                    )}

                    {/* Price */}
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          ${car.dailyRate}
                        </span>
                        <span className="text-sm text-gray-500">/day</span>
                      </div>
                      <span className="text-amber-600 text-sm font-medium group-hover:underline">
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {cars.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <IoCarOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No reviewed cars found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Check back soon for reviewed vehicles.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Book?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Browse all available cars in the Phoenix area and find your perfect ride.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition"
              >
                Browse All Cars
                <IoChevronForwardOutline className="w-5 h-5" />
              </Link>
              <Link
                href="/reviews"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                Read All Reviews
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
