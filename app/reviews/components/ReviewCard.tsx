// app/reviews/components/ReviewCard.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  IoStar,
  IoStarOutline,
  IoCheckmarkCircleOutline,
  IoCarSportOutline
} from 'react-icons/io5'
import GuestProfileSheet from './GuestProfileSheet'

// Helper function to extract first name
function getFirstName(fullName: string | null): string {
  if (!fullName) return 'Guest'
  const firstName = fullName.trim().split(/\s+/)[0]
  return firstName || 'Guest'
}

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

// Helper to format date
function formatDate(date: Date | string): string {
  const d = new Date(date)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getFullYear()}`
}

// Helper to get time ago
function getTimeAgo(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays < 7) return 'This week'
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`
  return `${Math.floor(diffInDays / 365)} year${Math.floor(diffInDays / 365) > 1 ? 's' : ''} ago`
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
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const guestName = getFirstName(review.reviewerProfile?.name)
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
                  Member since {formatDate(review.reviewerProfile.memberSince)}
                  {review.reviewerProfile?.tripCount && review.reviewerProfile.tripCount > 0 && (
                    <span> ({review.reviewerProfile.tripCount} trips)</span>
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
            ({getTimeAgo(review.createdAt)})
          </span>
          {review.isVerified && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
              <IoCheckmarkCircleOutline className="w-3 h-3" />
              Verified Trip
            </span>
          )}
        </div>

        {/* Review Title */}
        {review.title && (
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            {review.title}
          </h4>
        )}

        {/* Review Comment */}
        {review.comment && (
          <p className="text-gray-700 dark:text-gray-300 mb-4">
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
            className="inline-flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
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
            {/* Car Name */}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {review.car.year} {review.car.make}
                {review.car.totalTrips != null && review.car.totalTrips > 0 && (
                  <span className="text-gray-500 dark:text-gray-400 font-normal"> ({review.car.totalTrips} trips)</span>
                )}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {review.car.model}
              </p>
              {(review.car.city || review.car.state) && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {review.car.city}{review.car.city && review.car.state && ', '}{review.car.state}
                </p>
              )}
            </div>
          </Link>
        )}

        {/* Host Response */}
        {review.hostResponse && (
          <div className="mt-4 pl-4 border-l-2 border-amber-500 bg-amber-50 dark:bg-amber-900/10 rounded-r-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Response from {getFirstName(review.host?.name)}
              </span>
              {review.hostRespondedAt && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({getTimeAgo(review.hostRespondedAt)})
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
    </>
  )
}
