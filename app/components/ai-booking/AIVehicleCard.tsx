'use client'

import Image from 'next/image'
import Link from 'next/link'
import { IoStar, IoLocationSharp, IoFlash } from 'react-icons/io5'
import type { VehicleSummary } from '@/app/lib/ai-booking/types'

interface AIVehicleCardProps {
  vehicle: VehicleSummary
  onSelect: (vehicle: VehicleSummary) => void
}

export default function AIVehicleCard({ vehicle, onSelect }: AIVehicleCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        {/* Photo */}
        <VehiclePhoto photo={vehicle.photo} make={vehicle.make} model={vehicle.model} />

        {/* Details */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <VehicleTitle year={vehicle.year} make={vehicle.make} model={vehicle.model} />
            <VehicleMeta
              rating={vehicle.rating}
              reviewCount={vehicle.reviewCount}
              distance={vehicle.distance}
              instantBook={vehicle.instantBook}
            />
          </div>

          <div className="flex items-center justify-between mt-2">
            <VehiclePrice dailyRate={vehicle.dailyRate} />
            <div className="flex items-center gap-1.5">
              <Link
                href={`/rentals/cars/${vehicle.id}`}
                target="_blank"
                className="px-2 py-1.5 text-primary text-xs font-medium hover:underline"
              >
                Details
              </Link>
              <button
                onClick={() => onSelect(vehicle)}
                className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary/90 transition-colors"
              >
                Select
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function VehiclePhoto({ photo, make, model }: { photo: string | null; make: string; model: string }) {
  return (
    <div className="w-28 h-24 sm:w-32 sm:h-28 flex-shrink-0 bg-gray-100 dark:bg-gray-700 relative">
      {photo && typeof photo === 'string' && photo.length > 0 ? (
        <Image
          src={photo}
          alt={`${make} ${model}`}
          fill
          className="object-cover"
          sizes="128px"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
          No photo
        </div>
      )}
    </div>
  )
}

function VehicleTitle({ year, make, model }: { year: number; make: string; model: string }) {
  return (
    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
      {year} {make} {model}
    </h4>
  )
}

function VehicleMeta({
  rating,
  reviewCount,
  distance,
  instantBook,
}: {
  rating: number | null
  reviewCount: number
  distance: string | null
  instantBook: boolean
}) {
  return (
    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
      {rating && (
        <span className="flex items-center gap-0.5">
          <IoStar size={10} className="text-yellow-500" />
          {rating.toFixed(1)}
          {reviewCount > 0 && <span>({reviewCount})</span>}
        </span>
      )}
      {distance && (
        <span className="flex items-center gap-0.5">
          <IoLocationSharp size={10} />
          {distance}
        </span>
      )}
      {instantBook && (
        <span className="flex items-center gap-0.5 text-primary">
          <IoFlash size={10} />
          Instant
        </span>
      )}
    </div>
  )
}

function VehiclePrice({ dailyRate }: { dailyRate: number }) {
  return (
    <div>
      <span className="text-base font-bold text-gray-900 dark:text-white">${dailyRate}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400">/day</span>
    </div>
  )
}
