// app/(guest)/profile/components/ProfileHeader.tsx
// Simplified header - just photo, name, email, and verified badge
// Photo upload has been moved to the Account tab
'use client'

import Image from 'next/image'
import { IoShieldCheckmarkOutline } from 'react-icons/io5'

interface ProfileHeaderProps {
  profile: {
    id: string
    name: string
    email: string
    profilePhoto?: string
    fullyVerified: boolean
  }
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-4">
        {/* Profile Photo - Display only (upload moved to Account tab) */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden">
            {profile.profilePhoto ? (
              <Image
                src={profile.profilePhoto}
                alt={profile.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                {profile.name?.[0]?.toUpperCase() || 'G'}
              </div>
            )}
          </div>

          {/* Verified Badge on Photo */}
          {profile.fullyVerified && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white dark:border-gray-800 shadow-lg">
              <IoShieldCheckmarkOutline className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Name + Email */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
              {profile.name}
            </h2>
            {profile.fullyVerified && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                Verified
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {profile.email}
          </p>
        </div>
      </div>
    </div>
  )
}
