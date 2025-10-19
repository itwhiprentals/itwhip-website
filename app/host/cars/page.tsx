// app/host/cars/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import PendingBanner from '../components/PendingBanner'
import { 
  IoCarOutline,
  IoAddCircleOutline,
  IoLocationOutline,
  IoCashOutline,
  IoStarOutline,
  IoToggleOutline,
  IoToggle,
  IoSearchOutline,
  IoFilterOutline,
  IoEllipsisVerticalOutline,
  IoPencilOutline,
  IoTrashOutline,
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoArrowBackOutline,
  IoSpeedometerOutline,
  IoFlashOutline,
  IoTimeOutline,
  IoPeopleOutline,
  IoLockClosedOutline
} from 'react-icons/io5'

interface Car {
  id: string
  make: string
  model: string
  year: number
  trim?: string
  color: string
  licensePlate?: string
  
  // Specs
  carType: string
  seats: number
  transmission: string
  fuelType: string
  
  // Pricing
  dailyRate: number
  weeklyRate?: number
  monthlyRate?: number
  
  // Delivery
  airportPickup: boolean
  hotelDelivery: boolean
  homeDelivery: boolean
  
  // Location
  address: string
  city: string
  state: string
  
  // Availability
  isActive: boolean
  instantBook: boolean
  minTripDuration: number
  
  // Stats
  totalTrips: number
  rating: number
  
  // Photos
  photos: Array<{
    id: string
    url: string
    isHero: boolean
  }>
  
  // Calculated
  heroPhoto?: string
  activeBookings?: number
  upcomingBookings?: number
}

interface FilterOptions {
  status: 'all' | 'active' | 'inactive'
  search: string
  sortBy: 'newest' | 'oldest' | 'rating' | 'trips' | 'price'
}

interface HostStatus {
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'NEEDS_ATTENTION'
  pendingActions?: string[]
  restrictionReasons?: string[]
  verificationProgress?: number
  statusMessage?: string
}

export default function HostCarsPage() {
  const router = useRouter()
  const [cars, setCars] = useState<Car[]>([])
  const [hostStatus, setHostStatus] = useState<HostStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(true)
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    search: '',
    sortBy: 'newest'
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    checkHostStatus()
  }, [])

  useEffect(() => {
    // Fetch cars regardless of status (approved hosts see real data, pending see drafts)
    if (hostStatus) {
      fetchCars()
    }
  }, [hostStatus])

  const checkHostStatus = async () => {
    try {
      setStatusLoading(true)
      const response = await fetch('/api/host/verification-status', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const result = await response.json()
        
        // ✅ FIX: Access nested data structure correctly
        if (result.success && result.data) {
          setHostStatus({
            approvalStatus: result.data.overallStatus,
            pendingActions: result.data.nextSteps?.map((step: any) => step.action) || [],
            restrictionReasons: result.data.restrictions || [],
            verificationProgress: result.data.verificationProgress,
            statusMessage: result.data.statusMessage
          })
        } else {
          // Default to PENDING if structure is wrong
          setHostStatus({
            approvalStatus: 'PENDING',
            pendingActions: [],
            restrictionReasons: []
          })
        }
      } else {
        // Default to PENDING on error
        setHostStatus({
          approvalStatus: 'PENDING',
          pendingActions: [],
          restrictionReasons: []
        })
      }
    } catch (error) {
      console.error('Failed to check host status:', error)
      // Default to PENDING on error
      setHostStatus({
        approvalStatus: 'PENDING',
        pendingActions: [],
        restrictionReasons: []
      })
    } finally {
      setStatusLoading(false)
    }
  }

  const fetchCars = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/host/cars', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/host/login')
        }
        return
      }
      
      const data = await response.json()
      setCars(data.cars || [])
    } catch (error) {
      console.error('Failed to fetch cars:', error)
      setCars([])
    } finally {
      setLoading(false)
    }
  }

  const toggleCarStatus = async (carId: string, currentStatus: boolean) => {
    // Check if host is approved
    if (hostStatus?.approvalStatus !== 'APPROVED') {
      alert('Complete verification to modify car status')
      return
    }

    try {
      const response = await fetch(`/api/host/cars/${carId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !currentStatus })
      })
      
      if (response.ok) {
        setCars(cars.map(car => 
          car.id === carId 
            ? { ...car, isActive: !currentStatus }
            : car
        ))
      }
    } catch (error) {
      console.error('Failed to toggle car status:', error)
    }
  }

  const deleteCar = async (carId: string) => {
    // Check if host is approved
    if (hostStatus?.approvalStatus !== 'APPROVED') {
      alert('Complete verification to delete cars')
      return
    }

    if (!confirm('Are you sure you want to delete this car? This action cannot be undone.')) {
      return
    }
    
    try {
      const response = await fetch(`/api/host/cars/${carId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        setCars(cars.filter(car => car.id !== carId))
      }
    } catch (error) {
      console.error('Failed to delete car:', error)
    }
  }

  // Filter and sort cars
  const filteredCars = cars
    .filter(car => {
      if (filters.status === 'active' && !car.isActive) return false
      if (filters.status === 'inactive' && car.isActive) return false
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        return (
          car.make.toLowerCase().includes(searchLower) ||
          car.model.toLowerCase().includes(searchLower) ||
          car.year.toString().includes(searchLower)
        )
      }
      return true
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'oldest':
          return a.year - b.year
        case 'newest':
          return b.year - a.year
        case 'rating':
          return b.rating - a.rating
        case 'trips':
          return b.totalTrips - a.totalTrips
        case 'price':
          return a.dailyRate - b.dailyRate
        default:
          return 0
      }
    })

  // ✅ FIX: Explicit status checks
  const isApproved = hostStatus?.approvalStatus === 'APPROVED'
  const isPending = hostStatus?.approvalStatus === 'PENDING' || hostStatus?.approvalStatus === 'NEEDS_ATTENTION'
  const canAddCars = isApproved

  // ✅ FIX: Show loading state while checking status
  if (statusLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Checking account status...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading cars...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/host/dashboard')}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
            >
              <IoArrowBackOutline className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Cars</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {isApproved ? 'Manage your vehicle fleet' : 'Your vehicles (preparing for approval)'}
                </p>
              </div>
              
              {canAddCars ? (
                <Link
                  href="/host/cars/add"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <IoAddCircleOutline className="w-5 h-5" />
                  Add New Car
                </Link>
              ) : (
                <div className="relative group">
                  <button
                    disabled
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 rounded-lg cursor-not-allowed"
                  >
                    <IoLockClosedOutline className="w-5 h-5" />
                    Add New Car
                  </button>
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Complete verification to add cars
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pending/Restriction Banner */}
          {!isApproved && hostStatus && (
            <PendingBanner
              approvalStatus={hostStatus.approvalStatus}
              page="cars"
              pendingActions={hostStatus.pendingActions}
              restrictionReasons={hostStatus.restrictionReasons}
              onActionClick={() => router.push('/host/dashboard')}
            />
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Cars</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{cars.length}</p>
                </div>
                <IoCarOutline className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isApproved ? 'Active' : 'Ready'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isApproved ? cars.filter(c => c.isActive).length : cars.length}
                  </p>
                </div>
                <IoCheckmarkCircleOutline className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {cars.length > 0 
                      ? (cars.reduce((sum, car) => sum + car.rating, 0) / cars.length).toFixed(1)
                      : '0.0'}
                  </p>
                </div>
                <IoStarOutline className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Trips</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {cars.reduce((sum, car) => sum + car.totalTrips, 0)}
                  </p>
                </div>
                <IoSpeedometerOutline className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by make, model, or year..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="rating">Highest Rated</option>
                  <option value="trips">Most Trips</option>
                  <option value="price">Lowest Price</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cars Grid */}
          {filteredCars.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <IoCarOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {cars.length === 0 ? 'No cars yet' : 'No cars match your filters'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {cars.length === 0 
                  ? isApproved 
                    ? 'Start building your fleet by adding your first car.'
                    : 'You can add draft vehicles now and they\'ll go live when approved.'
                  : 'Try adjusting your search or filters.'}
              </p>
              {cars.length === 0 && (
                <div>
                  {canAddCars ? (
                    <Link
                      href="/host/cars/add"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <IoAddCircleOutline className="w-5 h-5" />
                      Add Your First Car
                    </Link>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Complete your verification to start adding vehicles
                      </p>
                      <Link
                        href="/host/dashboard"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Complete Verification
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCars.map((car) => (
                <div
                  key={car.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Car Image */}
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                    {car.heroPhoto ? (
                      <Image
                        src={car.heroPhoto}
                        alt={`${car.year} ${car.make} ${car.model}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IoCarOutline className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      {!isApproved ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400">
                          Draft
                        </span>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          car.isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {car.isActive ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </div>
                    
                    {/* Instant Book Badge */}
                    {car.instantBook && isApproved && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400 rounded-full text-xs font-medium flex items-center gap-1">
                          <IoFlashOutline className="w-3 h-3" />
                          Instant
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Car Info */}
                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {car.year} {car.make} {car.model}
                      </h3>
                      {car.trim && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{car.trim}</p>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <IoLocationOutline className="w-4 h-4 mr-1.5" />
                        {car.city}, {car.state}
                      </div>
                      
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <IoCashOutline className="w-4 h-4 mr-1.5" />
                        ${car.dailyRate}/day
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <IoPeopleOutline className="w-4 h-4 mr-1.5" />
                          {car.seats} seats • {car.transmission}
                        </div>
                        
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <IoStarOutline className="w-4 h-4 mr-1 text-yellow-500" />
                          {car.rating.toFixed(1)} ({car.totalTrips} trips)
                        </div>
                      </div>
                    </div>

                    {/* Delivery Options */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {car.airportPickup && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 rounded">
                          Airport
                        </span>
                      )}
                      {car.hotelDelivery && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 rounded">
                          Hotel
                        </span>
                      )}
                      {car.homeDelivery && (
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400 rounded">
                          Home
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => toggleCarStatus(car.id, car.isActive)}
                        disabled={!isApproved}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          !isApproved
                            ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                            : car.isActive
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                            : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-400 dark:hover:bg-green-900/70'
                        }`}
                        title={!isApproved ? 'Complete verification to activate' : ''}
                      >
                        {car.isActive ? (
                          <>
                            <IoToggle className="w-5 h-5" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <IoToggleOutline className="w-5 h-5" />
                            Activate
                          </>
                        )}
                      </button>
                      
                      <div className="flex gap-2">
                        <Link
                          href={isApproved ? `/host/cars/${car.id}/edit` : '#'}
                          className={`p-2 transition-colors ${
                            isApproved
                              ? 'text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400'
                              : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                          }`}
                          onClick={(e) => {
                            if (!isApproved) {
                              e.preventDefault()
                              alert('Complete verification to edit vehicles')
                            }
                          }}
                          title={!isApproved ? 'Complete verification to edit' : 'Edit vehicle'}
                        >
                          <IoPencilOutline className="w-5 h-5" />
                        </Link>
                        
                        <button
                          onClick={() => deleteCar(car.id)}
                          disabled={!isApproved}
                          className={`p-2 transition-colors ${
                            isApproved
                              ? 'text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400'
                              : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                          }`}
                          title={!isApproved ? 'Complete verification to delete' : 'Delete vehicle'}
                        >
                          <IoTrashOutline className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}