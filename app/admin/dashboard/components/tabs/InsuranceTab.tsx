// app/admin/dashboard/components/tabs/InsuranceTab.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  IoShieldCheckmarkOutline, 
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoRefreshOutline,
  IoBusinessOutline,
  IoLinkOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'

interface InsuranceProvider {
  id: string
  name: string
  type: string
  isActive: boolean
  isPrimary: boolean
  revenueShare: number
  apiEndpoint?: string
  apiKey?: string
  contactEmail?: string
  contactPhone?: string
  _count: {
    policies: number
  }
}

interface TestConnectionResponse {
  success: boolean
  message: string
  details?: {
    providerId: string
    providerName: string
    providerType: string
    status: string
    apiEndpoint?: string
    activePolicies?: number
    testedAt?: string
  }
}

export default function InsuranceTab() {
  const [providers, setProviders] = useState<InsuranceProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [testingConnection, setTestingConnection] = useState<string | null>(null)
  const [connectionResults, setConnectionResults] = useState<Record<string, { success: boolean; message: string }>>({})

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/fleet/insurance/providers?key=phoenix-fleet-2847')
      
      if (response.ok) {
        const data = await response.json()
        // Filter to only TRADITIONAL providers (Admin view)
        const traditionalProviders = (data.providers || []).filter(
          (p: InsuranceProvider) => p.type === 'TRADITIONAL'
        )
        setProviders(traditionalProviders)
      }
    } catch (error) {
      console.error('Failed to fetch insurance providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async (providerId: string, providerName: string) => {
    setTestingConnection(providerId)
    
    try {
      // Call real test connection endpoint
      const response = await fetch(
        `/api/fleet/insurance/providers/${providerId}/test?key=phoenix-fleet-2847`
      )
      
      const data: TestConnectionResponse = await response.json()
      
      setConnectionResults(prev => ({
        ...prev,
        [providerId]: {
          success: data.success,
          message: data.message
        }
      }))
    } catch (error) {
      setConnectionResults(prev => ({
        ...prev,
        [providerId]: {
          success: false,
          message: 'Connection test failed'
        }
      }))
    } finally {
      setTestingConnection(null)
      
      // Clear result after 5 seconds
      setTimeout(() => {
        setConnectionResults(prev => {
          const newResults = { ...prev }
          delete newResults[providerId]
          return newResults
        })
      }, 5000)
    }
  }

  const getStatusBadge = (provider: InsuranceProvider) => {
    if (!provider.isActive) {
      return (
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-medium rounded">
          ⚫ Inactive
        </span>
      )
    }
    
    // Check if has API configuration
    const hasApiConfig = provider.apiEndpoint && provider.apiKey
    
    if (hasApiConfig) {
      return (
        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium rounded">
          🟢 Active
        </span>
      )
    }
    
    return (
      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-medium rounded">
        🟡 Sandbox
        </span>
    )
  }

  const getTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'EMBEDDED':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400'
      case 'TRADITIONAL':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type.toUpperCase()) {
      case 'EMBEDDED':
        return 'Platform Insurance'
      case 'TRADITIONAL':
        return 'Carrier Partnership'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <IoAlertCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
              Partner View - Read Only
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              This view shows carrier partnership integrations. Insurance providers are managed by fleet operations. 
              Contact your administrator for configuration changes.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <IoShieldCheckmarkOutline className="w-6 h-6 mr-2 text-blue-600" />
            Insurance Partners
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {providers.length} carrier partnership{providers.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        
        <button
          onClick={fetchProviders}
          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
          title="Refresh"
        >
          <IoRefreshOutline className="w-5 h-5" />
        </button>
      </div>

      {/* Provider Cards */}
      {providers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <IoShieldCheckmarkOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Carrier Partnerships
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            No insurance carrier partnerships have been configured yet. 
            Carrier integrations will appear here once configured by the fleet operations team.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map(provider => {
            const connectionResult = connectionResults[provider.id]
            const isTesting = testingConnection === provider.id
            
            return (
              <div
                key={provider.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {provider.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getTypeColor(provider.type)}`}>
                          {getTypeLabel(provider.type)}
                        </span>
                        {provider.isPrimary && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded">
                            PRIMARY
                          </span>
                        )}
                      </div>
                    </div>
                    <IoBusinessOutline className="w-8 h-8 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                  
                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    {getStatusBadge(provider)}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Active Policies
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {provider._count.policies}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Revenue Share
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(provider.revenueShare * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* API Configuration */}
                  {provider.apiEndpoint && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-2">
                        <IoLinkOutline className="w-4 h-4 mr-1" />
                        API Endpoint
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 truncate">
                        {provider.apiEndpoint}
                      </div>
                      {provider.apiKey && (
                        <div className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                          🔑 API Key: {provider.apiKey}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contact Info */}
                  {(provider.contactEmail || provider.contactPhone) && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
                      {provider.contactEmail && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          📧 {provider.contactEmail}
                        </div>
                      )}
                      {provider.contactPhone && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          📞 {provider.contactPhone}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Connection Test Result */}
                  {connectionResult && (
                    <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                      connectionResult.success
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                    }`}>
                      {connectionResult.success ? (
                        <IoCheckmarkCircleOutline className="w-5 h-5" />
                      ) : (
                        <IoCloseCircleOutline className="w-5 h-5" />
                      )}
                      <span className="text-sm font-medium">
                        {connectionResult.message}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => testConnection(provider.id, provider.name)}
                    disabled={isTesting || !provider.isActive}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      !provider.isActive
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        : isTesting
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {isTesting ? (
                      <span className="flex items-center justify-center">
                        <IoRefreshOutline className="w-4 h-4 mr-2 animate-spin" />
                        Testing Connection...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <IoLinkOutline className="w-4 h-4 mr-2" />
                        Test API Connection
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Summary Stats */}
      {providers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Active Partnerships
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {providers.filter(p => p.isActive).length}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Policies
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {providers.reduce((sum, p) => sum + p._count.policies, 0)}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Avg Revenue Share
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {providers.length > 0 
                ? ((providers.reduce((sum, p) => sum + p.revenueShare, 0) / providers.length) * 100).toFixed(0)
                : 0}%
            </div>
          </div>
        </div>
      )}
    </div>
  )
}