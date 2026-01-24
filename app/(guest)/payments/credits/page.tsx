// app/(guest)/payments/credits/page.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  IoGiftOutline,
  IoWalletOutline,
  IoInformationCircleOutline,
  IoWarningOutline,
  IoArrowUpOutline,
  IoArrowDownOutline,
  IoTimeOutline,
  IoLockClosedOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5'
import Link from 'next/link'

interface Transaction {
  id: string
  type: 'CREDIT' | 'BONUS'
  action: 'ADD' | 'USE' | 'EXPIRE' | 'ADJUST'
  amount: number
  balanceAfter: number
  reason: string | null
  bookingId: string | null
  expiresAt: string | null
  createdAt: string
}

export default function CreditsPage() {
  const [creditBalance, setCreditBalance] = useState(0)
  const [bonusBalance, setBonusBalance] = useState(0)
  const [depositBalance, setDepositBalance] = useState(0)
  const [maxBonusPercentage, setMaxBonusPercentage] = useState(0.25)
  const [expiringAmount, setExpiringAmount] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'credit' | 'bonus'>('all')
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    fetchBalances()
  }, [])

  const fetchBalances = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/payments/balance', { credentials: 'include' })
      const data = await res.json()
      if (data.success) {
        setCreditBalance(data.creditBalance)
        setBonusBalance(data.bonusBalance)
        setDepositBalance(data.depositWalletBalance || 0)
        setMaxBonusPercentage(data.maxBonusPercentage)
        setExpiringAmount(data.expiringBonusAmount || 0)
        setTransactions(data.transactions || [])
        setIsVerified(data.isVerified || false)
      }
    } catch (error) {
      console.error('Failed to fetch balances:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true
    return tx.type.toLowerCase() === filter
  })

  const getActionLabel = (action: string, type: string) => {
    switch (action) {
      case 'ADD':
        return type === 'CREDIT' ? 'Credit Added' : 'Bonus Added'
      case 'USE':
        return 'Applied to Booking'
      case 'EXPIRE':
        return 'Expired'
      case 'ADJUST':
        return 'Adjustment'
      default:
        return action
    }
  }

  const getReasonLabel = (reason: string | null) => {
    if (!reason) return null
    const labels: Record<string, string> = {
      REFUND: 'Refund',
      GOODWILL: 'Goodwill Credit',
      PROMO: 'Promotional',
      LOYALTY: 'Loyalty Reward',
      SIGNUP: 'Signup Bonus',
      REFERRAL: 'Referral Bonus'
    }
    return labels[reason] || reason
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // Calculate total credits that would be locked
  const totalCredits = creditBalance + bonusBalance + depositBalance

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Credits & Bonus</h2>
          {!isVerified && totalCredits > 0 && (
            <span
              className="text-yellow-600 dark:text-yellow-400 cursor-help"
              title="Verify your identity with Stripe to unlock your credits"
            >
              <IoLockClosedOutline className="w-5 h-5" />
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Your credits and promotional bonuses
        </p>
      </div>

      {/* Locked Credits Warning - Show if not verified and has credits */}
      {!isVerified && totalCredits > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <IoLockClosedOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                Credits Locked
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                Complete identity verification to unlock ${totalCredits.toFixed(2)} in credits. This quick verification keeps our community safe.
              </p>
              <Link
                href="/profile/verification"
                className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <IoShieldCheckmarkOutline className="w-4 h-4" />
                Verify Now
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Verified Badge - Show when verified and has credits */}
      {isVerified && totalCredits > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              Identity Verified - All credits available for use
            </span>
          </div>
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Credit Balance */}
        <div className={`bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-5 text-white shadow-lg relative ${!isVerified && creditBalance > 0 ? 'opacity-75' : ''}`}>
          {!isVerified && creditBalance > 0 && (
            <div className="absolute top-3 right-3">
              <IoLockClosedOutline className="w-5 h-5 text-white/80" />
            </div>
          )}
          <div className="flex items-center gap-2 mb-3">
            <IoWalletOutline className="w-5 h-5 opacity-90" />
            <span className="text-sm font-medium opacity-90">Credit Balance</span>
          </div>
          <p className="text-3xl font-bold mb-1">${creditBalance.toFixed(2)}</p>
          <p className="text-xs opacity-75">
            {!isVerified && creditBalance > 0 ? 'Locked - verify to use' : '100% usable per booking'}
          </p>
        </div>

        {/* Bonus Balance */}
        <div className={`bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg p-5 text-white shadow-lg relative ${!isVerified && bonusBalance > 0 ? 'opacity-75' : ''}`}>
          {!isVerified && bonusBalance > 0 && (
            <div className="absolute top-3 right-3">
              <IoLockClosedOutline className="w-5 h-5 text-white/80" />
            </div>
          )}
          <div className="flex items-center gap-2 mb-3">
            <IoGiftOutline className="w-5 h-5 opacity-90" />
            <span className="text-sm font-medium opacity-90">Bonus Balance</span>
          </div>
          <p className="text-3xl font-bold mb-1">${bonusBalance.toFixed(2)}</p>
          <p className="text-xs opacity-75">
            {!isVerified && bonusBalance > 0 ? 'Locked - verify to use' : `Max ${Math.round(maxBonusPercentage * 100)}% per booking`}
          </p>
        </div>
      </div>

      {/* Expiring Bonus Warning */}
      {expiringAmount > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
          <div className="flex items-start gap-3">
            <IoWarningOutline className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                Bonus Expiring Soon
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                ${expiringAmount.toFixed(2)} in bonus credits will expire within 30 days. Book a trip to use them!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
          <div className="flex items-start gap-3">
            <IoInformationCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-green-900 dark:text-green-100">Credits</h4>
              <p className="text-xs text-green-800 dark:text-green-300 mt-0.5">
                Platform credits from refunds or goodwill. Can be used to pay for 100% of your booking.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
          <div className="flex items-start gap-3">
            <IoInformationCircleOutline className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100">Bonuses</h4>
              <p className="text-xs text-purple-800 dark:text-purple-300 mt-0.5">
                Promotional bonuses from signups, referrals, or campaigns. Max {Math.round(maxBonusPercentage * 100)}% can be applied per booking.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Transaction History</h3>
            <div className="flex gap-1">
              {(['all', 'credit', 'bonus'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    filter === f
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  tx.type === 'CREDIT'
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-purple-100 dark:bg-purple-900/30'
                }`}>
                  {tx.action === 'ADD' ? (
                    <IoArrowDownOutline className={`w-4 h-4 ${
                      tx.type === 'CREDIT' ? 'text-green-600' : 'text-purple-600'
                    }`} />
                  ) : tx.action === 'USE' ? (
                    <IoArrowUpOutline className={`w-4 h-4 ${
                      tx.type === 'CREDIT' ? 'text-green-600' : 'text-purple-600'
                    }`} />
                  ) : tx.action === 'EXPIRE' ? (
                    <IoTimeOutline className="w-4 h-4 text-gray-600" />
                  ) : (
                    <IoGiftOutline className={`w-4 h-4 ${
                      tx.type === 'CREDIT' ? 'text-green-600' : 'text-purple-600'
                    }`} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {getActionLabel(tx.action, tx.type)}
                    </p>
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                      tx.type === 'CREDIT'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    }`}>
                      {tx.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    {tx.reason && <span>{getReasonLabel(tx.reason)}</span>}
                    {tx.reason && <span>•</span>}
                    <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                    {tx.expiresAt && (
                      <>
                        <span>•</span>
                        <span className="text-amber-600 dark:text-amber-400">
                          Expires {new Date(tx.expiresAt).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-semibold ${
                    tx.amount >= 0
                      ? tx.type === 'CREDIT'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-purple-600 dark:text-purple-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {tx.amount >= 0 ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <IoGiftOutline className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filter === 'all' ? 'No transactions yet' : `No ${filter} transactions`}
            </p>
          </div>
        )}
      </div>

      {/* How to Earn */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">How to Earn</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <IoWalletOutline className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Credits</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Receive credits from trip refunds or goodwill adjustments from support
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <IoGiftOutline className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Bonuses</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Earn bonuses from promotions, referrals, and loyalty rewards
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
