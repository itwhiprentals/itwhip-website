// app/host/components/AddDebitCardModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { IoCloseOutline, IoCardOutline, IoInformationCircle } from 'react-icons/io5'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'

// Initialize Stripe outside of component to avoid recreating on each render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface AddDebitCardModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

// Card form component that uses Stripe Elements
function CardForm({ onSuccess, onClose }: { onSuccess: () => void, onClose: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [cardholderName, setCardholderName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    if (!cardholderName.trim()) {
      setError('Cardholder name is required')
      return
    }

    setProcessing(true)
    setError('')

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setError('Card element not found')
      setProcessing(false)
      return
    }

    try {
      // Create a token for the card
      const { error: tokenError, token } = await stripe.createToken(cardElement, {
        name: cardholderName
      })

      if (tokenError) {
        throw new Error(tokenError.message)
      }

      if (!token) {
        throw new Error('Failed to create card token')
      }

      // Send token to your backend
      const response = await fetch('/api/host/banking/add-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          token: token.id,
          cardholderName
        })
      })

      const data = await response.json()
      
      // Debug log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Add card response:', { status: response.status, data })
      }

      if (!response.ok) {
        // Handle specific error types more carefully
        const errorMessage = data.error || 'Failed to add card'
        
        // Check if it's a card type error
        if (errorMessage.toLowerCase().includes('debit') && 
            errorMessage.toLowerCase().includes('credit')) {
          throw new Error('Only debit cards are accepted for instant payouts. Please use a debit card instead of a credit card.')
        }
        
        // Pass through the actual error from the API
        throw new Error(errorMessage)
      }

      // Success - check if requires Stripe dashboard completion
      if (data.requiresOnboarding && data.onboardingUrl) {
        // Card info saved, but needs Stripe dashboard to complete
        window.location.href = data.onboardingUrl
      } else {
        // Fully added (shouldn't happen with current Express account limitations)
        onSuccess()
      }
    } catch (err: any) {
      console.error('Error adding card:', err)
      setError(err.message || 'Failed to add card')
    } finally {
      setProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: false, // Show ZIP code field
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Cardholder Name */}
      <div>
        <label htmlFor="cardholder-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Cardholder Name
        </label>
        <input
          type="text"
          id="cardholder-name"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
          placeholder="John Doe"
          required
        />
      </div>

      {/* Stripe Card Element */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Card Details
        </label>
        <div className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <CardElement options={cardElementOptions} />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Enter card number, expiry date, CVC, and ZIP code
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <IoInformationCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-800 dark:text-yellow-200">
            <p className="font-medium mb-1">Debit Cards Only</p>
            <p>Only debit cards are accepted for instant payouts. Credit cards will be rejected. Make sure you're using a debit card from your bank.</p>
          </div>
        </div>
      </div>

      {/* Test Cards for Development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Test Cards:</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Debit: 4000056655665556<br />
            Credit (will fail): 4242424242424242<br />
            Use any future date and any 3 digits for CVC
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={processing}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={processing || !stripe}
          className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? 'Adding...' : 'Add Debit Card'}
        </button>
      </div>
    </form>
  )
}

// Main modal component
export default function AddDebitCardModal({ isOpen, onClose, onSuccess }: AddDebitCardModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-2">
              <IoCardOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Debit Card
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <IoCloseOutline className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            <div className="mb-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                  Instant Payout Fee: 1.5%
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Debit cards enable instant payouts with a 1.5% fee. Standard bank transfers are free but take 2-3 business days.
                </p>
              </div>
            </div>

            {/* Stripe Elements wrapper */}
            <Elements stripe={stripePromise}>
              <CardForm onSuccess={onSuccess} onClose={onClose} />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  )
}