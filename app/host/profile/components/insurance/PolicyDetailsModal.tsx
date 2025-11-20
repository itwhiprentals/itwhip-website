// app/host/profile/components/insurance/PolicyDetailsModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  IoCloseOutline, 
  IoShieldCheckmarkOutline,
  IoCashOutline,
  IoCarOutline,
  IoDocumentTextOutline,
  IoWarningOutline
} from 'react-icons/io5'

interface PolicyDetailsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ProviderData {
  provider: {
    id: string
    name: string
    type: string
    isActive: boolean
    coverageNotes?: string
    contactEmail?: string
    contactPhone?: string
    vehicleValueMin?: number
    vehicleValueMax?: number
    excludedMakes?: string[]
    excludedModels?: string[]
    rates?: Array<{
      tier: string
      dailyRate: number
      weeklyRate: number
      monthlyRate: number
    }>
    policies?: Array<{
      tier: string
      deductible: number
      liabilityCoverage: number
      collisionCoverage: number
      comprehensiveCoverage: number
      personalInjury: number
      uninsuredMotorist: number
    }>
  }
  hostTier: string
  policyNumber?: string
}

export default function PolicyDetailsModal({ isOpen, onClose }: PolicyDetailsModalProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ProviderData | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchProviderDetails()
    }
  }, [isOpen])

  const fetchProviderDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/host/insurance/provider')
      if (response.ok) {
        const providerData = await response.json()
        setData(providerData)
      }
    } catch (error) {
      console.error('Error fetching provider details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <IoShieldCheckmarkOutline className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Insurance Policy Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <IoCloseOutline className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Provider Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {data.provider.name}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <p className="font-medium">{data.provider.type}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Policy #:</span>
                    <p className="font-medium font-mono">{data.policyNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Your Tier:</span>
                    <p className="font-medium">{data.hostTier}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Contact:</span>
                    <p className="font-medium">{data.provider.contactEmail || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Coverage Tiers */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <IoDocumentTextOutline className="w-5 h-5" />
                  Coverage Tiers
                </h3>
                <div className="grid gap-3">
                  {data.provider.policies?.map((policy) => (
                    <div key={policy.tier} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {policy.tier} Tier
                        </h4>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ${policy.deductible} deductible
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Liability:</span>
                          <p className="font-medium">${(policy.liabilityCoverage / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Collision:</span>
                          <p className="font-medium">
                            {policy.collisionCoverage > 0 
                              ? `$${(policy.collisionCoverage / 1000).toFixed(0)}K`
                              : 'Not covered'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Comprehensive:</span>
                          <p className="font-medium">
                            {policy.comprehensiveCoverage > 0 
                              ? `$${(policy.comprehensiveCoverage / 1000).toFixed(0)}K`
                              : 'Not covered'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Personal Injury:</span>
                          <p className="font-medium">${(policy.personalInjury / 1000).toFixed(0)}K</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Rates */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <IoCashOutline className="w-5 h-5" />
                  Insurance Rates (Per Day)
                </h3>
                <div className="grid gap-3">
                  {data.provider.rates?.map((rate) => (
                    <div key={rate.tier} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {rate.tier} Tier
                      </h4>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Daily:</span>
                          <p className="font-medium">${rate.dailyRate}/day</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Weekly:</span>
                          <p className="font-medium">${rate.weeklyRate}/week</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Monthly:</span>
                          <p className="font-medium">${rate.monthlyRate}/month</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vehicle Restrictions */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <IoCarOutline className="w-5 h-5" />
                  Vehicle Restrictions
                </h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Value Range:</span>
                    <p className="font-medium">
                      ${data.provider.vehicleValueMin?.toLocaleString() || '0'} - 
                      ${data.provider.vehicleValueMax?.toLocaleString() || 'No limit'}
                    </p>
                  </div>
                  {data.provider.excludedMakes && data.provider.excludedMakes.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Excluded Makes:</span>
                      <p className="font-medium text-red-600 dark:text-red-400">
                        {data.provider.excludedMakes.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Coverage Notes */}
              {data.provider.coverageNotes && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <IoWarningOutline className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                        Important Notes
                      </h4>
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        {data.provider.coverageNotes}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No provider details available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}