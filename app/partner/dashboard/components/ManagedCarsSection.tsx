// app/partner/dashboard/components/ManagedCarsSection.tsx
// Displays cars managed by the Fleet Manager

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  IoCarOutline,
  IoPersonOutline,
  IoWalletOutline,
  IoCalendarOutline,
  IoAddCircleOutline,
  IoChevronForwardOutline,
  IoRefreshOutline,
  IoCheckmarkCircleOutline,
  IoPauseCircleOutline,
  IoTimeOutline
} from 'react-icons/io5'
import { ManagedVehicleSummary } from '@/app/types/fleet-management'
import { useTranslations, useLocale } from 'next-intl'

interface ManagedCarsSectionProps {
  limit?: number
  showViewAll?: boolean
}

export default function ManagedCarsSection({
  limit = 6,
  showViewAll = true
}: ManagedCarsSectionProps) {
  const [vehicles, setVehicles] = useState<ManagedVehicleSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations('PartnerDashboard')

  const locale = useLocale()

  const fetchManagedVehicles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Use the account-type API to get managed vehicle count, then fetch details
      const response = await fetch('/api/host/account-type', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch account info')
      }

      // For now, we'll fetch from partner dashboard which includes vehicles
      const dashboardResponse = await fetch('/api/partner/dashboard', {
        credentials: 'include'
      })

      if (!dashboardResponse.ok) {
        // If partner dashboard fails, show empty state (user may not have vehicles yet)
        setVehicles([])
        return
      }

      const dashboardData = await dashboardResponse.json()

      if (dashboardData.success && dashboardData.vehicles) {
        // Transform to ManagedVehicleSummary format
        const managedVehicles: ManagedVehicleSummary[] = dashboardData.vehicles.slice(0, limit).map((v: any) => ({
          vehicleId: v.id,
          vehicleName: `${v.year} ${v.make} ${v.model}`,
          vehiclePhoto: v.photo || undefined,
          ownerName: t('mcSelfOwned'), // Will be updated when VehicleManagement is integrated
          ownerId: '',
          status: v.status === 'available' ? 'ACTIVE' : v.status === 'booked' ? 'ACTIVE' : 'PAUSED',
          ownerCommissionPercent: 70,
          managerCommissionPercent: 30,
          totalEarningsThisMonth: 0,
          managerEarningsThisMonth: 0,
          activeBookings: v.status === 'booked' ? 1 : 0,
          totalTrips: v.totalTrips || 0
        }))

        setVehicles(managedVehicles)
      }
    } catch (err) {
      console.error('Error fetching managed vehicles:', err)
      setError(t('mcFailedToLoad'))
    } finally {
      setLoading(false)
    }
  }, [limit, t])

  useEffect(() => {
    fetchManagedVehicles()
  }, [fetchManagedVehicles])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 rounded text-xs font-medium">
            <IoCheckmarkCircleOutline className="w-3 h-3" />
            {t('mcActive')}
          </span>
        )
      case 'PAUSED':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400 rounded text-xs font-medium">
            <IoPauseCircleOutline className="w-3 h-3" />
            {t('mcPaused')}
          </span>
        )
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 rounded text-xs font-medium">
            <IoTimeOutline className="w-3 h-3" />
            {t('mcPending')}
          </span>
        )
      default:
        return (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400 rounded text-xs font-medium">
            {status}
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="h-32 bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-2">{error}</p>
          <button
            onClick={fetchManagedVehicles}
            className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1 mx-auto"
          >
            <IoRefreshOutline className="w-4 h-4" />
            {t('mcRetry')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <IoCarOutline className="w-5 h-5 text-purple-600" />
          {t('mcManagedVehicles')}
        </h2>
        {vehicles.length > 0 && (
          <button
            onClick={fetchManagedVehicles}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title={t('mcRefresh')}
          >
            <IoRefreshOutline className="w-5 h-5" />
          </button>
        )}
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <IoCarOutline className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('mcNoVehicles')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            {t('mcNoVehiclesDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/host/fleet/invite-owner"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
            >
              <IoAddCircleOutline className="w-5 h-5" />
              {t('mcInviteOwners')}
            </Link>
            <Link
              href="/host/cars/add"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              {t('mcAddOwnVehicle')}
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((vehicle) => (
              <Link
                key={vehicle.vehicleId}
                href={`/host/cars/${vehicle.vehicleId}`}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all"
              >
                {/* Vehicle Image */}
                <div className="relative h-32 bg-gray-200 dark:bg-gray-700">
                  {vehicle.vehiclePhoto ? (
                    <Image
                      src={vehicle.vehiclePhoto}
                      alt={vehicle.vehicleName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <IoCarOutline className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(vehicle.status)}
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {vehicle.vehicleName}
                  </h3>

                  {/* Owner Info */}
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <IoPersonOutline className="w-4 h-4" />
                    <span className="truncate">{vehicle.ownerName}</span>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-1 text-sm">
                      <IoWalletOutline className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {formatCurrency(vehicle.managerEarningsThisMonth)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <IoCalendarOutline className="w-4 h-4" />
                      <span>{t('mcTrips', { count: vehicle.totalTrips })}</span>
                    </div>
                  </div>

                  {/* Commission Split */}
                  <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                    {t('mcYourShare', { percent: vehicle.managerCommissionPercent })}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* View All Link */}
          {showViewAll && vehicles.length >= limit && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/partner/fleet"
                className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center justify-center gap-1"
              >
                {t('mcViewAll')}
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
