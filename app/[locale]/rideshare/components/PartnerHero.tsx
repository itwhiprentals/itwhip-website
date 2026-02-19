// app/rideshare/components/PartnerHero.tsx
// Full-width hero with centered logo overlay

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useEditMode } from '../[partnerSlug]/EditModeContext'
import {
  IoStar,
  IoLocationOutline,
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
  IoPencilOutline
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
  heroImageFilter?: boolean
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
  // Edit mode props
  isEditMode?: boolean
  onEditHero?: () => void
}

export default function PartnerHero({
  companyName,
  logo,
  heroImage,
  heroImageFilter = false,
  bio,
  location,
  supportEmail,
  supportPhone,
  businessHours,
  yearEstablished,
  stats,
  socialLinks,
  visibility = { showEmail: true, showPhone: true, showWebsite: true },
  isStripeVerified = false,
  isEditMode = false,
  onEditHero
}: PartnerHeroProps) {
  const [showFullBio, setShowFullBio] = useState(false)
  const { isEditMode: contextEditMode, data: contextData } = useEditMode()

  // Use context data when in edit mode for real-time updates
  const effectiveHeroImage = contextEditMode && contextData?.heroImage !== undefined
    ? contextData.heroImage
    : heroImage
  const effectiveHeroImageFilter = contextEditMode && contextData?.heroImageFilter !== undefined
    ? contextData.heroImageFilter
    : heroImageFilter
  const effectiveLogo = contextEditMode && contextData?.logo !== undefined
    ? contextData.logo
    : logo
  const effectiveBio = contextEditMode && contextData?.bio !== undefined
    ? contextData.bio
    : bio

  // Contact info - use context data when in edit mode
  const effectiveSupportEmail = contextEditMode && contextData?.supportEmail !== undefined
    ? contextData.supportEmail
    : supportEmail
  const effectiveSupportPhone = contextEditMode && contextData?.supportPhone !== undefined
    ? contextData.supportPhone
    : supportPhone

  // Visibility settings - use context data when in edit mode
  const effectiveShowEmail = contextEditMode && contextData?.showEmail !== undefined
    ? contextData.showEmail
    : visibility.showEmail
  const effectiveShowPhone = contextEditMode && contextData?.showPhone !== undefined
    ? contextData.showPhone
    : visibility.showPhone
  const effectiveShowWebsite = contextEditMode && contextData?.showWebsite !== undefined
    ? contextData.showWebsite
    : visibility.showWebsite

  // Social links - use context data when in edit mode
  const effectiveSocialLinks = {
    website: contextEditMode && contextData?.website !== undefined ? contextData.website : socialLinks?.website,
    instagram: contextEditMode && contextData?.instagram !== undefined ? contextData.instagram : socialLinks?.instagram,
    facebook: contextEditMode && contextData?.facebook !== undefined ? contextData.facebook : socialLinks?.facebook,
    twitter: contextEditMode && contextData?.twitter !== undefined ? contextData.twitter : socialLinks?.twitter,
    linkedin: contextEditMode && contextData?.linkedin !== undefined ? contextData.linkedin : socialLinks?.linkedin,
    tiktok: contextEditMode && contextData?.tiktok !== undefined ? contextData.tiktok : socialLinks?.tiktok,
    youtube: contextEditMode && contextData?.youtube !== undefined ? contextData.youtube : socialLinks?.youtube
  }

  const hasSocialLinks = (
    effectiveSocialLinks.website ||
    effectiveSocialLinks.instagram ||
    effectiveSocialLinks.facebook ||
    effectiveSocialLinks.twitter ||
    effectiveSocialLinks.linkedin ||
    effectiveSocialLinks.tiktok ||
    effectiveSocialLinks.youtube
  )

  const maxBioLength = 200
  const shouldTruncateBio = effectiveBio && effectiveBio.length > maxBioLength
  const displayBio = shouldTruncateBio && !showFullBio
    ? effectiveBio.slice(0, maxBioLength) + '...'
    : effectiveBio

  return (
    <div className="relative">
      {/* Hero Image Section - Constrained height on all screen sizes */}
      <div className="relative w-full h-[250px] sm:h-[300px] md:h-[450px] lg:h-[500px]">
        {effectiveHeroImage ? (
          <img
            src={effectiveHeroImage}
            alt={`${companyName} hero`}
            className="w-full h-full object-cover"
            style={effectiveHeroImageFilter ? { filter: 'brightness(1.05) contrast(1.08) saturate(1.15)' } : {}}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500" />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/10" />

        {/* Divider lines - edge to edge at hero bottom edge */}
        <div className="absolute left-0 right-0 bottom-0 z-10 flex items-center">
          {/* Left line - edge to center minus logo radius */}
          <div className="flex-1 h-[3px] bg-white" />
          {/* Gap for logo (150px + 6px border = 156px, so ~78px each side) */}
          <div className="w-[156px] flex-shrink-0" />
          {/* Right line - center plus logo radius to edge */}
          <div className="flex-1 h-[3px] bg-white" />
        </div>

        {/* Logo - Centered, overlapping bottom with white circle border */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-[75px] z-20">
          <div className="relative">
            {/* White circle border */}
            <div className="relative w-[150px] h-[150px] rounded-full overflow-hidden shadow-2xl ring-[3px] ring-white bg-white">
              {effectiveLogo ? (
                <Image
                  src={effectiveLogo}
                  alt={companyName}
                  fill
                  className="object-contain"
                  style={{ transform: 'scale(1.05) translateY(1.5px)', transformOrigin: 'center center' }}
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

          {/* Bio - Show empty placeholder in edit mode */}
          <div className="text-center max-w-3xl mx-auto mb-4">
            {effectiveBio ? (
              <>
                <div
                  className={`${isEditMode ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 -m-2 transition-colors group' : ''}`}
                  onClick={isEditMode ? onEditHero : undefined}
                >
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                    {displayBio}
                  </p>
                  {isEditMode && (
                    <span className="inline-flex items-center gap-1 mt-2 text-orange-600 dark:text-orange-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      <IoPencilOutline className="w-3 h-3" />
                      Tap to edit
                    </span>
                  )}
                </div>
                {shouldTruncateBio && !isEditMode && (
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
              </>
            ) : isEditMode ? (
              <button
                onClick={onEditHero}
                className="flex items-center justify-center gap-2 py-4 px-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors group"
              >
                <IoPencilOutline className="w-5 h-5 text-gray-400 group-hover:text-orange-600" />
                <span className="text-gray-500 dark:text-gray-400 group-hover:text-orange-600 text-sm font-medium">
                  Add a bio for your business
                </span>
              </button>
            ) : null}
          </div>

          {/* Contact Info Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm mb-4">
            {/* Location - show first */}
            {(location || (stats.operatingCityNames && stats.operatingCityNames.length > 0)) && (
              <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <IoLocationOutline className="w-4 h-4" />
                <span>{location || stats.operatingCityNames?.[0]}</span>
              </span>
            )}
            {effectiveSupportEmail && effectiveShowEmail !== false && (
              <a
                href={`mailto:${effectiveSupportEmail}`}
                className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                <IoMailOutline className="w-4 h-4" />
                <span>{effectiveSupportEmail}</span>
              </a>
            )}
            {effectiveSupportPhone && effectiveShowPhone !== false && (
              <a
                href={`tel:${effectiveSupportPhone}`}
                className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                <IoCallOutline className="w-4 h-4" />
                <span>{effectiveSupportPhone}</span>
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

          {/* Social Media Links Row - Brand Colors */}
          {hasSocialLinks && (
            <div className="flex flex-wrap items-center justify-center gap-3 pb-2">
              {effectiveSocialLinks.website && effectiveShowWebsite !== false && (
                <a
                  href={effectiveSocialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                  title="Website"
                >
                  <IoGlobeOutline className="w-4 h-4" />
                </a>
              )}
              {effectiveSocialLinks.instagram && (
                <a
                  href={effectiveSocialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-pink-600 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors"
                  title="Instagram"
                >
                  <IoLogoInstagram className="w-4 h-4" />
                </a>
              )}
              {effectiveSocialLinks.facebook && (
                <a
                  href={effectiveSocialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  title="Facebook"
                >
                  <IoLogoFacebook className="w-4 h-4" />
                </a>
              )}
              {effectiveSocialLinks.twitter && (
                <a
                  href={effectiveSocialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg text-sky-500 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-900/50 transition-colors"
                  title="Twitter / X"
                >
                  <IoLogoTwitter className="w-4 h-4" />
                </a>
              )}
              {effectiveSocialLinks.linkedin && (
                <a
                  href={effectiveSocialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  title="LinkedIn"
                >
                  <IoLogoLinkedin className="w-4 h-4" />
                </a>
              )}
              {effectiveSocialLinks.tiktok && (
                <a
                  href={effectiveSocialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  title="TikTok"
                >
                  <IoLogoTiktok className="w-4 h-4" />
                </a>
              )}
              {effectiveSocialLinks.youtube && (
                <a
                  href={effectiveSocialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  title="YouTube"
                >
                  <IoLogoYoutube className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
