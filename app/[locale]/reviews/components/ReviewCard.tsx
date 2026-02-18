// app/reviews/components/ReviewCard.tsx
'use client'

import { useState } from 'react'
import { useTranslations, useFormatter } from 'next-intl'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import {
  IoStar,
  IoStarOutline,
  IoCheckmarkCircleOutline,
  IoCarSportOutline,
  IoChevronForwardOutline,
  IoCheckmarkOutline
} from 'react-icons/io5'
import GuestProfileSheet from './GuestProfileSheet'
import HostProfileSheet from './HostProfileSheet'
import { formatReviewerName, getFirstNameOnly } from '@/app/lib/utils/namePrivacy'

interface ReviewerProfile {
  id: string
  name: string | null
  profilePhotoUrl: string | null
  memberSince: Date | string | null
  tripCount: number | null
  isVerified: boolean | null
  city: string | null
  state: string | null
}

interface Car {
  id: string
  make: string
  model: string
  year: number
  city: string | null
  state: string | null
  totalTrips: number | null
  dailyRate: any
  photos: { url: string }[]
}

interface Host {
  id: string
  name: string | null
  profilePhoto: string | null
}

interface Review {
  id: string
  rating: number
  comment: string | null
  title: string | null
  createdAt: Date | string
  isVerified: boolean | null
  hostResponse: string | null
  hostRespondedAt: Date | string | null
  reviewerProfile: ReviewerProfile | null
  car: Car | null
  host: Host | null
}

interface ReviewCardProps {
  review: Review
}

// Helper to get time ago (with translations)
function getTimeAgo(date: Date | string, t: (key: string, values?: Record<string, unknown>) => string): string {
  const d = new Date(date)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays < 7) return t('thisWeek')
  if (diffInDays < 30) return t('weeksAgo', { count: Math.floor(diffInDays / 7) })
  if (diffInDays < 365) return t('monthsAgo', { count: Math.floor(diffInDays / 30) })
  return t('yearsAgo', { count: Math.floor(diffInDays / 365) })
}

// Helper to generate car URL
function generateCarUrl(car: { id: string; make: string; model: string; year: number; city?: string | null }): string {
  const slug = `${car.year}-${car.make}-${car.model}-${car.city || 'phoenix'}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `/rentals/${slug}-${car.id}`
}

// Star rating component
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        star <= rating ? (
          <IoStar key={star} className="w-4 h-4 text-amber-500" />
        ) : (
          <IoStarOutline key={star} className="w-4 h-4 text-gray-300 dark:text-gray-600" />
        )
      ))}
    </div>
  )
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const t = useTranslations('ReviewCard')
  const format = useFormatter()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isHostProfileOpen, setIsHostProfileOpen] = useState(false)

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return format.dateTime(d, { month: 'short', year: 'numeric' })
  }

  const guestName = formatReviewerName(review.reviewerProfile?.name)
  const guestInitial = guestName.charAt(0).toUpperCase()

  return (
    <>
      <article className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        {/* Reviewer Header - Now Clickable */}
        <div className="flex items-start gap-4 mb-4">
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-start gap-4 text-left hover:opacity-80 transition-opacity group flex-1"
          >
            <div className="flex-shrink-0">
              {review.reviewerProfile?.profilePhotoUrl ? (
                <Image
                  src={review.reviewerProfile.profilePhotoUrl}
                  alt={guestName}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-amber-500 transition-all"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center ring-2 ring-transparent group-hover:ring-amber-600 transition-all">
                  <span className="text-lg font-bold text-white">{guestInitial}</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {guestName}
                </h3>
                {review.reviewerProfile?.isVerified && (
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500" />
                )}
              </div>
              {review.reviewerProfile?.memberSince && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('memberSince', { date: formatDate(review.reviewerProfile.memberSince) })}
                  {review.reviewerProfile?.tripCount && review.reviewerProfile.tripCount > 0 && (
                    <span> ({t('tripCount', { count: review.reviewerProfile.tripCount })})</span>
                  )}
                </p>
              )}
            </div>
          </button>
        </div>

        {/* Rating and Date */}
        <div className="flex items-center gap-3 mb-3">
          <StarRating rating={review.rating} />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({getTimeAgo(review.createdAt, t)})
          </span>
          {review.isVerified && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
              {t('ecoFriendly')}
            </span>
          )}
        </div>

        {/* Review Title */}
        {review.title && (
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {review.title}
          </h4>
        )}

        {/* Review Comment */}
        {review.comment && (
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            {review.comment}
          </p>
        )}

        {/* Separator line before car section */}
        {review.car && (
          <div className="border-t border-gray-200 dark:border-gray-600 my-4" />
        )}

        {/* Car Info with Photo */}
        {review.car && (
          <Link
            href={generateCarUrl(review.car)}
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group border border-gray-200 dark:border-gray-700"
          >
            {/* Car Thumbnail */}
            {review.car.photos?.[0]?.url ? (
              <div className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                <Image
                  src={review.car.photos[0].url}
                  alt={`${review.car.year} ${review.car.make} ${review.car.model}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="80px"
                />
              </div>
            ) : (
              <div className="w-20 h-14 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                <IoCarSportOutline className="w-6 h-6 text-gray-400" />
              </div>
            )}
            {/* Car Name and Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {review.car.year} {review.car.make} {review.car.model}
              </p>
              {(review.car.city || review.car.state) && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {review.car.city}{review.car.city && review.car.state && ', '}{review.car.state}
                </p>
              )}
              {/* Ride Completed Badge with Time Ago */}
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">
                  <IoCheckmarkOutline className="w-3 h-3" />
                  {t('rideCompleted')}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                  {getTimeAgo(review.createdAt, t)}
                </span>
              </div>
            </div>
            {/* Arrow */}
            <IoChevronForwardOutline className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 group-hover:text-amber-500 transition-colors" />
          </Link>
        )}

        {/* Host Response */}
        {review.hostResponse && (
          <div className="mt-4 pl-4 border-l-2 border-amber-500 bg-amber-50 dark:bg-amber-900/10 rounded-r-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-900 dark:text-white">
                {t('responseFrom')}{' '}
                {review.host?.id ? (
                  <button
                    onClick={() => setIsHostProfileOpen(true)}
                    className="font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline transition-colors"
                  >
                    {getFirstNameOnly(review.host?.name)}
                  </button>
                ) : (
                  <span className="font-medium">{getFirstNameOnly(review.host?.name)}</span>
                )}
              </span>
              {review.hostRespondedAt && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({getTimeAgo(review.hostRespondedAt, t)})
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {review.hostResponse}
            </p>
          </div>
        )}
      </article>

      {/* Guest Profile Sheet */}
      <GuestProfileSheet
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        guest={review.reviewerProfile}
      />

      {/* Host Profile Sheet */}
      {review.host?.id && (
        <HostProfileSheet
          hostId={review.host.id}
          isOpen={isHostProfileOpen}
          onClose={() => setIsHostProfileOpen(false)}
        />
      )}
    </>
  )
}
