// app/(guest)/rentals/components/review/GuestReviewSuccess.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import {
  IoCheckmarkCircle,
  IoStar,
  IoGift,
  IoCopy,
  IoShareSocial,
  IoLogoFacebook,
  IoLogoTwitter,
  IoMail
} from 'react-icons/io5'

interface GuestReviewSuccessProps {
  review: {
    id: string
    rating: number
    title?: string
    comment: string
    createdAt: string
    car: {
      make: string
      model: string
      year: number
    }
    host: {
      name: string
    }
  }
  onClose: () => void
}

export default function GuestReviewSuccess({ review, onClose }: GuestReviewSuccessProps) {
  const t = useTranslations('GuestReview')
  const [showDiscountCode, setShowDiscountCode] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [autoCloseTimer, setAutoCloseTimer] = useState(15)
  const onCloseRef = useRef(onClose)

  // Update ref when onClose changes
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  // Generate a discount code (in production, this would come from the API)
  const discountCode = `REVIEW${review.id.substring(0, 6).toUpperCase()}`

  // Auto-close timer - FIXED
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoCloseTimer((prev) => {
        if (prev <= 1) {
          // Use setTimeout to avoid state update during render
          setTimeout(() => {
            onCloseRef.current()
          }, 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, []) // Remove onClose dependency

  // Show discount code after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDiscountCode(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Copy discount code
  const copyDiscountCode = () => {
    navigator.clipboard.writeText(discountCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  // Share functions
  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareOnTwitter = () => {
    const text = t('twitterShareText', { year: review.car.year, make: review.car.make, model: review.car.model })
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareViaEmail = () => {
    const subject = t('emailSubject')
    const body = t('emailBody', { year: review.car.year, make: review.car.make, model: review.car.model, url: window.location.href })
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <div className="text-center py-4">
      {/* Success Icon Animation */}
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full animate-bounce-once">
          <IoCheckmarkCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>
      </div>

      {/* Success Message */}
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {t('thankYou')}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {t('feedbackHelps', { hostName: review.host.name })}
      </p>

      {/* Review Preview */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 text-left">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {t('yourReview')}
          </span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <IoStar
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating
                    ? 'text-amber-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        {review.title && (
          <p className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-1">
            &quot;{review.title}&quot;
          </p>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
          {review.comment}
        </p>
      </div>

      {/* Discount Code (appears after 2 seconds) */}
      {showDiscountCode && (
        <div className="mb-6 animate-fade-in">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <IoGift className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-900 dark:text-amber-300">
                {t('specialGift')}
              </span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-400 mb-3">
              {t('discountOffer')}
            </p>
            <div className="flex items-center justify-center gap-2">
              <code className="px-3 py-2 bg-white dark:bg-gray-800 rounded-lg font-mono font-bold text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700">
                {discountCode}
              </code>
              <button
                onClick={copyDiscountCode}
                className="p-2 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                title="Copy code"
              >
                {copiedCode ? (
                  <IoCheckmarkCircle className="w-5 h-5" />
                ) : (
                  <IoCopy className="w-5 h-5" />
                )}
              </button>
            </div>
            {copiedCode && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2 animate-fade-in">
                {t('codeCopied')}
              </p>
            )}
            <p className="text-xs text-amber-700 dark:text-amber-500 mt-2">
              {t('discountValidity')}
            </p>
          </div>
        </div>
      )}

      {/* Share Options */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {t('shareExperience')}
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={shareOnFacebook}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Share on Facebook"
          >
            <IoLogoFacebook className="w-5 h-5" />
          </button>
          <button
            onClick={shareOnTwitter}
            className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            title="Share on Twitter"
          >
            <IoLogoTwitter className="w-5 h-5" />
          </button>
          <button
            onClick={shareViaEmail}
            className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            title="Share via Email"
          >
            <IoMail className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
        >
          {t('viewMyReview')}
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('autoCloseTimer', { seconds: autoCloseTimer })}
        </p>
      </div>

      {/* Additional Info */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('verificationNote')}
        </p>
      </div>
    </div>
  )
}