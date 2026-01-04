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
  IoLockClosedOutline,
  IoWarningOutline,
  IoShieldOutline,
  IoEyeOutline,
  IoChevronForwardOutline
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

  // ✅ NEW: Claim information
  hasActiveClaim?: boolean
  activeClaimCount?: number
  activeClaim?: {
    id: string
    type: string
    status: string
    createdAt: string
    bookingCode: string
  }
}

// Managed vehicle interface (includes owner info and commission)
interface ManagedVehicle extends Car {
  owner: {
    id: string
    name: string
    email: string
    profilePhoto?: string
  }
  ownerCommissionPercent: number
  managerCommissionPercent: number
  managementStatus: 'PENDING' | 'ACTIVE' | 'PAUSED' | 'TERMINATED'
  permissions: {
    canEditListing: boolean
    canAdjustPricing: boolean
    canCommunicateGuests: boolean
    canApproveBookings: boolean
    canHandleIssues: boolean
  }
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
  const [managedVehicles, setManagedVehicles] = useState<ManagedVehicle[]>([])
  const [hostStatus, setHostStatus] = useState<HostStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [managedLoading, setManagedLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'my' | 'managed'>('my')
  const [isHostManager, setIsHostManager] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    search: '',
    sortBy: 'newest'
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    checkHostStatus()
    checkAccountType()
  }, [])

  useEffect(() => {
    // Fetch cars regardless of status (approved hosts see real data, pending see drafts)
    if (hostStatus) {
      fetchCars()
      if (isHostManager) {
        fetchManagedVehicles()
      }
    }
  }, [hostStatus, isHostManager])

  const checkAccountType = async () => {
    try {
      const response = await fetch('/api/host/account-type', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setIsHostManager(data.isHostManager || data.managedVehicleCount > 0)
      }
    } catch (error) {
      console.error('Failed to check account type:', error)
    }
  }

  const fetchManagedVehicles = async () => {
    try {
      setManagedLoading(true)
      const response = await fetch('/api/host/managed-vehicles', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setManagedVehicles(data.vehicles || [])
      }
    } catch (error) {
      console.error('Failed to fetch managed vehicles:', error)
      setManagedVehicles([])
    } finally {
      setManagedLoading(false)
    }
  }

  const checkHostStatus = async () => {
    try {
      setStatusLoading(true)
      const response = await fetch('/api/host/verification-status', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const result = await response.json()
        
        if (result.success && result.data) {
          setHostStatus({
            approvalStatus: result.data.overallStatus,
            pendingActions: result.data.nextSteps?.map((step: any) => step.action) || [],
            restrictionReasons: result.data.restrictions || [],
            verificationProgress: result.data.verificationProgress,
            statusMessage: result.data.statusMessage
          })
        } else {
          setHostStatus({
            approvalStatus: 'PENDING',
            pendingActions: [],
            restrictionReasons: []
          })
        }
      } else {
        setHostStatus({
          approvalStatus: 'PENDING',
          pendingActions: [],
          restrictionReasons: []
        })
      }
    } catch (error) {
      console.error('Failed to check host status:', error)
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

  const toggleCarStatus = async (carId: string, currentStatus: boolean, hasActiveClaim: boolean) => {
    // Check if host is approved
    if (hostStatus?.approvalStatus !== 'APPROVED') {
      alert('Complete verification to modify car status')
      return
    }

    // ✅ NEW: Check for active claims
    if (hasActiveClaim) {
      alert('Cannot activate vehicle with active claim. Please wait for claim resolution or contact support.')
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
      } else {
        const error = await response.json()
        alert(error.message || error.error || 'Failed to update car status')
      }
    } catch (error) {
      console.error('Failed to toggle car status:', error)
      alert('Failed to update car status')
    }
  }

  const deleteCar = async (carId: string, hasActiveClaim: boolean) => {
    // Check if host is approved
    if (hostStatus?.approvalStatus !== 'APPROVED') {
      alert('Complete verification to delete cars')
      return
    }

    // ✅ NEW: Check for active claims
    if (hasActiveClaim) {
      alert('Cannot delete vehicle with active claim. Please wait for claim resolution.')
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
      } else {
        const error = await response.json()
        alert(error.message || error.error || 'Failed to delete car')
      }
    } catch (error) {
      console.error('Failed to delete car:', error)
      alert('Failed to delete car')
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

  const isApproved = hostStatus?.approvalStatus === 'APPROVED'
  const isPending = hostStatus?.approvalStatus === 'PENDING' || hostStatus?.approvalStatus === 'NEEDS_ATTENTION'
  const canAddCars = isApproved

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
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
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Cars</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{cars.length}</p>
                </div>
                <IoCarOutline className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
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
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
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
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
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

          {/* Tabs - Only show if user manages other vehicles */}
          {(isHostManager || managedVehicles.length > 0) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1 mb-6">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('my')}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                    activeTab === 'my'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <IoCarOutline className="w-5 h-5" />
                    <span>My Vehicles</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      {cars.length}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Insurance tier earnings</p>
                </button>
                <button
                  onClick={() => setActiveTab('managed')}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                    activeTab === 'managed'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <IoPeopleOutline className="w-5 h-5" />
                    <span>Managed Vehicles</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      {managedVehicles.length}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Commission-based earnings</p>
                </button>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
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

          {/* My Vehicles Grid */}
          {activeTab === 'my' && (filteredCars.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
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
                  className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => router.push(`/host/cars/${car.id}`)}
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
                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                      {/* ✅ NEW: Claim Badge (Highest Priority) */}
                      {car.hasActiveClaim && (
                        <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 flex items-center gap-1 shadow-sm">
                          <IoWarningOutline className="w-3 h-3" />
                          Claim Pending
                        </span>
                      )}
                      
                      {!isApproved ? (
                        <span className="px-2 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400">
                          Draft
                        </span>
                      ) : (
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          car.isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {car.isActive ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </div>
                    
                    {/* Instant Book Badge */}
                    {car.instantBook && isApproved && !car.hasActiveClaim && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400 rounded-lg text-xs font-medium flex items-center gap-1">
                          <IoFlashOutline className="w-3 h-3" />
                          Instant
                        </span>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                        <IoEyeOutline className="w-4 h-4" />
                        View Intelligence
                      </span>
                    </div>
                  </div>

                  {/* ✅ NEW: Claim Warning Banner */}
                  {car.hasActiveClaim && car.activeClaim && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-3">
                      <div className="flex items-start gap-2">
                        <IoShieldOutline className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-red-800 dark:text-red-300">
                            Vehicle Locked - Claim Active
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {car.activeClaimCount && car.activeClaimCount > 1 
                              ? `${car.activeClaimCount} claims pending`
                              : `${car.activeClaim.status.replace('_', ' ')} • ${car.activeClaim.bookingCode}`}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/host/claims/${car.activeClaim.id}`)
                            }}
                            className="text-xs text-red-700 dark:text-red-300 underline hover:no-underline mt-1 inline-block"
                          >
                            View Claim →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

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
                      {/* ✅ UPDATED: Toggle button with claim blocking */}
                      <div className="relative group/toggle">
                        <button
                          onClick={(e) => {
                            e.stopPropagation() // Prevent navigation
                            toggleCarStatus(car.id, car.isActive, car.hasActiveClaim || false)
                          }}
                          disabled={!isApproved || car.hasActiveClaim}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            !isApproved || car.hasActiveClaim
                              ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                              : car.isActive
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                              : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-400 dark:hover:bg-green-900/70'
                          }`}
                        >
                          {car.hasActiveClaim ? (
                            <>
                              <IoLockClosedOutline className="w-4 h-4" />
                              <span className="hidden sm:inline">Locked</span>
                            </>
                          ) : car.isActive ? (
                            <>
                              <IoToggle className="w-4 h-4" />
                              <span className="hidden sm:inline">Deactivate</span>
                            </>
                          ) : (
                            <>
                              <IoToggleOutline className="w-4 h-4" />
                              <span className="hidden sm:inline">Activate</span>
                            </>
                          )}
                        </button>
                        {car.hasActiveClaim && (
                          <div className="absolute bottom-full mb-2 left-0 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/toggle:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                            Locked due to active claim
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* View Details Indicator */}
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1">
                          View Details
                          <IoChevronForwardOutline className="w-3 h-3" />
                        </span>
                        
                        {/* ✅ UPDATED: Edit button with claim blocking */}
                        <div className="relative group/edit">
                          <button
                            onClick={(e) => {
                              e.stopPropagation() // Prevent navigation
                              if (isApproved && !car.hasActiveClaim) {
                                router.push(`/host/cars/${car.id}/edit`)
                              } else if (car.hasActiveClaim) {
                                alert('Cannot edit vehicle with active claim')
                              } else {
                                alert('Complete verification to edit vehicles')
                              }
                            }}
                            disabled={!isApproved || car.hasActiveClaim}
                            className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                              isApproved && !car.hasActiveClaim
                                ? 'text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-400 dark:hover:text-purple-400 dark:hover:bg-purple-900/20'
                                : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                            }`}
                            title={!isApproved ? 'Complete verification to edit' : car.hasActiveClaim ? 'Locked due to active claim' : 'Edit vehicle'}
                          >
                            <IoPencilOutline className="w-5 h-5" />
                          </button>
                          {car.hasActiveClaim && (
                            <div className="absolute bottom-full mb-2 right-0 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/edit:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                              Locked due to active claim
                            </div>
                          )}
                        </div>
                        
                        {/* ✅ UPDATED: Delete button with claim blocking */}
                        <div className="relative group/delete">
                          <button
                            onClick={(e) => {
                              e.stopPropagation() // Prevent navigation
                              deleteCar(car.id, car.hasActiveClaim || false)
                            }}
                            disabled={!isApproved || car.hasActiveClaim}
                            className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                              isApproved && !car.hasActiveClaim
                                ? 'text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20'
                                : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                            }`}
                            title={!isApproved ? 'Complete verification to delete' : car.hasActiveClaim ? 'Locked due to active claim' : 'Delete vehicle'}
                          >
                            <IoTrashOutline className="w-5 h-5" />
                          </button>
                          {car.hasActiveClaim && (
                            <div className="absolute bottom-full mb-2 right-0 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/delete:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                              Locked due to active claim
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Managed Vehicles Grid */}
          {activeTab === 'managed' && (managedLoading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading managed vehicles...</p>
            </div>
          ) : managedVehicles.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <IoPeopleOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No managed vehicles yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                When vehicle owners invite you to manage their cars, they'll appear here.
              </p>
              <Link
                href="/host/fleet/invite-owner"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <IoAddCircleOutline className="w-5 h-5" />
                Invite a Vehicle Owner
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {managedVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => router.push(`/host/cars/${vehicle.id}`)}
                >
                  {/* Vehicle Image */}
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                    {vehicle.heroPhoto ? (
                      <Image
                        src={vehicle.heroPhoto}
                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IoCarOutline className="w-16 h-16 text-gray-400" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        vehicle.managementStatus === 'ACTIVE'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                          : vehicle.managementStatus === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400'
                          : vehicle.managementStatus === 'PAUSED'
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {vehicle.managementStatus === 'ACTIVE' ? 'Active' :
                         vehicle.managementStatus === 'PENDING' ? 'Pending' :
                         vehicle.managementStatus === 'PAUSED' ? 'Paused' : 'Terminated'}
                      </span>
                    </div>

                    {/* Managed Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 rounded-lg text-xs font-medium flex items-center gap-1">
                        <IoPeopleOutline className="w-3 h-3" />
                        Managed
                      </span>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                        <IoEyeOutline className="w-4 h-4" />
                        View Details
                      </span>
                    </div>
                  </div>

                  {/* Owner Info Banner */}
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-200 dark:border-indigo-800 p-3">
                    <div className="flex items-center gap-3">
                      {vehicle.owner.profilePhoto ? (
                        <Image
                          src={vehicle.owner.profilePhoto}
                          alt={vehicle.owner.name}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-indigo-200 dark:bg-indigo-800 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                            {vehicle.owner.name?.charAt(0) || 'O'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-indigo-600 dark:text-indigo-400">Owner</p>
                        <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200 truncate">
                          {vehicle.owner.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-indigo-600 dark:text-indigo-400">Your cut</p>
                        <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                          {(vehicle.managerCommissionPercent * 0.9).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      {vehicle.trim && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{vehicle.trim}</p>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <IoLocationOutline className="w-4 h-4 mr-1.5" />
                        {vehicle.city}, {vehicle.state}
                      </div>

                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <IoCashOutline className="w-4 h-4 mr-1.5" />
                        ${vehicle.dailyRate}/day
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <IoPeopleOutline className="w-4 h-4 mr-1.5" />
                          {vehicle.seats} seats • {vehicle.transmission}
                        </div>

                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <IoStarOutline className="w-4 h-4 mr-1 text-yellow-500" />
                          {vehicle.rating.toFixed(1)} ({vehicle.totalTrips} trips)
                        </div>
                      </div>
                    </div>

                    {/* Commission Split Info */}
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Revenue Split (after 10% platform fee)</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-indigo-200 dark:bg-indigo-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-purple-600 dark:bg-purple-500"
                            style={{ width: `${vehicle.managerCommissionPercent}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          <span className="text-purple-600 dark:text-purple-400 font-medium">You {vehicle.managerCommissionPercent}%</span>
                          {' / '}
                          <span className="text-indigo-600 dark:text-indigo-400">Owner {vehicle.ownerCommissionPercent}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Permissions Tags */}
                    <div className="flex gap-1 mt-3 flex-wrap">
                      {vehicle.permissions.canEditListing && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
                          Edit
                        </span>
                      )}
                      {vehicle.permissions.canAdjustPricing && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
                          Pricing
                        </span>
                      )}
                      {vehicle.permissions.canApproveBookings && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
                          Bookings
                        </span>
                      )}
                      {vehicle.permissions.canCommunicateGuests && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
                          Messages
                        </span>
                      )}
                      {vehicle.permissions.canHandleIssues && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
                          Issues
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        {vehicle.managementStatus === 'ACTIVE' && (
                          <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                            <IoCheckmarkCircleOutline className="w-4 h-4" />
                            Actively Managing
                          </span>
                        )}
                        {vehicle.managementStatus === 'PENDING' && (
                          <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                            <IoTimeOutline className="w-4 h-4" />
                            Awaiting Approval
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1">
                          View Details
                          <IoChevronForwardOutline className="w-3 h-3" />
                        </span>

                        {/* Edit button - only if permission granted */}
                        {vehicle.permissions.canEditListing && vehicle.managementStatus === 'ACTIVE' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/host/cars/${vehicle.id}/edit`)
                            }}
                            className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-400 dark:hover:text-purple-400 dark:hover:bg-purple-900/20"
                            title="Edit vehicle"
                          >
                            <IoPencilOutline className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  )
}