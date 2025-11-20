// app/host/cars/[id]/components/DocumentLifecyclePanel.tsx

'use client'

import { useState, useEffect } from 'react'
import { 
  IoDocumentsOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoShieldCheckmarkOutline,
  IoFingerPrintOutline,
  IoCarOutline,
  IoAlertCircleOutline,
  IoInformationCircleOutline,
  IoDownloadOutline,
  IoDocumentTextOutline,
  IoTrendingUpOutline
} from 'react-icons/io5'

interface DocumentData {
  vin: {
    value: string | null
    status: string
    verifiedBy: string | null
    verifiedAt: string | null
    verificationMethod: string | null
    lastEightDigits: string | null
  }
  registration: {
    status: string
    verifiedBy: string | null
    verifiedAt: string | null
    expiryDate: string | null
    daysUntilExpiry: number | null
    registeredOwner: string | null
  }
  insurance: {
    type: string
    provider: string
    revenueSplit: number
    tierName: string
    insuranceStatus: string
    canUpgrade: boolean
    upgradeMessage: string
    isApproved: boolean
    hostInsuranceDetails: {
      type: string
      provider: string
      policyNumber: string
      expiresAt: string
      status: string
    } | null
    allInsuranceOptions: {
      commercial: any
      p2p: any
      legacy: any
    }
    documentStatus: string
    verifiedBy: string | null
    verifiedAt: string | null
    expiryDate: string | null
    daysUntilExpiry: number | null
  }
  title: {
    status: string
    verifiedBy: string | null
    verifiedAt: string | null
    hasLien: boolean
    lienholderName: string | null
    lienholderAddress: string | null
  }
}

interface DocumentLifecyclePanelProps {
  carId: string
}

export default function DocumentLifecyclePanel({ carId }: DocumentLifecyclePanelProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [carId])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/host/cars/${carId}/documents`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }
      
      const result = await response.json()
      if (result.success) {
        setData(result)
      }
    } catch (err) {
      console.error('Error fetching documents:', err)
      setError(err instanceof Error ? err.message : 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'VERIFIED': 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
      'UPLOADED': 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      'NOT_VERIFIED': 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
      'EXPIRING_SOON': 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
      'EXPIRED': 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
      'MISSING': 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-600'
    }
    return colors[status] || colors['MISSING']
  }

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      'VERIFIED': IoCheckmarkCircleOutline,
      'UPLOADED': IoDocumentsOutline,
      'NOT_VERIFIED': IoWarningOutline,
      'EXPIRING_SOON': IoTimeOutline,
      'EXPIRED': IoCloseCircleOutline,
      'MISSING': IoAlertCircleOutline
    }
    const Icon = icons[status] || IoAlertCircleOutline
    return <Icon className="w-4 h-4" />
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-center py-8">
          <IoAlertCircleOutline className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Unable to Load Documents
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {error || 'Something went wrong'}
          </p>
          <button
            onClick={fetchDocuments}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { vehicle, documents, compliance } = data

  return (
    <div className="space-y-4">
      
      {/* Header with Compliance Score */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col space-y-4">
          {/* Title and Vehicle Info */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex-shrink-0">
              <IoDocumentsOutline className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Document Lifecycle & Compliance
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
            </div>
          </div>

          {/* Compliance Score Section */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Compliance Score</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {compliance.passedChecks} of {compliance.totalChecks} checks passed
              </p>
            </div>
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
              compliance.score >= 90 ? 'bg-green-100 dark:bg-green-900/20' :
              compliance.score >= 70 ? 'bg-yellow-100 dark:bg-yellow-900/20' :
              'bg-red-100 dark:bg-red-900/20'
            }`}>
              <div className={`flex items-baseline gap-0.5 ${
                compliance.score >= 90 ? 'text-green-600 dark:text-green-400' :
                compliance.score >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                <span className="text-xl sm:text-2xl font-bold leading-none">
                  {compliance.score}
                </span>
                <span className="text-xs font-medium leading-none">%</span>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {compliance.warnings.length > 0 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-2">
                <IoWarningOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                    Action Required ({compliance.warnings.length})
                  </p>
                  <ul className="space-y-1">
                    {compliance.warnings.map((warning: string, index: number) => (
                      <li key={index} className="text-xs text-yellow-700 dark:text-yellow-400 break-words">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VIN Document */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className={`p-4 border-l-4 ${
          documents.vin.status === 'VERIFIED' ? 'border-green-500' :
          documents.vin.status === 'UPLOADED' ? 'border-blue-500' :
          'border-gray-300'
        }`}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
                <IoFingerPrintOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                  Vehicle Identification Number
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Primary identifier
                </p>
              </div>
            </div>

            <span className={`px-2 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 flex-shrink-0 ${getStatusColor(documents.vin.status)}`}>
              {getStatusIcon(documents.vin.status)}
              <span className="hidden sm:inline">{documents.vin.status.replace(/_/g, ' ')}</span>
            </span>
          </div>

          <div className="space-y-3">
            {documents.vin.value && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">VIN</p>
                <p className="text-sm font-mono font-medium text-gray-900 dark:text-white break-all">
                  {documents.vin.value}
                </p>
              </div>
            )}

            {documents.vin.verifiedBy && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Verified By</p>
                  <p className="text-sm text-gray-900 dark:text-white">Fleet Admin</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Verified On</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(documents.vin.verifiedAt)}
                  </p>
                </div>

                {documents.vin.verificationMethod && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Method</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {documents.vin.verificationMethod}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Registration Document */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className={`p-4 border-l-4 ${
          documents.registration.status === 'VERIFIED' ? 'border-green-500' :
          documents.registration.status === 'EXPIRING_SOON' ? 'border-orange-500' :
          documents.registration.status === 'EXPIRED' ? 'border-red-500' :
          'border-gray-300'
        }`}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
                <IoCarOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                  Vehicle Registration
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  State registration
                </p>
              </div>
            </div>

            <span className={`px-2 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 flex-shrink-0 ${getStatusColor(documents.registration.status)}`}>
              {getStatusIcon(documents.registration.status)}
              <span className="hidden sm:inline">{documents.registration.status.replace(/_/g, ' ')}</span>
            </span>
          </div>

          <div className="space-y-3">
            {documents.registration.registeredOwner && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Registered Owner</p>
                <p className="text-sm text-gray-900 dark:text-white break-words">
                  {documents.registration.registeredOwner}
                </p>
              </div>
            )}

            {documents.registration.expiryDate && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expires</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(documents.registration.expiryDate)}
                  </p>
                  {documents.registration.daysUntilExpiry !== null && (
                    <span className={`text-xs font-medium ${
                      documents.registration.daysUntilExpiry < 0 ? 'text-red-600 dark:text-red-400' :
                      documents.registration.daysUntilExpiry < 30 ? 'text-orange-600 dark:text-orange-400' :
                      'text-green-600 dark:text-green-400'
                    }`}>
                      {documents.registration.daysUntilExpiry < 0
                        ? `Expired ${Math.abs(documents.registration.daysUntilExpiry)} days ago`
                        : `${documents.registration.daysUntilExpiry} days left`
                      }
                    </span>
                  )}
                </div>
              </div>
            )}

            {documents.registration.verifiedBy && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Verified By</p>
                  <p className="text-sm text-gray-900 dark:text-white">Fleet Admin</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Verified On</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(documents.registration.verifiedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Insurance Document */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className={`p-4 border-l-4 ${
          documents.insurance?.documentStatus === 'VERIFIED' ? 'border-green-500' :
          documents.insurance?.documentStatus === 'EXPIRING_SOON' ? 'border-orange-500' :
          documents.insurance?.documentStatus === 'EXPIRED' ? 'border-red-500' :
          'border-purple-500'
        }`}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
                <IoShieldCheckmarkOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                  Insurance Coverage
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Revenue tier
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
              {/* Tier Badge */}
              {documents.insurance?.tierName && (
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                  documents.insurance.tierName === 'PREMIUM' 
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                    : documents.insurance.tierName === 'STANDARD'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {documents.insurance.revenueSplit}% Split
                </span>
              )}
              
              {/* Upgrade Badge */}
              {documents.insurance?.canUpgrade && (
                <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1 whitespace-nowrap">
                  <IoTrendingUpOutline className="w-3 h-3" />
                  <span className="hidden sm:inline">Upgrade</span>
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {/* Insurance Details Grid */}
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Type</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white text-right">
                  {documents.insurance?.type || 'Platform Only (40%)'}
                </span>
              </div>

              <div className="flex justify-between items-start gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Provider</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white text-right">
                  {documents.insurance?.provider || 'ItWhip Platform Insurance'}
                </span>
              </div>

              <div className="flex justify-between items-start gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Revenue Split</span>
                <span className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400">
                  {documents.insurance?.revenueSplit || 40}%
                </span>
              </div>

              <div className="flex justify-between items-start gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Status</span>
                <span className={`text-xs sm:text-sm font-medium ${
                  documents.insurance?.insuranceStatus === 'ACTIVE' 
                    ? 'text-green-600 dark:text-green-400'
                    : documents.insurance?.insuranceStatus === 'PENDING'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {documents.insurance?.insuranceStatus || 'N/A'}
                </span>
              </div>
            </div>

            {/* HOST INSURANCE DETAILS - BLUE BOX */}
            {documents.insurance?.hostInsuranceDetails && (
              <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2 sm:mb-3 flex items-center gap-2">
                  <IoShieldCheckmarkOutline className="w-4 h-4 flex-shrink-0" />
                  Your Submitted Insurance
                </h4>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-blue-700 dark:text-blue-300">Type:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100 text-right">
                      {documents.insurance.hostInsuranceDetails.type === 'COMMERCIAL' ? 'Commercial Insurance' : 
                       documents.insurance.hostInsuranceDetails.type === 'P2P' ? 'P2P Insurance' :
                       documents.insurance.hostInsuranceDetails.type === 'P2P_LEGACY' ? 'P2P Insurance (Legacy)' :
                       documents.insurance.hostInsuranceDetails.type}
                    </span>
                  </div>
                  {documents.insurance.hostInsuranceDetails.provider && (
                    <div className="flex justify-between gap-2">
                      <span className="text-blue-700 dark:text-blue-300">Provider:</span>
                      <span className="font-medium text-blue-900 dark:text-blue-100 text-right break-words">
                        {documents.insurance.hostInsuranceDetails.provider}
                      </span>
                    </div>
                  )}
                  {documents.insurance.hostInsuranceDetails.policyNumber && (
                    <div className="flex justify-between gap-2">
                      <span className="text-blue-700 dark:text-blue-300">Policy #:</span>
                      <span className="font-mono text-blue-900 dark:text-blue-100 break-all text-right">
                        {documents.insurance.hostInsuranceDetails.policyNumber}
                      </span>
                    </div>
                  )}
                  {documents.insurance.hostInsuranceDetails.expiresAt && (
                    <div className="flex justify-between gap-2">
                      <span className="text-blue-700 dark:text-blue-300">Expires:</span>
                      <span className="font-medium text-blue-900 dark:text-blue-100">
                        {new Date(documents.insurance.hostInsuranceDetails.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between gap-2">
                    <span className="text-blue-700 dark:text-blue-300">Status:</span>
                    <span className={`font-medium ${
                      documents.insurance.hostInsuranceDetails.status === 'ACTIVE'
                        ? 'text-green-600 dark:text-green-400'
                        : documents.insurance.hostInsuranceDetails.status === 'PENDING'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {documents.insurance.hostInsuranceDetails.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* UPGRADE MESSAGE */}
            {documents.insurance?.upgradeMessage && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-xs sm:text-sm text-green-800 dark:text-green-300 flex items-start gap-2">
                  <IoInformationCircleOutline className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{documents.insurance.upgradeMessage}</span>
                </p>
              </div>
            )}

            {/* Document Verification Details */}
            {documents.insurance?.verifiedBy && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Document Verification
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Verified By</span>
                    <span className="text-gray-700 dark:text-gray-300">Fleet Admin</span>
                  </div>
                  {documents.insurance.verifiedAt && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Verified At</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {formatDate(documents.insurance.verifiedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {documents.insurance?.expiryDate && (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Document Expires</span>
                <div className="flex flex-col sm:items-end gap-1">
                  <span className="text-xs sm:text-sm text-gray-900 dark:text-white">
                    {formatDate(documents.insurance.expiryDate)}
                  </span>
                  {documents.insurance.daysUntilExpiry !== null && (
                    <span className={`text-xs font-medium ${
                      documents.insurance.daysUntilExpiry < 0 
                        ? 'text-red-600 dark:text-red-400' 
                        : documents.insurance.daysUntilExpiry < 30
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {documents.insurance.daysUntilExpiry < 0
                        ? `Expired ${Math.abs(documents.insurance.daysUntilExpiry)} days ago`
                        : `${documents.insurance.daysUntilExpiry} days left`
                      }
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title Document */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className={`p-4 border-l-4 ${
          documents.title.verifiedBy ? 'border-green-500' : 'border-gray-300'
        }`}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
                <IoDocumentTextOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                  Vehicle Title
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ownership document
                </p>
              </div>
            </div>

            <span className={`px-2 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 flex-shrink-0 ${
              documents.title.status === 'Clean' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' :
              documents.title.status === 'Salvage' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' :
              'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
            }`}>
              {documents.title.status || 'Unknown'}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Title Status</p>
              <p className="text-sm text-gray-900 dark:text-white">
                {documents.title.status || 'Not Set'}
              </p>
            </div>

            {documents.title.hasLien && (
              <>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Lienholder</p>
                  <p className="text-sm text-gray-900 dark:text-white break-words">
                    {documents.title.lienholderName || 'Yes'}
                  </p>
                </div>

                {documents.title.lienholderAddress && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Lienholder Address</p>
                    <p className="text-sm text-gray-900 dark:text-white break-words">
                      {documents.title.lienholderAddress}
                    </p>
                  </div>
                )}
              </>
            )}

            {documents.title.verifiedBy && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Verified By</p>
                  <p className="text-sm text-gray-900 dark:text-white">Fleet Admin</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Verified On</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(documents.title.verifiedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => window.print()}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium"
        >
          <IoDownloadOutline className="w-4 h-4" />
          Export Report
        </button>
        
        <button
          onClick={fetchDocuments}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          Refresh Data
        </button>
      </div>
    </div>
  )
}