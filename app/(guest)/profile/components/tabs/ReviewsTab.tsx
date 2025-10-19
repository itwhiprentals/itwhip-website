// app/(guest)/profile/components/tabs/ReviewsTab.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  IoStarOutline, 
  IoStar,
  IoCarOutline,
  IoCalendarOutline,
  IoInformationCircleOutline,
  IoChatbubbleOutline,
  IoPersonOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoChevronForwardOutline
} from 'react-icons/io5'

interface Review {
  id: string
  bookingCode: string
  bookingId: string
  rating: number
  comment: string
  hostResponse?: string
  hostRespondedAt?: string
  guestReviewComment?: string
  guestReviewRating?: number
  supportResponse?: string
  supportRespondedAt?: string
  hostName: string
  carMake: string
  carModel: string
  carYear: number
  tripStartDate: string
  tripEndDate: string
  createdAt: string
}

// Helper function to calculate time ago
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return '1 day ago'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 14) return '1 week ago'
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  }
  if (diffInDays < 60) return '1 month ago'
  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30)
    return `${months} month${months === 1 ? '' : 's'} ago`
  }
  const years = Math.floor(diffInDays / 365)
  return `${years} year${years === 1 ? '' : 's'} ago`
}

export default function ReviewsTab() {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/guest/reviews', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
        setAverageRating(data.averageRating || 0)
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookingClick = (bookingId: string) => {
    router.push(`/rentals/dashboard/bookings/${bookingId}`)
  }

  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-3.5 h-3.5 sm:w-4 sm:h-4' : 'w-4.5 h-4.5 sm:w-5 sm:h-5'
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star}>
            {star <= rating ? (
              <IoStar className={`${sizeClass} text-amber-500`} />
            ) : (
              <IoStarOutline className={`${sizeClass} text-gray-300 dark:text-gray-600`} />
            )}
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading your reviews...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="mb-5 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Trip Reviews</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Complete review history from your rentals
        </p>
      </div>

      {/* Average Rating Summary */}
      {reviews.length > 0 && (
        <div className="mb-5 sm:mb-6 p-4 sm:p-5 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="text-center flex-shrink-0">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1.5">
                {averageRating.toFixed(1)}
              </div>
              {renderStars(Math.round(averageRating), 'sm')}
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1.5 font-medium">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            <div className="flex-1 border-l-2 border-yellow-200 dark:border-yellow-700 pl-4 sm:pl-5">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1">
                Overall Rating
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Your average rating from hosts. Keep it high by being a respectful guest, 
                returning cars on time and in good condition.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4 mb-5 sm:mb-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Trip Header - Clickable */}
              <button
                onClick={() => handleBookingClick(review.bookingId)}
                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-colors text-left"
              >
                <div className="flex items-start sm:items-center justify-between gap-3">
                  {/* Left Side - Car Info */}
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                      <IoCarOutline className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      {/* Car Name & Code */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mb-1.5">
                        <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
                          {review.carYear} {review.carMake} {review.carModel}
                        </span>
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                          #{review.bookingCode}
                        </span>
                      </div>
                      
                      {/* Dates & Time Ago Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <IoCalendarOutline className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">
                            {new Date(review.tripStartDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric'
                            })} - {new Date(review.tripEndDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <IoTimeOutline className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="font-medium">{getTimeAgo(review.tripEndDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Arrow */}
                  <IoChevronForwardOutline className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1 sm:mt-0" />
                </div>
              </button>

              {/* Reviews Content */}
              <div className="p-4 space-y-3">
                {/* Your Review */}
                {review.guestReviewComment && (
                  <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3.5 border border-blue-100 dark:border-blue-900">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wide">
                        Your Review
                      </span>
                      {review.guestReviewRating && (
                        <div className="flex-shrink-0">
                          {renderStars(review.guestReviewRating, 'sm')}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {review.guestReviewComment}
                    </p>
                  </div>
                )}

                {/* Host Review */}
                {review.comment && (
                  <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-3.5 border border-green-100 dark:border-green-900">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <IoPersonOutline className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-xs font-bold text-green-900 dark:text-green-300 uppercase tracking-wide truncate">
                          {review.hostName}'s Review
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        {renderStars(review.rating, 'sm')}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                )}

                {/* Show message if no reviews exist yet for this trip */}
                {!review.guestReviewComment && !review.comment && (
                  <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                    No reviews available for this trip yet
                  </div>
                )}

                {/* Responses Section */}
                {(review.hostResponse || review.supportResponse) && (
                  <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3.5 space-y-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <IoChatbubbleOutline className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        Responses
                      </span>
                    </div>

                    {/* Host Response */}
                    {review.hostResponse && (
                      <div className="pl-3 border-l-2 border-purple-300 dark:border-purple-700">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
                          <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">
                            {review.hostName}
                          </span>
                          {review.hostRespondedAt && (
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {new Date(review.hostRespondedAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {review.hostResponse}
                        </p>
                      </div>
                    )}

                    {/* Support Response */}
                    {review.supportResponse && (
                      <div className="pl-3 border-l-2 border-amber-300 dark:border-amber-700">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
                          <div className="flex items-center gap-1">
                            <IoCheckmarkCircleOutline className="w-3 h-3 text-amber-600 dark:text-amber-500" />
                            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                              Support Team
                            </span>
                          </div>
                          {review.supportRespondedAt && (
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {new Date(review.supportRespondedAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {review.supportResponse}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 sm:py-16 px-4 mb-5 sm:mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <IoStarOutline className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
            No Reviews Yet
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
            Complete your first trip to receive reviews. Reviews help build trust with future hosts.
          </p>
          <button
            onClick={() => window.location.href = '/rentals/search'}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <IoCarOutline className="w-4 h-4" />
            Browse Available Cars
          </button>
        </div>
      )}

      {/* Tips Section */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <IoInformationCircleOutline className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300 mb-2">
              Tips for 5-Star Reviews
            </h4>
            <ul className="space-y-1 text-xs sm:text-sm text-amber-800 dark:text-amber-400">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5 flex-shrink-0">•</span>
                <span>Return vehicles clean and with the same fuel level</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5 flex-shrink-0">•</span>
                <span>Communicate pickup/drop-off times clearly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5 flex-shrink-0">•</span>
                <span>Follow all guidelines and local traffic laws</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5 flex-shrink-0">•</span>
                <span>Report any issues immediately with photos</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}