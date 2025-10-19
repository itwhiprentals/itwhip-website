// app/fleet/insurance/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface DashboardStats {
  activeProviders: number
  totalVehicles: number
  coveredVehicles: number
  coverageGaps: number
  activePolicies: number
}

interface Provider {
  id: string
  name: string
  type: string
  isActive: boolean
  isPrimary: boolean
  revenueShare: number
  _count: {
    policies: number
  }
}

export default function FleetInsuranceDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const [providersRes, gapsRes] = await Promise.all([
        fetch('/api/fleet/insurance/providers?key=phoenix-fleet-2847'),
        fetch('/api/fleet/insurance/coverage/gaps?key=phoenix-fleet-2847')
      ])

      const providersData = await providersRes.json()
      const gapsData = await gapsRes.json()

      setProviders(providersData.providers || [])

      const activeProviders = providersData.providers?.filter((p: Provider) => p.isActive).length || 0
      const totalPolicies = providersData.providers?.reduce((sum: number, p: Provider) => sum + p._count.policies, 0) || 0
      
      setStats({
        activeProviders,
        totalVehicles: gapsData.summary?.totalVehicles || 0,
        coveredVehicles: gapsData.summary?.totalCovered || 0,
        coverageGaps: gapsData.summary?.criticalGaps || 0,
        activePolicies: totalPolicies
      })

    } catch (error) {
      console.error('Dashboard fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4 sm:space-y-6">
            <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4 sm:w-1/4"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 sm:h-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const coveragePercentage = stats && stats.totalVehicles > 0
    ? Math.round((stats.coveredVehicles / stats.totalVehicles) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Insurance Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Manage insurance providers and vehicle coverage
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/fleet/insurance/providers/new?key=phoenix-fleet-2847"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm sm:text-base font-medium rounded-lg transition-colors text-center"
            >
              Add Provider
            </Link>
            <Link
              href="/fleet/insurance/rates?key=phoenix-fleet-2847"
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-900 active:bg-black text-white text-sm sm:text-base font-medium rounded-lg transition-colors text-center"
            >
              Manage Rates
            </Link>
          </div>
        </div>

        {/* Coverage Gap Alert */}
        {stats && stats.coverageGaps > 0 && (
          <div className="mb-4 sm:mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 dark:text-amber-200 text-sm sm:text-base">
                  Coverage Gaps Detected
                </h3>
                <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 mt-1">
                  {stats.coverageGaps} vehicle{stats.coverageGaps !== 1 ? 's' : ''} without valid insurance coverage
                </p>
              </div>
              <Link
                href="/fleet/insurance/coverage/gaps?key=phoenix-fleet-2847"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-sm font-medium rounded-lg transition-colors text-center whitespace-nowrap"
              >
                View Issues
              </Link>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
              Active Providers
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {stats?.activeProviders || 0}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
              Coverage Rate
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
              {coveragePercentage}%
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              {stats?.coveredVehicles}/{stats?.totalVehicles} vehicles
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
              Active Policies
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {stats?.activePolicies || 0}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
              Coverage Gaps
            </div>
            <div className={`text-2xl sm:text-3xl font-bold ${
              stats?.coverageGaps === 0 ? 'text-green-600' : 'text-amber-600'
            }`}>
              {stats?.coverageGaps || 0}
            </div>
          </div>

        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Link
            href="/fleet/insurance/providers?key=phoenix-fleet-2847"
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 hover:shadow-md active:shadow-lg transition-all"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 text-sm sm:text-base">
              Providers
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Manage insurance providers and settings
            </p>
          </Link>

          <Link
            href="/fleet/insurance/coverage?key=phoenix-fleet-2847"
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 hover:shadow-md active:shadow-lg transition-all"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 text-sm sm:text-base">
              Vehicle Coverage
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              View coverage status for all vehicles
            </p>
          </Link>

          <Link
            href="/fleet/insurance/rates?key=phoenix-fleet-2847"
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 hover:shadow-md active:shadow-lg transition-all sm:col-span-2 lg:col-span-1"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 text-sm sm:text-base">
              Rate Management
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Update pricing and view history
            </p>
          </Link>
        </div>

        {/* Active Providers List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Active Providers
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {providers.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4">
                  No providers configured
                </p>
                <Link
                  href="/fleet/insurance/providers/new?key=phoenix-fleet-2847"
                  className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
                >
                  Add Provider
                </Link>
              </div>
            ) : (
              providers.map((provider) => (
                <div
                  key={provider.id}
                  className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-100 dark:active:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => router.push(`/fleet/insurance/providers/${provider.id}?key=phoenix-fleet-2847`)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {provider.name}
                        </h3>
                        {provider.isPrimary && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-[10px] sm:text-xs font-medium rounded whitespace-nowrap">
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
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <span className="whitespace-nowrap">Type: {provider.type}</span>
                        <span className="whitespace-nowrap">Policies: {provider._count.policies}</span>
                        <span className="whitespace-nowrap">
                          Revenue: {(provider.revenueShare * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white self-start sm:self-center whitespace-nowrap">
                      View Details →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}