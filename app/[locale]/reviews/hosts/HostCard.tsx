// app/reviews/hosts/HostCard.tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import {
  IoStar,
  IoCheckmarkCircleOutline,
  IoPersonOutline
} from 'react-icons/io5'
import HostProfileSheet from '../components/HostProfileSheet'

interface HostCardProps {
  host: {
    id: string
    name: string
    profilePhoto: string | null
    partnerLogo?: string | null
    bio: string | null
    rating: number | null
    totalTrips: number
    responseRate: number | null
    joinedAt: Date | null
    city: string | null
    state: string | null
    isVerified: boolean
  }
}

// Helper to detect company names
function isCompanyName(name: string): boolean {
  if (!name) return false

  const companyIndicators = [
    'LLC', 'L.L.C.', 'Inc', 'Inc.', 'Corp', 'Corporation',
    'Company', 'Co.', 'Group', 'Motors', 'Rentals', 'Services',
    'Automotive', 'Auto', 'Cars', 'Vehicles', 'Fleet'
  ]

  const nameLower = name.toLowerCase()

  for (const indicator of companyIndicators) {
    if (nameLower.includes(indicator.toLowerCase())) {
      return true
    }
  }

  return false
}

// Helper to get display name (first name or full company name)
function getDisplayName(name: string | null): string {
  if (!name) return 'Host'

  // Keep full name for companies
  if (isCompanyName(name)) {
    return name
  }

  // First name only for individuals
  const firstName = name.trim().split(/\s+/)[0]
  return firstName || 'Host'
}

export default function HostCard({ host }: HostCardProps) {
  const t = useTranslations('HostCard')
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const displayName = getDisplayName(host.name)

  return (
    <>
      <button
        onClick={() => setIsSheetOpen(true)}
        className="w-full text-left bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-600 transition-all cursor-pointer"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Host Photo */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                {(host.partnerLogo || host.profilePhoto) ? (
                  <Image
                    src={host.partnerLogo || host.profilePhoto!}
                    alt={displayName}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <IoPersonOutline className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              {host.rating && host.rating >= 4.9 && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                  <IoStar className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>

            {/* Host Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {displayName}
                </h3>
                {host.isVerified && (
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {host.city}, {host.state}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <IoStar className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {host.rating?.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  ({t('tripCount', { count: host.totalTrips })})
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {host.bio && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {host.bio}
            </p>
          )}

          {/* Stats */}
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>{t('tripCount', { count: host.totalTrips })}</span>
            {host.responseRate && (
              <span>{t('responseRate', { rate: Math.round(host.responseRate) })}</span>
            )}
            {host.joinedAt && (
              <span>{t('since', { year: new Date(host.joinedAt).getFullYear() })}</span>
            )}
          </div>

          {/* Badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            {host.rating && host.rating >= 4.9 && (
              <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded">
                {t('topRated')}
              </span>
            )}
            {host.isVerified && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded">
                {t('verified')}
              </span>
            )}
            {(host.responseRate ?? 0) >= 90 && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                {t('fastResponder')}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Host Profile Bottom Sheet */}
      <HostProfileSheet
        hostId={host.id}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </>
  )
}
