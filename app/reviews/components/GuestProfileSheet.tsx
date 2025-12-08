// app/reviews/components/GuestProfileSheet.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  IoCloseOutline,
  IoStar,
  IoCheckmarkCircleOutline,
  IoPersonCircleOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5'

interface RecentReview {
  id: string
  rating: number
  title?: string
  comment: string
  fullComment?: string
  createdAt: string
  tripStartDate?: string
  tripEndDate?: string
  helpfulCount?: number
  isVerified?: boolean
  isPinned?: boolean
  hostResponse?: string
  hostRespondedAt?: string
  supportResponse?: string
  supportRespondedAt?: string
  supportRespondedBy?: string
  car: {
    id: string
    displayName: string
    photoUrl?: string
    make?: string
    model?: string
    year?: number
  }
  host?: {
    id?: string
    name?: string
    profilePhoto?: string
  }
}

interface ReviewerProfileData {
  id: string
  name: string
  profilePhotoUrl?: string
  location?: string
  city?: string
  state?: string
  memberSince: string
  tripCount: number
  reviewCount: number
  isVerified: boolean
  stats?: {
    totalReviews: number
    averageRating: number
    membershipDuration: number
  }
  recentReviews?: RecentReview[]
}

interface GuestProfile {
  id: string
  name: string | null
  profilePhotoUrl: string | null
  memberSince: Date | string | null
  tripCount: number | null
  isVerified: boolean | null
  city: string | null
  state: string | null
}

interface GuestProfileSheetProps {
  isOpen: boolean
  onClose: () => void
  guest: GuestProfile | null
}

// Helper function to extract first name
function getFirstName(fullName: string | null): string {
  if (!fullName) return 'Guest'
  const firstName = fullName.trim().split(/\s+/)[0]
  return firstName || 'Guest'
}

export default function GuestProfileSheet({ isOpen, onClose, guest }: GuestProfileSheetProps) {
  const router = useRouter()
  const [expandedReviews, setExpandedReviews] = useState<string[]>([])
  const [expandedHostResponses, setExpandedHostResponses] = useState<string[]>([])
  const [expandedSupportResponses, setExpandedSupportResponses] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [fullProfileData, setFullProfileData] = useState<ReviewerProfileData | null>(null)

  useEffect(() => {
    if (isOpen && guest?.id) {
      fetchFullProfile()
    } else if (!isOpen) {
      // Reset state when modal closes
      setFullProfileData(null)
      setExpandedReviews([])
      setExpandedHostResponses([])
      setExpandedSupportResponses([])
    }
  }, [isOpen, guest?.id])

  // Prevent body scroll when modal is open
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

  const fetchFullProfile = async () => {
    if (!guest?.id) return

    try {
      setLoading(true)
      const response = await fetch(`/api/rentals/reviewers/${guest.id}`)
      if (response.ok) {
        const data = await response.json()
        setFullProfileData(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch full reviewer profile:', error)
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

  const toggleHostResponseExpansion = (reviewId: string) => {
    setExpandedHostResponses(prev =>
      prev.includes(reviewId)
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    )
  }

  const toggleSupportResponseExpansion = (reviewId: string) => {
    setExpandedSupportResponses(prev =>
      prev.includes(reviewId)
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    )
  }

  const handleCarClick = (carId: string) => {
    onClose()
    router.push(`/rentals/${carId}`)
  }

  const formatMemberSince = (dateString: string | Date | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })
  }

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const calculateAverageRating = (reviews: RecentReview[]): number => {
    if (!reviews || reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return sum / reviews.length
  }

  if (!isOpen || !guest) return null

  const profileData = fullProfileData
  const guestName = getFirstName(guest.name)
  const averageRating = profileData?.stats?.averageRating ||
    (profileData?.recentReviews ? calculateAverageRating(profileData.recentReviews) : 0)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom Sheet / Modal */}
      <div className="fixed inset-x-0 bottom-0 md:inset-0 z-50 flex md:items-center md:justify-center pointer-events-none">
        <div className="bg-white dark:bg-gray-800 w-full md:max-w-md md:mx-auto rounded-t-2xl md:rounded-lg border border-gray-200 dark:border-gray-700 shadow-2xl pointer-events-auto max-h-[75vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Guest Profile
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <IoCloseOutline className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="overflow-y-auto max-h-[calc(75vh-60px)]">
            {loading ? (
              <div className="p-4">
                <ProfileSkeleton />
              </div>
            ) : (
              <div className="p-4">
                {/* Profile Header */}
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2 bg-gray-300 dark:bg-gray-600 border-2 border-gray-200 dark:border-gray-600">
                    {(profileData?.profilePhotoUrl || guest.profilePhotoUrl) ? (
                      <img
                        src={profileData?.profilePhotoUrl || guest.profilePhotoUrl || ''}
                        alt={guestName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IoPersonCircleOutline className="w-10 h-10 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {getFirstName(profileData?.name) || guestName}
                  </h3>

                  {(profileData?.isVerified || guest.isVerified) && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <IoCheckmarkCircleOutline
                        className="w-3.5 h-3.5 text-green-600"
                        title="Documents + Insurance Verified"
                      />
                      <span className="text-xs text-green-600">Verified</span>
                    </div>
                  )}
                </div>

                {/* Location and Member Info */}
                <div className="space-y-2 mb-4">
                  {(profileData?.location || profileData?.city || guest.city) && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <IoLocationOutline className="w-3.5 h-3.5" />
                      <span>
                        {profileData?.location ||
                          (profileData?.city && profileData?.state
                            ? `${profileData.city}, ${profileData.state}`
                            : guest.city && guest.state
                              ? `${guest.city}, ${guest.state}`
                              : '')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <IoCalendarOutline className="w-3.5 h-3.5" />
                    <span>Member since {formatMemberSince(profileData?.memberSince || guest.memberSince)}</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {profileData?.tripCount ?? guest.tripCount ?? 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Trips
                    </div>
                  </div>

                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {profileData?.reviewCount ?? 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Reviews
                    </div>
                  </div>

                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="text-lg font-bold text-gray-900 dark:text-white flex items-center justify-center gap-0.5">
                      {averageRating > 0 ? averageRating.toFixed(1) : '—'}
                      {averageRating > 0 && <IoStar className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Avg Rating
                    </div>
                  </div>
                </div>

                {/* Recent Reviews */}
                {profileData?.recentReviews && profileData.recentReviews.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Recent Reviews
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {profileData.recentReviews.map(review => {
                        const isExpanded = expandedReviews.includes(review.id)
                        const isHostExpanded = expandedHostResponses.includes(review.id)
                        const isSupportExpanded = expandedSupportResponses.includes(review.id)

                        // Use fullComment if available, otherwise use comment
                        const fullComment = review.fullComment || review.comment
                        const isLongComment = fullComment && fullComment.length > 80
                        const isLongHostResponse = review.hostResponse && review.hostResponse.length > 60
                        const isLongSupportResponse = review.supportResponse && review.supportResponse.length > 60

                        const displayComment = !fullComment ? '' :
                          (isExpanded || !isLongComment ? fullComment : fullComment.substring(0, 80) + '...')
                        const displayHostResponse = !review.hostResponse ? '' :
                          (isHostExpanded || !isLongHostResponse ? review.hostResponse : review.hostResponse.substring(0, 60) + '...')
                        const displaySupportResponse = !review.supportResponse ? '' :
                          (isSupportExpanded || !isLongSupportResponse ? review.supportResponse : review.supportResponse.substring(0, 60) + '...')

                        return (
                          <div
                            key={review.id}
                            className="p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                          >
                            {/* Car Info - Clickable */}
                            <button
                              onClick={() => handleCarClick(review.car.id)}
                              className="w-full text-left hover:opacity-80 transition-opacity"
                            >
                              <div className="flex items-start gap-2 mb-1.5">
                                {review.car.photoUrl && (
                                  <img
                                    src={review.car.photoUrl}
                                    alt={review.car.displayName}
                                    className="w-10 h-8 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className="font-medium text-gray-900 dark:text-white text-xs hover:text-amber-600 dark:hover:text-amber-400 transition-colors block">
                                        {review.car.year} {review.car.make}
                                      </span>
                                      <span className="text-xs text-gray-600 dark:text-gray-400">
                                        {review.car.model}
                                      </span>
                                    </div>
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
                                </div>
                              </div>
                            </button>

                            {/* Review Comment */}
                            {fullComment && (
                              <div className="ml-12">
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

                            {/* Host Response */}
                            {review.hostResponse && (
                              <div className="mt-1.5 ml-12 pl-2 border-l-2 border-blue-400">
                                <div className="flex items-center gap-1 mb-0.5">
                                  {review.host?.profilePhoto ? (
                                    <img
                                      src={review.host.profilePhoto}
                                      alt={review.host.name || 'Host'}
                                      className="w-3 h-3 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-3 h-3 rounded-full overflow-hidden flex-shrink-0 bg-gray-300 dark:bg-gray-600">
                                      <div className="w-full h-full flex items-center justify-center">
                                        <IoPersonOutline className="w-2 h-2 text-gray-500 dark:text-gray-400" />
                                      </div>
                                    </div>
                                  )}
                                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                    {getFirstName(review.host?.name || 'Host')}
                                  </p>
                                  {review.hostRespondedAt && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      • {formatFullDate(review.hostRespondedAt)}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 ml-4">
                                  {displayHostResponse}
                                </p>
                                {isLongHostResponse && (
                                  <button
                                    onClick={() => toggleHostResponseExpansion(review.id)}
                                    className="text-xs font-medium text-blue-600 hover:text-blue-700 mt-0.5 ml-4 flex items-center gap-0.5"
                                  >
                                    {isHostExpanded ? (
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

                            {/* Support Response */}
                            {review.supportResponse && (
                              <div className="mt-1.5 ml-12 pl-2 border-l-2 border-green-400">
                                <div className="flex items-center gap-1 mb-0.5">
                                  <IoShieldCheckmarkOutline className="w-3 h-3 text-green-600 dark:text-green-400" />
                                  <p className="text-xs font-medium text-green-600 dark:text-green-400">
                                    Support
                                  </p>
                                  {review.supportRespondedAt && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      • {formatFullDate(review.supportRespondedAt)}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {displaySupportResponse}
                                </p>
                                {isLongSupportResponse && (
                                  <button
                                    onClick={() => toggleSupportResponseExpansion(review.id)}
                                    className="text-xs font-medium text-green-600 hover:text-green-700 mt-0.5 flex items-center gap-0.5"
                                  >
                                    {isSupportExpanded ? (
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

                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-12">
                              {formatFullDate(review.createdAt)}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
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
