// app/fleet/insurance/providers/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Provider {
  id: string
  name: string
  type: string
  isActive: boolean
  isPrimary: boolean
  revenueShare: number
  vehicleValueMin: number | null
  vehicleValueMax: number | null
  excludedMakes: string[]
  excludedModels: string[]
  coverageNotes: string | null
  contactEmail: string | null
  contactPhone: string | null
  contractStart: string | null
  contractEnd: string | null
  createdAt: string
  _count: {
    policies: number
    rateHistory: number
    vehicleOverrides: number
  }
}

export default function ProvidersPage() {
  const router = useRouter()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/fleet/insurance/providers?key=phoenix-fleet-2847')
      const data = await response.json()
      setProviders(data.providers || [])
    } catch (error) {
      console.error('Failed to fetch providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleProviderStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/fleet/insurance/providers/${id}?key=phoenix-fleet-2847`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (!response.ok) throw new Error('Failed to update provider')
      fetchProviders()
    } catch (error) {
      alert('Failed to update provider status')
    }
  }

  const setPrimaryProvider = async (id: string) => {
    try {
      const response = await fetch(`/api/fleet/insurance/providers/${id}?key=phoenix-fleet-2847`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPrimary: true })
      })

      if (!response.ok) throw new Error('Failed to set primary provider')
      fetchProviders()
    } catch (error) {
      alert('Failed to set primary provider')
    }
  }

  const filteredProviders = providers.filter(p => {
    if (filter === 'active') return p.isActive
    if (filter === 'inactive') return !p.isActive
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4 sm:space-y-6">
            <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4 sm:w-1/4"></div>
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 sm:h-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Insurance Providers
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                {providers.length} total provider{providers.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <Link
              href="/fleet/insurance/providers/new?key=phoenix-fleet-2847"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm sm:text-base font-medium rounded-lg transition-colors text-center"
            >
              Add Provider
            </Link>
          </div>
        </div>

        {/* Filter Tabs - Scrollable on mobile */}
        <div className="mb-4 sm:mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
          <div className="flex gap-2 min-w-max sm:min-w-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
              }`}
            >
              All ({providers.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'active'
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
              }`}
            >
              Active ({providers.filter(p => p.isActive).length})
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'inactive'
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
              }`}
            >
              Inactive ({providers.filter(p => !p.isActive).length})
            </button>
          </div>
        </div>

        {/* Providers List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredProviders.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 sm:p-12 text-center">
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4">
                No {filter !== 'all' ? filter : ''} providers found
              </p>
              <Link
                href="/fleet/insurance/providers/new?key=phoenix-fleet-2847"
                className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
              >
                Add Provider
              </Link>
            </div>
          ) : (
            filteredProviders.map((provider) => (
              <div
                key={provider.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md active:shadow-lg transition-shadow"
              >
                <div className="p-4 sm:p-6">
                  
                  {/* Provider Header */}
                  <div className="flex flex-col gap-3 mb-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex-1 min-w-0 break-words">
                          {provider.name}
                        </h2>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        {provider.isPrimary && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-[10px] sm:text-xs font-bold rounded whitespace-nowrap">
                            PRIMARY
                          </span>
                        )}
                        
                        <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded whitespace-nowrap ${
                          provider.isActive
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}>
                          {provider.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                        
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-[10px] sm:text-xs font-medium rounded uppercase whitespace-nowrap">
                          {provider.type}
                        </span>
                      </div>

                      {provider.coverageNotes && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {provider.coverageNotes}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons - Stack on mobile */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      {!provider.isPrimary && provider.isActive && (
                        <button
                          onClick={() => setPrimaryProvider(provider.id)}
                          className="px-3 py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded hover:bg-blue-700 active:bg-blue-800 transition-colors text-center"
                        >
                          Set Primary
                        </button>
                      )}
                      
                      <button
                        onClick={() => toggleProviderStatus(provider.id, provider.isActive)}
                        className={`px-3 py-2 text-xs sm:text-sm font-medium rounded transition-colors text-center ${
                          provider.isActive
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 active:bg-gray-400 dark:active:bg-gray-500'
                            : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
                        }`}
                      >
                        {provider.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      
                      <button
                        onClick={() => router.push(`/fleet/insurance/providers/${provider.id}?key=phoenix-fleet-2847`)}
                        className="px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs sm:text-sm font-medium rounded hover:bg-gray-800 dark:hover:bg-gray-100 active:bg-gray-700 dark:active:bg-gray-200 transition-colors text-center"
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Provider Stats - Responsive grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-4">
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Revenue Share
                      </p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        {(provider.revenueShare * 100).toFixed(0)}%
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Active Policies
                      </p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        {provider._count?.policies || 0}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Rate Changes
                      </p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        {provider._count?.rateHistory || 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Overrides
                      </p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        {provider._count?.vehicleOverrides || 0}
                      </p>
                    </div>
                    
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Added
                      </p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        {new Date(provider.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Coverage Rules - Responsive grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Vehicle Value Range
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                        {provider.vehicleValueMin || provider.vehicleValueMax ? (
                          <>
                            {provider.vehicleValueMin ? `$${provider.vehicleValueMin.toLocaleString()}` : 'No min'}
                            {' - '}
                            {provider.vehicleValueMax ? `$${provider.vehicleValueMax.toLocaleString()}` : 'No max'}
                          </>
                        ) : (
                          'All values'
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Excluded Makes
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                        {provider.excludedMakes?.length > 0 ? (
                          <span className="text-red-600 dark:text-red-400">
                            {provider.excludedMakes.length} excluded
                          </span>
                        ) : (
                          'None'
                        )}
                      </p>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-1">
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Contact
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                        {provider.contactEmail || provider.contactPhone || 'Not provided'}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}