// app/host/profile/components/TierSelectionSheet.tsx
'use client'

import { useState } from 'react'
import {
  IoCloseOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircle,
  IoCloudUploadOutline,
  IoDocumentTextOutline,
  IoTimeOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

interface TierSelectionSheetProps {
  isOpen: boolean
  onClose: () => void
  currentTier: 'BASIC' | 'STANDARD' | 'PREMIUM' | null
  profile: any
  onTierSelected: (tier: 'BASIC' | 'STANDARD' | 'PREMIUM') => Promise<void>
  onRefresh: () => void
}

export default function TierSelectionSheet({
  isOpen,
  onClose,
  currentTier,
  profile,
  onTierSelected,
  onRefresh
}: TierSelectionSheetProps) {
  const [uploadingP2P, setUploadingP2P] = useState(false)
  const [uploadingCommercial, setUploadingCommercial] = useState(false)
  const [p2pStatus, setP2pStatus] = useState<'not_uploaded' | 'pending' | 'approved'>(
    profile?.p2pInsuranceStatus || 'not_uploaded'
  )
  const [commercialStatus, setCommercialStatus] = useState<'not_uploaded' | 'pending' | 'approved'>(
    profile?.commercialInsuranceStatus || 'not_uploaded'
  )

  if (!isOpen) return null

  const handleFileUpload = async (file: File, type: 'p2p' | 'commercial') => {
    const setUploading = type === 'p2p' ? setUploadingP2P : setUploadingCommercial
    const setStatus = type === 'p2p' ? setP2pStatus : setCommercialStatus

    try {
      setUploading(true)

      // First, upload the file
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type === 'p2p' ? 'p2p_insurance' : 'commercial_insurance')

      const uploadResponse = await fetch('/api/host/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error('Upload failed')
      }

      const uploadData = await uploadResponse.json()

      // Then, submit the insurance document for review
      const insuranceResponse = await fetch('/api/host/insurance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: type === 'p2p' ? 'P2P' : 'COMMERCIAL',
          documentUrl: uploadData.url,
          status: 'PENDING'
        })
      })

      if (!insuranceResponse.ok) {
        throw new Error('Insurance submission failed')
      }

      // Update status to pending
      setStatus('pending')
      onRefresh()
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleSelectTier = async (tier: 'BASIC' | 'STANDARD' | 'PREMIUM') => {
    // Validate insurance requirements
    if (tier === 'STANDARD' && p2pStatus !== 'approved') {
      alert('Please upload and get approval for P2P insurance before selecting STANDARD tier')
      return
    }

    if (tier === 'PREMIUM' && commercialStatus !== 'approved') {
      alert('Please upload and get approval for Commercial insurance before selecting PREMIUM tier')
      return
    }

    await onTierSelected(tier)
    onClose()
  }

  const tierCards = [
    {
      tier: 'BASIC' as const,
      name: 'Basic Protection',
      percentage: 40,
      description: 'Platform insurance coverage',
      color: 'blue',
      features: [
        'Platform-provided insurance',
        'No upload required',
        'Basic coverage protection',
        '40% of rental earnings'
      ],
      coverage: {
        liability: 'Up to $1M liability',
        collision: '$2,500 deductible',
        comprehensive: '$2,500 deductible'
      },
      requirements: 'No insurance upload required - platform provides coverage'
    },
    {
      tier: 'STANDARD' as const,
      name: 'Standard Protection',
      percentage: 75,
      description: 'Personal P2P insurance',
      color: 'purple',
      features: [
        'Your P2P insurance policy',
        'Upload required',
        'Enhanced coverage',
        '75% of rental earnings'
      ],
      coverage: {
        liability: 'Per your policy (typically $1M+)',
        collision: 'Per your policy terms',
        comprehensive: 'Per your policy terms'
      },
      requirements: 'Valid P2P insurance policy required (e.g., Turo, Getaround coverage)',
      uploadSection: true,
      uploadType: 'p2p' as const
    },
    {
      tier: 'PREMIUM' as const,
      name: 'Premium Protection',
      percentage: 90,
      description: 'Commercial auto insurance',
      color: 'green',
      features: [
        'Commercial insurance policy',
        'Upload required',
        'Maximum coverage',
        '90% of rental earnings'
      ],
      coverage: {
        liability: 'Per your policy (typically $2M+)',
        collision: 'Per your policy terms',
        comprehensive: 'Per your policy terms'
      },
      requirements: 'Valid commercial auto insurance policy required',
      uploadSection: true,
      uploadType: 'commercial' as const
    }
  ]

  const getStatusBadge = (status: 'not_uploaded' | 'pending' | 'approved') => {
    switch (status) {
      case 'approved':
        return (
          <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm">
            <IoCheckmarkCircle className="w-5 h-5" />
            <span className="font-medium">Approved</span>
          </div>
        )
      case 'pending':
        return (
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-sm">
            <IoTimeOutline className="w-5 h-5" />
            <span className="font-medium">Under Review</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up md:inset-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:max-w-5xl md:w-full md:max-h-[85vh]">

        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <IoShieldCheckmarkOutline className="w-7 h-7 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Select Insurance Tier
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose your earnings tier based on your insurance coverage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <IoCloseOutline className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Current Tier Notice */}
          {currentTier && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    You are currently on the <strong>{currentTier}</strong> tier earning{' '}
                    <strong>
                      {currentTier === 'BASIC' ? '40%' : currentTier === 'STANDARD' ? '75%' : '90%'}
                    </strong>{' '}
                    of rental fees
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tier Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tierCards.map((card) => {
              const isCurrentTier = currentTier === card.tier
              const status = card.uploadType === 'p2p' ? p2pStatus : card.uploadType === 'commercial' ? commercialStatus : 'approved'
              const canSelect = card.tier === 'BASIC' || status === 'approved'

              return (
                <div
                  key={card.tier}
                  className={`
                    border-2 rounded-lg p-5 transition-all
                    ${isCurrentTier
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                        {card.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {card.description}
                      </p>
                    </div>
                    {isCurrentTier && (
                      <IoCheckmarkCircle className="w-6 h-6 text-purple-600 flex-shrink-0 ml-2" />
                    )}
                  </div>

                  {/* Percentage Badge */}
                  <div className={`
                    inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold mb-4
                    ${card.tier === 'BASIC' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : ''}
                    ${card.tier === 'STANDARD' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : ''}
                    ${card.tier === 'PREMIUM' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : ''}
                  `}>
                    {card.percentage}% Earnings
                  </div>

                  {/* Features */}
                  <div className="space-y-2.5 mb-4">
                    {card.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Coverage Details */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mb-4">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Coverage Details:
                    </p>
                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <p>• Liability: {card.coverage.liability}</p>
                      <p>• Collision: {card.coverage.collision}</p>
                      <p>• Comprehensive: {card.coverage.comprehensive}</p>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                      {card.requirements}
                    </p>
                  </div>

                  {/* Upload Section */}
                  {card.uploadSection && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <IoDocumentTextOutline className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Insurance Document
                          </span>
                        </div>
                        {getStatusBadge(status)}
                      </div>

                      {status === 'not_uploaded' && (
                        <label className="block">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file && card.uploadType) {
                                handleFileUpload(file, card.uploadType)
                              }
                            }}
                            disabled={card.uploadType === 'p2p' ? uploadingP2P : uploadingCommercial}
                            className="hidden"
                          />
                          <div className={`
                            flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors
                            ${(card.uploadType === 'p2p' ? uploadingP2P : uploadingCommercial)
                              ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }
                          `}>
                            <IoCloudUploadOutline className="w-4 h-4" />
                            {(card.uploadType === 'p2p' ? uploadingP2P : uploadingCommercial)
                              ? 'Uploading...'
                              : 'Upload Document'
                            }
                          </div>
                        </label>
                      )}

                      {status === 'pending' && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                          Your document is under review by our fleet team. You'll be notified once approved.
                        </p>
                      )}

                      {status === 'approved' && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                          Your insurance has been verified and approved.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Select Button */}
                  <button
                    onClick={() => handleSelectTier(card.tier)}
                    disabled={!canSelect || isCurrentTier}
                    className={`
                      w-full py-2.5 rounded-lg font-medium text-sm transition-colors
                      ${isCurrentTier
                        ? 'bg-purple-600 text-white cursor-default'
                        : canSelect
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      }
                    `}
                  >
                    {isCurrentTier
                      ? 'Current Tier'
                      : canSelect
                        ? `Select ${card.tier} (${card.percentage}%)`
                        : 'Insurance Required'
                    }
                  </button>
                </div>
              )
            })}
          </div>

          {/* Legal Disclaimer */}
          <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <IoInformationCircleOutline className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
                <p className="font-semibold text-gray-700 dark:text-gray-300">
                  Insurance Disclaimer:
                </p>
                <p>
                  BASIC tier uses platform-provided insurance coverage. STANDARD tier requires a valid personal peer-to-peer (P2P)
                  insurance policy from providers like Turo or Getaround. PREMIUM tier requires a valid commercial auto insurance policy.
                </p>
                <p>
                  All uploaded insurance documents must be current, valid, and explicitly cover peer-to-peer car sharing or commercial
                  rental activities. Documents will be reviewed by our fleet team within 24-48 hours. You cannot switch to higher tiers
                  until your insurance is approved.
                </p>
                <p>
                  Platform insurance (BASIC tier) provides baseline coverage but results in lower earnings. Higher tiers require your
                  own insurance but offer significantly higher earnings percentages.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Slide-up animation */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @media (min-width: 768px) {
          .animate-slide-up {
            animation: none;
          }
        }
      `}</style>
    </>
  )
}
