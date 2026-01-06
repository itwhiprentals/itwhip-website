// app/(guest)/profile/components/tabs/SettingsTab.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  IoSaveOutline,
  IoNotificationsOutline,
  IoMailOutline,
  IoChatbubbleOutline,
  IoPhonePortraitOutline,
  IoGlobeOutline,
  IoShieldCheckmarkOutline,
  IoChevronForwardOutline,
  IoLockClosedOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoCloseOutline,
  IoCheckmarkCircle,
  IoAlertCircleOutline,
  IoLogOutOutline,
  IoDownloadOutline,
  IoTrashOutline,
  IoWarningOutline
} from 'react-icons/io5'
import DeleteAccountModal from '../DeleteAccountModal'

interface SettingsTabProps {
  profile: {
    preferredLanguage: string
    preferredCurrency: string
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
  }
  formData: {
    preferredLanguage: string
    preferredCurrency: string
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
  }
  saving: boolean
  onFormChange: (data: Partial<SettingsTabProps['formData']>) => void
  onSave: () => void
  userEmail?: string
  userStatus?: 'ACTIVE' | 'PENDING_DELETION' | 'DELETED' | 'SUSPENDED'
  deletionScheduledFor?: string | null
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'de', name: 'Deutsch (German)' },
  { code: 'zh', name: '中文 (Chinese)' },
  { code: 'ja', name: '日本語 (Japanese)' },
  { code: 'ko', name: '한국어 (Korean)' }
]

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' }
]

export default function SettingsTab({
  profile,
  formData,
  saving,
  onFormChange,
  onSave,
  userEmail = '',
  userStatus = 'ACTIVE',
  deletionScheduledFor
}: SettingsTabProps) {

  const [hasChanges, setHasChanges] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const [isCancellingDeletion, setIsCancellingDeletion] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [logoutOtherDevices, setLogoutOtherDevices] = useState(true)

  const handleChange = (field: string, value: any) => {
    onFormChange({ [field]: value })
    setHasChanges(true)
  }

  const handleSaveClick = () => {
    onSave()
    setHasChanges(false)
  }

  // Password strength calculator
  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: '', color: '' }
    
    let score = 0
    
    // Length
    if (password.length >= 8) score += 25
    if (password.length >= 12) score += 15
    
    // Complexity
    if (/[a-z]/.test(password)) score += 15
    if (/[A-Z]/.test(password)) score += 15
    if (/[0-9]/.test(password)) score += 15
    if (/[^a-zA-Z0-9]/.test(password)) score += 15
    
    if (score < 40) return { score, label: 'Weak', color: 'bg-red-500' }
    if (score < 70) return { score, label: 'Fair', color: 'bg-yellow-500' }
    if (score < 90) return { score, label: 'Good', color: 'bg-blue-500' }
    return { score, label: 'Strong', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength(passwordForm.newPassword)

  const handlePasswordChange = async () => {
    setPasswordError('')
    
    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All fields are required')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError('New password must be different from current password')
      return
    }

    setChangingPassword(true)

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          logoutOtherDevices
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password')
      }

      setPasswordSuccess(true)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      // Close modal after 2.5 seconds
      setTimeout(() => {
        setShowPasswordModal(false)
        setPasswordSuccess(false)
        
        // If user chose to logout other devices, they stay logged in
        // but other sessions are invalidated
      }, 2500)

    } catch (error: any) {
      setPasswordError(error.message)
    } finally {
      setChangingPassword(false)
    }
  }

  const resetPasswordModal = () => {
    setShowPasswordModal(false)
    setPasswordError('')
    setPasswordSuccess(false)
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setLogoutOtherDevices(true)
  }

  // Handle data export
  const handleExportData = async () => {
    setIsExporting(true)
    setExportError('')

    try {
      const response = await fetch('/api/user/export-data')

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to export data')
      }

      // Get the blob and create download as PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ItWhip-My-Data-${new Date().toISOString().split('T')[0]}.pdf`
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

  // Handle cancel deletion
  const handleCancelDeletion = async () => {
    setIsCancellingDeletion(true)

    try {
      const response = await fetch('/api/user/cancel-deletion', {
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

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Account Settings</h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
          Manage your preferences and notification settings
        </p>
      </div>

      {/* Notification Preferences */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 mb-3">
          <IoNotificationsOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Notification Preferences
          </h3>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          Choose how you want to receive updates about your bookings and account
        </p>

        <div className="space-y-2.5">
          {/* Email Notifications */}
          <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm">
            <div className="flex items-start gap-2.5 flex-1">
              <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <IoMailOutline className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">
                  Email Notifications
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Booking confirmations, trip reminders, messages, and updates
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-3">
              <input
                type="checkbox"
                checked={formData.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
            </label>
          </div>

          {/* SMS Notifications */}
          <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm">
            <div className="flex items-start gap-2.5 flex-1">
              <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <IoChatbubbleOutline className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">
                  SMS Notifications
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Important booking updates and trip reminders via text
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-3">
              <input
                type="checkbox"
                checked={formData.smsNotifications}
                onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
            </label>
          </div>

          {/* Push Notifications */}
          <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm">
            <div className="flex items-start gap-2.5 flex-1">
              <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <IoPhonePortraitOutline className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">
                  Push Notifications
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Real-time alerts on your mobile device
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-3">
              <input
                type="checkbox"
                checked={formData.pushNotifications}
                onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Regional Preferences */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 mb-3">
          <IoGlobeOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Regional Preferences
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Language */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Preferred Language
            </label>
            <select
              value={formData.preferredLanguage}
              onChange={(e) => handleChange('preferredLanguage', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
              Choose your preferred language for emails and interface
            </p>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Preferred Currency
            </label>
            <select
              value={formData.preferredCurrency}
              onChange={(e) => handleChange('preferredCurrency', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            >
              {CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name} ({currency.code})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
              Prices will be displayed in this currency
            </p>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 mb-3">
          <IoShieldCheckmarkOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Privacy & Security
          </h3>
        </div>

        <div className="space-y-2">
          {/* Change Password - Modal Trigger */}
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full text-left p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">
                  Change Password
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Update your password to keep your account secure
                </p>
              </div>
              <IoChevronForwardOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
          </button>

          {/* Account Linking */}
          <Link
            href="/settings/account-linking"
            className="w-full text-left p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors block shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">
                  Link Guest & Host Accounts
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Connect your guest and host accounts for easy role switching
                </p>
              </div>
              <IoChevronForwardOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
          </Link>

          {/* Two-Factor Authentication */}
          <button className="w-full text-left p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">
                  Two-Factor Authentication
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Add an extra layer of security to your account
                </p>
              </div>
              <IoChevronForwardOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
          </button>

          {/* Forgot Password Link */}
          <Link
            href="/auth/forgot-password"
            className="w-full text-left p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors block shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">
                  Forgot Password?
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Reset your password via email
                </p>
              </div>
              <IoChevronForwardOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
          </Link>

          {/* Download My Data */}
          <button
            onClick={handleExportData}
            disabled={isExporting}
            className="w-full text-left p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">
                  Download My Data
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Get a copy of your profile, trips, and account info
                </p>
              </div>
              {isExporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent flex-shrink-0" />
              ) : (
                <IoDownloadOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
            </div>
          </button>
          {exportError && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{exportError}</p>
          )}
        </div>
      </div>

      {/* Pending Deletion Warning */}
      {userStatus === 'PENDING_DELETION' && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <IoWarningOutline className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                Account Scheduled for Deletion
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                Your account will be permanently deleted on{' '}
                <strong>
                  {deletionScheduledFor
                    ? new Date(deletionScheduledFor).toLocaleDateString('en-US', {
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

      {/* Save Button */}
      {hasChanges && (
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              onFormChange({
                emailNotifications: profile.emailNotifications,
                smsNotifications: profile.smsNotifications,
                pushNotifications: profile.pushNotifications,
                preferredLanguage: profile.preferredLanguage,
                preferredCurrency: profile.preferredCurrency
              })
              setHasChanges(false)
            }}
            className="px-4 py-2 min-h-[36px] text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            disabled={saving}
            className="px-4 py-2 min-h-[36px] text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <IoSaveOutline className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <IoLockClosedOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Change Password
                </h3>
              </div>
              <button
                onClick={resetPasswordModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <IoCloseOutline className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {passwordSuccess ? (
                <div className="text-center py-8">
                  <IoCheckmarkCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Password Changed Successfully!
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Your password has been updated
                  </p>
                  {logoutOtherDevices && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Other devices have been signed out for security
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {/* Security Notice */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <IoAlertCircleOutline className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        For your security, you'll need to enter your current password. A confirmation email will be sent.
                      </p>
                    </div>
                  </div>

                  {/* Error Message */}
                  {passwordError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <IoAlertCircleOutline className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700 dark:text-red-400">{passwordError}</p>
                      </div>
                    </div>
                  )}

                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter current password"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showCurrentPassword ? (
                          <IoEyeOffOutline className="w-5 h-5" />
                        ) : (
                          <IoEyeOutline className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showNewPassword ? (
                          <IoEyeOffOutline className="w-5 h-5" />
                        ) : (
                          <IoEyeOutline className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    
                    {/* Password Strength Meter */}
                    {passwordForm.newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            Password strength:
                          </span>
                          <span className={`text-xs font-medium ${
                            passwordStrength.score < 40 ? 'text-red-600 dark:text-red-400' :
                            passwordStrength.score < 70 ? 'text-yellow-600 dark:text-yellow-400' :
                            passwordStrength.score < 90 ? 'text-blue-600 dark:text-blue-400' :
                            'text-green-600 dark:text-green-400'
                          }`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`${passwordStrength.color} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${passwordStrength.score}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                          Use 8+ characters with a mix of letters, numbers & symbols
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <IoEyeOffOutline className="w-5 h-5" />
                        ) : (
                          <IoEyeOutline className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Passwords do not match
                      </p>
                    )}
                  </div>

                  {/* Logout Other Devices Option */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={logoutOtherDevices}
                        onChange={(e) => setLogoutOtherDevices(e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-green-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <IoLogOutOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Sign out of all other devices
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Recommended for security. You'll stay signed in on this device.
                        </p>
                      </div>
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            {!passwordSuccess && (
              <div className="flex items-center gap-3 p-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-900">
                <button
                  onClick={resetPasswordModal}
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={changingPassword}
                  className="flex-1 px-4 py-2.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                >
                  {changingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Changing...</span>
                    </>
                  ) : (
                    <>
                      <IoLockClosedOutline className="w-4 h-4" />
                      <span>Change Password</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Danger Zone */}
      {userStatus !== 'PENDING_DELETION' && (
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
                  Permanently delete your account and all associated data. This action cannot be undone after the 30-day grace period.
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

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        userEmail={userEmail}
      />
    </div>
  )
}