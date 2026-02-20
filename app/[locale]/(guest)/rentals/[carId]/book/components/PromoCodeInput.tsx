// app/[locale]/(guest)/rentals/[carId]/book/components/PromoCodeInput.tsx
// Promo code input for the booking page - supports platform and host codes

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  IoPricetagOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoClose
} from 'react-icons/io5'

export interface AppliedPromo {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  source: 'platform' | 'host'
  title: string
}

interface PromoCodeInputProps {
  carId: string
  onPromoApplied: (promo: AppliedPromo) => void
  onPromoRemoved: () => void
  appliedPromo: AppliedPromo | null
}

export default function PromoCodeInput({
  carId,
  onPromoApplied,
  onPromoRemoved,
  appliedPromo
}: PromoCodeInputProps) {
  const t = useTranslations('BookingPage')
  const [isOpen, setIsOpen] = useState(false)
  const [code, setCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApply = async () => {
    if (!code.trim()) return

    setIsValidating(true)
    setError(null)

    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), carId })
      })

      const data = await res.json()

      if (data.valid) {
        onPromoApplied({
          code: data.code,
          discountType: data.discountType,
          discountValue: data.discountValue,
          source: data.source,
          title: data.title
        })
        setIsOpen(false)
        setCode('')
      } else {
        setError(data.error || 'Invalid promo code')
      }
    } catch {
      setError('Failed to validate code. Please try again.')
    } finally {
      setIsValidating(false)
    }
  }

  const handleRemove = () => {
    onPromoRemoved()
    setCode('')
    setError(null)
  }

  // Applied promo display
  if (appliedPromo) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center gap-2">
          <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              {appliedPromo.code}
            </p>
            <p className="text-xs text-green-600 dark:text-green-500">
              {appliedPromo.discountType === 'percentage'
                ? `${appliedPromo.discountValue}% off`
                : `$${appliedPromo.discountValue.toFixed(2)} off`
              }
              {' \u2022 '}{appliedPromo.title}
            </p>
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="p-1 text-green-600 hover:text-red-600 transition-colors"
          aria-label="Remove promo code"
        >
          <IoClose className="w-4 h-4" />
        </button>
      </div>
    )
  }

  // Collapsed state
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
      >
        <IoPricetagOutline className="w-4 h-4" />
        {t('havePromoCode')}
      </button>
    )
  }

  // Expanded input
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={() => { setIsOpen(false); setCode(''); setError(null) }}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
        >
          <IoClose className="w-4 h-4" />
        </button>
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase())
            setError(null)
          }}
          placeholder={t('enterPromoCode')}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white"
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          disabled={isValidating}
          autoFocus
        />
        <button
          onClick={handleApply}
          disabled={isValidating || !code.trim()}
          className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          {isValidating ? '...' : t('apply')}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
          <IoCloseCircleOutline className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
