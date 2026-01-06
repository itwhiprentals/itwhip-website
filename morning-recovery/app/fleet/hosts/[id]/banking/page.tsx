// app/fleet/hosts/[id]/banking/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  IoArrowBackOutline,
  IoWalletOutline,
  IoCardOutline,
  IoBusinessOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoAlertCircleOutline,
  IoTimeOutline,
  IoCashOutline,
  IoLockClosedOutline,
  IoLockOpenOutline,
  IoFlashOutline,
  IoShieldCheckmarkOutline,
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoRefreshOutline,
  IoPauseCircleOutline,
  IoPlayCircleOutline,
  IoSendOutline,
  IoDocumentTextOutline
} from 'react-icons/io5'

interface BankingData {
  host: {
    id: string
    name: string
    email: string
    approvalStatus: string
    hostType: string
  }
  stripeConnect: {
    accountId: string | null
    status: string | null
    payoutsEnabled: boolean
    chargesEnabled: boolean
    detailsSubmitted: boolean
    stripeData: any
  }
  stripeCustomer: {
    customerId: string | null
    defaultPaymentMethod: string | null
    stripeData: any
  }
  balances: {
    current: number
    pending: number
    hold: number
    negative: number
    availableForPayout: number
  }
  subscription: {
    tier: string
    status: string
    monthlyFee: number
    startDate: string | null
    endDate: string | null
    lastChargeDate: string | null
    nextChargeDate: string | null
  }
  payout: {
    schedule: string
    minimumAmount: number
    instantEnabled: boolean
    nextScheduled: string | null
    lastPayoutDate: string | null
    lastPayoutAmount: number | null
    totalPayouts: number
    payoutCount: number
    enabled: boolean
    disabledReason: string | null
  }
  bankAccount: {
    last4: string
    bankName: string
    accountType: string
    verified: boolean
  } | null
  debitCard: {
    last4: string
    brand: string
    expMonth: number
    expYear: number
  } | null
  paymentMethods: any[]
  recentCharges: any[]
  stats: {
    totalCharges: number
    totalChargedAmount: number
    currentBalance: number
    pendingBalance: number
    holdBalance: number
    negativeBalance: number
    availableForPayout: number
    totalPayouts: number
    payoutCount: number
  }
}

export default function HostBankingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [bankingData, setBankingData] = useState<BankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Modal states
  const [showChargeModal, setShowChargeModal] = useState(false)
  const [showHoldModal, setShowHoldModal] = useState(false)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  
  // Form states
  const [chargeForm, setChargeForm] = useState({
    amount: '',
    chargeType: 'subscription',
    reason: '',
    notes: '',
    deductFromBalance: true
  })
  
  const [holdForm, setHoldForm] = useState({
    action: 'hold',
    amount: '',
    reason: '',
    notes: '',
    holdUntil: ''
  })
  
  const [payoutForm, setPayoutForm] = useState({
    amount: '',
    reason: '',
    notes: ''
  })
  
  const [suspendForm, setSuspendForm] = useState({
    reason: '',
    notes: ''
  })
  
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadBankingData()
  }, [params])

  const loadBankingData = async () => {
    try {
      const { id } = await params
      const response = await fetch(`/fleet/api/hosts/${id}/banking?key=phoenix-fleet-2847`)
      
      if (response.ok) {
        const data = await response.json()
        setBankingData(data.data)
      } else {
        console.error('Failed to load banking data')
      }
    } catch (error) {
      console.error('Error loading banking data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadBankingData()
  }

  const handleChargeHost = async () => {
    if (!chargeForm.amount || !chargeForm.reason) {
      setActionError('Amount and reason are required')
      return
    }

    setActionLoading(true)
    setActionError(null)

    try {
      const { id } = await params
      const response = await fetch(`/fleet/api/hosts/${id}/charge?key=phoenix-fleet-2847`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(chargeForm.amount),
          chargeType: chargeForm.chargeType,
          reason: chargeForm.reason,
          notes: chargeForm.notes,
          chargedBy: 'admin@itwhip.com', // Replace with actual admin email
          deductFromBalance: chargeForm.deductFromBalance
        })
      })

      const data = await response.json()

      if (data.success) {
        setActionSuccess(data.data.message)
        setShowChargeModal(false)
        setChargeForm({ amount: '', chargeType: 'subscription', reason: '', notes: '', deductFromBalance: true })
        loadBankingData()
      } else {
        setActionError(data.error || 'Failed to charge host')
      }
    } catch (error: any) {
      setActionError(error.message || 'Failed to charge host')
    } finally {
      setActionLoading(false)
    }
  }

  const handleFundsAction = async () => {
    if (!holdForm.amount && holdForm.action !== 'suspend_payouts' && holdForm.action !== 'enable_payouts') {
      setActionError('Amount is required')
      return
    }

    if (!holdForm.reason) {
      setActionError('Reason is required')
      return
    }

    setActionLoading(true)
    setActionError(null)

    try {
      const { id } = await params
      const response = await fetch(`/fleet/api/hosts/${id}/funds?key=phoenix-fleet-2847`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: holdForm.action,
          amount: holdForm.amount ? parseFloat(holdForm.amount) : undefined,
          reason: holdForm.reason,
          notes: holdForm.notes,
          adminEmail: 'admin@itwhip.com', // Replace with actual admin email
          holdUntil: holdForm.holdUntil || undefined
        })
      })

      const data = await response.json()

      if (data.success) {
        setActionSuccess(data.data.message)
        setShowHoldModal(false)
        setShowSuspendModal(false)
        setHoldForm({ action: 'hold', amount: '', reason: '', notes: '', holdUntil: '' })
        loadBankingData()
      } else {
        setActionError(data.error || 'Failed to perform action')
      }
    } catch (error: any) {
      setActionError(error.message || 'Failed to perform action')
    } finally {
      setActionLoading(false)
    }
  }

  const handleForcePayout = async () => {
    if (!payoutForm.amount || !payoutForm.reason) {
      setActionError('Amount and reason are required')
      return
    }

    setActionLoading(true)
    setActionError(null)

    try {
      const { id } = await params
      const response = await fetch(`/fleet/api/hosts/${id}/funds?key=phoenix-fleet-2847`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'force_payout',
          amount: parseFloat(payoutForm.amount),
          reason: payoutForm.reason,
          notes: payoutForm.notes,
          adminEmail: 'admin@itwhip.com' // Replace with actual admin email
        })
      })

      const data = await response.json()

      if (data.success) {
        setActionSuccess(data.data.message)
        setShowPayoutModal(false)
        setPayoutForm({ amount: '', reason: '', notes: '' })
        loadBankingData()
      } else {
        setActionError(data.error || 'Failed to process payout')
      }
    } catch (error: any) {
      setActionError(error.message || 'Failed to process payout')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading banking data...</p>
        </div>
      </div>
    )
  }

  if (!bankingData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
            <IoAlertCircleOutline className="mx-auto text-6xl text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load Banking Data
            </h3>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            href={`/fleet/hosts/${bankingData.host.id}?key=phoenix-fleet-2847`}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg"
          >
            <IoArrowBackOutline className="text-xl" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Banking & Payments
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {bankingData.host.name} • {bankingData.host.email}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${
            bankingData.host.hostType === 'PLATFORM' ? 'bg-purple-100 text-purple-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {bankingData.host.hostType === 'PLATFORM' ? 'Platform Fleet' : 'Partner Host'}
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg"
          >
            <IoRefreshOutline className={`text-xl ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Success/Error Messages */}
        {actionSuccess && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IoCheckmarkCircleOutline className="text-xl" />
              {actionSuccess}
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-green-700 hover:text-green-900">
              <IoCloseCircleOutline className="text-xl" />
            </button>
          </div>
        )}

        {actionError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IoAlertCircleOutline className="text-xl" />
              {actionError}
            </div>
            <button onClick={() => setActionError(null)} className="text-red-700 hover:text-red-900">
              <IoCloseCircleOutline className="text-xl" />
            </button>
          </div>
        )}

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Current Balance</span>
              <IoCashOutline className="text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${bankingData.balances.current.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Available earnings</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
              <IoTimeOutline className="text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${bankingData.balances.pending.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">From active trips</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">On Hold</span>
              <IoLockClosedOutline className="text-red-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${bankingData.balances.hold.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Frozen for claims</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Available Payout</span>
              <IoWalletOutline className="text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600">
              ${bankingData.balances.availableForPayout.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Can be paid out</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => setShowChargeModal(true)}
            className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 font-medium"
          >
            <IoTrendingDownOutline />
            Charge Host
          </button>

          <button
            onClick={() => {
              setHoldForm({ ...holdForm, action: 'hold' })
              setShowHoldModal(true)
            }}
            className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2 font-medium"
          >
            <IoLockClosedOutline />
            Hold Funds
          </button>

          <button
            onClick={() => setShowPayoutModal(true)}
            disabled={bankingData.balances.availableForPayout <= 0 || !bankingData.stripeConnect.accountId}
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            <IoSendOutline />
            Force Payout
          </button>

          <button
            onClick={() => {
              setHoldForm({ ...holdForm, action: bankingData.payout.enabled ? 'suspend_payouts' : 'enable_payouts' })
              setShowSuspendModal(true)
            }}
            className={`px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium ${
              bankingData.payout.enabled
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {bankingData.payout.enabled ? <IoPauseCircleOutline /> : <IoPlayCircleOutline />}
            {bankingData.payout.enabled ? 'Suspend' : 'Enable'} Payouts
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stripe Connect Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <IoCardOutline className="text-purple-600" />
                Stripe Connect (Receiving Payouts)
              </h3>
            </div>
            <div className="p-4 sm:p-6">
              {bankingData.stripeConnect.accountId ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Account ID</span>
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {bankingData.stripeConnect.accountId}
                    </code>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      bankingData.stripeConnect.payoutsEnabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {bankingData.stripeConnect.status || 'Unknown'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Payouts</span>
                    {bankingData.stripeConnect.payoutsEnabled ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <IoCheckmarkCircleOutline />
                        Enabled
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 text-sm">
                        <IoCloseCircleOutline />
                        Disabled
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Details Submitted</span>
                    {bankingData.stripeConnect.detailsSubmitted ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <IoCheckmarkCircleOutline />
                        Complete
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-600 text-sm">
                        <IoAlertCircleOutline />
                        Incomplete
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <IoAlertCircleOutline className="mx-auto text-4xl text-gray-400 mb-2" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    No Stripe Connect account
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Stripe Customer Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <IoBusinessOutline className="text-purple-600" />
                Stripe Customer (Charging Host)
              </h3>
            </div>
            <div className="p-4 sm:p-6">
              {bankingData.stripeCustomer.customerId ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Customer ID</span>
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {bankingData.stripeCustomer.customerId}
                    </code>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Payment Method</span>
                    {bankingData.stripeCustomer.defaultPaymentMethod ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <IoCheckmarkCircleOutline />
                        On File
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-600 text-sm">
                        <IoAlertCircleOutline />
                        None
                      </span>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Used to charge host for subscriptions, damage claims, and fees
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <IoAlertCircleOutline className="mx-auto text-4xl text-gray-400 mb-2" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    No Stripe Customer account
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Cannot charge this host
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Subscription Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <IoShieldCheckmarkOutline className="text-purple-600" />
                Subscription
              </h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tier</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded ${
                    bankingData.subscription.tier === 'FLEET_MANAGER'
                      ? 'bg-purple-100 text-purple-700'
                      : bankingData.subscription.tier === 'ENTERPRISE'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {bankingData.subscription.tier}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    bankingData.subscription.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700'
                      : bankingData.subscription.status === 'PAST_DUE'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {bankingData.subscription.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Fee</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${bankingData.subscription.monthlyFee.toFixed(2)}
                  </span>
                </div>

                {bankingData.subscription.nextChargeDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Next Charge</span>
                    <span className="text-xs text-gray-900 dark:text-white">
                      {new Date(bankingData.subscription.nextChargeDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payout Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <IoWalletOutline className="text-purple-600" />
                Payout Configuration
              </h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Schedule</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {bankingData.payout.schedule}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Minimum Amount</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${bankingData.payout.minimumAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Instant Payouts</span>
                  {bankingData.payout.instantEnabled ? (
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                      <IoFlashOutline />
                      Enabled
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">Disabled</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Payouts Status</span>
                  {bankingData.payout.enabled ? (
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                      <IoCheckmarkCircleOutline />
                      Enabled
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600 text-sm">
                      <IoLockClosedOutline />
                      Suspended
                    </span>
                  )}
                </div>

                {!bankingData.payout.enabled && bankingData.payout.disabledReason && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-red-600">
                      Reason: {bankingData.payout.disabledReason}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Total Paid Out</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${bankingData.payout.totalPayouts.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Payout Count</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {bankingData.payout.payoutCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        {bankingData.paymentMethods.length > 0 && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Payment Methods ({bankingData.paymentMethods.length})
              </h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-3">
                {bankingData.paymentMethods.map((method: any) => (
                  <div
                    key={method.id}
                    className={`border rounded-lg p-4 ${
                      method.isDefault
                        ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          method.type === 'bank_account'
                            ? 'bg-blue-100 dark:bg-blue-900/40'
                            : 'bg-purple-100 dark:bg-purple-900/40'
                        }`}>
                          {method.type === 'bank_account' ? (
                            <IoBusinessOutline className="text-blue-600" />
                          ) : (
                            <IoCardOutline className="text-purple-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {method.type === 'bank_account'
                              ? `${method.brand || 'Bank'} ****${method.last4}`
                              : `${method.brand} ****${method.last4}`}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {method.type === 'bank_account'
                              ? `${method.accountType || 'checking'} • ${method.status || 'active'}`
                              : `Expires ${method.expiryMonth}/${method.expiryYear}`}
                          </p>
                        </div>
                      </div>
                      {method.isDefault && (
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Charges */}
        {bankingData.recentCharges.length > 0 && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Charges ({bankingData.recentCharges.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {bankingData.recentCharges.map((charge: any) => (
                    <tr key={charge.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {new Date(charge.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded capitalize">
                          {charge.chargeType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        {charge.reason}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        ${charge.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          charge.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : charge.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {charge.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                        {charge.chargedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Charge Host Modal */}
      {showChargeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Charge Host
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={chargeForm.amount}
                  onChange={(e) => setChargeForm({ ...chargeForm, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Charge Type
                </label>
                <select
                  value={chargeForm.chargeType}
                  onChange={(e) => setChargeForm({ ...chargeForm, chargeType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="subscription">Subscription</option>
                  <option value="damage_claim">Damage Claim</option>
                  <option value="guest_refund">Guest Refund</option>
                  <option value="penalty">Penalty</option>
                  <option value="late_fee">Late Fee</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason *
                </label>
                <textarea
                  value={chargeForm.reason}
                  onChange={(e) => setChargeForm({ ...chargeForm, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  rows={3}
                  placeholder="Describe the reason for this charge..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={chargeForm.notes}
                  onChange={(e) => setChargeForm({ ...chargeForm, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={chargeForm.deductFromBalance}
                  onChange={(e) => setChargeForm({ ...chargeForm, deductFromBalance: e.target.checked })}
                  className="rounded"
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Try deducting from balance first (no fee)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowChargeModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleChargeHost}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Charge Host'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hold/Release Funds Modal */}
      {showHoldModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {holdForm.action === 'hold' ? 'Hold Funds' : 'Release Funds'}
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setHoldForm({ ...holdForm, action: 'hold' })}
                  className={`flex-1 px-4 py-2 rounded-lg ${
                    holdForm.action === 'hold'
                      ? 'bg-orange-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  Hold
                </button>
                <button
                  onClick={() => setHoldForm({ ...holdForm, action: 'release' })}
                  className={`flex-1 px-4 py-2 rounded-lg ${
                    holdForm.action === 'release'
                      ? 'bg-green-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  Release
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={holdForm.amount}
                  onChange={(e) => setHoldForm({ ...holdForm, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  placeholder="0.00"
                />
                {holdForm.action === 'hold' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Available: ${bankingData.balances.current.toFixed(2)}
                  </p>
                )}
                {holdForm.action === 'release' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Currently held: ${bankingData.balances.hold.toFixed(2)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason *
                </label>
                <textarea
                  value={holdForm.reason}
                  onChange={(e) => setHoldForm({ ...holdForm, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  rows={3}
                  placeholder="Explain why you're holding/releasing these funds..."
                />
              </div>

              {holdForm.action === 'hold' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hold Until (optional)
                  </label>
                  <input
                    type="date"
                    value={holdForm.holdUntil}
                    onChange={(e) => setHoldForm({ ...holdForm, holdUntil: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowHoldModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleFundsAction}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-lg text-white disabled:opacity-50 ${
                  holdForm.action === 'hold' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {actionLoading ? 'Processing...' : holdForm.action === 'hold' ? 'Hold Funds' : 'Release Funds'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Force Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Force Immediate Payout
            </h3>
            
            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                This will override the normal payout schedule and send money immediately to the host's bank account.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: ${bankingData.balances.availableForPayout.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason *
                </label>
                <textarea
                  value={payoutForm.reason}
                  onChange={(e) => setPayoutForm({ ...payoutForm, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  rows={3}
                  placeholder="Explain why this payout is being forced..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleForcePayout}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Force Payout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend/Enable Payouts Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {holdForm.action === 'suspend_payouts' ? 'Suspend Payouts' : 'Enable Payouts'}
            </h3>
            
            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {holdForm.action === 'suspend_payouts'
                  ? 'This will block all automatic payouts for this host until manually re-enabled.'
                  : 'This will re-enable automatic payouts for this host.'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason *
                </label>
                <textarea
                  value={holdForm.reason}
                  onChange={(e) => setHoldForm({ ...holdForm, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  rows={3}
                  placeholder={holdForm.action === 'suspend_payouts'
                    ? 'Explain why payouts are being suspended...'
                    : 'Explain why payouts are being re-enabled...'}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowSuspendModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleFundsAction}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-lg text-white disabled:opacity-50 ${
                  holdForm.action === 'suspend_payouts' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {actionLoading ? 'Processing...' : holdForm.action === 'suspend_payouts' ? 'Suspend Payouts' : 'Enable Payouts'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}