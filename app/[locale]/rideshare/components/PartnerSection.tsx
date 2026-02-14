// app/rideshare/components/PartnerSection.tsx
// Partner section - single row layout with 5 cars horizontal

'use client'

import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import {
  IoChevronForwardOutline,
  IoStar,
  IoCarOutline,
  IoCheckmarkCircle
} from 'react-icons/io5'
import { generateCarUrl } from '@/app/lib/utils/urls'
import { capitalizeCarMake } from '@/app/lib/utils/formatters'
import DiscountBanner from './DiscountBanner'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  trim?: string | null
  dailyRate: number
  weeklyRate?: number
  photo: string | null
  photos?: string[]
  location: string
  instantBook: boolean
  transmission: string
  fuelType: string
  seats: number
  rating: number
  trips: number
}

interface Discount {
  id: string
  code: string
  title: string
  description?: string | null
  percentage: number
  expiresAt?: string | null
}

interface Partner {
  id: string
  companyName: string
  slug: string | null
  logo: string | null
  bio: string | null
  fleetSize: number
  avgRating: number
  totalReviews: number
  location: string | null
  vehicles: Vehicle[]
  discounts: Discount[]
  hasActiveDiscount: boolean
  isStripeVerified?: boolean
}

interface PartnerSectionProps {
  partner: Partner
}

// Compact car card for horizontal row
function CompactCarCard({ vehicle }: { vehicle: Vehicle }) {
  // Get valid photo URL
  let photoUrl: string | null = null
  if (vehicle.photo) {
    if (typeof vehicle.photo === 'string' && vehicle.photo.trim() !== '') {
      photoUrl = vehicle.photo
    } else if (typeof vehicle.photo === 'object' && (vehicle.photo as any)?.url) {
      photoUrl = (vehicle.photo as any).url
    }
  }

  return (
    <Link
      href={generateCarUrl({
        id: vehicle.id,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        city: vehicle.location?.split(',')[0]?.trim() || 'Phoenix'
      })}
      className="flex-shrink-0 w-[140px] sm:w-[160px] bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group"
    >
      {/* Image */}
      <div className="relative h-24 sm:h-28 bg-gray-200 dark:bg-gray-700">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <IoCarOutline className="w-10 h-10 text-gray-400" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2">
        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
          {vehicle.year} {capitalizeCarMake(vehicle.make)}
        </p>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
          {vehicle.model}
        </p>
        <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mt-0.5">
          ${vehicle.dailyRate}/day
        </p>
      </div>
    </Link>
  )
}

export default function PartnerSection({ partner }: PartnerSectionProps) {
  // Get first 5 vehicles for display
  const displayVehicles = partner.vehicles.slice(0, 5)
  const partnerUrl = partner.slug ? `/rideshare/${partner.slug}` : null

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      {/* Single Row Layout */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">

        {/* Left: Partner Info (clickable) */}
        <div className="flex items-center justify-between lg:justify-start gap-3 lg:w-56 lg:flex-shrink-0">
          {partnerUrl ? (
            <Link href={partnerUrl} className="flex items-center gap-3 group min-w-0">
              {/* Logo - white bg ensures all logos visible in both modes */}
              <div className="w-11 h-11 flex-shrink-0 bg-white rounded-full overflow-hidden shadow-sm">
                {partner.logo ? (
                  <Image
                    src={partner.logo}
                    alt={partner.companyName}
                    width={44}
                    height={44}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-400">
                      {partner.companyName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Name + Badge + Rating */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate">
                    {partner.companyName}
                  </h2>
                  {partner.isStripeVerified && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-[10px] font-medium flex-shrink-0">
                      <IoCheckmarkCircle className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {partner.avgRating > 0 && (
                    <span className="flex items-center gap-0.5">
                      <IoStar className="w-3 h-3 text-amber-400 fill-current" />
                      {partner.avgRating.toFixed(1)}
                    </span>
                  )}
                  {partner.hasActiveDiscount && (
                    <DiscountBanner discounts={partner.discounts} variant="inline" />
                  )}
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              {/* Logo (not clickable) - white bg ensures all logos visible in both modes */}
              <div className="w-11 h-11 flex-shrink-0 bg-white rounded-full overflow-hidden shadow-sm">
                {partner.logo ? (
                  <Image
                    src={partner.logo}
                    alt={partner.companyName}
                    width={44}
                    height={44}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-400">
                      {partner.companyName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-gray-900 dark:text-white truncate">
                  {partner.companyName}
                </h2>
                {partner.avgRating > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-gray-500 dark:text-gray-400">
                    <IoStar className="w-3 h-3 text-amber-400 fill-current" />
                    {partner.avgRating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Mobile: View All (shown inline on mobile) */}
          {partnerUrl && (
            <Link
              href={partnerUrl}
              className="lg:hidden flex-shrink-0 inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium text-xs"
            >
              View all
              <IoChevronForwardOutline className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Middle: 5 Cars Horizontal */}
        <div className="flex-1 overflow-x-auto scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
          <div className="flex gap-3">
            {displayVehicles.length > 0 ? (
              displayVehicles.map((vehicle) => (
                <CompactCarCard key={vehicle.id} vehicle={vehicle} />
              ))
            ) : (
              <div className="flex items-center justify-center py-6 px-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <IoCarOutline className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">No vehicles</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: View All (desktop only) */}
        {partnerUrl && (
          <Link
            href={partnerUrl}
            className="hidden lg:inline-flex flex-shrink-0 items-center gap-1.5 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg font-medium text-sm transition-colors group"
          >
            View all {partner.fleetSize}
            <IoChevronForwardOutline className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  )
}
