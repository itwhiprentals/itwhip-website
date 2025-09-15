// app/(guest)/rentals/components/details/HostProfileModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  IoCloseOutline,
  IoStarOutline,
  IoStar,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoChatbubbleOutline,
  IoCarOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoTrophyOutline,
  IoPersonCircleOutline,
  IoDiamondOutline,
  IoRibbonOutline,
  IoThumbsUpOutline,
  IoChevronDownOutline,
  IoChevronUpOutline
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
  rating?: {
    count?: number
  }
}

interface HostReview {
  id: string
  rating: number
  comment: string
  createdAt: string
  hostResponse?: string
  hostRespondedAt?: string
  supportResponse?: string
  supportRespondedAt?: string
  supportRespondedBy?: string
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

interface HostModalData {
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
  verificationLevel?: string
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

interface HostProfileModalProps {
  hostId: string
  isOpen: boolean
  onClose: () => void
}

// Helper function to determine if a name is a company
function isCompanyName(name: string): boolean {
  if (!name) return false
  
  const companyIndicators = [
    'LLC', 'L.L.C.', 'Inc', 'Inc.', 'Corp', 'Corporation',
    'Company', 'Co.', 'Group', 'Motors', 'Rentals', 'Services',
    'Automotive', 'Auto', 'Cars', 'Vehicles', 'Fleet',
    'Enterprise', 'Budget', 'Hertz', 'Avis', 'Thrifty',
    'Partners', 'Associates', 'Solutions', 'Holdings'
  ]
  
  const nameLower = name.toLowerCase()
  
  for (const indicator of companyIndicators) {
    if (nameLower.includes(indicator.toLowerCase())) {
      return true
    }
  }
  
  const words = name.trim().split(/\s+/)
  
  if (words.length === 1 && words[0].length > 12) {
    return true
  }
  
  if (words.length > 3) {
    return true
  }
  
  return false
}

// Helper function to format display name
function formatDisplayName(name: string, isCompany?: boolean): string {
  if (!name) return 'Host'
  
  if (isCompany || isCompanyName(name)) {
    return name
  }
  
  const words = name.trim().split(/\s+/)
  
  if (words.length === 1) {
    return words[0]
  } else if (words.length === 2) {
    const firstName = words[0]
    const lastInitial = words[1].charAt(0).toUpperCase()
    return `${firstName} ${lastInitial}.`
  } else if (words.length === 3 && words[1].length <= 2) {
    const firstName = words[0]
    const lastInitial = words[2].charAt(0).toUpperCase()
    return `${firstName} ${lastInitial}.`
  } else {
    const firstName = words[0]
    const lastInitial = words[words.length - 1].charAt(0).toUpperCase()
    return `${firstName} ${lastInitial}.`
  }
}

// Helper function to calculate trip count (matching page.tsx logic)
function calculateTripCount(data: any): number {
  // Priority order: trips, totalTrips, rating.count, or 0
  return data.trips || data.totalTrips || data.rating?.count || 0
}

// Helper function to get rating value
function getRatingValue(rating: any): number {
  if (typeof rating === 'number') return rating
  if (rating?.average) return rating.average
  return 5.0 // Default rating
}

export default function HostProfileModal({ hostId, isOpen, onClose }: HostProfileModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hostData, setHostData] = useState<HostModalData | null>(null)
  const [activeTab, setActiveTab] = useState<'cars' | 'reviews'>('cars')
  const [error, setError] = useState<string | null>(null)
  const [expandedReviews, setExpandedReviews] = useState<string[]>([])

  useEffect(() => {
    if (isOpen && hostId) {
      fetchHostData()
    }
  }, [isOpen, hostId])

  const fetchHostData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/rentals/hosts/${hostId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch host data')
      }
      
      const data = await response.json()
      setHostData(data.data)
    } catch (error) {
      console.error('Error fetching host data:', error)
      setError('Failed to load host information')
    } finally {
      setLoading(false)
    }
  }

  const handleCarClick = (carId: string) => {
    onClose()
    router.push(`/rentals/${carId}`)
  }

  const toggleReviewExpansion = (reviewId: string) => {
    setExpandedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    )
  }

  const getHostBadge = () => {
    if (!hostData?.badge) return null
    
    switch(hostData.badge) {
      case 'elite_host':
        return { type: 'elite_host', label: 'Elite Host', color: 'purple', icon: IoDiamondOutline }
      case 'super_host':
        return { type: 'super_host', label: 'Super Host', color: 'amber', icon: IoTrophyOutline }
      case 'all_star':
        return { type: 'all_star', label: 'All-Star Host', color: 'blue', icon: IoStar }
      case 'top_rated':
        return { type: 'top_rated', label: 'Top Rated', color: 'green', icon: IoRibbonOutline }
      default:
        return null
    }
  }

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString)
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()
    return `${month} ${year}`
  }

  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
  }

  if (!isOpen) return null

  const displayName = hostData ? formatDisplayName(hostData.name, hostData.isCompany) : ''
  // Use the same logic as page.tsx for trip count
  const tripCount = hostData ? calculateTripCount(hostData) : 0
  // Get rating value properly
  const ratingValue = hostData ? getRatingValue(hostData.rating) : 5.0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
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

        {/* Modal Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-60px)]">
          {loading ? (
            <div className="p-4">
              <HostModalSkeleton />
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchHostData}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : hostData ? (
            <>
              {/* Host Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600">
                      {hostData.profilePhoto ? (
                        <img
                          src={hostData.profilePhoto}
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <IoPersonCircleOutline className="w-10 h-10 text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                    </div>
                    {hostData.isVerified && (
                      <div className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-0.5">
                        <IoShieldCheckmarkOutline className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {displayName}
                      </h3>
                      {(() => {
                        const badge = getHostBadge()
                        return badge ? (
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                            ${badge.color === 'purple' ? 'bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 text-purple-700 dark:text-purple-400' :
                              badge.color === 'amber' ? 'bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 text-amber-700 dark:text-amber-400' :
                              badge.color === 'blue' ? 'bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-700 dark:text-blue-400' :
                              'bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 text-green-700 dark:text-green-400'}`}>
                            <badge.icon className="w-2.5 h-2.5" />
                            <span>{badge.label}</span>
                          </div>
                        ) : null
                      })()}
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <IoLocationOutline className="w-3 h-3" />
                        <span>{hostData.city}, {hostData.state}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IoCalendarOutline className="w-3 h-3" />
                        <span>Joined {formatMemberSince(hostData.memberSince)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Host Stats Grid - Using calculated trip count */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {ratingValue.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                      <IoStar className="w-2 h-2 text-amber-400" />
                      Rating
                    </div>
                  </div>
                  
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {tripCount}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Trips
                    </div>
                  </div>

                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {hostData.totalCars}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Cars
                    </div>
                  </div>

                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {hostData.stats.responseRate}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Response
                    </div>
                  </div>
                </div>

                {/* Response Info */}
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div className="flex items-center gap-1">
                    <IoTimeOutline className="w-3 h-3" />
                    <span>Responds in ~{formatResponseTime(hostData.stats.responseTime)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IoChatbubbleOutline className="w-3 h-3" />
                    <span>Available after booking</span>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('cars')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'cars'
                        ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50/50 dark:bg-amber-900/10'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    Cars ({hostData.cars.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'reviews'
                        ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50/50 dark:bg-amber-900/10'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    Reviews ({hostData.recentReviews.length})
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-4">
                {activeTab === 'cars' ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {hostData.cars.length > 0 ? (
                      hostData.cars.map(car => {
                        // Use only totalTrips since that's what the host API returns
                        const carTripCount = car.totalTrips || 0
                        const carRatingValue = typeof car.rating === 'number' ? car.rating : 5.0
                        
                        return (
                          <button
                            key={car.id}
                            onClick={() => handleCarClick(car.id)}
                            className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer text-left"
                          >
                            {car.photoUrl && (
                              <img 
                                src={car.photoUrl} 
                                alt={`${car.make} ${car.model}`}
                                className="w-16 h-12 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                {car.year} {car.make} {car.model}
                              </h4>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm font-medium text-amber-600">
                                  ${car.dailyRate}/day
                                </span>
                                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                  <IoStar className="w-3 h-3 text-amber-400" />
                                  <span>{carRatingValue.toFixed(1)}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                  <IoCarOutline className="w-3 h-3" />
                                  <span>{carTripCount} trips</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        )
                      })
                    ) : (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        No cars available
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {hostData.recentReviews.length > 0 ? (
                      hostData.recentReviews.map(review => {
                        const isExpanded = expandedReviews.includes(review.id)
                        const commentLength = review.comment?.length || 0
                        const isLongComment = commentLength > 150
                        const displayComment = !review.comment ? '' : 
                          (isExpanded || !isLongComment ? review.comment : review.comment.substring(0, 150) + '...')
                        
                        return (
                          <div key={review.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-start gap-3 mb-2">
                              <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600">
                                {review.reviewer.profilePhotoUrl ? (
                                  <img
                                    src={review.reviewer.profilePhotoUrl}
                                    alt={review.reviewer.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <IoPersonCircleOutline className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                                    {review.reviewer.name}
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
                                {review.car && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    {review.car.year} {review.car.make} {review.car.model}
                                  </p>
                                )}
                                
                                {review.comment && (
                                  <>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                      {displayComment}
                                    </p>
                                    
                                    {isLongComment && (
                                      <button
                                        onClick={() => toggleReviewExpansion(review.id)}
                                        className="text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 mt-1 flex items-center gap-1"
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
                                  </>
                                )}
                                
                                {/* Host Response */}
                                {review.hostResponse && (
                                  <div className="mt-2 pl-3 border-l-2 border-blue-400">
                                    <div className="flex items-center gap-1 mb-1">
                                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                        Host Response
                                      </span>
                                      {review.hostRespondedAt && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          • {new Date(review.hostRespondedAt).toLocaleDateString('en-US', { 
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
                                )}
                                
                                {/* Support Response */}
                                {review.supportResponse && (
                                  <div className="mt-2 pl-3 border-l-2 border-green-400">
                                    <div className="flex items-center gap-1 mb-1">
                                      <IoShieldCheckmarkOutline className="w-3 h-3 text-green-600 dark:text-green-400" />
                                      <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                        ItWhip Support
                                      </span>
                                      {review.supportRespondedAt && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          • {new Date(review.supportRespondedAt).toLocaleDateString('en-US', { 
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
                                
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {new Date(review.createdAt).toLocaleDateString('en-US', { 
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric' 
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        No reviews yet
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// Loading skeleton component
function HostModalSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  )
}