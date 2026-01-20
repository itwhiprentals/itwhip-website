// app/partner/dashboard/components/OpenRequestsCard.tsx
// Displays open reservation requests that hosts can claim

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IoDocumentTextOutline,
  IoCarOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoCashOutline,
  IoArrowForwardOutline,
  IoTimeOutline,
  IoFlashOutline,
  IoHandRightOutline,
  IoRefreshOutline,
  IoWarningOutline
} from 'react-icons/io5'

interface OpenRequest {
  id: string
  requestCode: string
  vehicleType?: string
  vehicleMake?: string
  vehicleModel?: string
  pickupCity?: string
  pickupState?: string
  startDate?: string
  endDate?: string
  durationDays?: number
  offeredRate?: number
  isNegotiable: boolean
  priority: string
  createdAt: string
}

interface MyClaim {
  id: string
  requestId: string
  status: string
  claimExpiresAt: string
  request: {
    id: string
    vehicleMake?: string
    vehicleType?: string
    offeredRate?: number
  }
}

interface RequestStats {
  openCount: number
  myActiveClaimCount: number
}

export default function OpenRequestsCard() {
  const [requests, setRequests] = useState<OpenRequest[]>([])
  const [myClaims, setMyClaims] = useState<MyClaim[]>([])
  const [stats, setStats] = useState<RequestStats>({ openCount: 0, myActiveClaimCount: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/partner/requests?limit=3', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch requests')
      }

      const data = await response.json()
      if (data.success) {
        setRequests(data.requests || [])
        setMyClaims(data.myClaims || [])
        setStats({
          openCount: data.openCount || 0,
          myActiveClaimCount: data.myActiveClaimCount || 0
        })
      }
    } catch (err) {
      console.error('Error fetching requests:', err)
      setError('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  // Auto-refresh countdown timers
  useEffect(() => {
    if (myClaims.length === 0) return

    const interval = setInterval(() => {
      setMyClaims(prev => [...prev])
    }, 1000)
    return () => clearInterval(interval)
  }, [myClaims.length])

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'TBD'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()

    if (diff <= 0) return { expired: true, text: 'Expired' }

    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)

    if (minutes >= 1) {
      return { expired: false, text: `${minutes}m ${seconds}s`, urgent: minutes < 5 }
    }
    return { expired: false, text: `${seconds}s`, urgent: true }
  }

  // Get active claims that need car assignment
  const pendingCarClaims = myClaims.filter(c => c.status === 'PENDING_CAR')

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-4">
          <p className="text-gray-500 dark:text-gray-400 mb-2">{error}</p>
          <button
            onClick={fetchRequests}
            className="text-orange-600 hover:text-orange-700 text-sm flex items-center gap-1 mx-auto"
          >
            <IoRefreshOutline className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <IoDocumentTextOutline className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Open Requests</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stats.openCount} available to claim
              </p>
            </div>
          </div>
          <Link
            href="/partner/requests"
            className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1"
          >
            View All
            <IoArrowForwardOutline className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Active Claims Warning */}
      {pendingCarClaims.length > 0 && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-2">
            <IoWarningOutline className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                You have {pendingCarClaims.length} claim{pendingCarClaims.length > 1 ? 's' : ''} waiting for car assignment
              </p>
              {pendingCarClaims.map((claim) => {
                const timer = getTimeRemaining(claim.claimExpiresAt)
                return (
                  <div key={claim.id} className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-yellow-700 dark:text-yellow-300">
                      {claim.request.vehicleMake || claim.request.vehicleType || 'Request'}
                    </span>
                    <span className={`text-xs font-medium ${timer.urgent ? 'text-red-600' : 'text-yellow-600'}`}>
                      <IoTimeOutline className="w-3 h-3 inline mr-1" />
                      {timer.text}
                    </span>
                  </div>
                )
              })}
              <Link
                href="/partner/requests?filter=my_claims"
                className="text-xs text-yellow-700 dark:text-yellow-300 hover:underline mt-1 inline-block"
              >
                Assign car now →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Request List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {requests.length === 0 ? (
          <div className="p-6 text-center">
            <IoDocumentTextOutline className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No open requests right now
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Check back later for new opportunities
            </p>
          </div>
        ) : (
          requests.map((request) => (
            <Link
              key={request.id}
              href={`/partner/requests`}
              className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IoCarOutline className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {request.vehicleMake || request.vehicleType || 'Any Vehicle'}
                    </span>
                    {request.priority === 'URGENT' && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs">
                        <IoFlashOutline className="w-3 h-3" />
                        Urgent
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {request.pickupCity && (
                      <span className="flex items-center gap-1">
                        <IoLocationOutline className="w-3 h-3" />
                        {request.pickupCity}
                      </span>
                    )}
                    {request.durationDays && (
                      <span className="flex items-center gap-1">
                        <IoCalendarOutline className="w-3 h-3" />
                        {request.durationDays}d
                      </span>
                    )}
                    {request.offeredRate && (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                        <IoCashOutline className="w-3 h-3" />
                        ${request.offeredRate}/day
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <IoHandRightOutline className="w-5 h-5 text-orange-500" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Footer */}
      {requests.length > 0 && stats.openCount > 3 && (
        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/partner/requests"
            className="w-full py-2 text-center text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium flex items-center justify-center gap-1"
          >
            View {stats.openCount - 3} more requests
            <IoArrowForwardOutline className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
