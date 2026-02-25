// app/partner/dashboard/components/UserInfoCard.tsx
// Displays logged-in user/company information

'use client'

import { useRef } from 'react'
import Image from 'next/image'
import {
  IoPersonOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoBriefcaseOutline,
  IoCheckmarkCircle,
  IoBanOutline,
  IoCameraOutline,
  IoRocketOutline
} from 'react-icons/io5'
import { useTranslations, useLocale } from 'next-intl'

interface UserInfoCardProps {
  user: {
    name: string
    email: string
    companyName: string | null
    profilePhoto: string | null
    hostType: string | null
    memberSince: string | null
    lastLogin: string | null
    isActive?: boolean
    isExternalRecruit?: boolean
    hasCars?: boolean
  } | null
  loading?: boolean
  onPhotoChange?: (file: File) => void
}

export default function UserInfoCard({ user, loading, onPhotoChange }: UserInfoCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = useTranslations('PartnerDashboard')

  const locale = useLocale()

  function formatDate(dateString: string | null): string {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  function formatRelativeTime(dateString: string | null): string {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    return formatDate(dateString)
  }

  function getHostTypeLabel(hostType: string | null): string {
    switch (hostType) {
      case 'FLEET_PARTNER':
        return t('uiFleetPartner')
      case 'HOST_MANAGER':
        return t('uiFleetManager')
      case 'VEHICLE_OWNER':
        return t('uiVehicleOwner')
      default:
        return t('uiHost')
    }
  }

  const handlePhotoClick = () => {
    if (onPhotoChange) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onPhotoChange) {
      onPhotoChange(file)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
        <div className="flex items-start gap-4 animate-pulse">
          {/* Avatar skeleton */}
          <div className="flex-shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
          {/* Content skeleton */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Name/Company */}
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40" />
            {/* Role/Type */}
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28" />
            {/* Email */}
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48" />
            {/* Date info row */}
            <div className="flex items-center gap-4 pt-1">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-28" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const displayName = user.companyName || user.name || t('uiFleetManager')
  const isActive = user.isActive !== false // Default to active if not specified
  const isExternalRecruit = user.isExternalRecruit || false
  const hasCars = user.hasCars !== false // Default to true if not specified

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
      <div className="flex items-start gap-4">
        {/* Profile Photo / Logo - Clickable for edit */}
        <div className="flex-shrink-0 relative group">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={handlePhotoClick}
            className={`relative block ${onPhotoChange ? 'cursor-pointer' : 'cursor-default'}`}
            disabled={!onPhotoChange}
          >
            {user.profilePhoto ? (
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-white border-2 border-gray-200 dark:border-gray-600">
                <Image
                  src={user.profilePhoto}
                  alt={displayName}
                  fill
                  className="object-contain"
                  style={{ transform: 'scale(1.15) translateY(0.5px)', transformOrigin: 'center center' }}
                />
              </div>
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
                <IoPersonOutline className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
            )}

            {/* Edit overlay on hover */}
            {onPhotoChange && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <IoCameraOutline className="w-5 h-5 text-white" />
              </div>
            )}
          </button>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          {/* Name/Company with status badge */}
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
              {displayName}
            </h2>
            {/* Status Badge - positioned at top right on mobile, inline on desktop */}
          </div>

          {/* Role/Type on second line with badge */}
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <IoBriefcaseOutline className="w-3.5 h-3.5" />
              {getHostTypeLabel(user.hostType)}
            </span>
            {isExternalRecruit && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded">
                {t('uiExternal')}
              </span>
            )}
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
            {user.email}
          </p>

          {/* Date Info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <IoCalendarOutline className="w-3.5 h-3.5" />
              {isExternalRecruit ? (
                <span className="text-purple-600 dark:text-purple-400 font-medium">{t('uiSetupRequired')}</span>
              ) : (
                <span>{t('uiJoined', { date: formatDate(user.memberSince) })}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <IoTimeOutline className="w-3.5 h-3.5" />
              <span>{t('uiLastLogin', { time: formatRelativeTime(user.lastLogin) })}</span>
            </div>
          </div>
        </div>

        {/* Status Badge - Top Right Corner */}
        <div className="flex-shrink-0">
          {isExternalRecruit && !hasCars ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
              <IoRocketOutline className="w-3.5 h-3.5" />
              {t('uiOnboarding')}
            </span>
          ) : isActive ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
              <IoCheckmarkCircle className="w-3.5 h-3.5" />
              {t('uiActive')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
              <IoBanOutline className="w-3.5 h-3.5" />
              {t('uiSuspended')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
