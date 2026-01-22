// app/partner/settings/components/AccountTab.tsx
'use client'

import { useState } from 'react'
import { IoSaveOutline, IoAlertCircleOutline } from 'react-icons/io5'

interface AccountTabProps {
  settings: {
    firstName: string
    lastName: string
    email: string
    phone: string
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
  if (!phone.trim()) return undefined // Phone is optional
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
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

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
    setSettings(prev => ({ ...prev, [field]: value }))
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
        </div>

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
