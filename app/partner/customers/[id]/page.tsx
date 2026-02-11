// app/partner/customers/[id]/page.tsx
// Partner Customer Detail View

'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  IoArrowBackOutline,
  IoPersonOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoCarOutline,
  IoReceiptOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoHourglassOutline,
  IoWarningOutline,
  IoChevronForwardOutline,
  IoShieldCheckmarkOutline,
  IoStar,
  IoStarOutline
} from 'react-icons/io5'

interface CustomerStats {
  totalSpent: number
  tripCount: number
  completedTrips: number
  activeBookings: number
}

interface CustomerVerification {
  status: 'not_started' | 'pending' | 'verified' | 'failed' | null
  verifiedAt: string | null
  verifiedFirstName: string | null
  verifiedLastName: string | null
}

interface Customer {
  id: string
  name: string
  firstName: string | null
  lastName: string | null
  email: string
  phone: string | null
  photo: string | null
  reviewerProfileId: string | null
  location: string | null
  address: string | null
  bio: string | null
  memberSince: string
  emergencyContact: {
    name: string
    phone: string | null
    relation: string | null
  } | null
  verification: CustomerVerification
  stats: CustomerStats
}

interface Booking {
  id: string
  vehicle: string
  vehicleId: string
  vehiclePhoto: string | null
  startDate: string
  endDate: string
  status: string
  total: number
  createdAt: string
}

interface Charge {
  id: string
  bookingId: string
  reason: string
  amount: number
  description: string
  status: string
  createdAt: string
}

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string | null
  vehicle: string
  createdAt: string
}

interface ReviewerStats {
  totalReviews: number
  averageRating: number
}

interface ReviewerReview {
  id: string
  rating: number
  title: string | null
  comment: string | null
  createdAt: string
  tripStartDate: string | null
  tripEndDate: string | null
  hostResponse: string | null
  car: {
    displayName: string
    photoUrl: string | null
  } | null
}

interface ReviewerProfile {
  name: string
  profilePhotoUrl: string | null
  location: string | null
  memberSince: string | null
  tripCount: number
  isVerified: boolean
  stats: ReviewerStats
  recentReviews: ReviewerReview[]
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [charges, setCharges] = useState<Charge[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewerProfile, setReviewerProfile] = useState<ReviewerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showChargeModal, setShowChargeModal] = useState(false)
  const [selectedBookingForCharge, setSelectedBookingForCharge] = useState<string | null>(null)

  useEffect(() => {
    fetchCustomerData()
    fetchCharges()
  }, [id])

  const fetchCustomerData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/partner/customers/${id}`)
      const data = await response.json()

      if (data.success) {
        setCustomer(data.customer)
        setBookings(data.bookings)
        setReviews(data.reviews || [])

        // Fetch full reviewer profile from existing API
        if (data.customer?.reviewerProfileId) {
          try {
            const reviewerRes = await fetch(`/api/rentals/reviewers/${data.customer.reviewerProfileId}`)
            const reviewerData = await reviewerRes.json()
            if (reviewerData.success) {
              setReviewerProfile(reviewerData.data)
            }
          } catch { /* non-critical */ }
        }
      }
    } catch (error) {
      console.error('Failed to fetch customer:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCharges = async () => {
    try {
      const response = await fetch(`/api/partner/customers/${id}/charge`)
      const data = await response.json()
      if (data.success) {
        setCharges(data.charges)
      }
    } catch (error) {
      console.error('Failed to fetch charges:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      case 'IN_PROGRESS':
      case 'ACTIVE':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'COMPLETED':
      case 'FINISHED':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      case 'PENDING':
      case 'PENDING_APPROVAL':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
      case 'COMPLETED':
      case 'FINISHED':
        return <IoCheckmarkCircleOutline className="w-4 h-4" />
      case 'IN_PROGRESS':
      case 'ACTIVE':
        return <IoCarOutline className="w-4 h-4" />
      case 'CANCELLED':
      case 'REJECTED':
        return <IoCloseCircleOutline className="w-4 h-4" />
      case 'PENDING':
      case 'PENDING_APPROVAL':
        return <IoHourglassOutline className="w-4 h-4" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6" />
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12">
          <IoWarningOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Customer not found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            This customer may have been removed or you don't have access.
          </p>
          <Link
            href="/partner/customers"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <IoArrowBackOutline className="w-5 h-5" />
            Back to Customers
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <IoArrowBackOutline className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{customer.name}</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Customer since {formatDate(customer.memberSince)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer Profile */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-4">
              {customer.photo ? (
                <div className="w-20 h-20 rounded-full border border-white shadow-sm overflow-hidden">
                  <img
                    src={customer.photo}
                    alt={customer.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded-full border border-white shadow-sm flex items-center justify-center">
                  <IoPersonOutline className="w-10 h-10 text-gray-500 dark:text-gray-400" />
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{customer.name}</h2>
                {customer.location && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <IoLocationOutline className="w-4 h-4" />
                    {customer.location}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">
                  Member since {formatDate(customer.memberSince)}
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {customer.verification.status === 'verified' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-full text-xs font-medium text-green-700 dark:text-green-400">
                  <IoShieldCheckmarkOutline className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
              {customer.stats.completedTrips >= 5 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-full text-xs font-medium text-purple-700 dark:text-purple-400">
                  <IoStar className="w-3.5 h-3.5" />
                  Frequent Renter
                </span>
              )}
              {customer.stats.activeBookings > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-full text-xs font-medium text-blue-700 dark:text-blue-400">
                  <IoCarOutline className="w-3.5 h-3.5" />
                  Active Rental
                </span>
              )}
              {reviewerProfile && reviewerProfile.stats.averageRating >= 4.5 && reviewerProfile.stats.totalReviews >= 2 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-full text-xs font-medium text-yellow-700 dark:text-yellow-400">
                  <IoStar className="w-3.5 h-3.5" />
                  Top Rated
                </span>
              )}
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{customer.stats.tripCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Bookings</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(customer.stats.totalSpent)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Spent</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{customer.stats.completedTrips}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{customer.stats.activeBookings}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Bookings & Charges */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bookings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Booking History</h3>
            </div>
            {bookings.length === 0 ? (
              <div className="p-8 text-center">
                <IoCalendarOutline className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No bookings yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {bookings.map((booking) => (
                  <div key={booking.id} className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start gap-3">
                      {/* Vehicle Photo */}
                      <div className="w-12 h-9 sm:w-16 sm:h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        {booking.vehiclePhoto ? (
                          <img src={booking.vehiclePhoto} alt={booking.vehicle} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <IoCarOutline className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Booking Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1 flex-wrap">
                          <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                            {booking.vehicle}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span className="hidden sm:inline">{booking.status.replace('_', ' ')}</span>
                            <span className="sm:hidden">{booking.status.replace('_', ' ').split(' ')[0]}</span>
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          <span className="truncate">{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(booking.total)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            setSelectedBookingForCharge(booking.id)
                            setShowChargeModal(true)
                          }}
                          className="p-1.5 sm:p-2 text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Add Charge"
                        >
                          <IoReceiptOutline className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <Link
                          href={`/partner/bookings/${booking.id}`}
                          className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <IoChevronForwardOutline className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews left for your vehicles */}
          {reviews.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">Reviews for Your Vehicles ({reviews.length})</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map(star => (
                          star <= review.rating
                            ? <IoStar key={star} className="w-4 h-4 text-yellow-400" />
                            : <IoStarOutline key={star} className="w-4 h-4 text-gray-300 dark:text-gray-500" />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{review.vehicle}</p>
                    {review.title && (
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{review.title}</p>
                    )}
                    {review.comment && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Platform Review History (from reviewer profile) */}
          {reviewerProfile && reviewerProfile.recentReviews.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Platform Review History</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>{reviewerProfile.stats.totalReviews} reviews</span>
                    {reviewerProfile.stats.averageRating > 0 && (
                      <span className="flex items-center gap-1">
                        <IoStar className="w-3.5 h-3.5 text-yellow-400" />
                        {reviewerProfile.stats.averageRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {reviewerProfile.recentReviews.map((review) => (
                  <div key={review.id} className="p-4">
                    <div className="flex items-start gap-3">
                      {review.car?.photoUrl && (
                        <div className="w-12 h-9 sm:w-16 sm:h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={review.car.photoUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map(star => (
                              star <= review.rating
                                ? <IoStar key={star} className="w-3.5 h-3.5 text-yellow-400" />
                                : <IoStarOutline key={star} className="w-3.5 h-3.5 text-gray-300 dark:text-gray-500" />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        {review.car && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{review.car.displayName}</p>
                        )}
                        {review.title && (
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{review.title}</p>
                        )}
                        {review.comment && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{review.comment}</p>
                        )}
                        {review.hostResponse && (
                          <div className="mt-2 ml-3 pl-3 border-l-2 border-blue-300 dark:border-blue-600">
                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Host Response</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{review.hostResponse}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charges */}
          {charges.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">Additional Charges</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {charges.map((charge) => (
                  <div key={charge.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {charge.reason.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {charge.description} • {formatDate(charge.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(charge.amount)}
                      </p>
                      <span className={`text-xs capitalize ${
                        charge.status === 'paid' ? 'text-green-600 dark:text-green-400' :
                        charge.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-gray-500 dark:text-gray-400'
                      }`}>
                        {charge.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charge Modal */}
      {showChargeModal && selectedBookingForCharge && (
        <ChargeModal
          customerId={customer.id}
          bookingId={selectedBookingForCharge}
          onClose={() => {
            setShowChargeModal(false)
            setSelectedBookingForCharge(null)
          }}
          onSuccess={() => {
            setShowChargeModal(false)
            setSelectedBookingForCharge(null)
            fetchCharges()
          }}
        />
      )}
    </div>
  )
}

// Charge Modal Component
function ChargeModal({
  customerId,
  bookingId,
  onClose,
  onSuccess
}: {
  customerId: string
  bookingId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [reason, setReason] = useState<string>('damage')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/partner/customers/${customerId}/charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          reason,
          amount: parseFloat(amount),
          description
        })
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
      } else {
        setError(data.error || 'Failed to create charge')
      }
    } catch (err) {
      setError('Failed to create charge')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Charge</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Charge Type
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="damage">Damage</option>
              <option value="cleaning">Cleaning</option>
              <option value="late_fee">Late Return Fee</option>
              <option value="mileage">Mileage Overage</option>
              <option value="fuel">Fuel</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Additional details..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-medium text-sm transition-colors"
            >
              {loading ? 'Creating...' : 'Add Charge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
