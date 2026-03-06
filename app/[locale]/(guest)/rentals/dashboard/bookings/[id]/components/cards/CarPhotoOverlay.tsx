// Car photo with info overlay — shared across all status cards
// Horizontally scrollable carousel when multiple photos exist

'use client'

import React, { useRef, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { getVehicleClass, formatFuelTypeBadge } from '@/app/lib/utils/vehicleClassification'

interface CarPhotoOverlayProps {
  car: {
    make: string
    model: string
    year: number
    type: string
    transmission: string
    seats: number
    photos: Array<{ url: string }>
  }
}

export const CarPhotoOverlay: React.FC<CarPhotoOverlayProps> = ({ car }) => {
  const t = useTranslations('BookingDetail')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollLeft, clientWidth } = scrollRef.current
    const index = Math.round(scrollLeft / clientWidth)
    setActiveIndex(index)
  }, [])

  if (!car.photos || car.photos.length === 0) return null

  const vehicleClass = getVehicleClass(car.make, car.model, (car.type || null) as any)
  const fuelBadge = formatFuelTypeBadge((car as any).fuelType || null)
  const hasMultiple = car.photos.length > 1

  return (
    <div className="relative">
      {/* Scrollable photo strip */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`flex ${hasMultiple ? 'overflow-x-auto snap-x snap-mandatory scrollbar-hide' : ''}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {car.photos.map((photo, i) => (
          <img
            key={i}
            src={photo.url}
            alt={`${car.make} ${car.model} ${i + 1}`}
            className="w-full h-60 sm:h-72 object-cover object-center flex-shrink-0 snap-center"
          />
        ))}
      </div>

      {/* Dot indicators */}
      {hasMultiple && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {car.photos.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === activeIndex
                  ? 'bg-white w-4'
                  : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
        <h3 className="text-white text-lg font-bold drop-shadow-lg">
          {car.year} {car.make}
        </h3>
        <p className="text-white/90 text-sm font-medium drop-shadow-lg">
          {car.model}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {vehicleClass && (
            <Badge label={vehicleClass} />
          )}
          {fuelBadge && (
            <Badge label={fuelBadge} />
          )}
          {car.transmission && (
            <Badge label={car.transmission.toLowerCase()} capitalize />
          )}
          {car.seats > 0 && (
            <Badge label={t('seats', { count: car.seats })} />
          )}
        </div>
      </div>
    </div>
  )
}

function Badge({ label, capitalize }: { label: string; capitalize?: boolean }) {
  return (
    <span
      className={`text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/20 text-white backdrop-blur-sm ${
        capitalize ? 'capitalize' : ''
      }`}
    >
      {label}
    </span>
  )
}
