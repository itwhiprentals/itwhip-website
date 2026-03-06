'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  IoCarOutline,
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
} from 'react-icons/io5'
import { formatPhoneNumber } from '@/app/utils/helpers'
import { GuestInfoCard } from '@/app/partner/components/GuestInfoCard'

interface VehicleGuestCardProps {
  car?: {
    id: string
    year: number
    make: string
    model: string
    trim?: string
    licensePlate?: string | null
    dailyRate?: number
    vehicleType?: string
    isActive?: boolean
    color?: string | null
    photos?: { url: string }[]
  }
  vehicleInfo?: string
  hasCarListed: boolean
  isCarAssigned?: boolean
  guestName?: string
  guestEmail?: string
  guestPhone?: string
  renter?: {
    id: string
    name: string
    email: string
    phone: string | null
    photo: string | null
    memberSince: string | null
  } | null
  isVerified?: boolean
  guestInsurance?: { provided: boolean } | null
  bookingId?: string | null
  bookingStatus?: string | null
  guestHistory?: { totalBookings: number; totalSpent: number } | null
  formatCurrency?: (amount: number) => string
}

export default function VehicleGuestCard({
  car,
  vehicleInfo,
  hasCarListed,
  isCarAssigned,
  guestName,
  guestEmail,
  guestPhone,
  renter,
  isVerified,
  guestInsurance,
  bookingId,
  bookingStatus,
  guestHistory,
  formatCurrency,
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
              alt={`${car.year} ${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ''}`}
              className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
            />
          ) : (
            <div className="w-32 h-24 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <IoCarOutline className="w-10 h-10 text-gray-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {car ? (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {car.year} {car.make}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {car.model}{car.trim ? ` ${car.trim}` : ''}{car.color ? <span className="text-sm font-normal text-gray-500 dark:text-gray-400"> ({car.color})</span> : ''}
                    </h3>
                  </div>
                  {!car.isActive ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase border border-red-300 dark:border-red-600 text-red-500 dark:text-red-400 flex-shrink-0">
                      INACTIVE
                    </span>
                  ) : (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase flex-shrink-0 ${
                      car.vehicleType === 'RIDESHARE'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                    }`}>
                      {car.vehicleType === 'RIDESHARE' ? 'RIDESHARE' : 'RENTAL'}
                    </span>
                  )}
                </div>
                {car.licensePlate && (
                  <p className="text-sm font-mono text-gray-600 dark:text-gray-400 mt-0.5">
                    {car.licensePlate}
                  </p>
                )}
                <div className="flex items-center justify-between mt-1">
                  {car.dailyRate != null && formatCurrency ? (
                    <span className="text-orange-600 dark:text-orange-400 font-semibold text-sm">
                      {formatCurrency(car.dailyRate)}/{t('day')}
                    </span>
                  ) : (
                    <span />
                  )}
                  <Link
                    href={`/partner/fleet/${car.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    {t('viewVehicle')}
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {vehicleInfo || t('vehicle')}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('addPhotosAndRate')}
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded font-medium text-white uppercase bg-red-600 flex-shrink-0">
                  {t('awaitingSetup')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guest Section */}
      {renter ? (
        <GuestInfoCard renter={renter} isVerified={isVerified} guestInsurance={guestInsurance} bookingId={bookingId} bookingStatus={bookingStatus} guestHistory={guestHistory} formatCurrency={formatCurrency} />
      ) : (
        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gray-200 dark:bg-gray-600 rounded-full border border-white shadow-sm flex items-center justify-center">
              <IoPersonOutline className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {guestName || t('guest')}
              </h3>
              {(hasCarListed || isCarAssigned) ? (
                <>
                  {guestEmail && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <IoMailOutline className="w-4 h-4" />
                      {guestEmail}
                    </div>
                  )}
                  {guestPhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <IoCallOutline className="w-4 h-4" />
                      +1 {formatPhoneNumber(guestPhone)}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {t('contactDetailsLocked')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
