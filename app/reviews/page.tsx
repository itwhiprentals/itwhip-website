// app/reviews/page.tsx
import { Metadata } from 'next'
import Script from 'next/script'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/app/lib/database/prisma'
import {
  IoStar,
  IoStarOutline,
  IoCheckmarkCircleOutline,
  IoCarOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoPersonCircleOutline
} from 'react-icons/io5'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

// Revalidate every hour
export const revalidate = 3600

// Generate SEO metadata
export async function generateMetadata(): Promise<Metadata> {
  const totalReviews = await prisma.rentalReview.count({
    where: { isVisible: true }
  })

  return {
    title: `${totalReviews} Guest Reviews | ItWhip - Peer to Peer Car Rental Arizona`,
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

// Helper to generate car URL
function generateCarUrl(car: { id: string; make: string; model: string; year: number; city?: string }): string {
  const slug = `${car.year}-${car.make}-${car.model}-${car.city || 'phoenix'}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `/rentals/${slug}-${car.id}`
}

// Helper to format date
function formatDate(date: Date | string): string {
  const d = new Date(date)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getFullYear()}`
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

// Star rating component
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        star <= rating ? (
          <IoStar key={star} className="w-4 h-4 text-amber-500" />
        ) : (
          <IoStarOutline key={star} className="w-4 h-4 text-gray-300 dark:text-gray-600" />
        )
      ))}
    </div>
  )
}

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function ReviewsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const currentPage = parseInt(params.page || '1')
  const perPage = 20
  const skip = (currentPage - 1) * perPage

  // Fetch reviews with related data
  const [reviews, totalCount, stats] = await Promise.all([
    prisma.rentalReview.findMany({
      where: { isVisible: true },
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
            photos: {
              where: { isHero: true },
              take: 1,
              select: { url: true }
            }
          }
        },
        host: {
          select: {
            name: true,
            profilePhoto: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    }),
    prisma.rentalReview.count({
      where: { isVisible: true }
    }),
    prisma.rentalReview.aggregate({
      where: { isVisible: true },
      _avg: { rating: true },
    })
  ])

  const totalPages = Math.ceil(totalCount / perPage)
  const avgRating = stats._avg.rating?.toFixed(1) || '4.8'

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
          '@type': 'Thing',
          name: review.car ? `${review.car.year} ${review.car.make} ${review.car.model}` : 'Vehicle'
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

      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20">
        {/* Hero Section */}
        <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
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
                      <IoStar key={star} className="w-6 h-6 text-amber-500" />
                    ))}
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{avgRating}</span>
                  <span className="text-gray-500 dark:text-gray-400">average</span>
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">{totalCount}</span> verified reviews
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews List */}
        <section className="py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6"
                >
                  {/* Reviewer Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                      {review.reviewerProfile?.profilePhotoUrl ? (
                        <Image
                          src={review.reviewerProfile.profilePhotoUrl}
                          alt={review.reviewerProfile.name || 'Reviewer'}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <IoPersonCircleOutline className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {review.reviewerProfile?.name || 'Guest'}
                        </h3>
                        {review.reviewerProfile?.isVerified && (
                          <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                        {review.reviewerProfile?.city && (
                          <span>{review.reviewerProfile.city}, {review.reviewerProfile.state}</span>
                        )}
                        {review.reviewerProfile?.memberSince && (
                          <>
                            <span>•</span>
                            <span>Member since {formatDate(review.reviewerProfile.memberSince)}</span>
                          </>
                        )}
                        {review.reviewerProfile?.tripCount && review.reviewerProfile.tripCount > 0 && (
                          <>
                            <span>•</span>
                            <span>{review.reviewerProfile.tripCount} trips</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating and Date */}
                  <div className="flex items-center gap-3 mb-3">
                    <StarRating rating={review.rating} />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {getTimeAgo(review.createdAt)}
                    </span>
                    {review.isVerified && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                        <IoCheckmarkCircleOutline className="w-3 h-3" />
                        Verified Trip
                      </span>
                    )}
                  </div>

                  {/* Review Title */}
                  {review.title && (
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {review.title}
                    </h4>
                  )}

                  {/* Review Comment */}
                  {review.comment && (
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {review.comment}
                    </p>
                  )}

                  {/* Car Info */}
                  {review.car && (
                    <Link
                      href={generateCarUrl(review.car)}
                      className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400"
                    >
                      <IoCarOutline className="w-4 h-4" />
                      <span>{review.car.year} {review.car.make} {review.car.model}</span>
                    </Link>
                  )}

                  {/* Host Response */}
                  {review.hostResponse && (
                    <div className="mt-4 pl-4 border-l-2 border-amber-500 bg-amber-50 dark:bg-amber-900/10 rounded-r-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Response from {review.host?.name || 'Host'}
                        </span>
                        {review.hostRespondedAt && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {getTimeAgo(review.hostRespondedAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {review.hostResponse}
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-2">
                {currentPage > 1 && (
                  <Link
                    href={`/reviews?page=${currentPage - 1}`}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <IoChevronBackOutline className="w-4 h-4" />
                    Previous
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
                        href={`/reviews?page=${pageNum}`}
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
                    href={`/reviews?page=${currentPage + 1}`}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Next
                    <IoChevronForwardOutline className="w-4 h-4" />
                  </Link>
                )}
              </nav>
            )}

            {/* Page Info */}
            <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Showing {skip + 1}-{Math.min(skip + perPage, totalCount)} of {totalCount} reviews
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
