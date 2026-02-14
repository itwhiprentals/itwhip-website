// app/components/cards/CompactCarCard.tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { generateCarUrl } from '@/app/lib/utils/urls'
import { capitalizeCarMake, normalizeModelName } from '@/app/lib/utils/formatters'
import { formatRating } from '@/app/lib/utils/formatCarSpecs'
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
    vehicleType?: 'RENTAL' | 'RIDESHARE' | null  // For rideshare badge
    seats?: number | null
    city?: string | null
    rating?: number | string | null
    totalTrips?: number | null
    instantBook?: boolean | null
    photos?: { url: string }[] | null
    host?: {
      name?: string | null
      profilePhoto?: string | null
      rating?: number | null  // Host/company rating
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
  const t = useTranslations('VehicleCard')
  const [hostAvatarError, setHostAvatarError] = useState(false)

  const rawImageUrl = car.photos?.[0]?.url ||
    'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=350&h=263&fit=crop&fm=webp&q=75'
  // Optimize: 350x263 (4:3 aspect ratio) with good quality and auto DPR for retina
  const imageUrl = optimizeImageUrl(rawImageUrl, {
    width: 350,
    height: 263,
    quality: 'auto:good',
    dpr: 'auto',
    crop: 'fill',
    gravity: 'auto'
  })

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
      className={`group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-shadow duration-200 ${className}`}
    >
      {/* Image Container */}
      <div className="relative h-32 sm:h-36 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <img
          src={imageUrl}
          alt={`${car.year} ${capitalizeCarMake(car.make)} ${normalizeModelName(car.model, car.make)} for rent - $${car.dailyRate}/day`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          width={350}
          height={263}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Top-left badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {car.vehicleType?.toUpperCase() === 'RIDESHARE' && (
            <span className="px-2 py-0.5 bg-orange-500/90 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold rounded-full">
              {t('rideshareLabel')}
            </span>
          )}
          {car.instantBook && car.vehicleType?.toUpperCase() !== 'RIDESHARE' && (
            <span className="px-2 py-0.5 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center gap-0.5">
              <IoFlashOutline className="w-3 h-3" />
              {t('instantLabel')}
            </span>
          )}
        </div>

        {/* Host avatar + name - bottom left (inside image) */}
        {car.host && hostInitial && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full shadow-sm overflow-hidden flex-shrink-0 ring-1 ring-white/50 ${hasValidHostPhoto ? 'bg-white' : 'bg-gray-500'}`}>
              {hasValidHostPhoto ? (
                <img
                  src={optimizeImageUrl(hostPhotoUrl!, 50)}
                  alt={hostDisplayName || 'Host'}
                  className="w-full h-full object-cover scale-110"
                  onError={() => setHostAvatarError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-[10px] sm:text-xs">
                  {hostInitial}
                </div>
              )}
            </div>
            {hostDisplayName && (
              <span className="text-[10px] sm:text-xs font-medium text-white drop-shadow-md">
                {hostDisplayName}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-3">
        {/* Year + Make row with price aligned */}
        <div className="flex items-baseline justify-between gap-1">
          <span className={`text-sm sm:text-base font-semibold text-gray-900 dark:text-white ${colors.hoverText} transition-colors line-clamp-1 min-w-0 flex-1`}>
            {car.year} {capitalizeCarMake(car.make)}
          </span>
          {/* Price */}
          <span className="flex-shrink-0">
            <span className={`text-sm sm:text-base font-bold ${colors.priceText}`}>
              ${Math.round(car.dailyRate)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{t('perDay')}</span>
          </span>
        </div>
        {/* Model row */}
        <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-1">
          {normalizeModelName(car.model, car.make)}
        </div>

        {/* Car details + rating + trips row */}
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1.5 whitespace-nowrap overflow-hidden">
          <span className="flex-shrink-0">{car.seats || 5} {t('seats')}</span>
          <span className="mx-1 flex-shrink-0">•</span>
          {trips > 0 ? (
            <>
              <IoStar className="w-3 h-3 text-amber-400 fill-current flex-shrink-0" />
              <span className="font-semibold text-gray-700 dark:text-gray-300 ml-0.5 flex-shrink-0">{formatRating(rating ?? 5)}</span>
              <span className="mx-1 flex-shrink-0">•</span>
              <span className="truncate">{trips} {trips !== 1 ? t('trips') : t('trip')}</span>
            </>
          ) : (
            <span className="text-green-600 dark:text-green-400 font-medium truncate">{t('newListing')}</span>
          )}
        </div>

        {/* Location row */}
        <div className="flex mt-1 items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <IoLocationOutline className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{car.city || 'Phoenix'}, AZ</span>
        </div>
      </div>
    </Link>
  )
}
