// app/components/claims/PhotoComparison.tsx
'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import {
  IoImageOutline,
  IoCloseCircleOutline,
  IoEyeOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoInformationCircleOutline,
  IoPersonOutline,
  IoCloudUploadOutline,
  IoAlertCircleOutline,
} from 'react-icons/io5'

interface DamagePhoto {
  id: string
  url: string
  caption: string | null
  order: number
  uploadedBy: string
  uploadedAt: string
}

interface PhotoComparisonProps {
  preTripPhotos: string[]
  postTripPhotos: string[]
  hostDamagePhotos: DamagePhoto[]
  guestDamagePhotos: DamagePhoto[]
  onUploadHostPhotos?: (files: File[]) => Promise<void>
  isUploading?: boolean
}

export default function PhotoComparison({
  preTripPhotos,
  postTripPhotos,
  hostDamagePhotos,
  guestDamagePhotos,
  onUploadHostPhotos,
  isUploading = false,
}: PhotoComparisonProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [currentGallery, setCurrentGallery] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'preTrip' | 'postTrip' | 'hostDamage' | 'guestDamage'>('preTrip')
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Optimize Cloudinary images
  const optimizeImageUrl = (url: string, width: number = 400, quality: number = 80): string => {
    if (!url) return url
    
    if (url.includes('cloudinary.com')) {
      const parts = url.split('/upload/')
      if (parts.length === 2) {
        return `${parts[0]}/upload/w_${width},q_${quality},f_auto/${parts[1]}`
      }
    }
    
    return url
  }

  const openLightbox = (photo: string, index: number, gallery: string[]) => {
    setSelectedPhoto(photo)
    setSelectedIndex(index)
    setCurrentGallery(gallery)
  }

  const closeLightbox = () => {
    setSelectedPhoto(null)
    setSelectedIndex(0)
    setCurrentGallery([])
  }

  const goToPrevious = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
      setSelectedPhoto(currentGallery[selectedIndex - 1])
    }
  }

  const goToNext = () => {
    if (selectedIndex < currentGallery.length - 1) {
      setSelectedIndex(selectedIndex + 1)
      setSelectedPhoto(currentGallery[selectedIndex + 1])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious()
    if (e.key === 'ArrowRight') goToNext()
    if (e.key === 'Escape') closeLightbox()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length === 0) return

    setUploadError(null)

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const invalidFiles = files.filter(f => !validTypes.includes(f.type))
    
    if (invalidFiles.length > 0) {
      setUploadError('Only JPG, PNG, and WEBP images are allowed')
      return
    }

    // Validate file sizes (max 10MB each)
    const oversizedFiles = files.filter(f => f.size > 10 * 1024 * 1024)
    
    if (oversizedFiles.length > 0) {
      setUploadError('Each file must be under 10MB')
      return
    }

    if (onUploadHostPhotos) {
      try {
        await onUploadHostPhotos(files)
        e.target.value = '' // Reset input
      } catch (error: any) {
        setUploadError(error.message || 'Failed to upload photos')
      }
    }
  }

  const PhotoGrid = ({ 
    photos, 
    title, 
    bgColor,
    count,
    showUpload = false
  }: { 
    photos: string[]
    title: string
    bgColor: string
    count: number
    showUpload?: boolean
  }) => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <IoImageOutline className="w-4 h-4" />
          {title}
        </h4>
        <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          {count} photo{count !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Upload Section for Host Damage Photos */}
      {showUpload && onUploadHostPhotos && (
        <div className="mb-6 space-y-3">
          {/* Warning Banner */}
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <IoAlertCircleOutline className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-1">
                  Important: Upload NEW Photos Only
                </h5>
                <p className="text-sm text-red-800 dark:text-red-300">
                  Do not re-upload photos from the Pre-Trip or Post-Trip inspection. Only upload NEW photos that show the current damage.
                </p>
              </div>
            </div>
          </div>

          {/* Upload Button */}
          <label className="block">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="hidden"
            />
            <div className={`
              flex items-center justify-center gap-3 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors
              ${isUploading 
                ? 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 cursor-not-allowed' 
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30'
              }
            `}>
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Uploading...
                  </span>
                </>
              ) : (
                <>
                  <IoCloudUploadOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Upload Additional Damage Photos
                  </span>
                </>
              )}
            </div>
          </label>

          {/* Upload Error */}
          {uploadError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-300">{uploadError}</p>
            </div>
          )}

          {/* Upload Instructions */}
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Supported formats: JPG, PNG, WEBP • Max size: 10MB per file • Multiple files allowed
          </p>
        </div>
      )}

      {photos.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <IoImageOutline className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">No photos available</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo, index) => (
            <button
              key={index}
              className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500 ${bgColor}`}
              onClick={() => openLightbox(photo, index, photos)}
              aria-label={`View ${title.toLowerCase()} photo ${index + 1} of ${count}`}
            >
              <Image
                src={optimizeImageUrl(photo, 300)}
                alt={`${title} ${index + 1}`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                loading="lazy"
                quality={80}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                <IoEyeOutline className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {index + 1}/{count}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )

  // Extract URLs from damage photo objects
  const hostPhotoUrls = hostDamagePhotos.map(p => p.url)
  const guestPhotoUrls = guestDamagePhotos.map(p => p.url)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <IoImageOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        Photo Documentation
      </h3>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('preTrip')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'preTrip'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <span className="flex items-center gap-2">
            <IoCheckmarkCircleOutline className="w-4 h-4" />
            Pre-Trip ({preTripPhotos.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('postTrip')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'postTrip'
              ? 'border-red-600 text-red-600 dark:text-red-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <span className="flex items-center gap-2">
            <IoImageOutline className="w-4 h-4" />
            Post-Trip ({postTripPhotos.length})
          </span>
        </button>

        {hostDamagePhotos.length > 0 && (
          <button
            onClick={() => setActiveTab('hostDamage')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'hostDamage'
                ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <IoWarningOutline className="w-4 h-4" />
              Reported by Host (You) ({hostDamagePhotos.length})
              <div className="group relative">
                <IoInformationCircleOutline className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  Photos you uploaded as the host to document damage
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                </div>
              </div>
            </span>
          </button>
        )}

        {guestDamagePhotos.length > 0 && (
          <button
            onClick={() => setActiveTab('guestDamage')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'guestDamage'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <IoPersonOutline className="w-4 h-4" />
              Reported by Guest ({guestDamagePhotos.length})
              <div className="group relative">
                <IoInformationCircleOutline className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  Photos uploaded by the guest in their response to the claim
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                </div>
              </div>
            </span>
          </button>
        )}
      </div>

      {/* Photo Grids */}
      <div className="space-y-8">
        {activeTab === 'preTrip' && (
          <PhotoGrid
            photos={preTripPhotos}
            title="Pre-Trip Inspection Photos"
            bgColor="bg-blue-50 dark:bg-blue-900/10"
            count={preTripPhotos.length}
          />
        )}

        {activeTab === 'postTrip' && (
          <PhotoGrid
            photos={postTripPhotos}
            title="Post-Trip Inspection Photos"
            bgColor="bg-red-50 dark:bg-red-900/10"
            count={postTripPhotos.length}
          />
        )}

        {activeTab === 'hostDamage' && hostDamagePhotos.length > 0 && (
          <PhotoGrid
            photos={hostPhotoUrls}
            title="Damage Reported by Host (You)"
            bgColor="bg-orange-50 dark:bg-orange-900/10"
            count={hostDamagePhotos.length}
            showUpload={true}
          />
        )}

        {activeTab === 'guestDamage' && guestDamagePhotos.length > 0 && (
          <PhotoGrid
            photos={guestPhotoUrls}
            title="Damage Reported by Guest"
            bgColor="bg-purple-50 dark:bg-purple-900/10"
            count={guestDamagePhotos.length}
          />
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pre-Trip</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {preTripPhotos.length}
            </p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Post-Trip</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {postTripPhotos.length}
            </p>
          </div>
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Host Damage</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {hostDamagePhotos.length}
            </p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Guest Damage</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {guestDamagePhotos.length}
            </p>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white rounded-full p-2 transition-colors z-10"
            aria-label="Close photo viewer"
          >
            <IoCloseCircleOutline className="w-8 h-8" />
          </button>

          {/* Photo Counter */}
          <div className="absolute top-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            {selectedIndex + 1} / {currentGallery.length}
          </div>

          {/* Previous Button */}
          {selectedIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                goToPrevious()
              }}
              className="absolute left-4 text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white rounded-full p-2 transition-colors"
              aria-label="Previous photo"
            >
              <IoChevronBackOutline className="w-10 h-10" />
            </button>
          )}

          {/* Next Button */}
          {selectedIndex < currentGallery.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
              className="absolute right-4 text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white rounded-full p-2 transition-colors"
              aria-label="Next photo"
            >
              <IoChevronForwardOutline className="w-10 h-10" />
            </button>
          )}

          {/* Image */}
          <div 
            className="relative max-w-7xl max-h-[90vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedPhoto}
              alt={`Photo ${selectedIndex + 1}`}
              fill
              className="object-contain"
              quality={90}
              priority
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  )
}