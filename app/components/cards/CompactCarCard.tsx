// app/components/cards/CompactCarCard.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { generateCarUrl } from '@/app/lib/utils/urls'
import {
  IoLocationOutline,
  IoFlashOutline,
  IoStar
} from 'react-icons/io5'
import { optimizeImageUrl } from '@/app/lib/utils/imageOptimization'

export interface CompactCarCardProps {
  car: {
    id: string
    make: string
    model: string
    year: number
    dailyRate: number
    carType?: string | null
    type?: string | null  // Alternative field name from search API
    seats?: number | null
    city?: string | null
    rating?: number | string | null
    totalTrips?: number | null
    instantBook?: boolean | null
    photos?: { url: string }[] | null
    host?: {
      name?: string | null
      profilePhoto?: string | null
    } | null
  }
  /** Accent color for price. Defaults to 'amber' */
  accentColor?: 'amber' | 'emerald' | 'blue' | 'purple'
  /** Additional CSS classes to apply to the card container */
  className?: string
}

const accentColors = {
  amber: {
    priceText: 'text-amber-700 dark:text-amber-400',
    hoverText: 'group-hover:text-amber-700 dark:group-hover:text-amber-400'
  },
  emerald: {
    priceText: 'text-emerald-700 dark:text-emerald-400',
    hoverText: 'group-hover:text-emerald-700 dark:group-hover:text-emerald-400'
  },
  blue: {
    priceText: 'text-blue-700 dark:text-blue-400',
    hoverText: 'group-hover:text-blue-700 dark:group-hover:text-blue-400'
  },
  purple: {
    priceText: 'text-purple-700 dark:text-purple-400',
    hoverText: 'group-hover:text-purple-700 dark:group-hover:text-purple-400'
  }
}

// Check if host photo URL is valid (not a placeholder/default)
const isValidHostPhoto = (url: string | undefined | null): boolean => {
  if (!url) return false
  if (url === '/default-avatar.svg') return false
  if (url.includes('default-avatar')) return false
  if (url.includes('placeholder')) return false
  return url.startsWith('http') || url.startsWith('https')
}

// Parse rating safely - handles string, number, and Prisma Decimal types
const parseRating = (rating: any): number | null => {
  if (rating === null || rating === undefined) return null
  // Convert to string first to handle Prisma Decimal objects, then parse
  const parsed = parseFloat(String(rating))
  if (isNaN(parsed) || parsed < 0) return null // Allow 0 ratings, only reject negative/NaN
  return parsed
}

// Get host display name (first name only)
const getHostDisplayName = (name: string | null | undefined): string | null => {
  if (!name) return null
  return name.trim().split(' ')[0]
}

export default function CompactCarCard({ car, accentColor = 'amber', className = '' }: CompactCarCardProps) {
  const [hostAvatarError, setHostAvatarError] = useState(false)

  const rawImageUrl = car.photos?.[0]?.url ||
    'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=400&h=300&fit=crop&fm=webp&q=80'
  const imageUrl = optimizeImageUrl(rawImageUrl, 400)

  const carUrl = generateCarUrl({
    id: car.id,
    make: car.make,
    model: car.model,
    year: car.year,
    city: car.city || 'Phoenix'
  })

  const colors = accentColors[accentColor]

  // Host info
  const hostDisplayName = getHostDisplayName(car.host?.name)
  const hostInitial = hostDisplayName ? hostDisplayName.charAt(0).toUpperCase() : null
  const hostPhotoUrl = car.host?.profilePhoto
  const hasValidHostPhoto = isValidHostPhoto(hostPhotoUrl) && !hostAvatarError

  // Parse rating and trips safely (ensure numeric)
  const rating = parseRating(car.rating)
  const trips = Number(car.totalTrips) || 0

  return (
    <Link
      href={carUrl}
      className={`group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transform hover:-translate-y-0.5 transition-all duration-300 ${className}`}
    >
      {/* Image Container */}
      <div className="relative h-32 sm:h-36 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <img
          src={imageUrl}
          alt={`${car.year} ${car.make} ${car.model} for rent - $${car.dailyRate}/day`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Top-left badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {car.instantBook && (
            <span className="px-2 py-0.5 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full flex items-center gap-1">
              <IoFlashOutline className="w-2.5 h-2.5" />
              INSTANT
            </span>
          )}
        </div>

        {/* Host avatar + name - bottom left (inside image) */}
        {car.host && hostInitial && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full border-2 border-white shadow-md overflow-hidden bg-amber-500 flex-shrink-0">
              {hasValidHostPhoto ? (
                <img
                  src={optimizeImageUrl(hostPhotoUrl!, 50)}
                  alt={hostDisplayName || 'Host'}
                  className="w-full h-full object-cover"
                  onError={() => setHostAvatarError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-[10px]">
                  {hostInitial}
                </div>
              )}
            </div>
            {hostDisplayName && (
              <span className="text-[10px] font-medium text-white drop-shadow-md">
                {hostDisplayName}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Year + Make row with price aligned */}
        <div className="flex items-baseline justify-between gap-2">
          <span className={`text-xs font-semibold text-gray-900 dark:text-white ${colors.hoverText} transition-colors line-clamp-1 min-w-0 flex-1`}>
            {car.year} {car.make}
          </span>
          {/* Price */}
          <span className="flex-shrink-0">
            <span className={`text-xs font-bold ${colors.priceText}`}>
              ${Math.round(car.dailyRate)}
            </span>
            <span className="text-[9px] text-gray-500 dark:text-gray-400">/day</span>
          </span>
        </div>
        {/* Model row */}
        <div className="text-[11px] font-medium text-gray-700 dark:text-gray-300 line-clamp-1 mt-0.5">
          {car.model}
        </div>

        {/* Car details + rating row - all on one line */}
        <div className="flex items-center flex-wrap gap-x-1 text-[10px] text-gray-500 dark:text-gray-400 mt-1">
          <span className="capitalize">{(car.carType || car.type)?.toLowerCase() || 'sedan'}</span>
          <span>•</span>
          <span>{car.seats || 5} seats</span>
          <span>•</span>
          {trips > 0 ? (
            <>
              <IoStar className="w-2.5 h-2.5 text-amber-400 fill-current" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">{(rating ?? 5).toFixed(1)}</span>
              <span>({trips} {trips === 1 ? 'trip' : 'trips'})</span>
            </>
          ) : (
            <span className="italic">New Listing</span>
          )}
        </div>

        {/* Location row */}
        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
          <IoLocationOutline className="w-3 h-3" />
          <span>{car.city || 'Phoenix'}, AZ</span>
        </div>
      </div>
    </Link>
  )
}
