'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { IoCard, IoLockClosed } from 'react-icons/io5'
import CheckoutErrorBoundary from './CheckoutErrorBoundary'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentCardProps {
  clientSecret: string
  total: number
  onSuccess: (paymentIntentId: string) => void
  onBack?: () => void
}

export default function PaymentCard({ clientSecret, total, onSuccess, onBack }: PaymentCardProps) {
  return (
    <CheckoutErrorBoundary>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 p-3 border-b border-gray-100 dark:border-gray-700">
          <IoCard size={16} className="text-primary" />
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Payment
          </h4>
          <div className="ml-auto flex items-center gap-1 text-[10px] text-gray-400">
            <IoLockClosed size={10} />
            <span>Secured by Stripe</span>
          </div>
        </div>

        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#e87040',
                borderRadius: '8px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSizeBase: '14px',
              },
            },
          }}
        >
          <PaymentForm total={total} onSuccess={onSuccess} onBack={onBack} />
        </Elements>
      </div>
    </CheckoutErrorBoundary>
  )
}

function PaymentForm({
  total,
  onSuccess,
  onBack,
}: {
  total: number
  onSuccess: (paymentIntentId: string) => void
  onBack?: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setIsProcessing(true)
    setError(null)

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/choe`,
      },
      redirect: 'if_required',
    })

    if (result.error) {
      setError(result.error.message || 'Payment failed. Please try again.')
      setIsProcessing(false)
    } else if (result.paymentIntent) {
      if (result.paymentIntent.status === 'succeeded' || result.paymentIntent.status === 'requires_capture') {
        onSuccess(result.paymentIntent.id)
      } else {
        setError(`Payment status: ${result.paymentIntent.status}. Please try again.`)
        setIsProcessing(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-3">
        <PaymentElement
          options={{
            layout: 'tabs',
            wallets: { applePay: 'auto', googlePay: 'auto' },
          }}
        />
      </div>

      {error && (
        <div className="mx-3 mb-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="p-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
        </button>
        {onBack && !isProcessing && (
          <button
            type="button"
            onClick={onBack}
            className="w-full py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
          >
            Go Back
          </button>
        )}
      </div>
    </form>
  )
}
