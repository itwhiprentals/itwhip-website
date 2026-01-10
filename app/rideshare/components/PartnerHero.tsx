// app/rideshare/components/PartnerHero.tsx
// Full-width hero with centered logo overlay

'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  IoCarOutline,
  IoStarOutline,
  IoStar,
  IoLocationOutline,
  IoNavigateOutline,
  IoMailOutline,
  IoCallOutline,
  IoCheckmarkCircleOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoGlobeOutline,
  IoLogoInstagram,
  IoLogoFacebook,
  IoLogoTwitter,
  IoLogoLinkedin,
  IoLogoTiktok,
  IoLogoYoutube,
  IoTimeOutline,
  IoCalendarOutline,
  IoCashOutline
} from 'react-icons/io5'

interface PartnerStats {
  fleetSize: number
  avgRating: number
  totalTrips: number
  totalReviews: number
  operatingCities: number
  operatingCityNames?: string[]
  priceRange: {
    min: number
    max: number
  }
}

interface SocialLinks {
  website?: string | null
  instagram?: string | null
  facebook?: string | null
  twitter?: string | null
  linkedin?: string | null
  tiktok?: string | null
  youtube?: string | null
}

interface VisibilitySettings {
  showEmail?: boolean
  showPhone?: boolean
  showWebsite?: boolean
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
  socialLinks?: SocialLinks
  visibility?: VisibilitySettings
  isStripeVerified?: boolean
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
  stats,
  socialLinks,
  visibility = { showEmail: true, showPhone: true, showWebsite: true },
  isStripeVerified = false
}: PartnerHeroProps) {
  const [showFullBio, setShowFullBio] = useState(false)

  const hasSocialLinks = socialLinks && (
    socialLinks.website ||
    socialLinks.instagram ||
    socialLinks.facebook ||
    socialLinks.twitter ||
    socialLinks.linkedin ||
    socialLinks.tiktok ||
    socialLinks.youtube
  )

  const maxBioLength = 200
  const shouldTruncateBio = bio && bio.length > maxBioLength
  const displayBio = shouldTruncateBio && !showFullBio
    ? bio.slice(0, maxBioLength) + '...'
    : bio

  return (
    <div className="relative">
      {/* Hero Image Section - FULL WIDTH, displays at natural aspect ratio */}
      <div className="relative w-full">
        {heroImage ? (
          <img
            src={heroImage}
            alt={`${companyName} hero`}
            className="w-full h-auto"
          />
        ) : (
          <div className="w-full h-[300px] sm:h-[350px] md:h-[400px] bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500" />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/10" />

        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }} />
        </div>

        {/* Logo - Centered, overlapping bottom */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-[75px] z-20">
          <div className="relative">
            {/* White background ensures all logos visible in both light/dark modes */}
            <div className="w-[150px] h-[150px] rounded-full overflow-hidden shadow-2xl ring-1 ring-white/50 bg-white">
              {logo ? (
                <Image
                  src={logo}
                  alt={companyName}
                  width={150}
                  height={150}
                  className="object-cover w-full h-full scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl font-bold text-orange-500">
                    {companyName.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Verified badge - only show if Stripe verified */}
            {isStripeVerified && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-2 shadow-lg border-2 border-white">
                <IoCheckmarkCircleOutline className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section Below Hero */}
      <div className="bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[90px] pb-4">
          {/* Company Name & Verified - Centered */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {companyName}
              </h1>
              {stats.avgRating > 0 && (
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <IoStar className="w-3 h-3 text-amber-400 fill-current" />
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {stats.avgRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
            {isStripeVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-[10px] sm:text-xs font-medium">
                <IoCheckmarkCircleOutline className="w-3 h-3" />
                Verified Partner
              </span>
            )}
          </div>

          {/* Bio */}
          {bio && (
            <div className="text-center max-w-3xl mx-auto mb-4">
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                {displayBio}
              </p>
              {shouldTruncateBio && (
                <button
                  onClick={() => setShowFullBio(!showFullBio)}
                  className="inline-flex items-center gap-1 mt-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium text-xs sm:text-sm"
                >
                  {showFullBio ? (
                    <>Show less <IoChevronUpOutline className="w-3.5 h-3.5" /></>
                  ) : (
                    <>Read more <IoChevronDownOutline className="w-3.5 h-3.5" /></>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Contact Info Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm mb-4">
            {/* Location - show first */}
            {(location || (stats.operatingCityNames && stats.operatingCityNames.length > 0)) && (
              <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <IoLocationOutline className="w-4 h-4" />
                <span>{location || stats.operatingCityNames?.[0]}</span>
              </span>
            )}
            {supportEmail && visibility.showEmail !== false && (
              <a
                href={`mailto:${supportEmail}`}
                className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                <IoMailOutline className="w-4 h-4" />
                <span>{supportEmail}</span>
              </a>
            )}
            {supportPhone && visibility.showPhone !== false && (
              <a
                href={`tel:${supportPhone}`}
                className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                <IoCallOutline className="w-4 h-4" />
                <span>{supportPhone}</span>
              </a>
            )}
            {businessHours && (
              <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <IoTimeOutline className="w-4 h-4" />
                <span>{businessHours}</span>
              </span>
            )}
            {yearEstablished && (
              <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <IoCalendarOutline className="w-4 h-4" />
                <span>Est. {yearEstablished}</span>
              </span>
            )}
          </div>

          {/* Social Media Links Row */}
          {hasSocialLinks && (
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              {socialLinks?.website && visibility.showWebsite !== false && (
                <a
                  href={socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  title="Website"
                >
                  <IoGlobeOutline className="w-4 h-4" />
                </a>
              )}
              {socialLinks?.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-pink-100 dark:hover:bg-pink-900/30 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                  title="Instagram"
                >
                  <IoLogoInstagram className="w-4 h-4" />
                </a>
              )}
              {socialLinks?.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Facebook"
                >
                  <IoLogoFacebook className="w-4 h-4" />
                </a>
              )}
              {socialLinks?.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                  title="Twitter / X"
                >
                  <IoLogoTwitter className="w-4 h-4" />
                </a>
              )}
              {socialLinks?.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                  title="LinkedIn"
                >
                  <IoLogoLinkedin className="w-4 h-4" />
                </a>
              )}
              {socialLinks?.tiktok && (
                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white transition-colors"
                  title="TikTok"
                >
                  <IoLogoTiktok className="w-4 h-4" />
                </a>
              )}
              {socialLinks?.youtube && (
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="YouTube"
                >
                  <IoLogoYoutube className="w-4 h-4" />
                </a>
              )}
            </div>
          )}

          {/* Stats Cards - Single Row */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 pb-2">
            {/* Vehicles */}
            <div className="bg-white dark:bg-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-center shadow-sm border border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-center gap-1">
                <IoCarOutline className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-orange-500" />
                <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{stats.fleetSize}</p>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Vehicles</p>
            </div>
            {/* Rating */}
            <div className="bg-white dark:bg-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-center shadow-sm border border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-center gap-1">
                <IoStarOutline className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-500" />
                {stats.avgRating > 0 ? (
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{stats.avgRating.toFixed(1)}</p>
                ) : (
                  <p className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400">New</p>
                )}
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">{stats.avgRating > 0 ? 'Rating' : 'No reviews'}</p>
            </div>
            {/* Trips */}
            <div className="bg-white dark:bg-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-center shadow-sm border border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-center gap-1">
                <IoNavigateOutline className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-blue-500" />
                <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  {stats.totalTrips > 0 ? stats.totalTrips.toLocaleString() : '0'}
                </p>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Trips</p>
            </div>
            {/* Price Range */}
            <div className="bg-white dark:bg-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-center shadow-sm border border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-center gap-1">
                <IoCashOutline className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500" />
                <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white whitespace-nowrap">
                  ${stats.priceRange.min || 0}-${stats.priceRange.max || 0}
                </p>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Per Day</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
