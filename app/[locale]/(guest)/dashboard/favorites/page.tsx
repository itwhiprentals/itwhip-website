'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import {
  IoHeartOutline,
  IoArrowBack,
  IoHeartDislike,
  IoFlashOutline,
  IoLocationOutline,
  IoStar,
} from 'react-icons/io5'
import { useFavorites } from '@/app/hooks/useFavorites'
import { capitalizeCarMake, normalizeModelName } from '@/app/lib/utils/formatters'
import { formatRating } from '@/app/lib/utils/formatCarSpecs'
import { generateCarUrl } from '@/app/lib/utils/urls'
import { optimizeImageUrl } from '@/app/lib/utils/imageOptimization'
import { isCompanyName } from '@/app/lib/utils/namePrivacy'
import type { RentalCarWithDetails } from '@/types/rental'

export default function FavoritesPage() {
  const t = useTranslations('Favorites')
  const router = useRouter()
  const { toggleFavorite } = useFavorites()

  const [cars, setCars] = useState<RentalCarWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCars = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/favorites/full')
      if (res.ok) {
        const data = await res.json()
        setCars(data.cars || [])
      } else {
        setCars([])
      }
    } catch {
      setCars([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCars()
  }, [fetchCars])

  // Remove car from list when unfavorited
  const handleFavorite = useCallback(
    async (carId: string) => {
      await toggleFavorite(carId)
      setCars(prev => prev.filter(c => c.id !== carId))
    },
    [toggleFavorite],
  )

  return (
    <>
      {/* Page header — pull up to sit snug under the main nav */}
      <div className="flex items-center gap-3 mb-4 -mt-12">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <IoArrowBack className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('title')}
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : cars.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <IoHeartOutline className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('noFavoritesYet')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
            {t('noFavoritesMessage')}
          </p>
          <button
            onClick={() => router.push('/rentals/search')}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors"
          >
            {t('browseCars')}
          </button>
        </div>
      ) : (
        /* Car grid — 2 cols mobile (matches app), 3 cols lg */
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {cars.map(car => (
            <FavoriteCard key={car.id} car={car} onRemove={handleFavorite} />
          ))}
        </div>
      )}
    </>
  )
}

/* ─── Compact card tweaked for favorites ─── */

const getHostDisplayName = (host: any): string | null => {
  if (!host) return null
  if (host.partnerCompanyName) return host.partnerCompanyName.trim()
  if (!host.name) return null
  const name = host.name.trim()
  if (host.isBusinessHost || host.hostType === 'FLEET_PARTNER' || host.hostType === 'BUSINESS' || isCompanyName(name)) return name
  return name.split(' ')[0]
}

const isValidHostPhoto = (url: string | undefined | null): boolean => {
  if (!url) return false
  if (url.includes('default-avatar') || url.includes('placeholder')) return false
  return url.startsWith('http')
}

function FavoriteCard({ car, onRemove }: { car: RentalCarWithDetails; onRemove: (id: string) => void }) {
  const rawImageUrl = car.photos?.[0]?.url || 'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=350&h=263&fit=crop&fm=webp&q=75'
  const imageUrl = optimizeImageUrl(rawImageUrl, { width: 350, height: 263, quality: 'auto:good', crop: 'fill', gravity: 'auto' })
  const carUrl = generateCarUrl({ id: car.id, make: car.make, model: car.model, year: car.year, city: car.city || 'Phoenix' })
  const trips = Number(car.totalTrips) || 0
  const rating = car.rating ? parseFloat(String(car.rating)) : null
  const hostName = getHostDisplayName(car.host)
  const hostInitial = hostName ? hostName.charAt(0).toUpperCase() : null
  const hostPhoto = car.host?.profilePhoto
  const hasValidPhoto = isValidHostPhoto(hostPhoto)

  return (
    <div className="relative block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      {/* Remove button — top right */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(car.id) }}
        className="absolute top-1.5 right-1.5 z-10 w-[30px] h-[30px] rounded-full bg-red-500/10 dark:bg-red-500/15 flex items-center justify-center hover:bg-red-500/20 transition-colors"
      >
        <IoHeartDislike className="w-[18px] h-[18px] text-red-500" />
      </button>

      <Link href={carUrl} className="block">
        {/* Image */}
        <div className="relative h-32 sm:h-36 bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <img
            src={imageUrl}
            alt={`${car.year} ${capitalizeCarMake(car.make)} ${normalizeModelName(car.model, car.make)}`}
            className="w-full h-full object-cover"
            loading="lazy"
            width={350}
            height={263}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            {car.vehicleType?.toUpperCase() === 'RIDESHARE' ? (
              <span className="px-2 py-0.5 bg-orange-500/90 text-white text-[10px] font-bold rounded-full">Rideshare</span>
            ) : car.instantBook ? (
              <span className="px-2 py-0.5 bg-emerald-500/90 text-white text-[10px] font-bold rounded-full flex items-center gap-0.5">
                <IoFlashOutline className="w-3 h-3" />Instant
              </span>
            ) : null}
          </div>

          {/* Host avatar */}
          {hostInitial && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/50 flex items-center justify-center ${hasValidPhoto ? 'bg-white' : 'bg-gray-500'}`}>
                {hasValidPhoto ? (
                  <img src={optimizeImageUrl(hostPhoto!, 50)} alt={hostName || ''} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-[10px]">{hostInitial}</span>
                )}
              </div>
              {hostName && <span className="text-[10px] font-medium text-white drop-shadow-md">{hostName}</span>}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-2.5">
          {/* Year Make + Price */}
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {car.year} {capitalizeCarMake(car.make)}
            </span>
            <span className="flex-shrink-0 text-sm font-bold text-amber-700 dark:text-amber-400">
              ${Math.round(parseFloat(car.dailyRate.toString()))}
              <span className="text-[10px] font-normal text-gray-500 dark:text-gray-400">/day</span>
            </span>
          </div>

          {/* Model */}
          <div className="text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate mt-px">
            {normalizeModelName(car.model, car.make)}
          </div>

          {/* Seats • Rating • Trips */}
          <div className="flex items-center text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 whitespace-nowrap overflow-hidden">
            <span>{car.seats || 5} seats</span>
            <span className="mx-1">•</span>
            {trips === 0 ? (
              <span className="text-green-600 dark:text-green-400 font-medium">New Listing</span>
            ) : rating && rating > 0 ? (
              <>
                <IoStar className="w-3 h-3 text-amber-400" />
                <span className="font-semibold text-gray-700 dark:text-gray-300 ml-0.5">{formatRating(rating)}</span>
                <span className="mx-1">•</span>
                <span>{trips} trip{trips !== 1 ? 's' : ''}</span>
              </>
            ) : (
              <>
                <IoStar className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                <span className="font-semibold text-gray-400 dark:text-gray-500 ml-0.5">0.0</span>
                <span className="mx-1">•</span>
                <span>{trips} trip{trips !== 1 ? 's' : ''}</span>
              </>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-0.5 mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
            <IoLocationOutline className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{car.city || 'Phoenix'}, {car.state || 'AZ'}</span>
          </div>
        </div>
      </Link>
    </div>
  )
}
