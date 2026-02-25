'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useTranslations } from 'next-intl'
import {
  IoCashOutline,
  IoCardOutline,
  IoCheckmarkCircleOutline,
  IoShieldCheckmarkOutline,
  IoLockClosedOutline,
} from 'react-icons/io5'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentChoiceCardProps {
  booking: {
    id: string
    bookingCode: string
    totalAmount: number
    subtotal: number
    numberOfDays: number
    dailyRate: number
    carName?: string
  }
  onComplete: () => void
}

type Step = 'choose' | 'card-form' | 'success'

export default function PaymentChoiceCard({ booking, onComplete }: PaymentChoiceCardProps) {
  const t = useTranslations('BookingDetail')
  const [step, setStep] = useState<Step>('choose')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [successType, setSuccessType] = useState<'CARD' | 'CASH' | null>(null)

  const handleChooseCash = async () => {
    if (!confirm(t('cashConfirmDialog'))) return

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/rentals/bookings/${booking.id}/payment-choice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice: 'CASH' }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccessType('CASH')
        setStep('success')
        setTimeout(() => onComplete(), 2000)
      } else {
        setError(data.error || 'Failed to select cash payment')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChooseCard = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/rentals/bookings/${booking.id}/payment-choice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice: 'CARD' }),
      })
      const data = await res.json()
      if (data.success && data.clientSecret) {
        setClientSecret(data.clientSecret)
        setStep('card-form')
      } else {
        setError(data.error || 'Failed to initialize payment')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCardSuccess = async (paymentIntentId: string) => {
    try {
      const res = await fetch(`/api/rentals/bookings/${booking.id}/payment-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccessType('CARD')
        setStep('success')
        setTimeout(() => onComplete(), 2000)
      } else {
        setError(data.error || 'Failed to confirm payment')
      }
    } catch {
      setError('Failed to confirm payment')
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  // ─── SUCCESS STATE ──────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700 p-6 text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
          <IoCheckmarkCircleOutline className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {successType === 'CARD' ? t('cardAuthorizedTitle') : t('cashConfirmedTitle')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {successType === 'CARD' ? t('cardAuthorizedDesc') : t('cashConfirmedDesc')}
        </p>
      </div>
    )
  }

  // ─── CARD FORM STATE ────────────────────────────────────
  if (step === 'card-form' && clientSecret) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <IoCardOutline className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t('addPaymentMethod')}
            </h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('cardAuthHoldDesc', { amount: formatCurrency(booking.totalAmount) })}
          </p>
        </div>

        <div className="p-4 sm:p-6">
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#9333ea',
                  borderRadius: '8px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontSizeBase: '14px',
                },
              },
            }}
          >
            <CardPaymentForm
              bookingId={booking.id}
              amount={booking.totalAmount}
              onSuccess={handleCardSuccess}
              onError={(msg) => setError(msg)}
              formatCurrency={formatCurrency}
            />
          </Elements>
        </div>

        {error && (
          <div className="px-4 sm:px-6 pb-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="px-4 sm:px-6 pb-4 flex items-center gap-2 text-xs text-gray-400">
          <IoLockClosedOutline className="w-3.5 h-3.5" />
          {t('stripeSecureNote')}
        </div>
      </div>
    )
  }

  // ─── CHOOSE STATE ───────────────────────────────────────
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-900/20 p-4 sm:p-6 border-b border-purple-200 dark:border-purple-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {t('paymentChoiceTitle')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('paymentChoiceSubtitle')}
        </p>
      </div>

      {/* Pricing Summary */}
      <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">
            {formatCurrency(booking.dailyRate)} × {booking.numberOfDays} {t('days')}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(booking.subtotal)}
          </span>
        </div>
        <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
          <span className="text-gray-900 dark:text-white">{t('total')}</span>
          <span className="text-purple-600 dark:text-purple-400">
            {formatCurrency(booking.totalAmount)}
          </span>
        </div>
      </div>

      {/* Payment Options */}
      <div className="p-4 sm:p-6 space-y-3">
        {/* Pay with Card */}
        <button
          onClick={handleChooseCard}
          disabled={loading}
          className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 transition-all group disabled:opacity-50"
        >
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/60 transition-colors">
            <IoCardOutline className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-left flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">{t('payWithCard')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('payWithCardDesc')}</p>
          </div>
          <IoShieldCheckmarkOutline className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </button>

        {/* Pay Cash at Pickup */}
        <button
          onClick={handleChooseCash}
          disabled={loading}
          className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 transition-all group disabled:opacity-50"
        >
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 dark:group-hover:bg-green-900/60 transition-colors">
            <IoCashOutline className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-left flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">{t('payCashAtPickup')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('payCashDesc')}</p>
          </div>
        </button>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
        )}

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          {t('paymentChoiceOnce')}
        </p>
      </div>
    </div>
  )
}

// ─── Stripe Card Payment Form (inner component) ──────────
function CardPaymentForm({
  bookingId,
  amount,
  onSuccess,
  onError,
  formatCurrency,
}: {
  bookingId: string
  amount: number
  onSuccess: (paymentIntentId: string) => void
  onError: (msg: string) => void
  formatCurrency: (n: number) => string
}) {
  const t = useTranslations('BookingDetail')
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [ready, setReady] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    onError('')

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/en/rentals/dashboard/bookings/${bookingId}`,
      },
      redirect: 'if_required',
    })

    if (result.error) {
      onError(result.error.message || 'Payment failed')
      setProcessing(false)
    } else if (
      result.paymentIntent?.status === 'requires_capture' ||
      result.paymentIntent?.status === 'succeeded'
    ) {
      onSuccess(result.paymentIntent.id)
    } else {
      onError(`Unexpected payment status: ${result.paymentIntent?.status}`)
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement
        onReady={() => setReady(true)}
        options={{
          layout: 'tabs',
          wallets: { applePay: 'auto', googlePay: 'auto' },
        }}
      />
      <button
        type="submit"
        disabled={!stripe || !ready || processing}
        className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            {t('processing')}
          </>
        ) : (
          <>
            <IoLockClosedOutline className="w-4 h-4" />
            {t('authorizePayment', { amount: formatCurrency(amount) })}
          </>
        )}
      </button>
    </form>
  )
}
