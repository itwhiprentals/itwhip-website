// app/fleet/insurance/coverage/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  dailyRate: number
  estimatedValue: number
  isActive: boolean
  eligibleProviders: Array<{
    id: string
    name: string
    type: string
  }>
  hasOverride: boolean
  override: {
    provider: {
      id: string
      name: string
    }
    reason: string
  } | null
  warnings: string[]
}

interface Provider {
  id: string
  name: string
  type: string
}

export default function CoveragePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'covered' | 'gaps'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCoverageData()
  }, [])

  const fetchCoverageData = async () => {
    try {
      setLoading(true)
      // FIX: Added authentication key to the API call
      const response = await fetch('/api/fleet/insurance/coverage/gaps?key=phoenix-fleet-2847')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)
      }
      
      const data = await response.json()

      // Combine covered and gap vehicles
      const allVehicles = [
        ...(data.allGaps || []),
        ...(data.summary?.totalCovered > 0 ? [] : []) // We'll need to fetch covered vehicles separately
      ]

      setVehicles(allVehicles)
      setProviders(data.providers || [])
    } catch (error) {
      console.error('Failed to fetch coverage data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVehicles = vehicles.filter(v => {
    // Filter by coverage status
    if (filter === 'covered' && v.eligibleProviders.length === 0 && !v.hasOverride) return false
    if (filter === 'gaps' && (v.eligibleProviders.length > 0 || v.hasOverride)) return false

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        v.make.toLowerCase().includes(search) ||
        v.model.toLowerCase().includes(search) ||
        v.year.toString().includes(search)
      )
    }

    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4 sm:space-y-6">
            <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4 sm:w-1/4"></div>
            <div className="h-64 sm:h-96 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const coveredCount = vehicles.filter(v => v.eligibleProviders.length > 0 || v.hasOverride).length
  const gapCount = vehicles.filter(v => v.eligibleProviders.length === 0 && !v.hasOverride).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Vehicle Coverage
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                {vehicles.length} total • {coveredCount} covered • {gapCount} gaps
              </p>
            </div>
            
            <Link
              href="/fleet/insurance/coverage/gaps?key=phoenix-fleet-2847"
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-sm font-medium rounded-lg transition-colors text-center whitespace-nowrap"
            >
              View Coverage Gaps
            </Link>
          </div>
        </div>

        {/* Filters - Responsive layout */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
          
          {/* Filter Buttons - Scrollable on mobile */}
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
            <div className="flex gap-2 min-w-max sm:min-w-0">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === 'all'
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
                }`}
              >
                All ({vehicles.length})
              </button>
              <button
                onClick={() => setFilter('covered')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === 'covered'
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
                }`}
              >
                Covered ({coveredCount})
              </button>
              <button
                onClick={() => setFilter('gaps')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === 'gaps'
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
                }`}
              >
                Gaps ({gapCount})
              </button>
            </div>
          </div>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:flex-1 px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Coverage Matrix - Horizontally scrollable table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6 sm:mb-8">
          
          {/* Table Header - Scrollable container */}
          <div className="-mx-4 sm:mx-0 overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Vehicle
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Value
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Coverage
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Providers
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 sm:px-6 py-8 sm:py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                        No vehicles found
                      </td>
                    </tr>
                  ) : (
                    filteredVehicles.map((vehicle) => {
                      const hasCoverage = vehicle.eligibleProviders.length > 0 || vehicle.hasOverride
                      
                      return (
                        <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-100 dark:active:bg-gray-700">
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <div>
                              <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                {vehicle.year} {vehicle.make} {vehicle.model}
                              </div>
                              <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                ${vehicle.dailyRate}/day
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <div className="text-xs sm:text-sm text-gray-900 dark:text-white whitespace-nowrap">
                              ${vehicle.estimatedValue.toLocaleString()}
                            </div>
                          </td>
                          
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <span className={`px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded whitespace-nowrap ${
                              vehicle.isActive
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                            }`}>
                              {vehicle.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            {hasCoverage ? (
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                                <span className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 whitespace-nowrap">
                                  Covered
                                </span>
                                {vehicle.hasOverride && (
                                  <span className="px-1.5 sm:px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] sm:text-xs font-medium rounded whitespace-nowrap">
                                    Override
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                                <span className="text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 whitespace-nowrap">
                                  No Coverage
                                </span>
                              </div>
                            )}
                          </td>
                          
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            {vehicle.hasOverride ? (
                              <div className="text-xs sm:text-sm min-w-[150px]">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {vehicle.override?.provider.name}
                                </div>
                                <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {vehicle.override?.reason}
                                </div>
                              </div>
                            ) : vehicle.eligibleProviders.length > 0 ? (
                              <div className="flex flex-wrap gap-1 min-w-[150px]">
                                {vehicle.eligibleProviders.map((provider) => (
                                  <span
                                    key={provider.id}
                                    className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] sm:text-xs rounded whitespace-nowrap"
                                  >
                                    {provider.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                No eligible providers
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Provider Summary - Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {providers.map((provider) => {
            const coveredByProvider = vehicles.filter(v => 
              v.eligibleProviders.some(p => p.id === provider.id) ||
              (v.hasOverride && v.override?.provider.id === provider.id)
            ).length

            return (
              <div key={provider.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">
                  {provider.name}
                </h3>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {coveredByProvider}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  vehicles covered
                </p>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}