// app/fleet/insurance/providers/[id]/components/ClaimsTab.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoSearchOutline,
  IoCashOutline,
  IoCarOutline,
  IoPersonOutline,
  IoCalendarOutline
} from 'react-icons/io5'

interface Claim {
  id: string
  type: string
  status: string
  description: string
  estimatedCost: number
  approvedAmount: number | null
  incidentDate: string
  createdAt: string
  reviewedAt: string | null
  submittedToInsurerAt: string | null
  insurerClaimId: string | null
  insurerStatus: string | null
  booking: {
    bookingCode: string
    guestName: string | null
  }
  vehicleInfo?: {
    make: string
    model: string
    year: number
  }
}

interface ClaimsTabProps {
  providerId: string
  providerName: string
}

export default function ClaimsTab({ providerId, providerName }: ClaimsTabProps) {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'submitted'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchClaims()
  }, [providerId])

  const fetchClaims = async () => {
    try {
      setLoading(true)
      // TODO: Create API endpoint to fetch claims by provider
      // For now, we'll show empty state
      const response = await fetch(`/api/fleet/insurance/providers/${providerId}/claims?key=phoenix-fleet-2847`)
      
      if (response.ok) {
        const data = await response.json()
        setClaims(data.claims || [])
      } else {
        setClaims([])
      }
    } catch (error) {
      console.error('Failed to fetch claims:', error)
      setClaims([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium rounded-full flex items-center space-x-1">
            <IoCheckmarkCircleOutline className="w-3 h-3" />
            <span>Approved</span>
          </span>
        )
      case 'DENIED':
        return (
          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-xs font-medium rounded-full flex items-center space-x-1">
            <IoCloseCircleOutline className="w-3 h-3" />
            <span>Denied</span>
          </span>
        )
      case 'PENDING':
        return (
          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-medium rounded-full flex items-center space-x-1">
            <IoTimeOutline className="w-3 h-3" />
            <span>Pending</span>
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-medium rounded-full">
            {status}
          </span>
        )
    }
  }

  const getInsurerStatusBadge = (status: string | null, submittedAt: string | null) => {
    if (!submittedAt) {
      return (
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
          Not Submitted
        </span>
      )
    }
    
    if (!status) {
      return (
        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs rounded">
          Submitted
        </span>
      )
    }

    return (
      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 text-xs rounded">
        {status}
      </span>
    )
  }

  const filteredClaims = claims.filter(claim => {
    // Filter by status
    if (filter === 'pending' && claim.status !== 'PENDING') return false
    if (filter === 'approved' && claim.status !== 'APPROVED') return false
    if (filter === 'submitted' && !claim.submittedToInsurerAt) return false

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        claim.booking.bookingCode.toLowerCase().includes(search) ||
        claim.booking.guestName?.toLowerCase().includes(search) ||
        claim.type.toLowerCase().includes(search) ||
        claim.id.toLowerCase().includes(search)
      )
    }

    return true
  })

  const stats = {
    total: claims.length,
    pending: claims.filter(c => c.status === 'PENDING').length,
    approved: claims.filter(c => c.status === 'APPROVED').length,
    submitted: claims.filter(c => c.submittedToInsurerAt).length,
    totalValue: claims.reduce((sum, c) => sum + (c.approvedAmount || c.estimatedCost), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading claims...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Claims</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Submitted to {providerName}</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.submitted}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by booking code, guest, type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('submitted')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'submitted'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Submitted
            </button>
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {filteredClaims.length === 0 ? (
          <div className="p-12 text-center">
            <IoDocumentTextOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {claims.length === 0 ? 'No Claims Yet' : 'No Claims Found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {claims.length === 0 
                ? `No claims have been linked to ${providerName} yet.`
                : 'Try adjusting your filters or search terms.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredClaims.map((claim) => (
              <Link
                key={claim.id}
                href={`/fleet/claims/${claim.id}?key=phoenix-fleet-2847`}
                className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Claim #{claim.id.slice(0, 8)}
                      </h3>
                      {getStatusBadge(claim.status)}
                      {getInsurerStatusBadge(claim.insurerStatus, claim.submittedToInsurerAt)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Booking: {claim.booking.bookingCode}
                    </p>
                    {claim.insurerClaimId && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Insurer Claim ID: {claim.insurerClaimId}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end space-x-1 text-lg font-bold text-gray-900 dark:text-white mb-1">
                      <IoCashOutline className="w-5 h-5 text-gray-400" />
                      <span>${(claim.approvedAmount || claim.estimatedCost).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {claim.approvedAmount ? 'Approved' : 'Estimated'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <IoPersonOutline className="w-4 h-4" />
                    <span>{claim.booking.guestName || 'Guest'}</span>
                  </div>
                  {claim.vehicleInfo && (
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <IoCarOutline className="w-4 h-4" />
                      <span>
                        {claim.vehicleInfo.year} {claim.vehicleInfo.make} {claim.vehicleInfo.model}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <IoCalendarOutline className="w-4 h-4" />
                    <span>{new Date(claim.incidentDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {claim.description}
                  </p>
                </div>

                {claim.submittedToInsurerAt && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Submitted to {providerName}: {new Date(claim.submittedToInsurerAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Total Value Summary */}
      {filteredClaims.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-blue-900 dark:text-blue-200">
              <IoCashOutline className="w-5 h-5" />
              <span className="font-medium">Total Claim Value</span>
            </div>
            <span className="text-xl font-bold text-blue-900 dark:text-blue-200">
              ${stats.totalValue.toLocaleString()}
            </span>
          </div>
        </div>
      )}

    </div>
  )
}