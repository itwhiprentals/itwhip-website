// app/partner/settings/components/CompanyTab.tsx
'use client'

import { useState } from 'react'
import { IoSaveOutline, IoAlertCircleOutline } from 'react-icons/io5'

interface CompanyTabProps {
  settings: {
    companyName: string
    businessType: string
    taxId: string
    address: string
    city: string
    state: string
    zipCode: string
  }
  setSettings: (updater: (prev: any) => any) => void
  onSave: (section: string) => Promise<void>
  isSaving: boolean
}

interface ValidationErrors {
  companyName?: string
  businessType?: string
  taxId?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
}

// Validation helpers
const validateRequired = (value: string, fieldName: string): string | undefined => {
  if (!value.trim()) return `${fieldName} is required`
  return undefined
}

const validateTaxId = (taxId: string): string | undefined => {
  if (!taxId.trim()) return undefined // Optional field
  const einRegex = /^\d{2}-?\d{7}$/
  if (!einRegex.test(taxId.replace(/\s/g, ''))) return 'Please enter a valid EIN (XX-XXXXXXX)'
  return undefined
}

const validateZipCode = (zipCode: string): string | undefined => {
  if (!zipCode.trim()) return undefined // Optional
  const zipRegex = /^\d{5}(-\d{4})?$/
  if (!zipRegex.test(zipCode)) return 'Please enter a valid ZIP code'
  return undefined
}

const validateState = (state: string): string | undefined => {
  if (!state.trim()) return undefined // Optional
  if (state.trim().length !== 2) return 'Please use 2-letter state code (e.g., AZ)'
  return undefined
}

export function CompanyTab({ settings, setSettings, onSave, isSaving }: CompanyTabProps) {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = (field: keyof ValidationErrors, value: string) => {
    let error: string | undefined

    switch (field) {
      case 'companyName':
        error = validateRequired(value, 'Company name')
        break
      case 'taxId':
        error = validateTaxId(value)
        break
      case 'zipCode':
        error = validateZipCode(value)
        break
      case 'state':
        error = validateState(value)
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
      companyName: validateRequired(settings.companyName, 'Company name'),
      taxId: validateTaxId(settings.taxId),
      zipCode: validateZipCode(settings.zipCode),
      state: validateState(settings.state)
    }
    setErrors(newErrors)
    setTouched({
      companyName: true,
      businessType: true,
      taxId: true,
      address: true,
      city: true,
      state: true,
      zipCode: true
    })
    return !Object.values(newErrors).some(error => error !== undefined)
  }

  const handleSave = async () => {
    if (validateAll()) {
      await onSave('company')
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
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Company Information</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={settings.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            onBlur={() => handleBlur('companyName')}
            className={getInputClassName('companyName')}
            placeholder="Your Company LLC"
          />
          {renderError('companyName')}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Business Type
          </label>
          <select
            value={settings.businessType}
            onChange={(e) => handleChange('businessType', e.target.value)}
            className={getInputClassName('businessType')}
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
            onChange={(e) => handleChange('taxId', e.target.value)}
            onBlur={() => handleBlur('taxId')}
            placeholder="XX-XXXXXXX"
            className={getInputClassName('taxId')}
          />
          {renderError('taxId')}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Business Address
          </label>
          <input
            type="text"
            value={settings.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className={getInputClassName('address')}
            placeholder="123 Main Street"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            City
          </label>
          <input
            type="text"
            value={settings.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className={getInputClassName('city')}
            placeholder="Phoenix"
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
              onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
              onBlur={() => handleBlur('state')}
              className={getInputClassName('state')}
              placeholder="AZ"
              maxLength={2}
            />
            {renderError('state')}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ZIP Code
            </label>
            <input
              type="text"
              value={settings.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              onBlur={() => handleBlur('zipCode')}
              className={getInputClassName('zipCode')}
              placeholder="85001"
            />
            {renderError('zipCode')}
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
