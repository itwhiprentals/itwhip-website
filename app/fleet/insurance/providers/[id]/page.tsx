// app/fleet/insurance/providers/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  IoArrowBackOutline,
  IoBusinessOutline,
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoChatbubbleOutline,
  IoFolderOutline,
  IoLayersOutline,
  IoSettingsOutline,
  IoRefreshOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline
} from 'react-icons/io5'

// Import tab components
import OverviewTab from './components/OverviewTab'
import ClaimsTab from './components/ClaimsTab'
import FnolActivityTab from './components/FnolActivityTab'
import MessagesTab from './components/MessagesTab'
import DocumentsTab from './components/DocumentsTab'
import CoverageTab from './components/CoverageTab'
import SettingsTab from './components/SettingsTab'

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
  apiKey: string | null
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

type TabId = 'overview' | 'claims' | 'fnol' | 'messages' | 'documents' | 'coverage' | 'settings'

export default function ProviderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const [provider, setProvider] = useState<Provider | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [refreshing, setRefreshing] = useState(false)

  // Check for tab in URL hash
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as TabId
    const validTabs: TabId[] = ['overview', 'claims', 'fnol', 'messages', 'documents', 'coverage', 'settings']
    if (hash && validTabs.includes(hash)) {
      setActiveTab(hash)
    }
  }, [])

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

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchProvider()
    setRefreshing(false)
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
      await fetchProvider()
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
      await fetchProvider()
    } catch (error) {
      alert('Failed to set as primary provider')
    }
  }

  const changeTab = (tab: TabId) => {
    setActiveTab(tab)
    window.location.hash = tab
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

  const tabs: Array<{ id: TabId; label: string; icon: any; badge?: number }> = [
    { id: 'overview', label: 'Overview', icon: IoBusinessOutline },
    { id: 'claims', label: 'Claims', icon: IoDocumentTextOutline, badge: 0 }, // TODO: Get count from API
    { id: 'fnol', label: 'FNOL Activity', icon: IoShieldCheckmarkOutline },
    { id: 'messages', label: 'Messages', icon: IoChatbubbleOutline },
    { id: 'documents', label: 'Documents', icon: IoFolderOutline },
    { id: 'coverage', label: 'Coverage', icon: IoLayersOutline },
    { id: 'settings', label: 'Settings', icon: IoSettingsOutline },
  ]

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
            <div className="flex items-start justify-between">
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

              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                title="Refresh"
              >
                <IoRefreshOutline className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
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

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700 -mx-4 sm:mx-0">
          <div className="px-4 sm:px-0 flex gap-4 sm:gap-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => changeTab(tab.id)}
                  className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <OverviewTab 
              provider={provider} 
              contractActive={contractActive}
              onRefresh={fetchProvider}
            />
          )}
          
          {activeTab === 'claims' && (
            <ClaimsTab providerId={provider.id} providerName={provider.name} />
          )}
          
          {activeTab === 'fnol' && (
            <FnolActivityTab providerId={provider.id} />
          )}
          
          {activeTab === 'messages' && (
            <MessagesTab providerId={provider.id} providerName={provider.name} />
          )}
          
          {activeTab === 'documents' && (
            <DocumentsTab providerId={provider.id} provider={provider} />
          )}
          
          {activeTab === 'coverage' && (
            <CoverageTab provider={provider} />
          )}
          
          {activeTab === 'settings' && (
            <SettingsTab provider={provider} onUpdate={fetchProvider} />
          )}
        </div>

      </div>
    </div>
  )
}