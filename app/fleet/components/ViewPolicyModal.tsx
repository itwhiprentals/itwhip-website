// app/fleet/components/ViewPolicyModal.tsx
'use client'

import { useState } from 'react'
import { 
  IoCloseCircleOutline,
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoCalendarOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5'

interface ViewPolicyModalProps {
  isOpen: boolean
  onClose: () => void
  provider: {
    id: string
    name: string
    type: string
    coverageNotes?: string
    contractStart?: string
    contractEnd?: string
    revenueShare?: number
    isActive: boolean
  }
}

export default function ViewPolicyModal({
  isOpen,
  onClose,
  provider
}: ViewPolicyModalProps) {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-3xl w-full max-h-[90vh] bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IoShieldCheckmarkOutline className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {provider.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {provider.type === 'EMBEDDED' ? 'Embedded Insurance' : 'Traditional Insurance'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <IoCloseCircleOutline className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
              provider.isActive
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
            }`}>
              {provider.isActive ? (
                <>
                  <IoCheckmarkCircleOutline className="w-4 h-4" />
                  Active
                </>
              ) : (
                'Inactive'
              )}
            </span>
          </div>

          {/* Contract Details */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <IoDocumentTextOutline className="w-5 h-5" />
              Contract Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Contract Start</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {provider.contractStart 
                    ? new Date(provider.contractStart).toLocaleDateString()
                    : 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Contract End</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {provider.contractEnd 
                    ? new Date(provider.contractEnd).toLocaleDateString()
                    : 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Revenue Share</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {provider.revenueShare 
                    ? `${(provider.revenueShare * 100).toFixed(0)}% to Platform`
                    : 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Provider Type</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {provider.type.toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Coverage Details */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <IoShieldCheckmarkOutline className="w-5 h-5" />
              Coverage Details
            </h3>
            
            {provider.coverageNotes ? (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-300">
                    {provider.coverageNotes}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  No coverage details have been added yet. Admin can add coverage information when editing this provider.
                </p>
              </div>
            )}
          </div>

          {/* Coverage Template Example (if no notes exist) */}
          {!provider.coverageNotes && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Coverage Details Template
              </h4>
              <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1 font-mono">
                <p>Liability: $250k/$500k/$100k</p>
                <p>Collision: ACV, $500 deductible</p>
                <p>Comprehensive: ACV, $500 deductible</p>
                <p>Territory: United States</p>
                <p>Excludes: Racing, delivery services</p>
                <p>Includes: 24/7 roadside, $50/day rental reimbursement</p>
              </div>
            </div>
          )}

          {/* Important Notes */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Important Information
            </h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>This is platform-assigned insurance for trip coverage only</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Coverage applies only to bookings made through ItWhip</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Hosts should maintain their own P2P insurance for non-platform trips</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Contact admin to update or modify coverage details</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}