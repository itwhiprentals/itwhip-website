// app/(guest)/profile/components/tabs/InsuranceTab.tsx
// ✅ INSURANCE TAB - Your original design with new insurance system logic

'use client'

import { useState, useEffect } from 'react'
import { 
  IoShieldCheckmarkOutline,
  IoAddOutline,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoCalendarOutline,
  IoDocumentTextOutline,
  IoPencilOutline,
  IoInformationCircleOutline,
  IoCloseCircle
} from 'react-icons/io5'
import InsuranceForm from '../InsuranceForm'
import InsuranceHistoryLog from '../InsuranceHistoryLog'

interface CurrentInsurance {
  provider: string | null
  policyNumber: string | null
  expiryDate: string | null
  hasRideshare: boolean
  coverageType: string | null
  customCoverage: string | null
  cardFrontUrl: string | null
  cardBackUrl: string | null
  notes: string | null
  verified: boolean
  verifiedAt: string | null
  verifiedBy: string | null
  addedAt: string | null
  updatedAt: string | null
  status: string
  daysUntilExpiry: number | null
}

interface InsuranceHistory {
  id: string
  action: string
  status: string
  provider: string | null
  policyNumber: string | null
  expiryDate: string | null
  hasRideshare: boolean
  coverageType: string | null
  customCoverage: string | null
  cardFrontUrl: string | null
  cardBackUrl: string | null
  notes: string | null
  verificationStatus: string
  verifiedBy: string | null
  verifiedAt: string | null
  changedBy: string
  changedAt: string
  changeReason: string | null
}

export default function InsuranceTab() {
  const [currentInsurance, setCurrentInsurance] = useState<CurrentInsurance | null>(null)
  const [history, setHistory] = useState<InsuranceHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState<'add' | 'update'>('add')

  useEffect(() => {
    fetchInsurance()
  }, [])

  const fetchInsurance = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/guest/profile/insurance')
      const data = await response.json()

      if (response.ok) {
        setCurrentInsurance(data.current)
        setHistory(data.history)
      }
    } catch (error) {
      console.error('Error fetching insurance:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenForm = (mode: 'add' | 'update') => {
    setFormMode(mode)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    fetchInsurance()
  }

  const getCoverageLabel = (coverageType: string | null, customCoverage: string | null) => {
    if (!coverageType) return 'N/A'
    
    const labels: Record<string, string> = {
      'state_minimum': 'State Minimum (25/50/25)',
      'basic': 'Basic (50/100/50)',
      'standard': 'Standard (100/300/100)',
      'premium': 'Premium (250/500/100)',
      'custom': customCoverage || 'Custom'
    }
    
    return labels[coverageType] || coverageType
  }

  const hasInsurance = currentInsurance?.provider && currentInsurance?.policyNumber
  const isExpired = currentInsurance?.status === 'EXPIRED'

  const getDepositSavings = () => {
    if (currentInsurance?.verified && !isExpired) {
      return '50%'
    }
    return '0%'
  }

  if (loading) {
    return (
      <div>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Personal Insurance</h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
          Add your personal auto insurance to reduce your rental deposit by 50%
        </p>
      </div>

      {/* Benefits Banner */}
      <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg shadow-md">
        <div className="flex items-start gap-2.5">
          <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1.5">
              Save on Deposits with Your Insurance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
              <div className="flex items-center gap-1.5">
                <IoCheckmarkCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                <span className="text-green-800 dark:text-green-300">50% lower deposit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IoCheckmarkCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                <span className="text-green-800 dark:text-green-300">Faster checkout</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IoCheckmarkCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                <span className="text-green-800 dark:text-green-300">Better protection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IoCheckmarkCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                <span className="text-green-800 dark:text-green-300">Optional but recommended</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Insurance Status */}
      {hasInsurance ? (
        <div className={`border rounded-lg p-4 mb-4 ${
          currentInsurance.verified && !isExpired
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : isExpired
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
        }`}>
          
          {/* Status Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-2.5">
              <div className={`p-2 rounded-lg ${
                currentInsurance.verified && !isExpired
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : isExpired
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-yellow-100 dark:bg-yellow-900/30'
              }`}>
                <IoShieldCheckmarkOutline className={`w-5 h-5 ${
                  currentInsurance.verified && !isExpired
                    ? 'text-green-600 dark:text-green-400'
                    : isExpired
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">
                  Insurance on File
                </h3>
                {currentInsurance.verified && !isExpired ? (
                  <p className="text-xs text-green-800 dark:text-green-300">
                    Verified - You're saving {getDepositSavings()} on deposits
                  </p>
                ) : isExpired ? (
                  <p className="text-xs text-red-800 dark:text-red-300">
                    Expired - Please update your insurance
                  </p>
                ) : (
                  <p className="text-xs text-yellow-800 dark:text-yellow-300">
                    Under Review - We'll verify within 24-48 hours
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {currentInsurance.verified && !isExpired ? (
                <IoCheckmarkCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : isExpired ? (
                <IoCloseCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              ) : (
                <IoTimeOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              )}
            </div>
          </div>

          {/* Expiry Warning (30 days) */}
          {currentInsurance.status === 'ACTIVE' && 
           currentInsurance.daysUntilExpiry !== null && 
           currentInsurance.daysUntilExpiry <= 30 && (
            <div className="mb-3 p-2.5 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg">
              <div className="flex items-start gap-2">
                <IoAlertCircleOutline className="w-4 h-4 text-yellow-700 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                    Expiring in {currentInsurance.daysUntilExpiry} {currentInsurance.daysUntilExpiry === 1 ? 'day' : 'days'}
                  </p>
                  <p className="text-[10px] text-yellow-700 dark:text-yellow-300 mt-0.5">
                    Update soon to keep your deposit benefits
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Insurance Details */}
          <div className="space-y-2 mb-3">
            <div className="flex justify-between items-center py-1.5 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-600 dark:text-gray-400">Provider</span>
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                {currentInsurance.provider}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-600 dark:text-gray-400">Policy Number</span>
              <span className="text-xs font-medium text-gray-900 dark:text-white font-mono">
                {currentInsurance.policyNumber}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-600 dark:text-gray-400">Coverage Type</span>
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                {getCoverageLabel(currentInsurance.coverageType, currentInsurance.customCoverage)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-600 dark:text-gray-400">Rideshare Coverage</span>
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                {currentInsurance.hasRideshare ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-600 dark:text-gray-400">Expiration Date</span>
              <span className={`text-xs font-medium ${
                isExpired 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {currentInsurance.expiryDate 
                  ? new Date(currentInsurance.expiryDate).toLocaleDateString()
                  : 'Not set'}
              </span>
            </div>
            {currentInsurance.verifiedAt && (
              <div className="flex justify-between items-center py-1.5">
                <span className="text-xs text-gray-600 dark:text-gray-400">Verified On</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  {new Date(currentInsurance.verifiedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Insurance Card Images */}
          {(currentInsurance.cardFrontUrl || currentInsurance.cardBackUrl) && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Insurance Card
              </p>
              <div className="grid grid-cols-2 gap-2">
                {currentInsurance.cardFrontUrl && (
                  <div className="relative w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img
                      src={currentInsurance.cardFrontUrl}
                      alt="Insurance Card Front"
                      className="w-full h-full object-contain"
                    />
                    <p className="absolute bottom-0 left-0 right-0 text-center text-[10px] text-gray-600 dark:text-gray-400 bg-gray-100/90 dark:bg-gray-800/90 py-0.5">
                      Front
                    </p>
                  </div>
                )}
                {currentInsurance.cardBackUrl && (
                  <div className="relative w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img
                      src={currentInsurance.cardBackUrl}
                      alt="Insurance Card Back"
                      className="w-full h-full object-contain"
                    />
                    <p className="absolute bottom-0 left-0 right-0 text-center text-[10px] text-gray-600 dark:text-gray-400 bg-gray-100/90 dark:bg-gray-800/90 py-0.5">
                      Back
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => handleOpenForm('update')}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 min-h-[36px] text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <IoPencilOutline className="w-3.5 h-3.5" />
            <span>Update Insurance</span>
          </button>

        </div>
      ) : (
        /* No Insurance - Add Insurance Card */
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center mb-4">
          <div className="max-w-md mx-auto">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <IoShieldCheckmarkOutline className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5">
              No Insurance Added
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              Add your personal auto insurance to reduce your rental deposit by 50%. This is optional but highly recommended.
            </p>
            <button
              onClick={() => handleOpenForm('add')}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[36px] text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              <IoAddOutline className="w-4 h-4" />
              <span>Add Insurance</span>
            </button>
          </div>
        </div>
      )}

      {/* Information Section */}
      <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-300 dark:border-green-700 shadow-md">
        <div className="flex items-start gap-2.5">
          <IoInformationCircleOutline className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-green-900 dark:text-green-100 mb-1.5">
              How It Works
            </h4>
            <ul className="space-y-1 text-[10px] text-green-800 dark:text-green-300">
              <li>• Upload photos of your current auto insurance card (front & back)</li>
              <li>• We verify your insurance is active and valid</li>
              <li>• Once verified, your deposit is reduced by 50% on all bookings</li>
              <li>• Your insurance must cover the rental period</li>
              <li>• Update your insurance before it expires to keep the discount</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-md">
        <div className="flex items-start gap-2.5">
          <IoCheckmarkCircle className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1.5">
              Insurance Requirements
            </h4>
            <ul className="space-y-0.5 text-[10px] text-gray-600 dark:text-gray-400">
              <li>• Valid personal auto insurance policy</li>
              <li>• Coverage must include liability and collision</li>
              <li>• Policy must be in your name</li>
              <li>• Must not be expired</li>
              <li>• Coverage must extend to rental vehicles</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Insurance History */}
      {history.length > 0 && (
        <div className="mt-6">
          <InsuranceHistoryLog history={history} loading={false} />
        </div>
      )}

      {/* Insurance Form Modal */}
      <InsuranceForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleFormSuccess}
        mode={formMode}
        existingInsurance={hasInsurance ? {
          provider: currentInsurance.provider || '',
          policyNumber: currentInsurance.policyNumber || '',
          expiryDate: currentInsurance.expiryDate || '',
          hasRideshare: currentInsurance.hasRideshare || false,
          coverageType: currentInsurance.coverageType || '',
          customCoverage: currentInsurance.customCoverage,
          notes: currentInsurance.notes,
          cardFrontUrl: currentInsurance.cardFrontUrl,
          cardBackUrl: currentInsurance.cardBackUrl
        } : null}
      />

    </div>
  )
}