// app/host/claims/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import ClaimCard from './components/ClaimCard'
import ClaimStatusBadge from './components/ClaimStatusBadge'
import {
  IoAddOutline,
  IoFilterOutline,
  IoDocumentTextOutline,
  IoAlertCircleOutline,
  IoRefreshOutline,
  IoLockClosedOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5'

interface Claim {
  id: string
  claimType: 'insurance' | 'trip_charges' // NEW: Distinguish claim types
  type: string
  status: string
  description: string
  estimatedCost: number
  approvedAmount: number | null
  deductible: number | null
  incidentDate: string | null
  createdAt: string
  damagePhotos?: string[]
  booking: {
    id: string
    bookingCode: string
    car: {
      displayName: string
      heroPhoto: string | null
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
  insuranceClaims: number // NEW
  tripCharges: number // NEW
}

export default function HostClaimsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Check if redirected due to approval requirement
  const approvalRequired = searchParams.get('approval_required') === 'true'
  const action = searchParams.get('action')

  // State
  const [claims, setClaims] = useState<Claim[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [refreshing, setRefreshing] = useState(false)

  // Fetch claims on mount and when filter changes
  useEffect(() => {
    fetchClaims()
  }, [statusFilter])

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
  }

  // Status filter options
  const statusFilters = [
    { value: 'ALL', label: 'All Claims', count: summary?.total || 0 },
    { value: 'PENDING', label: 'Pending', count: summary?.pending || 0 },
    { value: 'UNDER_REVIEW', label: 'Under Review', count: summary?.underReview || 0 },
    { value: 'APPROVED', label: 'Approved', count: summary?.approved || 0 },
    { value: 'DENIED', label: 'Denied', count: summary?.denied || 0 },
    { value: 'PAID', label: 'Paid', count: summary?.paid || 0 }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {/* Page header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Insurance Claims
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Manage damage claims for your rental vehicles
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <IoRefreshOutline className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <Link
                href="/host/claims/new"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 font-medium"
              >
                <IoAddOutline className="w-5 h-5" />
                <span>File Claim</span>
              </Link>
            </div>
          </div>

          {/* Approval required alert */}
          {approvalRequired && action === 'create_claim' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <IoLockClosedOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-1">
                    Account Approval Required
                  </h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    Only approved hosts can file new claims. You can still view your existing claims below.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Summary stats */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Claims</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.total}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {summary.pending}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Approved</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {summary.approved}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Approved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${summary.totalApproved.toLocaleString()}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  ${summary.totalPaid.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Status filter tabs */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <IoFilterOutline className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Status
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {statusFilters.map(filter => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`
                  px-4 py-2 rounded-lg border text-sm font-medium transition-all
                  ${statusFilter === filter.value
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700'
                  }
                `}
              >
                {filter.label}
                {filter.count > 0 && (
                  <span className={`ml-2 ${statusFilter === filter.value ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    ({filter.count})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <IoAlertCircleOutline className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-900 dark:text-red-200 mb-1">
                  Error Loading Claims
                </h4>
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading claims...</p>
          </div>
        )}

        {/* Claims list */}
        {!loading && !error && (
          <>
            {claims.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <IoDocumentTextOutline className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {statusFilter === 'ALL' ? 'No Claims Yet' : `No ${statusFilter.toLowerCase().replace('_', ' ')} claims`}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {statusFilter === 'ALL' 
                    ? 'File your first claim when you need to report damage or issues with your rental vehicles.'
                    : 'No claims match this status filter.'
                  }
                </p>
                {statusFilter === 'ALL' && (
                  <Link
                    href="/host/claims/new"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    <IoAddOutline className="w-5 h-5" />
                    <span>File Your First Claim</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {claims.map(claim => (
                  <ClaimCard key={claim.id} claim={claim} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}