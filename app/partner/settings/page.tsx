// app/partner/settings/page.tsx
// Partner Settings Page - Account, company, and payout settings

'use client'

import { useState, useEffect } from 'react'
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
  IoLinkOutline
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
}

export default function PartnerSettingsPage() {
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
    marketingEmails: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [activeSection, setActiveSection] = useState<'account' | 'company' | 'banking' | 'security' | 'notifications'>('account')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    fetchSettings()
  }, [])

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

      if (data.success && data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Failed to start Stripe Connect:', error)
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
            Pending Verification
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
    { id: 'notifications', label: 'Notifications', icon: IoNotificationsOutline }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
                        Connect your bank account to receive payouts
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
                </div>

                {/* Payout Schedule */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payout Schedule
                  </label>
                  <select
                    value={settings.payoutSchedule}
                    onChange={(e) => setSettings(prev => ({ ...prev, payoutSchedule: e.target.value as any }))}
                    disabled={settings.stripeConnectStatus !== 'connected'}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {settings.stripeConnectStatus === 'connected'
                      ? 'Payouts will be deposited to your connected bank account'
                      : 'Connect your Stripe account to set up payouts'}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleSave('banking')}
                    disabled={isSaving || settings.stripeConnectStatus !== 'connected'}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
                  >
                    <IoSaveOutline className="w-5 h-5" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
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
          </div>
        </div>
      </div>
    </div>
  )
}
