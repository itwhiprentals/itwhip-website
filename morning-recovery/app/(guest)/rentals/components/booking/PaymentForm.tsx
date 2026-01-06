// app/(guest)/rentals/components/booking/PaymentForm.tsx
'use client'

import { useState } from 'react'
import { 
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoInformationCircleOutline,
  IoArrowBackOutline
} from 'react-icons/io5'

interface PaymentFormProps {
  amount: number
  onComplete: (paymentData: {
    paymentMethodId: string
    guestEmail: string
    guestPhone: string
    guestName: string
  }) => void
  onBack: () => void
  carSource?: string // To know if it's P2P or Amadeus
}

export default function PaymentForm({ 
  amount, 
  onComplete,
  onBack,
  carSource = 'p2p'
}: PaymentFormProps) {
  const [guestDetails, setGuestDetails] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const isP2P = carSource === 'p2p'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!acceptTerms) {
      setMessage('Please accept the terms and conditions')
      return
    }

    if (!guestDetails.name || !guestDetails.email || !guestDetails.phone) {
      setMessage('Please fill in all required fields')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(guestDetails.email)) {
      setMessage('Please enter a valid email address')
      return
    }

    // Phone validation (basic)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    if (!phoneRegex.test(guestDetails.phone) || guestDetails.phone.length < 10) {
      setMessage('Please enter a valid phone number')
      return
    }

    setIsProcessing(true)
    setMessage(null)

    // Simulate processing delay
    setTimeout(() => {
      // For P2P: No payment now, just pass guest info
      // For Amadeus: Would process payment immediately
      const mockPaymentId = isP2P ? null : `payment_${Date.now()}`
      
      onComplete({
        paymentMethodId: mockPaymentId || 'pending',
        guestEmail: guestDetails.email,
        guestPhone: guestDetails.phone,
        guestName: guestDetails.name
      })
    }, 1500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* P2P Notice */}
      {isP2P && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start">
            <IoInformationCircleOutline className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-300 mb-1">
                Booking Review Process
              </p>
              <p className="text-amber-700 dark:text-amber-400">
                Your booking will be reviewed within 2-4 hours. Payment will only be processed after approval.
                You'll receive an email with your booking status.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Guest Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Contact Information
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          We'll use this information to send your booking confirmation and updates.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={guestDetails.name}
              onChange={(e) => setGuestDetails(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                focus:ring-2 focus:ring-amber-500 focus:border-transparent
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="John Doe"
              autoComplete="name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={guestDetails.email}
                onChange={(e) => setGuestDetails(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                  focus:ring-2 focus:ring-amber-500 focus:border-transparent
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="john@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={guestDetails.phone}
                onChange={(e) => setGuestDetails(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                  focus:ring-2 focus:ring-amber-500 focus:border-transparent
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="+1 (555) 123-4567"
                autoComplete="tel"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Booking Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
          Booking Summary
        </h4>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Rental Total
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              ${amount?.toFixed(2) || '0.00'}
            </span>
          </div>
          
          {isP2P && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Payment Status
                </span>
                <span className="text-sm font-medium text-amber-600">
                  Pending Review
                </span>
              </div>
              <div className="pt-2 mt-2 border-t dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  • Documents will be reviewed within 2-4 hours<br/>
                  • Payment processed only after approval<br/>
                  • Host notified after confirmation
                </p>
              </div>
            </>
          )}
          
          {!isP2P && (
            <div className="pt-2 mt-2 border-t dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                • Instant confirmation<br/>
                • Receive booking details via email<br/>
                • Present confirmation at pickup
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="space-y-3">
        <label className="flex items-start space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 mt-0.5"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            I agree to the{' '}
            <a href="/terms" target="_blank" className="text-amber-600 hover:underline">
              rental terms
            </a>
            ,{' '}
            <a href="/privacy" target="_blank" className="text-amber-600 hover:underline">
              privacy policy
            </a>
            , and understand that{' '}
            {isP2P 
              ? 'my booking requires manual review before confirmation'
              : 'my booking will be confirmed immediately'
            }.
          </span>
        </label>
        
        {isP2P && (
          <div className="text-xs text-gray-500 dark:text-gray-400 ml-6">
            By submitting, you acknowledge that payment will be processed after admin approval.
          </div>
        )}
      </div>

      {/* Error Message */}
      {message && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-300 flex items-center">
            <IoAlertCircleOutline className="w-4 h-4 mr-2 flex-shrink-0" />
            {message}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
            hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
        >
          <IoArrowBackOutline className="w-5 h-5 mr-2" />
          Back
        </button>

        <button
          type="submit"
          disabled={isProcessing || !acceptTerms || !guestDetails.name || !guestDetails.email || !guestDetails.phone}
          className="px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg
            hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <IoCheckmarkCircleOutline className="w-5 h-5 mr-2" />
              {isP2P ? 'Submit for Review' : 'Confirm Booking'}
            </>
          )}
        </button>
      </div>

      {/* Create Account Suggestion */}
      <div className="text-center pt-4 border-t dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Want to track your bookings easily?{' '}
          <a href="/sign-up" className="text-amber-600 hover:underline">
            Create an account
          </a>
          {' '}for faster bookings and exclusive benefits.
        </p>
      </div>
    </form>
  )
}