// app/(guest)/profile/components/tabs/SecurityTab.tsx
// Security-focused tab with password management, 2FA, account deletion
// Supports both "Set Password" (for invite-link users) and "Change Password" (for existing users)
'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
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
import TwoFactorSetupModal from '../TwoFactorSetupModal'
import DisableTwoFactorModal from '../DisableTwoFactorModal'

interface SecurityTabProps {
  userEmail?: string
  userStatus?: 'ACTIVE' | 'PENDING_DELETION' | 'DELETED' | 'SUSPENDED'
  deletionScheduledFor?: string | null
  hasPassword?: boolean
  twoFactorEnabled?: boolean
  onPasswordSet?: () => void // Callback when password is successfully set
  onRefresh?: () => void // Callback to refresh profile data
}

export default function SecurityTab({
  userEmail = '',
  userStatus = 'ACTIVE',
  deletionScheduledFor,
  hasPassword = true,
  twoFactorEnabled = false,
  onPasswordSet,
  onRefresh
}: SecurityTabProps) {
  const t = useTranslations('SecurityTab')
  const locale = useLocale()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [show2FASetupModal, setShow2FASetupModal] = useState(false)
  const [show2FADisableModal, setShow2FADisableModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const [isCancellingDeletion, setIsCancellingDeletion] = useState(false)
  const [is2FAEnabled, setIs2FAEnabled] = useState(twoFactorEnabled)

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

    if (score < 40) return { score, label: t('weak'), color: 'bg-red-500' }
    if (score < 70) return { score, label: t('fair'), color: 'bg-yellow-500' }
    if (score < 90) return { score, label: t('good'), color: 'bg-blue-500' }
    return { score, label: t('strong'), color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength(passwordForm.newPassword)
  const setPasswordStrength = getPasswordStrength(newPasswordForm.newPassword)

  // Handle Change Password (for users with existing password)
  const handlePasswordChange = async () => {
    setPasswordError('')

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError(t('allFieldsRequired'))
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError(t('password8Chars'))
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(t('passwordsDoNotMatch'))
      return
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError(t('passwordMustBeDifferent'))
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
      setNewPwdError(t('allFieldsRequired'))
      return
    }

    if (newPasswordForm.newPassword.length < 8) {
      setNewPwdError(t('setPassword8Chars'))
      return
    }

    if (newPasswordForm.newPassword !== newPasswordForm.confirmPassword) {
      setNewPwdError(t('passwordsMustMatch'))
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
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('accountSecurity')}</h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
          {t('managePasswordSecurity')}
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
                {t('secureYourAccount')}
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                {t('inviteLinkDesc')}
              </p>
              <button
                onClick={() => setShowSetPasswordModal(true)}
                className="px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <IoLockClosedOutline className="w-4 h-4" />
                <span>{t('setPassword')}</span>
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
            {t('passwordAuthentication')}
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
                    {t('changePassword')}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('updatePasswordSecure')}
                  </p>
                </div>
                <IoChevronForwardOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </button>
          )}

          {/* Two-Factor Authentication */}
          {!hasPassword ? (
            <div className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-500 mb-0.5">
                    {t('twoFactorAuth')}
                  </h4>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {t('twoFactorDesc')}
                  </p>
                </div>
                <IoLockClosedOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </div>
          ) : is2FAEnabled ? (
            <div className="w-full p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">
                      {t('twoFactorAuth')}
                    </h4>
                    <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300 rounded">
                      {t('enabled')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('accountProtected')}
                  </p>
                </div>
                <button
                  onClick={() => setShow2FADisableModal(true)}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  {t('disable')}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShow2FASetupModal(true)}
              className="w-full text-left p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">
                    {t('twoFactorAuth')}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('twoFactorDesc')}
                  </p>
                </div>
                <IoChevronForwardOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </button>
          )}

          {/* Account Linking */}
          {!hasPassword ? (
            <div className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-500 mb-0.5">
                    {t('linkAccounts')}
                  </h4>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {t('linkAccountsDesc')}
                  </p>
                </div>
                <IoLockClosedOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </div>
          ) : (
            <Link
              href="/settings/account-linking"
              className="w-full text-left p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors block"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">
                    {t('linkAccounts')}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('linkAccountsDesc')}
                  </p>
                </div>
                <IoChevronForwardOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </Link>
          )}

          {/* Forgot Password Link */}
          {!hasPassword ? (
            <div className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-500 mb-0.5">
                    {t('forgotPassword')}
                  </h4>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {t('resetViaEmail')}
                  </p>
                </div>
                <IoLockClosedOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </div>
          ) : (
            <Link
              href="/auth/forgot-password"
              className="w-full text-left p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors block"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">
                    {t('forgotPassword')}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('resetViaEmail')}
                  </p>
                </div>
                <IoChevronForwardOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </Link>
          )}

          {/* Locked hint */}
          {!hasPassword && (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 pl-1">
              {t('setPasswordUnlock')}
            </p>
          )}
        </div>
      </div>

      {/* Privacy & Data */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 mb-3">
          <IoDownloadOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {t('privacyData')}
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
                {t('downloadMyData')}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {t('getCopyProfile')}
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
                {t('deletionScheduled')}
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                {t('deletionDate')}{' '}
                <strong>
                  {deletionScheduledFor
                    ? new Date(deletionScheduledFor).toLocaleDateString(locale, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : t('thirtyDaysFromRequest')}
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
                    <span>{t('cancelling')}</span>
                  </>
                ) : (
                  <span>{t('cancelDeletion')}</span>
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
              {t('dangerZone')}
            </h3>
          </div>
          <div className="p-4 border border-red-200 dark:border-red-900/50 rounded-lg bg-red-50/50 dark:bg-red-900/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {t('deleteAccount')}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('deleteAccountDesc')}
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex-shrink-0 flex items-center gap-2"
              >
                <IoTrashOutline className="w-4 h-4" />
                <span>{t('delete')}</span>
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
                  {t('changePasswordTitle')}
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
                    {t('passwordChangedSuccess')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('passwordUpdated')}
                  </p>
                  {logoutOtherDevices && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {t('otherDevicesSignedOut')}
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
                        {t('securityNotice')}
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
                      {t('currentPasswordLabel')}
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder={t('enterCurrentPassword')}
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
                      {t('newPasswordLabel')}
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder={t('atLeast8Chars')}
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
                          <span className="text-xs text-gray-600 dark:text-gray-400">{t('passwordStrength')}:</span>
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
                          {t('use8PlusChars')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('confirmPasswordLabel')}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder={t('confirmNewPassword')}
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
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{t('passwordsDoNotMatch')}</p>
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
                            {t('signOutAllDevices')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {t('signOutRecommended')}
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
                  {t('cancel')}
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={changingPassword}
                  className="flex-1 px-4 py-2.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                >
                  {changingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>{t('changing')}</span>
                    </>
                  ) : (
                    <>
                      <IoLockClosedOutline className="w-4 h-4" />
                      <span>{t('changePassword')}</span>
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
                  {t('setPasswordTitle')}
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
                    {t('passwordSetSuccess')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('accountSecured')}
                  </p>
                </div>
              ) : (
                <>
                  {/* Info Notice */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <IoAlertCircleOutline className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        {t('createStrongPassword')}
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
                      {t('passwordLabel')}
                    </label>
                    <div className="relative">
                      <input
                        type={showSetNewPassword ? 'text' : 'password'}
                        value={newPasswordForm.newPassword}
                        onChange={(e) => setNewPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder={t('atLeast8Chars')}
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
                          <span className="text-xs text-gray-600 dark:text-gray-400">{t('passwordStrength')}:</span>
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
                          {t('use8PlusChars')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('confirmPassword')}
                    </label>
                    <div className="relative">
                      <input
                        type={showSetConfirmPassword ? 'text' : 'password'}
                        value={newPasswordForm.confirmPassword}
                        onChange={(e) => setNewPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder={t('confirmYourPassword')}
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
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{t('passwordsDoNotMatch')}</p>
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
                  {t('cancel')}
                </button>
                <button
                  onClick={handleSetPassword}
                  disabled={settingPassword}
                  className="flex-1 px-4 py-2.5 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                >
                  {settingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>{t('setting')}</span>
                    </>
                  ) : (
                    <>
                      <IoKeyOutline className="w-4 h-4" />
                      <span>{t('setPassword')}</span>
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

      {/* 2FA Setup Modal */}
      <TwoFactorSetupModal
        isOpen={show2FASetupModal}
        onClose={() => setShow2FASetupModal(false)}
        onSuccess={() => {
          setIs2FAEnabled(true)
          onRefresh?.()
        }}
      />

      {/* 2FA Disable Modal */}
      <DisableTwoFactorModal
        isOpen={show2FADisableModal}
        onClose={() => setShow2FADisableModal(false)}
        onSuccess={() => {
          setIs2FAEnabled(false)
          onRefresh?.()
        }}
      />
    </div>
  )
}
