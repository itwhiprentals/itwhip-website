// app/fleet/insurance/rates/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Provider {
  id: string
  name: string
  type: string
  isActive: boolean
  pricingRules: {
    [vehicleClass: string]: {
      [tier: string]: number
    }
  }
  revenueShare: number
}

const VEHICLE_CLASSES = [
  { key: 'under25k', label: 'Under $25k', description: 'Economy vehicles' },
  { key: '25kto50k', label: '$25k - $50k', description: 'Standard vehicles' },
  { key: '50kto75k', label: '$50k - $75k', description: 'Premium vehicles' },
  { key: '75kto100k', label: '$75k - $100k', description: 'Luxury vehicles' },
  { key: 'over100k', label: 'Over $100k', description: 'Exotic vehicles' }
]

const TIERS = [
  { key: 'MINIMUM', label: 'Minimum', color: 'bg-gray-100 dark:bg-gray-700' },
  { key: 'BASIC', label: 'Basic', color: 'bg-blue-100 dark:bg-blue-900/30' },
  { key: 'PREMIUM', label: 'Premium', color: 'bg-purple-100 dark:bg-purple-900/30' },
  { key: 'LUXURY', label: 'Luxury', color: 'bg-amber-100 dark:bg-amber-900/30' }
]

export default function RateManagementPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [editedRates, setEditedRates] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/fleet/insurance/providers')
      const data = await response.json()
      setProviders(data.providers || [])
      
      if (data.providers?.length > 0) {
        setSelectedProvider(data.providers[0].id)
        setEditedRates(data.providers[0].pricingRules)
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProviderChange = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId)
    if (provider) {
      setSelectedProvider(providerId)
      setEditedRates(provider.pricingRules)
      setHasChanges(false)
    }
  }

  const handleRateChange = (vehicleClass: string, tier: string, value: string) => {
    const newRates = { ...editedRates }
    if (!newRates[vehicleClass]) {
      newRates[vehicleClass] = {}
    }
    newRates[vehicleClass][tier] = parseFloat(value) || 0
    setEditedRates(newRates)
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!selectedProvider || !hasChanges) return

    setSaving(true)
    try {
      const response = await fetch(`/api/fleet/insurance/providers/${selectedProvider}/rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pricingRules: editedRates,
          changedBy: 'admin@itwhip.com',
          reason: 'Rate update via dashboard'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save rates')
      }

      const result = await response.json()
      alert(`Successfully updated ${result.rateChanges} rates`)
      
      setHasChanges(false)
      fetchProviders()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save rates')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    const provider = providers.find(p => p.id === selectedProvider)
    if (provider) {
      setEditedRates(provider.pricingRules)
      setHasChanges(false)
    }
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

  const currentProvider = providers.find(p => p.id === selectedProvider)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Rate Management
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Update insurance pricing across all tiers and vehicle classes
              </p>
            </div>
            
            <Link
              href="/fleet/insurance/rates/history"
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-900 active:bg-black text-white text-sm font-medium rounded-lg transition-colors text-center whitespace-nowrap"
            >
              View History
            </Link>
          </div>
        </div>

        {/* Provider Selection */}
        <div className="mb-4 sm:mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Provider
          </label>
          <select
            value={selectedProvider || ''}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name} ({provider.type})
              </option>
            ))}
          </select>

          {currentProvider && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Provider Type:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {currentProvider.type}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Revenue Share:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {(currentProvider.revenueShare * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rate Matrix */}
        {editedRates && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-4 sm:mb-6">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Daily Premium Rates
                </h2>
                {hasChanges && (
                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs sm:text-sm font-medium rounded self-start">
                    Unsaved Changes
                  </span>
                )}
              </div>
            </div>

            {/* Table - Horizontally scrollable */}
            <div className="-mx-4 sm:mx-0 overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        Vehicle Class
                      </th>
                      {TIERS.map((tier) => (
                        <th key={tier.key} className="px-3 sm:px-6 py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                          {tier.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {VEHICLE_CLASSES.map((vehicleClass) => (
                      <tr key={vehicleClass.key} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div>
                            <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                              {vehicleClass.label}
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {vehicleClass.description}
                            </div>
                          </div>
                        </td>
                        {TIERS.map((tier) => (
                          <td key={tier.key} className="px-2 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editedRates[vehicleClass.key]?.[tier.key] || 0}
                                onChange={(e) => handleRateChange(vehicleClass.key, tier.key, e.target.value)}
                                className={`w-16 sm:w-24 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg ${tier.color} text-gray-900 dark:text-white text-center font-medium focus:ring-2 focus:ring-blue-500`}
                              />
                              <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400">/day</span>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Revenue Preview - Scrollable on mobile */}
            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <h3 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Platform Revenue (Your Cut: {currentProvider ? (currentProvider.revenueShare * 100).toFixed(0) : 0}%)
              </h3>
              <div className="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto">
                <div className="grid grid-cols-5 gap-3 sm:gap-4 min-w-max sm:min-w-0">
                  {VEHICLE_CLASSES.map((vehicleClass) => (
                    <div key={vehicleClass.key} className="min-w-[100px] sm:min-w-0">
                      <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-2 whitespace-nowrap">
                        {vehicleClass.label}
                      </div>
                      <div className="space-y-1">
                        {TIERS.map((tier) => {
                          const rate = editedRates[vehicleClass.key]?.[tier.key] || 0
                          const revenue = currentProvider ? rate * currentProvider.revenueShare : 0
                          return (
                            <div key={tier.key} className="text-[10px] sm:text-xs">
                              <span className="text-gray-500 dark:text-gray-400">{tier.label}:</span>
                              <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                ${revenue.toFixed(2)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {hasChanges && (
              <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 sm:px-6 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white active:text-black dark:active:text-white font-medium text-center"
                >
                  Reset Changes
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 sm:px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Rate Changes'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Help Text */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Rate Guidelines
          </h3>
          <ul className="space-y-1 text-xs sm:text-sm text-blue-800 dark:text-blue-200">
            <li>• Rates are charged per day of rental</li>
            <li>• Platform earns {currentProvider ? (currentProvider.revenueShare * 100).toFixed(0) : 0}% of the insurance premium</li>
            <li>• Changes apply to new bookings immediately after saving</li>
            <li>• All rate changes are tracked in the history log</li>
          </ul>
        </div>

      </div>
    </div>
  )
}