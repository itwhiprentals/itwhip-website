// app/(guest)/profile/components/tabs/ProfileTab.tsx
// Also known as "Account" tab - includes photo upload, personal info, preferences
'use client'

import { useState, useRef, useMemo } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import {
  IoSaveOutline,
  IoCloseOutline,
  IoPencilOutline,
  IoCameraOutline,
  IoAlertCircleOutline,
  IoScanOutline,
  IoPersonCircleOutline,
  IoTrashOutline,
  IoNotificationsOutline,
  IoMailOutline,
  IoChatbubbleOutline,
  IoPhonePortraitOutline,
  IoGlobeOutline,
  IoCheckmarkCircleOutline,
  IoSendOutline
} from 'react-icons/io5'
import Image from 'next/image'
import DriverLicenseScanner, { type DriverLicenseData } from '@/app/components/DriverLicenseScanner'

interface ProfileTabProps {
  profile: {
    firstName?: string
    lastName?: string
    name: string  // Keep for backwards compatibility
    email: string
    phone: string
    bio?: string
    city?: string
    state?: string
    zipCode?: string
    emergencyContactName?: string
    emergencyContactPhone?: string
    emergencyContactRelation?: string
    dateOfBirth?: string
    driverLicenseNumber?: string
    driverLicenseState?: string
    driverLicenseExpiry?: string
    profilePhoto?: string
    // Verification status
    emailVerified?: boolean
    phoneVerified?: boolean
    // Preferences (from Settings)
    emailNotifications?: boolean
    smsNotifications?: boolean
    pushNotifications?: boolean
    preferredLanguage?: string
    preferredCurrency?: string
  }
  formData: {
    firstName: string
    lastName: string
    name: string  // Keep for backwards compatibility
    phone: string
    bio: string
    city: string
    state: string
    zipCode: string
    emergencyContactName: string
    emergencyContactPhone: string
    emergencyContactRelation: string
    dateOfBirth: string
    driverLicenseNumber: string
    driverLicenseState: string
    driverLicenseExpiry: string
    // Preferences
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    preferredLanguage: string
    preferredCurrency: string
  }
  editMode: boolean
  saving: boolean
  uploadingPhoto?: boolean
  onEditToggle: () => void
  onSave: () => void
  onCancel: () => void
  onFormChange: (data: Partial<ProfileTabProps['formData']>) => void
  onPhotoUpload?: (file: File) => void
  onPhotoRemove?: () => void
}

// Helper to format phone number as +1 (XXX) XXX-XXXX
function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '')

  // Remove leading 1 if present (we'll add it back)
  const phoneDigits = digits.startsWith('1') ? digits.slice(1) : digits

  if (phoneDigits.length === 0) return ''
  if (phoneDigits.length <= 3) return `+1 (${phoneDigits}`
  if (phoneDigits.length <= 6) return `+1 (${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3)}`
  return `+1 (${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3, 6)}-${phoneDigits.slice(6, 10)}`
}

// Helper to calculate age from date of birth
function calculateAge(dateOfBirth: string): number | null {
  if (!dateOfBirth) return null
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

// Helper to split full name into first/last
function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

const RELATIONSHIP_KEYS = [
  'mother', 'father', 'spouse', 'partner', 'sibling',
  'child', 'friend', 'other'
] as const

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

export default function ProfileTab({
  profile,
  formData,
  editMode,
  saving,
  uploadingPhoto = false,
  onEditToggle,
  onSave,
  onCancel,
  onFormChange,
  onPhotoUpload,
  onPhotoRemove
}: ProfileTabProps) {
  const t = useTranslations('ProfileTab')
  const locale = useLocale()
  const [showLicenseScanner, setShowLicenseScanner] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Bottom sheet states for email/phone changes
  const [showEmailSheet, setShowEmailSheet] = useState(false)
  const [showPhoneSheet, setShowPhoneSheet] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [phoneSaving, setPhoneSaving] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [phoneSuccess, setPhoneSuccess] = useState(false)
  const [sheetError, setSheetError] = useState('')

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert(t('imageFileOnly'))
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(t('imageTooLarge'))
        return
      }
      onPhotoUpload?.(file)
    }
    // Reset input to allow re-selecting same file
    if (e.target) e.target.value = ''
  }

  // Handle scanned license data
  const handleLicenseScan = (data: DriverLicenseData) => {
    setShowLicenseScanner(false)

    // Update form fields with scanned data
    const updates: Partial<typeof formData> = {}

    if (data.firstName) {
      updates.firstName = data.firstName
      updates.name = `${data.firstName} ${data.lastName || formData.lastName || ''}`.trim()
    }
    if (data.lastName) {
      updates.lastName = data.lastName
      updates.name = `${data.firstName || formData.firstName || ''} ${data.lastName}`.trim()
    }
    if (data.dateOfBirth) {
      updates.dateOfBirth = data.dateOfBirth
    }
    if (data.licenseNumber) {
      updates.driverLicenseNumber = data.licenseNumber
    }
    if (data.state) {
      updates.driverLicenseState = data.state
    }
    if (data.expirationDate) {
      updates.driverLicenseExpiry = data.expirationDate
    }
    if (data.city) {
      updates.city = data.city
    }
    if (data.zipCode) {
      updates.zipCode = data.zipCode
    }

    onFormChange(updates)
  }

  // Calculate age from DOB
  const age = useMemo(() => calculateAge(formData.dateOfBirth || profile.dateOfBirth || ''), [formData.dateOfBirth, profile.dateOfBirth])

  // Get first/last name from profile (split if only full name available)
  const profileFirstName = profile.firstName || splitName(profile.name || '').firstName
  const profileLastName = profile.lastName || splitName(profile.name || '').lastName

  // Check for validation errors
  const firstNameMissing = editMode && !formData.firstName?.trim()
  const lastNameMissing = editMode && !formData.lastName?.trim()
  const phoneMissing = !formData.phone?.trim() && !profile.phone?.trim()

  const handleInputChange = (field: string, value: string) => {
    onFormChange({ [field]: value })
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value)
    onFormChange({ phone: formatted })
  }

  const handleNameChange = (field: 'firstName' | 'lastName', value: string) => {
    onFormChange({
      [field]: value,
      // Also update the combined name field for backwards compatibility
      name: field === 'firstName'
        ? `${value} ${formData.lastName || ''}`.trim()
        : `${formData.firstName || ''} ${value}`.trim()
    })
  }

  // Open email change sheet
  const openEmailSheet = () => {
    setNewEmail('')
    setEmailSent(false)
    setSheetError('')
    setShowEmailSheet(true)
  }

  // Open phone change sheet
  const openPhoneSheet = () => {
    setNewPhone(profile.phone || '')
    setPhoneSuccess(false)
    setSheetError('')
    setShowPhoneSheet(true)
  }

  // Handle email change request - sends verification email
  const handleEmailChangeRequest = async () => {
    if (!newEmail.trim()) {
      setSheetError(t('enterValidEmail'))
      return
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      setSheetError(t('invalidEmail'))
      return
    }
    if (newEmail.toLowerCase() === profile.email.toLowerCase()) {
      setSheetError(t('newEmailDifferent'))
      return
    }

    setEmailSending(true)
    setSheetError('')
    try {
      const response = await fetch('/api/guest/email/change-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newEmail })
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setEmailSent(true)
      } else {
        setSheetError(data.error || t('failedSendVerification'))
      }
    } catch {
      setSheetError(t('failedSendVerification'))
    } finally {
      setEmailSending(false)
    }
  }

  // Handle phone number change - redirect to verification
  const handlePhoneUpdate = async () => {
    const formattedPhone = formatPhoneNumber(newPhone)
    if (!formattedPhone || formattedPhone.length < 10) {
      setSheetError(t('enterValidPhone'))
      return
    }

    setPhoneSaving(true)
    setSheetError('')

    try {
      // First, update the phone in the database (unverified)
      const response = await fetch('/api/guest/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          phone: formattedPhone,
          phoneVerified: false // Mark as unverified when changed
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Close the sheet
        setShowPhoneSheet(false)

        // Redirect to phone verification with return URL
        window.location.href = `/auth/verify-phone?phone=${encodeURIComponent(formattedPhone)}&returnTo=/profile?tab=account`
      } else {
        setSheetError(data.error || t('failedUpdatePhone'))
      }
    } catch (error) {
      setSheetError(t('failedUpdatePhone'))
    } finally {
      setPhoneSaving(false)
    }
  }

  return (
    <div>
      {/* Profile Photo Section */}
      <div className="mb-4">
        <div className="flex items-center gap-3">
          {/* Current Photo - CIRCULAR - Smaller */}
          <div className="relative flex-shrink-0">
            <div
              className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 cursor-pointer group"
              onClick={handlePhotoClick}
            >
              {profile.profilePhoto ? (
                <Image
                  src={profile.profilePhoto}
                  alt={profile.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                  <IoPersonCircleOutline className="w-8 h-8 text-white/80" />
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                {uploadingPhoto ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <IoCameraOutline className="w-5 h-5 text-white" />
                )}
              </div>
            </div>
          </div>

          {/* Name & Age Display */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {profile.name || t('guest')}
            </h2>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {age !== null && <span>{t('yearsOld', { age })}</span>}
              <span>•</span>
              <span className="cursor-pointer hover:text-green-600" onClick={handlePhotoClick}>
                {profile.profilePhoto ? t('tapPhotoToChange') : t('tapPhotoToAdd')}
              </span>
            </div>
            {profile.profilePhoto && onPhotoRemove && (
              <button
                onClick={onPhotoRemove}
                disabled={uploadingPhoto}
                className="mt-1 text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <IoTrashOutline className="w-3 h-3" />
                {t('remove')}
              </button>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Phone Missing Banner */}
      {phoneMissing && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg shadow-sm">
          <div className="flex items-start gap-2.5">
            <IoAlertCircleOutline className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                {t('phoneRequired')}
              </h3>
              <p className="text-xs text-red-800 dark:text-red-300">
                {t('phoneRequiredDesc')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('personalInfo')}</h2>
          {!editMode && (
            <button
              onClick={onEditToggle}
              className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-medium rounded-md transition-colors"
            >
              <IoPencilOutline className="w-3 h-3" />
              <span>{t('edit')}</span>
            </button>
          )}
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
          {t('updateProfileEmergency')}
        </p>
      </div>

      {/* Driver License Section - First for easy access */}
      <div className="mb-6">
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {t('driverLicenseInfo')}
            </h3>
            {editMode && (
              <button
                type="button"
                onClick={() => setShowLicenseScanner(true)}
                className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-medium rounded-md transition-colors"
              >
                <IoScanOutline className="w-3 h-3" />
                {t('scanLicense')}
              </button>
            )}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            {t('requiredForRentals')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Driver License Number */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('licenseNumber')}
            </label>
            {editMode ? (
              <input
                type="text"
                value={formData.driverLicenseNumber}
                onChange={(e) => handleInputChange('driverLicenseNumber', e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-sm border border-gray-400 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                placeholder="D12345678"
              />
            ) : (
              <p className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white shadow-sm">
                {profile.driverLicenseNumber || t('notSet')}
              </p>
            )}
          </div>

          {/* Driver License State */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('issuingState')}
            </label>
            {editMode ? (
              <select
                value={formData.driverLicenseState}
                onChange={(e) => handleInputChange('driverLicenseState', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-400 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="">{t('selectState')}</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            ) : (
              <p className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white shadow-sm">
                {profile.driverLicenseState || t('notSet')}
              </p>
            )}
          </div>

          {/* Driver License Expiry */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('expirationDate')}
            </label>
            {editMode ? (
              <input
                type="date"
                value={formData.driverLicenseExpiry}
                onChange={(e) => handleInputChange('driverLicenseExpiry', e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 border border-gray-400 dark:border-gray-500`}
              />
            ) : (
              <p className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white shadow-sm">
                {profile.driverLicenseExpiry ? new Date(profile.driverLicenseExpiry).toLocaleDateString(locale) : t('notSet')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('basicInfo')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* First Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('firstName')} <span className="text-red-500">*</span>
            </label>
            {editMode ? (
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleNameChange('firstName', e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 ${
                  firstNameMissing
                    ? 'border-2 border-red-500 dark:border-red-500'
                    : 'border border-gray-400 dark:border-gray-500'
                }`}
                placeholder="John"
              />
            ) : (
              <p className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white shadow-sm">
                {profileFirstName || <span className="text-red-500">{t('notSet')}</span>}
              </p>
            )}
            {firstNameMissing && (
              <p className="text-[10px] text-red-500 mt-1">{t('firstNameRequired')}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('lastName')} <span className="text-red-500">*</span>
            </label>
            {editMode ? (
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleNameChange('lastName', e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 ${
                  lastNameMissing
                    ? 'border-2 border-red-500 dark:border-red-500'
                    : 'border border-gray-400 dark:border-gray-500'
                }`}
                placeholder="Doe"
              />
            ) : (
              <p className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white shadow-sm">
                {profileLastName || <span className="text-red-500">{t('notSet')}</span>}
              </p>
            )}
            {lastNameMissing && (
              <p className="text-[10px] text-red-500 mt-1">{t('lastNameRequired')}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('emailAddress')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <p className="px-3 py-2 pr-20 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white shadow-sm">
                {profile.email}
              </p>
              <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                profile.emailVerified
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
              }`}>
                {profile.emailVerified ? t('verified') : t('notVerified')}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
              {t('changeEmailHint')}{' '}
              <button
                type="button"
                onClick={openEmailSheet}
                className="text-green-600 dark:text-green-400 hover:underline"
              >
                {t('clickHere')}
              </button>
            </p>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('phoneNumber')} <span className="text-red-500">*</span>
            </label>
            {editMode ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 ${
                  phoneMissing
                    ? 'border-2 border-red-500 dark:border-red-500'
                    : 'border border-gray-400 dark:border-gray-500'
                }`}
                placeholder="+1 (555) 123-4567"
              />
            ) : (
              <div className="relative">
                <p className={`px-3 py-2 pr-20 text-sm bg-gray-100 dark:bg-gray-800 border rounded-lg shadow-sm ${
                  phoneMissing
                    ? 'border-2 border-red-500 dark:border-red-500 text-red-500'
                    : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
                }`}>
                  {profile.phone ? formatPhoneNumber(profile.phone) : <span className="text-red-500">{t('notSetRequired')}</span>}
                </p>
                {profile.phone && (
                  <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    profile.phoneVerified
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  }`}>
                    {profile.phoneVerified ? t('verified') : t('notVerified')}
                  </span>
                )}
              </div>
            )}
            {phoneMissing && editMode && (
              <p className="text-[10px] text-red-500 mt-1">{t('phoneRequired')}</p>
            )}
            {!editMode && (
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                {t('changePhoneHint')}{' '}
                <button
                  type="button"
                  onClick={openPhoneSheet}
                  className="text-green-600 dark:text-green-400 hover:underline"
                >
                  {t('clickHere')}
                </button>
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('dateOfBirth')}
              {age !== null && (
                <span className="ml-2 text-green-600 dark:text-green-400 font-normal">
                  ({t('ageLabel', { age })})
                </span>
              )}
            </label>
            {editMode ? (
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 border border-gray-400 dark:border-gray-500`}
              />
            ) : (
              <p className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white shadow-sm">
                {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString(locale) : t('notSet')}
                {age !== null && !editMode && (
                  <span className="ml-2 text-green-600 dark:text-green-400">({t('yearsOld', { age })})</span>
                )}
              </p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('city')}
            </label>
            {editMode ? (
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-400 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                placeholder="Phoenix"
              />
            ) : (
              <p className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white shadow-sm">
                {profile.city || t('notSet')}
              </p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('state')}
            </label>
            {editMode ? (
              <select
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-400 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="">{t('selectState')}</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            ) : (
              <p className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white shadow-sm">
                {profile.state || t('notSet')}
              </p>
            )}
          </div>

          {/* Zip Code */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('zipCode')}
            </label>
            {editMode ? (
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-400 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                placeholder="85001"
                maxLength={5}
              />
            ) : (
              <p className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white shadow-sm">
                {profile.zipCode || t('notSet')}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('bio')}
          </label>
          {editMode ? (
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-400 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              placeholder={t('tellUsAboutYourself')}
            />
          ) : (
            <p className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white shadow-sm min-h-[70px]">
              {profile.bio || t('noBioYet')}
            </p>
          )}
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          {t('emergencyContact')} <span className="text-red-500">*</span>
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          {t('emergencyContactDesc')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Emergency Contact Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('fullName')} <span className="text-red-500">*</span>
            </label>
            {editMode ? (
              <input
                type="text"
                value={formData.emergencyContactName}
                onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-400 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                placeholder={t('contactName')}
              />
            ) : (
              <p className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white shadow-sm">
                {profile.emergencyContactName || t('notSet')}
              </p>
            )}
          </div>

          {/* Emergency Contact Phone */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('phoneNumber')} <span className="text-red-500">*</span>
            </label>
            {editMode ? (
              <input
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value)
                  handleInputChange('emergencyContactPhone', formatted)
                }}
                className="w-full px-3 py-2 text-sm border border-gray-400 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                placeholder="+1 (555) 987-6543"
              />
            ) : (
              <p className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white shadow-sm">
                {profile.emergencyContactPhone ? formatPhoneNumber(profile.emergencyContactPhone) : t('notSet')}
              </p>
            )}
          </div>

          {/* Relationship */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('relationship')}
            </label>
            {editMode ? (
              <select
                value={formData.emergencyContactRelation}
                onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-400 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="">{t('selectRelationship')}</option>
                {RELATIONSHIP_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {t(`rel_${key}`)}
                  </option>
                ))}
              </select>
            ) : (
              <p className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white shadow-sm">
                {profile.emergencyContactRelation ? t(`rel_${profile.emergencyContactRelation.toLowerCase()}`) : t('notSet')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('preferences')}</h3>

        {/* Notification Preferences */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
            <IoNotificationsOutline className="w-4 h-4" />
            {t('notificationSettings')}
          </h4>
          <div className="space-y-2">
            {/* Email Notifications */}
            <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
              <div className="flex items-center gap-2">
                <IoMailOutline className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-white">{t('emailNotifications')}</span>
              </div>
              {editMode ? (
                <input
                  type="checkbox"
                  checked={formData.emailNotifications}
                  onChange={(e) => onFormChange({ emailNotifications: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
              ) : (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  profile.emailNotifications !== false
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {profile.emailNotifications !== false ? t('on') : t('off')}
                </span>
              )}
            </label>

            {/* SMS Notifications */}
            <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
              <div className="flex items-center gap-2">
                <IoChatbubbleOutline className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-white">{t('smsNotifications')}</span>
              </div>
              {editMode ? (
                <input
                  type="checkbox"
                  checked={formData.smsNotifications}
                  onChange={(e) => onFormChange({ smsNotifications: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
              ) : (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  profile.smsNotifications !== false
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {profile.smsNotifications !== false ? t('on') : t('off')}
                </span>
              )}
            </label>

            {/* Push Notifications */}
            <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
              <div className="flex items-center gap-2">
                <IoPhonePortraitOutline className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-white">{t('pushNotifications')}</span>
              </div>
              {editMode ? (
                <input
                  type="checkbox"
                  checked={formData.pushNotifications}
                  onChange={(e) => onFormChange({ pushNotifications: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
              ) : (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  profile.pushNotifications !== false
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {profile.pushNotifications !== false ? t('on') : t('off')}
                </span>
              )}
            </label>
          </div>
        </div>

        {/* Language & Currency */}
        <div>
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
            <IoGlobeOutline className="w-4 h-4" />
            {t('languageCurrency')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Language */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                {t('preferredLanguage')}
              </label>
              {editMode ? (
                <select
                  value={formData.preferredLanguage}
                  onChange={(e) => onFormChange({ preferredLanguage: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-400 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white shadow-sm">
                  {LANGUAGES.find(l => l.code === (profile.preferredLanguage || 'en'))?.name || 'English'}
                </p>
              )}
            </div>

            {/* Currency */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                {t('preferredCurrency')}
              </label>
              {editMode ? (
                <select
                  value={formData.preferredCurrency}
                  onChange={(e) => onFormChange({ preferredCurrency: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-400 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.symbol} {curr.code} - {curr.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white shadow-sm">
                  {(() => {
                    const curr = CURRENCIES.find(c => c.code === (profile.preferredCurrency || 'USD'))
                    return curr ? `${curr.symbol} ${curr.code} - ${curr.name}` : '$ USD - US Dollar'
                  })()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {editMode && (
        <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 min-h-[36px] text-sm border border-gray-400 dark:border-gray-500 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <IoCloseOutline className="w-4 h-4 inline mr-1.5" />
            {t('cancel')}
          </button>
          <button
            onClick={onSave}
            disabled={saving || firstNameMissing || lastNameMissing}
            className="px-4 py-2 min-h-[36px] text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                <span>{t('saving')}</span>
              </>
            ) : (
              <>
                <IoSaveOutline className="w-4 h-4" />
                <span>{t('saveChanges')}</span>
              </>
            )}
          </button>
        </div>
      )}
      {editMode && (firstNameMissing || lastNameMissing) && (
        <p className="text-xs text-red-500 text-right mt-2">
          {t('requiredFieldsMissing')}
        </p>
      )}

      {/* Driver License Scanner Modal */}
      {showLicenseScanner && (
        <DriverLicenseScanner
          onScan={handleLicenseScan}
          onClose={() => setShowLicenseScanner(false)}
        />
      )}

      {/* Email Change Bottom Sheet */}
      {showEmailSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !emailSending && setShowEmailSheet(false)}
          />
          {/* Sheet */}
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('changeEmail')}</h3>
              <button
                onClick={() => setShowEmailSheet(false)}
                disabled={emailSending}
                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <IoCloseOutline className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {emailSent ? (
                <div className="text-center py-6">
                  <IoCheckmarkCircleOutline className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t('verificationEmailSent')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {t('emailSentTo', { email: newEmail })}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {t('linkExpires24h')}
                  </p>
                  <button
                    onClick={() => setShowEmailSheet(false)}
                    className="mt-6 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                  >
                    {t('done')}
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {t('currentEmail')}: <strong>{profile.email}</strong>
                    </p>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('newEmailAddress')}
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder={t('enterNewEmail')}
                      autoComplete="email"
                    />
                  </div>

                  {sheetError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-400">{sheetError}</p>
                    </div>
                  )}

                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <strong>{t('note')}:</strong> {t('emailVerificationNote')}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowEmailSheet(false)}
                      disabled={emailSending}
                      className="flex-1 px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      onClick={handleEmailChangeRequest}
                      disabled={emailSending || !newEmail.trim()}
                      className="flex-1 px-4 py-2.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {emailSending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          {t('sending')}
                        </>
                      ) : (
                        <>
                          <IoSendOutline className="w-4 h-4" />
                          {t('sendVerification')}
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Phone Change Bottom Sheet */}
      {showPhoneSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !phoneSaving && setShowPhoneSheet(false)}
          />
          {/* Sheet */}
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('changePhone')}</h3>
              <button
                onClick={() => setShowPhoneSheet(false)}
                disabled={phoneSaving}
                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <IoCloseOutline className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {phoneSuccess ? (
                <div className="text-center py-6">
                  <IoCheckmarkCircleOutline className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t('phoneUpdated')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('phoneUpdatedDesc')}
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {t('currentPhone')}: <strong>{profile.phone ? formatPhoneNumber(profile.phone) : t('notSet')}</strong>
                    </p>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('newPhoneNumber')}
                    </label>
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(formatPhoneNumber(e.target.value))}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="+1 (555) 123-4567"
                      autoComplete="tel"
                    />
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <strong>{t('note')}:</strong> {t('phoneUpdateNote')}
                    </p>
                  </div>

                  {sheetError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-400">{sheetError}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowPhoneSheet(false)}
                      disabled={phoneSaving}
                      className="flex-1 px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      onClick={handlePhoneUpdate}
                      disabled={phoneSaving || !newPhone.trim()}
                      className="flex-1 px-4 py-2.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {phoneSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          {t('saving')}
                        </>
                      ) : (
                        <>
                          <IoSaveOutline className="w-4 h-4" />
                          {t('savePhoneNumber')}
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}