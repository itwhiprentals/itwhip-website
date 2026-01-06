// app/fleet/insurance/providers/[id]/components/OverviewTab.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  IoMailOutline,
  IoCallOutline,
  IoLinkOutline,
  IoCalendarOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoWarningOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

interface Provider {
  id: string
  name: string
  type: string
  contactEmail: string | null
  contactPhone: string | null
  apiEndpoint: string | null
  apiEndpointPlaceholder: string | null
  apiKey: string | null
  webhookUrl: string | null
  contractStart: string | null
  contractEnd: string | null
  contractTerms: string | null
  createdAt: string
  updatedAt: string
}

interface OverviewTabProps {
  provider: Provider
  contractActive: boolean
  onRefresh: () => void
}

export default function OverviewTab({ provider, contractActive, onRefresh }: OverviewTabProps) {
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionResult, setConnectionResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const testConnection = async () => {
    setTestingConnection(true)
    setConnectionResult(null)

    try {
      const response = await fetch(
        `/api/fleet/insurance/providers/${provider.id}/test?key=phoenix-fleet-2847`
      )
      const data = await response.json()
      
      setConnectionResult({
        success: data.success,
        message: data.message
      })
    } catch (error) {
      setConnectionResult({
        success: false,
        message: 'Connection test failed'
      })
    } finally {
      setTestingConnection(false)
      
      // Clear result after 5 seconds
      setTimeout(() => {
        setConnectionResult(null)
      }, 5000)
    }
  }

  const hasApiConfig = provider.apiEndpoint && provider.apiKey

  return (
    <div className="space-y-6">
      
      {/* API Status Alert */}
      {!hasApiConfig && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <IoWarningOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-1">
                API Configuration Incomplete
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                This provider does not have API credentials configured. FNOL submissions will not be automatic.
              </p>
              <Link
                href={`/fleet/insurance/providers/${provider.id}?key=phoenix-fleet-2847#settings`}
                className="text-sm text-yellow-900 dark:text-yellow-200 underline hover:no-underline mt-2 inline-block"
              >
                Configure API Settings →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Contact Information */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Contact Information
          </h2>
        </div>
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <IoMailOutline className="w-4 h-4" />
              <span>Email</span>
            </div>
            <p className="text-base font-medium text-gray-900 dark:text-white break-all">
              {provider.contactEmail || 'Not provided'}
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <IoCallOutline className="w-4 h-4" />
              <span>Phone</span>
            </div>
            <p className="text-base font-medium text-gray-900 dark:text-white">
              {provider.contactPhone || 'Not provided'}
            </p>
          </div>
        </div>
      </section>

      {/* API Integration */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              API Integration
            </h2>
            {hasApiConfig && (
              <button
                onClick={testConnection}
                disabled={testingConnection}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {testingConnection ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <IoLinkOutline className="w-4 h-4" />
                    <span>Test Connection</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
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

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">API Endpoint</p>
            <div className="font-mono text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded text-gray-900 dark:text-white break-all">
              {provider.apiEndpoint || provider.apiEndpointPlaceholder || 'Not configured'}
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">API Key</p>
            <div className="font-mono text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded text-gray-900 dark:text-white">
              {provider.apiKey ? '••••••••••••' + provider.apiKey.slice(-4) : 'Not configured'}
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Webhook URL</p>
            <div className="font-mono text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded text-gray-900 dark:text-white break-all">
              {provider.webhookUrl || 'Not configured'}
            </div>
          </div>

          {!hasApiConfig && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Configure API credentials in the Settings tab to enable automatic FNOL submissions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Contract Information */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Contract Details
          </h2>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <IoCalendarOutline className="w-4 h-4" />
                <span>Contract Start</span>
              </div>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {provider.contractStart 
                  ? new Date(provider.contractStart).toLocaleDateString()
                  : 'Not set'}
              </p>
            </div>
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <IoCalendarOutline className="w-4 h-4" />
                <span>Contract End</span>
              </div>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {provider.contractEnd 
                  ? new Date(provider.contractEnd).toLocaleDateString()
                  : 'Not set'}
              </p>
            </div>
          </div>
          
          {provider.contractStart && provider.contractEnd && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Status</p>
              <div className="flex items-center space-x-2">
                {contractActive ? (
                  <>
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                    <span className="text-base font-medium text-green-600">Active Contract</span>
                  </>
                ) : (
                  <>
                    <IoCloseCircleOutline className="w-5 h-5 text-red-600" />
                    <span className="text-base font-medium text-red-600">Contract Expired</span>
                  </>
                )}
              </div>
            </div>
          )}

          {provider.contractTerms && (
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <IoDocumentTextOutline className="w-4 h-4" />
                <span>Terms</span>
              </div>
              <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                {provider.contractTerms}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Provider Metadata */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Provider Metadata
          </h2>
        </div>
        <div className="p-4 sm:p-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400 mb-1">Provider ID</dt>
              <dd className="text-base font-medium text-gray-900 dark:text-white font-mono">
                {provider.id.slice(0, 12)}...
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400 mb-1">Provider Type</dt>
              <dd className="text-base font-medium text-gray-900 dark:text-white">
                {provider.type}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400 mb-1">Created</dt>
              <dd className="text-base font-medium text-gray-900 dark:text-white">
                {new Date(provider.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Updated</dt>
              <dd className="text-base font-medium text-gray-900 dark:text-white">
                {new Date(provider.updatedAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </section>

    </div>
  )
}