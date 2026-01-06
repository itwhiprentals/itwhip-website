// app/fleet/insurance/coverage/gaps/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface CoverageGap {
  id: string
  make: string
  model: string
  year: number
  dailyRate: number
  estimatedValue: number
  isActive: boolean
  host: {
    id: string
    name: string
    email: string
  }
  hasCoverage: boolean
  coverageSource: 'HOST_ASSIGNMENT' | 'VEHICLE_RULES' | 'NONE'
  coverageProvider?: any
  eligibleProviders: any[]
  hasOverride: boolean
  warnings: string[]
  gapType?: 'HOST_NO_INSURANCE' | 'VEHICLE_EXCLUDED'
  recommendation?: string
}

interface Summary {
  totalVehicles: number
  totalCovered: number
  totalGaps: number
  criticalGaps: number
  warningGaps: number
  hostGaps: number
  vehicleRuleGaps: number
  activeProviders: number
}

interface Provider {
  id: string
  name: string
  type: string
  vehicleValueMin: number | null
  vehicleValueMax: number | null
  excludedMakes: string[]
  excludedModels: string[]
}

export default function CoverageGapsPage() {
  const router = useRouter()
  const [hostGaps, setHostGaps] = useState<CoverageGap[]>([])
  const [vehicleRuleGaps, setVehicleRuleGaps] = useState<CoverageGap[]>([])
  const [criticalGaps, setCriticalGaps] = useState<CoverageGap[]>([])
  const [warningGaps, setWarningGaps] = useState<CoverageGap[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [providers, setProviders] = useState<Provider[]>([])
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGaps()
  }, [])

  const fetchGaps = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/fleet/insurance/coverage/gaps?key=phoenix-fleet-2847')
      const data = await response.json()

      setHostGaps(data.hostGaps || [])
      setVehicleRuleGaps(data.vehicleRuleGaps || [])
      setCriticalGaps(data.criticalGaps || [])
      setWarningGaps(data.warningGaps || [])
      setSummary(data.summary || null)
      setProviders(data.providers || [])
      setRecommendations(data.recommendations || [])
    } catch (error) {
      console.error('Failed to fetch coverage gaps:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get unique hosts from host gaps
  const getUniqueHosts = () => {
    const hostMap = new Map()
    hostGaps.forEach(gap => {
      if (!hostMap.has(gap.host.id)) {
        hostMap.set(gap.host.id, {
          id: gap.host.id,
          name: gap.host.name,
          email: gap.host.email,
          vehicleCount: 0
        })
      }
      hostMap.get(gap.host.id).vehicleCount++
    })
    return Array.from(hostMap.values())
  }

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

  const uniqueHosts = getUniqueHosts()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="mb-4 sm:mb-6 flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 overflow-x-auto">
          <Link href="/fleet?key=phoenix-fleet-2847" className="hover:text-gray-900 dark:hover:text-white whitespace-nowrap">
            Fleet
          </Link>
          <span>/</span>
          <Link href="/fleet/insurance?key=phoenix-fleet-2847" className="hover:text-gray-900 dark:hover:text-white whitespace-nowrap">
            Insurance
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white whitespace-nowrap">Coverage Gaps</span>
        </div>

        {/* Header */}
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Coverage Gaps
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Vehicles without valid insurance coverage
            </p>
          </div>
          <button
            onClick={fetchGaps}
            className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700 border border-purple-600 rounded-lg hover:bg-purple-50"
          >
            Refresh
          </button>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Vehicles
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {summary.totalVehicles}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                Covered
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">
                {summary.totalCovered}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                Host Gaps
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-red-600">
                {summary.hostGaps}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">No insurance assigned</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                Rule Gaps
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                {summary.vehicleRuleGaps}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">Excluded by rules</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                Providers
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {summary.activeProviders}
              </p>
            </div>
          </div>
        )}

        {/* Success State */}
        {criticalGaps.length === 0 && warningGaps.length === 0 && hostGaps.length === 0 && vehicleRuleGaps.length === 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8 sm:p-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
              All Vehicles Covered
            </h2>
            <p className="text-sm sm:text-base text-green-700 dark:text-green-300">
              Every vehicle has valid insurance coverage. Great job!
            </p>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-6 sm:mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 sm:mb-4">
              Recommended Actions
            </h2>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0">{rec.startsWith('🔴') || rec.startsWith('⚠️') || rec.startsWith('💰') || rec.startsWith('💵') || rec.startsWith('🚗') || rec.startsWith('📋') || rec.startsWith('🔧') ? rec.slice(0, 2) : '•'}</span>
                  <span className="flex-1">{rec.replace(/^[🔴⚠️💰💵🚗📋🔧]\s*/, '')}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* HOST GAPS - Priority 1 (CRITICAL) */}
        {hostGaps.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  🔴 Hosts Without Insurance ({uniqueHosts.length} hosts, {hostGaps.length} vehicles)
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  CRITICAL: These hosts have no insurance assigned. Assign insurance to cover all their vehicles.
                </p>
              </div>
              <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs sm:text-sm font-medium rounded self-start whitespace-nowrap">
                Priority 1
              </span>
            </div>

            {/* Host-Level Cards */}
            <div className="space-y-4">
              {uniqueHosts.map((host) => (
                <div key={host.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 border-l-4 border-red-500">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {host.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <span>{host.email}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="font-medium text-red-600">{host.vehicleCount} vehicle(s) without coverage</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                    <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-300">
                      <strong>Quick Fix:</strong> Assign an insurance provider to this host and ALL their vehicles will be automatically covered.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={() => router.push(`/fleet/hosts/${host.id}/insurance/assign?key=phoenix-fleet-2847`)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors text-center"
                    >
                      Assign Insurance to {host.name.split(' ')[0]}
                    </button>
                    <Link
                      href={`/fleet/hosts/${host.id}?key=phoenix-fleet-2847&tab=insurance`}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-xs sm:text-sm font-medium rounded-lg transition-colors text-center"
                    >
                      View Host Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VEHICLE RULE GAPS - Priority 2 */}
        {vehicleRuleGaps.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  ⚠️ Vehicles Excluded by Rules ({vehicleRuleGaps.length})
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  These vehicles don't match provider rules. Add overrides or adjust coverage rules.
                </p>
              </div>
              <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 text-xs sm:text-sm font-medium rounded self-start whitespace-nowrap">
                Priority 2
              </span>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {vehicleRuleGaps.map((gap) => (
                  <div key={gap.id} className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 break-words">
                          {gap.year} {gap.make} {gap.model}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <span>Host: {gap.host.name}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>Value: ${gap.estimatedValue.toLocaleString()}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>${gap.dailyRate}/day</span>
                        </div>
                      </div>
                      
                      <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 text-xs sm:text-sm font-medium rounded self-start whitespace-nowrap">
                        Excluded
                      </span>
                    </div>

                    {/* Why Excluded */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 mb-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Why excluded?
                      </p>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {gap.recommendation || 'Vehicle does not match provider coverage rules'}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Link
                        href="/fleet/insurance/providers?key=phoenix-fleet-2847"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors text-center"
                      >
                        Adjust Provider Rules
                      </Link>
                      <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-xs sm:text-sm font-medium rounded-lg transition-colors">
                        Add Override
                      </button>
                      <Link
                        href={`/fleet/hosts/${gap.host.id}?key=phoenix-fleet-2847&tab=insurance`}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
                      >
                        View Host
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Warning Gaps (Inactive vehicles) */}
        {warningGaps.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
              Inactive Vehicle Gaps ({warningGaps.length})
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
              These vehicles are inactive but still lack coverage
            </p>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {warningGaps.map((gap) => (
                  <div key={gap.id} className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 break-words">
                          {gap.year} {gap.make} {gap.model}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <span>Host: {gap.host.name}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>Value: ${gap.estimatedValue.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs sm:text-sm font-medium rounded self-start whitespace-nowrap">
                        Inactive
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Provider Summary */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
            Active Insurance Providers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {providers.map((provider) => (
              <div key={provider.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3">
                  {provider.name}
                </h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="font-medium text-gray-900 dark:text-white text-right">
                      {provider.type}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600 dark:text-gray-400">Min Value:</span>
                    <span className="font-medium text-gray-900 dark:text-white text-right">
                      {provider.vehicleValueMin 
                        ? `$${provider.vehicleValueMin.toLocaleString()}`
                        : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600 dark:text-gray-400">Max Value:</span>
                    <span className="font-medium text-gray-900 dark:text-white text-right">
                      {provider.vehicleValueMax 
                        ? `$${provider.vehicleValueMax.toLocaleString()}`
                        : 'None'}
                    </span>
                  </div>
                  {provider.excludedMakes.length > 0 && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Excluded:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {provider.excludedMakes.map((make) => (
                          <span
                            key={make}
                            className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-[10px] sm:text-xs rounded"
                          >
                            {make}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Link
                  href={`/fleet/insurance/providers/${provider.id}?key=phoenix-fleet-2847`}
                  className="mt-4 block text-center px-3 py-1.5 text-xs text-purple-600 border border-purple-600 rounded hover:bg-purple-50"
                >
                  Edit Provider
                </Link>
              </div>
            ))}
            
            {providers.length === 0 && (
              <div className="col-span-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
                <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-4">
                  No insurance providers configured. Add at least one provider to start covering vehicles.
                </p>
                <Link
                  href="/fleet/insurance/providers/new?key=phoenix-fleet-2847"
                  className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Add Insurance Provider
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}