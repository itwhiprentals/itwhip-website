// app/host/components/EmbeddedBanking.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  IoWalletOutline, 
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoCard,
  IoBusinessOutline,
  IoShieldCheckmarkOutline,
  IoRefreshOutline,
  IoOpenOutline,
  IoInformationCircleOutline,
  IoTrendingUpOutline
} from 'react-icons/io5'

interface PaymentMethod {
  id: string
  type: 'bank_account' | 'card'
  bankName?: string
  brand?: string
  last4: string
  accountType?: string
  expMonth?: number
  expYear?: number
  status?: string
  isDefault: boolean
}

interface EarningsData {
  currentBalance: number
  pendingBalance: number
  holdBalance: number
  negativeBalance: number
  upcomingPayout: {
    amount: number
    estimatedDate: string
  } | null
  yearToDate: {
    earnings: number
    bookings: number
    totalPaidOut: number
    payoutsCount: number
  }
}

export default function EmbeddedBanking({ hostId }: { hostId: string }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasAccount, setHasAccount] = useState(false)
  const [accountStatus, setAccountStatus] = useState<any>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loadingMethods, setLoadingMethods] = useState(false)
  const [openingDashboard, setOpeningDashboard] = useState(false)
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [loadingEarnings, setLoadingEarnings] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [stripeInstance, setStripeInstance] = useState<any>(null)

  useEffect(() => {
    checkConnectAccount()
  }, [])

  useEffect(() => {
    if (hasAccount && accountStatus?.payoutsEnabled) {
      loadEarnings()
    }
  }, [hasAccount, accountStatus])

  const loadEarnings = async () => {
    try {
      setLoadingEarnings(true)
      const response = await fetch('/api/host/earnings', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setEarnings(data)
      }
    } catch (err) {
      console.error('Error loading earnings:', err)
    } finally {
      setLoadingEarnings(false)
    }
  }

  const checkConnectAccount = async () => {
    try {
      const response = await fetch('/api/host/banking/connect', {
        method: 'GET',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success && data.hasAccount) {
        setHasAccount(true)
        setAccountStatus(data)
        
        if (data.detailsSubmitted) {
          await loadPaymentMethods()
          await loadEmbeddedComponent()
        } else {
          setLoading(false)
        }
      } else {
        setHasAccount(false)
        setLoading(false)
      }
    } catch (err: any) {
      console.error('Error checking account:', err)
      setError('Failed to load banking information')
      setLoading(false)
    }
  }

  const loadPaymentMethods = async () => {
    try {
      setLoadingMethods(true)
      const response = await fetch('/api/host/banking/methods', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.methods) {
          setPaymentMethods(data.methods)
        }
      }
    } catch (err) {
      console.error('Error loading payment methods:', err)
    } finally {
      setLoadingMethods(false)
    }
  }

  const loadEmbeddedComponent = async () => {
    try {
      const { loadConnectAndInitialize } = await import('@stripe/connect-js')

      const sessionResponse = await fetch('/api/host/banking/session', {
        method: 'POST',
        credentials: 'include'
      })

      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json()
        throw new Error(errorData.error || 'Failed to create banking session')
      }

      const sessionData = await sessionResponse.json()

      const instance = loadConnectAndInitialize({
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
        fetchClientSecret: async () => sessionData.clientSecret,
        appearance: {
          overlays: 'dialog',
          variables: {
            colorPrimary: '#7c3aed',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#dc2626',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            spacingUnit: '6px',
            borderRadius: '12px',
            fontSizeBase: '15px',
            buttonPrimaryColorBackground: '#7c3aed',
            buttonPrimaryColorText: '#ffffff',
            actionPrimaryColorText: '#7c3aed'
          }
        }
      })

      setStripeInstance(instance)
      setLoading(false)

      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.innerHTML = ''
          const payouts = instance.create('payouts')
          containerRef.current.appendChild(payouts)
        }
      }, 100)

    } catch (err: any) {
      console.error('Error loading embedded component:', err)
      setError(err.message || 'Failed to load banking interface')
      setLoading(false)
    }
  }

  const handleConnectAccount = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/host/banking/connect', {
        method: 'POST',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success && data.onboardingUrl) {
        window.location.href = data.onboardingUrl
      } else {
        throw new Error(data.error || 'Failed to create account')
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleSetDefault = async (methodId: string) => {
    try {
      const response = await fetch('/api/host/banking/set-default', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ methodId })
      })

      if (response.ok) {
        await loadPaymentMethods()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to set default method')
      }
    } catch (err) {
      console.error('Error setting default:', err)
      alert('Failed to set default payment method')
    }
  }

  const handleManageBanking = async () => {
    setOpeningDashboard(true)
    try {
      const response = await fetch('/api/host/banking/dashboard-link', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.url) {
          window.open(data.url, '_blank')
        }
      } else {
        alert('Failed to open Stripe Dashboard')
      }
    } catch (err) {
      console.error('Error opening dashboard:', err)
      alert('Failed to open Stripe Dashboard')
    } finally {
      setOpeningDashboard(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getTimeUntilPayout = (dateString: string) => {
    const now = new Date()
    const payoutDate = new Date(dateString)
    const diffTime = payoutDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Processing'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    return `in ${diffDays} days`
  }

  if (loading || loadingEarnings) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 dark:border-purple-900 border-t-purple-600 dark:border-t-purple-400 mx-auto mb-6"></div>
            <IoWalletOutline className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {loadingEarnings ? 'Loading Earnings...' : 'Loading Your Banking Dashboard'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Securely connecting to Stripe...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mb-4">
                <IoAlertCircleOutline className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
                Banking Error
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-6">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-md"
              >
                <IoRefreshOutline className="w-5 h-5" />
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!hasAccount) {
    return (
      <div className="min-h-[600px] flex items-center justify-center p-4">
        <div className="max-w-3xl w-full">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl border border-purple-200 dark:border-gray-700 p-8 md:p-12 shadow-xl">
            
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-6 shadow-lg">
                <IoWalletOutline className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                Connect Your Bank Account
              </h2>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Set up secure payouts to receive earnings from your trips. Powered by Stripe's bank-level security.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <IoCheckmarkCircleOutline className="w-8 h-8 text-green-600 dark:text-green-400 mb-2 mx-auto" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm text-center">Bank Account</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  Instant login
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <IoCheckmarkCircleOutline className="w-8 h-8 text-green-600 dark:text-green-400 mb-2 mx-auto" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm text-center">Tax Info</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  SSN or EIN
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <IoCheckmarkCircleOutline className="w-8 h-8 text-green-600 dark:text-green-400 mb-2 mx-auto" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm text-center">ID Verify</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  Gov't ID
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <IoTimeOutline className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2 mx-auto" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm text-center">Quick</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  3-5 minutes
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
                <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bank-Level Security</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
                <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">256-bit Encryption</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
                <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">PCI Compliant</span>
              </div>
            </div>

            <button
              onClick={handleConnectAccount}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-5 px-8 rounded-lg transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-3 text-lg"
            >
              <IoWalletOutline className="w-6 h-6" />
              Connect with Stripe
            </button>

            <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-6">
              Powered by Stripe • Your data is never stored on our servers
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (accountStatus && accountStatus.requiresAction) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-8 shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                <IoAlertCircleOutline className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-100 mb-2">
                  Complete Your Account Setup
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                  Your Stripe account setup is incomplete. Finish onboarding to start receiving payouts from completed trips.
                </p>
                <button
                  onClick={handleConnectAccount}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-md"
                >
                  Complete Setup Now
                  <IoCheckmarkCircleOutline className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Success Banner */}
      {accountStatus?.payoutsEnabled && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 md:p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center flex-shrink-0">
              <IoCheckmarkCircleOutline className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-green-900 dark:text-green-100 text-sm md:text-base">
                Payouts Active - You're all set!
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">
                Your earnings will be automatically transferred to your bank account
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Balance Overview Cards - NEW SECTION */}
      {earnings && accountStatus?.payoutsEnabled && (
        <div className="space-y-4">
          {/* Balance Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Available Balance */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Available Balance</p>
                <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-4xl font-bold text-green-900 dark:text-green-100 mb-1">
                {formatCurrency(earnings.currentBalance)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Already transferred to your bank
              </p>
            </div>
            
            {/* Pending Balance */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Pending (3-day hold)</p>
                <IoTimeOutline className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-4xl font-bold text-amber-900 dark:text-amber-100 mb-1">
                {formatCurrency(earnings.pendingBalance)}
              </p>
              {earnings.upcomingPayout ? (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Available {getTimeUntilPayout(earnings.upcomingPayout.estimatedDate)}
                </p>
              ) : (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  No pending payouts
                </p>
              )}
            </div>
            
            {/* Hold Balance (if any) OR YTD Earnings */}
            {earnings.holdBalance > 0 ? (
              <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">On Hold</p>
                  <IoAlertCircleOutline className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-4xl font-bold text-red-900 dark:text-red-100 mb-1">
                  {formatCurrency(earnings.holdBalance)}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Held for dispute/review
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">2025 YTD Earnings</p>
                  <IoTrendingUpOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-4xl font-bold text-purple-900 dark:text-purple-100 mb-1">
                  {formatCurrency(earnings.yearToDate.earnings)}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  {earnings.yearToDate.bookings} trips completed
                </p>
              </div>
            )}
          </div>
          
          {/* Quick Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Automatic Payouts</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Earnings are automatically transferred to your default payment method 3 days after each trip completes. 
                  Funds typically arrive in your bank account 1-3 business days after transfer.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods - Read-Only Display */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Connected Payment Methods
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Quick view of your connected accounts
              </p>
            </div>
            <button
              onClick={handleManageBanking}
              disabled={openingDashboard}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {openingDashboard ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Opening...
                </>
              ) : (
                <>
                  <IoOpenOutline className="w-4 h-4" />
                  Manage in Stripe
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {loadingMethods ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
            </div>
          ) : paymentMethods.length > 0 ? (
            <div className="space-y-2.5">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`group relative rounded-lg p-2.5 transition-all ${
                    method.isDefault
                      ? 'bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-300 dark:border-purple-600'
                      : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        method.type === 'bank_account'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                          : 'bg-gradient-to-br from-purple-500 to-purple-600'
                      }`}>
                        {method.type === 'bank_account' ? (
                          <IoBusinessOutline className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <IoCard className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white text-xs">
                          {method.type === 'bank_account'
                            ? `${method.bankName || 'Bank'} ••${method.last4}`
                            : `${method.brand} ••${method.last4}`}
                        </h4>
                        
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          {method.type === 'bank_account' ? (
                            <>{method.accountType || 'Checking'}</>
                          ) : (
                            <>Exp {method.expMonth}/{method.expYear?.toString().slice(-2)}</>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    {method.isDefault && (
                      <span className="px-2 py-0.5 bg-purple-500 text-white text-[10px] font-medium rounded-md whitespace-nowrap ml-auto">
                        Default
                      </span>
                    )}
                    
                    {!method.isDefault && (
                      <button
                        onClick={() => handleSetDefault(method.id)}
                        className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors whitespace-nowrap ml-auto"
                      >
                        Set Default
                      </button>
                    )}
                  </div>
                  
                  {!method.isDefault && (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      className="sm:hidden w-full mt-2 px-3 py-1 text-[10px] font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoWalletOutline className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-gray-900 dark:text-white font-semibold mb-2 text-sm">
                No payment methods yet
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-xs max-w-md mx-auto">
                Click "Manage in Stripe" above to add your first bank account
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stripe Embedded Payouts Component */}
      <div 
        ref={containerRef}
        className="w-full min-h-[500px] md:min-h-[700px]"
        style={{ 
          minHeight: '500px',
          touchAction: 'manipulation'
        }}
      />

      {/* Help Section */}
      <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <IoShieldCheckmarkOutline className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base">
              Secure & Automatic Payouts
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              All payment information is encrypted and managed by Stripe. Your earnings are automatically transferred to your default payment method. To add, remove, or edit bank accounts, click "Manage in Stripe" above to access your secure banking dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}