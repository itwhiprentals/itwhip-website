// app/rideshare/components/DiscountBanner.tsx
// Active discount display banner

'use client'

import { useState } from 'react'
import {
  IoPricetagOutline,
  IoTimeOutline,
  IoCopyOutline,
  IoCheckmarkOutline
} from 'react-icons/io5'

interface Discount {
  id: string
  code: string
  title: string
  description?: string | null
  percentage: number
  expiresAt?: string | null
  remaining?: number | null
}

interface DiscountBannerProps {
  discounts: Discount[]
  variant?: 'inline' | 'card' | 'hero'
}

export default function DiscountBanner({ discounts, variant = 'inline' }: DiscountBannerProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  if (discounts.length === 0) return null

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const formatExpiry = (expiresAt: string) => {
    const date = new Date(expiresAt)
    const now = new Date()
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) return 'Expires today'
    if (diffDays === 1) return 'Expires tomorrow'
    if (diffDays <= 7) return `Expires in ${diffDays} days`
    return `Expires ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }

  // Inline variant - compact single line
  if (variant === 'inline') {
    const discount = discounts[0]
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full text-sm font-medium">
        <IoPricetagOutline className="w-4 h-4" />
        <span>{discount.percentage}% OFF</span>
        <span className="opacity-80">|</span>
        <span className="font-mono">{discount.code}</span>
        <button
          onClick={(e) => {
            e.preventDefault()
            copyCode(discount.code)
          }}
          className="p-0.5 hover:bg-white/20 rounded transition-colors"
        >
          {copiedCode === discount.code ? (
            <IoCheckmarkOutline className="w-3.5 h-3.5" />
          ) : (
            <IoCopyOutline className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    )
  }

  // Card variant - grid of discount cards
  if (variant === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {discounts.map((discount) => (
          <div
            key={discount.id}
            className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <IoPricetagOutline className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {discount.percentage}% OFF
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {discount.title}
                  </p>
                </div>
              </div>
            </div>

            {discount.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {discount.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={() => copyCode(discount.code)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                  {discount.code}
                </span>
                {copiedCode === discount.code ? (
                  <IoCheckmarkOutline className="w-4 h-4 text-green-500" />
                ) : (
                  <IoCopyOutline className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {discount.expiresAt && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <IoTimeOutline className="w-3.5 h-3.5" />
                  {formatExpiry(discount.expiresAt)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Hero variant - large prominent banner
  if (variant === 'hero') {
    const discount = discounts[0]
    return (
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 rounded-lg p-6 sm:p-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }} />
        </div>

        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <IoPricetagOutline className="w-6 h-6 text-white" />
              <span className="text-white/80 uppercase tracking-wide text-sm font-medium">
                Limited Time Offer
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              Save {discount.percentage}% on Your Rental
            </h3>
            <p className="text-white/80">
              {discount.title}
              {discount.description && ` - ${discount.description}`}
            </p>
            {discount.expiresAt && (
              <p className="text-white/60 text-sm mt-2 flex items-center justify-center sm:justify-start gap-1">
                <IoTimeOutline className="w-4 h-4" />
                {formatExpiry(discount.expiresAt)}
              </p>
            )}
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={() => copyCode(discount.code)}
              className="flex items-center gap-3 px-6 py-3 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              <span className="font-mono text-xl font-bold text-gray-900">
                {discount.code}
              </span>
              {copiedCode === discount.code ? (
                <IoCheckmarkOutline className="w-5 h-5 text-green-500" />
              ) : (
                <IoCopyOutline className="w-5 h-5 text-gray-400" />
              )}
            </button>
            <p className="text-center text-white/60 text-xs mt-2">
              Click to copy code
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
