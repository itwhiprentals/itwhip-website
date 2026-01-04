// app/(guest)/claims/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Icons
const AlertTriangle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
)

const Clock = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CheckCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const XCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Plus = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const FileText = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const ChevronRight = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

interface Claim {
  id: string
  type: string
  status: string
  description: string
  estimatedCost: number | null
  incidentDate: string | null
  createdAt: string
  isFiledByGuest: boolean
  filedByRole: string
  needsResponse: boolean
  isUrgent: boolean
  hoursRemaining: number | null
  deadlineExpired: boolean
  booking: {
    bookingCode: string
    car: {
      displayName: string
      heroPhoto: string | null
    } | null
  }
  host: {
    name: string
    profilePhoto: string | null
  }
}

type FilterType = 'all' | 'filed_by_me' | 'against_me'
type StatusFilter = 'all' | 'pending_response' | 'under_review' | 'resolved'

export default function ClaimsListPage() {
  const router = useRouter()
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.set('filter', filter)
      params.set('status', statusFilter)

      const response = await fetch(`/api/guest/claims?${params.toString()}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login?from=/claims')
          return
        }
        throw new Error('Failed to fetch claims')
      }

      const data = await response.json()
      setClaims(data.claims || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [filter, statusFilter, router])

  useEffect(() => {
    fetchClaims()
  }, [fetchClaims])

  const getStatusBadge = (claim: Claim) => {
    if (claim.needsResponse) {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          claim.isUrgent
            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
        }`}>
          <Clock className="w-3 h-3 mr-1" />
          {claim.hoursRemaining}h to respond
        </span>
      )
    }

    if (claim.deadlineExpired) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
          <XCircle className="w-3 h-3 mr-1" />
          Deadline Passed
        </span>
      )
    }

    switch (claim.status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        )
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
            <FileText className="w-3 h-3 mr-1" />
            Under Review
          </span>
        )
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        )
      case 'DENIED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <XCircle className="w-3 h-3 mr-1" />
            Denied
          </span>
        )
      case 'RESOLVED':
      case 'CLOSED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Resolved
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
            {claim.status}
          </span>
        )
    }
  }

  const urgentClaims = claims.filter(c => c.needsResponse && c.isUrgent)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Claims
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              View and manage insurance claims for your rentals
            </p>
          </div>

          <Link
            href="/claims/new"
            className="inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            File New Claim
          </Link>
        </div>

        {/* Urgent Claims Banner */}
        {urgentClaims.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300">
                  Action Required
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  You have {urgentClaims.length} claim{urgentClaims.length > 1 ? 's' : ''} that need{urgentClaims.length === 1 ? 's' : ''} your response within 24 hours.
                </p>
                <Link
                  href={`/claims/${urgentClaims[0].id}`}
                  className="inline-flex items-center text-sm font-medium text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 mt-2"
                >
                  Respond Now <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('filed_by_me')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'filed_by_me'
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Filed by Me
            </button>
            <button
              onClick={() => setFilter('against_me')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'against_me'
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Against Me
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-4 py-2 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
          >
            <option value="all">All Statuses</option>
            <option value="pending_response">Needs Response</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading claims...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <XCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
            <button
              onClick={fetchClaims}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && claims.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Claims Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {filter === 'filed_by_me'
                ? "You haven't filed any claims yet."
                : filter === 'against_me'
                ? "No claims have been filed against you."
                : "You don't have any claims yet."}
            </p>
            <Link
              href="/claims/new"
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              File a Claim
            </Link>
          </div>
        )}

        {/* Claims List */}
        {!loading && !error && claims.length > 0 && (
          <div className="space-y-4">
            {claims.map((claim) => (
              <Link
                key={claim.id}
                href={`/claims/${claim.id}`}
                className={`block bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 transition-all hover:shadow-md ${
                  claim.needsResponse && claim.isUrgent
                    ? 'border-red-300 dark:border-red-700'
                    : claim.needsResponse
                    ? 'border-orange-300 dark:border-orange-700'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Car Photo */}
                      <div className="flex-shrink-0">
                        <img
                          src={claim.booking.car?.heroPhoto || '/car-placeholder.svg'}
                          alt={claim.booking.car?.displayName || 'Vehicle'}
                          className="w-20 h-14 object-cover rounded-lg bg-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/car-placeholder.svg'
                          }}
                        />
                      </div>

                      {/* Claim Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            #{claim.id.slice(-8).toUpperCase()}
                          </span>
                          {getStatusBadge(claim)}
                          {claim.isFiledByGuest ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded text-xs font-medium">
                              Filed by You
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 rounded text-xs font-medium">
                              Filed by Host
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {claim.booking.car?.displayName || 'Unknown Vehicle'}
                        </p>

                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                          <span>
                            {claim.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <span>
                            {new Date(claim.createdAt).toLocaleDateString()}
                          </span>
                          {claim.estimatedCost && (
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              ${claim.estimatedCost.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>

                  {/* Description Preview */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
                    {claim.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
