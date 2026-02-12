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
  IoNotificationsOutline
} from 'react-icons/io5'

import {
  AccountTab,
  CompanyTab,
  BankingTab,
  SecurityTab,
  NotificationsTab,
  PrivacyTab,
  DeleteAccountModal
} from './components'

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

  // Verification
  emailVerified: boolean
  phoneVerified: boolean

  // Business host
  isBusinessHost: boolean
  businessApprovalStatus: string

  // GDPR
  userStatus?: 'ACTIVE' | 'PENDING_DELETION' | 'DELETED' | 'SUSPENDED'
  deletionScheduledFor?: string | null
}

type SectionId = 'account' | 'company' | 'banking' | 'security' | 'notifications' | 'privacy'

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
    emailVerified: false,
    phoneVerified: false,
    isBusinessHost: false,
    businessApprovalStatus: 'NONE',
    userStatus: 'ACTIVE',
    deletionScheduledFor: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [activeSection, setActiveSection] = useState<SectionId>('account')

  // GDPR state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const [isCancellingDeletion, setIsCancellingDeletion] = useState(false)

  useEffect(() => {
    fetchSettings()
    // Check for tab query param
    const tab = searchParams.get('tab')
    if (tab && ['account', 'company', 'banking', 'security', 'notifications', 'privacy'].includes(tab)) {
      setActiveSection(tab as SectionId)
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
        body: JSON.stringify(settings)
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

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      const res = await fetch('/api/partner/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const data = await res.json()

      if (data.success) {
        setSaveMessage({ type: 'success', text: 'Password changed successfully!' })
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
  const handleDeleteAccount = async (password: string, reason: string): Promise<{ success: boolean; deletionDate?: string; error?: string }> => {
    try {
      const response = await fetch('/api/partner/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, reason })
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to delete account' }
      }

      return { success: true, deletionDate: data.deletionScheduledFor }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  const sections = [
    { id: 'account' as SectionId, label: 'Account', icon: IoPersonOutline },
    { id: 'company' as SectionId, label: 'Company', icon: IoBusinessOutline },
    { id: 'banking' as SectionId, label: 'Banking & Payouts', icon: IoCardOutline },
    { id: 'security' as SectionId, label: 'Security', icon: IoShieldCheckmarkOutline },
    { id: 'notifications' as SectionId, label: 'Notifications', icon: IoNotificationsOutline },
    { id: 'privacy' as SectionId, label: 'Data & Privacy', icon: IoShieldCheckmarkOutline }
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
                  onClick={() => setActiveSection(section.id)}
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
            {activeSection === 'account' && (
              <AccountTab
                settings={settings}
                setSettings={setSettings}
                onSave={handleSave}
                isSaving={isSaving}
              />
            )}

            {activeSection === 'company' && (
              <CompanyTab
                settings={settings}
                setSettings={setSettings}
                onSave={handleSave}
                isSaving={isSaving}
              />
            )}

            {activeSection === 'banking' && (
              <BankingTab
                stripeConnectStatus={settings.stripeConnectStatus}
                stripeAccountId={settings.stripeAccountId}
                onConnectStripe={handleConnectStripe}
              />
            )}

            {activeSection === 'security' && (
              <SecurityTab
                onPasswordChange={handlePasswordChange}
                isSaving={isSaving}
                saveMessage={saveMessage}
                setSaveMessage={setSaveMessage}
              />
            )}

            {activeSection === 'notifications' && (
              <NotificationsTab
                settings={settings}
                setSettings={setSettings}
                onSave={handleSave}
                isSaving={isSaving}
              />
            )}

            {activeSection === 'privacy' && (
              <PrivacyTab
                userStatus={settings.userStatus}
                deletionScheduledFor={settings.deletionScheduledFor}
                onExportData={handleExportData}
                onCancelDeletion={handleCancelDeletion}
                onShowDeleteModal={() => setShowDeleteModal(true)}
                isExporting={isExporting}
                isCancellingDeletion={isCancellingDeletion}
                exportError={exportError}
              />
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        email={settings.email}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDeleteAccount}
      />
    </div>
  )
}
