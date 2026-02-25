// app/(guest)/rentals/components/details/ReviewSection.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import ReviewerProfileModal from './ReviewerProfileModal'
import { getFirstNameOnly, formatReviewerName } from '@/app/lib/utils/namePrivacy'
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
  IoShieldCheckmarkOutline,
  IoChevronForwardOutline,
  IoChevronBackOutline,
  IoBusinessOutline,
  IoPersonOutline,
  IoChatbubblesOutline
} from 'react-icons/io5'

interface ReviewerProfile {
  id: string
  name: string
  profilePhotoUrl?: string
  location?: string
  city: string
  state: string
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
      make: string
      model: string
      year: number
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

// Helper function to calculate time ago — accepts t() for i18n
function getTimeAgo(dateString: string, t: (key: string, values?: Record<string, number>) => string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    return t('timeAgoToday')
  } else if (diffInDays === 1) {
    return t('timeAgoYesterday')
  } else if (diffInDays < 7) {
    return t('timeAgoDays', { count: diffInDays })
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return t('timeAgoWeeks', { count: weeks })
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30)
    return t('timeAgoMonths', { count: months })
  } else {
    const years = Math.floor(diffInDays / 365)
    return t('timeAgoYears', { count: years })
  }
}

// Helper function to ensure all 5 ratings are represented
function createFullDistribution(distribution: any[]) {
  const fullDist = [5, 4, 3, 2, 1].map(rating => {
    const existing = distribution.find(d => d.rating === rating)
    return existing || { rating, count: 0, percentage: 0 }
  })
  return fullDist
}

// Helper function to sort reviews by date (newest first)
function sortReviewsByMonth(reviews: Review[]) {
  return [...reviews].sort((a, b) => {
    const dateA = new Date(a.createdAt)
    const dateB = new Date(b.createdAt)
    return dateB.getTime() - dateA.getTime()
  })
}

export default function ReviewSection({ carId, reviews = [] }: ReviewSectionProps) {
  const t = useTranslations('ReviewSection')
  const locale = useLocale()
  const [expandedReviews, setExpandedReviews] = useState<string[]>([])
  const [expandedResponses, setExpandedResponses] = useState<string[]>([])
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reviewData, setReviewData] = useState<Review[]>([])
  const [stats, setStats] = useState<any>(null)
  const [selectedReviewer, setSelectedReviewer] = useState<ReviewerProfile | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [helpfulClicked, setHelpfulClicked] = useState<Set<string>>(new Set())
  const [scrollPosition, setScrollPosition] = useState(0)
  
  useEffect(() => {
    fetchReviews()
  }, [carId])
  
  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/rentals/cars/${carId}/reviews?limit=999999`)
      if (response.ok) {
        const data = await response.json()
        // Sort reviews by date (newest first)
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

  const toggleResponseExpansion = (reviewId: string) => {
    setExpandedResponses(prev => 
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
        // Format the data to match ReviewerProfileModal expectations
        const formattedData: ReviewerProfile = {
          ...data.data,
          location: `${data.data.city}, ${data.data.state}` // Add location field for compatibility
        }
        setSelectedReviewer(formattedData)
        setShowProfileModal(true)
      }
    } catch (error) {
      console.error('Failed to fetch reviewer profile:', error)
    }
  }

  // Scroll handlers for horizontal navigation
  const scrollContainer = (direction: 'left' | 'right') => {
    const container = document.getElementById('reviews-container')
    if (container) {
      const scrollAmount = 300
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const hasResponses = (review: Review) => {
    return review.hostResponse || review.supportResponse
  }

  const countResponses = (review: Review) => {
    let count = 0
    if (review.hostResponse) count++
    if (review.supportResponse) count++
    return count
  }

  if (loading) {
    return <ReviewSkeleton />
  }

  if (reviewData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {t('guestReviews')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('noReviewsYet')}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        {/* Reviews Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t('guestReviews')}
              </h2>
              {stats && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <IoStar className="w-5 h-5 text-amber-400 fill-current" />
                    <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.average ? stats.average.toFixed(1) : stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                    </span>
                  </div>
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    ({t('reviewCount', { count: reviewData.length })})
                  </span>
                </div>
              )}
            </div>
            
            {/* Rating Distribution - Hidden on mobile, shown on larger screens */}
            {stats && (
              <div className="hidden sm:block space-y-1 min-w-[200px]">
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

          {/* Mobile Rating Distribution - Shows on mobile only */}
          {stats && (
            <div className="sm:hidden mt-4 space-y-1">
              {stats.distribution.map(({ rating, count, percentage }: any) => (
                <div key={rating} className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600 dark:text-gray-400 w-3">{rating}</span>
                  <IoStar className="w-2.5 h-2.5 text-amber-400 fill-current" />
                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage || 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-6">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Reviews List - Horizontal Scroll with Navigation */}
        <div className="relative">
          {/* Left scroll button - Hidden on mobile */}
          <button
            onClick={() => scrollContainer('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hidden sm:block"
            aria-label={t('scrollLeft')}
          >
            <IoChevronBackOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Right scroll button - Hidden on mobile */}
          <button
            onClick={() => scrollContainer('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hidden sm:block"
            aria-label={t('scrollRight')}
          >
            <IoChevronForwardOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Reviews Container */}
          <div className="p-4 sm:p-6 overflow-x-auto">
            <div 
              id="reviews-container"
              className="flex gap-3 sm:gap-4 pb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
              style={{ scrollBehavior: 'smooth' }}
            >
              {reviewData.map((review) => {
                const isExpanded = expandedReviews.includes(review.id)
                const isResponsesExpanded = expandedResponses.includes(review.id)
                const hasLongComment = review.comment && review.comment.length > 150
                const responseCount = countResponses(review)
                
                const displayComment = isExpanded || !hasLongComment 
                  ? review.comment 
                  : review.comment.substring(0, 150) + '...'
                
                return (
                  <div
                    key={review.id}
                    className="flex-shrink-0 w-[280px] sm:w-[320px] bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col"
                  >
                    {/* Review Card Content */}
                    <div className="p-3 sm:p-4 flex-1">
                      {/* Reviewer Header */}
                      <div className="flex items-start gap-2 sm:gap-3 mb-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-300 dark:bg-gray-600">
                          {review.reviewer.profilePhotoUrl ? (
                            <img
                              src={review.reviewer.profilePhotoUrl}
                              alt={review.reviewer.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <IoPersonCircleOutline className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <button
                              onClick={() => review.reviewer.id && handleReviewerClick(review.reviewer.id)}
                              className="text-sm font-semibold text-gray-900 dark:text-white hover:text-amber-600 transition-colors truncate"
                              disabled={!review.reviewer.id}
                            >
                              {formatReviewerName(review.reviewer.name)}
                            </button>
                            {review.isVerified && (
                              <IoCheckmarkCircleOutline className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600 flex-shrink-0" />
                            )}
                            {review.isPinned && (
                              <span className="text-xs text-purple-600 flex-shrink-0">📌</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 mt-0.5">
                            <div className="flex flex-shrink-0">
                              {[...Array(5)].map((_, i) => (
                                <IoStar
                                  key={i}
                                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                                    i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {new Date(review.createdAt).toLocaleDateString(locale, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Review Content */}
                      <div className="mb-3">
                        {review.title && (
                          <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1 line-clamp-1">
                            {review.title}
                          </h4>
                        )}
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {displayComment}
                        </p>
                        {hasLongComment && (
                          <button
                            onClick={() => toggleReviewExpansion(review.id)}
                            className="text-xs font-medium text-amber-600 hover:text-amber-700 mt-2 flex items-center gap-1"
                          >
                            {isExpanded ? (
                              <>
                                {t('showLess')}
                                <IoChevronUpOutline className="w-3 h-3" />
                              </>
                            ) : (
                              <>
                                {t('readMore')}
                                <IoChevronDownOutline className="w-3 h-3" />
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Responses Section - Collapsible */}
                      {hasResponses(review) && (
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                          {!isResponsesExpanded ? (
                            // Collapsed view - show response indicator
                            <button
                              onClick={() => toggleResponseExpansion(review.id)}
                              className="w-full flex items-center justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                            >
                              <div className="flex items-center gap-1 sm:gap-2">
                                <IoChatbubblesOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="font-medium">
                                  {t('responseCount', { count: responseCount })}
                                </span>
                              </div>
                              <IoChevronDownOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          ) : (
                            // Expanded view - show full responses
                            <div className="space-y-2 sm:space-y-3">
                              {/* Host Response */}
                              {review.hostResponse && (
                                <div className="pl-2 sm:pl-3 border-l-2 border-blue-400">
                                  <div className="flex items-start gap-1 sm:gap-2 mb-1">
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full overflow-hidden flex-shrink-0 bg-gray-300 dark:bg-gray-600">
                                      {(review.host?.partnerLogo || review.host?.profilePhoto) ? (
                                        <img
                                          src={review.host.partnerLogo || review.host.profilePhoto}
                                          alt={getFirstNameOnly(review.host.name)}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <IoPersonOutline className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500 dark:text-gray-400" />
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="flex-1">
                                      <div className="flex items-center gap-1 sm:gap-2 mb-0.5">
                                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                          {getFirstNameOnly(review.host?.name || 'Host')} {t('hostLabel')}
                                        </p>
                                        {review.hostRespondedAt && (
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(review.hostRespondedAt).toLocaleDateString(locale, {
                                              month: 'short',
                                              day: 'numeric'
                                            })}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {review.hostResponse}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Support Response */}
                              {review.supportResponse && (
                                <div className="pl-2 sm:pl-3 border-l-2 border-green-400">
                                  <div className="flex items-center gap-1 sm:gap-2 mb-1">
                                    <IoShieldCheckmarkOutline className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600 dark:text-green-400" />
                                    <p className="text-xs font-medium text-green-600 dark:text-green-400">
                                      {t('supportLabel')}
                                    </p>
                                    {review.supportRespondedAt && (
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(review.supportRespondedAt).toLocaleDateString(locale, {
                                          month: 'short',
                                          day: 'numeric'
                                        })}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {review.supportResponse}
                                  </p>
                                </div>
                              )}

                              {/* Collapse button */}
                              <button
                                onClick={() => toggleResponseExpansion(review.id)}
                                className="w-full flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors pt-1 sm:pt-2"
                              >
                                <span>{t('showLess')}</span>
                                <IoChevronUpOutline className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Review Footer */}
                    <div className="flex items-center justify-between p-3 sm:p-4 pt-0 mt-auto">
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        {review.tripStartDate && (
                          <>
                            <IoCarOutline className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span className="truncate">
                              {getTimeAgo(review.tripStartDate, t)}
                            </span>
                          </>
                        )}
                      </div>
                      <button 
                        onClick={() => handleHelpfulClick(review.id)}
                        disabled={helpfulClicked.has(review.id)}
                        className={`flex items-center gap-1 text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg transition-colors ${
                          helpfulClicked.has(review.id)
                            ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        <IoThumbsUpOutline className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>
                          {helpfulClicked.has(review.id) ? t('thanks') : review.helpfulCount > 0 ? review.helpfulCount : t('helpful')}
                        </span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Review count indicator */}
          <div className="text-center pb-4">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {t('showingAllReviews', { count: reviewData.length })} • {t('scrollToSeeMore')}
            </p>
          </div>
        </div>
      </div>

      {/* Use the imported ReviewerProfileModal component */}
      <ReviewerProfileModal
        reviewer={selectedReviewer}
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false)
          setSelectedReviewer(null)
        }}
      />
    </>
  )
}

// Loading Skeleton Component
function ReviewSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
      <div className="animate-pulse">
        <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
        <div className="flex gap-3 sm:gap-4 overflow-hidden">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-shrink-0 w-[280px] sm:w-[320px] border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3 mb-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
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