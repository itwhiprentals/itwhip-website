// app/partner/dashboard/components/FleetOverview.tsx
// Fleet Overview Component - Shows vehicle status distribution

'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { IoCarOutline, IoCheckmarkCircleOutline, IoTimeOutline, IoConstructOutline } from 'react-icons/io5'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  status: 'available' | 'booked' | 'maintenance'
  photo?: string
  dailyRate: number
  totalTrips: number
}

interface FleetOverviewProps {
  vehicles: Vehicle[]
}

export default function FleetOverview({ vehicles }: FleetOverviewProps) {
  const t = useTranslations('PartnerDashboard')
  const available = vehicles.filter(v => v.status === 'available').length
  const booked = vehicles.filter(v => v.status === 'booked').length
  const maintenance = vehicles.filter(v => v.status === 'maintenance').length
  const total = vehicles.length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
      case 'booked': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30'
      case 'maintenance': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return IoCheckmarkCircleOutline
      case 'booked': return IoTimeOutline
      case 'maintenance': return IoConstructOutline
      default: return IoCarOutline
    }
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-8">
        <IoCarOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 mb-4">{t('foNoVehicles')}</p>
        <Link
          href="/partner/fleet/add"
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {t('foAddFirstVehicle')}
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Status Distribution */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <IoCheckmarkCircleOutline className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{available}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{t('foAvailable')}</p>
        </div>
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <IoTimeOutline className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{booked}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{t('foBooked')}</p>
        </div>
        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <IoConstructOutline className="w-6 h-6 text-orange-600 dark:text-orange-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{maintenance}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{t('foMaintenance')}</p>
        </div>
      </div>

      {/* Utilization Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">{t('foFleetUtilization')}</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {total > 0 ? Math.round((booked / total) * 100) : 0}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${total > 0 ? (booked / total) * 100 : 0}%` }}
          />
          <div
            className="h-full bg-orange-500 transition-all"
            style={{ width: `${total > 0 ? (maintenance / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Vehicle List */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {vehicles.slice(0, 5).map((vehicle) => {
          const StatusIcon = getStatusIcon(vehicle.status)
          return (
            <Link
              key={vehicle.id}
              href={`/partner/fleet/${vehicle.id}`}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                  {vehicle.photo ? (
                    <img src={vehicle.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <IoCarOutline className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {vehicle.year} {vehicle.make}
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {vehicle.model}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('foPerDayTrips', { rate: vehicle.dailyRate, trips: vehicle.totalTrips })}
                  </p>
                </div>
              </div>
              <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                <StatusIcon className="w-3 h-3" />
                {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
              </span>
            </Link>
          )
        })}
      </div>

      {vehicles.length > 5 && (
        <Link
          href="/partner/fleet"
          className="block text-center mt-4 text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400"
        >
          {t('foViewAllVehicles', { count: vehicles.length })}
        </Link>
      )}
    </div>
  )
}
