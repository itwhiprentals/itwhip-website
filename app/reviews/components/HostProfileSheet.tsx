// app/reviews/components/HostProfileSheet.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatPrivateName, formatReviewerName, isCompanyName } from '@/app/lib/utils/namePrivacy'
import {
  IoCloseOutline,
  IoStar,
  IoCheckmarkCircleOutline,
  IoPersonCircleOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoCarOutline,
  IoTimeOutline,
  IoChatbubbleOutline,
  IoTrophyOutline,
  IoRibbonOutline,
  IoDiamondOutline
} from 'react-icons/io5'

interface HostCar {
  id: string
  make: string
  model: string
  year: number
  photoUrl?: string
  dailyRate: number
  rating: number
  totalTrips: number
  trips?: number
}

interface HostReview {
  id: string
  rating: number
  comment: string
  createdAt: string
  hostResponse?: string
  hostRespondedAt?: string
  reviewer: {
    name: string
    profilePhotoUrl?: string
  }
  car?: {
    make: string
    model: string
    year: number
  }
}

interface HostData {
  id: string
  name: string
  profilePhoto?: string
  city: string
  state: string
  memberSince: string
  totalTrips: number
  trips?: number
  rating: number | {
    average?: number
    count?: number
  }
  responseTime?: number
  responseRate?: number
  badge?: 'super_host' | 'elite_host' | 'top_rated' | 'all_star' | null
  bio?: string
  isVerified: boolean
  totalCars: number
  cars: HostCar[]
  recentReviews: HostReview[]
  stats: {
    totalReviews: number
    averageRating: number
    responseRate: number
    responseTime: number
  }
  isCompany?: boolean
}

interface HostProfileSheetProps {
  hostId: string
  isOpen: boolean
  onClose: () => void
}

// Helper to get badge info
function getBadgeInfo(badge: string | null | undefined) {
  switch (badge) {
    case 'super_host':
      return { label: 'Superhost', icon: IoTrophyOutline, color: 'text-amber-500' }
    case 'elite_host':
      return { label: 'Elite Host', icon: IoDiamondOutline, color: 'text-purple-500' }
    case 'top_rated':
      return { label: 'Top Rated', icon: IoRibbonOutline, color: 'text-blue-500' }
    case 'all_star':
      return { label: 'All-Star', icon: IoStar, color: 'text-amber-500' }
    default:
      return null
  }
}

export default function HostProfileSheet({ hostId, isOpen, onClose }: HostProfileSheetProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [hostData, setHostData] = useState<HostData | null>(null)
  const [expandedReviews, setExpandedReviews] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'cars' | 'reviews'>('cars')

  useEffect(() => {
    if (isOpen && hostId) {
      fetchHostData()
    } else if (!isOpen) {
      // Reset state when sheet closes
      setHostData(null)
      setExpandedReviews([])
      setActiveTab('cars')
    }
  }, [isOpen, hostId])

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const fetchHostData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/rentals/hosts/${hostId}`)
      if (response.ok) {
        const data = await response.json()
        setHostData(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch host profile:', error)
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

  const handleCarClick = (carId: string) => {
    onClose()
    router.push(`/rentals/${carId}`)
  }

  const formatMemberSince = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getRatingValue = (rating: number | { average?: number; count?: number }): number => {
    if (typeof rating === 'number') return rating
    return rating?.average || 5.0
  }

  if (!isOpen) return null

  const displayName = hostData ? formatPrivateName(hostData.name, hostData.isCompany) : 'Host'
  const hostInitial = displayName.charAt(0).toUpperCase()
  const badgeInfo = hostData?.badge ? getBadgeInfo(hostData.badge) : null
  const rating = hostData ? getRatingValue(hostData.rating) : 0
  const tripCount = hostData?.trips || hostData?.totalTrips || 0

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 md:inset-0 z-50 flex md:items-center md:justify-center pointer-events-none">
        <div className="bg-white dark:bg-gray-800 w-full md:max-w-md md:mx-auto rounded-t-2xl md:rounded-lg border border-gray-200 dark:border-gray-700 shadow-2xl pointer-events-auto max-h-[75vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Host Profile
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <IoCloseOutline className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(75vh-60px)]">
            {loading ? (
              <div className="p-4">
                <ProfileSkeleton />
              </div>
            ) : hostData ? (
              <div className="p-4">
                {/* Profile Header */}
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2 bg-gray-300 dark:bg-gray-600 border-2 border-gray-200 dark:border-gray-600">
                    {hostData.profilePhoto ? (
                      <img
                        src={hostData.profilePhoto}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-amber-500 text-white text-xl font-bold">
                        {hostInitial}
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {displayName}
                  </h3>

                  {/* Badge */}
                  {badgeInfo && (
                    <div className={`flex items-center justify-center gap-1 mt-1 ${badgeInfo.color}`}>
                      <badgeInfo.icon className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">{badgeInfo.label}</span>
                    </div>
                  )}

                  {hostData.isVerified && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <IoCheckmarkCircleOutline
                        className="w-3.5 h-3.5 text-green-600"
                        title="Verified Host"
                      />
                      <span className="text-xs text-green-600">Verified</span>
                    </div>
                  )}
                </div>

                {/* Location and Member Info */}
                <div className="space-y-2 mb-4">
                  {(hostData.city || hostData.state) && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <IoLocationOutline className="w-3.5 h-3.5" />
                      <span>
                        {hostData.city}{hostData.city && hostData.state && ', '}{hostData.state}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <IoCalendarOutline className="w-3.5 h-3.5" />
                    <span>Host since {formatMemberSince(hostData.memberSince)}</span>
                  </div>

                  {hostData.stats?.responseTime && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <IoTimeOutline className="w-3.5 h-3.5" />
                      <span>Responds within {hostData.stats.responseTime} hour{hostData.stats.responseTime !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {tripCount}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Trips
                    </div>
                  </div>

                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="text-lg font-bold text-gray-900 dark:text-white flex items-center justify-center gap-0.5">
                      {rating > 0 ? rating.toFixed(1) : '—'}
                      {rating > 0 && <IoStar className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Rating
                    </div>
                  </div>

                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {hostData.totalCars || hostData.cars?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Cars
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {hostData.bio && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                      "{hostData.bio}"
                    </p>
                  </div>
                )}

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-3">
                  <button
                    onClick={() => setActiveTab('cars')}
                    className={`flex-1 py-2 text-xs font-medium transition-colors ${
                      activeTab === 'cars'
                        ? 'text-amber-600 border-b-2 border-amber-600'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    <IoCarOutline className="w-3.5 h-3.5 inline mr-1" />
                    Cars ({hostData.cars?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`flex-1 py-2 text-xs font-medium transition-colors ${
                      activeTab === 'reviews'
                        ? 'text-amber-600 border-b-2 border-amber-600'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    <IoChatbubbleOutline className="w-3.5 h-3.5 inline mr-1" />
                    Reviews ({hostData.recentReviews?.length || 0})
                  </button>
                </div>

                {/* Cars Tab */}
                {activeTab === 'cars' && hostData.cars && hostData.cars.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {hostData.cars.map(car => (
                      <button
                        key={car.id}
                        onClick={() => handleCarClick(car.id)}
                        className="w-full text-left p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {car.photoUrl ? (
                            <img
                              src={car.photoUrl}
                              alt={`${car.year} ${car.make} ${car.model}`}
                              className="w-14 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-14 h-10 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                              <IoCarOutline className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                              {car.year} {car.make} {car.model}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>${car.dailyRate}/day</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <IoStar className="w-2.5 h-2.5 text-amber-400" />
                                {car.rating?.toFixed(1) || '5.0'}
                              </span>
                              <span>•</span>
                              <span>{car.trips || car.totalTrips || 0} trips</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && hostData.recentReviews && hostData.recentReviews.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {hostData.recentReviews.map(review => {
                      const isExpanded = expandedReviews.includes(review.id)
                      const isLongComment = review.comment && review.comment.length > 80
                      const displayComment = !review.comment ? '' :
                        (isExpanded || !isLongComment ? review.comment : review.comment.substring(0, 80) + '...')

                      return (
                        <div
                          key={review.id}
                          className="p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          {/* Reviewer Info */}
                          <div className="flex items-start gap-2 mb-1.5">
                            {review.reviewer.profilePhotoUrl ? (
                              <img
                                src={review.reviewer.profilePhotoUrl}
                                alt={review.reviewer.name}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <IoPersonCircleOutline className="w-4 h-4 text-gray-500" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-900 dark:text-white">
                                  {formatReviewerName(review.reviewer.name)}
                                </span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <IoStar
                                      key={i}
                                      className={`w-2.5 h-2.5 ${
                                        i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              {review.car && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {review.car.year} {review.car.make} {review.car.model}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Comment */}
                          {review.comment && (
                            <div className="ml-8">
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {displayComment}
                              </p>
                              {isLongComment && (
                                <button
                                  onClick={() => toggleReviewExpansion(review.id)}
                                  className="text-xs font-medium text-amber-600 hover:text-amber-700 mt-0.5 flex items-center gap-0.5"
                                >
                                  {isExpanded ? (
                                    <>
                                      Show less
                                      <IoChevronUpOutline className="w-2.5 h-2.5" />
                                    </>
                                  ) : (
                                    <>
                                      Read more
                                      <IoChevronDownOutline className="w-2.5 h-2.5" />
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          )}

                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-8">
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Empty states */}
                {activeTab === 'cars' && (!hostData.cars || hostData.cars.length === 0) && (
                  <div className="text-center py-4 text-xs text-gray-500 dark:text-gray-400">
                    No cars listed yet
                  </div>
                )}

                {activeTab === 'reviews' && (!hostData.recentReviews || hostData.recentReviews.length === 0) && (
                  <div className="text-center py-4 text-xs text-gray-500 dark:text-gray-400">
                    No reviews yet
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Unable to load host profile
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// Loading skeleton
function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 mx-auto mb-1"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto mb-4"></div>

      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {[1, 2].map(i => (
          <div key={i} className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
