// app/(guest)/rentals/components/details/PartnerProfile.tsx
// Partner Profile Component - Shows partner company branding for rideshare vehicles

'use client'

import Link from 'next/link'
import {
  IoStar,
  IoCarOutline,
  IoLocationOutline,
  IoMailOutline,
  IoCallOutline,
  IoArrowForwardOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircleOutline,
  IoBusinessOutline,
  IoPeopleOutline,
  IoRibbonOutline,
  IoTimeOutline
} from 'react-icons/io5'

interface Partner {
  id: string
  partnerCompanyName?: string | null
  partnerSlug?: string | null
  partnerLogo?: string | null
  partnerBio?: string | null
  partnerFleetSize?: number
  partnerAvgRating?: number | null
  partnerTotalBookings?: number
  partnerSupportEmail?: string | null
  partnerSupportPhone?: string | null
  partnerBadges?: { name: string; imageUrl?: string }[] | null
  location?: string | null
  city?: string
  state?: string
  yearEstablished?: number | null
  name?: string
  email?: string
  phone?: string
}

interface PartnerProfileProps {
  partner?: Partner | any
}

export default function PartnerProfile({ partner }: PartnerProfileProps) {
  if (!partner) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <p className="text-gray-600 dark:text-gray-400">Partner information not available</p>
      </div>
    )
  }

  // Process partner data with fallbacks
  const companyName = partner.partnerCompanyName || partner.name || 'Partner Fleet'
  const partnerSlug = partner.partnerSlug
  const logo = partner.partnerLogo
  const bio = partner.partnerBio
  const fleetSize = partner.partnerFleetSize || 0
  const avgRating = partner.partnerAvgRating || partner.averageRating || 0
  const totalBookings = partner.partnerTotalBookings || partner.totalTrips || 0
  const supportEmail = partner.partnerSupportEmail || partner.email
  const supportPhone = partner.partnerSupportPhone || partner.phone
  const badges = partner.partnerBadges as { name: string; imageUrl?: string }[] | null
  const location = partner.location || (partner.city && partner.state ? `${partner.city}, ${partner.state}` : 'Phoenix, AZ')
  const yearEstablished = partner.yearEstablished

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Partner Header */}
      <div className="flex items-start gap-4 mb-6">
        {/* Company Logo - Clickable */}
        {partnerSlug ? (
          <Link href={`/rideshare/${partnerSlug}`} className="relative flex-shrink-0 group">
            {logo ? (
              <img
                src={logo}
                alt={companyName}
                className="w-20 h-20 rounded-full object-cover shadow-md border-2 border-gray-200 dark:border-gray-700 group-hover:border-orange-400 transition-colors"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md group-hover:from-orange-600 group-hover:to-orange-700 transition-colors">
                <IoBusinessOutline className="w-10 h-10 text-white" />
              </div>
            )}
            {/* Verified badge */}
            <div className="absolute -bottom-1 -right-1 bg-green-600 text-white rounded-full p-1 shadow-lg">
              <IoCheckmarkCircleOutline className="w-4 h-4" />
            </div>
          </Link>
        ) : (
          <div className="relative flex-shrink-0">
            {logo ? (
              <img
                src={logo}
                alt={companyName}
                className="w-20 h-20 rounded-full object-cover shadow-md border-2 border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                <IoBusinessOutline className="w-10 h-10 text-white" />
              </div>
            )}
            {/* Verified badge */}
            <div className="absolute -bottom-1 -right-1 bg-green-600 text-white rounded-full p-1 shadow-lg">
              <IoCheckmarkCircleOutline className="w-4 h-4" />
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {partnerSlug ? (
              <Link href={`/rideshare/${partnerSlug}`} className="hover:text-orange-600 transition-colors">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate hover:text-orange-600 dark:hover:text-orange-400">
                  {companyName}
                </h3>
              </Link>
            ) : (
              <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {companyName}
              </h3>
            )}
            {/* Partner badge */}
            <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 text-orange-700 dark:text-orange-400 rounded-full text-xs font-semibold">
              <IoShieldCheckmarkOutline className="w-3.5 h-3.5" />
              <span>Verified Partner</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                <IoLocationOutline className="w-4 h-4" />
                <span>{location}</span>
              </div>
              {yearEstablished && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span>Est. {yearEstablished}</span>
                </>
              )}
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-4">
              {avgRating > 0 && (
                <div className="flex items-center gap-1">
                  <IoStar className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {avgRating.toFixed(1)}
                  </span>
                  <span className="text-gray-500">rating</span>
                </div>
              )}
              {fleetSize > 0 && (
                <div className="flex items-center gap-1">
                  <IoCarOutline className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {fleetSize}
                  </span>
                  <span className="text-gray-500">vehicles</span>
                </div>
              )}
              {totalBookings > 0 && (
                <div className="flex items-center gap-1">
                  <IoPeopleOutline className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {totalBookings.toLocaleString()}
                  </span>
                  <span className="text-gray-500">trips</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      {bio && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-5 mb-5">
          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">
            About {companyName}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {bio}
          </p>
        </div>
      )}

      {/* Partner Badges */}
      {badges && badges.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-5 mb-5">
          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">
            Certifications & Badges
          </h4>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                {badge.imageUrl ? (
                  <img src={badge.imageUrl} alt={badge.name} className="w-5 h-5" />
                ) : (
                  <IoRibbonOutline className="w-5 h-5 text-orange-600" />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {badge.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rideshare Ready Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-5 mb-5">
        <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">
          Rideshare Ready
        </h4>
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center">
              <IoTimeOutline className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-1">
                3+ Day Minimum Rental
              </h5>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                This vehicle is optimized for rideshare drivers. Weekly and monthly rates available for maximum savings.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Fleet Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
        <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">
          Contact & Support
        </h4>

        <div className="space-y-3">
          {/* Support contact info */}
          <div className="flex flex-col sm:flex-row gap-3">
            {supportEmail && (
              <a
                href={`mailto:${supportEmail}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <IoMailOutline className="w-4 h-4" />
                <span>{supportEmail}</span>
              </a>
            )}
            {supportPhone && (
              <a
                href={`tel:${supportPhone}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <IoCallOutline className="w-4 h-4" />
                <span>{supportPhone}</span>
              </a>
            )}
          </div>

          {/* View Fleet CTA */}
          {partnerSlug && (
            <Link
              href={`/rideshare/${partnerSlug}`}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
            >
              <IoCarOutline className="w-5 h-5" />
              <span>View Full Fleet ({fleetSize} vehicles)</span>
              <IoArrowForwardOutline className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
