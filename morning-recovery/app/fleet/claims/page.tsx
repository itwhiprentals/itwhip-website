// app/fleet/claims/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import toast, { Toaster } from 'react-hot-toast'
import {
  IoSearchOutline,
  IoRefreshOutline,
  IoAlertCircleOutline,
} from 'react-icons/io5'

interface Claim {
  id: string
  bookingId: string
  hostId: string
  type: string
  status: string
  description: string
  incidentDate: string
  estimatedCost: number
  approvedAmount?: number
  deductible: number
  createdAt: string
  host: {
    id: string
    name: string
    email: string
    earningsTier: string
  }
  booking: {
    id: string
    bookingCode: string
    guestName: string
    guestEmail: string
  }
  insuranceHierarchy: {
    primary: {
      type: string
      provider: string
      status: string
    }
  }
  deductibleDetails: {
    primaryDeductible: number
    depositHeld: number
    guestResponsibility: number
  }
}

interface ClaimsResponse {
  claims: Claim[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function FleetClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<ClaimsResponse['pagination'] | null>(null)

  // Status counts
  const [statusCounts, setStatusCounts] = useState({
    ALL: 0,
    PENDING: 0,
    APPROVED: 0,
    DENIED: 0,
  })

  useEffect(() => {
    fetchClaims()
  }, [statusFilter, page])

  const fetchClaims = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        key: 'phoenix-fleet-2847', // TODO: Move to secure server-side auth
      })

      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/fleet/claims?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch claims')
      }

      const data: ClaimsResponse = await response.json()
      setClaims(data.claims)
      setPagination(data.pagination)

      // Calculate status counts
      const counts = {
        ALL: data.pagination.total,
        PENDING: data.claims.filter(c => c.status === 'PENDING').length,
        APPROVED: data.claims.filter(c => c.status === 'APPROVED').length,
        DENIED: data.claims.filter(c => c.status === 'DENIED').length,
      }
      setStatusCounts(counts)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load claims'
      console.error('Error fetching claims:', err)
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    toast.promise(
      fetchClaims(),
      {
        loading: 'Refreshing claims...',
        success: 'Claims refreshed!',
        error: 'Failed to refresh',
      }
    )
  }

  const handleApprove = async (claimId: string) => {
    const toastId = toast.loading('Approving claim...')

    try {
      const response = await fetch(
        `/api/fleet/claims/${claimId}/approve?key=phoenix-fleet-2847`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            approvedAmount: claims.find(c => c.id === claimId)?.estimatedCost || 0,
            reviewNotes: 'Quick approved from list view',
            reviewedBy: 'fleet-admin@itwhip.com',
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to approve claim')
      }

      toast.success('Claim approved successfully!', { id: toastId })
      await fetchClaims()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve claim'
      console.error('Error approving claim:', err)
      toast.error(errorMessage, { id: toastId })
    }
  }

  const handleReject = async (claimId: string) => {
    const reason = prompt('Please provide a reason for rejection:')
    
    if (!reason || !reason.trim()) {
      toast.error('Rejection reason is required')
      return
    }

    const toastId = toast.loading('Rejecting claim...')

    try {
      const response = await fetch(
        `/api/fleet/claims/${claimId}/deny?key=phoenix-fleet-2847`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            denialReason: reason,
            reviewNotes: 'Rejected from list view',
            reviewedBy: 'fleet-admin@itwhip.com',
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reject claim')
      }

      toast.success('Claim rejected successfully!', { id: toastId })
      await fetchClaims()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject claim'
      console.error('Error rejecting claim:', err)
      toast.error(errorMessage, { id: toastId })
    }
  }

  const filteredClaims = claims.filter(claim => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      claim.booking.bookingCode.toLowerCase().includes(search) ||
      claim.booking.guestName?.toLowerCase().includes(search) ||
      claim.host.name.toLowerCase().includes(search) ||
      claim.id.toLowerCase().includes(search)
    )
  })

  if (loading && claims.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading claims...</p>
        </div>
      </div>
    )
  }

  if (error && claims.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <IoAlertCircleOutline className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Claims
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      {/* Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Fleet Insurance Claims
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Review and manage insurance claims from hosts
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Refresh claims list"
          >
            <IoRefreshOutline className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto mb-4" role="tablist" aria-label="Claim status filters">
            {(['ALL', 'PENDING', 'APPROVED', 'DENIED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status)
                  setPage(1)
                }}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                role="tab"
                aria-selected={statusFilter === status}
              >
                {status}
                <span className="ml-2 text-sm opacity-75">
                  ({statusFilter === status ? pagination?.total || 0 : statusCounts[status]})
                </span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by booking code, guest name, host name, or claim ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Search claims"
            />
          </div>
        </div>

        {/* Claims List */}
        {filteredClaims.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <IoAlertCircleOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Claims Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : statusFilter !== 'ALL'
                ? `No ${statusFilter.toLowerCase()} claims at this time`
                : 'No claims have been filed yet'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClaims.map((claim) => (
              <div key={claim.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                {/* Header Row */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Claim #{claim.id.slice(-6).toUpperCase()}
                    </h3>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        claim.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        claim.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        claim.status === 'DENIED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {claim.status}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-semibold">
                        {claim.type}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 font-semibold">
                        {claim.host.earningsTier} TIER
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${claim.estimatedCost.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Estimated</div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Booking</div>
                    <div className="font-medium text-gray-900 dark:text-white">{claim.booking.bookingCode}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Host</div>
                    <div className="font-medium text-gray-900 dark:text-white">{claim.host.name}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Guest</div>
                    <div className="font-medium text-gray-900 dark:text-white">{claim.booking.guestName}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Incident Date</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {new Date(claim.incidentDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Insurance Hierarchy Box */}
                {claim.insuranceHierarchy && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 mb-4">
                    <div className="text-sm">
                      <span className="font-semibold text-gray-900 dark:text-white">Primary Insurance:</span>{' '}
                      <span className="text-gray-900 dark:text-white">{claim.insuranceHierarchy.primary.provider}</span>
                      <span className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
                        {claim.insuranceHierarchy.primary.type}
                      </span>
                    </div>
                  </div>
                )}

                {/* Deductible Details Box */}
                {claim.deductibleDetails && (
                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm bg-yellow-50 dark:bg-yellow-900/20 rounded p-3">
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Deductible</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        ${claim.deductibleDetails.primaryDeductible}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Deposit Held</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        ${claim.deductibleDetails.depositHeld}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Guest Owes</div>
                      <div className="font-semibold text-red-600 dark:text-red-400">
                        ${claim.deductibleDetails.guestResponsibility}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {claim.status === 'PENDING' && (
                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleApprove(claim.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                      aria-label={`Approve claim ${claim.id}`}
                    >
                      Approve Claim
                    </button>
                    <button
                      onClick={() => handleReject(claim.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
                      aria-label={`Reject claim ${claim.id}`}
                    >
                      Reject Claim
                    </button>
                    <Link
                      href={`/fleet/claims/${claim.id}`}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium"
                      aria-label={`View details for claim ${claim.id}`}
                    >
                      View Details
                    </Link>
                  </div>
                )}

                {/* For Non-Pending Claims */}
                {claim.status !== 'PENDING' && (
                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      href={`/fleet/claims/${claim.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                      aria-label={`View details for claim ${claim.id}`}
                    >
                      View Details
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total claims)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!pagination.hasPrev || loading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasNext || loading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}