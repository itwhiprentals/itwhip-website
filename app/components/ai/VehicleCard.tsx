'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { IoStar, IoLocationSharp, IoFlash, IoChevronDown, IoChevronUp, IoCarSportOutline } from 'react-icons/io5'
import type { VehicleSummary } from '@/app/lib/ai-booking/types'

// Platform fee constants (from app/(guest)/rentals/lib/constants.ts)
const SERVICE_FEE_RATE = 0.15 // 15% guest service fee
const TAX_RATE = 0.084 // 8.4% Arizona rental tax (Phoenix default)

interface VehicleCardProps {
  vehicle: VehicleSummary
  onSelect: (vehicle: VehicleSummary) => void
  /** Start date for pricing calculation (ISO string) */
  startDate?: string | null
  /** End date for pricing calculation (ISO string) */
  endDate?: string | null
}

export default function VehicleCard({ vehicle, onSelect, startDate, endDate }: VehicleCardProps) {
  const [expanded, setExpanded] = useState(false)

  // Use photos array if available, fallback to single photo
  const photos = vehicle.photos?.length > 0
    ? vehicle.photos
    : vehicle.photo
      ? [vehicle.photo]
      : []

  const mainPhoto = photos[0] || null
  // Get ALL additional photos (excluding main)
  const additionalPhotos = photos.slice(1)
  const hasPhotos = additionalPhotos.length > 0

  // Calculate number of days (default to 1 if no dates)
  const numberOfDays = calculateDays(startDate, endDate)

  // Calculate pricing using actual deposit from vehicle data
  const pricing = calculatePricing(vehicle.dailyRate, numberOfDays, vehicle.depositAmount)

  const toggleExpand = () => {
    setExpanded(!expanded)
  }

  // Dynamic grid columns based on photo count
  const getGridCols = (count: number) => {
    if (count <= 3) return 'grid-cols-3'
    if (count <= 4) return 'grid-cols-4'
    if (count <= 6) return 'grid-cols-3 sm:grid-cols-6'
    return 'grid-cols-3 sm:grid-cols-6' // 6+ photos: show in rows
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[8px] overflow-hidden hover:shadow-md transition-shadow">
      {/* Main card row - clickable to expand */}
      <div
        onClick={toggleExpand}
        className="flex cursor-pointer"
      >
        {/* Main Photo - wide rectangle */}
        <div className="w-32 sm:w-36 aspect-[3/2] flex-shrink-0 bg-gray-100 dark:bg-gray-700 relative">
          {mainPhoto ? (
            <Image
              src={mainPhoto}
              alt={`${vehicle.make} ${vehicle.model}`}
              fill
              className="object-cover"
              sizes="144px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No photo
            </div>
          )}
          {/* Photo count badge */}
          {photos.length > 1 && (
            <div className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
              {expanded ? <IoChevronUp size={10} /> : <IoChevronDown size={10} />}
              <span>{photos.length}</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 px-2 py-1.5 flex flex-col justify-between">
          {/* Top row: Year Make + Badge */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <h4 className="text-[13px] font-semibold text-gray-900 dark:text-white">
                  {vehicle.year} {vehicle.make}
                </h4>
                {vehicle.rating && (
                  <span className="flex items-center gap-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                    <IoStar size={9} className="text-yellow-500" />
                    {vehicle.rating.toFixed(1)}
                  </span>
                )}
              </div>
              {/* Badge priority: Rideshare > No Deposit > Instant */}
              {vehicle.vehicleType?.toUpperCase() === 'RIDESHARE' ? (
                <span className="flex items-center gap-0.5 text-[9px] font-bold text-white bg-orange-500 px-1.5 py-0.5 rounded">
                  <IoCarSportOutline size={9} />
                  Rideshare
                </span>
              ) : vehicle.depositAmount === 0 ? (
                <span className="text-[9px] font-bold text-white bg-blue-500 px-1.5 py-0.5 rounded">
                  No Deposit
                </span>
              ) : vehicle.instantBook && (
                <span className="flex items-center gap-0.5 text-[9px] font-bold text-white bg-emerald-500 px-1.5 py-0.5 rounded">
                  <IoFlash size={9} />
                  Instant
                </span>
              )}
            </div>
            {/* Model + Trips on second line */}
            <p className="text-[11px] text-gray-600 dark:text-gray-300 truncate">
              {vehicle.model} · {vehicle.trips > 0 ? `(Trips ${vehicle.trips})` : '(New)'}
            </p>

            {/* Location, distance */}
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 dark:text-gray-400 flex-wrap">
              {vehicle.location && (
                <span className="text-gray-600 dark:text-gray-300">
                  {vehicle.location.includes(',') ? vehicle.location : `${vehicle.location}, AZ`}
                </span>
              )}
              {vehicle.distance && (
                <span className="flex items-center gap-0.5">
                  <IoLocationSharp size={9} />
                  {vehicle.distance}
                </span>
              )}
            </div>
          </div>

          {/* Bottom row: Price + Button */}
          <div className="flex items-center justify-between w-full">
            <div>
              <span className="text-[15px] font-bold text-gray-900 dark:text-white">${vehicle.dailyRate}</span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">/day</span>
            </div>
            {/* Select to Book button - card click expands */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSelect(vehicle)
              }}
              className="px-2.5 py-1 bg-primary text-white text-[10px] font-semibold rounded hover:bg-primary/90 transition-colors"
            >
              Select to Book
            </button>
          </div>
        </div>
      </div>

      {/* Expanded section - photos + pricing details */}
      {expanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {/* Photo grid - show ALL available photos */}
          {hasPhotos && (
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <div className={`grid ${getGridCols(additionalPhotos.length)} gap-1.5`}>
                {additionalPhotos.map((photo, i) => (
                  <div key={i} className="aspect-[4/3] relative rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <Image
                      src={photo}
                      alt={`${vehicle.make} ${vehicle.model} - photo ${i + 2}`}
                      fill
                      className="object-cover"
                      sizes="(min-width: 640px) 80px, 100px"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing breakdown */}
          <div className="p-3">
            <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Estimated Pricing ({numberOfDays} {numberOfDays === 1 ? 'day' : 'days'})
            </h5>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>${vehicle.dailyRate} × {numberOfDays} {numberOfDays === 1 ? 'day' : 'days'}</span>
                <span>${pricing.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Service fee ({(SERVICE_FEE_RATE * 100).toFixed(0)}%)</span>
                <span>${pricing.serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Taxes ({(TAX_RATE * 100).toFixed(1)}%)</span>
                <span>${pricing.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Security deposit (refundable)</span>
                <span>${pricing.deposit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 dark:text-white pt-1.5 border-t border-gray-200 dark:border-gray-700">
                <span>Total at checkout</span>
                <span>${pricing.total.toFixed(2)}</span>
              </div>
            </div>

            {/* View All link */}
            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <Link
                href={`/rentals/${vehicle.id}`}
                target="_blank"
                className="text-xs text-primary font-medium hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                View Full Listing →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Calculate number of days between dates
 */
function calculateDays(startDate?: string | null, endDate?: string | null): number {
  if (!startDate || !endDate) return 1

  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = end.getTime() - start.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(diffDays, 1)
}

/**
 * Calculate pricing breakdown using platform constants and actual deposit
 */
function calculatePricing(dailyRate: number, days: number, depositAmount: number) {
  const subtotal = dailyRate * days
  const serviceFee = subtotal * SERVICE_FEE_RATE
  const tax = subtotal * TAX_RATE
  const total = subtotal + serviceFee + tax + depositAmount

  return {
    subtotal,
    serviceFee,
    tax,
    deposit: depositAmount,
    total
  }
}
