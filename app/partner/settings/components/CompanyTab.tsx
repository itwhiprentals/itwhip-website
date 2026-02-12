// app/partner/settings/components/CompanyTab.tsx
'use client'

import { useState } from 'react'
import { IoSaveOutline, IoAlertCircleOutline, IoBusinessOutline, IoCheckmarkCircleOutline, IoTimeOutline, IoCloseCircleOutline } from 'react-icons/io5'

interface CompanyTabProps {
  settings: {
    companyName: string
    businessType: string
    taxId: string
    address: string
    city: string
    state: string
    zipCode: string
    isBusinessHost: boolean
    businessApprovalStatus: string
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

const validateTaxId = (taxId: string, isBusinessHost: boolean): string | undefined => {
  if (!taxId.trim()) {
    return isBusinessHost ? 'EIN is required for business hosts' : undefined
  }
  const einRegex = /^\d{2}-?\d{7}$/
  if (!einRegex.test(taxId.replace(/\s/g, ''))) return 'Please enter a valid EIN (XX-XXXXXXX)'
  return undefined
}

const validateZipCode = (zipCode: string): string | undefined => {
  if (!zipCode.trim()) return undefined
  const zipRegex = /^\d{5}(-\d{4})?$/
  if (!zipRegex.test(zipCode)) return 'Please enter a valid ZIP code'
  return undefined
}

const validateState = (state: string): string | undefined => {
  if (!state.trim()) return undefined
  if (state.trim().length !== 2) return 'Please use 2-letter state code (e.g., AZ)'
  return undefined
}

const approvalStatusBadge = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <IoCheckmarkCircleOutline className="w-3 h-3" /> Approved
        </span>
      )
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          <IoTimeOutline className="w-3 h-3" /> Pending Review
        </span>
      )
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          <IoCloseCircleOutline className="w-3 h-3" /> Rejected
        </span>
      )
    default:
      return null
  }
}

export function CompanyTab({ settings, setSettings, onSave, isSaving }: CompanyTabProps) {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [toggleError, setToggleError] = useState('')

  const validateField = (field: keyof ValidationErrors, value: string) => {
    let error: string | undefined

    switch (field) {
      case 'companyName':
        error = validateRequired(value, 'Company name')
        break
      case 'taxId':
        error = validateTaxId(value, settings.isBusinessHost)
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
    setSettings((prev: any) => ({ ...prev, [field]: value }))
    if (touched[field]) {
      validateField(field, value)
    }
  }

  const handleToggleBusinessHost = () => {
    const newValue = !settings.isBusinessHost
    setToggleError('')

    if (newValue) {
      // Validate requirements before enabling
      if (!settings.companyName.trim()) {
        setToggleError('Company name is required to enable business features')
        return
      }
      const einRegex = /^\d{2}-?\d{7}$/
      if (!settings.taxId.trim() || !einRegex.test(settings.taxId.replace(/\s/g, ''))) {
        setToggleError('A valid EIN (Tax ID) is required to enable business features')
        return
      }
    }

    setSettings((prev: any) => ({ ...prev, isBusinessHost: newValue }))
  }

  const validateAll = (): boolean => {
    const newErrors: ValidationErrors = {
      companyName: validateRequired(settings.companyName, 'Company name'),
      taxId: validateTaxId(settings.taxId, settings.isBusinessHost),
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
      {/* Business Host Toggle */}
      <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <IoBusinessOutline className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Business / Company Host</h3>
                {approvalStatusBadge(settings.businessApprovalStatus)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Operate your vehicles under your commercial/business license
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleBusinessHost}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
              settings.isBusinessHost ? 'bg-orange-600' : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.isBusinessHost ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        {settings.isBusinessHost && (
          <p className="text-xs text-orange-700 dark:text-orange-300 mt-3 pl-[52px]">
            This enables the business landing page feature. Your landing page will need to be submitted and approved before it goes live.
          </p>
        )}
        {toggleError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1 pl-[52px]">
            <IoAlertCircleOutline className="w-4 h-4 flex-shrink-0" />
            {toggleError}
          </p>
        )}
      </div>

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
            Tax ID (EIN) {settings.isBusinessHost && <span className="text-red-500">*</span>}
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
