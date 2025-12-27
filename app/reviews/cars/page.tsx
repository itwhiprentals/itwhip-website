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
  IoPersonCircleOutline,
  IoShieldCheckmarkOutline,
  IoOpenOutline,
  IoCheckmarkOutline
} from 'react-icons/io5'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

// Rating Breakdown Component - Compact
function RatingBreakdown({
  distribution,
  total
}: {
  distribution: { rating: number; _count: { rating: number } }[]
  total: number
}) {
  const ratings = [5, 4, 3, 2, 1]

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-2">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Rating Breakdown</h3>
      {ratings.map(star => {
        const count = distribution.find(d => d.rating === star)?._count?.rating || 0
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0

        return (
          <div key={star} className="flex items-center gap-2 text-xs">
            <span className="w-4 text-gray-600 dark:text-gray-400 font-medium">{star}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                s <= star
                  ? <IoStar key={s} className="w-3 h-3 text-amber-500" />
                  : <IoStarOutline key={s} className="w-3 h-3 text-gray-300 dark:text-gray-600" />
              ))}
            </div>
            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-16 text-gray-500 dark:text-gray-400 text-right text-[10px]">
              {percentage}% ({count})
            </span>
          </div>
        )
      })}
    </div>
  )
}

// Helper to get first name only
function getFirstName(name: string | null | undefined): string {
  if (!name) return 'Guest'
  return name.trim().split(/\s+/)[0] || 'Guest'
}

// Helper to get car type label
function getTypeLabel(type: string): string {
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

// Helper to get time ago
function getTimeAgo(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays < 7) return 'This week'
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`
  return `${Math.floor(diffInDays / 365)} year${Math.floor(diffInDays / 365) > 1 ? 's' : ''} ago`
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

  // Get overall stats and rating distribution
  const [stats, ratingDistribution, reviewCount] = await Promise.all([
    prisma.rentalCar.aggregate({
      where: { isActive: true, totalTrips: { gt: 0 } },
      _avg: { rating: true },
      _sum: { totalTrips: true },
      _count: true
    }),
    prisma.rentalReview.groupBy({
      by: ['rating'],
      where: {
        isVisible: true,
        car: { isActive: true }
      },
      _count: { rating: true },
      orderBy: { rating: 'desc' }
    }),
    prisma.rentalReview.count({
      where: {
        isVisible: true,
        car: { isActive: true }
      }
    })
  ])

  const avgRating = stats._avg.rating?.toFixed(1) || '4.8'
  const totalTrips = stats._sum.totalTrips || 0
  const totalCars = stats._count || 0

  // Price valid until (30 days from now)
  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

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
        url: `https://itwhip.com/rentals/${car.id}`,
        description: `${car.year} ${car.make} ${car.model} rental in ${car.city}, AZ - ${getTypeLabel(car.carType)} from $${car.dailyRate}/day`,
        image: car.photos[0]?.url || 'https://itwhip.com/images/car-default.jpg',
        ...(car.rating && car._count.reviews > 0 ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: car.rating,
            reviewCount: car._count.reviews,
            bestRating: 5,
            worstRating: 1
          }
        } : {}),
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: car.dailyRate,
          availability: 'https://schema.org/InStock',
          url: `https://itwhip.com/rentals/${car.id}`,
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
                unitCode: 'DAY'
              },
              transitTime: {
                '@type': 'QuantitativeValue',
                minValue: 0,
                maxValue: 1,
                unitCode: 'DAY'
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

  return (
    <>
      <Script
        id="cars-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
        {/* Hero Section - Compact Typography */}
        <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Header Badge */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-700 dark:text-amber-400 text-xs font-medium mb-3">
                <IoCarOutline className="w-3.5 h-3.5" />
                Verified Car Reviews
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {totalCars}+ Top-Rated Cars in Phoenix
              </h1>

              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                Browse our highest-rated vehicles with real guest reviews. From economy sedans to luxury SUVs.
              </p>
            </div>

            {/* Stats Grid - Compact */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
                <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">{avgRating}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Average Rating</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{reviewCount.toLocaleString()}+</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Car Reviews</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{totalCars}+</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Rated Cars</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
                <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalTrips.toLocaleString()}+</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Trips Completed</div>
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="max-w-md mx-auto mb-6">
              <RatingBreakdown distribution={ratingDistribution} total={reviewCount} />
            </div>

            {/* Google Reviews Badge with Title */}
            <div className="text-center mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">See what people are saying about us</p>
              <a
                href="https://www.google.com/search?q=ItWhip+Phoenix+AZ"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-500 rounded-lg px-4 py-2.5 transition-all hover:shadow-md"
              >
                {/* Google "G" Logo */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-900 dark:text-white font-semibold text-sm">5.0</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(i => (
                        <IoStar key={i} className="w-3.5 h-3.5 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-zinc-400">6 Google Reviews</span>
                </div>
                <IoOpenOutline className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
              </a>
            </div>

            {/* Verification Notice - Compact */}
            <div className="max-w-xl mx-auto">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 flex items-start gap-2">
                <IoShieldCheckmarkOutline className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">Verified Reviews</span> – All reviews are from verified renters who completed trips on ItWhip.
                </p>
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
                      <span className="text-xs text-gray-500">({car.totalTrips} trips)</span>
                    </div>
                    {/* Type Badge */}
                    <div className="absolute top-3 right-3 px-2 py-1 bg-gray-900/70 text-white text-xs font-medium rounded">
                      {getTypeLabel(car.carType)}
                    </div>
                    {/* Location Badge - Bottom Left */}
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 text-white text-xs font-medium rounded flex items-center gap-1">
                      <IoLocationOutline className="w-3 h-3" />
                      {car.city}, {car.state}
                    </div>
                  </div>

                  {/* Car Info */}
                  <div className="p-4">
                    {/* Year Make | Arrow | Ride Completed */}
                    <div className="flex items-center mb-2">
                      {/* Left: Year Make + Model */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {car.year} {car.make}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {car.model}
                        </p>
                      </div>

                      {/* Center: Arrow (positioned in middle) */}
                      <div className="flex-1 flex justify-center">
                        <span className="text-amber-500 text-lg font-bold">→</span>
                      </div>

                      {/* Right: Ride Completed + Time ago */}
                      <div className="flex-1 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] text-white bg-emerald-600 px-1.5 py-0.5 rounded font-medium">
                          <IoCheckmarkOutline className="w-3 h-3" />
                          Ride Completed
                        </span>
                        {car.reviews[0]?.createdAt && (
                          <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
                            {getTimeAgo(car.reviews[0].createdAt)}
                          </p>
                        )}
                      </div>
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
                                  star <= (car.reviews[0].rating || 0) ? (
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
