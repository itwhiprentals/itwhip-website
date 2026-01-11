// app/rideshare/components/PartnerReviews.tsx
// Customer reviews and testimonials section

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IoStar, IoStarHalf, IoStarOutline, IoPersonCircle, IoChevronDown, IoChevronUp, IoChatbubbleOutline } from 'react-icons/io5'
import GuestProfileSheet from '@/app/reviews/components/GuestProfileSheet'
import { generateCarUrl } from '@/app/lib/utils/urls'

interface ReviewCar {
  id: string
  make: string
  model: string
  year: number
  city: string
}

interface Review {
  id: string
  reviewerName: string
  reviewerProfileId?: string | null
  reviewerPhoto?: string | null
  rating: number
  comment: string
  date: string
  car?: ReviewCar | null
  helpful?: number
  hostResponse?: string | null
  hostRespondedAt?: string | null
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

// Format relative date for host response
function formatResponseDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PartnerReviews({
  reviews,
  avgRating = 0,
  totalReviews = 0,
  companyName = 'This Partner'
}: PartnerReviewsProps) {
  const [showAll, setShowAll] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<{
    id: string
    name: string | null
    profilePhotoUrl: string | null
    memberSince: null
    tripCount: null
    isVerified: null
    city: null
    state: null
  } | null>(null)

  const hasReviews = reviews && reviews.length > 0
  const displayReviews = hasReviews ? reviews : PLACEHOLDER_REVIEWS
  const visibleReviews = showAll ? displayReviews : displayReviews.slice(0, 3)

  // Handle guest profile click
  const handleGuestClick = (review: Review) => {
    if (review.reviewerProfileId) {
      setSelectedGuest({
        id: review.reviewerProfileId,
        name: review.reviewerName,
        profilePhotoUrl: review.reviewerPhoto || null,
        memberSince: null,
        tripCount: null,
        isVerified: null,
        city: null,
        state: null
      })
    }
  }

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
                {/* Reviewer Avatar - Clickable to open profile */}
                <button
                  onClick={() => handleGuestClick(review)}
                  className={`flex-shrink-0 ${review.reviewerProfileId ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-default'}`}
                  disabled={!review.reviewerProfileId}
                >
                  {review.reviewerPhoto ? (
                    <img
                      src={review.reviewerPhoto}
                      alt={review.reviewerName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <IoPersonCircle className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                  )}
                </button>

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    {/* Reviewer Name - Clickable */}
                    <button
                      onClick={() => handleGuestClick(review)}
                      className={`text-sm font-medium text-gray-900 dark:text-white ${
                        review.reviewerProfileId ? 'hover:text-orange-600 dark:hover:text-orange-400 transition-colors' : ''
                      }`}
                      disabled={!review.reviewerProfileId}
                    >
                      {review.reviewerName}
                    </button>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(review.date)}
                    </span>
                  </div>

                  {hasReviews && (
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <StarRating rating={review.rating} />
                      {/* Car Link - Clickable */}
                      {review.car && (
                        <Link
                          href={generateCarUrl(review.car)}
                          className="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                        >
                          • {review.car.year} {review.car.make} {review.car.model}
                        </Link>
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

                  {/* Host Response */}
                  {review.hostResponse && (
                    <div className="mt-3 pl-3 border-l-2 border-blue-400 bg-blue-50 dark:bg-blue-900/20 py-2 pr-2 rounded-r-lg">
                      <div className="flex items-center gap-1.5 mb-1">
                        <IoChatbubbleOutline className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          Response from {companyName}
                        </span>
                        {review.hostRespondedAt && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            • {formatResponseDate(review.hostRespondedAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {review.hostResponse}
                      </p>
                    </div>
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

      {/* Guest Profile Sheet */}
      <GuestProfileSheet
        isOpen={!!selectedGuest}
        onClose={() => setSelectedGuest(null)}
        guest={selectedGuest}
      />
    </section>
  )
}
