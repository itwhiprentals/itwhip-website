// app/partner/dashboard/components/UserInfoCard.tsx
// Displays logged-in user/company information

'use client'

import Image from 'next/image'
import {
  IoPersonOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoBriefcaseOutline
} from 'react-icons/io5'

interface UserInfoCardProps {
  user: {
    name: string
    email: string
    companyName: string | null
    profilePhoto: string | null
    hostType: string | null
    memberSince: string | null
    lastLogin: string | null
  } | null
  loading?: boolean
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
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
      return 'Fleet Partner'
    case 'HOST_MANAGER':
      return 'Fleet Manager'
    case 'VEHICLE_OWNER':
      return 'Vehicle Owner'
    default:
      return 'Host'
  }
}

export default function UserInfoCard({ user, loading }: UserInfoCardProps) {
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

  const displayName = user.companyName || user.name || 'Fleet Manager'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
      <div className="flex items-start gap-4">
        {/* Profile Photo / Logo */}
        <div className="flex-shrink-0">
          {user.profilePhoto ? (
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-white">
              <Image
                src={user.profilePhoto}
                alt={displayName}
                fill
                className="object-contain"
                style={{ transform: 'scale(1.15) translateY(0.5px)', transformOrigin: 'center center' }}
              />
            </div>
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <IoPersonOutline className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          {/* Name/Company on first line */}
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
            {displayName}
          </h2>

          {/* Role/Type on second line with badge */}
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <IoBriefcaseOutline className="w-3.5 h-3.5" />
              {getHostTypeLabel(user.hostType)}
            </span>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
            {user.email}
          </p>

          {/* Date Info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <IoCalendarOutline className="w-3.5 h-3.5" />
              <span>Joined {formatDate(user.memberSince)}</span>
            </div>
            <div className="flex items-center gap-1">
              <IoTimeOutline className="w-3.5 h-3.5" />
              <span>Last login {formatRelativeTime(user.lastLogin)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
