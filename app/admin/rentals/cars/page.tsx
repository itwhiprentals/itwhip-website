// app/admin/rentals/cars/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  IoCarSportOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoAddCircleOutline,
  IoEyeOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoLocationOutline,
  IoPersonOutline,
  IoCashOutline,
  IoFlashOutline,
  IoRefreshOutline,
  IoChevronBackOutline,
  IoImageOutline,
  IoArrowBackOutline
} from 'react-icons/io5'

interface Car {
  id: string
  make: string
  model: string
  year: number
  color?: string
  carType: string
  dailyRate: number
  weeklyRate?: number
  monthlyRate?: number
  city: string
  state: string
  address?: string
  isActive: boolean
  instantBook: boolean
  status?: string
  totalTrips?: number
  rating?: number
  photos?: Array<{
    url: string
    isHero?: boolean
    order?: number
  }>
  host?: {
    id: string
    name: string
    email: string
    rating?: number
  }
  hasActiveBookingToday?: boolean
  activeBookingsCount?: number
}

export default function CarsManagementPage() {
  const router = useRouter()
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  useEffect(() => {
    fetchCars()
  }, [])

  const fetchCars = async () => {
    try {
      setLoading(true)
      const response = await fetch('/sys-2847/fleet/api/cars')
      if (response.ok) {
        const data = await response.json()
        setCars(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch cars:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToDashboard = () => {
    router.push('/admin/dashboard')
  }

  const getCarPhoto = (car: Car) => {
    if (car.photos && car.photos.length > 0) {
      const heroPhoto = car.photos.find(p => p.isHero)
      return heroPhoto?.url || car.photos[0].url
    }
    return null
  }

  const getStatusBadge = (car: Car) => {
    if (!car.isActive) {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Inactive</span>
    }
    if (car.hasActiveBookingToday) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Booked</span>
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Available</span>
  }

  // Filter and sort cars
  const filteredCars = cars.filter(car => {
    const matchesSearch = searchTerm === '' || 
      `${car.year} ${car.make} ${car.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.host?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || car.carType === filterType
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && car.isActive) ||
      (filterStatus === 'inactive' && !car.isActive) ||
      (filterStatus === 'booked' && car.hasActiveBookingToday)
    
    return matchesSearch && matchesType && matchesStatus
  })

  const sortedCars = [...filteredCars].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.dailyRate - b.dailyRate
      case 'price-high':
        return b.dailyRate - a.dailyRate
      case 'name':
        return `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`)
      default:
        return 0
    }
  })

  const carTypes = Array.from(new Set(cars.map(car => car.carType))).filter(Boolean)

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
                <IoCarSportOutline className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Cars Management
                </h1>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded">
                  {cars.length} Total
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchCars}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                title="Refresh"
              >
                <IoRefreshOutline className="w-5 h-5" />
              </button>
              <Link
                href="/sys-2847/fleet/add"
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 text-sm sm:text-base"
              >
                <IoAddCircleOutline className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Add Car</span>
                <span className="sm:hidden">Add</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search cars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Types</option>
              {carTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="booked">Booked Today</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="newest">Newest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="price-low">Price (Low to High)</option>
              <option value="price-high">Price (High to Low)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {sortedCars.length} of {cars.length} cars
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

        {/* Cars Display */}
        {viewMode === 'list' ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Host
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pricing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Features
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedCars.map(car => {
                  const photo = getCarPhoto(car)
                  return (
                    <tr key={car.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {photo ? (
                            <img
                              src={photo}
                              alt={`${car.make} ${car.model}`}
                              className="w-10 h-10 rounded object-cover mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-600 mr-3 flex items-center justify-center">
                              <IoImageOutline className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {car.year} {car.make} {car.model}
                            </div>
                            <div className="text-sm text-gray-500">
                              {car.color} • {car.carType}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{car.host?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{car.host?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <IoLocationOutline className="w-4 h-4 mr-1 text-gray-400" />
                          {car.city}, {car.state}
                        </div>
                        {car.address && (
                          <div className="text-xs text-gray-500 mt-1">{car.address}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${car.dailyRate}/day
                        </div>
                        <div className="text-xs text-gray-500">
                          W: ${car.weeklyRate || car.dailyRate * 7} | M: ${car.monthlyRate || car.dailyRate * 30}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(car)}
                        {car.activeBookingsCount > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {car.activeBookingsCount} bookings
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {car.instantBook && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              <IoFlashOutline className="w-3 h-3 mr-0.5" />
                              Instant
                            </span>
                          )}
                          {car.photos && car.photos.length > 0 && (
                            <span className="text-xs text-gray-500">
                              {car.photos.length} photos
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <Link
                            href={`/sys-2847/fleet/edit/${car.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <IoCreateOutline className="w-5 h-5" />
                          </Link>
                          <Link
                            href={`/admin/rentals/cars/${car.id}`}
                            className="text-gray-600 hover:text-gray-900"
                            title="View Details"
                          >
                            <IoEyeOutline className="w-5 h-5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {sortedCars.length === 0 && (
              <div className="text-center py-12">
                <IoCarSportOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No cars found</p>
              </div>
            )}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedCars.map(car => {
              const photo = getCarPhoto(car)
              return (
                <div
                  key={car.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                    {photo ? (
                      <img
                        src={photo}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IoImageOutline className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(car)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {car.year} {car.make} {car.model}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{car.color} • {car.carType}</p>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <IoPersonOutline className="w-4 h-4 mr-1" />
                        {car.host?.name || 'Unknown'}
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <IoLocationOutline className="w-4 h-4 mr-1" />
                        {car.city}, {car.state}
                      </div>
                      <div className="flex items-center text-green-600">
                        <IoCashOutline className="w-4 h-4 mr-1" />
                        ${car.dailyRate}/day
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between">
                      <Link
                        href={`/sys-2847/fleet/edit/${car.id}`}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/rentals/cars/${car.id}`}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}