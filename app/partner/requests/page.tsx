// app/partner/requests/page.tsx
// Partner Requests Page - Browse and claim open reservation requests

'use client'

import { useLocale, useTranslations } from 'next-intl'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  IoDocumentTextOutline,
  IoSearchOutline,
  IoCarOutline,
  IoTimeOutline,
  IoPersonOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoCashOutline,
  IoHandRightOutline,
  IoRefreshOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoCloseCircleOutline,
  IoFlashOutline,
  IoArrowBackOutline,
  IoTrashOutline
} from 'react-icons/io5'

interface MyClaim {
  id: string
  status: string
  claimExpiresAt: string
  carId?: string
  car?: {
    id: string
    make: string
    model: string
    year: number
  }
  offeredRate?: number
}

interface ReservationRequest {
  id: string
  requestCode: string
  requestType: string
  guestName: string
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
  viewCount: number
  claimAttempts: number
  createdAt: string
  myClaim?: MyClaim
}

interface HostCar {
  id: string
  make: string
  model: string
  year: number
  dailyRate: number
  photo?: string
  isActive: boolean
}

export default function PartnerRequestsPage() {
  const locale = useLocale()
  const t = useTranslations('PartnerRequests')

  const [requests, setRequests] = useState<ReservationRequest[]>([])
  const [myCars, setMyCars] = useState<HostCar[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('open')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null)
  const [claimingRequest, setClaimingRequest] = useState<string | null>(null)
  const [assigningCar, setAssigningCar] = useState<{ requestId: string; claimId: string } | null>(null)
  const [selectedCarId, setSelectedCarId] = useState<string>('')
  const [clearing, setClearing] = useState(false)
  const [stats, setStats] = useState({
    openCount: 0,
    myClaimsCount: 0,
    myActiveClaimCount: 0
  })

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter === 'my_claims') {
        params.append('myClaims', 'true')
      }
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/partner/requests?${params}`)
      const data = await response.json()

      if (data.success) {
        setRequests(data.requests || [])
        setStats({
          openCount: data.openCount || 0,
          myClaimsCount: data.myClaimsCount || 0,
          myActiveClaimCount: data.myActiveClaimCount || 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error)
    } finally {
      setLoading(false)
    }
  }, [filter, searchTerm])

  const fetchMyCars = async () => {
    try {
      const response = await fetch('/api/partner/fleet?active=true')
      const data = await response.json()
      if (data.success) {
        setMyCars(data.vehicles || [])
      }
    } catch (error) {
      console.error('Failed to fetch cars:', error)
    }
  }

  const clearAllClaims = async () => {
    if (!window.confirm(t('confirmClearAll'))) return

    setClearing(true)
    try {
      const response = await fetch('/api/partner/requests/clear', {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        fetchRequests()
      } else {
        alert(data.error || t('failedToClear'))
      }
    } catch (error) {
      console.error('Failed to clear claims:', error)
      alert(t('failedToClear'))
    } finally {
      setClearing(false)
    }
  }

  useEffect(() => {
    fetchRequests()
    fetchMyCars()
  }, [fetchRequests])

  // Auto-refresh countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update countdown timers
      setRequests(prev => [...prev])
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const claimRequest = async (requestId: string) => {
    setClaimingRequest(requestId)
    try {
      const response = await fetch(`/api/partner/requests/${requestId}/claim`, {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success) {
        fetchRequests()
        setExpandedRequest(requestId)
      } else {
        alert(data.error || t('failedToClaim'))
      }
    } catch (error) {
      console.error('Failed to claim request:', error)
      alert(t('failedToClaim'))
    } finally {
      setClaimingRequest(null)
    }
  }

  const withdrawClaim = async (requestId: string) => {
    if (!confirm(t('confirmWithdraw'))) return

    try {
      const response = await fetch(`/api/partner/requests/${requestId}/claim`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        fetchRequests()
      } else {
        alert(data.error || t('failedToWithdraw'))
      }
    } catch (error) {
      console.error('Failed to withdraw claim:', error)
      alert(t('failedToWithdraw'))
    }
  }

  const assignCar = async (requestId: string, carId: string) => {
    try {
      const response = await fetch(`/api/partner/requests/${requestId}/assign-car`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId })
      })
      const data = await response.json()

      if (data.success) {
        fetchRequests()
        setAssigningCar(null)
        setSelectedCarId('')
        alert(t('carAssignedAlert'))
      } else {
        alert(data.error || t('failedToAssignCar'))
      }
    } catch (error) {
      console.error('Failed to assign car:', error)
      alert(t('failedToAssignCar'))
    }
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
      default:
        return null
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return t('tbd')
    return new Date(dateStr).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric'
    })
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()

    if (diff <= 0) return { expired: true, text: t('expired') }

    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)

    if (minutes >= 1) {
      return { expired: false, text: `${minutes}m ${seconds}s`, urgent: minutes < 5 }
    }
    return { expired: false, text: `${seconds}s`, urgent: true }
  }

  const filteredRequests = requests.filter(request => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">{t('loading')}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-900 px-4 pt-4 pb-2 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/partner/dashboard"
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <IoArrowBackOutline className="text-xl text-gray-600 dark:text-gray-400" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('title')}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('subtitle')}
              </p>
            </div>
            {stats.myActiveClaimCount > 0 && (
              <button
                onClick={clearAllClaims}
                disabled={clearing}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                title={t('clearAll')}
              >
                {clearing ? (
                  <IoRefreshOutline className="w-4 h-4 animate-spin" />
                ) : (
                  <IoTrashOutline className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{t('clearAll')}</span>
              </button>
            )}
            <button
              onClick={fetchRequests}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={t('refresh')}
            >
              <IoRefreshOutline className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.openCount}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t('statAvailable')}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.myActiveClaimCount}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t('statMyActiveClaims')}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.myClaimsCount}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t('statTotalClaims')}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('open')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'open'
                    ? 'bg-orange-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {t('filterAvailable')}
              </button>
              <button
                onClick={() => setFilter('my_claims')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'my_claims'
                    ? 'bg-orange-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {t('filterMyClaims')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {filteredRequests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <IoDocumentTextOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {filter === 'my_claims' ? t('noClaimsYet') : t('noOpenRequests')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'my_claims'
                ? t('claimToStartEarning')
                : t('checkBackLater')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => {
              const isExpanded = expandedRequest === request.id
              const hasMyClaim = !!request.myClaim
              const claimPendingCar = request.myClaim?.status === 'PENDING_CAR'
              const claimTimer = request.myClaim?.claimExpiresAt
                ? getTimeRemaining(request.myClaim.claimExpiresAt)
                : null
              const priorityBadge = getPriorityBadge(request.priority)

              return (
                <div
                  key={request.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg border overflow-hidden transition-colors ${
                    hasMyClaim
                      ? 'border-orange-300 dark:border-orange-700'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {/* Claim Timer Banner */}
                  {claimPendingCar && claimTimer && !claimTimer.expired && (
                    <div className={`px-4 py-2 flex items-center justify-between ${
                      claimTimer.urgent
                        ? 'bg-red-100 dark:bg-red-900/30'
                        : 'bg-yellow-100 dark:bg-yellow-900/30'
                    }`}>
                      <div className="flex items-center gap-2">
                        <IoTimeOutline className={`w-4 h-4 ${claimTimer.urgent ? 'text-red-600' : 'text-yellow-600'}`} />
                        <span className={`text-sm font-medium ${claimTimer.urgent ? 'text-red-700' : 'text-yellow-700'}`}>
                          {t('selectCarWithin', { time: claimTimer.text })}
                        </span>
                      </div>
                      <button
                        onClick={() => setExpandedRequest(request.id)}
                        className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                      >
                        {t('assignCar')}
                      </button>
                    </div>
                  )}

                  {/* Main Row */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    onClick={() => setExpandedRequest(isExpanded ? null : request.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Vehicle Icon */}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        hasMyClaim
                          ? 'bg-orange-100 dark:bg-orange-900/30'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <IoCarOutline className={`w-6 h-6 ${
                          hasMyClaim
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`} />
                      </div>

                      {/* Request Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {request.vehicleMake || request.vehicleType || t('anyVehicle')}
                            {request.vehicleModel && ` ${request.vehicleModel}`}
                          </h3>
                          {hasMyClaim && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                              {t('yourClaim')}
                            </span>
                          )}
                          {priorityBadge && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityBadge}`}>
                              {request.priority === 'URGENT' && <IoFlashOutline className="w-3 h-3 inline mr-1" />}
                              {t(`priority${request.priority.charAt(0)}${request.priority.slice(1).toLowerCase()}`)}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-300">
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
                            <span className="flex items-center gap-1 font-medium text-green-600 dark:text-green-400">
                              <IoCashOutline className="w-4 h-4" />
                              {t('ratePerDay', { rate: request.offeredRate })}
                              {request.isNegotiable && <span className="text-xs font-normal text-gray-500">{t('negotiable')}</span>}
                            </span>
                          )}
                        </div>

                        {request.guestNotes && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                            "{request.guestNotes}"
                          </p>
                        )}
                      </div>

                      {/* Action/Status */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {!hasMyClaim && request.status === 'OPEN' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              claimRequest(request.id)
                            }}
                            disabled={claimingRequest === request.id}
                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {claimingRequest === request.id ? (
                              <IoRefreshOutline className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <IoHandRightOutline className="w-4 h-4 inline mr-1" />
                                {t('claim')}
                              </>
                            )}
                          </button>
                        ) : (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(request.myClaim?.status || request.status)}`}>
                            {t(`status_${(request.myClaim?.status || request.status)}`)}
                          </span>
                        )}
                        {isExpanded ? (
                          <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
                        ) : (
                          <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded: Assign Car */}
                  {isExpanded && claimPendingCar && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        {t('selectVehicleToFulfill')}
                      </h4>

                      {myCars.length === 0 ? (
                        <div className="text-center py-4">
                          <IoCarOutline className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            {t('noActiveVehicles')}
                          </p>
                          <Link
                            href="/partner/fleet/add"
                            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                          >
                            {t('addVehicle')}
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {myCars.map((car) => (
                            <div
                              key={car.id}
                              onClick={() => setSelectedCarId(car.id)}
                              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                selectedCarId === car.id
                                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-12 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                                  {car.photo ? (
                                    <img src={car.photo} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <IoCarOutline className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {car.year} {car.make} {car.model}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {t('yourRate', { rate: car.dailyRate })}
                                  </div>
                                </div>
                                {selectedCarId === car.id && (
                                  <IoCheckmarkCircleOutline className="w-6 h-6 text-orange-600" />
                                )}
                              </div>
                            </div>
                          ))}

                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => {
                                if (selectedCarId) {
                                  assignCar(request.id, selectedCarId)
                                }
                              }}
                              disabled={!selectedCarId}
                              className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {t('confirmSelection')}
                            </button>
                            <button
                              onClick={() => withdrawClaim(request.id)}
                              className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              {t('withdraw')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expanded: Car Already Assigned */}
                  {isExpanded && request.myClaim?.status === 'CAR_SELECTED' && request.myClaim.car && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-green-50 dark:bg-green-900/20">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <IoCheckmarkCircleOutline className="w-5 h-5" />
                        <span className="font-medium">{t('carAssignedSuccess')}</span>
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        {request.myClaim.car.year} {request.myClaim.car.make} {request.myClaim.car.model}
                        {request.myClaim.offeredRate && ` @ ${t('ratePerDay', { rate: request.myClaim.offeredRate })}`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {t('adminWillFinalize')}
                      </p>
                    </div>
                  )}

                  {/* Expanded: No Claim - Show Details */}
                  {isExpanded && !hasMyClaim && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">{t('guest')}</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{request.guestName}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">{t('duration')}</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{request.durationDays ? t('daysCount', { count: request.durationDays }) : t('tbd')}</span>
                        </div>
                        {request.totalBudget && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">{t('totalBudget')}</span>
                            <span className="ml-2 text-gray-900 dark:text-white">${request.totalBudget}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">{t('views')}</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{request.viewCount}</span>
                        </div>
                      </div>

                      {request.guestNotes && (
                        <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded text-sm">
                          <span className="text-gray-500 dark:text-gray-400">{t('notes')} </span>
                          <span className="text-gray-700 dark:text-gray-300">{request.guestNotes}</span>
                        </div>
                      )}

                      {request.status === 'OPEN' && (
                        <button
                          onClick={() => claimRequest(request.id)}
                          disabled={claimingRequest === request.id}
                          className="w-full mt-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          {claimingRequest === request.id ? t('claiming') : t('claimThisRequest')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
            {t('howItWorks')}
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <li>{t('howStep1')}</li>
            <li>{t('howStep2')}</li>
            <li>{t('howStep3')}</li>
            <li>{t('howStep4')}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
