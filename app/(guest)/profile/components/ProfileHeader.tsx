// app/(guest)/profile/components/ProfileHeader.tsx
'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { 
  IoCameraOutline, 
  IoStarOutline,
  IoCarOutline,
  IoTrophyOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5'

interface ProfileHeaderProps {
  profile: {
    id: string
    name: string
    email: string
    profilePhoto?: string
    memberSince: string
    totalTrips: number
    averageRating: number
    loyaltyPoints: number
    memberTier: string
    fullyVerified: boolean
  }
  uploadingPhoto: boolean
  onPhotoUpload: (file: File) => void
  canEdit: boolean
}

export default function ProfileHeader({
  profile,
  uploadingPhoto,
  onPhotoUpload,
  canEdit
}: ProfileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoClick = () => {
    if (canEdit) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG)')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB')
        return
      }
      
      onPhotoUpload(file)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum':
        return 'from-gray-400 to-gray-600'
      case 'gold':
        return 'from-yellow-400 to-yellow-600'
      case 'silver':
        return 'from-gray-300 to-gray-500'
      default:
        return 'from-orange-400 to-orange-600'
    }
  }

  const getTierIcon = (tier: string) => {
    return <IoTrophyOutline className="w-3 h-3 sm:w-4 sm:h-4" />
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Profile Photo */}
        <div className="relative flex-shrink-0">
          <div 
            className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden ${
              canEdit ? 'cursor-pointer group' : ''
            }`}
            onClick={handlePhotoClick}
          >
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
            
            {/* Upload Overlay */}
            {canEdit && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {uploadingPhoto ? (
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-2 border-white border-t-transparent" />
                ) : (
                  <div className="text-center">
                    <IoCameraOutline className="w-5 h-5 sm:w-6 sm:h-6 text-white mx-auto mb-0.5" />
                    <p className="text-[8px] sm:text-[10px] text-white font-medium hidden sm:block">
                      Change Photo
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Verified Badge */}
          {profile.fullyVerified && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white dark:border-gray-800 shadow-lg">
              <IoShieldCheckmarkOutline className="w-3 h-3 text-white" />
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Profile Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2 sm:mb-2.5">
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                {profile.name}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                {profile.email}
              </p>
            </div>

            {/* Member Tier Badge */}
            <div className={`px-2 py-0.5 sm:px-2.5 sm:py-1 bg-gradient-to-r ${getTierColor(profile.memberTier)} text-white rounded-lg text-[10px] sm:text-xs font-bold flex items-center gap-1 whitespace-nowrap flex-shrink-0`}>
              <span className="hidden sm:inline">{getTierIcon(profile.memberTier)}</span>
              <span>{profile.memberTier}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
            {/* Total Trips */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-1.5 sm:p-2.5 text-center">
              <div className="flex items-center justify-center gap-0.5 mb-1">
                <IoCarOutline className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-0.5">
                {profile.totalTrips}
              </p>
              <span className="text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 block">Trips</span>
            </div>

            {/* Average Rating */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-1.5 sm:p-2.5 text-center">
              <div className="flex items-center justify-center gap-0.5 mb-1">
                <IoStarOutline className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
              </div>
              <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-0.5">
                {profile.averageRating > 0 ? profile.averageRating.toFixed(1) : 'N/A'}
              </p>
              <span className="text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 block">Rating</span>
            </div>

            {/* Loyalty Points */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-1.5 sm:p-2.5 text-center">
              <div className="flex items-center justify-center gap-0.5 mb-1">
                <IoTrophyOutline className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-0.5">
                {profile.loyaltyPoints.toLocaleString()}
              </p>
              <span className="text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 block">Points</span>
            </div>

            {/* Member Since */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-1.5 sm:p-2.5 text-center">
              <div className="flex items-center justify-center gap-0.5 mb-1">
                <IoShieldCheckmarkOutline className="w-3 h-3 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-0.5">
                {new Date(profile.memberSince).getFullYear()}
              </p>
              <span className="text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 block">Member</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Instructions */}
      {canEdit && !uploadingPhoto && (
        <div className="mt-2">
          <p className="text-[10px] text-center text-gray-500 dark:text-gray-400">
            <span className="sm:hidden">Tap profile photo to change</span>
            <span className="hidden sm:inline">Click profile photo to change</span>
          </p>
        </div>
      )}
    </div>
  )
}