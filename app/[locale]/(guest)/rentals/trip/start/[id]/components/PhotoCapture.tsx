// app/(guest)/rentals/trip/start/[id]/components/PhotoCapture.tsx

'use client'

import { useState, useRef } from 'react'
import { TRIP_CONSTANTS } from '@/app/lib/trip/constants'
import { validatePhotoFile } from '@/app/lib/trip/validation'
import {
  IoCamera,
  IoCheckmarkCircle,
  IoImageOutline,
  IoRefresh,
  IoChevronForward,
  IoChevronBack,
  IoShieldCheckmark,
} from 'react-icons/io5'

interface PhotoCaptureProps {
  booking: any
  data: any
  onPhotoCapture: (photoId: string, url: string) => void
}

export function PhotoCapture({ booking, data, onPhotoCapture }: PhotoCaptureProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(() => {
    // Start at the first un-captured photo
    const photos = TRIP_CONSTANTS.REQUIRED_PHOTOS.start
    const firstEmpty = photos.findIndex(p => !data.photos[p.id])
    return firstEmpty >= 0 ? firstEmpty : 0
  })
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const requiredPhotos = TRIP_CONSTANTS.REQUIRED_PHOTOS.start
  const currentPhoto = requiredPhotos[currentPhotoIndex]
  const capturedCount = Object.keys(data.photos).length
  const requiredCount = requiredPhotos.filter(p => p.required).length
  const allRequiredDone = requiredPhotos.filter(p => p.required).every(p => data.photos[p.id])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validation = validatePhotoFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', `inspection_${currentPhoto.id}`)

      const response = await fetch(`/api/rentals/bookings/${booking.id}/trip/inspection-photos`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        onPhotoCapture(currentPhoto.id, result.url)

        // Auto-advance to next uncaptured photo
        const nextEmpty = requiredPhotos.findIndex((p, i) => i > currentPhotoIndex && !data.photos[p.id] && p.id !== currentPhoto.id)
        if (nextEmpty >= 0) {
          setCurrentPhotoIndex(nextEmpty)
        } else {
          // Check for earlier uncaptured
          const earlierEmpty = requiredPhotos.findIndex((p) => !data.photos[p.id] && p.id !== currentPhoto.id)
          if (earlierEmpty >= 0) {
            setCurrentPhotoIndex(earlierEmpty)
          }
        }
      } else {
        const errData = await response.json()
        setError(errData.error || 'Failed to upload photo')
      }
    } catch {
      setError('Failed to upload photo. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const navigatePhoto = (direction: 'prev' | 'next') => {
    setError(null)
    if (direction === 'prev' && currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1)
    } else if (direction === 'next' && currentPhotoIndex < requiredPhotos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1)
    }
  }

  const isCaptured = (photoId: string) => !!data.photos[photoId]
  const currentCaptured = isCaptured(currentPhoto.id)
  const currentUrl = data.photos[currentPhoto.id]

  return (
    <div className="space-y-5">
      {/* Header info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
          <IoCamera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Vehicle Inspection Photos</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Clear, well-lit photos protect both you and the owner</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 flex-shrink-0">
          <span className="text-xs font-bold text-gray-900 dark:text-white">{capturedCount}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">/</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{requiredCount}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${Math.min((capturedCount / requiredCount) * 100, 100)}%` }}
        />
      </div>

      {/* Main capture area */}
      <div className="relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
        {/* Photo preview or capture prompt */}
        <div className="relative aspect-[4/3] flex items-center justify-center">
          {currentCaptured && currentUrl ? (
            <img
              src={currentUrl}
              alt={currentPhoto.label}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 rounded-full bg-white/80 dark:bg-gray-700/80 flex items-center justify-center mb-4 shadow-sm">
                <IoImageOutline className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{currentPhoto.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tap the button below to capture</p>
            </div>
          )}

          {/* Uploading overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium text-white">Uploading...</span>
              </div>
            </div>
          )}

          {/* Photo counter badge */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm">
            <span className="text-xs font-semibold text-white">
              {currentPhotoIndex + 1} / {requiredPhotos.length}
            </span>
          </div>

          {/* Required badge */}
          {currentPhoto.required && !currentCaptured && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-red-500/90 backdrop-blur-sm">
              <span className="text-xs font-semibold text-white">Required</span>
            </div>
          )}

          {/* Captured check */}
          {currentCaptured && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-green-500/90 backdrop-blur-sm flex items-center gap-1">
              <IoCheckmarkCircle className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-semibold text-white">Done</span>
            </div>
          )}

          {/* Nav arrows */}
          {currentPhotoIndex > 0 && (
            <button
              onClick={() => navigatePhoto('prev')}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <IoChevronBack className="w-5 h-5 text-white" />
            </button>
          )}
          {currentPhotoIndex < requiredPhotos.length - 1 && (
            <button
              onClick={() => navigatePhoto('next')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <IoChevronForward className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        {/* Photo label bar */}
        <div className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{currentPhoto.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {currentPhoto.required ? 'Required' : 'Optional'}
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 ${
              currentCaptured
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
            }`}
          >
            {currentCaptured ? (
              <>
                <IoRefresh className="w-4 h-4" />
                Retake
              </>
            ) : (
              <>
                <IoCamera className="w-4 h-4" />
                Capture
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-3 py-2 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Thumbnail strip */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {requiredPhotos.map((photo, index) => {
          const captured = isCaptured(photo.id)
          const isActive = index === currentPhotoIndex
          const url = data.photos[photo.id]

          return (
            <button
              key={photo.id}
              onClick={() => { setCurrentPhotoIndex(index); setError(null) }}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                isActive
                  ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20'
                  : captured
                  ? 'border-green-500 dark:border-green-500'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {captured && url ? (
                <img src={url} alt={photo.label} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <IoCamera className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
              )}
              {captured && (
                <div className="absolute bottom-0.5 right-0.5">
                  <IoCheckmarkCircle className="w-4 h-4 text-green-500 drop-shadow-sm" />
                </div>
              )}
              {!captured && photo.required && (
                <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* Completion status */}
      {allRequiredDone && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
          <IoShieldCheckmark className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-900 dark:text-green-200">All required photos captured</p>
            <p className="text-xs text-green-700 dark:text-green-400">You can proceed to the next step</p>
          </div>
        </div>
      )}
    </div>
  )
}
