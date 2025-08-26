// app/(guest)/rentals/components/booking/PaymentForm.tsx
'use client'

import { useState } from 'react'
import { 
  IoCardOutline,
  IoLockClosedOutline,
  IoShieldCheckmarkOutline,
  IoInformationCircleOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoBusinessOutline,
  IoMailOutline,
  IoCallOutline,
  IoCashOutline,
  IoCarOutline
} from 'react-icons/io5'

interface PaymentFormProps {
  amount: number
  deposit: number
  bookingDetails: any
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
}

export default function PaymentForm({ 
  amount, 
  deposit, 
  bookingDetails,
  onSuccess,
  onError 
}: PaymentFormProps) {
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!acceptTerms) {
      setMessage('Please accept the terms and conditions')
      return
    }

    if (!billingDetails.name || !billingDetails.email || !billingDetails.phone) {
      setMessage('Please fill in all required fields')
      return
    }

    setIsProcessing(true)
    setMessage(null)

    // For now, just save the reservation without payment
    try {
      const response = await fetch('/api/rentals/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingDetails,
          renterName: billingDetails.name,
          renterEmail: billingDetails.email,
          renterPhone: billingDetails.phone,
          paymentMethod: 'pay_at_pickup',
          totalAmount: amount,
          depositAmount: deposit,
          status: 'reserved'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        // Use a mock payment ID for now
        onSuccess(`reservation_${data.bookingId || Date.now()}`)
      } else {
        throw new Error(data.error || 'Booking failed')
      }
    } catch (error: any) {
      setMessage(error.message || 'Failed to complete reservation')
      onError(error.message || 'Reservation failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pay at Pickup Notice */}
      <div className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
        <IoCashOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
        <span className="text-sm text-blue-800 dark:text-blue-300">
          No payment required now - Pay when you pick up the car
        </span>
      </div>

      {/* Driver Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <IoBusinessOutline className="w-5 h-5 mr-2" />
          Driver Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name (as on license) *
            </label>
            <input
              type="text"
              required
              value={billingDetails.name}
              onChange={(e) => setBillingDetails(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                focus:ring-2 focus:ring-amber-500 focus:border-transparent
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <IoMailOutline className="inline w-4 h-4 mr-1" />
              Email *
            </label>
            <input
              type="email"
              required
              value={billingDetails.email}
              onChange={(e) => setBillingDetails(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                focus:ring-2 focus:ring-amber-500 focus:border-transparent
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="john@example.com"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <IoCallOutline className="inline w-4 h-4 mr-1" />
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={billingDetails.phone}
              onChange={(e) => setBillingDetails(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                focus:ring-2 focus:ring-amber-500 focus:border-transparent
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>
      </div>

      {/* Payment Method Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <IoCardOutline className="w-5 h-5 mr-2" />
          Payment at Pickup
        </h3>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Accepted Payment Methods</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cash, Credit Card, or Debit Card accepted at pickup
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <IoCarOutline className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Required at Pickup</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Valid driver's license and proof of insurance
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IoShieldCheckmarkOutline className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Security Deposit</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ${deposit.toFixed(2)} deposit will be collected at pickup (cash or card hold)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Rental Total</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            ${amount.toFixed(2)}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400 flex items-center">
            Security Deposit
            <button type="button" className="ml-1">
              <IoInformationCircleOutline className="w-4 h-4 text-gray-400" />
            </button>
          </span>
          <span className="text-gray-700 dark:text-gray-300">
            ${deposit.toFixed(2)}
          </span>
        </div>
        
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900 dark:text-white">
              Total Due at Pickup
            </span>
            <span className="text-xl font-bold text-amber-600">
              ${(amount + deposit).toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            *Deposit will be returned after successful vehicle return
          </p>
        </div>

        <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-300 font-medium">
            ✓ Free cancellation up to 24 hours before pickup
          </p>
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
            <a href="/terms" className="text-amber-600 hover:underline">
              rental terms
            </a>
            ,{' '}
            <a href="/cancellation" className="text-amber-600 hover:underline">
              cancellation policy
            </a>
            , and understand payment will be collected at pickup
          </span>
        </label>
      </div>

      {/* Error Message */}
      {message && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-300 flex items-center">
            <IoAlertCircleOutline className="w-4 h-4 mr-2" />
            {message}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isProcessing || !acceptTerms || !billingDetails.name || !billingDetails.email || !billingDetails.phone}
        className="w-full py-3 px-4 bg-amber-600 text-white font-semibold rounded-lg
          hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 
          focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200 flex items-center justify-center"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </>
        ) : (
          <>
            <IoCheckmarkCircleOutline className="w-5 h-5 mr-2" />
            Confirm Reservation
          </>
        )}
      </button>

      {/* Security Notice */}
      <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
        <span>No payment required now</span>
        <span>•</span>
        <span>Pay at pickup</span>
        <span>•</span>
        <span>Free cancellation</span>
      </div>
    </form>
  )
}