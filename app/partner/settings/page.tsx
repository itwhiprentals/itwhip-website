// app/partner/settings/page.tsx
// Partner Settings Page - Account, company, and payout settings

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  IoPersonOutline,
  IoBusinessOutline,
  IoCardOutline,
  IoShieldCheckmarkOutline,
  IoNotificationsOutline,
  IoSaveOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoLinkOutline,
  IoDownloadOutline,
  IoTrashOutline,
  IoWarningOutline,
  IoCloseOutline,
  IoCarOutline,
  IoDocumentTextOutline,
  IoTimeOutline
} from 'react-icons/io5'

interface PartnerSettings {
  // Account
  email: string
  firstName: string
  lastName: string
  phone: string

  // Company
  companyName: string
  businessType: string
  taxId: string
  address: string
  city: string
  state: string
  zipCode: string

  // Banking
  stripeConnectStatus: 'not_connected' | 'pending' | 'connected' | 'restricted'
  stripeAccountId: string | null
  payoutSchedule: 'daily' | 'weekly' | 'biweekly' | 'monthly'

  // Notifications
  emailNotifications: boolean
  bookingAlerts: boolean
  payoutAlerts: boolean
  marketingEmails: boolean

  // GDPR
  userStatus?: 'ACTIVE' | 'PENDING_DELETION' | 'DELETED' | 'SUSPENDED'
  deletionScheduledFor?: string | null
}

export default function PartnerSettingsPage() {
  const searchParams = useSearchParams()
  const [settings, setSettings] = useState<PartnerSettings>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    companyName: '',
    businessType: '',
    taxId: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    stripeConnectStatus: 'not_connected',
    stripeAccountId: null,
    payoutSchedule: 'weekly',
    emailNotifications: true,
    bookingAlerts: true,
    payoutAlerts: true,
    marketingEmails: false,
    userStatus: 'ACTIVE',
    deletionScheduledFor: null
  })
  const [isLoading, setIsLoading] = useState(true)

  // GDPR state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const [isCancellingDeletion, setIsCancellingDeletion] = useState(false)
  const [deleteStep, setDeleteStep] = useState<'confirm' | 'password' | 'success'>('confirm')
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeletePassword, setShowDeletePassword] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')
  const [deleteOtherReason, setDeleteOtherReason] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletionDate, setDeletionDate] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [activeSection, setActiveSection] = useState<'account' | 'company' | 'banking' | 'security' | 'notifications' | 'privacy'>('account')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    fetchSettings()
    // Check for tab query param
    const tab = searchParams.get('tab')
    if (tab && ['account', 'company', 'banking', 'security', 'notifications', 'privacy'].includes(tab)) {
      setActiveSection(tab as any)
    }
  }, [searchParams])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/partner/settings')
      const data = await res.json()
      if (data.success) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (section: string) => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      const res = await fetch('/api/partner/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, data: settings })
      })

      const data = await res.json()

      if (data.success) {
        setSaveMessage({ type: 'success', text: 'Settings saved successfully!' })
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Failed to save settings' })
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  const handleConnectStripe = async () => {
    try {
      const res = await fetch('/api/partner/banking/connect', {
        method: 'POST'
      })
      const data = await res.json()

      if (data.success && data.onboardingUrl) {
        window.location.href = data.onboardingUrl
      } else if (!data.success) {
        setSaveMessage({ type: 'error', text: data.error || 'Failed to connect Stripe' })
      }
    } catch (error) {
      console.error('Failed to start Stripe Connect:', error)
      setSaveMessage({ type: 'error', text: 'Failed to connect with Stripe' })
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSaveMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    if (passwordData.newPassword.length < 8) {
      setSaveMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }

    setIsSaving(true)
    setSaveMessage(null)

    try {
      const res = await fetch('/api/partner/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const data = await res.json()

      if (data.success) {
        setSaveMessage({ type: 'success', text: 'Password changed successfully!' })
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Failed to change password' })
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to change password' })
    } finally {
      setIsSaving(false)
    }
  }

  // GDPR: Handle data export
  const handleExportData = async () => {
    setIsExporting(true)
    setExportError('')

    try {
      const response = await fetch('/api/partner/export-data')

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to export data')
      }

      // Get the blob and create download as PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ItWhip-Partner-Data-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error: any) {
      setExportError(error.message)
    } finally {
      setIsExporting(false)
    }
  }

  // GDPR: Handle cancel deletion
  const handleCancelDeletion = async () => {
    setIsCancellingDeletion(true)

    try {
      const response = await fetch('/api/partner/cancel-deletion', {
        method: 'POST'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to cancel deletion')
      }

      // Reload the page to reflect the change
      window.location.reload()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsCancellingDeletion(false)
    }
  }

  // GDPR: Handle delete account
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Please enter your password')
      return
    }

    setDeleteError('')
    setIsDeleting(true)

    try {
      const response = await fetch('/api/partner/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: deletePassword,
          reason: deleteReason === 'other' ? deleteOtherReason : deleteReason
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account')
      }

      setDeletionDate(data.deletionScheduledFor)
      setDeleteStep('success')
    } catch (err: any) {
      setDeleteError(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const resetDeleteModal = () => {
    setShowDeleteModal(false)
    setDeleteStep('confirm')
    setDeletePassword('')
    setShowDeletePassword(false)
    setDeleteReason('')
    setDeleteOtherReason('')
    setDeleteError('')
    setDeletionDate(null)
  }

  const DELETION_REASONS = [
    { value: 'no_longer_need', label: 'No longer need the service' },
    { value: 'privacy_concerns', label: 'Privacy concerns' },
    { value: 'found_alternative', label: 'Found a better alternative' },
    { value: 'too_expensive', label: 'Service is too expensive' },
    { value: 'poor_experience', label: 'Had a poor experience' },
    { value: 'other', label: 'Other reason' }
  ]

  const getStripeStatusBadge = () => {
    switch (settings.stripeConnectStatus) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <IoCheckmarkCircleOutline className="w-4 h-4" />
            Connected
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            <IoAlertCircleOutline className="w-4 h-4" />
            Setup Incomplete
          </span>
        )
      case 'restricted':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <IoAlertCircleOutline className="w-4 h-4" />
            Action Required
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            Not Connected
          </span>
        )
    }
  }

  const sections = [
    { id: 'account', label: 'Account', icon: IoPersonOutline },
    { id: 'company', label: 'Company', icon: IoBusinessOutline },
    { id: 'banking', label: 'Banking & Payouts', icon: IoCardOutline },
    { id: 'security', label: 'Security', icon: IoShieldCheckmarkOutline },
    { id: 'notifications', label: 'Notifications', icon: IoNotificationsOutline },
    { id: 'privacy', label: 'Data & Privacy', icon: IoShieldCheckmarkOutline }
  ]

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your account, company info, and preferences
        </p>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-4 rounded-lg ${
          saveMessage.type === 'success'
            ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {saveMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            {/* Account Section */}
            {activeSection === 'account' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Information</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={settings.firstName}
                      onChange={(e) => setSettings(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={settings.lastName}
                      onChange={(e) => setSettings(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={settings.phone}
                      onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleSave('account')}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
                  >
                    <IoSaveOutline className="w-5 h-5" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* Company Section */}
            {activeSection === 'company' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Company Information</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={settings.companyName}
                      onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Business Type
                    </label>
                    <select
                      value={settings.businessType}
                      onChange={(e) => setSettings(prev => ({ ...prev, businessType: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select type</option>
                      <option value="llc">LLC</option>
                      <option value="corporation">Corporation</option>
                      <option value="sole_proprietor">Sole Proprietor</option>
                      <option value="partnership">Partnership</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tax ID (EIN)
                    </label>
                    <input
                      type="text"
                      value={settings.taxId}
                      onChange={(e) => setSettings(prev => ({ ...prev, taxId: e.target.value }))}
                      placeholder="XX-XXXXXXX"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Business Address
                    </label>
                    <input
                      type="text"
                      value={settings.address}
                      onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={settings.city}
                      onChange={(e) => setSettings(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={settings.state}
                        onChange={(e) => setSettings(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={settings.zipCode}
                        onChange={(e) => setSettings(prev => ({ ...prev, zipCode: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleSave('company')}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
                  >
                    <IoSaveOutline className="w-5 h-5" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* Banking Section */}
            {activeSection === 'banking' && (
              <div className="space-y-6" id="banking">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Banking & Payouts</h2>

                {/* Stripe Connect Status */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Stripe Connect</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {settings.stripeConnectStatus === 'connected'
                          ? 'Your payout account is set up and ready'
                          : settings.stripeConnectStatus === 'pending'
                          ? 'You started connecting but haven\'t finished yet'
                          : settings.stripeConnectStatus === 'restricted'
                          ? 'Additional information needed to complete verification'
                          : 'Connect your bank account to receive payouts'}
                      </p>
                    </div>
                    {getStripeStatusBadge()}
                  </div>

                  {settings.stripeConnectStatus === 'not_connected' && (
                    <button
                      onClick={handleConnectStripe}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      <IoLinkOutline className="w-5 h-5" />
                      Connect with Stripe
                    </button>
                  )}

                  {settings.stripeConnectStatus === 'restricted' && (
                    <button
                      onClick={handleConnectStripe}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <IoAlertCircleOutline className="w-5 h-5" />
                      Complete Verification
                    </button>
                  )}

                  {settings.stripeConnectStatus === 'pending' && (
                    <div className="mt-4">
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-3">
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                          Your payout account setup is incomplete. Click below to finish connecting your bank account.
                        </p>
                      </div>
                      <button
                        onClick={handleConnectStripe}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                      >
                        <IoLinkOutline className="w-5 h-5" />
                        Continue Setup
                      </button>
                    </div>
                  )}
                </div>

                {/* Connected Account Details */}
                {settings.stripeConnectStatus === 'connected' && settings.stripeAccountId && (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-green-800 dark:text-green-300">Account Verified</p>
                          <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                            Your bank account is connected and payouts are enabled. You&apos;ll receive earnings directly to your account.
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-500 mt-2 font-mono">
                            Account ID: {settings.stripeAccountId}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stripe Express Dashboard Link */}
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Stripe Express Dashboard</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            View your full payout history, update bank details, and download tax documents
                          </p>
                        </div>
                        <a
                          href="https://connect.stripe.com/express_login"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg transition-colors text-sm font-medium"
                        >
                          <IoLinkOutline className="w-4 h-4" />
                          Open Dashboard
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payout Info */}
                {settings.stripeConnectStatus === 'connected' && (
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Payout Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Payout Schedule</span>
                        <span className="text-gray-900 dark:text-white font-medium">Platform Managed</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Currency</span>
                        <span className="text-gray-900 dark:text-white font-medium">USD</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                        Payouts are processed by ItWhip and deposited directly to your connected bank account.
                        View your complete payout history in your Stripe Express Dashboard.
                      </p>
                    </div>
                  </div>
                )}

                {/* Not Connected Info */}
                {settings.stripeConnectStatus === 'not_connected' && (
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Why Connect with Stripe?</h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Receive payouts directly to your bank account</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Secure, encrypted payment processing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Access to detailed payout history and tax documents</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>1099 tax forms automatically available</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h2>

                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handlePasswordChange}
                    disabled={isSaving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
                  >
                    <IoShieldCheckmarkOutline className="w-5 h-5" />
                    {isSaving ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h2>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive important updates via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                      className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Booking Alerts</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about new bookings and updates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.bookingAlerts}
                      onChange={(e) => setSettings(prev => ({ ...prev, bookingAlerts: e.target.checked }))}
                      className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Payout Alerts</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when payouts are processed</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.payoutAlerts}
                      onChange={(e) => setSettings(prev => ({ ...prev, payoutAlerts: e.target.checked }))}
                      className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Marketing Emails</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive tips, promotions, and platform updates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.marketingEmails}
                      onChange={(e) => setSettings(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                      className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                    />
                  </label>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleSave('notifications')}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
                  >
                    <IoSaveOutline className="w-5 h-5" />
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            )}

            {/* Data & Privacy Section */}
            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data & Privacy</h2>

                {/* Download My Data */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <IoDownloadOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Download My Data</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Get a copy of your partner profile, fleet data, bookings, and earnings
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleExportData}
                      disabled={isExporting}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isExporting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          <span>Exporting...</span>
                        </>
                      ) : (
                        <>
                          <IoDownloadOutline className="w-4 h-4" />
                          <span>Download</span>
                        </>
                      )}
                    </button>
                  </div>
                  {exportError && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-3">{exportError}</p>
                  )}
                </div>

                {/* Pending Deletion Warning */}
                {settings.userStatus === 'PENDING_DELETION' && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <IoWarningOutline className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                          Account Scheduled for Deletion
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                          Your account will be permanently deleted on{' '}
                          <strong>
                            {settings.deletionScheduledFor
                              ? new Date(settings.deletionScheduledFor).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                              : '30 days from request'}
                          </strong>
                        </p>
                        <button
                          onClick={handleCancelDeletion}
                          disabled={isCancellingDeletion}
                          className="px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {isCancellingDeletion ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                              <span>Cancelling...</span>
                            </>
                          ) : (
                            <span>Cancel Deletion</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Danger Zone */}
                {settings.userStatus !== 'PENDING_DELETION' && (
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1.5 mb-3">
                      <IoWarningOutline className="w-4 h-4 text-red-500" />
                      <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">
                        Danger Zone
                      </h3>
                    </div>
                    <div className="p-4 border border-red-200 dark:border-red-900/50 rounded-lg bg-red-50/50 dark:bg-red-900/10">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            Delete Account
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Permanently delete your partner account, fleet listings, and all associated data. This action cannot be undone after the 30-day grace period.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex-shrink-0 flex items-center gap-2"
                        >
                          <IoTrashOutline className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <IoTrashOutline className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Account
                </h3>
              </div>
              <button
                onClick={resetDeleteModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <IoCloseOutline className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {deleteStep === 'confirm' && (
                <div className="space-y-4">
                  {/* Warning Banner */}
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <IoWarningOutline className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                          30-Day Grace Period
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          Your account will be scheduled for deletion in 30 days. You can cancel this request at any time during the grace period by logging back in.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* What Will Be Deleted */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      What will be deleted:
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <IoPersonOutline className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Your partner profile and company information</span>
                      </div>
                      <div className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <IoCarOutline className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Your fleet listings and vehicle data</span>
                      </div>
                      <div className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <IoCardOutline className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Payout history and banking information</span>
                      </div>
                      <div className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <IoDocumentTextOutline className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Booking history and analytics</span>
                      </div>
                    </div>
                  </div>

                  {/* Reason Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Why are you leaving? *
                    </label>
                    <select
                      value={deleteReason}
                      onChange={(e) => {
                        setDeleteReason(e.target.value)
                        setDeleteError('')
                      }}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select a reason...</option>
                      {DELETION_REASONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    {deleteReason === 'other' && (
                      <textarea
                        value={deleteOtherReason}
                        onChange={(e) => setDeleteOtherReason(e.target.value)}
                        placeholder="Please tell us more..."
                        className="w-full mt-2 px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 resize-none"
                        rows={3}
                      />
                    )}
                  </div>

                  {/* Error Message */}
                  {deleteError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <IoAlertCircleOutline className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
                        <p className="text-sm text-red-700 dark:text-red-400">{deleteError}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {deleteStep === 'password' && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <IoWarningOutline className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                          Confirm Account Deletion
                        </h4>
                        <p className="text-sm text-red-700 dark:text-red-400">
                          Enter your password to confirm. A confirmation email will be sent to <span className="font-medium">{settings.email}</span>.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Enter your password to confirm *
                    </label>
                    <div className="relative">
                      <input
                        type={showDeletePassword ? 'text' : 'password'}
                        value={deletePassword}
                        onChange={(e) => {
                          setDeletePassword(e.target.value)
                          setDeleteError('')
                        }}
                        className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowDeletePassword(!showDeletePassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showDeletePassword ? (
                          <IoEyeOffOutline className="w-5 h-5" />
                        ) : (
                          <IoEyeOutline className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {deleteError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <IoAlertCircleOutline className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
                        <p className="text-sm text-red-700 dark:text-red-400">{deleteError}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {deleteStep === 'success' && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IoTimeOutline className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Deletion Scheduled
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Your account is scheduled for deletion on:
                  </p>
                  <p className="text-lg font-semibold text-amber-600 dark:text-amber-400 mb-4">
                    {deletionDate ? new Date(deletionDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : '30 days from now'}
                  </p>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-left">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Changed your mind?</strong> Simply log in anytime before the deletion date to cancel this request. A confirmation email has been sent to your email address.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 p-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
              {deleteStep === 'confirm' && (
                <>
                  <button
                    onClick={resetDeleteModal}
                    className="flex-1 px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!deleteReason) {
                        setDeleteError('Please select a reason for leaving')
                        return
                      }
                      setDeleteError('')
                      setDeleteStep('password')
                    }}
                    className="flex-1 px-4 py-2.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Continue
                  </button>
                </>
              )}

              {deleteStep === 'password' && (
                <>
                  <button
                    onClick={() => {
                      setDeleteStep('confirm')
                      setDeletePassword('')
                      setDeleteError('')
                    }}
                    className="flex-1 px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <IoTrashOutline className="w-4 h-4" />
                        <span>Delete My Account</span>
                      </>
                    )}
                  </button>
                </>
              )}

              {deleteStep === 'success' && (
                <button
                  onClick={resetDeleteModal}
                  className="w-full px-4 py-2.5 text-sm bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg transition-colors font-medium"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
