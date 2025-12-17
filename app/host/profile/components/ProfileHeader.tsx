// app/host/profile/components/ProfileHeader.tsx
'use client'

import { useRef, useState } from 'react'
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
  IoBanOutline,
  IoEyeOutline,
  IoEyeOffOutline
} from 'react-icons/io5'

// Format phone number as +1 (XXX) XXX-XXXX
function formatPhoneNumber(phone: string): string {
  if (!phone) return ''

  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')

  // Handle US numbers
  if (digits.length === 10) {
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }

  // Return original if can't format
  return phone
}

// Mask address for privacy
function maskAddress(address: string): string {
  if (!address) return ''
  const parts = address.split(',')
  if (parts.length >= 2) {
    // Show only state/last part
    return `••••••, ${parts[parts.length - 1].trim()}`
  }
  return '••••••'
}

// Mask phone number for privacy
function maskPhoneNumber(phone: string): string {
  if (!phone) return ''
  const formatted = formatPhoneNumber(phone)
  // Mask middle digits: +1 (XXX) XXX-XXXX -> +1 (•••) •••-XXXX
  return formatted.replace(/\((\d{3})\) (\d{3})-/, '(•••) •••-')
}

// Mask email for privacy
function maskEmail(email: string): string {
  if (!email) return ''
  const [localPart, domain] = email.split('@')
  if (!domain) return '••••••@••••••'
  const maskedLocal = localPart.length > 2
    ? localPart[0] + '•'.repeat(Math.min(localPart.length - 2, 6)) + localPart[localPart.length - 1]
    : '••'
  const [domainName, tld] = domain.split('.')
  const maskedDomain = domainName ? domainName[0] + '•••' : '••••'
  return `${maskedLocal}@${maskedDomain}.${tld || '•••'}`
}

interface HostProfile {
  id: string
  name: string
  email: string
  phone: string
  city: string
  state: string
  address?: string
  zipCode?: string
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
  const [showEmail, setShowEmail] = useState(false)
  const [showPhone, setShowPhone] = useState(false)
  const [showAddress, setShowAddress] = useState(false)

  // Build full address string with zip code
  const fullAddress = [profile.city, profile.state, profile.zipCode].filter(Boolean).join(', ')

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

  // Display rating - new hosts start at 0, not 5
  const displayRating = profile.totalTrips > 0 ? (profile.rating || 0) : 0

  return (
    <>
      {/* Card 1: Profile Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start gap-4">
          {/* Profile Photo */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              {profile.profilePhoto ? (
                <Image
                  src={profile.profilePhoto}
                  alt={profile.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <IoPersonOutline className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
              )}
            </div>

            {/* Upload Button */}
            {!isSuspended && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute bottom-0 right-0 p-1 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Upload profile photo"
                >
                  <IoCameraOutline className="w-3 h-3" />
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
          <div className="flex-1 min-w-0">
            {/* Name and Badge */}
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                {profile.name}
              </h2>
              {getStatusBadge()}
            </div>

            {/* Contact Info */}
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div className="flex items-center">
                <IoMailOutline className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                <span className="truncate">{showEmail ? profile.email : maskEmail(profile.email)}</span>
                <button
                  onClick={() => setShowEmail(!showEmail)}
                  className="ml-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={showEmail ? 'Hide email' : 'Show email'}
                >
                  {showEmail ? (
                    <IoEyeOffOutline className="w-3.5 h-3.5" />
                  ) : (
                    <IoEyeOutline className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <div className="flex items-center">
                <IoPhonePortraitOutline className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                {showPhone ? formatPhoneNumber(profile.phone) : maskPhoneNumber(profile.phone)}
                <button
                  onClick={() => setShowPhone(!showPhone)}
                  className="ml-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={showPhone ? 'Hide phone' : 'Show phone'}
                >
                  {showPhone ? (
                    <IoEyeOffOutline className="w-3.5 h-3.5" />
                  ) : (
                    <IoEyeOutline className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <div className="flex items-center">
                <IoLocationOutline className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                {showAddress ? fullAddress : maskAddress(fullAddress)}
                <button
                  onClick={() => setShowAddress(!showAddress)}
                  className="ml-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={showAddress ? 'Hide address' : 'Show address'}
                >
                  {showAddress ? (
                    <IoEyeOffOutline className="w-3.5 h-3.5" />
                  ) : (
                    <IoEyeOutline className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Stats */}
      <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          <div className="text-center">
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {profile.totalTrips || 0}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Trips</p>
          </div>

          <div className="text-center">
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center justify-center">
              {displayRating}
              <IoStarOutline className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5 text-yellow-500" />
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Rating</p>
          </div>

          <div className="text-center">
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {profile.responseRate || 0}%
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Response</p>
          </div>

          <div className="text-center">
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {profile.acceptanceRate || 0}%
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Acceptance</p>
          </div>
        </div>
      </div>
    </>
  )
}