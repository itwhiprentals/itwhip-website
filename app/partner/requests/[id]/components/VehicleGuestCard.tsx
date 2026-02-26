'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  IoCarOutline,
  IoStarOutline,
  IoMailOutline,
  IoCallOutline
} from 'react-icons/io5'

interface VehicleGuestCardProps {
  car?: {
    id: string
    year: number
    make: string
    model: string
    photos?: { url: string }[]
  }
  vehicleInfo?: string
  hasCarListed: boolean
  guestName?: string
  guestRating?: number
  guestTrips?: number
  guestEmail?: string
  guestPhone?: string
}

export default function VehicleGuestCard({
  car,
  vehicleInfo,
  hasCarListed,
  guestName,
  guestRating,
  guestTrips,
  guestEmail,
  guestPhone,
}: VehicleGuestCardProps) {
  const t = useTranslations('PartnerRequestDetail')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Vehicle Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-4">
          {car?.photos?.[0]?.url ? (
            <img
              src={car.photos[0].url}
              alt={`${car.year} ${car.make} ${car.model}`}
              className="w-32 h-24 object-cover rounded-lg"
            />
          ) : (
            <div className="w-32 h-24 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
              <IoCarOutline className="w-10 h-10 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {car
                  ? `${car.year} ${car.make} ${car.model}`
                  : vehicleInfo || t('vehicle')}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                hasCarListed
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
              }`}>
                {hasCarListed ? t('ready') : t('awaitingSetup')}
              </span>
            </div>
            {!hasCarListed && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {t('addPhotosAndRate')}
              </p>
            )}
            {hasCarListed && car && (
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/partner/fleet/${car.id}`}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  {t('viewVehicle')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guest Section */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {guestName?.charAt(0) || 'G'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {guestName || t('guest')}
              </h3>
              {guestRating && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <IoStarOutline className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{guestRating.toFixed(1)}</span>
                  {guestTrips && (
                    <span>({guestTrips} {t('trips')})</span>
                  )}
                </div>
              )}
              {hasCarListed ? (
                <div className="mt-2 space-y-1">
                  {guestEmail && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <IoMailOutline className="w-4 h-4" />
                      {guestEmail}
                    </div>
                  )}
                  {guestPhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <IoCallOutline className="w-4 h-4" />
                      {guestPhone}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {t('contactDetailsLocked')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
