// app/sys-2847/fleet/edit/components/reviews/ReviewCard.tsx
'use client'

import { Review, formatDate } from './utils/reviewHelpers'

interface ReviewCardProps {
  review: Review
  onDelete: (reviewId: string) => void
  onEdit: (review: Review) => void
  onToggleVisibility: (review: Review) => void
  onTogglePin: (review: Review) => void
  onReply: (data: { review: Review, type: 'host' | 'support' }) => void
  onEditHelpfulCount: (review: Review) => void
}

export function ReviewCard({ 
  review, 
  onDelete, 
  onEdit, 
  onToggleVisibility, 
  onTogglePin, 
  onReply, 
  onEditHelpfulCount 
}: ReviewCardProps) {
  const reviewer = review.reviewerProfile || review.reviewer

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-start gap-3">
          {/* Profile Photo */}
          {reviewer?.profilePhotoUrl ? (
            <img 
              src={reviewer.profilePhotoUrl} 
              alt={reviewer.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {reviewer?.name?.charAt(0) || '?'}
              </span>
            </div>
          )}
          
          {/* Reviewer Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {reviewer?.name || 'Anonymous'}
              </span>
              
              {/* Status Badges */}
              {review.isPinned && (
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full">
                  📌 Pinned
                </span>
              )}
              {review.isVerified && (
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                  ✓ Verified
                </span>
              )}
              {!review.isVisible && (
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 text-xs rounded-full">
                  👁️ Hidden
                </span>
              )}
            </div>
            
            {/* Rating and Location */}
            <div className="flex items-center gap-3 mt-1">
              <StarRating rating={review.rating} />
              {reviewer && (reviewer as any).city && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {(reviewer as any).city}, {(reviewer as any).state || 'AZ'}
                </span>
              )}
              {review.helpfulCount > 0 && (
                <button
                  onClick={() => onEditHelpfulCount(review)}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  👍 {review.helpfulCount} helpful
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {review.helpfulCount === 0 && (
            <button
              onClick={() => onEditHelpfulCount(review)}
              className="text-amber-600 hover:text-amber-700 text-sm"
              title="Set helpful count"
            >
              Helpful
            </button>
          )}
          
          <button
            onClick={() => onTogglePin(review)}
            className="text-purple-600 hover:text-purple-700 text-sm"
            title={review.isPinned ? 'Unpin' : 'Pin to top'}
          >
            {review.isPinned ? 'Unpin' : 'Pin'}
          </button>
          
          <button
            onClick={() => onToggleVisibility(review)}
            className="text-gray-600 hover:text-gray-700 text-sm"
            title={review.isVisible ? 'Hide' : 'Show'}
          >
            {review.isVisible ? 'Hide' : 'Show'}
          </button>
          
          <button
            onClick={() => onEdit(review)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Edit
          </button>
          
          <button
            onClick={() => onDelete(review.id)}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
      
      {/* Review Title */}
      {review.title && (
        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
          {review.title}
        </h4>
      )}
      
      {/* Review Comment */}
      <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
      
      {/* Trip Dates */}
      {review.tripStartDate && review.tripEndDate && (
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span>
            Trip: {formatDate(review.tripStartDate)} - {formatDate(review.tripEndDate)}
          </span>
          <span>
            Posted: {formatDate(review.createdAt)}
          </span>
        </div>
      )}
      
      {/* Host Response */}
      {review.hostResponse && (
        <div className="mt-3 pl-4 border-l-2 border-blue-400">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Host Response
            </p>
            {review.hostRespondedAt && (
              <p className="text-xs text-gray-500">
                {formatDate(review.hostRespondedAt)}
              </p>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{review.hostResponse}</p>
        </div>
      )}
      
      {/* Support Response */}
      {review.supportResponse && (
        <div className="mt-3 pl-4 border-l-2 border-green-400">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              ItWhip Support
            </p>
            {review.supportRespondedAt && (
              <p className="text-xs text-gray-500">
                {formatDate(review.supportRespondedAt)}
              </p>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{review.supportResponse}</p>
          {review.supportRespondedBy && (
            <p className="text-xs text-gray-500 mt-1">
              — {review.supportRespondedBy}
            </p>
          )}
        </div>
      )}
      
      {/* Reply Buttons */}
      <div className="mt-3 flex gap-2">
        {!review.hostResponse && (
          <button
            onClick={() => onReply({ review, type: 'host' })}
            className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reply as Host
          </button>
        )}
        {!review.supportResponse && (
          <button
            onClick={() => onReply({ review, type: 'support' })}
            className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Reply as Support
          </button>
        )}
      </div>
    </div>
  )
}

// Helper component for star rating display
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <svg 
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}