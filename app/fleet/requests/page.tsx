// app/fleet/requests/page.tsx
// Fleet Admin - Manage Reservation Requests

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import CreateRequestModal from './components/CreateRequestModal'
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
                  {/* Main Row - Mobile Optimized */}
                  <div
                    className="p-3 sm:p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    onClick={() => toggleExpand(request.id)}
                  >
                    {/* Top Row: Code, Status, Priority, Expand Icon */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 min-w-0">
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate">
                          #{request.requestCode.slice(-8)}
                        </span>
                        <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ${getStatusBadge(request.status)}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                        {request.priority !== 'NORMAL' && (
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ${getPriorityBadge(request.priority)}`}>
                            {request.priority}
                          </span>
                        )}
                        {request.source && (
                          <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            via {request.source}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Meta counts - always visible */}
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-0.5" title="Views">
                            <IoEyeOutline className="w-3 h-3" />
                            {request.viewCount}
                          </span>
                          <span className="flex items-center gap-0.5" title="Claims">
                            <IoHandRightOutline className="w-3 h-3" />
                            {request.claims?.length || 0}
                          </span>
                          {(request.invitedProspects?.length || 0) > 0 && (
                            <span className="flex items-center gap-0.5" title="Prospects">
                              <IoPeopleOutline className="w-3 h-3" />
                              {request.invitedProspects.length}
                            </span>
                          )}
                        </div>
                        {isExpanded ? (
                          <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
                        ) : (
                          <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Vehicle & Guest Row */}
                    <div className="flex items-start gap-3">
                      {/* Vehicle Icon - Smaller on mobile */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IoCarOutline className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                      </div>

                      {/* Request Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base leading-tight">
                          {request.vehicleMake || request.vehicleType || 'Any Vehicle'}
                          {request.vehicleModel && ` ${request.vehicleModel}`}
                          {request.quantity > 1 && ` (x${request.quantity})`}
                        </h3>

                        {/* Info Grid - Stacks better on mobile */}
                        <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-0.5 sm:gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          <span className="flex items-center gap-1 truncate">
                            <IoPersonOutline className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{request.guestName}</span>
                          </span>
                          {request.pickupCity && (
                            <span className="flex items-center gap-1 truncate">
                              <IoLocationOutline className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">{request.pickupCity}, {request.pickupState}</span>
                            </span>
                          )}
                          {request.startDate && (
                            <span className="flex items-center gap-1">
                              <IoCalendarOutline className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">
                                {formatDate(request.startDate)} - {formatDate(request.endDate)}
                                {request.durationDays && ` (${request.durationDays}d)`}
                              </span>
                            </span>
                          )}
                          {request.offeredRate && (
                            <span className="flex items-center gap-1">
                              <IoCashOutline className="w-3.5 h-3.5 flex-shrink-0 text-green-600" />
                              <span className="font-medium text-green-600 dark:text-green-400">
                                ${request.offeredRate}/day
                              </span>
                              {request.isNegotiable && <span className="text-[10px] text-gray-500">(negotiable)</span>}
                            </span>
                          )}
                        </div>

                        {/* Mobile: Source & Date */}
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400 sm:hidden">
                          {request.source && <span>via {request.source}</span>}
                          <span>{formatDateTime(request.createdAt)}</span>
                        </div>

                        {/* Desktop: Date */}
                        <span className="hidden sm:block mt-1 text-xs text-gray-400">
                          {formatDateTime(request.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Claim Status */}
                    {activeClaim && (
                      <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs sm:text-sm">
                          <IoHandRightOutline className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                          <span className="font-medium text-yellow-700 dark:text-yellow-300">
                            Claimed by {activeClaim.host.name}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium ${getClaimStatusBadge(activeClaim.status)}`}>
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
