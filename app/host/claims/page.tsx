// app/host/claims/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import ClaimCard from './components/ClaimCard'
import ClaimStatusBadge from './components/ClaimStatusBadge'
import ClaimBanner from '../dashboard/components/ClaimBanner'
import {
  IoAddOutline,
  IoFilterOutline,
  IoDocumentTextOutline,
  IoAlertCircleOutline,
  IoRefreshOutline,
  IoLockClosedOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoShieldCheckmarkOutline,
  IoArrowBackOutline
} from 'react-icons/io5'

interface Claim {
  id: string
  claimType: 'insurance' | 'trip_charges'
  type: string
  status: string
  description: string
  estimatedCost: number
  approvedAmount: number | null
  deductible: number | null
  incidentDate: string | null
  createdAt: string
  damagePhotos?: string[]
  vehicleDeactivated?: boolean
  canCancel?: boolean
  booking: {
    id: string
    bookingCode: string
    car: {
      id?: string
      displayName: string
      heroPhoto: string | null
      isActive?: boolean
    } | null
    guest: {
      name: string
    } | null
  }
  netPayout?: number | null
  isPending?: boolean
  isApproved?: boolean
  isPaid?: boolean
}

interface ClaimNotification {
  id: string
  type: 'CLAIM_FILED' | 'CLAIM_APPROVED' | 'CLAIM_REJECTED' | 'GUEST_RESPONSE' | 'GUEST_NO_RESPONSE'
  claimId: string
  bookingCode: string
  guestName?: string
  message: string
  actionUrl?: string
  createdAt: string
  metadata?: {
    reviewNotes?: string
    rejectionReason?: string
    responseDeadline?: string
    guestResponse?: string
    estimatedCost?: number
  }
}

interface Summary {
  total: number
  pending: number
  underReview: number
  approved: number
  denied: number
  paid: number
  totalEstimated: number
  totalApproved: number
  totalPaid: number
  insuranceClaims: number
  tripCharges: number
}

function ClaimsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const approvalRequired = searchParams.get('approval_required') === 'true'
  const action = searchParams.get('action')

  const [claims, setClaims] = useState<Claim[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [refreshing, setRefreshing] = useState(false)
  const [claimNotifications, setClaimNotifications] = useState<ClaimNotification[]>([])
  const [managesOwnCars, setManagesOwnCars] = useState<boolean | null>(null)

  const isFleetManager = managesOwnCars === false

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(isFleetManager ? '/partner/dashboard' : '/host/dashboard')
    }
  }

  useEffect(() => {
    fetchAccountType()
    fetchClaims()
    fetchNotifications()
  }, [statusFilter])

  const fetchAccountType = async () => {
    try {
      const response = await fetch('/api/host/account-type', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setManagesOwnCars(data.managesOwnCars ?? true)
      }
    } catch (err) {
      console.error('Error fetching account type:', err)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/host/notifications?type=claim')
      if (response.ok) {
        const data = await response.json()
        const claimNotifs = data.notifications?.filter((n: any) => 
          ['CLAIM_FILED', 'CLAIM_APPROVED', 'CLAIM_REJECTED', 'GUEST_RESPONSE', 'GUEST_NO_RESPONSE'].includes(n.type)
        ) || []
        setClaimNotifications(claimNotifs)
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
    }
  }

  const fetchClaims = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError('')

      const url = statusFilter === 'ALL' 
        ? '/api/host/claims'
        : `/api/host/claims?status=${statusFilter}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch claims')
      }

      const data = await response.json()
      setClaims(data.claims || [])
      setSummary(data.summary || null)
    } catch (err: any) {
      console.error('Error fetching claims:', err)
      setError(err.message || 'Failed to load claims')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchClaims(true)
    fetchNotifications()
  }

  const handleDismissNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/host/notifications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationIds: [notificationId],
          action: 'mark_read'
        })
      })
      setClaimNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (err) {
      console.error('Failed to dismiss notification:', err)
    }
  }

  const statusFilters = [
    { value: 'ALL', label: 'All Claims', count: summary?.total || 0 },
    { value: 'PENDING', label: 'Pending', count: summary?.pending || 0 },
    { value: 'UNDER_REVIEW', label: 'Under Review', count: summary?.underReview || 0 },
    { value: 'APPROVED', label: 'Approved', count: summary?.approved || 0 },
    { value: 'DENIED', label: 'Denied', count: summary?.denied || 0 },
    { value: 'PAID', label: 'Paid', count: summary?.paid || 0 }
  ]

  // Get highest priority notification
  const priorityNotification = 
    claimNotifications.find(n => n.type === 'CLAIM_APPROVED') ||
    claimNotifications.find(n => n.type === 'GUEST_RESPONSE') ||
    claimNotifications.find(n => n.type === 'CLAIM_REJECTED') ||
    claimNotifications.find(n => n.type === 'GUEST_NO_RESPONSE') ||
    claimNotifications.find(n => n.type === 'CLAIM_FILED')

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 w-full">
        {/* Show claim banner if there's a priority notification */}
        {priorityNotification && (
          <div className="mb-6">
            <ClaimBanner 
              notification={priorityNotification} 
              onDismiss={handleDismissNotification}
            />
          </div>
        )}

        {/* Page header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <IoArrowBackOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {isFleetManager ? 'Managed Vehicle Claims' : 'Insurance Claims'}
                </h1>
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 ml-12">
                {isFleetManager
                  ? 'View claims for vehicles you manage'
                  : 'Manage damage claims for your rental vehicles'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm transition-colors flex items-center gap-2 ${
                  refreshing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <IoRefreshOutline className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              {/* Hide File New Claim button for Fleet Managers */}
              {!isFleetManager && (
                <Link
                  href="/host/claims/new"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
                >
                  <IoAddOutline className="w-5 h-5" />
                  <span className="hidden sm:inline">File New Claim</span>
                  <span className="sm:hidden">New</span>
                </Link>
              )}
            </div>
          </div>

          {/* Fleet Manager Info Banner */}
          {isFleetManager && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                <strong>View Only:</strong> As a Fleet Manager, you can view claims filed by vehicle owners.
                Owners are responsible for filing and managing claims on their vehicles.
              </p>
            </div>
          )}

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Claims</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {summary.total}
                    </p>
                  </div>
                  <IoDocumentTextOutline className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 opacity-60" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Pending</p>
                    <p className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {summary.pending}
                    </p>
                  </div>
                  <IoTimeOutline className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 opacity-60" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Under Review</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {summary.underReview}
                    </p>
                  </div>
                  <IoShieldCheckmarkOutline className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 opacity-60" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Approved</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                      {summary.approved}
                    </p>
                  </div>
                  <IoCheckmarkCircleOutline className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 opacity-60" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Est.</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      ${summary.totalEstimated.toLocaleString()}
                    </p>
                  </div>
                  <IoAlertCircleOutline className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 opacity-60" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Paid</p>
                    <p className="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400">
                      ${summary.totalPaid.toLocaleString()}
                    </p>
                  </div>
                  <IoCheckmarkCircleOutline className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 opacity-60" />
                </div>
              </div>
            </div>
          )}

          {/* Status Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {statusFilters.map(filter => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFilter === filter.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Claims List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <IoAlertCircleOutline className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-3" />
            <p className="text-red-800 dark:text-red-300">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : claims.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <IoDocumentTextOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {isFleetManager ? 'No claims for managed vehicles' : 'No Claims Found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {statusFilter === 'ALL'
                ? isFleetManager
                  ? "When vehicle owners file claims for vehicles you manage, they'll appear here for your reference."
                  : "You haven't filed any insurance claims yet"
                : `No claims with status "${statusFilters.find(f => f.value === statusFilter)?.label}"`}
            </p>
            {statusFilter !== 'ALL' && (
              <button
                onClick={() => setStatusFilter('ALL')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-colors"
              >
                View All Claims
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {claims.map(claim => (
              <ClaimCard 
                key={claim.id} 
                claim={claim} 
                onStatusChange={handleRefresh}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default function HostClaimsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    }>
      <ClaimsContent />
    </Suspense>
  )
}