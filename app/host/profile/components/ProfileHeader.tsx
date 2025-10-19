// app/host/profile/components/ProfileHeader.tsx
'use client'

import { useRef } from 'react'
import Image from 'next/image'
import {
  IoPersonOutline,
  IoCameraOutline,
  IoMailOutline,
  IoPhonePortraitOutline,
  IoLocationOutline,
  IoStarOutline,
  IoShieldCheckmarkOutline,
  IoTimeOutline,
  IoBanOutline
} from 'react-icons/io5'

interface HostProfile {
  id: string
  name: string
  email: string
  phone: string
  city: string
  state: string
  profilePhoto?: string
  isVerified: boolean
  totalTrips: number
  rating: number
  responseRate?: number
  acceptanceRate?: number
  approvalStatus: 'PENDING' | 'NEEDS_ATTENTION' | 'APPROVED' | 'SUSPENDED' | 'REJECTED'
}

interface ProfileHeaderProps {
  profile: HostProfile
  uploadingPhoto: boolean
  onPhotoUpload: (file: File) => void
  isSuspended: boolean
  isApproved: boolean
}

export default function ProfileHeader({
  profile,
  uploadingPhoto,
  onPhotoUpload,
  isSuspended,
  isApproved
}: ProfileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onPhotoUpload(file)
    }
  }

  const getStatusBadge = () => {
    if (isApproved && profile.isVerified) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs">
          <IoShieldCheckmarkOutline className="w-3 h-3" />
          Verified
        </span>
      )
    }

    if (!isApproved && !isSuspended) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full text-xs">
          <IoTimeOutline className="w-3 h-3" />
          Pending
        </span>
      )
    }

    if (isSuspended) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-xs">
          <IoBanOutline className="w-3 h-3" />
          Suspended
        </span>
      )
    }

    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        {/* Profile Photo */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            {profile.profilePhoto ? (
              <Image
                src={profile.profilePhoto}
                alt={profile.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <IoPersonOutline className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Upload Button */}
          {!isSuspended && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 p-1 sm:p-1.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Upload profile photo"
              >
                <IoCameraOutline className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                aria-hidden="true"
              />
            </>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1 text-center sm:text-left w-full">
          {/* Name and Status */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 justify-center sm:justify-start mb-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {profile.name}
            </h2>
            {getStatusBadge()}
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
            <span className="flex items-center justify-center sm:justify-start">
              <IoMailOutline className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span className="truncate max-w-[250px] sm:max-w-none">{profile.email}</span>
            </span>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <span className="flex items-center justify-center sm:justify-start">
                <IoPhonePortraitOutline className="w-4 h-4 mr-1.5 flex-shrink-0" />
                {profile.phone}
              </span>
              <span className="flex items-center justify-center sm:justify-start">
                <IoLocationOutline className="w-4 h-4 mr-1.5 flex-shrink-0" />
                {profile.city}, {profile.state}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {profile.totalTrips || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Trips</p>
            </div>
            
            <div className="text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center sm:justify-start">
                {profile.rating || 0}
                <IoStarOutline className="w-4 h-4 ml-1 text-yellow-500" />
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Rating</p>
            </div>
            
            <div className="text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {profile.responseRate || 0}%
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Response Rate</p>
            </div>
            
            <div className="text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {profile.acceptanceRate || 0}%
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Acceptance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}