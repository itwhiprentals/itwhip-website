// app/fleet/partners/page.tsx
// Fleet Partner Management - List all fleet partners

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IoBusinessOutline,
  IoCarOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoTrendingUpOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoArrowBackOutline,
  IoAddOutline,
  IoEllipsisVertical,
  IoStarOutline,
  IoCashOutline,
  IoDocumentTextOutline,
  IoWarningOutline
} from 'react-icons/io5'

interface Partner {
  id: string
  partnerCompanyName: string
  partnerSlug: string
  email: string
  phone: string
  name: string

  hostType: string
  approvalStatus: string
  active: boolean

  partnerFleetSize: number
  partnerTotalBookings: number
  partnerTotalRevenue: number
  partnerAvgRating: number
  currentCommissionRate: number

  createdAt: string

  // Application info
  application?: {
    status: string
    submittedAt: string
    fleetSize: number
    operatingStates: string[]
  }

  // Document status
  documentsExpiring?: number
  documentsExpired?: number
}

interface Stats {
  totalPartners: number
  activePartners: number
  pendingApplications: number
  totalFleetVehicles: number
  totalRevenue: number
  documentsExpiring: number
}

export default function FleetPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState<Stats>({
    totalPartners: 0,
    activePartners: 0,
    pendingApplications: 0,
    totalFleetVehicles: 0,
    totalRevenue: 0,
    documentsExpiring: 0
  })

  useEffect(() => {
    fetchPartners()
  }, [filter])

  const fetchPartners = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('filter', filter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/fleet/partners?${params}`)
      const data = await response.json()

      if (data.success) {
        setPartners(data.partners || [])
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error('Failed to fetch partners:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
      case 'PENDING':
        return 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30'
      case 'SUSPENDED':
        return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
      case 'REJECTED':
        return 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
      default:
        return 'text-gray-700 bg-gray-100'
    }
  }

  const getTierBadge = (rate: number) => {
    if (rate <= 0.10) return { label: 'Diamond', color: 'text-purple-700 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30' }
    if (rate <= 0.15) return { label: 'Platinum', color: 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' }
    if (rate <= 0.20) return { label: 'Gold', color: 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30' }
    return { label: 'Standard', color: 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-700' }
  }

  const filteredPartners = partners.filter(partner => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        partner.partnerCompanyName?.toLowerCase().includes(search) ||
        partner.email.toLowerCase().includes(search) ||
        partner.partnerSlug?.toLowerCase().includes(search)
      )
    }
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading partners...</div>
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
              href="/fleet"
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <IoArrowBackOutline className="text-xl" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Fleet Partners
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage B2B fleet partner accounts
              </p>
            </div>
            <Link
              href="/fleet/partners/applications"
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <IoDocumentTextOutline className="w-4 h-4" />
              <span className="hidden sm:inline">Applications</span>
              {stats.pendingApplications > 0 && (
                <span className="bg-white text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {stats.pendingApplications}
                </span>
              )}
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalPartners}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Partners</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.activePartners}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Active</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.pendingApplications}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalFleetVehicles}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Vehicles</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                ${(stats.totalRevenue / 1000).toFixed(0)}k
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Revenue</div>
            </div>
            {stats.documentsExpiring > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.documentsExpiring}
                </div>
                <div className="text-xs text-red-600 dark:text-red-400">Docs Expiring</div>
              </div>
            )}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search partners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'pending', 'suspended'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-orange-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Partners List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {filteredPartners.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <IoBusinessOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No partners found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'No fleet partners match this filter'}
            </p>
            <Link
              href="/fleet/partners/applications"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
            >
              <IoDocumentTextOutline className="w-5 h-5" />
              View pending applications
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPartners.map((partner) => {
              const tier = getTierBadge(partner.currentCommissionRate)
              return (
                <Link
                  key={partner.id}
                  href={`/fleet/partners/${partner.id}`}
                  className="block bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Company Logo/Initial */}
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {partner.partnerCompanyName?.charAt(0) || 'P'}
                      </span>
                    </div>

                    {/* Partner Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {partner.partnerCompanyName || partner.name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(partner.approvalStatus)}`}>
                          {partner.approvalStatus}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tier.color}`}>
                          {tier.label}
                        </span>
                      </div>

                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {partner.email}
                        {partner.partnerSlug && (
                          <span className="ml-2 text-orange-600 dark:text-orange-400">
                            /rideshare/{partner.partnerSlug}
                          </span>
                        )}
                      </div>

                      {/* Stats Row */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                          <IoCarOutline className="w-4 h-4" />
                          <span>{partner.partnerFleetSize} vehicles</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                          <IoTrendingUpOutline className="w-4 h-4" />
                          <span>{partner.partnerTotalBookings} bookings</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                          <IoCashOutline className="w-4 h-4" />
                          <span>${partner.partnerTotalRevenue.toLocaleString()}</span>
                        </div>
                        {partner.partnerAvgRating > 0 && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                            <IoStarOutline className="w-4 h-4 text-yellow-500" />
                            <span>{partner.partnerAvgRating.toFixed(1)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                          <span className="text-xs">Commission:</span>
                          <span className="font-medium">{Math.round(partner.currentCommissionRate * 100)}%</span>
                        </div>
                      </div>

                      {/* Warnings */}
                      {(partner.documentsExpiring || partner.documentsExpired) && (
                        <div className="flex items-center gap-2 mt-2">
                          {partner.documentsExpired && partner.documentsExpired > 0 && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs">
                              <IoWarningOutline className="w-3 h-3" />
                              {partner.documentsExpired} expired docs
                            </span>
                          )}
                          {partner.documentsExpiring && partner.documentsExpiring > 0 && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs">
                              <IoTimeOutline className="w-3 h-3" />
                              {partner.documentsExpiring} expiring soon
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0">
                      <IoEllipsisVertical className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
