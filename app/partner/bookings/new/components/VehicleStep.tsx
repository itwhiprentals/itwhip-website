// app/partner/bookings/new/components/VehicleStep.tsx

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  IoCarOutline,
  IoCheckmarkCircleOutline,
  IoChevronForwardOutline,
} from 'react-icons/io5'
import { Vehicle } from '../types'

interface VehicleStepProps {
  vehicles: Vehicle[]
  selectedVehicle: Vehicle | null
  onSelectVehicle: (vehicle: Vehicle) => void
  onBack: () => void
  onNext: () => void
  formatCurrency: (amount: number) => string
}

export default function VehicleStep({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  onBack,
  onNext,
  formatCurrency,
}: VehicleStepProps) {
  const t = useTranslations('PartnerBookingNew')
  const [vehicleFilter, setVehicleFilter] = useState<'all' | 'rideshare' | 'rental'>('all')

  const filteredVehicles = vehicles.filter(v => {
    if (vehicleFilter === 'all') return true
    if (vehicleFilter === 'rideshare') return v.vehicleType === 'RIDESHARE'
    if (vehicleFilter === 'rental') return v.vehicleType === 'RENTAL'
    return true
  })

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'rideshare', 'rental'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setVehicleFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              vehicleFilter === f
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {f === 'all' ? t('filterAll') : f === 'rideshare' ? t('filterRideshare') : t('filterRental')}
          </button>
        ))}
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredVehicles.map((vehicle) => (
          <button
            key={vehicle.id}
            onClick={() => onSelectVehicle(vehicle)}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              selectedVehicle?.id === vehicle.id
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-md ring-1 ring-orange-200 dark:ring-orange-800'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md'
            }`}
          >
            <div className="flex gap-3 items-start">
              <div className="w-28 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                {vehicle.photo ? (
                  <img src={vehicle.photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <IoCarOutline className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate">
                      {vehicle.year} {vehicle.make}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {vehicle.model}{vehicle.trim ? ` ${vehicle.trim}` : ''}
                    </p>
                  </div>
                  {selectedVehicle?.id === vehicle.id && (
                    <IoCheckmarkCircleOutline className="w-6 h-6 text-orange-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-orange-600 dark:text-orange-400 font-semibold mt-1.5">
                  {formatCurrency(vehicle.dailyRate)}/{t('day')}
                  {vehicle.vehicleType === 'RIDESHARE' && vehicle.weeklyRate && (
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500"> • {formatCurrency(vehicle.weeklyRate)}/{t('week')}</span>
                  )}
                </p>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    vehicle.vehicleType === 'RIDESHARE'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                  }`}>
                    {vehicle.vehicleType}
                  </span>
                  {vehicle.status === 'inactive' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
                      {t('statusUnlisted')}
                    </span>
                  )}
                  {vehicle.status === 'booked' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                      {t('statusBooked')}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {t('minDays', { count: vehicle.minTripDuration })}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {t('noVehiclesFound')}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
        >
          {t('back')}
        </button>
        <button
          onClick={onNext}
          disabled={!selectedVehicle}
          className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
        >
          {t('continueToDates')}
          <IoChevronForwardOutline className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
