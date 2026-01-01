// app/components/ui/DateInput.tsx
'use client'

import { useEffect, useState } from 'react'

interface DateInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
  disabled?: boolean
  min?: string
  max?: string
  helperText?: string
  error?: string
  defaultToToday?: boolean
  className?: string
  id?: string
}

/**
 * Reusable date input component with:
 * - Proper mobile formatting/alignment for iOS/Safari
 * - Optional today's date as default when empty
 * - Consistent styling across the app
 * - Placeholder text support
 */
export function DateInput({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  min,
  max,
  helperText,
  error,
  defaultToToday = false,
  className = '',
  id
}: DateInputProps) {
  const [internalValue, setInternalValue] = useState(value)

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]

  // Set default to today if enabled and no value provided
  useEffect(() => {
    if (defaultToToday && !value && !internalValue) {
      setInternalValue(today)
      onChange(today)
    }
  }, [defaultToToday, value, internalValue, today, onChange])

  // Sync internal value with external value
  useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value)
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)
    onChange(newValue)
  }

  const isEmpty = !internalValue

  return (
    <div className={`min-w-0 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={id}
        type="date"
        value={internalValue}
        onChange={handleChange}
        disabled={disabled}
        min={min}
        max={max}
        required={required}
        placeholder="Select date"
        style={{ textAlign: 'left', WebkitAppearance: 'none' }}
        className={`
          w-full px-3 py-2
          border rounded-lg
          focus:ring-2 focus:ring-purple-600 focus:border-transparent
          bg-white dark:bg-gray-700 dark:text-white
          text-left
          [&::-webkit-datetime-edit]:text-left
          [&::-webkit-datetime-edit-fields-wrapper]:text-left
          [&::-webkit-date-and-time-value]:text-left
          ${isEmpty ? 'text-gray-400' : 'text-gray-900 dark:text-white'}
          ${error
            ? 'border-red-500 dark:border-red-500'
            : 'border-gray-300 dark:border-gray-600'
          }
          ${disabled
            ? 'opacity-60 cursor-not-allowed !bg-gray-50 dark:!bg-gray-900'
            : ''
          }
        `}
      />
      {error ? (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  )
}

export default DateInput
