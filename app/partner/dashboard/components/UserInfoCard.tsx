// app/partner/dashboard/components/UserInfoCard.tsx
// Displays logged-in user/company information

'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  IoPersonOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoBriefcaseOutline,
  IoCheckmarkCircle,
  IoBanOutline,
  IoCameraOutline,
  IoRocketOutline,
  IoRemoveCircleOutline,
  IoCallOutline,
  IoMailOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline
} from 'react-icons/io5'
import { useTranslations, useLocale } from 'next-intl'

interface UserInfoCardProps {
  user: {
    name: string
    email: string
    phone: string | null
    emailVerified?: boolean
    phoneVerified?: boolean
    companyName: string | null
    profilePhoto: string | null
    hostType: string | null
    memberSince: string | null
    lastLogin: string | null
    isActive?: boolean
    isExternalRecruit?: boolean
    hasCars?: boolean
    hasPassword?: boolean
    paymentPreference?: string | null
    agreementPreference?: string | null
    onboardingCompletedAt?: string | null
  } | null
  loading?: boolean
  activeBookingCount?: number
  onPhotoChange?: (file: File) => void
  onNavigateToSection?: (section: string) => void
}

export default function UserInfoCard({ user, loading, activeBookingCount = 0, onPhotoChange, onNavigateToSection }: UserInfoCardProps) {
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

  function getHostTypeLabel(hostType: string | null, isExternal: boolean): string {
    if (isExternal) return t('uiBusiness')
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

  // #15 — Setup is complete when: active + has password + ≥1 car + payment preference set
  const setupComplete = isActive && user.hasPassword !== false && hasCars && !!user.paymentPreference
  const needsSetup = isExternalRecruit && !setupComplete

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
          {onPhotoChange && (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-1">{t('editPhoto')}</p>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          {/* Name + Status Badge on same row */}
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
              {displayName}
            </h2>
            <div className="flex-shrink-0">
              {isExternalRecruit ? (
                !user.onboardingCompletedAt ? (
                  <Link href="/partner/requests" className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors">
                    <IoRocketOutline className="w-3 h-3" />
                    {t('uiBookingInProgress')}
                  </Link>
                ) : activeBookingCount > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                    <IoCheckmarkCircle className="w-3.5 h-3.5" />
                    {t('uiActiveReservation')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                    <IoRemoveCircleOutline className="w-3.5 h-3.5" />
                    {t('uiNoActiveReservation')}
                  </span>
                )
              ) : (
                needsSetup ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                    <IoRocketOutline className="w-3.5 h-3.5" />
                    {t('uiOnboarding')}
                  </span>
                ) : isActive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                    <IoCheckmarkCircle className="w-3.5 h-3.5" />
                    {t('uiActive')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                    <IoBanOutline className="w-3.5 h-3.5" />
                    {t('uiSuspended')}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Role/Type on second line with badges */}
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1 uppercase">
              <IoBriefcaseOutline className="w-3 h-3 flex-shrink-0" />
              {getHostTypeLabel(user.hostType, isExternalRecruit)}
            </span>
            {/* Setup Required badge — only during onboarding */}
            {needsSetup && (
              <Link href="/partner/requests" className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors">
                {t('uiSetupRequired')}
              </Link>
            )}
            {/* External badge — only after onboarding completes */}
            {isExternalRecruit && !!user.onboardingCompletedAt && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded">
                {t('uiExternal')}
              </span>
            )}
          </div>

          <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
            <IoMailOutline className="w-3 h-3 flex-shrink-0" />
            {user.email}
            <span title={user.emailVerified ? t('uiVerified') : t('uiNotVerified')} className="flex-shrink-0 cursor-help">
              {user.emailVerified ? (
                <IoCheckmarkCircleOutline className="w-3 h-3 text-green-500" />
              ) : (
                <IoCloseCircleOutline className="w-3 h-3 text-red-400" />
              )}
            </span>
          </p>

          {/* Phone */}
          {user.phone && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
              <IoCallOutline className="w-3 h-3 flex-shrink-0" />
              {user.phone}
              <span title={user.phoneVerified ? t('uiVerified') : t('uiNotVerified')} className="flex-shrink-0 cursor-help">
                {user.phoneVerified ? (
                  <IoCheckmarkCircleOutline className="w-3 h-3 text-green-500" />
                ) : (
                  <IoCloseCircleOutline className="w-3 h-3 text-red-400" />
                )}
              </span>
            </p>
          )}

          {/* Date Info */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <IoCalendarOutline className="w-3 h-3 flex-shrink-0" />
              {needsSetup ? (
                <button
                  onClick={() => onNavigateToSection?.('security')}
                  className="text-[11px] text-amber-600 dark:text-amber-400 font-medium hover:underline cursor-pointer"
                >
                  {t('uiAwaitingSetup')}
                </button>
              ) : (
                <span>{t('uiJoined', { date: formatDate(user.memberSince) })}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <IoTimeOutline className="w-3 h-3 flex-shrink-0" />
              <span>{t('uiLastLogin', { time: formatRelativeTime(user.lastLogin) })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
