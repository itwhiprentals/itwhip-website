'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5'

interface PasswordInputProps {
  id: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  label?: string
  autoFocus?: boolean
  required?: boolean
}

export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder,
  label,
  autoFocus = false,
  required = false
}: PasswordInputProps) {
  const t = useTranslations('Auth')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder || t('passwordPlaceholder')}
          autoFocus={autoFocus}
          className="w-full px-3 py-2.5 pr-10 bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={() => setShowPassword(prev => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          tabIndex={-1}
          aria-label={showPassword ? t('hidePassword') : t('showPassword')}
        >
          {showPassword ? (
            <IoEyeOffOutline className="w-5 h-5" />
          ) : (
            <IoEyeOutline className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  )
}
