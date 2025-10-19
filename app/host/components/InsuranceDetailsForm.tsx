// app/host/components/InsuranceDetailsForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoCalendarOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoCloseOutline,
  IoTrendingUpOutline
} from 'react-icons/io5'

interface InsuranceDetailsFormProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'submit' | 'update' | 'reactivate'
  currentData?: {
    provider?: string
    policyNumber?: string
    expirationDate?: string
  }
  onSuccess?: () => void
}

export default function InsuranceDetailsForm({
  isOpen,
  onClose,
  mode = 'submit',
  currentData,
  onSuccess
}: InsuranceDetailsFormProps) {
  // Set default date to 1 year from now
  const getDefaultExpirationDate = () => {
    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
    return oneYearFromNow.toISOString().split('T')[0]
  }

  const [insuranceType, setInsuranceType] = useState<'P2P' | 'COMMERCIAL'>('P2P')
  const [provider, setProvider] = useState(currentData?.provider || '')
  const [policyNumber, setPolicyNumber] = useState(currentData?.policyNumber || '')
  const [expirationDate, setExpirationDate] = useState(currentData?.expirationDate || getDefaultExpirationDate())
  const [submitting, setSubmitting] = useState(false)
  const [showSkipModal, setShowSkipModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Update form when currentData changes
  useEffect(() => {
    if (currentData) {
      setProvider(currentData.provider || '')
      setPolicyNumber(currentData.policyNumber || '')
      setExpirationDate(currentData.expirationDate || getDefaultExpirationDate())
    } else {
      // Reset to defaults when opening fresh
      setExpirationDate(getDefaultExpirationDate())
      setInsuranceType('P2P')
    }
  }, [currentData, isOpen])

  // ESC key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !showSkipModal) {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, showSkipModal, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      // Validate expiration date
      const expiry = new Date(expirationDate)
      if (expiry <= new Date()) {
        throw new Error('Expiration date must be in the future')
      }

      const endpoint = '/api/host/insurance'
      const method = mode === 'update' ? 'PATCH' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          provider,
          policyNumber,
          expirationDate,
          insuranceType // Add the explicit type
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit insurance')
      }

      setSuccess(true)
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 2000)
      }

    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSkip = () => {
    setShowSkipModal(true)
  }

  const confirmSkip = () => {
    setShowSkipModal(false)
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !showSkipModal) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-50 transition-opacity duration-200"
        onClick={handleBackdropClick}
      >
        {/* Modal Container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-0 md:p-4">
            {/* Modal Content */}
            <div 
              className="relative w-full md:max-w-2xl bg-white dark:bg-gray-900 
                         md:rounded-xl rounded-t-3xl md:rounded-b-xl
                         shadow-xl
                         md:my-8 mt-auto
                         max-h-[90vh] md:max-h-[85vh]
                         flex flex-col
                         transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Success State */}
              {success ? (
                <div className="p-6">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <IoCheckmarkCircleOutline className="w-8 h-8 text-green-600 dark:text-green-400" />
                      <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                        {insuranceType} Insurance Submitted
                      </h3>
                    </div>
                    <p className="text-green-800 dark:text-green-200">
                      Your {insuranceType === 'COMMERCIAL' ? 'commercial' : 'P2P'} insurance details have been submitted for review. 
                      Earnings remain at 40% until approved. Once approved, you'll earn {insuranceType === 'COMMERCIAL' ? '90%' : '75%'} per booking!
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <IoShieldCheckmarkOutline className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                      <div>
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                          {mode === 'reactivate' ? 'Reactivate Insurance' : 
                           mode === 'update' ? 'Update Insurance' : 'Add Insurance Details'}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                          Choose your insurance type and provide details
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      aria-label="Close"
                    >
                      <IoCloseOutline className="w-5 h-5 md:w-6 md:h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>

                  {/* Scrollable Content */}
                  <div className="overflow-y-auto flex-1 p-4 md:p-6">
                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                      
                      {/* Insurance Type Selector */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Insurance Type *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* P2P Option */}
                          <button
                            type="button"
                            onClick={() => setInsuranceType('P2P')}
                            className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                              insuranceType === 'P2P'
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  insuranceType === 'P2P'
                                    ? 'border-green-500 bg-green-500'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                  {insuranceType === 'P2P' && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                  )}
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  P2P Insurance
                                </span>
                              </div>
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded">
                                75%
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Standard Tier - Earn 75% per booking
                            </p>
                          </button>

                          {/* Commercial Option */}
                          <button
                            type="button"
                            onClick={() => setInsuranceType('COMMERCIAL')}
                            className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                              insuranceType === 'COMMERCIAL'
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  insuranceType === 'COMMERCIAL'
                                    ? 'border-purple-500 bg-purple-500'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                  {insuranceType === 'COMMERCIAL' && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                  )}
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  Commercial
                                </span>
                              </div>
                              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold rounded">
                                90%
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Premium Tier - Earn 90% per booking
                            </p>
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {insuranceType === 'COMMERCIAL' 
                            ? '🎉 Maximum earnings tier - commercial insurance required'
                            : '✓ Most common option for peer-to-peer car sharing'}
                        </p>
                      </div>

                      {/* Provider Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Insurance Provider *
                        </label>
                        <div className="relative">
                          <IoShieldCheckmarkOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                          <input
                            type="text"
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            placeholder={insuranceType === 'COMMERCIAL' ? 'e.g., Progressive Commercial, State Farm Business' : 'e.g., State Farm, Geico, Progressive'}
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 transition-colors"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Name of your {insuranceType === 'COMMERCIAL' ? 'commercial' : 'P2P'} insurance company
                        </p>
                      </div>

                      {/* Policy Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Policy Number *
                        </label>
                        <div className="relative">
                          <IoDocumentTextOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                          <input
                            type="text"
                            value={policyNumber}
                            onChange={(e) => setPolicyNumber(e.target.value)}
                            placeholder="e.g., SF-123456789"
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 transition-colors"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Your insurance policy number
                        </p>
                      </div>

                      {/* Expiration Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Expiration Date *
                        </label>
                        <div className="relative">
                          <IoCalendarOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                          <input
                            type="date"
                            value={expirationDate}
                            onChange={(e) => setExpirationDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white text-base transition-colors"
                            style={{ colorScheme: 'light dark' }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          When your policy expires
                        </p>
                      </div>

                      {/* Error Message */}
                      {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 md:p-4">
                          <div className="flex items-center gap-2">
                            <IoCloseCircleOutline className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                          </div>
                        </div>
                      )}

                      {/* Earnings Breakdown */}
                      <div className={`rounded-lg border-2 p-4 ${
                        insuranceType === 'COMMERCIAL'
                          ? 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                      }`}>
                        <div className="flex items-start gap-3">
                          <IoTrendingUpOutline className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            insuranceType === 'COMMERCIAL' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400'
                          }`} />
                          <div>
                            <h4 className={`font-medium mb-2 text-sm md:text-base ${
                              insuranceType === 'COMMERCIAL' 
                                ? 'text-purple-900 dark:text-purple-100' 
                                : 'text-green-900 dark:text-green-100'
                            }`}>
                              {insuranceType === 'COMMERCIAL' ? 'Premium Tier Earnings' : 'Standard Tier Earnings'}
                            </h4>
                            <ul className={`text-xs md:text-sm space-y-1 ${
                              insuranceType === 'COMMERCIAL'
                                ? 'text-purple-800 dark:text-purple-200'
                                : 'text-green-800 dark:text-green-200'
                            }`}>
                              <li>• After approval: <strong>{insuranceType === 'COMMERCIAL' ? '90%' : '75%'}</strong> earnings per booking</li>
                              <li>• Platform fee: <strong>{insuranceType === 'COMMERCIAL' ? '10%' : '25%'}</strong></li>
                              <li>• While pending: 40% earnings (BASIC tier)</li>
                              <li>• Review time: 24-48 hours</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-200 dark:border-gray-800 p-4 md:p-6 flex-shrink-0">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting || !provider || !policyNumber || !expirationDate}
                        className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                      >
                        {submitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <IoCheckmarkCircleOutline className="w-5 h-5" />
                            Submit for Approval
                          </>
                        )}
                      </button>

                      {mode === 'submit' && (
                        <button
                          type="button"
                          onClick={handleSkip}
                          className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                        >
                          Skip for Now
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Skip Modal remains the same */}
      {showSkipModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <IoWarningOutline className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Skip Insurance Details?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Platform will charge <strong>60% fee</strong> instead of 25% until you submit and verify your insurance.
                </p>
                
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-3">
                    Impact on $1,000 booking:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-sm text-red-800 dark:text-red-200 font-medium min-w-[140px]">
                        With insurance:
                      </span>
                      <span className="text-sm text-red-800 dark:text-red-200">
                        25% fee → <strong>You earn $750</strong>
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-sm text-red-800 dark:text-red-200 font-medium min-w-[140px]">
                        Without insurance:
                      </span>
                      <span className="text-sm text-red-800 dark:text-red-200">
                        60% fee → <strong>You earn $400</strong>
                      </span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-red-200 dark:border-red-800">
                      <span className="text-sm font-bold text-red-900 dark:text-red-100">
                        Lost earnings: $350
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                  You can add insurance details anytime from your profile.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => setShowSkipModal(false)}
                className="w-full sm:flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Add Insurance Now
              </button>
              <button
                onClick={confirmSkip}
                className="w-full sm:w-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                Skip (60% Fee)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}