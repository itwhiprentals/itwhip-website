// app/partner/settings/components/AccountTab.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IoSaveOutline, IoAlertCircleOutline, IoCheckmarkCircleOutline, IoMailOutline, IoCallOutline } from 'react-icons/io5'

interface AccountTabProps {
  settings: {
    firstName: string
    lastName: string
    email: string
    phone: string
    emailVerified: boolean
    phoneVerified: boolean
  }
  setSettings: (updater: (prev: any) => any) => void
  onSave: (section: string) => Promise<void>
  isSaving: boolean
}

interface ValidationErrors {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
}

// Validation helpers
const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) return 'Email is required'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Please enter a valid email address'
  return undefined
}

const validatePhone = (phone: string): string | undefined => {
  if (!phone.trim()) return undefined
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/
  if (!phoneRegex.test(phone)) return 'Please enter a valid phone number'
  return undefined
}

const validateName = (name: string, fieldName: string): string | undefined => {
  if (!name.trim()) return `${fieldName} is required`
  if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`
  return undefined
}

export function AccountTab({ settings, setSettings, onSave, isSaving }: AccountTabProps) {
  const router = useRouter()
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [emailVerifySending, setEmailVerifySending] = useState(false)
  const [emailVerifyMessage, setEmailVerifyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const validateField = (field: keyof ValidationErrors, value: string) => {
    let error: string | undefined

    switch (field) {
      case 'firstName':
        error = validateName(value, 'First name')
        break
      case 'lastName':
        error = validateName(value, 'Last name')
        break
      case 'email':
        error = validateEmail(value)
        break
      case 'phone':
        error = validatePhone(value)
        break
    }

    setErrors(prev => ({ ...prev, [field]: error }))
    return !error
  }

  const handleBlur = (field: keyof ValidationErrors) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    validateField(field, settings[field])
  }

  const handleChange = (field: keyof ValidationErrors, value: string) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }))
    if (touched[field]) {
      validateField(field, value)
    }
  }

  const validateAll = (): boolean => {
    const newErrors: ValidationErrors = {
      firstName: validateName(settings.firstName, 'First name'),
      lastName: validateName(settings.lastName, 'Last name'),
      email: validateEmail(settings.email),
      phone: validatePhone(settings.phone)
    }
    setErrors(newErrors)
    setTouched({ firstName: true, lastName: true, email: true, phone: true })
    return !Object.values(newErrors).some(error => error !== undefined)
  }

  const handleSave = async () => {
    if (validateAll()) {
      await onSave('account')
    }
  }

  const handleSendEmailVerification = async () => {
    setEmailVerifySending(true)
    setEmailVerifyMessage(null)
    try {
      const res = await fetch('/api/partner/email/send-verification', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setEmailVerifyMessage({ type: 'success', text: `Verification email sent to ${settings.email}` })
      } else {
        setEmailVerifyMessage({ type: 'error', text: data.error || 'Failed to send verification email' })
      }
    } catch {
      setEmailVerifyMessage({ type: 'error', text: 'Failed to send verification email' })
    } finally {
      setEmailVerifySending(false)
    }
  }

  const handleVerifyPhone = () => {
    const phone = settings.phone?.replace(/[^\d+]/g, '') || ''
    const formatted = phone.startsWith('+') ? phone : `+1${phone}`
    router.push(`/auth/verify-phone?phone=${encodeURIComponent(formatted)}&returnTo=${encodeURIComponent('/partner/settings?tab=account')}&roleHint=host`)
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
    const baseClass = "w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
    if (touched[field] && errors[field]) {
      return `${baseClass} border-red-500 dark:border-red-500 focus:ring-red-500`
    }
    return `${baseClass} border-gray-300 dark:border-gray-600 focus:ring-orange-500`
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Information</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={settings.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            className={getInputClassName('firstName')}
            placeholder="John"
          />
          {renderError('firstName')}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={settings.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            className={getInputClassName('lastName')}
            placeholder="Doe"
          />
          {renderError('lastName')}
        </div>

        {/* Email with verification */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={settings.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            className={getInputClassName('email')}
            placeholder="john@example.com"
          />
          {renderError('email')}
          <div className="mt-2 flex items-center gap-2">
            {settings.emailVerified ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <IoCheckmarkCircleOutline className="w-3 h-3" /> Verified
              </span>
            ) : (
              <button
                onClick={handleSendEmailVerification}
                disabled={emailVerifySending}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
              >
                <IoMailOutline className="w-3 h-3" />
                {emailVerifySending ? 'Sending...' : 'Verify Email'}
              </button>
            )}
          </div>
          {emailVerifyMessage && (
            <p className={`mt-1 text-xs ${emailVerifyMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {emailVerifyMessage.text}
            </p>
          )}
        </div>

        {/* Phone with verification */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={settings.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            className={getInputClassName('phone')}
            placeholder="(555) 123-4567"
          />
          {renderError('phone')}
          <div className="mt-2 flex items-center gap-2">
            {settings.phoneVerified ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <IoCheckmarkCircleOutline className="w-3 h-3" /> Verified
              </span>
            ) : settings.phone ? (
              <button
                onClick={handleVerifyPhone}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
              >
                <IoCallOutline className="w-3 h-3" />
                Verify Phone
              </button>
            ) : (
              <span className="text-xs text-gray-400 dark:text-gray-500">Add phone to verify</span>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
        >
          <IoSaveOutline className="w-5 h-5" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
