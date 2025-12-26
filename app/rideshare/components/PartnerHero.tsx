// app/rideshare/components/PartnerHero.tsx
// Large hero section for partner landing page

'use client'

import Image from 'next/image'
import {
  IoCarOutline,
  IoStarOutline,
  IoLocationOutline,
  IoNavigateOutline,
  IoMailOutline,
  IoCallOutline,
  IoCheckmarkCircleOutline
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
  bio: string | null
  location: string | null
  supportEmail?: string | null
  supportPhone?: string | null
  stats: PartnerStats
}

export default function PartnerHero({
  companyName,
  logo,
  bio,
  location,
  supportEmail,
  supportPhone,
  stats
}: PartnerHeroProps) {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg overflow-hidden">
      <div className="relative px-6 py-10 sm:px-10 sm:py-14">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }} />
        </div>

        <div className="relative">
          {/* Top Section */}
          <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-xl">
                {logo ? (
                  <Image
                    src={logo}
                    alt={companyName}
                    width={128}
                    height={128}
                    className="object-contain"
                  />
                ) : (
                  <span className="text-4xl font-bold text-gray-400">
                    {companyName.charAt(0)}
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  {companyName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                  <IoCheckmarkCircleOutline className="w-4 h-4" />
                  Verified Partner
                </span>
              </div>

              {bio && (
                <p className="text-gray-300 text-lg mb-4 max-w-3xl">
                  {bio}
                </p>
              )}

              {/* Location & Contact */}
              <div className="flex flex-wrap items-center gap-4 text-gray-400">
                {location && (
                  <span className="flex items-center gap-1.5">
                    <IoLocationOutline className="w-5 h-5" />
                    {location}
                  </span>
                )}
                {supportEmail && (
                  <a
                    href={`mailto:${supportEmail}`}
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <IoMailOutline className="w-5 h-5" />
                    {supportEmail}
                  </a>
                )}
                {supportPhone && (
                  <a
                    href={`tel:${supportPhone}`}
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <IoCallOutline className="w-5 h-5" />
                    {supportPhone}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-orange-400 mb-1">
                <IoCarOutline className="w-5 h-5" />
                <span className="text-sm font-medium">Fleet Size</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.fleetSize}</p>
              <p className="text-xs text-gray-400">vehicles</p>
            </div>

            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-yellow-400 mb-1">
                <IoStarOutline className="w-5 h-5" />
                <span className="text-sm font-medium">Rating</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'}
              </p>
              <p className="text-xs text-gray-400">
                {stats.totalReviews > 0 ? `${stats.totalReviews} reviews` : 'No reviews yet'}
              </p>
            </div>

            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <IoNavigateOutline className="w-5 h-5" />
                <span className="text-sm font-medium">Trips</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {stats.totalTrips.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">completed</p>
            </div>

            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-green-400 mb-1">
                <IoLocationOutline className="w-5 h-5" />
                <span className="text-sm font-medium">Cities</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.operatingCities}</p>
              <p className="text-xs text-gray-400">operating</p>
            </div>

            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm col-span-2 sm:col-span-2">
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <span className="text-sm font-medium">Price Range</span>
              </div>
              <p className="text-2xl font-bold text-white">
                ${stats.priceRange.min} - ${stats.priceRange.max}
              </p>
              <p className="text-xs text-gray-400">per day</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
