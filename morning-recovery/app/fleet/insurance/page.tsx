// app/fleet/insurance/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IoShieldCheckmarkOutline,
  IoAddCircleOutline,
  IoBusinessOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoAlertCircleOutline,
  IoDocumentTextOutline,
  IoStatsChartOutline,
  IoTimeOutline,
  IoTrendingUpOutline,
  IoWarningOutline,
  IoInformationCircleOutline,
  IoRefreshOutline,
  IoCashOutline
} from 'react-icons/io5'

interface Provider {
  id: string
  name: string
  type: string
  isActive: boolean
  isPrimary: boolean
  revenueShare: number
  _count?: {
    policies: number
    rateHistory: number
    vehicleOverrides: number
  }
  claimsCount?: number
  activeClaimsCount?: number
  pendingClaimsCount?: number
  approvedClaimsCount?: number
  rejectedClaimsCount?: number
  totalPayoutAmount?: number
  fnolSubmissionsCount?: number
  successRate?: number
}

interface DashboardStats {
  totalProviders: number
  activeProviders: number
  totalClaims: number
  activeClaims: number
  pendingClaims: number
  approvedClaims: number
  rejectedClaims: number
  totalPayoutAmount: number
  totalFnolSubmissions: number
  averageSuccessRate: number
  claimsPendingSubmission: number
}

export default function FleetInsuranceDashboard() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🔄 FETCHING DASHBOARD DATA')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      // Fetch providers (Tint, Liberty Mutual, etc.)
      const providersResponse = await fetch('/api/fleet/insurance/providers?key=phoenix-fleet-2847')
      
      if (!providersResponse.ok) {
        throw new Error('Failed to fetch insurance providers')
      }

      const providersData = await providersResponse.json()
      console.log('✅ Providers fetched:', providersData.providers?.length || 0)
      
      // Log provider details for debugging
      providersData.providers?.forEach((p: Provider) => {
        console.log(`Provider: ${p.name}`)
        console.log(`  Policies: ${p._count?.policies || 0}`)
        console.log(`  Revenue Share: ${(p.revenueShare * 100).toFixed(0)}%`)
      })

      // Fetch claim statistics
      const statsResponse = await fetch('/api/fleet/insurance/dashboard-stats?key=phoenix-fleet-2847')
      
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }

      const statsData = await statsResponse.json()

      if (!statsData.success) {
        throw new Error(statsData.message || 'Failed to load dashboard stats')
      }

      console.log('✅ Stats fetched - Total Claims:', statsData.stats.totalClaims)

      // Set providers from the providers endpoint (Tint, Liberty Mutual)
      setProviders(providersData.providers || [])
      
      // Set global stats from the stats endpoint
      setStats({
        totalProviders: providersData.providers?.length || 0,
        activeProviders: providersData.providers?.filter((p: Provider) => p.isActive).length || 0,
        totalClaims: statsData.stats.totalClaims,
        activeClaims: statsData.stats.activeClaims,
        pendingClaims: statsData.stats.pendingClaims,
        approvedClaims: statsData.stats.approvedClaims,
        rejectedClaims: statsData.stats.rejectedClaims,
        totalPayoutAmount: statsData.stats.totalPayoutAmount,
        totalFnolSubmissions: statsData.stats.totalFnolSubmissions,
        averageSuccessRate: statsData.stats.averageSuccessRate,
        claimsPendingSubmission: statsData.stats.claimsPendingSubmission
      })

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchDashboardData(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading insurance dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <IoAlertCircleOutline className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Error Loading Dashboard
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => fetchDashboardData()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <IoShieldCheckmarkOutline className="w-8 h-8 mr-3" />
                Insurance Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage insurance providers, policies, and FNOL submissions
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-2 disabled:opacity-50"
              >
                <IoRefreshOutline className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <Link
                href="/fleet/insurance/providers/new?key=phoenix-fleet-2847"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <IoAddCircleOutline className="w-5 h-5" />
                <span>Add Provider</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Providers Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Providers</p>
                <IoBusinessOutline className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalProviders}
              </p>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Active</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {stats.activeProviders}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Claims Card with Real-Time Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Claims</p>
                <IoDocumentTextOutline className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalClaims}
              </p>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Pending</span>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                    {stats.pendingClaims}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Approved</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {stats.approvedClaims}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Rejected</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {stats.rejectedClaims}
                  </span>
                </div>
              </div>
            </div>

            {/* FNOL Submissions Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">FNOL Submissions</p>
                <IoStatsChartOutline className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalFnolSubmissions}
              </p>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {stats.averageSuccessRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Pending Submit</span>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                    {stats.claimsPendingSubmission}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Payout Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Payouts</p>
                <IoCashOutline className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ${stats.totalPayoutAmount.toLocaleString()}
              </p>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">From Insurers</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Combined
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
          <div className="flex items-start space-x-3">
            <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                Insurance Provider Management
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Configure insurance providers, manage policies, track FNOL submissions, and monitor claims processing. 
                Each provider can have custom coverage tiers, pricing rules, and API integrations for automated claim submissions.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link
            href="/fleet/insurance/providers?key=phoenix-fleet-2847"
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <IoBusinessOutline className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Manage Providers
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View all insurance providers, configure settings, and manage partnerships
            </p>
          </Link>

          <Link
            href="/fleet/claims?key=phoenix-fleet-2847"
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <IoDocumentTextOutline className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                View Claims
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Review and process claims, submit to insurers, track status
            </p>
          </Link>

          <Link
            href="/fleet/insurance/analytics?key=phoenix-fleet-2847"
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <IoTrendingUpOutline className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Analytics
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View performance metrics, success rates, and insights
            </p>
          </Link>
        </div>

        {/* Providers Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Insurance Providers
            </h2>
          </div>

          {providers.length === 0 ? (
            <div className="p-12 text-center">
              <IoBusinessOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Insurance Providers Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Add your first insurance provider to start managing policies and claims
              </p>
              <Link
                href="/fleet/insurance/providers/new?key=phoenix-fleet-2847"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 space-x-2"
              >
                <IoAddCircleOutline className="w-5 h-5" />
                <span>Add First Provider</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {provider.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          provider.type === 'EMBEDDED'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                        }`}>
                          {provider.type}
                        </span>
                        {provider.isPrimary && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium rounded-full">
                            Primary
                          </span>
                        )}
                        {provider.isActive ? (
                          <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                        ) : (
                          <IoCloseCircleOutline className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/fleet/insurance/providers/${provider.id}?key=phoenix-fleet-2847`}
                      className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <span>View Details</span>
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Revenue Share</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {(provider.revenueShare * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Active Policies</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {provider._count?.policies || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Claims</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {provider.claimsCount || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                      <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                        {provider.pendingClaimsCount || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Approved</p>
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {provider.approvedClaimsCount || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Rejected</p>
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                        {provider.rejectedClaimsCount || 0}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Payout</p>
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        ${(provider.totalPayoutAmount || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">FNOL Submissions</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {provider.fnolSubmissionsCount || 0}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Status
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Insurance Provider API
                </span>
              </div>
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  FNOL Submission Service
                </span>
              </div>
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Claims Processing Engine
                </span>
              </div>
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                Operational
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}