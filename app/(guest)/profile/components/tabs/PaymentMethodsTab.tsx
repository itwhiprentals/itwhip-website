// app/(guest)/profile/components/tabs/PaymentMethodsTab.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IoCardOutline,
  IoWalletOutline,
  IoGiftOutline,
  IoChevronForwardOutline,
  IoShieldCheckmarkOutline,
  IoLockClosedOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'

interface WalletData {
  depositWalletBalance: number
  creditBalance: number
  bonusBalance: number
  paymentMethodCount: number
  isVerified: boolean
  stripeIdentityStatus: string | null
}

export default function PaymentMethodsTab() {
  const [data, setData] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWalletData()
  }, [])

  const fetchWalletData = async () => {
    try {
      setLoading(true)

      // Fetch payment methods count
      const methodsRes = await fetch('/api/payments/methods', { credentials: 'include' })
      const methodsData = await methodsRes.json()

      // Fetch balances
      const balanceRes = await fetch('/api/payments/balance', { credentials: 'include' })
      const balanceData = await balanceRes.json()

      // Fetch deposit wallet
      const depositRes = await fetch('/api/payments/deposit-wallet', { credentials: 'include' })
      const depositData = await depositRes.json()

      // Fetch identity verification status
      const identityRes = await fetch('/api/identity/verify', { credentials: 'include' })
      const identityData = await identityRes.json()

      setData({
        paymentMethodCount: methodsData.paymentMethods?.length || 0,
        depositWalletBalance: depositData.balance || 0,
        creditBalance: balanceData.creditBalance || 0,
        bonusBalance: balanceData.bonusBalance || 0,
        isVerified: identityData.isVerified || false,
        stripeIdentityStatus: identityData.status || null
      })
    } catch (error) {
      console.error('Failed to fetch wallet data:', error)
      setData({
        paymentMethodCount: 0,
        depositWalletBalance: 0,
        creditBalance: 0,
        bonusBalance: 0,
        isVerified: false,
        stripeIdentityStatus: null
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Loading wallet...</p>
        </div>
      </div>
    )
  }

  const isVerified = data?.isVerified || false

  const sections = [
    {
      href: '/payments/methods',
      icon: IoCardOutline,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      title: 'Payment Methods',
      description: 'Manage your saved credit and debit cards',
      value: data?.paymentMethodCount === 0 ? 'No cards' : `${data?.paymentMethodCount} card${data?.paymentMethodCount === 1 ? '' : 's'}`
    },
    {
      href: '/payments/deposit',
      icon: IoWalletOutline,
      iconColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      title: 'Deposit Wallet',
      description: 'Preload funds for security deposits',
      value: `$${(data?.depositWalletBalance || 0).toFixed(2)}`
    },
    {
      href: '/payments/credits',
      icon: IoGiftOutline,
      iconColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      title: 'Credits & Bonus',
      description: 'View your credits and promotional bonuses',
      value: `$${((data?.creditBalance || 0) + (data?.bonusBalance || 0)).toFixed(2)}`
    }
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Payments & Wallet</h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
          Manage your payment methods and wallet balances
        </p>
      </div>

      {/* Verification Required Banner - Show if not verified */}
      {!isVerified && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg">
          <div className="flex items-start gap-2.5">
            <IoAlertCircleOutline className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-xs font-semibold text-yellow-900 dark:text-yellow-100 mb-0.5">
                Identity Verification Required
              </h3>
              <p className="text-[10px] text-yellow-800 dark:text-yellow-300 mb-2">
                Verify your identity and add a payment method to unlock payments. Get a signup bonus from ItWhip!
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-[10px] font-medium rounded transition-colors"
              >
                <IoShieldCheckmarkOutline className="w-3 h-3" />
                Verify Now
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Security Banner - Show if verified */}
      {isVerified && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg">
          <div className="flex items-start gap-2.5">
            <IoShieldCheckmarkOutline className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-semibold text-green-900 dark:text-green-100 mb-0.5">
                Identity Verified
              </h3>
              <p className="text-[10px] text-green-800 dark:text-green-300">
                Your payment information is encrypted and securely stored by Stripe.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
          <IoCardOutline className="w-5 h-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
          <p className="text-lg font-bold text-gray-900 dark:text-white">{data?.paymentMethodCount || 0}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Cards</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
          <IoWalletOutline className="w-5 h-5 mx-auto mb-1 text-green-600 dark:text-green-400" />
          <p className="text-lg font-bold text-gray-900 dark:text-white">${(data?.depositWalletBalance || 0).toFixed(0)}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Deposit</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
          <IoGiftOutline className="w-5 h-5 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
          <p className="text-lg font-bold text-gray-900 dark:text-white">${((data?.creditBalance || 0) + (data?.bonusBalance || 0)).toFixed(0)}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Credits</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="space-y-2">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <Link
              key={section.href}
              href={section.href}
              className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-500 dark:hover:border-green-400 hover:shadow-md transition-all group"
            >
              <div className={`w-10 h-10 ${section.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${section.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {section.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {section.description}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {section.value}
                </span>
                <IoChevronForwardOutline className="w-4 h-4 text-gray-400 group-hover:text-green-500 transition-colors" />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex gap-2">
        {isVerified ? (
          <>
            <Link
              href="/payments/methods"
              className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg text-center transition-colors"
            >
              Add Payment Method
            </Link>
            <Link
              href="/payments/deposit"
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium rounded-lg text-center transition-colors"
            >
              Add Deposit
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/payments/methods"
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg text-center flex items-center justify-center gap-1 transition-colors"
            >
              <IoLockClosedOutline className="w-4 h-4" />
              Add Payment Method
            </Link>
            <Link
              href="/payments/deposit"
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg text-center flex items-center justify-center gap-1 transition-colors"
            >
              <IoLockClosedOutline className="w-4 h-4" />
              Add Deposit
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
