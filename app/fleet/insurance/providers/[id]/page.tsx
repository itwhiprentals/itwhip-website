// app/fleet/insurance/providers/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  apiEndpoint: string | null
  apiEndpointPlaceholder: string | null
  webhookUrl: string | null
  contractStart: string | null
  contractEnd: string | null
  contractTerms: string | null
  coverageTiers: any
  pricingRules: any
  createdAt: string
  updatedAt: string
  _count: {
    policies: number
    rateHistory: number
    vehicleOverrides: number
  }
  policies: any[]
  rateHistory: any[]
  vehicleOverrides: any[]
}

export default function ProviderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [provider, setProvider] = useState<Provider | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'coverage' | 'rates' | 'policies'>('overview')

  useEffect(() => {
    if (params.id) {
      fetchProvider()
    }
  }, [params.id])

  const fetchProvider = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/fleet/insurance/providers/${params.id}?key=phoenix-fleet-2847`)
      if (!response.ok) throw new Error('Provider not found')
      const data = await response.json()
      setProvider(data)
    } catch (error) {
      console.error('Failed to fetch provider:', error)
      alert('Failed to load provider details')
      router.push('/fleet/insurance/providers?key=phoenix-fleet-2847')
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async () => {
    if (!provider) return
    
    try {
      const response = await fetch(`/api/fleet/insurance/providers/${provider.id}?key=phoenix-fleet-2847`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !provider.isActive })
      })

      if (!response.ok) throw new Error('Failed to update status')
      fetchProvider()
    } catch (error) {
      alert('Failed to update provider status')
    }
  }

  const setPrimary = async () => {
    if (!provider) return
    
    try {
      const response = await fetch(`/api/fleet/insurance/providers/${provider.id}?key=phoenix-fleet-2847`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPrimary: true })
      })

      if (!response.ok) throw new Error('Failed to set primary')
      fetchProvider()
    } catch (error) {
      alert('Failed to set as primary provider')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4 sm:space-y-6">
            <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-800 rounded w-2/3 sm:w-1/3"></div>
            <div className="h-48 sm:h-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-6">
            <p className="text-sm sm:text-base text-red-800 dark:text-red-200">Provider not found</p>
          </div>
        </div>
      </div>
    )
  }

  const contractActive = provider.contractStart && provider.contractEnd
    ? new Date() >= new Date(provider.contractStart) && new Date() <= new Date(provider.contractEnd)
    : true

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="mb-4 sm:mb-6 flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 overflow-x-auto">
          <Link href="/fleet/insurance?key=phoenix-fleet-2847" className="hover:text-gray-900 dark:hover:text-white whitespace-nowrap">
            Insurance
          </Link>
          <span>/</span>
          <Link href="/fleet/insurance/providers?key=phoenix-fleet-2847" className="hover:text-gray-900 dark:hover:text-white whitespace-nowrap">
            Providers
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white truncate">{provider.name}</span>
        </div>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  {provider.name}
                </h1>
                
                {provider.isPrimary && (
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs sm:text-sm font-bold rounded whitespace-nowrap">
                    PRIMARY
                  </span>
                )}
                
                <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium rounded whitespace-nowrap ${
                  provider.isActive
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                }`}>
                  {provider.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>

                <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs sm:text-sm font-medium rounded uppercase whitespace-nowrap">
                  {provider.type}
                </span>
              </div>

              {provider.coverageNotes && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {provider.coverageNotes}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {!provider.isPrimary && provider.isActive && (
                <button
                  onClick={setPrimary}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-center"
                >
                  Set as Primary
                </button>
              )}
              
              <button
                onClick={toggleStatus}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors text-center ${
                  provider.isActive
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 active:bg-gray-400 dark:active:bg-gray-500'
                    : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
                }`}
              >
                {provider.isActive ? 'Deactivate' : 'Activate'}
              </button>

              <Link
                href={`/fleet/insurance/providers/${provider.id}/edit?key=phoenix-fleet-2847`}
                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 active:bg-gray-700 dark:active:bg-gray-200 transition-colors text-center"
              >
                Edit Provider
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Active Policies</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {provider._count.policies}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Rate Changes</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {provider._count.rateHistory}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Vehicle Overrides</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {provider._count.vehicleOverrides}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Revenue Share</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {(provider.revenueShare * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Tabs - Scrollable on mobile */}
        <div className="mb-4 sm:mb-6 border-b border-gray-200 dark:border-gray-700 -mx-4 sm:mx-0">
          <div className="px-4 sm:px-0 flex gap-4 sm:gap-6 overflow-x-auto">
            {(['overview', 'coverage', 'rates', 'policies'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 text-sm font-medium capitalize transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 active:text-gray-900 dark:active:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            
            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Contact Information</h2>
              </div>
              <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                  <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white break-all">
                    {provider.contactEmail || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</p>
                  <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                    {provider.contactPhone || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* API Integration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">API Integration</h2>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">API Endpoint</p>
                  <p className="font-mono text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded text-gray-900 dark:text-white break-all">
                    {provider.apiEndpoint || provider.apiEndpointPlaceholder || 'Not configured'}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Webhook URL</p>
                  <p className="font-mono text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded text-gray-900 dark:text-white break-all">
                    {provider.webhookUrl || 'Not configured'}
                  </p>
                </div>
              </div>
            </div>

            {/* Contract Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Contract Details</h2>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Contract Start</p>
                    <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                      {provider.contractStart 
                        ? new Date(provider.contractStart).toLocaleDateString()
                        : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Contract End</p>
                    <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                      {provider.contractEnd 
                        ? new Date(provider.contractEnd).toLocaleDateString()
                        : 'Not set'}
                    </p>
                  </div>
                </div>
                
                {provider.contractStart && provider.contractEnd && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                    <p className={`text-sm sm:text-base font-medium ${contractActive ? 'text-green-600' : 'text-red-600'}`}>
                      {contractActive ? 'Active Contract' : 'Contract Expired'}
                    </p>
                  </div>
                )}

                {provider.contractTerms && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Terms</p>
                    <p className="text-xs sm:text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                      {provider.contractTerms}
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {activeTab === 'coverage' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Coverage Rules</h2>
            </div>
            <div className="p-4 sm:p-6 space-y-6">
              
              {/* Vehicle Value Range */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3">Vehicle Value Range</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Minimum Value</p>
                    <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                      {provider.vehicleValueMin !== null 
                        ? `$${provider.vehicleValueMin.toLocaleString()}`
                        : 'No minimum'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Maximum Value</p>
                    <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                      {provider.vehicleValueMax !== null 
                        ? `$${provider.vehicleValueMax.toLocaleString()}`
                        : 'No maximum'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Excluded Makes */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3">Excluded Makes</h3>
                {provider.excludedMakes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {provider.excludedMakes.map((make) => (
                      <span
                        key={make}
                        className="px-2 sm:px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs sm:text-sm font-medium rounded"
                      >
                        {make}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No makes excluded</p>
                )}
              </div>

              {/* Excluded Models */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3">Excluded Models</h3>
                {provider.excludedModels.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {provider.excludedModels.map((model) => (
                      <span
                        key={model}
                        className="px-2 sm:px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs sm:text-sm font-medium rounded"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No models excluded</p>
                )}
              </div>

            </div>
          </div>
        )}

        {activeTab === 'rates' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Current Rates</h2>
                <Link
                  href={`/fleet/insurance/providers/${provider.id}/edit?key=phoenix-fleet-2847#rates`}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-center"
                >
                  Update Rates
                </Link>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Rate configuration available in edit mode
              </p>
            </div>
          </div>
        )}

        {activeTab === 'policies' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Recent Policies</h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {provider.policies.length === 0 ? (
                <div className="p-8 sm:p-12 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">No policies issued yet</p>
                </div>
              ) : (
                provider.policies.map((policy) => (
                  <div key={policy.id} className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                          Policy #{policy.policyNumber || policy.id.slice(0, 8)}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {policy.booking?.bookingCode || 'No booking code'}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {new Date(policy.effectiveDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          ${policy.totalPremium.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}