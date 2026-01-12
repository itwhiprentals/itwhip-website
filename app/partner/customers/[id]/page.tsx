// app/partner/customers/[id]/page.tsx
// Partner Customer Detail View

'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  IoArrowBackOutline,
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoCarOutline,
  IoAddOutline,
  IoReceiptOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoHourglassOutline,
  IoWarningOutline,
  IoCreateOutline,
  IoChevronForwardOutline
} from 'react-icons/io5'
import GuestProfileSheet from '@/app/reviews/components/GuestProfileSheet'

interface CustomerStats {
  totalSpent: number
  tripCount: number
  completedTrips: number
  activeBookings: number
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

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [charges, setCharges] = useState<Charge[]>([])
  const [loading, setLoading] = useState(true)
  const [showGuestProfile, setShowGuestProfile] = useState(false)
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
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <IoArrowBackOutline className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{customer.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Customer since {formatDate(customer.memberSince)}</p>
        </div>
        <div className="flex gap-2">
          {customer.reviewerProfileId && (
            <button
              onClick={() => setShowGuestProfile(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium text-sm transition-colors"
            >
              <IoPersonOutline className="w-5 h-5" />
              View Profile
            </button>
          )}
          <Link
            href={`/partner/bookings/new?customerId=${customer.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <IoAddOutline className="w-5 h-5" />
            New Booking
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Customer Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-6">
              {customer.photo ? (
                <img
                  src={customer.photo}
                  alt={customer.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
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
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <IoMailOutline className="w-5 h-5 text-gray-400" />
                <a href={`mailto:${customer.email}`} className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400">
                  {customer.email}
                </a>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <IoCallOutline className="w-5 h-5 text-gray-400" />
                  <a href={`tel:${customer.phone}`} className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400">
                    {customer.phone}
                  </a>
                </div>
              )}
              {customer.address && (
                <div className="flex items-start gap-3 text-sm">
                  <IoLocationOutline className="w-5 h-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{customer.address}</span>
                </div>
              )}
            </div>

            {/* Emergency Contact */}
            {customer.emergencyContact && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Emergency Contact</h3>
                <p className="text-sm text-gray-900 dark:text-white">{customer.emergencyContact.name}</p>
                {customer.emergencyContact.relation && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{customer.emergencyContact.relation}</p>
                )}
                {customer.emergencyContact.phone && (
                  <a href={`tel:${customer.emergencyContact.phone}`} className="text-sm text-orange-600 dark:text-orange-400 hover:underline">
                    {customer.emergencyContact.phone}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Stats Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Overview</h3>
            <div className="grid grid-cols-2 gap-4">
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
                  <div key={booking.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Vehicle Photo */}
                      <div className="w-16 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        {booking.vehiclePhoto ? (
                          <img src={booking.vehiclePhoto} alt={booking.vehicle} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <IoCarOutline className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Booking Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {booking.vehicle}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            {booking.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(booking.total)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedBookingForCharge(booking.id)
                            setShowChargeModal(true)
                          }}
                          className="p-2 text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Add Charge"
                        >
                          <IoReceiptOutline className="w-5 h-5" />
                        </button>
                        <Link
                          href={`/partner/bookings/${booking.id}`}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <IoChevronForwardOutline className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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

      {/* Guest Profile Sheet */}
      {customer.reviewerProfileId && (
        <GuestProfileSheet
          isOpen={showGuestProfile}
          onClose={() => setShowGuestProfile(false)}
          guest={{
            id: customer.reviewerProfileId,
            name: customer.name,
            profilePhotoUrl: customer.photo,
            memberSince: null,
            tripCount: null,
            isVerified: null,
            city: null,
            state: null
          }}
        />
      )}

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
