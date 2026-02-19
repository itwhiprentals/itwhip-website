// app/fleet/vehicles/page.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  IoCarOutline,
  IoSearchOutline,
  IoArrowBackOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoAlertCircleOutline,
  IoImageOutline,
  IoStarOutline,
  IoCreateOutline,
  IoEllipsisVertical,
  IoCallOutline,
  IoMailOutline,
  IoEyeOutline
} from 'react-icons/io5'

interface VehicleHost {
  id: string
  name: string
  email: string
  phone: string | null
  approvalStatus: string
}

interface Vehicle {
  id: string
  year: number
  make: string
  model: string
  color: string
  carType: string
  vin: string | null
  licensePlate: string | null
  dailyRate: number
  city: string
  state: string
  isActive: boolean
  hasActiveClaim: boolean
  safetyHold: boolean
  requiresInspection: boolean
  rating: number
  totalTrips: number
  createdAt: string
  heroPhoto: string | null
  photoCount: number
  bookingCount: number
  reviewCount: number
  host: VehicleHost | null
  status: string
  issues: string[]
}

interface Stats {
  total: number
  active: number
  unlisted: number
  claimed: number
  issues: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

type TabKey = 'all' | 'active' | 'unlisted' | 'claimed' | 'issues'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'unlisted', label: 'Unlisted' },
  { key: 'claimed', label: 'Claimed' },
  { key: 'issues', label: 'Issues' },
]

export default function FleetVehiclesPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 })
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, unlisted: 0, claimed: 0, issues: 0 })
  const [toggling, setToggling] = useState<string | null>(null)
  const [actionMenu, setActionMenu] = useState<string | null>(null)
  const fetchRef = useRef(0)

  const fetchVehicles = useCallback(async () => {
    const fetchId = ++fetchRef.current
    try {
      setLoading(true)
      const params = new URLSearchParams({
        key: 'phoenix-fleet-2847',
        tab,
        page: String(page),
        limit: '20',
        sort,
      })
      if (searchTerm) params.append('search', searchTerm)

      const res = await fetch(`/fleet/api/cars?${params}`)
      const data = await res.json()

      if (fetchId !== fetchRef.current) return // stale

      if (data.success) {
        setVehicles(data.data || [])
        setStats(data.stats || stats)
        setPagination(data.pagination || pagination)
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
    } finally {
      if (fetchId === fetchRef.current) setLoading(false)
    }
  }, [tab, page, sort, searchTerm])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  // Reset page when tab or search changes
  useEffect(() => {
    setPage(1)
  }, [tab, searchTerm, sort])

  const handleToggleActive = async (vehicle: Vehicle, e: React.MouseEvent) => {
    e.stopPropagation()
    setToggling(vehicle.id)
    try {
      const action = vehicle.isActive ? 'suspend' : 'activate'
      const res = await fetch(`/api/fleet/vehicles/${vehicle.id}?key=phoenix-fleet-2847`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (data.success) {
        // Update locally for instant feedback
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === vehicle.id
              ? { ...v, isActive: !v.isActive, status: !v.isActive ? 'ACTIVE' : 'UNLISTED' }
              : v
          )
        )
        // Refresh stats
        fetchVehicles()
      }
    } catch (error) {
      console.error('Failed to toggle vehicle:', error)
    } finally {
      setToggling(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
      case 'UNLISTED':
        return 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-800'
      case 'CLAIMED':
        return 'text-orange-700 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30'
      case 'SAFETY_HOLD':
        return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
      default:
        return 'text-gray-700 bg-gray-100'
    }
  }

  const getTabCount = (key: TabKey) => {
    switch (key) {
      case 'all': return stats.total
      case 'active': return stats.active
      case 'unlisted': return stats.unlisted
      case 'claimed': return stats.claimed
      case 'issues': return stats.issues
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-6">
      {/* Sticky Header */}
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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Vehicle Management
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                All vehicles across all hosts
              </p>
            </div>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors sm:hidden"
            >
              <IoSearchOutline className="text-xl" />
            </button>
          </div>

          {/* Mobile Search */}
          {showSearch && (
            <div className="mb-3 sm:hidden">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search make, model, host..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                autoFocus
              />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Stats Cards */}
        <div className="mb-4 sm:mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex sm:grid sm:grid-cols-5 gap-3 sm:gap-4 overflow-x-auto pb-2 sm:pb-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 min-w-[100px] sm:min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Total</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 min-w-[100px] sm:min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Active</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 min-w-[100px] sm:min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.unlisted}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Unlisted</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 min-w-[100px] sm:min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.claimed}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Claimed</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 min-w-[100px] sm:min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{stats.issues}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Issues</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === t.key
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {t.label}
                <span className="ml-1.5 text-xs opacity-70">{getTabCount(t.key)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search + Sort Bar */}
        <div className="flex gap-3 mb-4">
          <div className="relative hidden sm:block flex-1">
            <IoSearchOutline className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search make, model, VIN, host..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_high">Price: High → Low</option>
            <option value="price_low">Price: Low → High</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* Loading */}
        {loading && vehicles.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500 dark:text-gray-400">Loading vehicles...</div>
          </div>
        )}

        {/* Empty State */}
        {!loading && vehicles.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 sm:p-12 text-center">
            <IoCarOutline className="mx-auto text-5xl sm:text-6xl text-gray-400 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No vehicles found
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {searchTerm
                ? 'Try adjusting your search'
                : tab !== 'all'
                ? 'No vehicles match the selected filter'
                : 'No vehicles in the system yet'}
            </p>
          </div>
        )}

        {/* Vehicle Cards */}
        {vehicles.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 hover:shadow-lg transition-shadow cursor-pointer relative"
                onClick={() => router.push(`/fleet/vehicles/${vehicle.id}`)}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Photo Thumbnail */}
                  <div className="w-16 h-12 sm:w-24 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700 relative">
                    {vehicle.heroPhoto ? (
                      <img
                        src={vehicle.heroPhoto}
                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IoCarOutline className="text-xl sm:text-2xl text-gray-400" />
                      </div>
                    )}
                    {vehicle.photoCount === 0 && (
                      <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
                        <IoImageOutline className="text-red-500 text-sm" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Title + Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                        <span className="text-gray-400 font-normal ml-1 text-xs">{vehicle.color}</span>
                      </h3>
                      <div className="flex gap-1.5 flex-wrap">
                        <span
                          className={`px-1.5 py-0.5 text-xs rounded-full font-medium ${getStatusColor(vehicle.status)}`}
                        >
                          {vehicle.status.replace('_', ' ')}
                        </span>
                        {vehicle.issues.map((issue) => (
                          <span
                            key={issue}
                            className="px-1.5 py-0.5 text-xs rounded-full font-medium text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
                          >
                            {issue}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Host Info */}
                    {vehicle.host && (
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1.5 truncate">
                        <Link
                          href={`/fleet/hosts/${vehicle.host.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                        >
                          {vehicle.host.name}
                        </Link>
                        <span className="hidden sm:inline">
                          {' '}
                          • {vehicle.city}, {vehicle.state}
                        </span>
                        {vehicle.host.approvalStatus !== 'APPROVED' && (
                          <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30">
                            Host {vehicle.host.approvalStatus}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 sm:gap-4 text-xs sm:text-sm">
                      <div className="text-gray-600 dark:text-gray-400">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ${vehicle.dailyRate}
                        </span>
                        /day
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <IoImageOutline className="text-sm" />
                        {vehicle.photoCount} photos
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <IoCheckmarkCircleOutline className="text-sm" />
                        {vehicle.totalTrips} trips
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <IoStarOutline className="text-sm" />
                        {vehicle.rating.toFixed(1)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {/* Toggle Active Switch */}
                    <button
                      onClick={(e) => handleToggleActive(vehicle, e)}
                      disabled={toggling === vehicle.id}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        vehicle.isActive
                          ? 'bg-green-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      } ${toggling === vehicle.id ? 'opacity-50' : ''}`}
                      title={vehicle.isActive ? 'Deactivate listing' : 'Activate listing'}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          vehicle.isActive ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>

                    {/* View Details Button (desktop) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/fleet/vehicles/${vehicle.id}`)
                      }}
                      className="hidden sm:flex px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm items-center gap-1"
                    >
                      <IoEyeOutline className="text-sm" />
                      View
                    </button>

                    {/* More Menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setActionMenu(actionMenu === vehicle.id ? null : vehicle.id)
                        }}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <IoEllipsisVertical className="text-gray-600 dark:text-gray-400" />
                      </button>

                      {actionMenu === vehicle.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-30 py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/fleet/edit/${vehicle.id}`)
                              setActionMenu(null)
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <IoCreateOutline />
                            Edit Vehicle
                          </button>
                          {vehicle.host && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/fleet/hosts/${vehicle.host!.id}`)
                                  setActionMenu(null)
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <IoCarOutline />
                                View Host
                              </button>
                              {vehicle.host.phone && (
                                <a
                                  href={`tel:${vehicle.host.phone}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setActionMenu(null)
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <IoCallOutline />
                                  Call Host
                                </a>
                              )}
                              <a
                                href={`mailto:${vehicle.host.email}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setActionMenu(null)
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <IoMailOutline />
                                Email Host
                              </a>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6 mb-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <IoChevronBackOutline />
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {pagination.pages}
              <span className="hidden sm:inline"> • {pagination.total} vehicles</span>
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page >= pagination.pages}
              className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <IoChevronForwardOutline />
            </button>
          </div>
        )}
      </div>

      {/* Close action menu when clicking outside */}
      {actionMenu && (
        <div className="fixed inset-0 z-20" onClick={() => setActionMenu(null)} />
      )}

      {/* Mobile bottom padding */}
      <div className="h-16 sm:hidden"></div>
    </div>
  )
}
