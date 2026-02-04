'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface AlertSettings {
  // Email Settings
  alertEmailsEnabled: boolean
  alertEmailRecipients: string[]
  emailDigestEnabled: boolean
  emailDigestFrequency: 'instant' | 'hourly' | 'daily' | 'weekly'

  // Partner Thresholds
  partnerPendingDaysWarning: number
  suspendedPartnersAlert: boolean

  // Vehicle Thresholds
  pendingVehiclesAlert: boolean
  changesRequestedAlert: boolean

  // Booking Thresholds
  highCancellationThreshold: number
  bookingsStartingTodayAlert: boolean

  // Document Thresholds
  documentExpiryWarningDays: number
  documentExpiryUrgentDays: number
  expiredDocumentsAlert: boolean
  pendingDocumentsAlert: boolean

  // Financial Thresholds
  negativeBalanceAlert: boolean
  failedPayoutsAlert: boolean
  pendingRefundThreshold: number
  pendingRefundsAlert: boolean

  // Claim Thresholds
  openClaimsAlert: boolean

  // Review Thresholds
  lowRatingThreshold: number
  lowRatingsAlert: boolean

  // Security Thresholds
  securityEventsAlert: boolean
  criticalSecurityThreshold: number

  // Performance Thresholds
  slowResponseThreshold: number
  criticalResponseThreshold: number

  // Metadata
  lastEmailSentAt: string | null
  lastDigestSentAt: string | null
  updatedAt: string
}

interface CommissionTier {
  name: string
  minVehicles: number
  maxVehicles: number | null
  rate: number
  hostKeeps: number
}

interface PlatformSettings {
  global: {
    defaultTaxRate: number
    taxByState: Record<string, number>
    taxByCityOverride: Record<string, number>
    serviceFeeRate: number
    minorDamageMax: number
    moderateDamageMax: number
    majorDamageMin: number
  }
  commissionTiers: {
    defaultCommissionRate: number
    tier1VehicleThreshold: number
    tier1CommissionRate: number
    tier2VehicleThreshold: number
    tier2CommissionRate: number
    tier3VehicleThreshold: number
    tier3CommissionRate: number
    tiers: CommissionTier[]
  }
  processingFees: {
    processingFeePercent: number
    processingFeeFixed: number
    insurancePlatformShare: number
  }
  host: {
    standardPayoutDelay: number
    newHostPayoutDelay: number
    minimumPayout: number
    instantPayoutFee: number
  }
  partner: {
    platformCommission: number
    partnerMinCommission: number
    partnerMaxCommission: number
  }
  guest: {
    guestSignupBonus: number
    guestReferralBonus: number
    fullRefundHours: number
    partialRefund75Hours: number
    partialRefund50Hours: number
    noRefundHours: number
    bonusExpirationDays: number
  }
  insurance: {
    basicInsuranceDaily: number
    premiumInsuranceDaily: number
    insuranceRequiredUnder25: boolean
    insuranceDiscountPct: number
  }
  deposits: {
    defaultDepositPercent: number
    minDeposit: number
    maxDeposit: number
    luxuryDeposit: number
    exoticDeposit: number
  }
  tripCharges: {
    mileageOverageRate: number
    dailyIncludedMiles: number
    fuelRefillRateQuarter: number
    fuelRefillRateFull: number
    lateReturnGraceMinutes: number
    pickupGraceMinutes: number
    lateReturnHourlyRate: number
    lateReturnDailyMax: number
    cleaningFeeStandard: number
    cleaningFeeDeep: number
    cleaningFeeBiohazard: number
    noShowFee: number
    smokingFee: number
    petHairFee: number
    lostKeyFee: number
  }
  referrals: {
    hostSignupBonus: number
    hostReferralBonus: number
    referralBonus: number
  }
  meta: {
    updatedAt: string
    updatedBy: string
  }
}

type TabKey = 'global' | 'commissionTiers' | 'processingFees' | 'taxes' | 'host' | 'partner' | 'guest' | 'insurance' | 'deposits' | 'tripCharges' | 'alerts'

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'global', label: 'Global', icon: 'G' },
  { key: 'commissionTiers', label: 'Commission', icon: '%' },
  { key: 'processingFees', label: 'Fees', icon: 'F' },
  { key: 'taxes', label: 'Taxes', icon: 'T' },
  { key: 'host', label: 'Host', icon: 'H' },
  { key: 'partner', label: 'Partner', icon: 'P' },
  { key: 'guest', label: 'Guest', icon: 'U' },
  { key: 'insurance', label: 'Insurance', icon: 'I' },
  { key: 'deposits', label: 'Deposits', icon: 'D' },
  { key: 'tripCharges', label: 'Trip Charges', icon: '$' },
  { key: 'alerts', label: 'Alerts', icon: '🔔' }
]

const US_STATES = [
  'AZ', 'CA', 'CO', 'FL', 'GA', 'IL', 'NY', 'NV', 'TX', 'WA'
]

export default function FleetSettingsPage() {
  const searchParams = useSearchParams()
  const apiKey = searchParams.get('key') || ''

  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [alertSettings, setAlertSettings] = useState<AlertSettings | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('global')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({})
  const [pendingAlertChanges, setPendingAlertChanges] = useState<Record<string, any>>({})
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [sendingAlerts, setSendingAlerts] = useState(false)
  const [newEmailInput, setNewEmailInput] = useState('')

  // Tax modal state
  const [showTaxModal, setShowTaxModal] = useState(false)
  const [taxModalData, setTaxModalData] = useState({ action: 'set_state', state: '', city: '', rate: '' })

  useEffect(() => {
    fetchSettings()
    fetchAlertSettings()
  }, [apiKey])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/fleet/settings?key=${apiKey}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch settings')
      }

      setSettings(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchAlertSettings = async () => {
    try {
      const response = await fetch(`/api/fleet/alert-settings?key=${apiKey}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setAlertSettings(data.settings)
      }
    } catch (err) {
      console.error('Failed to fetch alert settings:', err)
    }
  }

  const handleAlertChange = (field: string, value: any) => {
    setPendingAlertChanges(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveAlertSettings = async () => {
    if (Object.keys(pendingAlertChanges).length === 0) return

    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch(`/api/fleet/alert-settings?key=${apiKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingAlertChanges)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save alert settings')
      }

      setSuccessMessage(`Updated ${Object.keys(pendingAlertChanges).length} alert setting(s)`)
      setPendingAlertChanges({})
      fetchAlertSettings()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAddEmail = () => {
    if (!newEmailInput.trim()) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmailInput)) {
      setError('Invalid email format')
      return
    }

    const currentEmails = pendingAlertChanges.alertEmailRecipients || alertSettings?.alertEmailRecipients || []
    if (currentEmails.includes(newEmailInput)) {
      setError('Email already added')
      return
    }

    handleAlertChange('alertEmailRecipients', [...currentEmails, newEmailInput])
    setNewEmailInput('')
    setError(null)
  }

  const handleRemoveEmail = (email: string) => {
    const currentEmails = pendingAlertChanges.alertEmailRecipients || alertSettings?.alertEmailRecipients || []
    handleAlertChange('alertEmailRecipients', currentEmails.filter((e: string) => e !== email))
  }

  const handleSendTestAlert = async () => {
    setSendingAlerts(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch(`/api/fleet/alerts/send?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceSend: true })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send alert')
      }

      setSuccessMessage(data.message || 'Alert sent successfully')
      fetchAlertSettings()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSendingAlerts(false)
    }
  }

  const handleChange = (field: string, value: string | number | boolean) => {
    setPendingChanges(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || value : value
    }))
  }

  const handleSave = async () => {
    if (Object.keys(pendingChanges).length === 0) return

    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch(`/api/fleet/settings?key=${apiKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: pendingChanges,
          updatedBy: 'FLEET_ADMIN'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings')
      }

      setSuccessMessage(`Updated ${Object.keys(pendingChanges).length} setting(s)`)
      setPendingChanges({})
      fetchSettings()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleTaxUpdate = async () => {
    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/fleet/settings/taxes?key=${apiKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: taxModalData.action,
          state: taxModalData.state,
          city: taxModalData.city,
          rate: parseFloat(taxModalData.rate) / 100
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update tax')
      }

      setSuccessMessage(data.message)
      setShowTaxModal(false)
      setTaxModalData({ action: 'set_state', state: '', city: '', rate: '' })
      fetchSettings()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTaxRate = async (type: 'state' | 'city', key: string) => {
    setSaving(true)
    setError(null)

    try {
      let action, state, city
      if (type === 'state') {
        action = 'remove_state'
        state = key
      } else {
        action = 'remove_city'
        // Parse "City,STATE" format
        const parts = key.split(',')
        city = parts[0]
        state = parts[1]
      }

      const response = await fetch(`/api/fleet/settings/taxes?key=${apiKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, state, city })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete tax rate')
      }

      setSuccessMessage(data.message)
      fetchSettings()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto text-center py-12">
          <p className="text-red-600 dark:text-red-400">{error || 'Failed to load settings'}</p>
          <button
            onClick={fetchSettings}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Platform Settings
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Configure global pricing, taxes, commissions, and policies
              </p>
            </div>
            <Link
              href="/fleet"
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              Back to Fleet
            </Link>
          </div>

          {settings.meta?.updatedAt && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Last updated: {new Date(settings.meta.updatedAt).toLocaleString()} by {settings.meta.updatedBy || 'System'}
            </p>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 rounded-lg">
            <p className="text-green-700 dark:text-green-300">{successMessage}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-4 overflow-x-auto pb-2">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">

          {/* Global Tab */}
          {activeTab === 'global' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Global Settings</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Platform-wide fees for Arizona operations</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Service Fee Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    defaultValue={((settings.global?.serviceFeeRate || 0.15) * 100).toFixed(1)}
                    onChange={(e) => handleChange('serviceFeeRate', parseFloat(e.target.value) / 100)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Fee charged to guests on top of rental (15%)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Guest Deposit Discount (%)
                  </label>
                  <input
                    type="number"
                    step="1"
                    defaultValue={((settings.insurance?.insuranceDiscountPct || 0.50) * 100).toFixed(0)}
                    onChange={(e) => handleChange('insuranceDiscountPct', parseFloat(e.target.value) / 100)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Deposit discount when guest has their own insurance (50%)</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mt-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Commission Structure</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Configure commission tiers in the <strong>Commission</strong> tab.
                </p>
              </div>
            </div>
          )}

          {/* Commission Tiers Tab */}
          {activeTab === 'commissionTiers' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Commission Tiers</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Platform commission based on host fleet size. Larger fleets get lower commission rates.
                </p>
              </div>

              {/* Tier Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(settings.commissionTiers?.tiers || []).map((tier, idx) => (
                  <div
                    key={tier.name}
                    className={`p-4 rounded-lg border ${
                      idx === 0 ? 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600' :
                      idx === 1 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700' :
                      idx === 2 ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700' :
                      'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                    }`}
                  >
                    <h3 className={`font-bold text-lg ${
                      idx === 0 ? 'text-gray-800 dark:text-gray-200' :
                      idx === 1 ? 'text-yellow-800 dark:text-yellow-200' :
                      idx === 2 ? 'text-purple-800 dark:text-purple-200' :
                      'text-blue-800 dark:text-blue-200'
                    }`}>
                      {tier.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {tier.minVehicles}{tier.maxVehicles ? `-${tier.maxVehicles}` : '+'} vehicles
                    </p>
                    <div className="mt-3 space-y-1">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(tier.rate * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Platform takes</p>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                        Host keeps {(tier.hostKeeps * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Editable Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Edit Tier Thresholds</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Standard Rate (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      defaultValue={((settings.commissionTiers?.defaultCommissionRate || 0.25) * 100).toFixed(0)}
                      onChange={(e) => handleChange('defaultCommissionRate', parseFloat(e.target.value) / 100)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">0-9 vehicles</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Gold Threshold
                    </label>
                    <input
                      type="number"
                      defaultValue={settings.commissionTiers?.tier1VehicleThreshold || 10}
                      onChange={(e) => handleChange('tier1VehicleThreshold', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Min vehicles for Gold</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Gold Rate (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      defaultValue={((settings.commissionTiers?.tier1CommissionRate || 0.20) * 100).toFixed(0)}
                      onChange={(e) => handleChange('tier1CommissionRate', parseFloat(e.target.value) / 100)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Platinum Threshold
                    </label>
                    <input
                      type="number"
                      defaultValue={settings.commissionTiers?.tier2VehicleThreshold || 50}
                      onChange={(e) => handleChange('tier2VehicleThreshold', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Min vehicles for Platinum</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Platinum Rate (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      defaultValue={((settings.commissionTiers?.tier2CommissionRate || 0.15) * 100).toFixed(0)}
                      onChange={(e) => handleChange('tier2CommissionRate', parseFloat(e.target.value) / 100)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Diamond Threshold
                    </label>
                    <input
                      type="number"
                      defaultValue={settings.commissionTiers?.tier3VehicleThreshold || 100}
                      onChange={(e) => handleChange('tier3VehicleThreshold', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Min vehicles for Diamond</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Diamond Rate (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      defaultValue={((settings.commissionTiers?.tier3CommissionRate || 0.10) * 100).toFixed(0)}
                      onChange={(e) => handleChange('tier3CommissionRate', parseFloat(e.target.value) / 100)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Example Calculation */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Example: $500 Rental (Standard Tier)</h4>
                <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <p>Host Gross: $500.00</p>
                  <p>Platform Fee (25%): -$125.00</p>
                  <p>Processing Fee: -$1.50</p>
                  <p className="font-bold">Host Net Payout: $373.50</p>
                </div>
              </div>
            </div>
          )}

          {/* Processing Fees Tab */}
          {activeTab === 'processingFees' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Processing Fees</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Fees charged for payment processing and insurance revenue sharing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Payout Processing</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Processing Fee (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        defaultValue={((settings.processingFees?.processingFeePercent || 0.035) * 100).toFixed(1)}
                        onChange={(e) => handleChange('processingFeePercent', parseFloat(e.target.value) / 100)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">Stripe fee percentage (3.5%)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fixed Processing Fee ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={(settings.processingFees?.processingFeeFixed || 1.50).toFixed(2)}
                        onChange={(e) => handleChange('processingFeeFixed', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">Fixed fee per payout ($1.50)</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Insurance Revenue</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Platform Insurance Share (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      defaultValue={((settings.processingFees?.insurancePlatformShare || 0.30) * 100).toFixed(0)}
                      onChange={(e) => handleChange('insurancePlatformShare', parseFloat(e.target.value) / 100)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Platform keeps this % of insurance fees (30%)</p>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Basic:</strong> ${settings.insurance?.basicInsuranceDaily || 15}/day<br/>
                      <strong>Premium:</strong> ${settings.insurance?.premiumInsuranceDaily || 25}/day
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Fee Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Guest Service Fee</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {((settings.global?.serviceFeeRate || 0.15) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Processing %</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {((settings.processingFees?.processingFeePercent || 0.035) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Fixed Fee</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${(settings.processingFees?.processingFeeFixed || 1.50).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Insurance Share</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {((settings.processingFees?.insurancePlatformShare || 0.30) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Breakdown Example */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Platform Revenue Example: $500 Rental + $75 Insurance (5 days)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700 dark:text-blue-300">
                  <div>
                    <p className="font-semibold mb-1">Guest Service Fee</p>
                    <p>$500 × 15% = $75.00</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Host Commission (25%)</p>
                    <p>$500 × 25% = $125.00</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Insurance Share (30%)</p>
                    <p>$75 × 30% = $22.50</p>
                  </div>
                </div>
                <p className="mt-3 font-bold text-blue-800 dark:text-blue-200">
                  Total Platform Revenue: $222.50
                </p>
              </div>
            </div>
          )}

          {/* Taxes Tab */}
          {activeTab === 'taxes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tax Configuration</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Arizona-based operations (P2P exempt from county surcharges)</p>
                </div>
                <button
                  onClick={() => setShowTaxModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Add Tax Rate
                </button>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Currently operating in Arizona.</strong> All Arizona city TPT rates are pre-configured.
                  Tax calculation: City rate → State rate (5.6%) → Default rate.
                </p>
              </div>

              <h3 className="text-md font-semibold text-gray-900 dark:text-white mt-6">State Tax Rates</h3>
              {Object.keys(settings.global?.taxByState || {}).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(settings.global?.taxByState || {}).map(([state, rate]) => (
                    <div key={state} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">{state}</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">{(Number(rate) * 100).toFixed(2)}%</span>
                        {state === 'AZ' && <span className="ml-2 text-xs text-green-600 dark:text-green-400">(Active)</span>}
                      </div>
                      <button
                        onClick={() => handleDeleteTaxRate('state', state)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No state-specific rates configured.</p>
              )}

              <h3 className="text-md font-semibold text-gray-900 dark:text-white mt-6">
                City Tax Rates ({Object.keys(settings.global?.taxByCityOverride || {}).length} cities)
              </h3>
              {Object.keys(settings.global?.taxByCityOverride || {}).length > 0 ? (
                <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">City</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">State</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Rate</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {Object.entries(settings.global?.taxByCityOverride || {})
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([cityKey, rate]) => {
                          const [city, state] = cityKey.split(',')
                          return (
                            <tr key={cityKey}>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{city}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{state}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{(Number(rate) * 100).toFixed(2)}%</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => handleDeleteTaxRate('city', cityKey)}
                                  className="text-red-600 hover:text-red-800 dark:text-red-400 text-sm"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No city-specific rates configured.</p>
              )}
            </div>
          )}

          {/* Host Tab */}
          {activeTab === 'host' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Host Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Standard Payout Delay (days)</label>
                  <input
                    type="number"
                    defaultValue={settings.host?.standardPayoutDelay || 3}
                    onChange={(e) => handleChange('standardPayoutDelay', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Host Payout Delay (days)</label>
                  <input
                    type="number"
                    defaultValue={settings.host?.newHostPayoutDelay || 7}
                    onChange={(e) => handleChange('newHostPayoutDelay', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Minimum Payout ($)</label>
                  <input
                    type="number"
                    defaultValue={settings.host?.minimumPayout || 50}
                    onChange={(e) => handleChange('minimumPayout', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instant Payout Fee (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    defaultValue={((settings.host?.instantPayoutFee || 0.015) * 100).toFixed(1)}
                    onChange={(e) => handleChange('instantPayoutFee', parseFloat(e.target.value) / 100)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Partner Tab */}
          {activeTab === 'partner' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Partner Commission Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform Commission (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    defaultValue={((settings.partner?.platformCommission || 0.20) * 100).toFixed(1)}
                    onChange={(e) => handleChange('platformCommission', parseFloat(e.target.value) / 100)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Platform's base fee from rentals</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Partner Min Commission (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    defaultValue={((settings.partner?.partnerMinCommission || 0.05) * 100).toFixed(1)}
                    onChange={(e) => handleChange('partnerMinCommission', parseFloat(e.target.value) / 100)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Partner Max Commission (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    defaultValue={((settings.partner?.partnerMaxCommission || 0.50) * 100).toFixed(1)}
                    onChange={(e) => handleChange('partnerMaxCommission', parseFloat(e.target.value) / 100)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Guest Tab */}
          {activeTab === 'guest' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Guest Settings</h2>

              <h3 className="text-md font-semibold text-gray-900 dark:text-white">Bonuses & Referrals</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guest Signup Bonus ($)</label>
                  <input
                    type="number"
                    defaultValue={settings.guest?.guestSignupBonus || 0}
                    onChange={(e) => handleChange('guestSignupBonus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guest Referral Bonus ($)</label>
                  <input
                    type="number"
                    defaultValue={settings.guest?.guestReferralBonus || 0}
                    onChange={(e) => handleChange('guestReferralBonus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bonus Expiration (days)</label>
                  <input
                    type="number"
                    defaultValue={settings.guest?.bonusExpirationDays || 90}
                    onChange={(e) => handleChange('bonusExpirationDays', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <h3 className="text-md font-semibold text-gray-900 dark:text-white">Cancellation Policy</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">100% Refund (hours before)</label>
                  <input
                    type="number"
                    defaultValue={settings.guest?.fullRefundHours || 72}
                    onChange={(e) => handleChange('fullRefundHours', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">75% Refund (hours before)</label>
                  <input
                    type="number"
                    defaultValue={settings.guest?.partialRefund75Hours || 24}
                    onChange={(e) => handleChange('partialRefund75Hours', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">50% Refund (hours before)</label>
                  <input
                    type="number"
                    defaultValue={settings.guest?.partialRefund50Hours || 12}
                    onChange={(e) => handleChange('partialRefund50Hours', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No Refund (hours before)</label>
                  <input
                    type="number"
                    defaultValue={settings.guest?.noRefundHours || 12}
                    onChange={(e) => handleChange('noRefundHours', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Insurance Tab */}
          {activeTab === 'insurance' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Insurance & Claims Settings</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configure platform insurance options, host earnings tiers, and claims workflow</p>
              </div>

              {/* Host Earnings Tiers (Read-only info) */}
              <div className="p-4 bg-gradient-to-r from-amber-50 to-emerald-50 dark:from-amber-900/20 dark:to-emerald-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Host Earnings Tiers (Based on Insurance)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-300">
                    <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">40%</div>
                    <div className="font-semibold text-gray-900 dark:text-white">Platform Insurance</div>
                    <p className="text-xs text-gray-500 mt-1">Host uses platform-provided insurance. We handle claims.</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-amber-400">
                    <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">75%</div>
                    <div className="font-semibold text-gray-900 dark:text-white">P2P Insurance</div>
                    <p className="text-xs text-gray-500 mt-1">Host has peer-to-peer coverage. Their policy is primary.</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-emerald-500">
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">90%</div>
                    <div className="font-semibold text-gray-900 dark:text-white">Commercial Insurance</div>
                    <p className="text-xs text-gray-500 mt-1">Host has commercial policy. Priority claims processing.</p>
                  </div>
                </div>
              </div>

              {/* Platform Insurance for Guests */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Platform Insurance (For Guests)</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Guests can purchase insurance add-ons when booking</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Basic Insurance ($/day)</label>
                    <input
                      type="number"
                      defaultValue={settings.insurance?.basicInsuranceDaily || 15}
                      onChange={(e) => handleChange('basicInsuranceDaily', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Covers minor damage up to ${settings.global?.minorDamageMax || 250}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Premium Insurance ($/day)</label>
                    <input
                      type="number"
                      defaultValue={settings.insurance?.premiumInsuranceDaily || 25}
                      onChange={(e) => handleChange('premiumInsuranceDaily', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Full coverage including liability, $0 deductible</p>
                  </div>
                </div>
              </div>

              {/* Guest Insurance Rules */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Guest Insurance Rules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deposit Discount with Own Insurance (%)</label>
                    <input
                      type="number"
                      step="1"
                      defaultValue={((settings.insurance?.insuranceDiscountPct || 0.50) * 100).toFixed(0)}
                      onChange={(e) => handleChange('insuranceDiscountPct', parseFloat(e.target.value) / 100)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Guests bringing their own insurance get reduced deposit</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Require Insurance Under 25</label>
                    <select
                      defaultValue={settings.insurance?.insuranceRequiredUnder25 !== false ? 'true' : 'false'}
                      onChange={(e) => handleChange('insuranceRequiredUnder25', e.target.value === 'true')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="true">Yes - Must purchase insurance</option>
                      <option value="false">No - Optional</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Claims Workflow */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Claims Workflow</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">How the system processes damage claims</p>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">1</div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Trip Ends - Issue Detected</div>
                        <p className="text-sm text-gray-500">Host/Guest reports damage via app. Photos captured automatically. TripIssue record created.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-sm shrink-0">2</div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Severity Assessment</div>
                        <p className="text-sm text-gray-500">
                          <strong>Minor</strong> (≤${settings.global?.minorDamageMax || 250}): Charged to guest deposit.
                          <strong>Moderate</strong> (≤${settings.global?.moderateDamageMax || 500}): Review required.
                          <strong>Major</strong> (≥${settings.global?.majorDamageMin || 1000}): Full claim filed.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm shrink-0">3</div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Insurance Determination</div>
                        <p className="text-sm text-gray-500">
                          <strong>Host at 40% tier:</strong> Platform insurance handles claim.
                          <strong>Host at 75%/90%:</strong> Claim goes to host&apos;s insurer first, platform as backup.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-sm shrink-0">4</div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Claim Resolution</div>
                        <p className="text-sm text-gray-500">
                          Guest deposit released/charged. If claim exceeds deposit, remainder charged to guest payment method or sent to collections.
                          Vehicle deactivated until repairs confirmed.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm shrink-0">5</div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Payout Adjustment</div>
                        <p className="text-sm text-gray-500">
                          Host payout held until claim resolved. If host at fault, earnings reduced. If guest at fault, host receives full earnings + damage compensation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Damage Thresholds */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Damage Thresholds</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Determines claim severity and processing route</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Minor Damage Max ($)</label>
                    <input
                      type="number"
                      defaultValue={settings.global?.minorDamageMax || 250}
                      onChange={(e) => handleChange('minorDamageMax', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-charged to deposit</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Moderate Damage Max ($)</label>
                    <input
                      type="number"
                      defaultValue={settings.global?.moderateDamageMax || 500}
                      onChange={(e) => handleChange('moderateDamageMax', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Requires Fleet review</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Major Damage Min ($)</label>
                    <input
                      type="number"
                      defaultValue={settings.global?.majorDamageMin || 1000}
                      onChange={(e) => handleChange('majorDamageMin', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Full insurance claim filed</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Deposits Tab */}
          {activeTab === 'deposits' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Deposit Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Deposit (%)</label>
                  <input
                    type="number"
                    step="1"
                    defaultValue={((settings.deposits?.defaultDepositPercent || 0.25) * 100).toFixed(0)}
                    onChange={(e) => handleChange('defaultDepositPercent', parseFloat(e.target.value) / 100)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Minimum Deposit ($)</label>
                  <input
                    type="number"
                    defaultValue={settings.deposits?.minDeposit || 200}
                    onChange={(e) => handleChange('minDeposit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maximum Deposit ($)</label>
                  <input
                    type="number"
                    defaultValue={settings.deposits?.maxDeposit || 2500}
                    onChange={(e) => handleChange('maxDeposit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Luxury Deposit ($)</label>
                  <input
                    type="number"
                    defaultValue={settings.deposits?.luxuryDeposit || 1000}
                    onChange={(e) => handleChange('luxuryDeposit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">For luxury vehicles</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exotic Deposit ($)</label>
                  <input
                    type="number"
                    defaultValue={settings.deposits?.exoticDeposit || 2500}
                    onChange={(e) => handleChange('exoticDeposit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">For exotic vehicles</p>
                </div>
              </div>
            </div>
          )}

          {/* Trip Charges Tab */}
          {activeTab === 'tripCharges' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trip Charge Rates</h2>

              <h3 className="text-md font-semibold text-gray-900 dark:text-white">Mileage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Daily Included Miles</label>
                  <input
                    type="number"
                    defaultValue={settings.tripCharges?.dailyIncludedMiles || 200}
                    onChange={(e) => handleChange('dailyIncludedMiles', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Overage Rate ($/mile)</label>
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={settings.tripCharges?.mileageOverageRate || 0.45}
                    onChange={(e) => handleChange('mileageOverageRate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <h3 className="text-md font-semibold text-gray-900 dark:text-white">Fuel</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quarter Tank ($)</label>
                  <input
                    type="number"
                    defaultValue={settings.tripCharges?.fuelRefillRateQuarter || 75}
                    onChange={(e) => handleChange('fuelRefillRateQuarter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Tank ($)</label>
                  <input
                    type="number"
                    defaultValue={settings.tripCharges?.fuelRefillRateFull || 300}
                    onChange={(e) => handleChange('fuelRefillRateFull', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <h3 className="text-md font-semibold text-gray-900 dark:text-white">Late Fees</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grace Period (min)</label>
                  <input
                    type="number"
                    defaultValue={settings.tripCharges?.lateReturnGraceMinutes || 30}
                    onChange={(e) => handleChange('lateReturnGraceMinutes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hourly Rate ($)</label>
                  <input
                    type="number"
                    defaultValue={settings.tripCharges?.lateReturnHourlyRate || 50}
                    onChange={(e) => handleChange('lateReturnHourlyRate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Daily Max ($)</label>
                  <input
                    type="number"
                    defaultValue={settings.tripCharges?.lateReturnDailyMax || 300}
                    onChange={(e) => handleChange('lateReturnDailyMax', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <h3 className="text-md font-semibold text-gray-900 dark:text-white">Cleaning Fees</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Standard ($)</label>
                  <input
                    type="number"
                    defaultValue={settings.tripCharges?.cleaningFeeStandard || 50}
                    onChange={(e) => handleChange('cleaningFeeStandard', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deep ($)</label>
                  <input
                    type="number"
                    defaultValue={settings.tripCharges?.cleaningFeeDeep || 150}
                    onChange={(e) => handleChange('cleaningFeeDeep', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Biohazard ($)</label>
                  <input
                    type="number"
                    defaultValue={settings.tripCharges?.cleaningFeeBiohazard || 500}
                    onChange={(e) => handleChange('cleaningFeeBiohazard', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <h3 className="text-md font-semibold text-gray-900 dark:text-white">Other Fees</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No-Show ($)</label>
                  <input
                    type="number"
                    defaultValue={settings.tripCharges?.noShowFee || 50}
                    onChange={(e) => handleChange('noShowFee', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Smoking ($)</label>
                  <input
                    type="number"
                    defaultValue={settings.tripCharges?.smokingFee || 250}
                    onChange={(e) => handleChange('smokingFee', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pet Hair ($)</label>
                  <input
                    type="number"
                    defaultValue={settings.tripCharges?.petHairFee || 75}
                    onChange={(e) => handleChange('petHairFee', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lost Key ($)</label>
                  <input
                    type="number"
                    defaultValue={settings.tripCharges?.lostKeyFee || 200}
                    onChange={(e) => handleChange('lostKeyFee', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Alert & Notification Settings</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configure email notifications and customize alert thresholds</p>
              </div>

              {/* Email Configuration */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>📧</span> Email Notifications
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Send alert digests to specified email addresses</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pendingAlertChanges.alertEmailsEnabled ?? alertSettings?.alertEmailsEnabled ?? true}
                      onChange={(e) => handleAlertChange('alertEmailsEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="space-y-4">
                  {/* Email Recipients */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Recipients</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="email"
                        value={newEmailInput}
                        onChange={(e) => setNewEmailInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
                        placeholder="Enter email address"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={handleAddEmail}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(pendingAlertChanges.alertEmailRecipients || alertSettings?.alertEmailRecipients || []).map((email: string) => (
                        <span key={email} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                          {email}
                          <button
                            onClick={() => handleRemoveEmail(email)}
                            className="text-red-500 hover:text-red-700 ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {(pendingAlertChanges.alertEmailRecipients || alertSettings?.alertEmailRecipients || []).length === 0 && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">No recipients configured</span>
                      )}
                    </div>
                  </div>

                  {/* Digest Frequency */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Digest Frequency</label>
                      <select
                        value={pendingAlertChanges.emailDigestFrequency ?? alertSettings?.emailDigestFrequency ?? 'daily'}
                        onChange={(e) => handleAlertChange('emailDigestFrequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="instant">Instant (Send immediately)</option>
                        <option value="hourly">Hourly Digest</option>
                        <option value="daily">Daily Digest</option>
                        <option value="weekly">Weekly Digest</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleSendTestAlert}
                        disabled={sendingAlerts || (pendingAlertChanges.alertEmailRecipients || alertSettings?.alertEmailRecipients || []).length === 0}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingAlerts ? 'Sending...' : 'Send Test Alert'}
                      </button>
                    </div>
                  </div>

                  {alertSettings?.lastEmailSentAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last alert sent: {new Date(alertSettings.lastEmailSentAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Document Thresholds */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>📄</span> Document Expiry Thresholds
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warning Days (before expiry)</label>
                    <input
                      type="number"
                      value={pendingAlertChanges.documentExpiryWarningDays ?? alertSettings?.documentExpiryWarningDays ?? 30}
                      onChange={(e) => handleAlertChange('documentExpiryWarningDays', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Yellow warning threshold</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urgent Days (before expiry)</label>
                    <input
                      type="number"
                      value={pendingAlertChanges.documentExpiryUrgentDays ?? alertSettings?.documentExpiryUrgentDays ?? 7}
                      onChange={(e) => handleAlertChange('documentExpiryUrgentDays', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Red urgent threshold</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pendingAlertChanges.expiredDocumentsAlert ?? alertSettings?.expiredDocumentsAlert ?? true}
                      onChange={(e) => handleAlertChange('expiredDocumentsAlert', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Alert on expired documents</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pendingAlertChanges.pendingDocumentsAlert ?? alertSettings?.pendingDocumentsAlert ?? true}
                      onChange={(e) => handleAlertChange('pendingDocumentsAlert', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Alert on pending documents</span>
                  </label>
                </div>
              </div>

              {/* Partner Thresholds */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>👥</span> Partner Thresholds
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pending Days Warning</label>
                    <input
                      type="number"
                      value={pendingAlertChanges.partnerPendingDaysWarning ?? alertSettings?.partnerPendingDaysWarning ?? 7}
                      onChange={(e) => handleAlertChange('partnerPendingDaysWarning', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Days before flagging pending partners</p>
                  </div>
                  <div className="flex items-end">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pendingAlertChanges.suspendedPartnersAlert ?? alertSettings?.suspendedPartnersAlert ?? true}
                        onChange={(e) => handleAlertChange('suspendedPartnersAlert', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Alert on suspended partners</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Vehicle Thresholds */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>🚗</span> Vehicle Thresholds
                </h3>
                <div className="flex flex-wrap gap-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pendingAlertChanges.pendingVehiclesAlert ?? alertSettings?.pendingVehiclesAlert ?? true}
                      onChange={(e) => handleAlertChange('pendingVehiclesAlert', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Alert on pending vehicles</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pendingAlertChanges.changesRequestedAlert ?? alertSettings?.changesRequestedAlert ?? true}
                      onChange={(e) => handleAlertChange('changesRequestedAlert', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Alert on changes requested</span>
                  </label>
                </div>
              </div>

              {/* Booking Thresholds */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>📅</span> Booking Thresholds
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">High Cancellation Threshold</label>
                    <input
                      type="number"
                      value={pendingAlertChanges.highCancellationThreshold ?? alertSettings?.highCancellationThreshold ?? 5}
                      onChange={(e) => handleAlertChange('highCancellationThreshold', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Alert if cancellations in 7 days exceeds this</p>
                  </div>
                  <div className="flex items-end">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pendingAlertChanges.bookingsStartingTodayAlert ?? alertSettings?.bookingsStartingTodayAlert ?? true}
                        onChange={(e) => handleAlertChange('bookingsStartingTodayAlert', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Alert on bookings starting today</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Financial Thresholds */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>💰</span> Financial Thresholds
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pending Refund Threshold ($)</label>
                    <input
                      type="number"
                      value={pendingAlertChanges.pendingRefundThreshold ?? alertSettings?.pendingRefundThreshold ?? 250}
                      onChange={(e) => handleAlertChange('pendingRefundThreshold', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Alert on refunds exceeding this amount</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pendingAlertChanges.negativeBalanceAlert ?? alertSettings?.negativeBalanceAlert ?? true}
                      onChange={(e) => handleAlertChange('negativeBalanceAlert', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Alert on negative balances</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pendingAlertChanges.failedPayoutsAlert ?? alertSettings?.failedPayoutsAlert ?? true}
                      onChange={(e) => handleAlertChange('failedPayoutsAlert', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Alert on failed payouts</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pendingAlertChanges.pendingRefundsAlert ?? alertSettings?.pendingRefundsAlert ?? true}
                      onChange={(e) => handleAlertChange('pendingRefundsAlert', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Alert on large pending refunds</span>
                  </label>
                </div>
              </div>

              {/* Review Thresholds */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>⭐</span> Review Thresholds
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Low Rating Threshold (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={pendingAlertChanges.lowRatingThreshold ?? alertSettings?.lowRatingThreshold ?? 2}
                      onChange={(e) => handleAlertChange('lowRatingThreshold', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Alert on ratings at or below this</p>
                  </div>
                  <div className="flex items-end">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pendingAlertChanges.lowRatingsAlert ?? alertSettings?.lowRatingsAlert ?? true}
                        onChange={(e) => handleAlertChange('lowRatingsAlert', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Alert on low ratings</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Claims & Security */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span>📋</span> Claims
                  </h3>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pendingAlertChanges.openClaimsAlert ?? alertSettings?.openClaimsAlert ?? true}
                      onChange={(e) => handleAlertChange('openClaimsAlert', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Alert on open claims</span>
                  </label>
                </div>
                <div>
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span>🔒</span> Security
                  </h3>
                  <div className="space-y-3">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pendingAlertChanges.securityEventsAlert ?? alertSettings?.securityEventsAlert ?? true}
                        onChange={(e) => handleAlertChange('securityEventsAlert', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Alert on security events</span>
                    </label>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Critical Security Threshold</label>
                      <input
                        type="number"
                        value={pendingAlertChanges.criticalSecurityThreshold ?? alertSettings?.criticalSecurityThreshold ?? 3}
                        onChange={(e) => handleAlertChange('criticalSecurityThreshold', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">Critical events before immediate alert</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Thresholds */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>⚡</span> Performance Thresholds
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slow Response Threshold (ms)</label>
                    <input
                      type="number"
                      value={pendingAlertChanges.slowResponseThreshold ?? alertSettings?.slowResponseThreshold ?? 5000}
                      onChange={(e) => handleAlertChange('slowResponseThreshold', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Warning level (5000ms = 5 seconds)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Critical Response Threshold (ms)</label>
                    <input
                      type="number"
                      value={pendingAlertChanges.criticalResponseThreshold ?? alertSettings?.criticalResponseThreshold ?? 10000}
                      onChange={(e) => handleAlertChange('criticalResponseThreshold', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Critical level (10000ms = 10 seconds)</p>
                  </div>
                </div>
              </div>

              {/* Alert Settings Save Button */}
              {Object.keys(pendingAlertChanges).length > 0 && (
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {Object.keys(pendingAlertChanges).length} unsaved alert setting(s)
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setPendingAlertChanges({})}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveAlertSettings}
                      disabled={saving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Alert Settings'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Save Button */}
          {Object.keys(pendingChanges).length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {Object.keys(pendingChanges).length} unsaved change(s)
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setPendingChanges({})}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tax Modal */}
        {showTaxModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Tax Rate</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select
                    value={taxModalData.action}
                    onChange={(e) => setTaxModalData({ ...taxModalData, action: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="set_state">State Tax Rate</option>
                    <option value="set_city">City Tax Override</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                  <select
                    value={taxModalData.state}
                    onChange={(e) => setTaxModalData({ ...taxModalData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select state...</option>
                    {US_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {taxModalData.action === 'set_city' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                    <input
                      type="text"
                      value={taxModalData.city}
                      onChange={(e) => setTaxModalData({ ...taxModalData, city: e.target.value })}
                      placeholder="e.g., Phoenix"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={taxModalData.rate}
                    onChange={(e) => setTaxModalData({ ...taxModalData, rate: e.target.value })}
                    placeholder="e.g., 5.6"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={() => setShowTaxModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTaxUpdate}
                  disabled={saving || !taxModalData.state || !taxModalData.rate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Add Tax Rate'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
