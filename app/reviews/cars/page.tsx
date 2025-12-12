// app/reviews/cars/page.tsx
import { Metadata } from 'next'
import Script from 'next/script'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/app/lib/database/prisma'
import {
  IoStar,
  IoStarOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoCarOutline,
  IoLocationOutline,
  IoSpeedometerOutline,
  IoPersonCircleOutline
} from 'react-icons/io5'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

// Helper to get first name only
function getFirstName(name: string | null | undefined): string {
  if (!name) return 'Guest'
  return name.trim().split(/\s+/)[0] || 'Guest'
}

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const carCount = await prisma.rentalCar.count({
    where: {
      isActive: true,
      rating: { gte: 4.5 },
      totalTrips: { gt: 0 }
    }
  })

  return {
    title: `Top-Rated Cars (${carCount}) | ItWhip Arizona`,
    description: 'Browse reviews for the highest-rated rental cars in Phoenix and Scottsdale. Real guest feedback on sedans, SUVs, luxury cars, and more.',
    keywords: ['car rental reviews phoenix', 'best rental cars scottsdale', 'top rated cars turo', 'phoenix car reviews', 'rental vehicle ratings'],
    openGraph: {
      title: `Top-Rated Cars (${carCount}) | ItWhip Arizona`,
      description: 'Real guest reviews for the best rental cars in the Phoenix area.',
      url: 'https://itwhip.com/reviews/cars',
      type: 'website',
    },
    alternates: {
      canonical: 'https://itwhip.com/reviews/cars',
    },
  }
}

interface PageProps {
  searchParams: Promise<{ sort?: string; type?: string }>
}

export default async function CarReviewsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const sortBy = params.sort || 'rating'
  const typeFilter = params.type || null

  // Build orderBy based on sort parameter
  const orderBy = sortBy === 'trips'
    ? [{ totalTrips: 'desc' as const }, { rating: 'desc' as const }]
    : sortBy === 'price_low'
    ? [{ dailyRate: 'asc' as const }, { rating: 'desc' as const }]
    : sortBy === 'price_high'
    ? [{ dailyRate: 'desc' as const }, { rating: 'desc' as const }]
    : sortBy === 'newest'
    ? [{ createdAt: 'desc' as const }, { rating: 'desc' as const }]
    : [{ rating: 'desc' as const }, { totalTrips: 'desc' as const }]

  // Build where clause with optional type filter
  const whereClause = {
    isActive: true,
    rating: { gte: 4.5 },
    totalTrips: { gt: 0 },
    ...(typeFilter ? { carType: typeFilter.toUpperCase() } : {})
  }

  // Fetch top-rated cars with reviews
  const cars = await prisma.rentalCar.findMany({
    where: whereClause,
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      carType: true,
      rating: true,
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
          rating: true,
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
            select: {
              name: true,
              profilePhotoUrl: true
            }
          }
        }
      },
      _count: {
        select: { reviews: true }
      }
    },
    orderBy,
    take: 30
  })

  // Get overall stats
  const stats = await prisma.rentalCar.aggregate({
    where: { isActive: true, totalTrips: { gt: 0 } },
    _avg: { rating: true },
    _sum: { totalTrips: true },
    _count: true
  })

  const avgRating = stats._avg.rating?.toFixed(1) || '4.8'
  const totalTrips = stats._sum.totalTrips || 0
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
          reviewCount: car._count.reviews,
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
                  <span className="font-semibold text-white">{totalCars}</span> rated cars
                </div>
                <div className="text-amber-100">
                  <span className="font-semibold text-white">{totalTrips.toLocaleString()}</span> trips completed
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

        {/* Filter Tabs */}
        <section className="pt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
              <Link
                href="/reviews"
                className="px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                All Reviews
              </Link>
              <Link
                href="/reviews/hosts"
                className="px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Host Reviews
              </Link>
              <Link
                href="/reviews/cars"
                className="px-4 py-3 text-amber-600 border-b-2 border-amber-600 font-medium"
              >
                Car Reviews ({cars.length})
              </Link>
            </div>

            {/* Sort/Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                <div className="flex gap-1 flex-wrap">
                  <Link
                    href={sortBy === 'rating' ? '/reviews/cars' : `/reviews/cars?sort=${sortBy}`}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      !typeFilter
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    All
                  </Link>
                  {['SUV', 'Sedan', 'Luxury', 'Sports', 'Truck'].map((type) => (
                    <Link
                      key={type}
                      href={`/reviews/cars?type=${type.toLowerCase()}${sortBy !== 'rating' ? `&sort=${sortBy}` : ''}`}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        typeFilter?.toLowerCase() === type.toLowerCase()
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {type}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-600" />

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Sort:</span>
                <div className="flex gap-1 flex-wrap">
                  {[
                    { value: 'rating', label: 'Highest Rated' },
                    { value: 'trips', label: 'Most Trips' },
                    { value: 'price_low', label: 'Price: Low' },
                    { value: 'price_high', label: 'Price: High' },
                  ].map((option) => (
                    <Link
                      key={option.value}
                      href={`/reviews/cars${typeFilter ? `?type=${typeFilter}` : ''}${option.value !== 'rating' ? `${typeFilter ? '&' : '?'}sort=${option.value}` : ''}`}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        sortBy === option.value
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {option.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              {(typeFilter || sortBy !== 'rating') && (
                <Link
                  href="/reviews/cars"
                  className="ml-auto text-sm text-amber-600 hover:text-amber-700 dark:hover:text-amber-500"
                >
                  Clear
                </Link>
              )}
            </div>

            {/* Results indicator */}
            {typeFilter && (
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {cars.length} {getTypeLabel(typeFilter.toUpperCase())} vehicle{cars.length !== 1 ? 's' : ''}
              </p>
            )}
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
                      <span className="text-xs text-gray-500">({car._count.reviews})</span>
                    </div>
                    {/* Type Badge */}
                    <div className="absolute top-3 right-3 px-2 py-1 bg-gray-900/70 text-white text-xs font-medium rounded">
                      {getTypeLabel(car.carType)}
                    </div>
                  </div>

                  {/* Car Info */}
                  <div className="p-4">
                    {/* Year & Make */}
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {car.year} {car.make}
                    </h3>
                    {/* Model on separate line */}
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {car.model}
                    </p>

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

                    {/* Latest Review Preview with Guest Photo */}
                    {car.reviews[0] && car.reviews[0].comment && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-start gap-2">
                          {/* Guest Photo */}
                          <div className="flex-shrink-0">
                            {car.reviews[0].reviewerProfile?.profilePhotoUrl ? (
                              <Image
                                src={car.reviews[0].reviewerProfile.profilePhotoUrl}
                                alt={getFirstName(car.reviews[0].reviewerProfile?.name)}
                                width={28}
                                height={28}
                                className="w-7 h-7 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <IoPersonCircleOutline className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            {/* Reviewer name and stars */}
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {getFirstName(car.reviews[0].reviewerProfile?.name)}
                              </span>
                              {/* Dynamic stars */}
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  star <= (car.reviews[0].rating || 5) ? (
                                    <IoStar key={star} className="w-3 h-3 text-amber-400" />
                                  ) : (
                                    <IoStarOutline key={star} className="w-3 h-3 text-gray-300" />
                                  )
                                ))}
                              </div>
                            </div>
                            {/* Review comment */}
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              &ldquo;{car.reviews[0].comment}&rdquo;
                            </p>
                          </div>
                        </div>
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
