// app/fleet/hosts/[id]/banking/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { IoAlertCircleOutline } from 'react-icons/io5'
import {
  BankingData,
  ChargeFormData,
  HoldFormData,
  PayoutFormData
} from './types'
import {
  HostBankingHeader,
  AlertMessages,
  BalanceCards,
  QuickActions,
  StripeConnectCard,
  StripeCustomerCard,
  PayoutConfigCard,
  PaymentMethodsList,
  RecentChargesTable,
  ChargeHostModal,
  HoldFundsModal,
  ForcePayoutModal,
  SuspendPayoutsModal,
  PendingRecoveryCard,
  NoPayoutMethodAlert
} from './components'

export default function HostBankingPage({ params }: { params: Promise<{ id: string }> }) {
  const [bankingData, setBankingData] = useState<BankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Modal states
  const [showChargeModal, setShowChargeModal] = useState(false)
  const [showHoldModal, setShowHoldModal] = useState(false)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)

  // Form states
  const [chargeForm, setChargeForm] = useState<ChargeFormData>({
    amount: '',
    chargeType: 'subscription',
    reason: '',
    notes: '',
    deductFromBalance: true
  })

  const [holdForm, setHoldForm] = useState<HoldFormData>({
    action: 'hold',
    amount: '',
    reason: '',
    notes: '',
    holdUntil: ''
  })

  const [payoutForm, setPayoutForm] = useState<PayoutFormData>({
    amount: '',
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
          chargedBy: 'admin@itwhip.com',
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
          adminEmail: 'admin@itwhip.com',
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
          adminEmail: 'admin@itwhip.com'
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

  const handleOpenChargeModal = () => setShowChargeModal(true)

  const handleOpenHoldModal = () => {
    setHoldForm({ ...holdForm, action: 'hold' })
    setShowHoldModal(true)
  }

  const handleOpenPayoutModal = () => setShowPayoutModal(true)

  const handleOpenSuspendModal = () => {
    if (bankingData) {
      setHoldForm({ ...holdForm, action: bankingData.payout.enabled ? 'suspend_payouts' : 'enable_payouts' })
      setShowSuspendModal(true)
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
        <HostBankingHeader
          data={bankingData}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />

        <AlertMessages
          success={actionSuccess}
          error={actionError}
          onDismissSuccess={() => setActionSuccess(null)}
          onDismissError={() => setActionError(null)}
        />

        <BalanceCards balances={bankingData.balances} />

        {/* Pending Claims Recovery Card */}
        {bankingData.pendingClaims && bankingData.pendingClaims.length > 0 && (
          <div className="mb-6">
            <PendingRecoveryCard
              pendingRecovery={bankingData.balances.pendingRecovery || 0}
              pendingClaimsCount={bankingData.balances.pendingClaimsCount || 0}
              pendingClaims={bankingData.pendingClaims}
              onViewClaim={(claimId) => window.open(`/fleet/claims/${claimId}`, '_blank')}
            />
          </div>
        )}

        {/* No Payout Method Alert */}
        {bankingData.stripeConnect.accountId &&
         !bankingData.stripeConnect.payoutsEnabled && (
          <div className="mb-6">
            <NoPayoutMethodAlert
              hostName={bankingData.host.name}
              hasPendingBalance={bankingData.balances.current > 0}
              pendingAmount={bankingData.balances.current}
            />
          </div>
        )}

        <QuickActions
          data={bankingData}
          onChargeHost={handleOpenChargeModal}
          onHoldFunds={handleOpenHoldModal}
          onForcePayout={handleOpenPayoutModal}
          onTogglePayouts={handleOpenSuspendModal}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StripeConnectCard stripeConnect={bankingData.stripeConnect} />
          <StripeCustomerCard stripeCustomer={bankingData.stripeCustomer} />
          <PayoutConfigCard payout={bankingData.payout} earnings={bankingData.earnings} />
        </div>

        <PaymentMethodsList
          paymentMethods={bankingData.paymentMethods}
          hasStripeConnect={!!bankingData.stripeConnect.accountId}
          hasStripeCustomer={!!bankingData.stripeCustomer.customerId}
        />
        <RecentChargesTable recentCharges={bankingData.recentCharges} />
      </div>

      {/* Modals */}
      <ChargeHostModal
        isOpen={showChargeModal}
        onClose={() => setShowChargeModal(false)}
        chargeForm={chargeForm}
        setChargeForm={setChargeForm}
        onSubmit={handleChargeHost}
        loading={actionLoading}
      />

      <HoldFundsModal
        isOpen={showHoldModal}
        onClose={() => setShowHoldModal(false)}
        holdForm={holdForm}
        setHoldForm={setHoldForm}
        onSubmit={handleFundsAction}
        loading={actionLoading}
        currentBalance={bankingData.balances.current}
        holdBalance={bankingData.balances.hold}
      />

      <ForcePayoutModal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        payoutForm={payoutForm}
        setPayoutForm={setPayoutForm}
        onSubmit={handleForcePayout}
        loading={actionLoading}
        availableForPayout={bankingData.balances.availableForPayout}
      />

      <SuspendPayoutsModal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        holdForm={holdForm}
        setHoldForm={setHoldForm}
        onSubmit={handleFundsAction}
        loading={actionLoading}
      />
    </div>
  )
}
