// app/(guest)/rentals/components/details/PhotoGallery.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoCloseOutline,
  IoCameraOutline,
  IoChevronUpOutline
} from 'react-icons/io5'

interface PhotoGalleryProps {
  photos: Array<{
    id: string
    url: string
    caption?: string
    isHero?: boolean
    order: number
  }>
  carName: string
  onViewModeChange?: (isAllPhotos: boolean) => void
}

export default function PhotoGallery({ photos, carName, onViewModeChange }: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAllPhotos, setShowAllPhotos] = useState(false)

  // Notify parent when view mode changes
  useEffect(() => {
    onViewModeChange?.(showAllPhotos)
  }, [showAllPhotos, onViewModeChange])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({})
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const allPhotosRef = useRef<HTMLDivElement>(null)

  // Sort photos by order and ensure unique keys
  const sortedPhotos = [...photos]
    .sort((a, b) => a.order - b.order)
    .map((photo, index) => ({
      ...photo,
      uniqueId: photo.id || `photo-${index}`,
      id: photo.id || `photo-${index}`
    }))

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (lightboxIndex !== null) {
        if (e.key === 'ArrowLeft') navigateLightboxPrev()
        if (e.key === 'ArrowRight') navigateLightboxNext()
        if (e.key === 'Escape') setLightboxIndex(null)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [lightboxIndex, sortedPhotos.length])

  // Scroll to top when showing all photos
  useEffect(() => {
    if (showAllPhotos && allPhotosRef.current) {
      allPhotosRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [showAllPhotos])

  const navigateNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sortedPhotos.length)
  }

  const navigatePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + sortedPhotos.length) % sortedPhotos.length)
  }

  const navigateLightboxNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => ((prev ?? 0) + 1) % sortedPhotos.length)
    }
  }

  const navigateLightboxPrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => ((prev ?? 0) - 1 + sortedPhotos.length) % sortedPhotos.length)
    }
  }

  const handleImageLoad = (photoId: string) => {
    setImageLoading(prev => ({ ...prev, [photoId]: false }))
  }

  const handleImageError = (photoId: string) => {
    setImageLoading(prev => ({ ...prev, [photoId]: false }))
  }

  // Touch handlers for swipe on main photo
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && sortedPhotos.length > 1) {
      navigateNext()
    }
    if (isRightSwipe && sortedPhotos.length > 1) {
      navigatePrev()
    }
  }

  // Handle empty state
  if (!sortedPhotos.length) {
    return (
      <div className="aspect-[4/3] lg:aspect-[2.35/1] bg-gray-100 dark:bg-gray-800 sm:rounded-lg flex items-center justify-center">
        <div className="text-center">
          <IoCameraOutline className="w-16 h-16 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No photos available</p>
        </div>
      </div>
    )
  }

  // Ensure current index is valid
  const safeCurrentIndex = Math.min(currentIndex, sortedPhotos.length - 1)

  return (
    <>
      {/* Main Gallery - Only show when not in "all photos" view */}
      {!showAllPhotos && (
        <div className="relative">
          {/* Main Image - 4:3 on mobile/tablet, 2.35:1 cinematic on desktop */}
          <div
            className="aspect-[4/3] lg:aspect-[2.35/1] relative bg-gray-100 dark:bg-gray-800 sm:rounded-lg overflow-hidden cursor-pointer"
            onClick={() => setShowAllPhotos(true)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {sortedPhotos.map((photo, index) => (
              <div
                key={`main-${photo.uniqueId}-${index}`}
                className={`absolute inset-0 transition-opacity duration-300 ${
                  index === safeCurrentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                {imageLoading[photo.uniqueId] !== false && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                  </div>
                )}
                <Image
                  src={photo.url || '/images/placeholder-car.jpg'}
                  alt={`${carName} - Photo ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  onLoad={() => handleImageLoad(photo.uniqueId)}
                  onError={() => handleImageError(photo.uniqueId)}
                />
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white text-sm">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Navigation Buttons - dark on mobile, light on desktop */}
            {sortedPhotos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigatePrev()
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 sm:bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-2 transition-all shadow-lg text-white sm:text-black dark:text-white"
                  aria-label="Previous photo"
                >
                  <IoChevronBackOutline className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateNext()
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 sm:bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-2 transition-all shadow-lg text-white sm:text-black dark:text-white"
                  aria-label="Next photo"
                >
                  <IoChevronForwardOutline className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Photo Counter - bottom right on mobile, bottom left on desktop */}
            <div className="absolute bottom-4 right-4 sm:right-auto sm:left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
              {safeCurrentIndex + 1} / {sortedPhotos.length}
            </div>

            {/* Tap to view all indicator - subtle hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 sm:hidden bg-black/40 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
              Tap to view all photos
            </div>
          </div>
        </div>
      )}

      {/* All Photos Vertical Listing View */}
      {showAllPhotos && (
        <div ref={allPhotosRef} className="bg-gray-50 dark:bg-gray-900">
          {/* Header with collapse button */}
          <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                All Photos ({sortedPhotos.length})
              </h3>
              <button
                onClick={() => setShowAllPhotos(false)}
                className="flex items-center gap-1 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium text-sm"
              >
                <IoChevronUpOutline className="w-4 h-4" />
                Collapse
              </button>
            </div>
          </div>

          {/* Vertical photo listing */}
          <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
            {sortedPhotos.map((photo, index) => (
              <div
                key={`listing-${photo.uniqueId}-${index}`}
                className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer hover:ring-2 hover:ring-amber-500 transition-all"
                onClick={() => setLightboxIndex(index)}
              >
                <Image
                  src={photo.url || '/images/placeholder-car.jpg'}
                  alt={`${carName} - Photo ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 896px"
                />
                {/* Photo number badge */}
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium">
                  {index + 1} / {sortedPhotos.length}
                </div>
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white text-sm">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Spacer for fixed button */}
          <div className="h-20" />
        </div>
      )}

      {/* Fixed "Back to car details" button - always visible when viewing all photos */}
      {showAllPhotos && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-white via-white dark:from-gray-900 dark:via-gray-900 to-transparent pt-8 px-4"
          style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="flex justify-center">
            <button
              onClick={() => setShowAllPhotos(false)}
              className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-full font-semibold shadow-xl transition-colors text-base"
            >
              Back to car details
            </button>
          </div>
        </div>
      )}

      {/* Lightbox Popup - appears when clicking a photo in the listing */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Semi-transparent backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Lightbox content */}
          <div
            className="relative w-full max-w-5xl max-h-[85vh] bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-3 right-3 z-10 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/60 transition-colors"
            >
              <IoCloseOutline className="w-6 h-6" />
            </button>

            {/* Photo counter */}
            <div className="absolute top-3 left-3 z-10 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
              {lightboxIndex + 1} / {sortedPhotos.length}
            </div>

            {/* Image container */}
            <div className="relative aspect-[4/3] sm:aspect-[16/10]">
              <Image
                src={sortedPhotos[lightboxIndex]?.url || '/images/placeholder-car.jpg'}
                alt={`${carName} - Photo ${lightboxIndex + 1}`}
                fill
                className="object-contain bg-gray-100 dark:bg-gray-800"
                priority
              />
            </div>

            {/* Navigation buttons */}
            {sortedPhotos.length > 1 && (
              <>
                <button
                  onClick={navigateLightboxPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/60 transition-colors"
                  aria-label="Previous photo"
                >
                  <IoChevronBackOutline className="w-6 h-6" />
                </button>
                <button
                  onClick={navigateLightboxNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/60 transition-colors"
                  aria-label="Next photo"
                >
                  <IoChevronForwardOutline className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Caption if exists */}
            {sortedPhotos[lightboxIndex]?.caption && (
              <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 text-sm text-center">
                  {sortedPhotos[lightboxIndex].caption}
                </p>
              </div>
            )}

            {/* Thumbnail strip at bottom */}
            <div className="p-3 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2 justify-center overflow-x-auto">
                {sortedPhotos.map((photo, index) => (
                  <button
                    key={`lightbox-thumb-${photo.uniqueId}-${index}`}
                    onClick={() => setLightboxIndex(index)}
                    className={`relative flex-shrink-0 w-14 h-10 rounded-md overflow-hidden border-2 transition-all ${
                      index === lightboxIndex
                        ? 'border-amber-500 scale-110'
                        : 'border-transparent hover:border-gray-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={photo.url || '/images/placeholder-car.jpg'}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
