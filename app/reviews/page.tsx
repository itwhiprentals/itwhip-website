// app/reviews/page.tsx
import { Metadata } from 'next'
import Script from 'next/script'
import Link from 'next/link'
import { prisma } from '@/app/lib/database/prisma'
import {
  IoStar,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import ReviewCard from './components/ReviewCard'

// Revalidate every hour
export const revalidate = 3600

// Generate SEO metadata
export async function generateMetadata(): Promise<Metadata> {
  const totalReviews = await prisma.rentalReview.count({
    where: { isVisible: true }
  })

  return {
    title: `Guest Reviews (${totalReviews}) | ItWhip Car Rental Arizona`,
    description: `Read ${totalReviews} verified guest reviews from real ItWhip riders in Phoenix and Scottsdale. See what guests say about our cars and hosts.`,
    openGraph: {
      title: `${totalReviews} Guest Reviews | ItWhip`,
      description: `Read ${totalReviews} verified guest reviews from real ItWhip riders. Real trips, real feedback.`,
      url: 'https://itwhip.com/reviews',
      siteName: 'ItWhip',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${totalReviews} Guest Reviews | ItWhip`,
      description: `Read ${totalReviews} verified guest reviews from real ItWhip riders.`,
    },
    alternates: {
      canonical: 'https://itwhip.com/reviews',
    },
  }
}

interface PageProps {
  searchParams: Promise<{ page?: string; rating?: string; sort?: string }>
}

export default async function ReviewsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const currentPage = parseInt(params.page || '1')
  const ratingFilter = params.rating ? parseInt(params.rating) : null
  const sortBy = params.sort || 'newest'
  const perPage = 20
  const skip = (currentPage - 1) * perPage

  // Build where clause with rating filter
  const whereClause = {
    isVisible: true,
    ...(ratingFilter ? { rating: ratingFilter } : {})
  }

  // Build orderBy based on sort parameter
  const orderBy = sortBy === 'oldest'
    ? { createdAt: 'asc' as const }
    : sortBy === 'highest'
    ? { rating: 'desc' as const }
    : sortBy === 'lowest'
    ? { rating: 'asc' as const }
    : { createdAt: 'desc' as const }

  // Fetch reviews with related data
  const [reviews, totalCount, filteredCount, stats] = await Promise.all([
    prisma.rentalReview.findMany({
      where: whereClause,
      select: {
        id: true,
        rating: true,
        comment: true,
        title: true,
        createdAt: true,
        isVerified: true,
        hostResponse: true,
        hostRespondedAt: true,
        reviewerProfile: {
          select: {
            id: true,
            name: true,
            profilePhotoUrl: true,
            memberSince: true,
            tripCount: true,
            isVerified: true,
            city: true,
            state: true,
          }
        },
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            city: true,
            state: true,
            totalTrips: true,
            dailyRate: true,
            photos: {
              where: { isHero: true },
              take: 1,
              select: { url: true }
            }
          }
        },
        host: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          }
        }
      },
      orderBy,
      skip,
      take: perPage,
    }),
    prisma.rentalReview.count({
      where: { isVisible: true }
    }),
    prisma.rentalReview.count({
      where: whereClause
    }),
    prisma.rentalReview.aggregate({
      where: { isVisible: true },
      _avg: { rating: true },
    })
  ])

  const totalPages = Math.ceil(filteredCount / perPage)
  const avgRating = stats._avg.rating?.toFixed(1) || '4.8'

  // Build URL params helper for pagination/filters
  const buildUrl = (pageNum: number, rating?: number | null, sort?: string) => {
    const params = new URLSearchParams()
    if (pageNum > 1) params.set('page', pageNum.toString())
    if (rating) params.set('rating', rating.toString())
    if (sort && sort !== 'newest') params.set('sort', sort)
    const queryString = params.toString()
    return `/reviews${queryString ? `?${queryString}` : ''}`
  }

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'ItWhip Guest Reviews',
    description: `${totalCount} verified guest reviews from ItWhip car rental platform`,
    numberOfItems: totalCount,
    itemListElement: reviews.slice(0, 10).map((review, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.reviewerProfile?.name || 'Guest'
        },
        datePublished: review.createdAt.toISOString(),
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1
        },
        reviewBody: review.comment,
        itemReviewed: {
          '@type': 'Product',
          name: review.car
            ? `${review.car.year} ${review.car.make} ${review.car.model}`
            : 'Vehicle Rental',
          image: review.car?.photos?.[0]?.url || 'https://itwhip.com/default-car.jpg',
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: review.car?.dailyRate?.toString() || '99',
            availability: 'https://schema.org/InStock',
            url: `https://itwhip.com/rentals/${review.car?.id}`
          }
        }
      }
    }))
  }

  const aggregateRatingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ItWhip',
    url: 'https://itwhip.com',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avgRating,
      bestRating: '5',
      worstRating: '1',
      ratingCount: totalCount.toString(),
      reviewCount: totalCount.toString()
    }
  }

  return (
    <>
      <Script
        id="reviews-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script
        id="aggregate-rating-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateRatingJsonLd) }}
      />

      <Header />

      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
        {/* Hero Section */}
        <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {totalCount.toLocaleString()} Guest Reviews
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Real riders, real trips, real feedback since 2024
              </p>

              {/* Stats */}
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <IoStar key={star} className="w-7 h-7 text-amber-500" />
                    ))}
                  </div>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{avgRating}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">average</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">{totalCount}</span> verified reviews
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews List */}
        <section className="py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filter Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
              <Link
                href="/reviews"
                className="px-4 py-3 text-amber-600 border-b-2 border-amber-600 font-medium"
              >
                All Reviews ({totalCount})
              </Link>
              <Link
                href="/reviews/hosts"
                className="px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Host Reviews
              </Link>
              <Link
                href="/reviews/cars"
                className="px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Car Reviews
              </Link>
            </div>

            {/* Filter/Sort Bar */}
            <div className="flex flex-wrap items-center gap-3 mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              {/* Rating Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Rating:</span>
                <div className="flex gap-1">
                  <Link
                    href={buildUrl(1, null, sortBy)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      !ratingFilter
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    All
                  </Link>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <Link
                      key={rating}
                      href={buildUrl(1, rating, sortBy)}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 ${
                        ratingFilter === rating
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {rating}<IoStar className="w-3 h-3" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-600" />

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Sort:</span>
                <div className="flex gap-1">
                  {[
                    { value: 'newest', label: 'Newest' },
                    { value: 'oldest', label: 'Oldest' },
                    { value: 'highest', label: 'Highest' },
                    { value: 'lowest', label: 'Lowest' },
                  ].map((option) => (
                    <Link
                      key={option.value}
                      href={buildUrl(1, ratingFilter, option.value)}
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

              {/* Active filters indicator */}
              {(ratingFilter || sortBy !== 'newest') && (
                <Link
                  href="/reviews"
                  className="ml-auto text-sm text-amber-600 hover:text-amber-700 dark:hover:text-amber-500"
                >
                  Clear filters
                </Link>
              )}
            </div>

            {/* Results count when filtered */}
            {ratingFilter && (
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredCount} {ratingFilter}-star review{filteredCount !== 1 ? 's' : ''}
              </p>
            )}

            <div className="space-y-6">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={{
                    ...review,
                    createdAt: review.createdAt.toISOString(),
                    hostRespondedAt: review.hostRespondedAt?.toISOString() || null,
                    reviewerProfile: review.reviewerProfile ? {
                      ...review.reviewerProfile,
                      memberSince: review.reviewerProfile.memberSince?.toISOString() || null
                    } : null
                  }}
                />
              ))}
            </div>

            {/* Badge Legend */}
            <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
              <span className="flex items-center gap-1">
                <IoCheckmarkCircleOutline className="w-3.5 h-3.5 text-green-500" />
                <span>Documents + Insurance Verified</span>
              </span>
              <span className="hidden sm:inline">•</span>
              <span>🌱 Eco-Friendly = Carbon Reporting</span>
            </p>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-4 flex items-center justify-center gap-2">
                {currentPage > 1 && (
                  <Link
                    href={buildUrl(currentPage - 1, ratingFilter, sortBy)}
                    className="inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    ←
                  </Link>
                )}

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <Link
                        key={pageNum}
                        href={buildUrl(pageNum, ratingFilter, sortBy)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${
                          pageNum === currentPage
                            ? 'bg-amber-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </Link>
                    )
                  })}
                </div>

                {currentPage < totalPages && (
                  <Link
                    href={buildUrl(currentPage + 1, ratingFilter, sortBy)}
                    className="inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    →
                  </Link>
                )}
              </nav>
            )}

            {/* Page Info */}
            <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Showing {skip + 1}-{Math.min(skip + perPage, filteredCount)} of {filteredCount} reviews
              {ratingFilter && ` (${totalCount} total)`}
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-200 dark:border-amber-800/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to experience ItWhip?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Join thousands of satisfied guests renting unique cars from local owners.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition"
              >
                Browse Cars
              </Link>
              <Link
                href="/host/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                List Your Car
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
