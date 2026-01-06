// app/host/profile/components/tabs/ClaimsTab.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IoDocumentTextOutline, IoLockClosedOutline, IoAddOutline, IoChevronForwardOutline } from 'react-icons/io5'
import { TabType } from '../TabNavigation'
import ClaimStatusBadge from '@/app/host/claims/components/ClaimStatusBadge'

interface ClaimsTabProps {
  isApproved: boolean
  onFileNewClaim: () => void
  onTabChange: (tab: TabType) => void
}

interface ClaimSummary {
  id: string
  type: string
  status: string
  estimatedCost: number
  createdAt: string
  booking: {
    bookingCode: string
    car: {
      displayName: string
    } | null
  }
}

export default function ClaimsTab({
  isApproved,
  onFileNewClaim,
  onTabChange
}: ClaimsTabProps) {
  const router = useRouter()
  const [claims, setClaims] = useState<ClaimSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch recent claims
  useEffect(() => {
    if (isApproved) {
      fetchRecentClaims()
    }
  }, [isApproved])

  const fetchRecentClaims = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/host/claims')
      
      if (!response.ok) {
        throw new Error('Failed to fetch claims')
      }

      const data = await response.json()
      // Show only the 5 most recent claims
      setClaims(data.claims?.slice(0, 5) || [])
    } catch (err) {
      console.error('Error fetching claims:', err)
      setError('Failed to load claims')
    } finally {
      setLoading(false)
    }
  }

  const handleFileNewClaim = () => {
    router.push('/host/claims/new')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // If not approved, show locked state
  if (!isApproved) {
    return (
      <div className="text-center py-12">
        <IoLockClosedOutline className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Claims Access Locked
        </h3>
        
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto px-4">
          Complete your account verification to file insurance claims.
        </p>
        
        <button
          onClick={() => onTabChange('documents')}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          Complete Verification
        </button>
      </div>
    )
  }

  // If approved, show claims interface
  return (
    <div className="space-y-6">
      {/* Header with File New Claim button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Insurance Claims
        </h3>
        <button
          onClick={handleFileNewClaim}
          className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
        >
          <IoAddOutline className="w-5 h-5" />
          <span>File New Claim</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <IoDocumentTextOutline className="w-5 h-5 text-blue-600 dark:text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-200 mb-1">
              File Claims for Vehicle Damage
            </p>
            <p className="text-blue-800 dark:text-blue-300">
              Report accidents, theft, vandalism, or excessive cleaning needed after a trip. We process most claims within 24-48 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading claims...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Recent claims list */}
      {!loading && !error && claims.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Recent Claims
            </h4>
            <Link
              href="/host/claims"
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium flex items-center gap-1"
            >
              View All
              <IoChevronForwardOutline className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {claims.map(claim => (
              <Link
                key={claim.id}
                href={`/host/claims/${claim.id}`}
                className="block bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {claim.booking.car?.displayName || 'Unknown Vehicle'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {claim.booking.bookingCode} • {formatDate(claim.createdAt)}
                    </p>
                  </div>
                  <ClaimStatusBadge status={claim.status as any} size="sm" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {claim.type.charAt(0) + claim.type.slice(1).toLowerCase()}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    ${claim.estimatedCost.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-end mt-2 text-xs text-purple-600 dark:text-purple-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>View Details</span>
                  <IoChevronForwardOutline className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/host/claims"
            className="block text-center py-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
          >
            View All Claims →
          </Link>
        </div>
      )}

      {/* Empty State - No claims yet */}
      {!loading && !error && claims.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <IoDocumentTextOutline className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No claims filed yet
          </p>
          
          <button
            onClick={handleFileNewClaim}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            File Your First Claim
          </button>
        </div>
      )}
    </div>
  )
}