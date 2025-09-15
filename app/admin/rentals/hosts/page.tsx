// app/admin/rentals/hosts/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  IoPeopleOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoAddCircleOutline,
  IoEyeOutline,
  IoCreateOutline,
  IoMailOutline,
  IoCallOutline,
  IoCarOutline,
  IoStarOutline,
  IoStar,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoRefreshOutline,
  IoChevronBackOutline,
  IoLocationOutline,
  IoPersonOutline,
  IoTrendingUpOutline,
  IoCalendarOutline,
  IoArrowBackOutline
} from 'react-icons/io5'

interface Host {
  id: string
  name: string
  email: string
  phone?: string
  profilePhoto?: string
  bio?: string
  isVerified: boolean
  verifiedAt?: string
  verificationLevel?: string
  responseTime?: number
  responseRate?: number
  acceptanceRate?: number
  totalTrips: number
  rating: number
  city: string
  state: string
  zipCode?: string
  active: boolean
  joinedAt: string
  createdAt: string
  cars?: Array<{
    id: string
    make: string
    model: string
    year: number
  }>
  _count?: {
    cars: number
  }
}

export default function HostsManagementPage() {
  const router = useRouter()
  const [hosts, setHosts] = useState<Host[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterVerified, setFilterVerified] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  useEffect(() => {
    fetchHosts()
  }, [])

  const fetchHosts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/sys-2847/fleet/api/hosts')
      if (response.ok) {
        const data = await response.json()
        setHosts(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch hosts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToDashboard = () => {
    router.push('/admin/dashboard')
  }

  const getRatingStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<IoStar key={i} className="w-4 h-4 text-yellow-400" />)
      } else {
        stars.push(<IoStarOutline key={i} className="w-4 h-4 text-gray-300" />)
      }
    }
    return stars
  }

  const getResponseTimeBadge = (responseTime?: number) => {
    if (!responseTime) return null
    if (responseTime <= 30) {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Very Fast</span>
    }
    if (responseTime <= 60) {
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Fast</span>
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Average</span>
  }

  // Filter and sort hosts
  const filteredHosts = hosts.filter(host => {
    const matchesSearch = searchTerm === '' || 
      host.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      host.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      host.city.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && host.active) ||
      (filterStatus === 'inactive' && !host.active)
    
    const matchesVerified = filterVerified === 'all' || 
      (filterVerified === 'verified' && host.isVerified) ||
      (filterVerified === 'unverified' && !host.isVerified)
    
    return matchesSearch && matchesStatus && matchesVerified
  })

  const sortedHosts = [...filteredHosts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'rating':
        return b.rating - a.rating
      case 'trips':
        return b.totalTrips - a.totalTrips
      case 'cars':
        return (b._count?.cars || 0) - (a._count?.cars || 0)
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  // Calculate stats
  const stats = {
    total: hosts.length,
    active: hosts.filter(h => h.active).length,
    verified: hosts.filter(h => h.isVerified).length,
    avgRating: hosts.reduce((sum, h) => sum + h.rating, 0) / hosts.length || 0,
    totalCars: hosts.reduce((sum, h) => sum + (h._count?.cars || 0), 0),
    totalTrips: hosts.reduce((sum, h) => sum + h.totalTrips, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <IoArrowBackOutline className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 hidden sm:block" />
              <div className="flex items-center space-x-2">
                <IoPeopleOutline className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Hosts Management
                </h1>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded">
                  {hosts.length} Total
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchHosts}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                title="Refresh"
              >
                <IoRefreshOutline className="w-5 h-5" />
              </button>
              <Link
                href="/admin/rentals/hosts/new"
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 text-sm sm:text-base"
              >
                <IoAddCircleOutline className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Add Host</span>
                <span className="sm:hidden">Add</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Hosts</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400">Verified</p>
            <p className="text-2xl font-bold text-blue-600">{stats.verified}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400">Avg Rating</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.avgRating.toFixed(1)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Cars</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalCars}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Trips</p>
            <p className="text-2xl font-bold text-indigo-600">{stats.totalTrips}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search hosts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Verified Filter */}
            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="newest">Newest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="rating">Highest Rating</option>
              <option value="trips">Most Trips</option>
              <option value="cars">Most Cars</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {sortedHosts.length} of {hosts.length} hosts
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                Grid View
              </button>
            </div>
          </div>
        </div>

        {/* Hosts Display */}
        {viewMode === 'list' ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Host
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedHosts.map(host => (
                    <tr key={host.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {host.profilePhoto ? (
                            <img
                              src={host.profilePhoto}
                              alt={host.name}
                              className="w-10 h-10 rounded-full object-cover mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 mr-3 flex items-center justify-center">
                              <IoPersonOutline className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                              {host.name}
                              {host.isVerified && (
                                <IoCheckmarkCircle className="w-4 h-4 ml-1 text-blue-500" />
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              Joined {new Date(host.joinedAt || host.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <IoMailOutline className="w-4 h-4 mr-1" />
                            {host.email}
                          </div>
                          {host.phone && (
                            <div className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                              <IoCallOutline className="w-4 h-4 mr-1" />
                              {host.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <IoLocationOutline className="w-4 h-4 mr-1 text-gray-400" />
                          {host.city}, {host.state}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            {getRatingStars(host.rating)}
                            <span className="ml-1 text-sm text-gray-600">({host.rating.toFixed(1)})</span>
                          </div>
                          {host.responseTime && (
                            <div className="text-xs text-gray-500">
                              Response: {host.responseTime} min
                            </div>
                          )}
                          {host.responseRate && (
                            <div className="text-xs text-gray-500">
                              Response rate: {host.responseRate}%
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <IoCarOutline className="w-4 h-4 mr-1" />
                            {host._count?.cars || 0} cars
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                            <IoTrendingUpOutline className="w-4 h-4 mr-1" />
                            {host.totalTrips} trips
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {host.active ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Inactive</span>
                          )}
                          {getResponseTimeBadge(host.responseTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/rentals/hosts/${host.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <IoEyeOutline className="w-5 h-5" />
                          </Link>
                          <button
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit"
                          >
                            <IoCreateOutline className="w-5 h-5" />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-900"
                            title="Contact"
                          >
                            <IoMailOutline className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {sortedHosts.length === 0 && (
              <div className="text-center py-12">
                <IoPeopleOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No hosts found</p>
              </div>
            )}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedHosts.map(host => (
              <div
                key={host.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-center mb-4">
                  {host.profilePhoto ? (
                    <img
                      src={host.profilePhoto}
                      alt={host.name}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-600 mr-4 flex items-center justify-center">
                      <IoPersonOutline className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                      {host.name}
                      {host.isVerified && (
                        <IoCheckmarkCircle className="w-4 h-4 ml-1 text-blue-500" />
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">{host.city}, {host.state}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Rating</span>
                    <div className="flex items-center">
                      {getRatingStars(host.rating)}
                      <span className="ml-1 text-gray-600">({host.rating.toFixed(1)})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cars</span>
                    <span className="font-medium">{host._count?.cars || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Trips</span>
                    <span className="font-medium">{host.totalTrips}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Joined</span>
                    <span className="font-medium">
                      {new Date(host.joinedAt || host.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    {host.active ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Inactive</span>
                    )}
                    <Link
                      href={`/admin/rentals/hosts/${host.id}`}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}