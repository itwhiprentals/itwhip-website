// app/fleet/components/ViewPolicyModal.tsx
'use client'

import { 
  IoCloseOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircleOutline,
  IoInformationCircleOutline,
  IoWarningOutline
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

  // Parse coverage details from coverageNotes
  // Expected format: "Liability: $X, Collision: $Y, Deductible: $Z"
  const parseCoverageDetails = () => {
    if (!provider.coverageNotes) {
      return {
        liability: 'Not specified',
        collision: 'Not specified',
        comprehensive: 'Not specified',
        deductible: 'Not specified',
        covered: [],
        notCovered: []
      }
    }

    // Simple parsing - in production, this should be structured data
    const notes = provider.coverageNotes.toLowerCase()
    return {
      liability: notes.includes('liability') ? extractValue(notes, 'liability') : 'Contact support',
      collision: notes.includes('collision') ? extractValue(notes, 'collision') : 'Contact support',
      comprehensive: notes.includes('comprehensive') ? extractValue(notes, 'comprehensive') : 'Contact support',
      deductible: notes.includes('deductible') ? extractValue(notes, 'deductible') : 'Contact support',
      covered: ['Trip bookings through platform', 'Liability for bodily injury', 'Property damage', 'Collision damage'],
      notCovered: ['Personal use', 'Commercial delivery', 'Racing or competitions', 'Intentional damage']
    }
  }

  const extractValue = (text: string, key: string) => {
    const match = text.match(new RegExp(`${key}[:\\s]+([^,\n]+)`, 'i'))
    return match ? match[1].trim() : 'See details'
  }

  const coverage = parseCoverageDetails()

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-2xl w-full max-h-[90vh] bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <IoShieldCheckmarkOutline className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Coverage Details
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Platform trip insurance
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close"
            >
              <IoCloseOutline className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Status */}
          {provider.isActive && (
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-900 dark:text-green-200">
                Coverage Active
              </span>
            </div>
          )}

          {/* Coverage Amounts */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">
              Coverage Amounts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Liability Coverage</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {coverage.liability}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Collision Coverage</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {coverage.collision}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Comprehensive</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {coverage.comprehensive}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Deductible</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {coverage.deductible}
                </p>
              </div>
            </div>
          </div>

          {/* What's Covered */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">
              What's Covered
            </h3>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <ul className="space-y-2">
                {coverage.covered.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-green-900 dark:text-green-200">
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* What's NOT Covered */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">
              What's NOT Covered
            </h3>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <ul className="space-y-2">
                {coverage.notCovered.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-red-900 dark:text-red-200">
                    <IoWarningOutline className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm">
                  Important Information
                </h4>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1.5">
                  <li>• Coverage applies only to trips booked through the platform</li>
                  <li>• Guest selects coverage tier during booking</li>
                  <li>• Keep your personal auto insurance active for non-platform use</li>
                  <li>• Report any incidents within 24 hours to support@itwhip.com</li>
                  <li>• Claims are typically processed within 24-48 hours</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Coverage Notes (if detailed info exists) */}
          {provider.coverageNotes && (
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">
                Additional Coverage Details
              </h4>
              <div className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {provider.coverageNotes}
              </div>
            </div>
          )}

          {/* Contact Support */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Questions about coverage?
            </p>
            <a 
              href="mailto:support@itwhip.com"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Contact Support
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}