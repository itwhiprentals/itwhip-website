// app/fleet/requests/page.tsx
// Fleet Admin - Manage Reservation Requests

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  IoArrowBackOutline,
  IoAddOutline,
  IoSearchOutline,
  IoCarOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoCashOutline,
  IoEyeOutline,
  IoHandRightOutline,
  IoRefreshOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoWarningOutline,
  IoDocumentTextOutline,
  IoTrashOutline,
  IoCreateOutline,
  IoPeopleOutline
} from 'react-icons/io5'

interface RequestClaim {
  id: string
  hostId: string
  host: {
    id: string
    name: string
    email: string
  }
  car?: {
    id: string
    make: string
    model: string
    year: number
  }
  status: string
  claimExpiresAt: string
  claimedAt: string
  carAssignedAt?: string
  offeredRate?: number
}

interface InvitedProspect {
  id: string
  name: string
  email: string
  status: string
  inviteSentAt?: string
}

interface ReservationRequest {
  id: string
  requestCode: string
  requestType: string
  guestName: string
  guestEmail?: string
  guestPhone?: string
  vehicleType?: string
  vehicleMake?: string
  vehicleModel?: string
  quantity: number
  startDate?: string
  endDate?: string
  durationDays?: number
  pickupCity?: string
  pickupState?: string
  offeredRate?: number
  totalBudget?: number
  isNegotiable: boolean
  status: string
  priority: string
  guestNotes?: string
  adminNotes?: string
  viewCount: number
  claimAttempts: number
  source?: string
  expiresAt?: string
  createdAt: string
  claims: RequestClaim[]
  invitedProspects: InvitedProspect[]
}

interface Stats {
  total: number
  open: number
  claimed: number
  carAssigned: number
  fulfilled: number
  expired: number
  cancelled: number
  thisWeek: number
}

export default function FleetRequestsPage() {
  const searchParams = useSearchParams()
  const apiKey = searchParams.get('key') || 'phoenix-fleet-2847'

  const [requests, setRequests] = useState<ReservationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState<Stats>({
    total: 0,
    open: 0,
    claimed: 0,
    carAssigned: 0,
    fulfilled: 0,
    expired: 0,
    cancelled: 0,
    thisWeek: 0
  })
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set())
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter.toUpperCase())
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/fleet/requests?${params}&key=${apiKey}`)
      const data = await response.json()

      if (data.success) {
        setRequests(data.requests || [])
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error)
    } finally {
      setLoading(false)
    }
  }, [filter, searchTerm, apiKey])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const toggleExpand = (id: string) => {
    setExpandedRequests(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
      case 'CLAIMED':
        return 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30'
      case 'CAR_ASSIGNED':
        return 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30'
      case 'FULFILLED':
        return 'text-purple-700 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30'
      case 'EXPIRED':
        return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
      case 'CANCELLED':
        return 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
      default:
        return 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
      case 'HIGH':
        return 'text-orange-700 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30'
      case 'NORMAL':
        return 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
      case 'LOW':
        return 'text-gray-500 bg-gray-50 dark:text-gray-500 dark:bg-gray-800'
      default:
        return 'text-gray-700 bg-gray-100'
    }
  }

  const getClaimStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_CAR':
        return 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30'
      case 'CAR_SELECTED':
        return 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30'
      case 'COMPLETED':
        return 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
      case 'EXPIRED':
        return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
      case 'WITHDRAWN':
        return 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
      default:
        return 'text-gray-700 bg-gray-100'
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()

    if (diff <= 0) return 'Expired'

    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)

    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
  }

  const filteredRequests = requests.filter(request => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        request.requestCode.toLowerCase().includes(search) ||
        request.guestName.toLowerCase().includes(search) ||
        request.guestEmail?.toLowerCase().includes(search) ||
        request.vehicleMake?.toLowerCase().includes(search) ||
        request.vehicleType?.toLowerCase().includes(search) ||
        request.pickupCity?.toLowerCase().includes(search)
      )
    }
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading requests...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-900 px-4 pt-4 pb-2 sm:relative sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href={`/fleet?key=${apiKey}`}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <IoArrowBackOutline className="text-xl" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Reservation Requests
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage incoming reservation requests
              </p>
            </div>
            <Link
              href={`/fleet/prospects?key=${apiKey}`}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <IoPeopleOutline className="w-4 h-4" />
              <span className="hidden sm:inline">Prospects</span>
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <IoAddOutline className="w-4 h-4" />
              <span className="hidden sm:inline">New Request</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.open}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Open</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.claimed}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Claimed</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.carAssigned}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Car Assigned</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.fulfilled}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Fulfilled</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.expired}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Expired</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                {stats.cancelled}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Cancelled</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.thisWeek}
              </div>
              <div className="text-xs text-orange-600 dark:text-orange-400">This Week</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {['all', 'open', 'claimed', 'car_assigned', 'fulfilled', 'expired'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === f
                      ? 'bg-orange-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {f === 'all' ? 'All' : f.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
            <button
              onClick={fetchRequests}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Refresh"
            >
              <IoRefreshOutline className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {filteredRequests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <IoDocumentTextOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No requests found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'No reservation requests match this filter'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <IoAddOutline className="w-5 h-5" />
              Create New Request
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => {
              const isExpanded = expandedRequests.has(request.id)
              const activeClaim = request.claims.find(c => c.status === 'PENDING_CAR' || c.status === 'CAR_SELECTED')

              return (
                <div
                  key={request.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {/* Main Row */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    onClick={() => toggleExpand(request.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Vehicle Icon */}
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IoCarOutline className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>

                      {/* Request Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                            #{request.requestCode.slice(-8)}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                            {request.status.replace('_', ' ')}
                          </span>
                          {request.priority !== 'NORMAL' && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(request.priority)}`}>
                              {request.priority}
                            </span>
                          )}
                          {request.source && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              via {request.source}
                            </span>
                          )}
                        </div>

                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {request.vehicleMake || request.vehicleType || 'Any Vehicle'}
                          {request.vehicleModel && ` ${request.vehicleModel}`}
                          {request.quantity > 1 && ` (x${request.quantity})`}
                        </h3>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-300">
                          <span className="flex items-center gap-1">
                            <IoPersonOutline className="w-4 h-4" />
                            {request.guestName}
                          </span>
                          {request.pickupCity && (
                            <span className="flex items-center gap-1">
                              <IoLocationOutline className="w-4 h-4" />
                              {request.pickupCity}, {request.pickupState}
                            </span>
                          )}
                          {request.startDate && (
                            <span className="flex items-center gap-1">
                              <IoCalendarOutline className="w-4 h-4" />
                              {formatDate(request.startDate)} - {formatDate(request.endDate)}
                              {request.durationDays && ` (${request.durationDays}d)`}
                            </span>
                          )}
                          {request.offeredRate && (
                            <span className="flex items-center gap-1">
                              <IoCashOutline className="w-4 h-4" />
                              ${request.offeredRate}/day
                              {request.isNegotiable && <span className="text-xs text-gray-500">(negotiable)</span>}
                            </span>
                          )}
                        </div>

                        {/* Claim Status */}
                        {activeClaim && (
                          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-center gap-2 text-sm">
                              <IoHandRightOutline className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                              <span className="font-medium text-yellow-700 dark:text-yellow-300">
                                Claimed by {activeClaim.host.name}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getClaimStatusBadge(activeClaim.status)}`}>
                                {activeClaim.status.replace('_', ' ')}
                              </span>
                              {activeClaim.status === 'PENDING_CAR' && (
                                <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                                  <IoTimeOutline className="w-3 h-3" />
                                  {getTimeRemaining(activeClaim.claimExpiresAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <IoEyeOutline className="w-3 h-3" />
                            {request.viewCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <IoHandRightOutline className="w-3 h-3" />
                            {request.claims?.length || 0}
                          </span>
                          {(request.invitedProspects?.length || 0) > 0 && (
                            <span className="flex items-center gap-1">
                              <IoPeopleOutline className="w-3 h-3" />
                              {request.invitedProspects.length}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(request.createdAt)}
                        </span>
                        {isExpanded ? (
                          <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
                        ) : (
                          <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Guest Info */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Guest Information</h4>
                          <div className="space-y-1 text-sm">
                            <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <IoPersonOutline className="w-4 h-4" />
                              {request.guestName}
                            </p>
                            {request.guestEmail && (
                              <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <IoMailOutline className="w-4 h-4" />
                                {request.guestEmail}
                              </p>
                            )}
                            {request.guestPhone && (
                              <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <IoCallOutline className="w-4 h-4" />
                                {request.guestPhone}
                              </p>
                            )}
                          </div>
                          {request.guestNotes && (
                            <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded text-sm text-gray-600 dark:text-gray-300">
                              <strong>Notes:</strong> {request.guestNotes}
                            </div>
                          )}
                        </div>

                        {/* Admin Notes */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Admin Notes</h4>
                          <div className="p-2 bg-white dark:bg-gray-800 rounded text-sm text-gray-600 dark:text-gray-300 min-h-[60px]">
                            {request.adminNotes || <span className="text-gray-400">No admin notes</span>}
                          </div>
                        </div>
                      </div>

                      {/* Claims History */}
                      {request.claims.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Claims History ({request.claims.length})
                          </h4>
                          <div className="space-y-2">
                            {request.claims.map((claim) => (
                              <div
                                key={claim.id}
                                className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {claim.host.name}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getClaimStatusBadge(claim.status)}`}>
                                      {claim.status.replace('_', ' ')}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    Claimed {formatDateTime(claim.claimedAt)}
                                  </span>
                                </div>
                                {claim.car && (
                                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                    <IoCarOutline className="w-4 h-4 inline mr-1" />
                                    {claim.car.year} {claim.car.make} {claim.car.model}
                                    {claim.offeredRate && ` @ $${claim.offeredRate}/day`}
                                  </div>
                                )}
                                {claim.status === 'PENDING_CAR' && (
                                  <div className="mt-1 flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                                    <IoTimeOutline className="w-3 h-3" />
                                    Expires: {getTimeRemaining(claim.claimExpiresAt)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          href={`/fleet/requests/${request.id}/edit?key=${apiKey}`}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          <IoCreateOutline className="w-4 h-4" />
                          Edit
                        </Link>
                        <Link
                          href={`/fleet/prospects?requestId=${request.id}&key=${apiKey}`}
                          className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-sm hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors"
                        >
                          <IoPeopleOutline className="w-4 h-4" />
                          Recruit Hosts
                        </Link>
                        {request.status === 'OPEN' && (
                          <button
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-sm hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
                          >
                            <IoCloseCircleOutline className="w-4 h-4" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Request Modal */}
      {showCreateModal && (
        <CreateRequestModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchRequests()
          }}
          apiKey={apiKey}
        />
      )}
    </div>
  )
}

// Create Request Modal Component
function CreateRequestModal({
  onClose,
  onSuccess,
  apiKey
}: {
  onClose: () => void
  onSuccess: () => void
  apiKey: string
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    vehicleType: '',
    vehicleMake: '',
    vehicleModel: '',
    quantity: 1,
    startDate: '',
    endDate: '',
    durationDays: '',
    pickupCity: 'Phoenix',
    pickupState: 'AZ',
    offeredRate: '',
    isNegotiable: true,
    priority: 'NORMAL',
    source: '',
    guestNotes: '',
    adminNotes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/fleet/requests?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: Number(formData.quantity) || 1,
          durationDays: formData.durationDays ? Number(formData.durationDays) : undefined,
          offeredRate: formData.offeredRate ? Number(formData.offeredRate) : undefined,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined
        })
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
      } else {
        alert(data.error || 'Failed to create request')
      }
    } catch (error) {
      console.error('Failed to create request:', error)
      alert('Failed to create request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create New Reservation Request
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <IoCloseCircleOutline className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Guest Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Guest Name *
              </label>
              <input
                type="text"
                required
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Guest Email
              </label>
              <input
                type="email"
                value={formData.guestEmail}
                onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Guest Phone
              </label>
              <input
                type="tel"
                value={formData.guestPhone}
                onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select source</option>
                <option value="contact_form">Contact Form</option>
                <option value="fb_marketplace">FB Marketplace</option>
                <option value="phone_call">Phone Call</option>
                <option value="email">Email</option>
                <option value="referral">Referral</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vehicle Type
              </label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Any Type</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
                <option value="Minivan">Minivan</option>
                <option value="Compact">Compact</option>
                <option value="Luxury">Luxury</option>
                <option value="Electric">Electric</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Make
              </label>
              <input
                type="text"
                value={formData.vehicleMake}
                onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                placeholder="e.g. Honda, Toyota"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Model
              </label>
              <input
                type="text"
                value={formData.vehicleModel}
                onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                placeholder="e.g. Accord, Camry"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Dates and Rate */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duration (days)
              </label>
              <input
                type="number"
                min="1"
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pickup City
              </label>
              <input
                type="text"
                value={formData.pickupCity}
                onChange={(e) => setFormData({ ...formData, pickupCity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State
              </label>
              <input
                type="text"
                value={formData.pickupState}
                onChange={(e) => setFormData({ ...formData, pickupState: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Rate and Priority */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Offered Rate ($/day)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.offeredRate}
                onChange={(e) => setFormData({ ...formData, offeredRate: e.target.value })}
                placeholder="e.g. 22"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNegotiable}
                  onChange={(e) => setFormData({ ...formData, isNegotiable: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Rate negotiable</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Guest Notes
              </label>
              <textarea
                rows={3}
                value={formData.guestNotes}
                onChange={(e) => setFormData({ ...formData, guestNotes: e.target.value })}
                placeholder="Special requests from guest..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Admin Notes
              </label>
              <textarea
                rows={3}
                value={formData.adminNotes}
                onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                placeholder="Internal notes..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
