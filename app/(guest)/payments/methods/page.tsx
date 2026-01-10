// app/(guest)/payments/methods/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import {
  IoCardOutline,
  IoAddOutline,
  IoTrashOutline,
  IoCheckmarkCircle,
  IoShieldCheckmarkOutline,
  IoInformationCircleOutline,
  IoCloseOutline
} from 'react-icons/io5'

// Initialize Stripe with publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentMethod {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
}

// Card Form Component (inside Elements provider)
function AddCardForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    try {
      // Get SetupIntent client secret
      const setupRes = await fetch('/api/payments/methods', {
        method: 'POST',
        credentials: 'include'
      })
      const setupData = await setupRes.json()

      if (!setupData.success) {
        throw new Error(setupData.error || 'Failed to create setup intent')
      }

      // Confirm card setup
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) throw new Error('Card element not found')

      const { error: confirmError } = await stripe.confirmCardSetup(setupData.clientSecret, {
        payment_method: { card: cardElement }
      })

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add card')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' }
              },
              invalid: { color: '#9e2146' }
            }
          }}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Card'}
        </button>
      </div>
    </form>
  )
}

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddCard, setShowAddCard] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/payments/methods', { credentials: 'include' })
      const data = await res.json()
      if (data.success) {
        setPaymentMethods(data.paymentMethods || [])
      }
    } catch (error) {
      console.error('Failed to fetch payment methods:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      setProcessing(true)
      const res = await fetch(`/api/payments/methods/${paymentMethodId}`, {
        method: 'PATCH',
        credentials: 'include'
      })
      if (res.ok) {
        fetchPaymentMethods()
      }
    } catch (error) {
      console.error('Failed to set default:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleDeleteCard = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) return

    try {
      setProcessing(true)
      const res = await fetch(`/api/payments/methods/${paymentMethodId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.ok) {
        fetchPaymentMethods()
      }
    } catch (error) {
      console.error('Failed to delete card:', error)
    } finally {
      setProcessing(false)
    }
  }

  const getCardBrandColor = (brand: string) => {
    const brandLower = brand.toLowerCase()
    if (brandLower.includes('visa')) return 'from-blue-500 to-blue-700'
    if (brandLower.includes('mastercard')) return 'from-orange-500 to-red-600'
    if (brandLower.includes('amex')) return 'from-green-500 to-teal-600'
    if (brandLower.includes('discover')) return 'from-orange-400 to-orange-600'
    return 'from-gray-500 to-gray-700'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Methods</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage your saved credit and debit cards
        </p>
      </div>

      {/* Security Banner */}
      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
        <div className="flex items-start gap-3">
          <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-green-900 dark:text-green-100">
              Secure Payment Processing
            </h3>
            <p className="text-xs text-green-800 dark:text-green-300 mt-0.5">
              Your payment information is encrypted and securely stored by Stripe.
              We never see or store your full card details.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods List */}
      {paymentMethods.length > 0 ? (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`relative border rounded-lg p-4 transition-all ${
                method.isDefault
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              {method.isDefault && (
                <div className="absolute top-3 right-3">
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-green-600 text-white text-xs font-medium rounded-full">
                    <IoCheckmarkCircle className="w-3 h-3" />
                    Default
                  </span>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className={`w-16 h-11 rounded-lg bg-gradient-to-br ${getCardBrandColor(method.brand)} flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <IoCardOutline className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                      {method.brand}
                    </h3>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">****</span>
                    <span className="font-mono text-sm text-gray-900 dark:text-white">
                      {method.last4}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Expires {method.expMonth.toString().padStart(2, '0')}/{method.expYear}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!method.isDefault && (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      disabled={processing}
                      className="px-3 py-1.5 text-xs font-medium bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteCard(method.id)}
                    disabled={processing}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <IoTrashOutline className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <IoCardOutline className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Payment Methods
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
            Add a payment method to quickly book vehicles without entering your card details each time.
          </p>
        </div>
      )}

      {/* Add Card Button / Form */}
      {showAddCard ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Add New Card</h3>
            <button
              onClick={() => setShowAddCard(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <IoCloseOutline className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <Elements stripe={stripePromise}>
            <AddCardForm
              onSuccess={() => {
                setShowAddCard(false)
                fetchPaymentMethods()
              }}
              onCancel={() => setShowAddCard(false)}
            />
          </Elements>
        </div>
      ) : (
        <button
          onClick={() => setShowAddCard(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
        >
          <IoAddOutline className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Add New Payment Method
          </span>
        </button>
      )}

      {/* Info Section */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
        <div className="flex items-start gap-3">
          <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
              About Payment Methods
            </h4>
            <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-300">
              <li>Your default card will be used for deposits and charges</li>
              <li>We accept Visa, Mastercard, American Express, and Discover</li>
              <li>Deposits are held temporarily and released after trip completion</li>
              <li>All payments are processed securely through Stripe</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Accepted Cards */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">We accept</p>
        <div className="flex items-center justify-center gap-2">
          {['Visa', 'Mastercard', 'Amex', 'Discover'].map((card) => (
            <div
              key={card}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-medium"
            >
              {card}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
