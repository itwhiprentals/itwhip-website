// app/fleet/hosts/[id]/cars/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  IoArrowBackOutline,
  IoCarOutline,
  IoAddOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoStatsChartOutline,
  IoCalendarOutline,
  IoCashOutline,
  IoSpeedometerOutline,
  IoLocationOutline,
  IoSwapHorizontalOutline
} from 'react-icons/io5'

interface Car {
  id: string
  make: string
  model: string
  year: number
  color?: string
  dailyRate: number
  weeklyRate?: number
  monthlyRate?: number
  isActive: boolean
  instantBook: boolean
  city: string
  state: string
  totalTrips: number
  rating?: number
  heroPhoto?: string
  photosCount: number
  status: string
  currentBooking?: {
    guestName: string
    endDate: string
  }
}

export default function HostCarsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [host, setHost] = useState<any>(null)
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedCars, setSelectedCars] = useState<string[]>([])
  const [showReassignModal, setShowReassignModal] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const { id } = await params
      
      // Fetch host details
      const hostResponse = await fetch(`/fleet/api/hosts/${id}?key=phoenix-fleet-2847`)
      if (hostResponse.ok) {
        const hostData = await hostResponse.json()
        setHost(hostData.data)
        setCars(hostData.data.cars || [])
      }
      setLoading(false)
    }
    loadData()
  }, [params])

  const handleSelectCar = (carId: string) => {
    setSelectedCars(prev => 
      prev.includes(carId) 
        ? prev.filter(id => id !== carId)
        : [...prev, carId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCars.length === filteredCars.length) {
      setSelectedCars([])
    } else {
      setSelectedCars(filteredCars.map(car => car.id))
    }
  }

  const filteredCars = cars.filter(car => {
    if (filter === 'active') return car.isActive
    if (filter === 'inactive') return !car.isActive
    if (filter === 'booked') return car.currentBooking
    return true
  })

  const stats = {
    total: cars.length,
    active: cars.filter(c => c.isActive).length,
    booked: cars.filter(c => c.currentBooking).length,
    totalTrips: cars.reduce((sum, c) => sum + c.totalTrips, 0),
    avgRating: cars.length > 0 ? cars.reduce((sum, c) => sum + (c.rating || 0), 0) / cars.length : 0,
    totalRevenue: cars.reduce((sum, c) => sum + (c.totalTrips * c.dailyRate * 3), 0) // Rough estimate
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (!host) return <div className="p-6">Host not found</div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            href={`/fleet/hosts/${host.id}?key=phoenix-fleet-2847`}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg"
          >
            <IoArrowBackOutline className="text-xl" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Vehicle Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {host.name} • {cars.length} vehicles
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${
            host.hostType === 'PLATFORM' ? 'bg-purple-100 text-purple-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {host.hostType === 'PLATFORM' ? 'Platform Fleet' : 'Partner Host'}
          </span>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <IoCarOutline className="text-gray-400" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Cars</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <IoCheckmarkCircleOutline className="text-green-500" />
              <span className="text-2xl font-bold text-green-600">{stats.active}</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">Active</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <IoCalendarOutline className="text-blue-500" />
              <span className="text-2xl font-bold text-blue-600">{stats.booked}</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">Booked</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <IoStatsChartOutline className="text-purple-500" />
              <span className="text-2xl font-bold">{stats.totalTrips}</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Trips</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <IoStatsChartOutline className="text-yellow-500" />
              <span className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">Avg Rating</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <IoCashOutline className="text-green-500" />
              <span className="text-xl font-bold">${(stats.totalRevenue / 1000).toFixed(0)}k</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">Est. Revenue</div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between mb-6">
          <div className="flex gap-2">
            <Link
              href={`/fleet/add?hostId=${host.id}&key=phoenix-fleet-2847`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <IoAddOutline />
              Assign New Car
            </Link>
            
            {selectedCars.length > 0 && (
              <button
                onClick={() => setShowReassignModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <IoSwapHorizontalOutline />
                Reassign Selected ({selectedCars.length})
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="all">All Cars</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="booked">Currently Booked</option>
            </select>
          </div>
        </div>

        {/* Cars List */}
        {filteredCars.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
            <IoCarOutline className="mx-auto text-6xl text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No vehicles found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {filter !== 'all' ? 'Try changing the filter' : 'This host has no vehicles assigned'}
            </p>
            {filter === 'all' && (
              <Link
                href={`/fleet/add?hostId=${host.id}&key=phoenix-fleet-2847`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <IoAddOutline />
                Assign First Car
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            {/* Select All Header */}
            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCars.length === filteredCars.length && filteredCars.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Select all {filteredCars.length} cars
                </span>
              </label>
            </div>

            {/* Cars Table */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCars.map((car) => (
                <div key={car.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-center gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedCars.includes(car.id)}
                      onChange={() => handleSelectCar(car.id)}
                      className="rounded"
                    />

                    {/* Car Image */}
                    <div className="w-20 h-14 rounded overflow-hidden flex-shrink-0 relative">
                      {/* Placeholder always visible as base layer */}
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <IoCarOutline className="text-gray-400 text-2xl" />
                      </div>
                      {/* Image overlays placeholder when it loads successfully */}
                      {car.heroPhoto && (
                        <img
                          src={car.heroPhoto}
                          alt={`${car.make} ${car.model}`}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      )}
                    </div>

                    {/* Car Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {car.year} {car.make} {car.model}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <IoLocationOutline className="text-xs" />
                              {car.city}, {car.state}
                            </span>
                            <span className="flex items-center gap-1">
                              <IoCashOutline className="text-xs" />
                              ${car.dailyRate}/day
                            </span>
                            <span className="flex items-center gap-1">
                              <IoStatsChartOutline className="text-xs" />
                              {car.totalTrips} trips
                            </span>
                            {car.rating && (
                              <span className="flex items-center gap-1">
                                ⭐ {car.rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center gap-2">
                          {car.currentBooking ? (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              Booked until {new Date(car.currentBooking.endDate).toLocaleDateString()}
                            </span>
                          ) : car.isActive ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              Available
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              Inactive
                            </span>
                          )}
                          
                          <Link
                            href={`/fleet/edit/${car.id}?key=phoenix-fleet-2847`}
                            className="px-3 py-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
                          >
                            Edit →
                          </Link>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex gap-2 mt-2">
                        {car.instantBook && (
                          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                            Instant Book
                          </span>
                        )}
                        {car.photosCount > 0 && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                            {car.photosCount} photos
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reassign Modal */}
        {showReassignModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Reassign Vehicles</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Select a new host for the {selectedCars.length} selected vehicle(s).
              </p>
              <div className="space-y-2 mb-4">
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <option>Select a host...</option>
                  {/* Would populate with other hosts */}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowReassignModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Reassign
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}