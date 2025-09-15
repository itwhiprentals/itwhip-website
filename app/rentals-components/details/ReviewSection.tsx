// app/(guest)/rentals/components/details/ReviewSection.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { 
  IoStarOutline, 
  IoStar,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoCheckmarkCircleOutline,
  IoCarOutline,
  IoThumbsUpOutline,
  IoPersonCircleOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoCloseOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5'

interface ReviewerProfile {
  id: string
  name: string
  profilePhotoUrl?: string
  location: string
  memberSince: string
  tripCount: number
  reviewCount: number
  isVerified: boolean
  stats?: {
    totalReviews: number
    averageRating: number
    membershipDuration: number
  }
  recentReviews?: Array<{
    id: string
    rating: number
    comment: string
    createdAt: string
    car: {
      id: string
      displayName: string
      photoUrl?: string
    }
  }>
}

interface Review {
  id: string
  rating: number
  title?: string
  comment: string
  helpfulCount: number
  isVerified: boolean
  isPinned: boolean
  hostResponse?: string
  hostRespondedAt?: string
  supportResponse?: string
  supportRespondedAt?: string
  supportRespondedBy?: string
  tripStartDate?: string
  tripEndDate?: string
  createdAt: string
  reviewer: {
    id?: string
    name: string
    profilePhotoUrl?: string
    city: string
    state: string
    memberSince: string
    tripCount: number
    reviewCount: number
    isVerified: boolean
  }
  host?: {
    name: string
    profilePhoto?: string
  }
}

interface ReviewSectionProps {
  carId: string
  reviews?: any[]
}

// Helper function to ensure all 5 ratings are represented
function createFullDistribution(distribution: any[]) {
  const fullDist = [5, 4, 3, 2, 1].map(rating => {
    const existing = distribution.find(d => d.rating === rating)
    return existing || { rating, count: 0, percentage: 0 }
  })
  return fullDist
}

// Helper function to sort reviews by date (newest month first)
function sortReviewsByMonth(reviews: Review[]) {
  return [...reviews].sort((a, b) => {
    const dateA = new Date(a.createdAt)
    const dateB = new Date(b.createdAt)
    return dateB.getTime() - dateA.getTime()
  })
}

export default function ReviewSection({ carId, reviews = [] }: ReviewSectionProps) {
  const [expandedReviews, setExpandedReviews] = useState<string[]>([])
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reviewData, setReviewData] = useState<Review[]>([])
  const [stats, setStats] = useState<any>(null)
  const [selectedReviewer, setSelectedReviewer] = useState<ReviewerProfile | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [helpfulClicked, setHelpfulClicked] = useState<Set<string>>(new Set())
  
  useEffect(() => {
    fetchReviews()
  }, [carId])
  
  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/rentals/cars/${carId}/reviews`)
      if (response.ok) {
        const data = await response.json()
        // Sort reviews by month (newest first)
        const sortedReviews = sortReviewsByMonth(data.data.reviews || [])
        setReviewData(sortedReviews)
        
        // Ensure distribution has all 5 ratings
        if (data.data.stats) {
          const fullDistribution = createFullDistribution(data.data.stats.distribution || [])
          setStats({
            ...data.data.stats,
            distribution: fullDistribution
          })
        } else {
          setStats(null)
        }
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const toggleReviewExpansion = (reviewId: string) => {
    setExpandedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    )
  }
  
  const handleHelpfulClick = async (reviewId: string) => {
    if (helpfulClicked.has(reviewId)) return
    
    try {
      const response = await fetch(`/api/rentals/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'guest-session' })
      })
      
      if (response.ok) {
        setHelpfulClicked(prev => new Set(prev).add(reviewId))
        // Update local count
        setReviewData(prev => prev.map(review => 
          review.id === reviewId 
            ? { ...review, helpfulCount: review.helpfulCount + 1 }
            : review
        ))
      }
    } catch (error) {
      console.error('Failed to mark helpful:', error)
    }
  }
  
  const handleReviewerClick = async (reviewerId: string) => {
    if (!reviewerId) return
    
    try {
      const response = await fetch(`/api/rentals/reviewers/${reviewerId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedReviewer(data.data)
        setShowProfileModal(true)
      }
    } catch (error) {
      console.error('Failed to fetch reviewer profile:', error)
    }
  }
  
  const displayedReviews = showAllReviews ? reviewData : reviewData.slice(0, 3)

  if (loading) {
    return <ReviewSkeleton />
  }

  if (reviewData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Guest Reviews
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          No reviews yet. Be the first to book and review this car!
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        {/* Reviews Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Guest Reviews
              </h2>
              {stats && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <IoStar className="w-5 h-5 text-amber-400 fill-current" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                    </span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    ({stats.total} {stats.total === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}
            </div>
            
            {/* Rating Distribution - Now shows all 5 bars */}
            {stats && (
              <div className="space-y-1 min-w-[200px]">
                {stats.distribution.map(({ rating, count, percentage }: any) => (
                  <div key={rating} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600 dark:text-gray-400 w-3">{rating}</span>
                    <IoStar className="w-3 h-3 text-amber-400 fill-current" />
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage || 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-8">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Reviews List */}
        <div className="p-6">
          <div className="flex gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-1 sm:gap-3 sm:overflow-x-visible scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {displayedReviews.map((review) => {
              const isExpanded = expandedReviews.includes(review.id)
              const hasLongComment = review.comment && review.comment.length > 200
              const displayComment = isExpanded || !hasLongComment 
                ? review.comment 
                : review.comment.substring(0, 200) + '...'
              
              return (
                <div
                  key={review.id}
                  className="flex-shrink-0 w-[280px] sm:w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Reviewer Header with Fixed Circular Image */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-300 dark:bg-gray-600">
                      {review.reviewer.profilePhotoUrl ? (
                        <img
                          src={review.reviewer.profilePhotoUrl}
                          alt={review.reviewer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <IoPersonCircleOutline className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => review.reviewer.id && handleReviewerClick(review.reviewer.id)}
                          className="text-sm font-semibold text-gray-900 dark:text-white hover:text-amber-600 transition-colors"
                        >
                          {review.reviewer.name}
                        </button>
                        {review.isVerified && (
                          <IoCheckmarkCircleOutline className="w-3.5 h-3.5 text-green-600" />
                        )}
                        {review.isPinned && (
                          <span className="text-xs text-purple-600">📌</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <IoStar
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString('en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Review Content */}
                  <div className="mb-3">
                    {review.title && (
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {review.title}
                      </h4>
                    )}
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {displayComment}
                    </p>
                    {hasLongComment && (
                      <button
                        onClick={() => toggleReviewExpansion(review.id)}
                        className="text-xs font-medium text-amber-600 hover:text-amber-700 mt-2 flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            Show less
                            <IoChevronUpOutline className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            Read more
                            <IoChevronDownOutline className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  {/* Host Response with Fixed Circular Profile Photo */}
                  {review.hostResponse && (
                    <div className="mb-3 pl-3 border-l-2 border-blue-400">
                      <div className="flex items-start gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-blue-100 dark:bg-blue-900">
                          {review.host?.profilePhoto ? (
                            <img
                              src={review.host.profilePhoto}
                              alt="Host"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <IoPersonCircleOutline className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              {review.host?.name ? review.host.name.split(' ')[0] : 'Host'} (Host Response)
                            </p>
                            {review.hostRespondedAt && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                • {new Date(review.hostRespondedAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: new Date(review.hostRespondedAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                                })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {review.hostResponse}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Support Response */}
                  {review.supportResponse && (
                    <div className="mb-3 pl-3 border-l-2 border-green-400">
                      <div className="flex items-start gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                          <IoShieldCheckmarkOutline className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-medium text-green-600 dark:text-green-400">
                              ItWhip Support
                            </p>
                            {review.supportRespondedAt && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                • {new Date(review.supportRespondedAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: new Date(review.supportRespondedAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                                })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {review.supportResponse}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Review Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      {review.tripStartDate && review.tripEndDate && (
                        <>
                          <IoCarOutline className="w-3.5 h-3.5" />
                          <span>
                            {new Date(review.tripStartDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })} - {new Date(review.tripEndDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </>
                      )}
                    </div>
                    <button 
                      onClick={() => handleHelpfulClick(review.id)}
                      disabled={helpfulClicked.has(review.id)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
                        helpfulClicked.has(review.id)
                          ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <IoThumbsUpOutline className="w-3.5 h-3.5" />
                      <span>
                        {helpfulClicked.has(review.id) ? 'Thanks!' : `Helpful (${review.helpfulCount})`}
                      </span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Show More/Less Reviews */}
          {reviewData.length > 3 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20"
              >
                {showAllReviews ? (
                  <>
                    Show less
                    <IoChevronUpOutline className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Show all {reviewData.length} reviews
                    <IoChevronDownOutline className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviewer Profile Modal with Support Response Display */}
      {showProfileModal && selectedReviewer && (
        <ReviewerProfileModal
          reviewer={selectedReviewer}
          onClose={() => {
            setShowProfileModal(false)
            setSelectedReviewer(null)
          }}
        />
      )}
    </>
  )
}

// Reviewer Profile Modal Component
function ReviewerProfileModal({ reviewer, onClose }: { reviewer: ReviewerProfile; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <IoCloseOutline className="w-6 h-6" />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 bg-gray-300 dark:bg-gray-600">
            {reviewer.profilePhotoUrl ? (
              <img
                src={reviewer.profilePhotoUrl}
                alt={reviewer.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <IoPersonCircleOutline className="w-12 h-12 text-gray-500 dark:text-gray-400" />
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {reviewer.name}
          </h3>
          
          {reviewer.isVerified && (
            <div className="flex items-center justify-center gap-1 mt-1">
              <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">Verified</span>
            </div>
          )}
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <IoLocationOutline className="w-4 h-4" />
            <span>{reviewer.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <IoCalendarOutline className="w-4 h-4" />
            <span>
              Member since {new Date(reviewer.memberSince).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {reviewer.tripCount}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Trips
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {reviewer.reviewCount}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Reviews
            </div>
          </div>
        </div>
        
        {reviewer.recentReviews && reviewer.recentReviews.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Recent Reviews
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {reviewer.recentReviews.map(review => (
                <div key={review.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {review.car.displayName}
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <IoStar
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Loading Skeleton Component
function ReviewSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}