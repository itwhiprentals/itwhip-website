// app/(guest)/rentals/components/review/GuestReviewDisplay.tsx

'use client'

import { 
  IoStar,
  IoCheckmarkCircle,
  IoCalendarOutline,
  IoCarOutline,
  IoPersonCircleOutline,
  IoShieldCheckmarkOutline,
  IoInformationCircle,
  IoChatbubbleOutline
} from 'react-icons/io5'

interface GuestReviewDisplayProps {
  review: {
    id: string
    rating: number
    cleanliness?: number
    accuracy?: number
    communication?: number
    convenience?: number
    value?: number
    title?: string
    comment: string
    helpfulCount: number
    isVerified: boolean
    tripStartDate?: string
    tripEndDate?: string
    createdAt: string
    hostResponse?: string
    hostRespondedAt?: string
    supportResponse?: string
    supportRespondedAt?: string
    supportRespondedBy?: string
    reviewerProfile?: {
      name: string
      profilePhotoUrl?: string
      city: string
      state: string
    }
    car: {
      make: string
      model: string
      year: number
    }
    host: {
      name: string
      profilePhoto?: string
    }
  }
  onClose: () => void
}

export default function GuestReviewDisplay({ review, onClose }: GuestReviewDisplayProps) {
  // Category ratings data
  const categoryRatings = [
    { key: 'cleanliness', label: 'Cleanliness', value: review.cleanliness },
    { key: 'accuracy', label: 'Accuracy', value: review.accuracy },
    { key: 'communication', label: 'Communication', value: review.communication },
    { key: 'convenience', label: 'Convenience', value: review.convenience },
    { key: 'value', label: 'Value', value: review.value }
  ].filter(cat => cat.value !== null && cat.value !== undefined)

  // Star rating component
  const StarRating = ({ rating, size = 'normal' }: { rating: number; size?: 'small' | 'normal' }) => {
    const starClass = size === 'small' ? 'w-3 h-3' : 'w-4 h-4'
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <IoStar
            key={i}
            className={`${starClass} ${
              i < rating ? 'text-amber-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Review Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-start gap-4">
          {/* Reviewer Photo */}
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-300 dark:bg-gray-600">
            {review.reviewerProfile?.profilePhotoUrl ? (
              <img
                src={review.reviewerProfile.profilePhotoUrl}
                alt={review.reviewerProfile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <IoPersonCircleOutline className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Reviewer Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {review.reviewerProfile?.name || 'You'}
              </h3>
              {review.isVerified && (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <IoCheckmarkCircle className="w-3.5 h-3.5" />
                  Verified Trip
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <StarRating rating={review.rating} />
              <span>•</span>
              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Details */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <IoCarOutline className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {review.car.year} {review.car.make} {review.car.model}
          </span>
        </div>
        {review.tripStartDate && review.tripEndDate && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <IoCalendarOutline className="w-4 h-4" />
            <span>
              {new Date(review.tripStartDate).toLocaleDateString()} - {new Date(review.tripEndDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Review Content */}
      <div>
        {review.title && (
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            {review.title}
          </h4>
        )}
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
          {review.comment}
        </p>
      </div>

      {/* Category Ratings (if any) */}
      {categoryRatings.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Detailed Ratings
          </h4>
          <div className="space-y-2">
            {categoryRatings.map((category) => (
              <div key={category.key} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {category.label}
                </span>
                <StarRating rating={category.value!} size="small" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Host Response */}
      {review.hostResponse && (
        <div className="border-l-4 border-blue-400 pl-4 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg p-4">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-blue-100 dark:bg-blue-900">
              {(review.host?.partnerLogo || review.host?.profilePhoto) ? (
                <img
                  src={review.host.partnerLogo || review.host.profilePhoto}
                  alt={review.host.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <IoPersonCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  {review.host?.name} (Host)
                </span>
                {review.hostRespondedAt && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    • {new Date(review.hostRespondedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {review.hostResponse}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Support Response */}
      {review.supportResponse && (
        <div className="border-l-4 border-green-400 pl-4 bg-green-50 dark:bg-green-900/20 rounded-r-lg p-4">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
              <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-green-900 dark:text-green-300">
                  ItWhip Support
                </span>
                {review.supportRespondedAt && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    • {new Date(review.supportRespondedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {review.supportResponse}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Helpful Count */}
      {review.helpfulCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <IoChatbubbleOutline className="w-4 h-4" />
          <span>{review.helpfulCount} {review.helpfulCount === 1 ? 'person' : 'people'} found this helpful</span>
        </div>
      )}

      {/* Information Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-2">
          <IoInformationCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
            <p>
              <strong>Your review is public</strong> and helps other guests make informed decisions.
            </p>
            <p>
              Reviews cannot be edited after submission. If you need to update or remove your review due to special circumstances, please contact our support team.
            </p>
            <a 
              href="/support" 
              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>

      {/* Close Button */}
      <div className="pt-4">
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}