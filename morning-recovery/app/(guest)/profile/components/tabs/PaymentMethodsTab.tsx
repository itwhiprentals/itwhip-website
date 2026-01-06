// app/(guest)/profile/components/tabs/PaymentMethodsTab.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  IoCardOutline,
  IoAddOutline,
  IoTrashOutline,
  IoCheckmarkCircle,
  IoAlertCircleOutline,
  IoShieldCheckmarkOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

interface PaymentMethod {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
}

export default function PaymentMethodsTab() {
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
      // TODO: Implement actual Stripe API call
      // const response = await fetch('/api/guest/payment-methods', {
      //   credentials: 'include'
      // })
      // const data = await response.json()
      // setPaymentMethods(data.paymentMethods || [])
      
      // Mock data for now
      setPaymentMethods([])
    } catch (error) {
      console.error('Failed to fetch payment methods:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      setProcessing(true)
      // TODO: Implement Stripe set default
      // await fetch('/api/guest/payment-methods/default', {
      //   method: 'POST',
      //   credentials: 'include',
      //   body: JSON.stringify({ paymentMethodId })
      // })
      
      alert('Default payment method updated!')
      fetchPaymentMethods()
    } catch (error) {
      console.error('Failed to set default:', error)
      alert('Failed to update default payment method')
    } finally {
      setProcessing(false)
    }
  }

  const handleDeleteCard = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) {
      return
    }

    try {
      setProcessing(true)
      // TODO: Implement Stripe delete
      // await fetch(`/api/guest/payment-methods/${paymentMethodId}`, {
      //   method: 'DELETE',
      //   credentials: 'include'
      // })
      
      alert('Payment method removed!')
      fetchPaymentMethods()
    } catch (error) {
      console.error('Failed to delete card:', error)
      alert('Failed to remove payment method')
    } finally {
      setProcessing(false)
    }
  }

  const getCardBrandColor = (brand: string) => {
    const brandLower = brand.toLowerCase()
    
    if (brandLower.includes('visa')) return 'from-blue-500 to-blue-700'
    if (brandLower.includes('mastercard')) return 'from-orange-500 to-red-600'
    if (brandLower.includes('amex') || brandLower.includes('american')) return 'from-green-500 to-teal-600'
    if (brandLower.includes('discover')) return 'from-orange-400 to-orange-600'
    return 'from-gray-500 to-gray-700'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Loading payment methods...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Payment Methods</h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
          Manage your credit cards and payment options
        </p>
      </div>

      {/* Security Banner */}
      <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg shadow-md">
        <div className="flex items-start gap-2.5">
          <IoShieldCheckmarkOutline className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-semibold text-green-900 dark:text-green-100 mb-0.5">
              Secure Payment Processing
            </h3>
            <p className="text-[10px] text-green-800 dark:text-green-300">
              Your payment information is encrypted and securely stored by Stripe. 
              We never see or store your full card details.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods List */}
      {paymentMethods.length > 0 ? (
        <div className="space-y-3 mb-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`relative border rounded-lg p-4 transition-all ${
                method.isDefault
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              {/* Default Badge */}
              {method.isDefault && (
                <div className="absolute top-3 right-3">
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-green-600 text-white text-[10px] font-medium rounded-full">
                    <IoCheckmarkCircle className="w-3 h-3" />
                    Default
                  </span>
                </div>
              )}

              <div className="flex items-start gap-3">
                {/* Card Visual */}
                <div className={`w-16 h-11 rounded-lg bg-gradient-to-br ${getCardBrandColor(method.brand)} flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <IoCardOutline className="w-6 h-6 text-white" />
                </div>

                {/* Card Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                      {method.brand}
                    </h3>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">••••</span>
                    <span className="font-mono text-sm text-gray-900 dark:text-white">
                      {method.last4}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Expires {method.expMonth.toString().padStart(2, '0')}/{method.expYear}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {!method.isDefault && (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      disabled={processing}
                      className="px-3 py-1.5 min-h-[32px] text-xs bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteCard(method.id)}
                    disabled={processing}
                    className="p-1.5 min-h-[32px] min-w-[32px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <IoTrashOutline className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* No Cards - Empty State */
        <div className="text-center py-8 px-4 mb-4">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <IoCardOutline className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5">
            No Payment Methods
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-4">
            Add a payment method to quickly book vehicles without entering your card details each time.
          </p>
        </div>
      )}

      {/* Add New Card Button */}
      <button
        onClick={() => setShowAddCard(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[36px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
      >
        <IoAddOutline className="w-5 h-5 text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Add New Payment Method
        </span>
      </button>

      {/* Add Card Modal/Form - Placeholder */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 max-w-md w-full">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">
              Add Payment Method
            </h3>
            <div className="space-y-3">
              <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                <IoCardOutline className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Stripe integration will be implemented here
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-1.5">
                  This will use Stripe Elements for secure card input
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddCard(false)}
                  className="flex-1 px-3 py-2 min-h-[36px] text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Stripe integration pending')
                    setShowAddCard(false)
                  }}
                  className="flex-1 px-3 py-2 min-h-[36px] text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Add Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Information */}
      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-300 dark:border-green-700 shadow-md">
        <div className="flex items-start gap-2.5">
          <IoInformationCircleOutline className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-green-900 dark:text-green-100 mb-1">
              About Payment Methods
            </h4>
            <ul className="space-y-0.5 text-[10px] text-green-800 dark:text-green-300">
              <li>• Your default card will be used for deposits and charges</li>
              <li>• We accept Visa, Mastercard, American Express, and Discover</li>
              <li>• Deposits are held temporarily and released after trip completion</li>
              <li>• You can add multiple cards and switch between them</li>
              <li>• All payments are processed securely through Stripe</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Accepted Cards */}
      <div className="mt-4 text-center">
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">We accept</p>
        <div className="flex items-center justify-center gap-2">
          <div className="px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px] font-medium">
            Visa
          </div>
          <div className="px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px] font-medium">
            Mastercard
          </div>
          <div className="px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px] font-medium">
            Amex
          </div>
          <div className="px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px] font-medium">
            Discover
          </div>
        </div>
      </div>
    </div>
  )
}