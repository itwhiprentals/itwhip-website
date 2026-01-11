// app/rideshare/components/PartnerReviews.tsx
// Customer reviews and testimonials section

'use client'

import { useState } from 'react'
import { IoStar, IoStarHalf, IoStarOutline, IoPersonCircle, IoChevronDown, IoChevronUp } from 'react-icons/io5'

interface Review {
  id: string
  reviewerName: string
  reviewerPhoto?: string | null
  rating: number
  comment: string
  date: string
  vehicleRented?: string | null
  helpful?: number
}

interface PartnerReviewsProps {
  reviews?: Review[] | null
  avgRating?: number
  totalReviews?: number
  companyName?: string
}

// Star rating component
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'
  const stars = []

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<IoStar key={i} className={`${sizeClass} text-yellow-400`} />)
    } else if (rating >= i - 0.5) {
      stars.push(<IoStarHalf key={i} className={`${sizeClass} text-yellow-400`} />)
    } else {
      stars.push(<IoStarOutline key={i} className={`${sizeClass} text-gray-400 dark:text-gray-500`} />)
    }
  }

  return <div className="flex items-center gap-0.5">{stars}</div>
}

// Format date to relative time
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

// Placeholder reviews when none exist
const PLACEHOLDER_REVIEWS: Review[] = [
  {
    id: 'placeholder-1',
    reviewerName: 'Be the First',
    rating: 0,
    comment: 'No reviews yet. Book with this partner and share your experience!',
    date: new Date().toISOString()
  }
]

export default function PartnerReviews({
  reviews,
  avgRating = 0,
  totalReviews = 0,
  companyName = 'This Partner'
}: PartnerReviewsProps) {
  const [showAll, setShowAll] = useState(false)

  const hasReviews = reviews && reviews.length > 0
  const displayReviews = hasReviews ? reviews : PLACEHOLDER_REVIEWS
  const visibleReviews = showAll ? displayReviews : displayReviews.slice(0, 3)

  // Calculate rating distribution (mock for now, would come from API)
  const ratingDistribution = hasReviews ? {
    5: Math.round((reviews.filter(r => r.rating >= 4.5).length / reviews.length) * 100) || 0,
    4: Math.round((reviews.filter(r => r.rating >= 3.5 && r.rating < 4.5).length / reviews.length) * 100) || 0,
    3: Math.round((reviews.filter(r => r.rating >= 2.5 && r.rating < 3.5).length / reviews.length) * 100) || 0,
    2: Math.round((reviews.filter(r => r.rating >= 1.5 && r.rating < 2.5).length / reviews.length) * 100) || 0,
    1: Math.round((reviews.filter(r => r.rating < 1.5).length / reviews.length) * 100) || 0,
  } : { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

  return (
    <section className="py-6 sm:py-8 mt-6 sm:mt-8">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Customer Reviews
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          — {hasReviews ? `${totalReviews} verified reviews` : 'What our customers say'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Summary */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-5 shadow-sm">
          <div className="text-center mb-4">
            {hasReviews ? (
              <>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  {avgRating.toFixed(1)}
                </div>
                <StarRating rating={avgRating} size="md" />
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Based on {totalReviews} reviews
                </p>
              </>
            ) : (
              <>
                <div className="text-4xl font-bold text-gray-400 dark:text-gray-500 mb-1">
                  —
                </div>
                <StarRating rating={0} size="md" />
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  No reviews yet
                </p>
              </>
            )}
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-300 w-3">{star}</span>
                <IoStar className="w-3 h-3 text-yellow-400" />
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${ratingDistribution[star as keyof typeof ratingDistribution]}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 w-8">
                  {ratingDistribution[star as keyof typeof ratingDistribution]}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          {visibleReviews.map((review) => (
            <div
              key={review.id}
              className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm ${
                !hasReviews ? 'opacity-70' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Reviewer Avatar */}
                <div className="flex-shrink-0">
                  {review.reviewerPhoto ? (
                    <img
                      src={review.reviewerPhoto}
                      alt={review.reviewerName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <IoPersonCircle className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                  )}
                </div>

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {review.reviewerName}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(review.date)}
                    </span>
                  </div>

                  {hasReviews && (
                    <div className="flex items-center gap-2 mb-2">
                      <StarRating rating={review.rating} />
                      {review.vehicleRented && (
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          • {review.vehicleRented}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    {review.comment}
                  </p>

                  {review.helpful !== undefined && review.helpful > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {review.helpful} people found this helpful
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Show More/Less Button */}
          {displayReviews.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
            >
              {showAll ? (
                <>
                  Show Less <IoChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Show All {displayReviews.length} Reviews <IoChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {/* CTA for no reviews */}
          {!hasReviews && (
            <div className="text-center py-2 sm:py-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                Be the first to review {companyName}
              </p>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Reviews appear after completing a rental
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
