// app/partner/claims/page.tsx
// Partner Claims Management Dashboard

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IoShieldCheckmarkOutline,
  IoCarOutline,
  IoAddOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoCloseCircleOutline,
  IoChevronForwardOutline,
  IoFilterOutline,
  IoImageOutline,
  IoPersonOutline,
  IoChatbubbleOutline,
  IoReceiptOutline,
  IoCloseOutline
} from 'react-icons/io5'

interface Claim {
  id: string
  type: string
  status: string
  description: string
  incidentDate: string
  createdAt: string
  estimatedCost: number | null
  approvedAmount: number | null
  paidAmount: number | null
  vehicleName: string
  vehicleId: string | null
  vehiclePhoto: string | null
  guestName: string
  guestEmail: string | null
  bookingId: string
  photoUrl: string | null
  photoCount: number
  hasUnreadMessages: boolean
  lastMessageAt: string | null
}

interface Stats {
  total: number
  pending: number
  approved: number
  disputed: number
  totalEstimated: number
  totalPaid: number
}

const CLAIM_TYPE_LABELS: Record<string, string> = {
  ACCIDENT: 'Accident',
  THEFT: 'Theft',
  VANDALISM: 'Vandalism',
  CLEANING: 'Cleaning',
  MECHANICAL: 'Mechanical',
  WEATHER: 'Weather Damage',
  OTHER: 'Other'
}

const CLAIM_STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: {
    label: 'Pending',
    color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    icon: <IoTimeOutline className="w-3 h-3" />
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    icon: <IoTimeOutline className="w-3 h-3" />
  },
  APPROVED: {
    label: 'Approved',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    icon: <IoCheckmarkCircleOutline className="w-3 h-3" />
  },
  DENIED: {
    label: 'Denied',
    color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    icon: <IoCloseCircleOutline className="w-3 h-3" />
  },
  PAID: {
    label: 'Paid',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    icon: <IoCheckmarkCircleOutline className="w-3 h-3" />
  },
  DISPUTED: {
    label: 'Disputed',
    color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    icon: <IoWarningOutline className="w-3 h-3" />
  },
  RESOLVED: {
    label: 'Resolved',
    color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    icon: <IoCheckmarkCircleOutline className="w-3 h-3" />
  },
  GUEST_RESPONSE_PENDING: {
    label: 'Awaiting Guest',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    icon: <IoPersonOutline className="w-3 h-3" />
  },
  GUEST_RESPONDED: {
    label: 'Guest Responded',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    icon: <IoChatbubbleOutline className="w-3 h-3" />
  }
}

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0, pending: 0, approved: 0, disputed: 0, totalEstimated: 0, totalPaid: 0
  })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showNewModal, setShowNewModal] = useState(false)

  useEffect(() => {
    fetchClaims()
  }, [statusFilter])

  const fetchClaims = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('status', statusFilter)

      const response = await fetch(`/api/partner/claims?${params}`)
      const data = await response.json()

      if (data.success) {
        setClaims(data.claims)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch claims:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const config = CLAIM_STATUS_CONFIG[status] || {
      label: status,
      color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
      icon: null
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Claims</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage damage claims and insurance matters
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium text-sm transition-colors"
        >
          <IoAddOutline className="w-5 h-5" />
          File New Claim
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <IoTimeOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.approved}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <IoReceiptOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalEstimated)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Estimated</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <IoShieldCheckmarkOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalPaid)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Paid Out</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'DISPUTED', 'PAID'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {status === 'all' ? 'All' : CLAIM_STATUS_CONFIG[status]?.label || status}
            </button>
          ))}
        </div>
      </div>

      {/* Claims List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading claims...</p>
          </div>
        ) : claims.length === 0 ? (
          <div className="p-8 text-center">
            <IoShieldCheckmarkOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No claims found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {statusFilter !== 'all'
                ? 'No claims match the selected filter'
                : 'Claims will appear here when filed'}
            </p>
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              <IoAddOutline className="w-5 h-5" />
              File New Claim
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {claims.map((claim) => (
              <Link
                key={claim.id}
                href={`/partner/claims/${claim.id}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {/* Photo/Vehicle */}
                <div className="w-16 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 relative">
                  {claim.photoUrl ? (
                    <img src={claim.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : claim.vehiclePhoto ? (
                    <img src={claim.vehiclePhoto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <IoCarOutline className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  {claim.photoCount > 1 && (
                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1 rounded">
                      +{claim.photoCount - 1}
                    </span>
                  )}
                </div>

                {/* Claim Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {CLAIM_TYPE_LABELS[claim.type] || claim.type}
                    </span>
                    {getStatusBadge(claim.status)}
                    {claim.hasUnreadMessages && (
                      <span className="w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{claim.vehicleName}</span>
                    <span>{claim.guestName}</span>
                    <span>{formatDate(claim.incidentDate)}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                    {claim.description}
                  </p>
                </div>

                {/* Amount & Arrow */}
                <div className="text-right flex-shrink-0">
                  {claim.estimatedCost && (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(claim.estimatedCost)}
                    </p>
                  )}
                  {claim.paidAmount && claim.paidAmount > 0 && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Paid: {formatCurrency(claim.paidAmount)}
                    </p>
                  )}
                </div>

                <IoChevronForwardOutline className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* New Claim Modal */}
      {showNewModal && (
        <NewClaimModal
          onClose={() => setShowNewModal(false)}
          onSuccess={() => {
            setShowNewModal(false)
            fetchClaims()
          }}
        />
      )}
    </div>
  )
}

// New Claim Modal Component
function NewClaimModal({
  onClose,
  onSuccess
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [bookings, setBookings] = useState<any[]>([])
  const [formData, setFormData] = useState({
    bookingId: '',
    type: 'ACCIDENT',
    description: '',
    incidentDate: new Date().toISOString().split('T')[0],
    estimatedCost: '',
    photoUrls: ''
  })

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/partner/bookings')
      const data = await response.json()
      if (data.success) {
        // Only show recent completed or in-progress bookings
        setBookings(data.bookings.filter((b: any) =>
          ['confirmed', 'active', 'completed'].includes(b.status)
        ))
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/partner/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          photoUrls: formData.photoUrls.split(',').map(s => s.trim()).filter(Boolean)
        })
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
      } else {
        setError(data.error || 'Failed to file claim')
      }
    } catch (err) {
      setError('Failed to file claim')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full my-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">File New Claim</h3>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <IoCloseOutline className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Booking Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Booking *</label>
            <select
              value={formData.bookingId}
              onChange={(e) => updateField('bookingId', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select booking</option>
              {bookings.map((booking) => (
                <option key={booking.id} value={booking.id}>
                  {booking.vehicleName} - {booking.guestName} ({new Date(booking.startDate).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {/* Claim Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Claim Type *</label>
            <select
              value={formData.type}
              onChange={(e) => updateField('type', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
            >
              {Object.entries(CLAIM_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Incident Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Incident Date *</label>
            <input
              type="date"
              value={formData.incidentDate}
              onChange={(e) => updateField('incidentDate', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              required
              rows={3}
              placeholder="Describe the incident in detail..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Estimated Cost */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Cost</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={formData.estimatedCost}
                onChange={(e) => updateField('estimatedCost', e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Photo URLs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Photo URLs <span className="text-gray-400">(comma separated)</span>
            </label>
            <input
              type="text"
              value={formData.photoUrls}
              onChange={(e) => updateField('photoUrls', e.target.value)}
              placeholder="https://... , https://..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Upload photos to cloud storage and paste URLs</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-medium"
            >
              {loading ? 'Filing...' : 'File Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
