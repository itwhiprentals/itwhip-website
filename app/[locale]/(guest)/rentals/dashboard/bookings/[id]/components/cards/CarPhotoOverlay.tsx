// Car photo with info overlay — shared across all status cards

import React from 'react'
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

  if (!car.photos || car.photos.length === 0) return null

  const vehicleClass = getVehicleClass(car.make, car.model, (car.type || null) as any)
  const fuelBadge = formatFuelTypeBadge((car as any).fuelType || null)

  return (
    <div className="relative">
      <img
        src={car.photos[0].url}
        alt={`${car.make} ${car.model}`}
        className="w-full h-60 sm:h-72 object-cover object-[center_35%]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="absolute bottom-3 left-3 right-3">
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
