// app/(guest)/payments/deposit/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { useTranslations } from 'next-intl'
import {
  IoWalletOutline,
  IoAddOutline,
  IoArrowUpOutline,
  IoArrowDownOutline,
  IoShieldCheckmarkOutline,
  IoInformationCircleOutline,
  IoCloseOutline,
  IoCheckmarkCircle
} from 'react-icons/io5'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Transaction {
  id: string
  type: 'LOAD' | 'HOLD' | 'RELEASE' | 'REFUND'
  amount: number
  balanceAfter: number
  description: string | null
  bookingId: string | null
  createdAt: string
}

// Payment Form Component
function LoadFundsForm({
  amount,
  clientSecret,
  onSuccess,
  onCancel
}: {
  amount: number
  clientSecret: string
  onSuccess: () => void
  onCancel: () => void
}) {
  const t = useTranslations('DepositWallet')
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
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required'
      })

      if (submitError) {
        throw new Error(submitError.message)
      }

      if (paymentIntent?.status === 'succeeded') {
        // Confirm the deposit on our backend
        const confirmRes = await fetch('/api/payments/deposit-wallet/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ paymentIntentId: paymentIntent.id })
        })

        const confirmData = await confirmRes.json()
        if (!confirmData.success) {
          throw new Error(confirmData.error)
        }

        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">{t('amountToLoad')}</p>
        <p className="text-3xl font-bold text-green-600 dark:text-green-400">${amount}</p>
      </div>

      <PaymentElement />

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
          {t('cancel')}
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? t('processing') : t('payAmount', { amount })}
        </button>
      </div>
    </form>
  )
}

export default function DepositWalletPage() {
  const t = useTranslations('DepositWallet')
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showLoadFunds, setShowLoadFunds] = useState(false)
  const [loadAmount, setLoadAmount] = useState(100)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [creatingIntent, setCreatingIntent] = useState(false)

  useEffect(() => {
    fetchWalletData()
  }, [])

  const fetchWalletData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/payments/deposit-wallet', { credentials: 'include' })
      const data = await res.json()
      if (data.success) {
        setBalance(data.balance)
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartLoad = async () => {
    try {
      setCreatingIntent(true)
      const res = await fetch('/api/payments/deposit-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: loadAmount })
      })

      const data = await res.json()
      if (data.success) {
        setClientSecret(data.clientSecret)
        setShowLoadFunds(true)
      } else {
        alert(data.error || 'Failed to start payment')
      }
    } catch (error) {
      console.error('Failed to create payment intent:', error)
    } finally {
      setCreatingIntent(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'LOAD':
        return <IoArrowDownOutline className="w-4 h-4 text-green-600" />
      case 'HOLD':
        return <IoArrowUpOutline className="w-4 h-4 text-orange-600" />
      case 'RELEASE':
        return <IoArrowDownOutline className="w-4 h-4 text-blue-600" />
      case 'REFUND':
        return <IoArrowUpOutline className="w-4 h-4 text-red-600" />
      default:
        return <IoWalletOutline className="w-4 h-4 text-gray-600" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'LOAD':
      case 'RELEASE':
        return 'text-green-600 dark:text-green-400'
      case 'HOLD':
      case 'REFUND':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
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
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <IoWalletOutline className="w-6 h-6" />
            <span className="text-sm font-medium opacity-90">{t('availableBalance')}</span>
          </div>
          <IoShieldCheckmarkOutline className="w-5 h-5 opacity-75" />
        </div>
        <p className="text-4xl font-bold mb-2">${balance.toFixed(2)}</p>
        <p className="text-sm opacity-75">{t('forDepositsOnly')}</p>
      </div>

      {/* Important Notice */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
        <div className="flex items-start gap-3">
          <IoInformationCircleOutline className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              {t('walletOnlyTitle')}
            </h3>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
              {t('walletOnlyDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Load Funds Section */}
      {showLoadFunds && clientSecret ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('addFunds')}</h3>
            <button
              onClick={() => {
                setShowLoadFunds(false)
                setClientSecret(null)
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <IoCloseOutline className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: { theme: 'stripe' }
            }}
          >
            <LoadFundsForm
              amount={loadAmount}
              clientSecret={clientSecret}
              onSuccess={() => {
                setShowLoadFunds(false)
                setClientSecret(null)
                fetchWalletData()
              }}
              onCancel={() => {
                setShowLoadFunds(false)
                setClientSecret(null)
              }}
            />
          </Elements>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{t('addDepositFunds')}</h3>

          {/* Amount Selection */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[100, 200, 500, 1000].map((amount) => (
              <button
                key={amount}
                onClick={() => setLoadAmount(amount)}
                className={`py-3 rounded-lg text-sm font-semibold transition-colors ${
                  loadAmount === amount
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                ${amount}
              </button>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={loadAmount}
                onChange={(e) => setLoadAmount(Math.max(50, Math.min(5000, Number(e.target.value))))}
                min={50}
                max={5000}
                className="w-full pl-8 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder={t('customAmount')}
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            {t('minMaxAmount')}
          </p>

          <button
            onClick={handleStartLoad}
            disabled={creatingIntent || loadAmount < 50 || loadAmount > 5000}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <IoAddOutline className="w-5 h-5" />
            {creatingIntent ? t('loading') : t('addToWallet', { amount: loadAmount })}
          </button>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('transactionHistory')}</h3>
        </div>

        {transactions.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  {getTransactionIcon(tx.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {tx.type === 'LOAD' && t('fundsAdded')}
                    {tx.type === 'HOLD' && t('depositHeld')}
                    {tx.type === 'RELEASE' && t('depositReleased')}
                    {tx.type === 'REFUND' && t('refund')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {tx.description || new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-semibold ${getTransactionColor(tx.type)}`}>
                    {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('balance', { amount: tx.balanceAfter.toFixed(2) })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <IoWalletOutline className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('noTransactions')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
