// app/rideshare/components/PartnerSection.tsx
// Partner section for marketplace - shows logo, name, vehicles, discounts

'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  IoChevronForwardOutline,
  IoStarOutline,
  IoCarOutline,
  IoLocationOutline
} from 'react-icons/io5'
import VehicleCarousel from './VehicleCarousel'
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
}

interface PartnerSectionProps {
  partner: Partner
}

export default function PartnerSection({ partner }: PartnerSectionProps) {
  return (
    <div>
      {/* Partner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {/* Logo - Circular */}
          <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            {partner.logo ? (
              <Image
                src={partner.logo}
                alt={partner.companyName}
                width={56}
                height={56}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-xl font-bold text-gray-400">
                {partner.companyName.charAt(0)}
              </span>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {partner.companyName}
              </h2>
              {partner.hasActiveDiscount && (
                <DiscountBanner discounts={partner.discounts} variant="inline" />
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span className="flex items-center gap-1">
                <IoCarOutline className="w-4 h-4" />
                {partner.fleetSize} vehicles
              </span>
              {partner.avgRating > 0 && (
                <span className="flex items-center gap-1">
                  <IoStarOutline className="w-4 h-4 text-yellow-500" />
                  {partner.avgRating.toFixed(1)} ({partner.totalReviews} reviews)
                </span>
              )}
              {partner.location && (
                <span className="flex items-center gap-1">
                  <IoLocationOutline className="w-4 h-4" />
                  {partner.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* View All Link */}
        {partner.slug && (
          <Link
            href={`/rideshare/${partner.slug}`}
            className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium text-sm group"
          >
            View all {partner.fleetSize} vehicles
            <IoChevronForwardOutline className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* Vehicle Carousel */}
      <VehicleCarousel vehicles={partner.vehicles} partnerSlug={partner.slug || undefined} />
    </div>
  )
}
