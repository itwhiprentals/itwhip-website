// app/(guest)/rentals/components/details/PhotoGallery.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { 
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoExpandOutline,
  IoCloseOutline,
  IoGridOutline,
  IoCameraOutline
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
}

export default function PhotoGallery({ photos, carName }: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showThumbnails, setShowThumbnails] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({})
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const thumbnailsRef = useRef<HTMLDivElement>(null)

  // Sort photos by order and ensure unique keys
  const sortedPhotos = [...photos]
    .sort((a, b) => a.order - b.order)
    .map((photo, index) => ({
      ...photo,
      // Ensure unique ID by combining original ID with index if needed
      uniqueId: photo.id || `photo-${index}`,
      id: photo.id || `photo-${index}`
    }))

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isFullscreen) {
        if (e.key === 'ArrowLeft') navigatePrev()
        if (e.key === 'ArrowRight') navigateNext()
        if (e.key === 'Escape') setIsFullscreen(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isFullscreen, currentIndex, sortedPhotos.length])

  // Scroll thumbnail into view
  useEffect(() => {
    if (thumbnailsRef.current && showThumbnails) {
      const thumbnail = thumbnailsRef.current.children[currentIndex] as HTMLElement
      if (thumbnail) {
        thumbnail.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      }
    }
  }, [currentIndex, showThumbnails])

  const navigateNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sortedPhotos.length)
  }

  const navigatePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + sortedPhotos.length) % sortedPhotos.length)
  }

  const handleImageLoad = (photoId: string) => {
    setImageLoading(prev => ({ ...prev, [photoId]: false }))
  }

  const handleImageError = (photoId: string) => {
    setImageLoading(prev => ({ ...prev, [photoId]: false }))
  }

  // Touch handlers for swipe
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
      <div className="aspect-[4/3] lg:aspect-[2.35/1] bg-gray-100 dark:bg-gray-800 sm:rounded-xl flex items-center justify-center">
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
      {/* Main Gallery */}
      <div className="relative">
        {/* Main Image - 4:3 on mobile/tablet, 2.35:1 cinematic on desktop */}
        <div
          className="aspect-[4/3] lg:aspect-[2.35/1] relative bg-gray-100 dark:bg-gray-800 sm:rounded-xl overflow-hidden cursor-pointer"
          onClick={() => setIsFullscreen(true)}
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

          {/* Photo Counter - bottom left on desktop, hidden on mobile */}
          <div className="hidden sm:block absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
            {safeCurrentIndex + 1} / {sortedPhotos.length}
          </div>

          {/* Action Buttons - bottom right on desktop, hidden on mobile */}
          <div className="hidden sm:flex absolute bottom-4 right-4 gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowGrid(!showGrid)
              }}
              className="bg-black/50 backdrop-blur-sm text-white p-2.5 rounded-full hover:bg-black/60 transition-colors"
              aria-label="Grid view"
            >
              <IoGridOutline className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsFullscreen(true)
              }}
              className="bg-black/50 backdrop-blur-sm text-white p-2.5 rounded-full hover:bg-black/60 transition-colors"
              aria-label="Fullscreen"
            >
              <IoExpandOutline className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Thumbnail Strip */}
        {sortedPhotos.length > 1 && !showGrid && (
          <div className="mt-2 sm:mt-4">
            <div className="flex justify-center items-center mb-2">
              <button
                onClick={() => setShowThumbnails(!showThumbnails)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-4 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {showThumbnails ? 'Hide' : 'View'} thumbnails
              </button>
            </div>
            
            {showThumbnails && (
              <div 
                ref={thumbnailsRef}
                className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
              >
                {sortedPhotos.map((photo, index) => (
                  <button
                    key={`thumb-${photo.uniqueId}-${index}`}
                    onClick={() => setCurrentIndex(index)}
                    className={`relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === safeCurrentIndex 
                        ? 'border-amber-600 scale-105' 
                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Image
                      src={photo.url || '/images/placeholder-car.jpg'}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Grid View */}
        {showGrid && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {sortedPhotos.map((photo, index) => (
              <button
                key={`grid-${photo.uniqueId}-${index}`}
                onClick={() => {
                  setCurrentIndex(index)
                  setShowGrid(false)
                }}
                className="relative aspect-[4/3] rounded-lg overflow-hidden hover:ring-2 hover:ring-amber-600 transition-all"
              >
                <Image
                  src={photo.url || '/images/placeholder-car.jpg'}
                  alt={`Grid photo ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="relative h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 z-10 bg-white/10 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <IoCloseOutline className="w-6 h-6" />
            </button>

            {/* Photo Counter */}
            <div className="absolute top-4 left-4 z-10 bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full">
              {safeCurrentIndex + 1} / {sortedPhotos.length}
            </div>

            {/* Fullscreen Image */}
            <div 
              className="relative w-full h-full"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {sortedPhotos.map((photo, index) => (
                <div
                  key={`fullscreen-${photo.uniqueId}-${index}`}
                  className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                    index === safeCurrentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <Image
                    src={photo.url || '/images/placeholder-car.jpg'}
                    alt={`${carName} - Fullscreen ${index + 1}`}
                    fill
                    className="object-contain"
                    priority={index === safeCurrentIndex}
                  />
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                      <p className="text-white text-lg text-center">{photo.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Fullscreen Navigation */}
            {sortedPhotos.length > 1 && (
              <>
                <button
                  onClick={navigatePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Previous photo"
                >
                  <IoChevronBackOutline className="w-8 h-8" />
                </button>
                <button
                  onClick={navigateNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Next photo"
                >
                  <IoChevronForwardOutline className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Fullscreen Thumbnails */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex gap-2 justify-center overflow-x-auto max-w-full">
                {sortedPhotos.map((photo, index) => (
                  <button
                    key={`fullscreen-thumb-${photo.uniqueId}-${index}`}
                    onClick={() => setCurrentIndex(index)}
                    className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      index === safeCurrentIndex 
                        ? 'border-white scale-110' 
                        : 'border-white/30 hover:border-white/60 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={photo.url || '/images/placeholder-car.jpg'}
                      alt={`Fullscreen thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
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