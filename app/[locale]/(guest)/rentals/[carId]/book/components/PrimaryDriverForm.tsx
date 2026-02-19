'use client'

import { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import DatePicker from 'react-datepicker'
import {
  IoPersonOutline,
  IoCheckmarkCircle,
  IoCheckmarkCircleOutline,
  IoCheckmarkOutline,
  IoCloseCircle,
  IoCloseCircleOutline,
  IoWarningOutline
} from 'react-icons/io5'

interface FieldValidation {
  isValid: boolean
  error: string | null
}

interface EmailValidation extends FieldValidation {
  suggestion: string | null
}

interface AgeValidation extends FieldValidation {
  age: number | null
}

interface PrimaryDriverFormProps {
  driverFirstName: string
  driverLastName: string
  driverAge: Date | null
  driverLicense: string
  driverPhone: string
  driverEmail: string
  firstNameValidation: FieldValidation
  lastNameValidation: FieldValidation
  ageValidation: AgeValidation
  phoneValidation: FieldValidation
  emailValidation: EmailValidation
  onFirstNameChange: (value: string) => void
  onLastNameChange: (value: string) => void
  onDobChange: (date: Date | null) => void
  onLicenseChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onEmailChange: (value: string) => void
  onAcceptEmailSuggestion: () => void
  minimumAge: number
  userProfile: { documentsVerified?: boolean; phone?: string; email?: string } | null
  children?: ReactNode
}

export function PrimaryDriverForm({
  driverFirstName,
  driverLastName,
  driverAge,
  driverLicense,
  driverPhone,
  driverEmail,
  firstNameValidation,
  lastNameValidation,
  ageValidation,
  phoneValidation,
  emailValidation,
  onFirstNameChange,
  onLastNameChange,
  onDobChange,
  onLicenseChange,
  onPhoneChange,
  onEmailChange,
  onAcceptEmailSuggestion,
  minimumAge,
  userProfile,
  children
}: PrimaryDriverFormProps) {
  const t = useTranslations('BookingPage')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 mb-4 shadow-sm border border-gray-300 dark:border-gray-600">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center flex-wrap gap-2">
        <IoPersonOutline className="w-5 h-5" />
        <span>{t('primaryDriverInformation')}</span>
        <span className="text-xs font-normal text-gray-500 dark:text-gray-400">{t('accountHolder')}</span>
        {userProfile?.documentsVerified && (
          <span className="text-xs text-green-600 dark:text-green-400">
            {t('autoFilled')}
          </span>
        )}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('firstName')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={driverFirstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 dark:text-white ${
                driverFirstName && firstNameValidation.isValid
                  ? 'border-green-500 dark:border-green-500'
                  : driverFirstName && firstNameValidation.error
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="John"
              required
            />
            {driverFirstName && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {firstNameValidation.isValid ? (
                  <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                ) : firstNameValidation.error ? (
                  <IoCloseCircle className="w-5 h-5 text-red-500" />
                ) : null}
              </div>
            )}
          </div>
          {driverFirstName && firstNameValidation.error && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <IoCloseCircleOutline className="w-3.5 h-3.5" />
              {firstNameValidation.error}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('lastName')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={driverLastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 dark:text-white ${
                driverLastName && lastNameValidation.isValid
                  ? 'border-green-500 dark:border-green-500'
                  : driverLastName && lastNameValidation.error
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Doe"
              required
            />
            {driverLastName && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {lastNameValidation.isValid ? (
                  <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                ) : lastNameValidation.error ? (
                  <IoCloseCircle className="w-5 h-5 text-red-500" />
                ) : null}
              </div>
            )}
          </div>
          {driverLastName && lastNameValidation.error && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <IoCloseCircleOutline className="w-3.5 h-3.5" />
              {lastNameValidation.error}
            </p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('dateOfBirth')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DatePicker
              selected={driverAge}
              onChange={(date) => onDobChange(date)}
              showYearDropdown
              showMonthDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={100}
              dateFormat="MM/dd/yyyy"
              placeholderText={t('selectDateOfBirth')}
              className={`w-full px-2 py-2 pr-10 bg-white dark:bg-gray-700 border rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 cursor-pointer ${
                driverAge && ageValidation.isValid
                  ? 'border-green-500 dark:border-green-500'
                  : driverAge && ageValidation.error
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-200 dark:border-gray-600'
              }`}
              wrapperClassName="w-full"
              calendarClassName="!rounded-xl !border-0 !shadow-xl"
              popperClassName="!z-50"
              required
            />
            {driverAge && ageValidation.isValid && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
              </div>
            )}
            {driverAge && ageValidation.error && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <IoCloseCircle className="w-5 h-5 text-red-500" />
              </div>
            )}
          </div>
          {driverAge && ageValidation.error ? (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <IoCloseCircleOutline className="w-3.5 h-3.5" />
              {ageValidation.error}
            </p>
          ) : driverAge && ageValidation.isValid && ageValidation.age ? (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
              <IoCheckmarkCircleOutline className="w-3.5 h-3.5" />
              {t('youAreYearsOld', { age: ageValidation.age })}
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">{t('mustBePlusToRent', { age: minimumAge })}</p>
          )}
        </div>

        {/* Driver's License */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('driversLicenseNumber')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={driverLicense}
              onChange={(e) => onLicenseChange(e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 dark:text-white ${
                driverLicense && driverLicense.length >= 3
                  ? 'border-green-500 dark:border-green-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="D12345678"
              required
            />
            {driverLicense && driverLicense.length >= 3 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
              </div>
            )}
          </div>
          {driverLicense && driverLicense.length >= 3 && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
              <IoCheckmarkOutline className="w-3.5 h-3.5" />
              {t('validLicenseNumber')}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('phoneNumber')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="tel"
              value={driverPhone}
              onChange={(e) => onPhoneChange(e.target.value)}
              disabled={!!userProfile?.phone}
              className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 ${
                driverPhone && phoneValidation.isValid
                  ? 'border-green-500 dark:border-green-500'
                  : driverPhone && phoneValidation.error
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="(855) 703-0806"
              required
            />
            {driverPhone && !userProfile?.phone && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {phoneValidation.isValid ? (
                  <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                ) : phoneValidation.error ? (
                  <IoCloseCircle className="w-5 h-5 text-red-500" />
                ) : null}
              </div>
            )}
          </div>
          {driverPhone && phoneValidation.error && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <IoCloseCircleOutline className="w-3.5 h-3.5" />
              {phoneValidation.error}
            </p>
          )}
          {driverPhone && phoneValidation.isValid && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
              <IoCheckmarkOutline className="w-3.5 h-3.5" />
              {t('validPhoneNumber')}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('emailAddress')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              value={driverEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              disabled={!!userProfile?.email}
              className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 ${
                driverEmail && emailValidation.isValid
                  ? 'border-green-500 dark:border-green-500'
                  : driverEmail && (emailValidation.error || emailValidation.suggestion)
                    ? 'border-orange-500 dark:border-orange-500'
                    : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="john@example.com"
              required
            />
            {driverEmail && !userProfile?.email && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {emailValidation.isValid ? (
                  <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                ) : emailValidation.error || emailValidation.suggestion ? (
                  <IoWarningOutline className="w-5 h-5 text-orange-500" />
                ) : null}
              </div>
            )}
          </div>
          {driverEmail && emailValidation.error && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <IoCloseCircleOutline className="w-3.5 h-3.5" />
              {emailValidation.error}
            </p>
          )}
          {driverEmail && emailValidation.suggestion && (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-orange-600 dark:text-orange-400">
                {emailValidation.suggestion}
              </p>
              <button
                type="button"
                onClick={onAcceptEmailSuggestion}
                className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-500 underline font-medium"
              >
                {t('yesFix')}
              </button>
            </div>
          )}
          {driverEmail && emailValidation.isValid && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
              <IoCheckmarkOutline className="w-3.5 h-3.5" />
              {t('validEmailAddress')}
            </p>
          )}
        </div>
      </div>

      {children}
    </div>
  )
}
