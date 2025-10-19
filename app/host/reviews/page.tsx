// app/host/reviews/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  IoStarOutline,
  IoStar,
  IoPersonOutline,
  IoCarOutline,
  IoCalendarOutline,
  IoArrowBackOutline,
  IoFilterOutline,
  IoCheckmarkCircleOutline,
  IoChatbubbleOutline,
  IoSendOutline,
  IoCloseOutline
} from 'react-icons/io5'

interface Review {
  id: string
  rating: number
  cleanliness?: number
  accuracy?: number
  communication?: number
  convenience?: number
  value?: number
  title?: string
  comment?: string
  hostResponse?: string
  hostRespondedAt?: string
  source: string
  isPinned: boolean
  isVerified: boolean
  tripStartDate?: string
  tripEndDate?: string
  createdAt: string
  car: {
    id: string
    make: string
    model: string
    year: number
    photos: { url: string }[]
  }
  booking?: {
    guestName?: string
    guestEmail?: string
    startDate: string
    endDate: string
  }
  reviewerProfile?: {
    name: string
    profilePhotoUrl?: string
    city: string
    state: string
    tripCount: number
    memberSince: string
  }
}

interface Stats {
  totalReviews: number
  avgRating: number
  ratingBreakdown: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  avgCategoryRatings: {
    cleanliness: number
    accuracy: number
    communication: number
    convenience: number
    value: number
  }
}

interface Car {
  id: string
  make: string
  model: string
  year: number
}

export default function HostReviewsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [cars, setCars] = useState<Car[]>([])
  
  // Filters
  const [selectedCar, setSelectedCar] = useState<string>('all')
  const [selectedRating, setSelectedRating] = useState<string>('all')
  const [selectedSource, setSelectedSource] = useState<string>('all')
  
  // Response modal
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [responseText, setResponseText] = useState('')
  const [submittingResponse, setSubmittingResponse] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [selectedCar, selectedRating, selectedSource])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (selectedCar !== 'all') params.append('carId', selectedCar)
      if (selectedRating !== 'all') params.append('minRating', selectedRating)
      if (selectedSource !== 'all') params.append('source', selectedSource)

      const response = await fetch(`/api/host/reviews?${params.toString()}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
        setStats(data.stats)
        setCars(data.cars || [])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRespondToReview = async () => {
    if (!selectedReview || !responseText.trim()) return

    setSubmittingResponse(true)
    try {
      const response = await fetch('/api/host/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          reviewId: selectedReview.id,
          response: responseText.trim()
        })
      })

      if (response.ok) {
        setShowResponseModal(false)
        setResponseText('')
        setSelectedReview(null)
        fetchReviews()
      }
    } catch (error) {
      console.error('Error responding to review:', error)
    } finally {
      setSubmittingResponse(false)
    }
  }

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    }

    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star}>
            {star <= rating ? (
              <IoStar className={`${sizeClasses[size]} text-yellow-500`} />
            ) : (
              <IoStarOutline className={`${sizeClasses[size]} text-gray-300 dark:text-gray-600`} />
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderRatingBar = (rating: number, count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0

    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{rating}★</span>
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">{count}</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/host/dashboard')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
          >
            <IoArrowBackOutline className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Guest Reviews</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {stats?.totalReviews || 0} total reviews
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && stats.totalReviews > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Average Rating */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl font-bold text-gray-900 dark:text-white">
                    {stats.avgRating}
                  </div>
                  <div>
                    {renderStars(Math.round(stats.avgRating), 'lg')}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Based on {stats.totalReviews} reviews
                    </p>
                  </div>
                </div>

                {/* Rating Breakdown */}
                <div className="space-y-2">
                  {renderRatingBar(5, stats.ratingBreakdown[5], stats.totalReviews)}
                  {renderRatingBar(4, stats.ratingBreakdown[4], stats.totalReviews)}
                  {renderRatingBar(3, stats.ratingBreakdown[3], stats.totalReviews)}
                  {renderRatingBar(2, stats.ratingBreakdown[2], stats.totalReviews)}
                  {renderRatingBar(1, stats.ratingBreakdown[1], stats.totalReviews)}
                </div>
              </div>

              {/* Right: Category Ratings */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Category Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Cleanliness', value: stats.avgCategoryRatings.cleanliness },
                    { label: 'Accuracy', value: stats.avgCategoryRatings.accuracy },
                    { label: 'Communication', value: stats.avgCategoryRatings.communication },
                    { label: 'Convenience', value: stats.avgCategoryRatings.convenience },
                    { label: 'Value', value: stats.avgCategoryRatings.value }
                  ].map(category => (
                    <div key={category.label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{category.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {category.value.toFixed(1)}
                        </span>
                        {renderStars(Math.round(category.value), 'sm')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <IoFilterOutline className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
            </div>

            <select
              value={selectedCar}
              onChange={(e) => setSelectedCar(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Cars</option>
              {cars.map(car => (
                <option key={car.id} value={car.id}>
                  {car.year} {car.make} {car.model}
                </option>
              ))}
            </select>

            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
            </select>

            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Sources</option>
              <option value="GUEST">Guest Reviews</option>
              <option value="SEED">Featured</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <IoStarOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Reviews from your guests will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    {/* Reviewer Photo */}
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {review.reviewerProfile?.profilePhotoUrl ? (
                        <Image
                          src={review.reviewerProfile.profilePhotoUrl}
                          alt={review.reviewerProfile.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <IoPersonOutline className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {review.reviewerProfile?.name || review.booking?.guestName || 'Guest'}
                        </h3>
                        {review.isVerified && (
                          <IoCheckmarkCircleOutline className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {review.reviewerProfile?.city}, {review.reviewerProfile?.state} • {review.reviewerProfile?.tripCount} trips
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {renderStars(review.rating)}
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Car Info */}
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
                  <IoCarOutline className="w-4 h-4" />
                  <span>{review.car.year} {review.car.make} {review.car.model}</span>
                  {review.tripStartDate && (
                    <>
                      <span>•</span>
                      <IoCalendarOutline className="w-4 h-4" />
                      <span>{new Date(review.tripStartDate).toLocaleDateString()}</span>
                    </>
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

                {/* Category Ratings */}
                {(review.cleanliness || review.accuracy || review.communication) && (
                  <div className="flex flex-wrap gap-3 mb-4 text-xs">
                    {review.cleanliness && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                        Cleanliness: {review.cleanliness}★
                      </span>
                    )}
                    {review.accuracy && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                        Accuracy: {review.accuracy}★
                      </span>
                    )}
                    {review.communication && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                        Communication: {review.communication}★
                      </span>
                    )}
                  </div>
                )}

                {/* Host Response */}
                {review.hostResponse ? (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-purple-500">
                    <div className="flex items-center gap-2 mb-2">
                      <IoChatbubbleOutline className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Your Response</span>
                      <span className="text-xs text-gray-500">
                        {new Date(review.hostRespondedAt!).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{review.hostResponse}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedReview(review)
                      setShowResponseModal(true)
                    }}
                    className="mt-4 flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium"
                  >
                    <IoChatbubbleOutline className="w-4 h-4" />
                    Respond to review
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Respond to Review
              </h3>
              <button
                onClick={() => {
                  setShowResponseModal(false)
                  setResponseText('')
                  setSelectedReview(null)
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <IoCloseOutline className="w-5 h-5" />
              </button>
            </div>

            {/* Original Review */}
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedReview.reviewerProfile?.name || 'Guest'}
                </span>
                {renderStars(selectedReview.rating, 'sm')}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {selectedReview.comment}
              </p>
            </div>

            {/* Response Textarea */}
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Thank the guest and address any concerns..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowResponseModal(false)
                  setResponseText('')
                  setSelectedReview(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={submittingResponse}
              >
                Cancel
              </button>
              <button
                onClick={handleRespondToReview}
                disabled={!responseText.trim() || submittingResponse}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submittingResponse ? (
                  <>Sending...</>
                ) : (
                  <>
                    <IoSendOutline className="w-4 h-4" />
                    Send Response
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}