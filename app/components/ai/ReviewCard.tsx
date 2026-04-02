'use client'

import { useState } from 'react'
import { IoStar, IoStarOutline, IoClose, IoChevronDown, IoChevronUp, IoThumbsUp } from 'react-icons/io5'

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string
  reviewerName: string
  reviewerPhoto: string | null
  reviewerCity: string
  createdAt: string
  helpfulCount: number
}

interface ReviewCardProps {
  carName: string
  rating: number
  reviewCount: number
  reviews: Review[]
  onDismiss?: () => void
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        i <= rating
          ? <IoStar key={i} style={{ fontSize: size }} className="text-amber-400" />
          : <IoStarOutline key={i} style={{ fontSize: size }} className="text-gray-300 dark:text-gray-600" />
      ))}
    </div>
  )
}

export default function ReviewCard({ carName, rating, reviewCount, reviews, onDismiss }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false)
  const visibleReviews = expanded ? reviews : reviews.slice(0, 3)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/30">
        <div>
          <div className="flex items-center gap-2">
            <Stars rating={Math.round(rating)} size={16} />
            <span className="text-sm font-bold text-gray-900 dark:text-white">{rating.toFixed(1)}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              · {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 font-medium">
            {carName.replace(/^(\d{4})\s+(\S+)\s+/, '$1 $2 — ')}
          </p>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <IoClose className="text-lg" />
          </button>
        )}
      </div>

      {/* Reviews */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {visibleReviews.map(review => (
          <div key={review.id} className="px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {review.reviewerPhoto ? (
                  <img src={review.reviewerPhoto} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                      {review.reviewerName.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">{review.reviewerName}</span>
                  {review.reviewerCity && (
                    <span className="text-xs text-gray-400 ml-1.5">{review.reviewerCity}</span>
                  )}
                </div>
              </div>
              <Stars rating={review.rating} size={12} />
            </div>

            {review.title && (
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1.5">{review.title}</p>
            )}
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed line-clamp-3">
              {review.comment}
            </p>

            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs text-gray-400">
                {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              {review.helpfulCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <IoThumbsUp className="text-xs" /> {review.helpfulCount}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Show more / less */}
      {reviews.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 flex items-center justify-center gap-1 border-t border-gray-100 dark:border-gray-700"
        >
          {expanded ? (
            <>Show less <IoChevronUp /></>
          ) : (
            <>Show all {reviews.length} reviews <IoChevronDown /></>
          )}
        </button>
      )}
    </div>
  )
}
