// app/fleet/guests/[id]/banking/page.tsx
// Guest Banking Page - Payment methods, charges, refunds, wallet, disputes

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BankingData, TabType, Charge } from './types'
import {
  BankingHeader,
  BankingAlerts,
  BankingTabs,
  OverviewTab,
  PaymentMethodsTab,
  ChargesTab,
  RefundsTab,
  WalletTab,
  DisputesTab,
  WaiveChargeModal,
  AddBonusModal,
  ProcessRefundModal
} from './components'

export default function GuestBankingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [guestId, setGuestId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<BankingData | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Modal states
  const [showBonusModal, setShowBonusModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null)

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params
      setGuestId(resolvedParams.id)
    }
    init()
  }, [params])

  useEffect(() => {
    if (guestId) {
      loadBankingData()
    }
  }, [guestId])

  const loadBankingData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/fleet/guests/${guestId}/banking?key=phoenix-fleet-2847`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to load banking data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChargeNow = async (chargeId: string) => {
    if (!confirm('Charge this amount to the guest\'s card?')) return

    setActionLoading(chargeId)
    try {
      const response = await fetch(`/api/fleet/guests/${guestId}/banking?key=phoenix-fleet-2847`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'charge', chargeId })
      })
      const result = await response.json()
      if (result.success) {
        alert(`Successfully charged $${result.amount?.toFixed(2)}`)
        loadBankingData()
      } else {
        alert(result.error || 'Charge failed')
      }
    } catch (error) {
      alert('Failed to process charge')
    } finally {
      setActionLoading(null)
    }
  }

  const handleWaive = async (chargeId: string, reason: string) => {
    setActionLoading(chargeId)
    try {
      const response = await fetch(`/api/fleet/guests/${guestId}/banking?key=phoenix-fleet-2847`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'waive', chargeId, reason })
      })
      const result = await response.json()
      if (result.success) {
        alert(`Charge waived: $${result.waivedAmount?.toFixed(2)}`)
        loadBankingData()
        setSelectedCharge(null)
      } else {
        alert(result.error || 'Failed to waive')
      }
    } catch (error) {
      alert('Failed to waive charge')
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddBonus = async (amount: number, reason: string) => {
    setActionLoading('bonus')
    try {
      const response = await fetch(`/api/fleet/guests/${guestId}/banking?key=phoenix-fleet-2847`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_bonus', amount, reason })
      })
      const result = await response.json()
      if (result.success) {
        alert(`Bonus added: $${result.amount?.toFixed(2)}. New balance: $${result.newBalance?.toFixed(2)}`)
        loadBankingData()
        setShowBonusModal(false)
      } else {
        alert(result.error || 'Failed to add bonus')
      }
    } catch (error) {
      alert('Failed to add bonus')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRefund = async (bookingId: string, amount: number, reason: string) => {
    setActionLoading('refund')
    try {
      const response = await fetch(`/api/fleet/guests/${guestId}/banking?key=phoenix-fleet-2847`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refund', bookingId, amount, reason })
      })
      const result = await response.json()
      if (result.success) {
        alert(`Refund processed: $${(result.amount || amount).toFixed(2)}`)
        loadBankingData()
        setShowRefundModal(false)
      } else {
        alert(result.error || 'Refund failed')
      }
    } catch (error) {
      alert('Failed to process refund')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDisputeResolution = async (chargeId: string, resolution: string, notes?: string) => {
    setActionLoading(chargeId)
    try {
      const response = await fetch(`/api/fleet/guests/${guestId}/banking/disputes?key=phoenix-fleet-2847`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chargeId, resolution, notes })
      })
      const result = await response.json()
      if (result.success) {
        alert(`Dispute resolved: ${result.resolution}`)
        loadBankingData()
      } else {
        alert(result.error || 'Failed to resolve dispute')
      }
    } catch (error) {
      alert('Failed to resolve dispute')
    } finally {
      setActionLoading(null)
    }
  }

  const handleBack = () => {
    router.push(`/fleet/guests/${guestId}?key=phoenix-fleet-2847`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading banking data...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Failed to load banking data</p>
          <Link href="/fleet/guests?key=phoenix-fleet-2847" className="text-purple-600 hover:text-purple-700">
            Back to Guests
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
        <BankingHeader data={data} guestId={guestId} onBack={handleBack} />

        <BankingAlerts data={data} onTabChange={setActiveTab} />

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <BankingTabs data={data} activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="p-4 sm:p-6">
            {activeTab === 'overview' && <OverviewTab data={data} />}

            {activeTab === 'payment-methods' && <PaymentMethodsTab data={data} />}

            {activeTab === 'charges' && (
              <ChargesTab
                data={data}
                actionLoading={actionLoading}
                onChargeNow={handleChargeNow}
                onWaiveCharge={setSelectedCharge}
              />
            )}

            {activeTab === 'refunds' && (
              <RefundsTab data={data} onProcessRefund={() => setShowRefundModal(true)} />
            )}

            {activeTab === 'wallet' && (
              <WalletTab data={data} onAddBonus={() => setShowBonusModal(true)} />
            )}

            {activeTab === 'disputes' && (
              <DisputesTab
                data={data}
                actionLoading={actionLoading}
                onResolveDispute={handleDisputeResolution}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedCharge && (
        <WaiveChargeModal
          charge={selectedCharge}
          actionLoading={actionLoading === selectedCharge.id}
          onWaive={handleWaive}
          onClose={() => setSelectedCharge(null)}
        />
      )}

      {showBonusModal && (
        <AddBonusModal
          actionLoading={actionLoading === 'bonus'}
          onAddBonus={handleAddBonus}
          onClose={() => setShowBonusModal(false)}
        />
      )}

      {showRefundModal && (
        <ProcessRefundModal
          activeBookings={data.activeBookings}
          actionLoading={actionLoading === 'refund'}
          onRefund={handleRefund}
          onClose={() => setShowRefundModal(false)}
        />
      )}
    </div>
  )
}
