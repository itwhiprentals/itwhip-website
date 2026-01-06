// app/fleet/insurance/rates/history/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface RateChange {
  id: string
  provider: {
    id: string
    name: string
    type: string
  }
  tier: string
  vehicleClass: string
  oldRate: number
  newRate: number
  change: number
  changePercent: number
  changeType: 'INCREASE' | 'DECREASE' | 'NO_CHANGE'
  effectiveDate: string
  changedBy: string
  reason: string | null
  createdAt: string
}

interface Stats {
  totalChanges: number
  increases: number
  decreases: number
  noChange: number
  averageIncrease: number
  averageDecrease: number
  largestIncrease: number
  largestDecrease: number
}

interface ProviderSummary {
  provider: {
    id: string
    name: string
    type: string
  }
  changes: number
  increases: number
  decreases: number
  lastChange: string
}

export default function RateHistoryPage() {
  const [history, setHistory] = useState<RateChange[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [providerSummary, setProviderSummary] = useState<ProviderSummary[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [selectedTier, setSelectedTier] = useState<string>('')
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  useEffect(() => {
    fetchHistory()
  }, [selectedProvider, selectedTier, selectedClass, startDate, endDate])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (selectedProvider) params.append('providerId', selectedProvider)
      if (selectedTier) params.append('tier', selectedTier)
      if (selectedClass) params.append('vehicleClass', selectedClass)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/fleet/insurance/rates/history?${params}`)
      const data = await response.json()

      setHistory(data.history || [])
      setStats(data.stats || null)
      setProviderSummary(data.providerSummary || [])
    } catch (error) {
      console.error('Failed to fetch rate history:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSelectedProvider('')
    setSelectedTier('')
    setSelectedClass('')
    setStartDate('')
    setEndDate('')
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

  const hasFilters = selectedProvider || selectedTier || selectedClass || startDate || endDate

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Rate Change History
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                {history.length} change{history.length !== 1 ? 's' : ''} recorded
              </p>
            </div>
            
            <Link
              href="/fleet/insurance/rates"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-lg transition-colors text-center whitespace-nowrap"
            >
              Manage Rates
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Changes
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalChanges}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                Rate Increases
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">
                {stats.increases}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                Rate Decreases
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-red-600">
                {stats.decreases}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                Avg Increase
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                ${stats.averageIncrease.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Filters - Collapsible on mobile */}
        <div className="mb-4 sm:mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              Filters
            </h2>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 active:text-blue-800"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Provider
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Providers</option>
                {providerSummary.map((ps) => (
                  <option key={ps.provider.id} value={ps.provider.id}>
                    {ps.provider.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tier
              </label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Tiers</option>
                <option value="MINIMUM">Minimum</option>
                <option value="BASIC">Basic</option>
                <option value="PREMIUM">Premium</option>
                <option value="LUXURY">Luxury</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vehicle Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Classes</option>
                <option value="under25k">Under $25k</option>
                <option value="25kto50k">$25k - $50k</option>
                <option value="50kto75k">$50k - $75k</option>
                <option value="75kto100k">$75k - $100k</option>
                <option value="over100k">Over $100k</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* History Table - Horizontally scrollable */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="-mx-4 sm:mx-0 overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Date
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Provider
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Tier / Class
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-right text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Old Rate
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-right text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      New Rate
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-right text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Change
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 sm:px-6 py-8 sm:py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                        No rate changes found
                      </td>
                    </tr>
                  ) : (
                    history.map((change) => (
                      <tr key={change.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-100 dark:active:bg-gray-700">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-white whitespace-nowrap">
                          {new Date(change.effectiveDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: '2-digit'
                          })}
                        </td>
                        
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                            {change.provider.name}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {change.provider.type}
                          </div>
                        </td>
                        
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                            {change.tier}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {change.vehicleClass}
                          </div>
                        </td>
                        
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right text-gray-900 dark:text-white whitespace-nowrap">
                          ${change.oldRate.toFixed(2)}
                        </td>
                        
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          ${change.newRate.toFixed(2)}
                        </td>
                        
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right">
                          <div className={`font-medium whitespace-nowrap ${
                            change.changeType === 'INCREASE' 
                              ? 'text-green-600' 
                              : change.changeType === 'DECREASE'
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}>
                            {change.changeType === 'INCREASE' ? '+' : change.changeType === 'DECREASE' ? '-' : ''}
                            ${Math.abs(change.change).toFixed(2)}
                          </div>
                          {change.changePercent !== null && (
                            <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              ({change.changePercent > 0 ? '+' : ''}{change.changePercent.toFixed(1)}%)
                            </div>
                          )}
                        </td>
                        
                        <td className="px-3 sm:px-6 py-3 sm:py-4 min-w-[150px]">
                          <div className="text-xs sm:text-sm text-gray-900 dark:text-white">
                            {change.reason || 'No reason provided'}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                            by {change.changedBy}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}