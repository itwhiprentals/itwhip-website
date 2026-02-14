'use client'

import { useTranslations } from 'next-intl'
import { IoPersonOutline } from 'react-icons/io5'
import DatePicker from 'react-datepicker'

interface SecondDriverFormProps {
  showSecondDriver: boolean
  onToggle: (show: boolean) => void
  secondDriverFirstName: string
  onFirstNameChange: (value: string) => void
  secondDriverLastName: string
  onLastNameChange: (value: string) => void
  secondDriverAge: Date | null
  onAgeChange: (date: Date | null) => void
  secondDriverLicense: string
  onLicenseChange: (value: string) => void
  onRemove: () => void
}

export function SecondDriverForm({
  showSecondDriver,
  onToggle,
  secondDriverFirstName,
  onFirstNameChange,
  secondDriverLastName,
  onLastNameChange,
  secondDriverAge,
  onAgeChange,
  secondDriverLicense,
  onLicenseChange,
  onRemove
}: SecondDriverFormProps) {
  const t = useTranslations('BookingPage')

  return (
    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      {!showSecondDriver ? (
        <>
          <button
            type="button"
            className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 transition-colors"
            onClick={() => onToggle(true)}
          >
            <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">+</span>
            {t('addSecondDriver')}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('additionalDriversNote')}
          </p>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <IoPersonOutline className="w-4 h-4" />
              {t('secondDriverInfo')}
              <span className="text-xs font-normal text-amber-600 dark:text-amber-400">{t('additionalDriverFee')}</span>
            </h3>
            <button
              type="button"
              onClick={onRemove}
              className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
            >
              {t('remove')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('firstName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={secondDriverFirstName}
                onChange={(e) => onFirstNameChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 dark:text-white"
                placeholder="Jane"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('lastName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={secondDriverLastName}
                onChange={(e) => onLastNameChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 dark:text-white"
                placeholder="Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('dateOfBirth')} <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={secondDriverAge}
                onChange={(date) => onAgeChange(date)}
                showYearDropdown
                showMonthDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={100}
                dateFormat="MM/dd/yyyy"
                placeholderText={t('selectDateOfBirth')}
                className="w-full px-2 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 cursor-pointer"
                wrapperClassName="w-full"
                calendarClassName="!rounded-xl !border-0 !shadow-xl"
                popperClassName="!z-50"
              />
              <p className="text-xs text-gray-500 mt-1">{t('mustBe21OrOlder')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('driversLicenseNumber')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={secondDriverLicense}
                onChange={(e) => onLicenseChange(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 dark:text-white"
                placeholder="D12345678"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('secondDriverNote')}
          </p>
        </div>
      )}
    </div>
  )
}
