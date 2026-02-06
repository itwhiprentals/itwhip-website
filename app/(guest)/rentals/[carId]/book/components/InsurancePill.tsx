// app/(guest)/rentals/[carId]/book/components/InsurancePill.tsx
// Context-aware insurance prompt
// - Logged-in guests: Navigate to /profile insurance tab
// - Visitors: Show modal to finish booking first

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  IoShieldOutline,
  IoCheckmarkCircle,
  IoArrowForwardOutline,
  IoCloseOutline,
  IoDocumentTextOutline,
  IoSparklesOutline
} from 'react-icons/io5'

interface InsurancePillProps {
  isLoggedIn: boolean
  hasInsurance: boolean
  insurancePhotoUrl?: string | null
  onInsuranceUploaded?: (url: string) => void
}

export function InsurancePill({
  isLoggedIn,
  hasInsurance,
  insurancePhotoUrl,
  onInsuranceUploaded
}: InsurancePillProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

  const handleClick = () => {
    if (isLoggedIn) {
      // Navigate to profile insurance tab
      router.push('/profile?tab=insurance')
    } else {
      // Show modal for visitors
      setShowModal(true)
    }
  }

  // Already has insurance
  if (hasInsurance || insurancePhotoUrl) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <IoShieldOutline className="text-green-600" />
        <span className="text-sm text-green-800 dark:text-green-300 font-medium">
          Insurance on file
        </span>
        <IoCheckmarkCircle className="text-green-600 ml-auto" />
      </div>
    )
  }

  return (
    <>
      {/* Insurance pill */}
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left"
      >
        <IoShieldOutline className="text-xl text-blue-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
            Upload Your Insurance
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            {isLoggedIn
              ? 'Add your insurance in profile for faster checkout'
              : 'Save 50% on coverage by uploading your own insurance'}
          </p>
        </div>
        <IoArrowForwardOutline className="text-blue-600" />
      </button>

      {/* Modal for visitors */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Upload Insurance After Booking
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <IoCloseOutline className="text-xl text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <IoDocumentTextOutline className="text-3xl text-orange-500" />
                </div>
              </div>

              <h4 className="text-center text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Complete Your Booking First
              </h4>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                Once you complete your booking, you'll be able to upload your insurance in your account dashboard.
              </p>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <IoSparklesOutline className="text-xl text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-300 text-sm">
                      Save 50% on coverage!
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                      Upload your own insurance after booking to get our reduced coverage rate.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p className="flex items-center gap-2">
                  <IoCheckmarkCircle className="text-green-500" />
                  Your account will be created automatically
                </p>
                <p className="flex items-center gap-2">
                  <IoCheckmarkCircle className="text-green-500" />
                  Upload insurance anytime before your trip
                </p>
                <p className="flex items-center gap-2">
                  <IoCheckmarkCircle className="text-green-500" />
                  Adjust coverage level after upload
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
              >
                Got it, continue booking
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default InsurancePill
