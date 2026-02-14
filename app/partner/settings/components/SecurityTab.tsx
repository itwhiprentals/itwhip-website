// app/partner/settings/components/SecurityTab.tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  IoShieldCheckmarkOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5'

interface SecurityTabProps {
  onPasswordChange: (currentPassword: string, newPassword: string) => Promise<void>
  isSaving: boolean
  saveMessage: { type: 'success' | 'error'; text: string } | null
  setSaveMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void
}

interface ValidationErrors {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export function SecurityTab({ onPasswordChange, isSaving, saveMessage, setSaveMessage }: SecurityTabProps) {
  const t = useTranslations('PartnerSettings')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Password strength requirements (inside component to access t())
  const PASSWORD_REQUIREMENTS = [
    { id: 'length', label: t('reqLength'), test: (p: string) => p.length >= 8 },
    { id: 'uppercase', label: t('reqUppercase'), test: (p: string) => /[A-Z]/.test(p) },
    { id: 'lowercase', label: t('reqLowercase'), test: (p: string) => /[a-z]/.test(p) },
    { id: 'number', label: t('reqNumber'), test: (p: string) => /\d/.test(p) }
  ]

  const validateField = (field: keyof ValidationErrors, value: string) => {
    let error: string | undefined

    switch (field) {
      case 'currentPassword':
        if (!value) error = t('valCurrentRequired')
        break
      case 'newPassword':
        if (!value) error = t('valNewRequired')
        else if (value.length < 8) error = t('valPasswordLength')
        else if (!/[A-Z]/.test(value)) error = t('valPasswordUppercase')
        else if (!/[a-z]/.test(value)) error = t('valPasswordLowercase')
        else if (!/\d/.test(value)) error = t('valPasswordNumber')
        break
      case 'confirmPassword':
        if (!value) error = t('valConfirmRequired')
        else if (value !== passwordData.newPassword) error = t('valPasswordsMismatch')
        break
    }

    setErrors(prev => ({ ...prev, [field]: error }))
    return !error
  }

  const handleBlur = (field: keyof ValidationErrors) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    validateField(field, passwordData[field])
  }

  const handleChange = (field: keyof ValidationErrors, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
    setSaveMessage(null)
    if (touched[field]) {
      validateField(field, value)
    }
    // Re-validate confirm password when new password changes
    if (field === 'newPassword' && touched.confirmPassword) {
      validateField('confirmPassword', passwordData.confirmPassword)
    }
  }

  const validateAll = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = t('valCurrentRequired')
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = t('valNewRequired')
    } else {
      const failedReqs = PASSWORD_REQUIREMENTS.filter(r => !r.test(passwordData.newPassword))
      if (failedReqs.length > 0) {
        newErrors.newPassword = t('valPasswordMustHave', { requirements: failedReqs.map(r => r.label.toLowerCase()).join(', ') })
      }
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = t('valConfirmRequired')
    } else if (passwordData.confirmPassword !== passwordData.newPassword) {
      newErrors.confirmPassword = t('valPasswordsMismatch')
    }

    setErrors(newErrors)
    setTouched({ currentPassword: true, newPassword: true, confirmPassword: true })
    return Object.keys(newErrors).length === 0
  }

  const handlePasswordChange = async () => {
    if (!validateAll()) return

    await onPasswordChange(passwordData.currentPassword, passwordData.newPassword)
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setTouched({})
    setErrors({})
  }

  const renderError = (field: keyof ValidationErrors) => {
    if (touched[field] && errors[field]) {
      return (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <IoAlertCircleOutline className="w-4 h-4" />
          {errors[field]}
        </p>
      )
    }
    return null
  }

  const getInputClassName = (field: keyof ValidationErrors) => {
    const baseClass = "w-full px-4 py-2 pr-10 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
    if (touched[field] && errors[field]) {
      return `${baseClass} border-red-500 dark:border-red-500 focus:ring-red-500`
    }
    return `${baseClass} border-gray-300 dark:border-gray-600 focus:ring-orange-500`
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('changePassword')}</h2>

      <div className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('currentPassword')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) => handleChange('currentPassword', e.target.value)}
              onBlur={() => handleBlur('currentPassword')}
              className={getInputClassName('currentPassword')}
              placeholder={t('enterCurrentPassword')}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showCurrentPassword ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
            </button>
          </div>
          {renderError('currentPassword')}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('newPassword')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => handleChange('newPassword', e.target.value)}
              onBlur={() => handleBlur('newPassword')}
              className={getInputClassName('newPassword')}
              placeholder={t('enterNewPassword')}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
            </button>
          </div>
          {renderError('newPassword')}

          {/* Password strength indicator */}
          {passwordData.newPassword && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">{t('passwordRequirements')}</p>
              <div className="space-y-1">
                {PASSWORD_REQUIREMENTS.map(req => {
                  const passed = req.test(passwordData.newPassword)
                  return (
                    <div key={req.id} className="flex items-center gap-2 text-xs">
                      {passed ? (
                        <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600" />
                      )}
                      <span className={passed ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                        {req.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('confirmNewPassword')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              className={getInputClassName('confirmPassword')}
              placeholder={t('confirmNewPasswordPlaceholder')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
            </button>
          </div>
          {renderError('confirmPassword')}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handlePasswordChange}
          disabled={isSaving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
        >
          <IoShieldCheckmarkOutline className="w-5 h-5" />
          {isSaving ? t('changingPassword') : t('changePasswordButton')}
        </button>
      </div>
    </div>
  )
}
