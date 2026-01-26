// app/(guest)/profile/components/tabs/SecurityTab.tsx
// Security-focused tab with password management, 2FA, account deletion
// Supports both "Set Password" (for invite-link users) and "Change Password" (for existing users)
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
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
  IoWarningOutline,
  IoKeyOutline
} from 'react-icons/io5'
import DeleteAccountModal from '../DeleteAccountModal'

interface SecurityTabProps {
  userEmail?: string
  userStatus?: 'ACTIVE' | 'PENDING_DELETION' | 'DELETED' | 'SUSPENDED'
  deletionScheduledFor?: string | null
  hasPassword?: boolean
  onPasswordSet?: () => void // Callback when password is successfully set
}

export default function SecurityTab({
  userEmail = '',
  userStatus = 'ACTIVE',
  deletionScheduledFor,
  hasPassword = true,
  onPasswordSet
}: SecurityTabProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const [isCancellingDeletion, setIsCancellingDeletion] = useState(false)

  // Change Password form state
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

  // Set Password form state (for users without password)
  const [newPasswordForm, setNewPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [showSetNewPassword, setShowSetNewPassword] = useState(false)
  const [showSetConfirmPassword, setShowSetConfirmPassword] = useState(false)
  const [newPwdError, setNewPwdError] = useState('')
  const [newPwdSuccess, setNewPwdSuccess] = useState(false)
  const [settingPassword, setSettingPassword] = useState(false)

  // Password strength calculator
  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: '', color: '' }

    let score = 0

    if (password.length >= 8) score += 25
    if (password.length >= 12) score += 15
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
  const setPasswordStrength = getPasswordStrength(newPasswordForm.newPassword)

  // Handle Change Password (for users with existing password)
  const handlePasswordChange = async () => {
    setPasswordError('')

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
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })

      setTimeout(() => {
        setShowPasswordModal(false)
        setPasswordSuccess(false)
      }, 2500)

    } catch (error: any) {
      setPasswordError(error.message)
    } finally {
      setChangingPassword(false)
    }
  }

  // Handle Set Password (for users without password - converted prospects)
  const handleSetPassword = async () => {
    setNewPwdError('')

    if (!newPasswordForm.newPassword || !newPasswordForm.confirmPassword) {
      setNewPwdError('All fields are required')
      return
    }

    if (newPasswordForm.newPassword.length < 8) {
      setNewPwdError('Password must be at least 8 characters')
      return
    }

    if (newPasswordForm.newPassword !== newPasswordForm.confirmPassword) {
      setNewPwdError('Passwords do not match')
      return
    }

    setSettingPassword(true)

    try {
      const response = await fetch('/api/user/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword: newPasswordForm.newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set password')
      }

      setNewPwdSuccess(true)
      setNewPasswordForm({ newPassword: '', confirmPassword: '' })

      setTimeout(() => {
        setShowSetPasswordModal(false)
        setNewPwdSuccess(false)
        onPasswordSet?.() // Notify parent to refresh profile
      }, 2500)

    } catch (error: any) {
      setNewPwdError(error.message)
    } finally {
      setSettingPassword(false)
    }
  }

  const resetPasswordModal = () => {
    setShowPasswordModal(false)
    setPasswordError('')
    setPasswordSuccess(false)
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setLogoutOtherDevices(true)
  }

  const resetSetPasswordModal = () => {
    setShowSetPasswordModal(false)
    setNewPwdError('')
    setNewPwdSuccess(false)
    setNewPasswordForm({ newPassword: '', confirmPassword: '' })
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
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Account Security</h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
          Manage your password, security settings, and account access
        </p>
      </div>

      {/* Set Password Prompt (for users without password) */}
      {!hasPassword && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <IoKeyOutline className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                Secure Your Account
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                Your account was created via an invite link. Set a password to secure it and enable login from any device.
              </p>
              <button
                onClick={() => setShowSetPasswordModal(true)}
                className="px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <IoLockClosedOutline className="w-4 h-4" />
                <span>Set Password</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Management */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 mb-3">
          <IoShieldCheckmarkOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Password & Authentication
          </h3>
        </div>

        <div className="space-y-2">
          {/* Change Password (only show if user has password) */}
          {hasPassword && (
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full text-left p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
          )}

          {/* Two-Factor Authentication */}
          <button className="w-full text-left p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">
                  Two-Factor Authentication
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Add an extra layer of security to your account
                </p>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Coming soon</span>
            </div>
          </button>

          {/* Account Linking */}
          <Link
            href="/settings/account-linking"
            className="w-full text-left p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors block"
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

          {/* Forgot Password Link */}
          <Link
            href="/auth/forgot-password"
            className="w-full text-left p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors block"
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
        </div>
      </div>

      {/* Privacy & Data */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 mb-3">
          <IoDownloadOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Privacy & Data
          </h3>
        </div>

        <button
          onClick={handleExportData}
          disabled={isExporting}
          className="w-full text-left p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
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

      {/* Change Password Modal */}
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
                        {showCurrentPassword ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
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
                        {showNewPassword ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {passwordForm.newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Password strength:</span>
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
                        {showConfirmPassword ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">Passwords do not match</p>
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

      {/* Set Password Modal (for users without password) */}
      {showSetPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <IoKeyOutline className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Set Your Password
                </h3>
              </div>
              <button
                onClick={resetSetPasswordModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <IoCloseOutline className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {newPwdSuccess ? (
                <div className="text-center py-8">
                  <IoCheckmarkCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Password Set Successfully!
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your account is now secured. You can log in from any device.
                  </p>
                </div>
              ) : (
                <>
                  {/* Info Notice */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <IoAlertCircleOutline className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Create a strong password to secure your account. You'll use this to log in from any device.
                      </p>
                    </div>
                  </div>

                  {/* Error Message */}
                  {newPwdError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <IoAlertCircleOutline className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700 dark:text-red-400">{newPwdError}</p>
                      </div>
                    </div>
                  )}

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showSetNewPassword ? 'text' : 'password'}
                        value={newPasswordForm.newPassword}
                        onChange={(e) => setNewPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSetNewPassword(!showSetNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showSetNewPassword ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {newPasswordForm.newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Password strength:</span>
                          <span className={`text-xs font-medium ${
                            setPasswordStrength.score < 40 ? 'text-red-600 dark:text-red-400' :
                            setPasswordStrength.score < 70 ? 'text-yellow-600 dark:text-yellow-400' :
                            setPasswordStrength.score < 90 ? 'text-blue-600 dark:text-blue-400' :
                            'text-green-600 dark:text-green-400'
                          }`}>
                            {setPasswordStrength.label}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`${setPasswordStrength.color} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${setPasswordStrength.score}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                          Use 8+ characters with a mix of letters, numbers & symbols
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showSetConfirmPassword ? 'text' : 'password'}
                        value={newPasswordForm.confirmPassword}
                        onChange={(e) => setNewPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSetConfirmPassword(!showSetConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showSetConfirmPassword ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
                      </button>
                    </div>
                    {newPasswordForm.confirmPassword && newPasswordForm.newPassword !== newPasswordForm.confirmPassword && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">Passwords do not match</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            {!newPwdSuccess && (
              <div className="flex items-center gap-3 p-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-900">
                <button
                  onClick={resetSetPasswordModal}
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetPassword}
                  disabled={settingPassword}
                  className="flex-1 px-4 py-2.5 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                >
                  {settingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Setting...</span>
                    </>
                  ) : (
                    <>
                      <IoKeyOutline className="w-4 h-4" />
                      <span>Set Password</span>
                    </>
                  )}
                </button>
              </div>
            )}
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
