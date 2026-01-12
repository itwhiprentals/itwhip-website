// app/partner/fleet/page.tsx
// Partner Fleet Management - Vehicle list with status, actions, and filters

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  IoCarOutline,
  IoCarSportOutline,
  IoKeyOutline,
  IoAddCircleOutline,
  IoSearchOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoConstructOutline,
  IoEllipsisVerticalOutline,
  IoCreateOutline,
  IoEyeOutline,
  IoPauseCircleOutline,
  IoPlayCircleOutline,
  IoRefreshOutline,
  IoSwapHorizontalOutline,
  IoCalendarOutline
} from 'react-icons/io5'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  licensePlate: string
  vin: string
  dailyRate: number
  status: 'available' | 'booked' | 'maintenance' | 'inactive'
  photo?: string
  totalTrips: number
  totalRevenue: number
  rating: number
  isActive: boolean
  vehicleType: 'RENTAL' | 'RIDESHARE'
}

type FilterStatus = 'all' | 'available' | 'booked' | 'maintenance' | 'inactive'

export default function PartnerFleetPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const res = await fetch('/api/partner/fleet')
      const data = await res.json()
      if (data.success) {
        setVehicles(data.vehicles)
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusConfig = (vehicle: Vehicle) => {
    if (!vehicle.isActive) {
      return {
        label: 'Inactive',
        color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700',
        icon: IoPauseCircleOutline
      }
    }
    switch (vehicle.status) {
      case 'available':
        return {
          label: 'Available',
          color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
          icon: IoCheckmarkCircleOutline
        }
      case 'booked':
        return {
          label: 'Booked',
          color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
          icon: IoTimeOutline
        }
      case 'maintenance':
        return {
          label: 'Maintenance',
          color: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
          icon: IoConstructOutline
        }
      default:
        return {
          label: 'Unknown',
          color: 'text-gray-600 bg-gray-100',
          icon: IoCarOutline
        }
    }
  }

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch =
      `${vehicle.year} ${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'inactive' && !vehicle.isActive) ||
      (statusFilter !== 'inactive' && vehicle.isActive && vehicle.status === statusFilter)

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.isActive && v.status === 'available').length,
    booked: vehicles.filter(v => v.isActive && v.status === 'booked').length,
    maintenance: vehicles.filter(v => v.isActive && v.status === 'maintenance').length,
    inactive: vehicles.filter(v => !v.isActive).length
  }

  const handleAction = async (vehicleId: string, action: string) => {
    setActiveMenu(null)

    switch (action) {
      case 'activate':
      case 'deactivate':
        try {
          const res = await fetch(`/api/partner/fleet/${vehicleId}/toggle-active`, {
            method: 'POST'
          })
          if (res.ok) {
            fetchVehicles()
          }
        } catch (error) {
          console.error('Failed to toggle vehicle status:', error)
        }
        break
      case 'maintenance':
        try {
          const res = await fetch(`/api/partner/fleet/${vehicleId}/maintenance`, {
            method: 'POST'
          })
          if (res.ok) {
            fetchVehicles()
          }
        } catch (error) {
          console.error('Failed to set maintenance:', error)
        }
        break
      default:
        break
    }
  }

  const handleToggleVehicleType = async (vehicleId: string, currentType: 'RENTAL' | 'RIDESHARE') => {
    const newType = currentType === 'RENTAL' ? 'RIDESHARE' : 'RENTAL'
    try {
      const res = await fetch(`/api/partner/fleet/${vehicleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleType: newType })
      })
      if (res.ok) {
        // Update local state immediately for responsiveness
        setVehicles(prev => prev.map(v =>
          v.id === vehicleId ? { ...v, vehicleType: newType } : v
        ))
      }
    } catch (error) {
      console.error('Failed to toggle vehicle type:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fleet Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your vehicles and track their performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/partner/calendar"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            <IoCalendarOutline className="w-5 h-5" />
            Calendar
          </Link>
          <Link
            href="/partner/fleet/add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <IoAddCircleOutline className="w-5 h-5" />
            Add Vehicle
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-lg border transition-colors ${
            statusFilter === 'all'
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
          }`}
        >
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
        </button>
        <button
          onClick={() => setStatusFilter('available')}
          className={`p-4 rounded-lg border transition-colors ${
            statusFilter === 'available'
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
          }`}
        >
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.available}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Available</p>
        </button>
        <button
          onClick={() => setStatusFilter('booked')}
          className={`p-4 rounded-lg border transition-colors ${
            statusFilter === 'booked'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
          }`}
        >
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.booked}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Booked</p>
        </button>
        <button
          onClick={() => setStatusFilter('maintenance')}
          className={`p-4 rounded-lg border transition-colors ${
            statusFilter === 'maintenance'
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
          }`}
        >
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.maintenance}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Maintenance</p>
        </button>
        <button
          onClick={() => setStatusFilter('inactive')}
          className={`p-4 rounded-lg border transition-colors ${
            statusFilter === 'inactive'
              ? 'border-gray-500 bg-gray-50 dark:bg-gray-700'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
          }`}
        >
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.inactive}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Inactive</p>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by make, model, or plate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => fetchVehicles()}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <IoRefreshOutline className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Vehicle List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <IoCarOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              {vehicles.length === 0 ? 'No vehicles in your fleet yet' : 'No vehicles match your filters'}
            </p>
            {vehicles.length === 0 && (
              <Link
                href="/partner/fleet/add"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors mt-4"
              >
                <IoAddCircleOutline className="w-5 h-5" />
                Add Your First Vehicle
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Trips
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredVehicles.map((vehicle) => {
                  const statusConfig = getStatusConfig(vehicle)
                  const StatusIcon = statusConfig.icon

                  return (
                    <tr
                      key={vehicle.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                      onClick={() => router.push(`/partner/fleet/${vehicle.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                            {vehicle.photo ? (
                              <img src={vehicle.photo} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <IoCarOutline className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {vehicle.licensePlate}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleVehicleType(vehicle.id, vehicle.vehicleType)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            vehicle.vehicleType === 'RIDESHARE'
                              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50'
                              : 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50'
                          }`}
                          title="Click to switch type"
                        >
                          {vehicle.vehicleType === 'RIDESHARE' ? (
                            <>
                              <IoCarSportOutline className="w-3.5 h-3.5" />
                              Rideshare
                            </>
                          ) : (
                            <>
                              <IoKeyOutline className="w-3.5 h-3.5" />
                              Rental
                            </>
                          )}
                          <IoSwapHorizontalOutline className="w-3 h-3 ml-1 opacity-50" />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          ${vehicle.dailyRate}/day
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {vehicle.totalTrips}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          ${vehicle.totalRevenue.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {vehicle.rating > 0 ? vehicle.rating.toFixed(1) : '—'}
                          </span>
                          {vehicle.rating > 0 && (
                            <span className="text-yellow-400">★</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenu(activeMenu === vehicle.id ? null : vehicle.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <IoEllipsisVerticalOutline className="w-5 h-5" />
                          </button>

                          {activeMenu === vehicle.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                              <Link
                                href={`/partner/fleet/${vehicle.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <IoEyeOutline className="w-4 h-4" />
                                View Details
                              </Link>
                              <Link
                                href={`/partner/fleet/${vehicle.id}/edit`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <IoCreateOutline className="w-4 h-4" />
                                Edit Vehicle
                              </Link>
                              <button
                                onClick={() => handleAction(vehicle.id, vehicle.isActive ? 'deactivate' : 'activate')}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                {vehicle.isActive ? (
                                  <>
                                    <IoPauseCircleOutline className="w-4 h-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <IoPlayCircleOutline className="w-4 h-4" />
                                    Activate
                                  </>
                                )}
                              </button>
                              {vehicle.isActive && vehicle.status !== 'maintenance' && (
                                <button
                                  onClick={() => handleAction(vehicle.id, 'maintenance')}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <IoConstructOutline className="w-4 h-4" />
                                  Set Maintenance
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  )
}
