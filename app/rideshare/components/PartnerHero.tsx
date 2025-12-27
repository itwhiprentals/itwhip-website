// app/rideshare/components/PartnerHero.tsx
// Full-width hero with centered logo overlay

'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  IoCarOutline,
  IoStarOutline,
  IoLocationOutline,
  IoNavigateOutline,
  IoMailOutline,
  IoCallOutline,
  IoCheckmarkCircleOutline,
  IoChevronDownOutline,
  IoChevronUpOutline
} from 'react-icons/io5'

interface PartnerStats {
  fleetSize: number
  avgRating: number
  totalTrips: number
  totalReviews: number
  operatingCities: number
  priceRange: {
    min: number
    max: number
  }
}

interface PartnerHeroProps {
  companyName: string
  logo: string | null
  heroImage: string | null
  bio: string | null
  location: string | null
  supportEmail?: string | null
  supportPhone?: string | null
  businessHours?: string | null
  yearEstablished?: number | null
  stats: PartnerStats
}

export default function PartnerHero({
  companyName,
  logo,
  heroImage,
  bio,
  location,
  supportEmail,
  supportPhone,
  businessHours,
  yearEstablished,
  stats
}: PartnerHeroProps) {
  const [showFullBio, setShowFullBio] = useState(false)

  // Truncate bio if too long
  const maxBioLength = 200
  const shouldTruncateBio = bio && bio.length > maxBioLength
  const displayBio = shouldTruncateBio && !showFullBio
    ? bio.slice(0, maxBioLength) + '...'
    : bio

  return (
    <div className="relative">
      {/* Hero Image Section - FULL WIDTH, NO CONTAINER */}
      <div className="relative w-full h-[300px] sm:h-[350px] md:h-[400px]">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={`${companyName} hero`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          // Orange gradient fallback
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500" />
        )}

        {/* Dark overlay for logo visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/10" />

        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }} />
        </div>

        {/* Logo - Centered, 50% overlap (75px = half of 150px) */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-[75px] z-20">
          <div className="relative">
            <div className="w-[150px] h-[150px] bg-white dark:bg-gray-800 rounded-full flex items-center justify-center overflow-hidden shadow-2xl border-4 border-white dark:border-gray-700">
              {logo ? (
                <Image
                  src={logo}
                  alt={companyName}
                  width={150}
                  height={150}
                  className="object-contain p-3"
                />
              ) : (
                <span className="text-6xl font-bold text-orange-500">
                  {companyName.charAt(0)}
                </span>
              )}
            </div>

            {/* Verified badge */}
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-2 shadow-lg border-2 border-white">
              <IoCheckmarkCircleOutline className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Section Below Hero - WITH CONTAINER */}
      <div className="bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          {/* Company Name & Badge */}
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
              {companyName}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
              <IoCheckmarkCircleOutline className="w-4 h-4" />
              Verified Partner
            </span>
          </div>

          {/* Bio */}
          {bio && (
            <div className="text-center max-w-3xl mx-auto mb-8">
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
                {displayBio}
              </p>
              {shouldTruncateBio && (
                <button
                  onClick={() => setShowFullBio(!showFullBio)}
                  className="inline-flex items-center gap-1 mt-3 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium text-sm"
                >
                  {showFullBio ? (
                    <>Show less <IoChevronUpOutline className="w-4 h-4" /></>
                  ) : (
                    <>Read more <IoChevronDownOutline className="w-4 h-4" /></>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Contact Info Row */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm mb-10">
            {supportEmail && (
              <a
                href={`mailto:${supportEmail}`}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                <IoMailOutline className="w-5 h-5" />
                <span>{supportEmail}</span>
              </a>
            )}
            {supportPhone && (
              <a
                href={`tel:${supportPhone}`}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                <IoCallOutline className="w-5 h-5" />
                <span>{supportPhone}</span>
              </a>
            )}
            {location && (
              <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <IoLocationOutline className="w-5 h-5" />
                <span>{location}</span>
              </span>
            )}
            {businessHours && (
              <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <span>🕐</span>
                <span>{businessHours}</span>
              </span>
            )}
            {yearEstablished && (
              <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <span>📅</span>
                <span>Est. {yearEstablished}</span>
              </span>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 text-center shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-1.5 text-orange-500 mb-2">
                <IoCarOutline className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.fleetSize}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Vehicles</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 text-center shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-1.5 text-yellow-500 mb-2">
                <IoStarOutline className="w-6 h-6" />
              </div>
              {stats.avgRating > 0 ? (
                <>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.avgRating.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stats.totalReviews > 0 ? `${stats.totalReviews} reviews` : 'Rating'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm rounded-full font-medium">
                      New
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">No reviews yet</p>
                </>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 text-center shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-1.5 text-blue-500 mb-2">
                <IoNavigateOutline className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalTrips > 0 ? stats.totalTrips.toLocaleString() : '0'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Trips</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 text-center shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-1.5 text-green-500 mb-2">
                <IoLocationOutline className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.operatingCities}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cities</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 text-center shadow-sm border border-gray-200 dark:border-gray-700 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-center gap-1.5 text-purple-500 mb-2">
                <span className="text-xl">💰</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ${stats.priceRange.min || 0} - ${stats.priceRange.max || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Per Day</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
