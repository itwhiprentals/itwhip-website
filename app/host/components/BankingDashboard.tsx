// app/host/components/BankingDashboard.tsx
'use client'

import { useState, useEffect } from 'react'
import { IoAddOutline, IoWalletOutline, IoCardOutline, IoCheckmarkCircle, IoWarningOutline, IoBusinessOutline, IoInformationCircle } from 'react-icons/io5'
import PaymentMethodCard from './PaymentMethodCard'
import AddBankAccountModal from './AddBankAccountModal'
import AddDebitCardModal from './AddDebitCardModal'

interface BankingStatus {
  hasAccount: boolean
  canSetup: boolean
  approvalStatus: string
  accountId?: string
  payoutsEnabled?: boolean
  requiresAction?: boolean
  onboardingUrl?: string
}

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

export default function BankingDashboard() {
  const [status, setStatus] = useState<BankingStatus | null>(null)
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddBank, setShowAddBank] = useState(false)
  const [showAddCard, setShowAddCard] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadBankingData()
  }, [])

  const loadBankingData = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Check Stripe Connect status
      const statusRes = await fetch('/api/host/banking/connect')
      const statusData = await statusRes.json()
      
      if (!statusRes.ok) {
        throw new Error(statusData.error || 'Failed to load banking status')
      }
      
      setStatus(statusData)

      // If account exists, load payment methods
      if (statusData.hasAccount) {
        const methodsRes = await fetch('/api/host/banking/methods')
        const methodsData = await methodsRes.json()
        
        if (methodsRes.ok) {
          setMethods(methodsData.methods || [])
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleConnectStripe = async () => {
    try {
      const res = await fetch('/api/host/banking/connect', { method: 'POST' })
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create banking account')
      }

      if (data.onboardingUrl) {
        // Redirect to Stripe onboarding
        window.location.href = data.onboardingUrl
      } else {
        // Reload data if account already exists
        loadBankingData()
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteMethod = async (methodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) {
      return
    }

    try {
      const res = await fetch('/api/host/banking/methods', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ methodId })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete payment method')
      }

      // Reload methods
      loadBankingData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleSetDefault = async (methodId: string) => {
    try {
      const res = await fetch('/api/host/banking/set-default', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ methodId })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to set default method')
      }

      // Reload methods
      loadBankingData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 sm:py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Not connected to banking yet
  if (!status?.hasAccount) {
    return (
      <div className="w-full">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 sm:p-6 md:p-8 text-center">
          <IoBusinessOutline className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 dark:text-gray-600 mb-3 sm:mb-4" />
          
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Connect Your Banking to Receive Payouts
          </h3>
          
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 px-2">
            Connect your bank account to receive payouts from ItWhip when your trips are completed.
          </p>

          {status?.canSetup ? (
            <>
              <button
                onClick={handleConnectStripe}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-colors mb-3 sm:mb-4"
              >
                Connect Banking Account
              </button>

              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 space-y-1">
                <p>✓ Secure bank-level encryption</p>
                <p>✓ Quick setup (2-3 minutes)</p>
                <p>✓ Powered by our payment partner</p>
              </div>
            </>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4">
              <IoWarningOutline className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-500 mx-auto mb-2" />
              <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
                Your account must be approved before you can set up banking.
                <br />
                Current status: <strong className="capitalize">{status?.approvalStatus}</strong>
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-3 sm:mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
      </div>
    )
  }

  // Connected but needs to complete onboarding
  if (status.requiresAction) {
    return (
      <div className="w-full">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 sm:p-6">
          <IoWarningOutline className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 dark:text-yellow-500 mb-2 sm:mb-3" />
          
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Complete Your Banking Setup
          </h3>
          
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
            Your banking account needs additional information before you can receive payouts from ItWhip.
          </p>

          <button
            onClick={handleConnectStripe}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-colors"
          >
            Complete Setup
          </button>
        </div>
      </div>
    )
  }

  // Fully connected and active
  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Success Banner */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4">
        <div className="flex items-start sm:items-center space-x-2 sm:space-x-3">
          <IoCheckmarkCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1">
            <p className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-200">
              Banking Connected
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              You can now receive payouts from ItWhip
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods Section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Payment Methods
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
            <button
              onClick={() => setShowAddBank(true)}
              className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors order-1"
            >
              <IoAddOutline className="w-4 h-4" />
              <span>Add Bank</span>
            </button>
            
            <button
              onClick={() => setShowAddCard(true)}
              className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-lg transition-colors order-2"
            >
              <IoCardOutline className="w-4 h-4" />
              <span>Add Card</span>
            </button>
          </div>
        </div>

        {methods.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <IoWalletOutline className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-500">No payment methods added yet</p>
            <p className="text-xs sm:text-sm mt-1 text-gray-400 dark:text-gray-600">
              Add a bank account or debit card to receive payouts
            </p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {methods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                onDelete={handleDeleteMethod}
                onSetDefault={handleSetDefault}
              />
            ))}
          </div>
        )}

        {/* Payout Information */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-start space-x-2">
            <IoInformationCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p>• Payouts processed 48-72 hours after completed booking</p>
              <p>• Funds arrive in 2-3 business days (except holidays)</p>
              <p>• Instant payouts with debit cards (1.5% fee)</p>
              <p>• Minimum payout: $50</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Modals */}
      <AddBankAccountModal
        isOpen={showAddBank}
        onClose={() => setShowAddBank(false)}
        onSuccess={() => {
          setShowAddBank(false)
          loadBankingData()
        }}
      />

      <AddDebitCardModal
        isOpen={showAddCard}
        onClose={() => setShowAddCard(false)}
        onSuccess={() => {
          setShowAddCard(false)
          loadBankingData()
        }}
      />
    </div>
  )
}