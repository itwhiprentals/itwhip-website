// app/fleet/hosts/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  IoPersonOutline,
  IoCarOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoLockClosedOutline,
  IoStarOutline,
  IoAddOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoArrowBackOutline,
  IoEllipsisVertical,
  IoShieldCheckmarkOutline
} from 'react-icons/io5'

interface Host {
  id: string
  name: string
  email: string
  phone: string
  city: string
  state: string
  profilePhoto?: string

  hostType: string
  approvalStatus: string
  active: boolean
  documentsVerified: boolean

  totalTrips: number
  rating: number
  commissionRate: number

  carCount: number
  activeCarCount: number

  joinedAt: string
  approvedAt?: string
}

export default function FleetHostsPage() {
  const router = useRouter()
  const [hosts, setHosts] = useState<Host[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    suspended: 0,
    real: 0,
    managed: 0
  })

  useEffect(() => {
    fetchHosts()
  }, [filter])

  const fetchHosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('filter', filter)
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`/fleet/api/hosts?key=phoenix-fleet-2847&${params}`)
      const data = await response.json()
      
      if (data.success) {
        setHosts(data.data || [])
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error('Failed to fetch hosts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'APPROVED': return 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
      case 'PENDING': return 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30'
      case 'SUSPENDED': return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
      case 'REJECTED': return 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getHostTypeColor = (type: string) => {
    switch(type) {
      case 'PARTNER': 
      case 'REAL': return 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30'
      case 'PLATFORM':
      case 'MANAGED': return 'text-purple-700 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getHostTypeLabel = (type: string) => {
    switch(type) {
      case 'REAL': return 'Partner'
      case 'MANAGED': return 'Platform'
      case 'PARTNER': return 'Partner'
      case 'PLATFORM': return 'Platform'
      default: return type
    }
  }

  const filteredHosts = hosts.filter(host => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return host.name.toLowerCase().includes(search) ||
             host.email.toLowerCase().includes(search) ||
             host.city.toLowerCase().includes(search)
    }
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading hosts...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-6">
      {/* Sticky Header Mobile */}
      <div className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-900 px-4 pt-4 pb-2 sm:relative sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <Link 
              href="/fleet"
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <IoArrowBackOutline className="text-xl" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Host Management
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
                Manage all hosts
              </p>
            </div>
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors sm:hidden"
            >
              <IoSearchOutline className="text-xl" />
            </button>
          </div>

          {/* Mobile Search Bar */}
          {showSearch && (
            <div className="mb-3 sm:hidden">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyUp={(e) => e.key === 'Enter' && fetchHosts()}
                placeholder="Search hosts..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                autoFocus
              />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Stats Cards - Horizontal Scroll Mobile */}
        <div className="mb-4 sm:mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex sm:grid sm:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto pb-2 sm:pb-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 min-w-[100px] sm:min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Total</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 min-w-[100px] sm:min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Approved</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 min-w-[100px] sm:min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Pending</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 min-w-[100px] sm:min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{stats.suspended}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Suspended</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 min-w-[100px] sm:min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.real}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Partner</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 min-w-[100px] sm:min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.managed}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Platform</div>
            </div>
          </div>
        </div>

        {/* Actions Bar - Stack on Mobile */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between mb-4 sm:mb-6">
          <div className="flex gap-2 flex-1 sm:flex-initial">
            <Link
              href="/fleet/hosts/pending"
              className="flex-1 sm:flex-initial px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base"
            >
              <IoTimeOutline className="text-lg sm:text-base" />
              <span>Pending ({stats.pending})</span>
            </Link>
            <Link
              href="/fleet/hosts/create"
              className="flex-1 sm:flex-initial px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base"
            >
              <IoAddOutline className="text-lg sm:text-base" />
              <span className="hidden sm:inline">Add Host Manually</span>
              <span className="sm:hidden">Add Host</span>
            </Link>
          </div>

          <div className="flex gap-2">
            {/* Desktop Search */}
            <div className="relative hidden sm:block">
              <IoSearchOutline className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyUp={(e) => e.key === 'Enter' && fetchHosts()}
                placeholder="Search hosts..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Filter - Full Width Mobile */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 sm:flex-initial px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
            >
              <option value="all">All Hosts</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="real">Partner Only</option>
              <option value="managed">Platform Only</option>
            </select>
          </div>
        </div>

        {/* Hosts List - Mobile Optimized Cards */}
        {filteredHosts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 sm:p-12 text-center">
            <IoPersonOutline className="mx-auto text-5xl sm:text-6xl text-gray-400 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No hosts found
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search' : 'No hosts match the selected filter'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredHosts.map((host) => (
              <div 
                key={host.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/fleet/hosts/${host.id}`)}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    {host.profilePhoto ? (
                      <img 
                        src={host.profilePhoto} 
                        alt={host.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <IoPersonOutline className="text-lg sm:text-xl text-gray-400" />
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Name and Status - Stack on Mobile */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {host.name}
                        </h3>
                        {host.documentsVerified && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-medium text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30 rounded-full">
                            <IoShieldCheckmarkOutline className="text-sm" />
                            <span className="hidden sm:inline">Verified</span>
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        <span className={`px-1.5 py-0.5 text-xs rounded-full ${getStatusColor(host.approvalStatus)}`}>
                          {host.approvalStatus}
                        </span>
                        <span className={`px-1.5 py-0.5 text-xs rounded-full ${getHostTypeColor(host.hostType)}`}>
                          {getHostTypeLabel(host.hostType)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Contact Info - Hide email on mobile */}
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
                      <span className="hidden sm:inline">{host.email} • </span>
                      {host.city}, {host.state}
                    </div>
                    
                    {/* Stats - 2x2 Grid on Mobile */}
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-1">
                        <IoCarOutline className="text-gray-400 text-sm" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {host.activeCarCount} cars
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IoCheckmarkCircleOutline className="text-gray-400 text-sm" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {host.totalTrips} trips
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IoStarOutline className="text-gray-400 text-sm" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {host.rating.toFixed(1)} rating
                        </span>
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {host.commissionRate * 100}% comm
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Actions - Dropdown on Mobile */}
                  <div className="flex-shrink-0">
                    {/* Mobile: Single Action Button */}
                    <div className="sm:hidden">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // On mobile, go directly to most important action
                          if (host.approvalStatus === 'PENDING') {
                            router.push(`/fleet/hosts/${host.id}/review`)
                          } else {
                            router.push(`/fleet/hosts/${host.id}/edit`)
                          }
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <IoEllipsisVertical className="text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>

                    {/* Desktop: Show all actions */}
                    <div className="hidden sm:flex gap-2">
                      {host.approvalStatus === 'PENDING' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/fleet/hosts/${host.id}/review`)
                          }}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors text-sm"
                        >
                          Review
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/fleet/hosts/${host.id}/edit`)
                        }}
                        className="px-3 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Bottom Padding for Fixed Navigation */}
      <div className="h-16 sm:hidden"></div>
    </div>
  )
}