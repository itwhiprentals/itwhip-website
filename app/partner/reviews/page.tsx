// app/partner/reviews/page.tsx
// Partner Reviews Management Dashboard

'use client'

import { useState, useEffect } from 'react'
import {
  IoStarOutline,
  IoStar,
  IoStarHalf,
  IoCarOutline,
  IoChatbubbleOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoPersonOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoSendOutline,
  IoCloseOutline,
  IoFilterOutline,
  IoTrendingUpOutline,
  IoHappyOutline
} from 'react-icons/io5'

interface Reviewer {
  id: string | null
  name: string
  photo: string | null
  location: string | null
}

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string | null
  cleanliness: number | null
  accuracy: number | null
  communication: number | null
  convenience: number | null
  value: number | null
  hostResponse: string | null
  hostRespondedAt: string | null
  tripStartDate: string | null
  tripEndDate: string | null
  createdAt: string
  isVerified: boolean
  isPinned: boolean
  helpfulCount: number
  vehicleId: string
  vehicleName: string
  vehiclePhoto: string | null
  reviewer: Reviewer
}

interface RatingDistribution {
  rating: number
  count: number
  percentage: number
}

interface Stats {
  total: number
  avgRating: number
  pendingResponses: number
  respondedCount: number
  responseRate: number
  distribution: RatingDistribution[]
}

interface Vehicle {
  id: string
  name: string
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    avgRating: 0,
    pendingResponses: 0,
    respondedCount: 0,
    responseRate: 0,
    distribution: []
  })
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'responded'>('all')
  const [vehicleFilter, setVehicleFilter] = useState<string>('')
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [expandedReview, setExpandedReview] = useState<string | null>(null)
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [filter, vehicleFilter, ratingFilter])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('filter', filter)
      if (vehicleFilter) params.set('vehicleId', vehicleFilter)
      if (ratingFilter !== 'all') params.set('rating', ratingFilter)

      const response = await fetch(`/api/partner/reviews?${params}`)
      const data = await response.json()

      if (data.success) {
        setReviews(data.reviews)
        setStats(data.stats)
        setVehicles(data.vehicles)
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async (reviewId: string) => {
    if (!responseText.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/partner/reviews/${reviewId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: responseText })
      })

      const data = await response.json()

      if (data.success) {
        setReviews(prev => prev.map(r =>
          r.id === reviewId
            ? { ...r, hostResponse: responseText, hostRespondedAt: new Date().toISOString() }
            : r
        ))
        setStats(prev => ({
          ...prev,
          pendingResponses: prev.pendingResponses - 1,
          respondedCount: prev.respondedCount + 1,
          responseRate: Math.round(((prev.respondedCount + 1) / prev.total) * 100)
        }))
        setRespondingTo(null)
        setResponseText('')
      }
    } catch (error) {
      console.error('Failed to respond:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
    const stars = []

    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<IoStar key={i} className={`${sizeClass} text-yellow-400`} />)
      } else if (rating >= i - 0.5) {
        stars.push(<IoStarHalf key={i} className={`${sizeClass} text-yellow-400`} />)
      } else {
        stars.push(<IoStarOutline key={i} className={`${sizeClass} text-gray-300 dark:text-gray-600`} />)
      }
    }

    return <div className="flex items-center gap-0.5">{stars}</div>
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Reviews</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          View and respond to reviews from your customers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <IoStar className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgRating}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Rating</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <IoChatbubbleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Reviews</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <IoTimeOutline className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingResponses}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Awaiting Response</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <IoTrendingUpOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.responseRate}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Response Rate</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Rating Distribution */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sticky top-20">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Rating Distribution</h3>
            <div className="space-y-2">
              {stats.distribution.map((item) => (
                <button
                  key={item.rating}
                  onClick={() => setRatingFilter(ratingFilter === String(item.rating) ? 'all' : String(item.rating))}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    ratingFilter === String(item.rating)
                      ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-4">{item.rating}</span>
                  <IoStar className="w-4 h-4 text-yellow-400" />
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">
                    {item.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Response Status</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Reviews</option>
                  <option value="pending">Awaiting Response</option>
                  <option value="responded">Responded</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Vehicle</label>
                <select
                  value={vehicleFilter}
                  onChange={(e) => setVehicleFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Vehicles</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="p-8 text-center">
                <IoHappyOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No reviews yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {filter !== 'all'
                    ? 'No reviews match the selected filters'
                    : 'Reviews will appear here as customers complete their rentals'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4">
                    {/* Review Header */}
                    <div className="flex items-start gap-4">
                      {/* Reviewer Avatar */}
                      <div className="flex-shrink-0">
                        {review.reviewer.photo ? (
                          <img
                            src={review.reviewer.photo}
                            alt={review.reviewer.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <IoPersonOutline className="w-5 h-5 text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* Review Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {review.reviewer.name}
                            </span>
                            {review.isVerified && (
                              <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mb-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            for {review.vehicleName}
                          </span>
                        </div>

                        {review.title && (
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                            {review.title}
                          </h4>
                        )}

                        {review.comment && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                            {review.comment}
                          </p>
                        )}

                        {/* Sub-ratings */}
                        {(review.cleanliness || review.accuracy || review.communication) && (
                          <button
                            onClick={() => setExpandedReview(expandedReview === review.id ? null : review.id)}
                            className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 hover:underline"
                          >
                            View detailed ratings
                            {expandedReview === review.id ? (
                              <IoChevronUpOutline className="w-3 h-3" />
                            ) : (
                              <IoChevronDownOutline className="w-3 h-3" />
                            )}
                          </button>
                        )}

                        {expandedReview === review.id && (
                          <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            {[
                              { label: 'Cleanliness', value: review.cleanliness },
                              { label: 'Accuracy', value: review.accuracy },
                              { label: 'Communication', value: review.communication },
                              { label: 'Convenience', value: review.convenience },
                              { label: 'Value', value: review.value }
                            ].map((item) => item.value && (
                              <div key={item.label} className="text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                                <div className="flex items-center justify-center gap-1">
                                  <IoStar className="w-3 h-3 text-yellow-400" />
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Host Response */}
                        {review.hostResponse ? (
                          <div className="mt-3 pl-3 border-l-2 border-blue-400 bg-blue-50 dark:bg-blue-900/20 py-2 pr-2 rounded-r-lg">
                            <div className="flex items-center gap-1.5 mb-1">
                              <IoChatbubbleOutline className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                Your Response
                              </span>
                              {review.hostRespondedAt && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  • {formatDate(review.hostRespondedAt)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {review.hostResponse}
                            </p>
                          </div>
                        ) : respondingTo === review.id ? (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <textarea
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              placeholder="Write your response..."
                              rows={3}
                              maxLength={2000}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 resize-none"
                            />
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {responseText.length}/2000
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setRespondingTo(null)
                                    setResponseText('')
                                  }}
                                  className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleRespond(review.id)}
                                  disabled={submitting || !responseText.trim()}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg text-sm font-medium"
                                >
                                  {submitting ? (
                                    'Posting...'
                                  ) : (
                                    <>
                                      <IoSendOutline className="w-4 h-4" />
                                      Post Response
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRespondingTo(review.id)}
                            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                          >
                            <IoChatbubbleOutline className="w-4 h-4" />
                            Respond to Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
